import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Check, ClipboardList, Download, FileText, Image as ImageIcon, Link2, RefreshCw, Trash2, Undo2, Wrench } from "lucide-react";
import { useStore, staffName } from "../store";
import { FACE_COUNT_LABEL, STAFF } from "../data/seed";
import { fakeApi } from "../lib/fakeApi";
import { fmtDate, fmtDateTime, todayISO, yen } from "../lib/format";
import { installOverdue, liveCancels, pendingCancel, phaseOf } from "../lib/report";
import { Button, Card, CardHeader, Confirm, EmptyState, Field, Modal, Pill, errCls, inputCls } from "../components/ui";
import { PhasePill } from "../components/pills";
import { QTag, SourceTag } from "../components/tags";
import { ScanPicker } from "../components/OrderModal";

function Row({ label, src, children }: { label: string; src: "link" | "input"; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,130px)_1fr] items-start gap-3 border-b border-ink-100 py-2.5 last:border-0 sm:grid-cols-[150px_1fr_auto]">
      <span className="text-[13.5px] text-ink-500">{label}</span>
      <span className="min-w-0 text-[15px] text-ink-900">{children}</span>
      <span className="hidden sm:block">
        <SourceTag kind={src} compact />
      </span>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const order = useStore((s) => s.orders.find((o) => o.id === id));
  const customer = useStore((s) => s.customers.find((c) => c.id === order?.customerId));
  const syncOrder = useStore((s) => s.syncOrder);
  const installOrder = useStore((s) => s.installOrder);
  const planCancel = useStore((s) => s.planCancel);
  const withdrawCancel = useStore((s) => s.withdrawCancel);
  const confirmCancel = useStore((s) => s.confirmCancel);
  const addAttachments = useStore((s) => s.addAttachments);
  const removeAttachment = useStore((s) => s.removeAttachment);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [withdrawId, setWithdrawId] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [tax, setTax] = useState(false);
  const [busy, setBusy] = useState("");

  if (!order || !customer)
    return (
      <Card>
        <EmptyState
          icon={<ClipboardList size={20} />}
          title="案件が見つかりません"
          action={
            <Link to="/orders">
              <Button>一覧へ戻る</Button>
            </Link>
          }
        />
      </Card>
    );

  const ph = phaseOf(order);
  const pc = pendingCancel(order);
  const cancels = order.cancels;
  const cutDone = liveCancels(order).filter((c) => c.actualDate && c.actualDate <= todayISO()).reduce((s, c) => s + c.fee, 0);
  const curFee = order.adFee === null ? null : Math.max(0, order.adFee - cutDone);
  const ratio = order.adFee && order.landRent !== null ? order.landRent / (order.adFee * 12) : null;
  const m = (v: number | null, unit = "") =>
    v === null ? (
      <span className="text-warn-700">未入力</span>
    ) : (
      <span className="tnum">
        {yen(v)}
        {unit}
        {tax && <span className="ml-2 text-[12.5px] text-ink-500">(税込 {yen(Math.floor(v * 1.1))})</span>}
      </span>
    );
  const rep = STAFF.find((s) => s.id === order.repId);
  const run = async (key: string, fn: () => void, msg: string, desc?: string) => {
    setBusy(key);
    await fakeApi(null, 700);
    fn();
    setBusy("");
    toast.success(msg, { description: desc });
  };

  const steps = [
    { label: "受注", date: order.orderDate, done: true },
    { label: "設置", date: order.actualInstallDate ?? order.plannedInstallDate, done: !!order.actualInstallDate, plan: !order.actualInstallDate },
    {
      label: "解約",
      date: ph === "解約済" ? liveCancels(order).find((c) => !c.partial && c.actualDate)?.actualDate ?? null : pc?.plannedDate ?? null,
      done: ph === "解約済",
      plan: !!pc,
    },
  ];

  return (
    <>
      <Link to="/orders" className="mb-4 inline-flex items-center gap-1.5 text-[14px] text-ink-500 transition hover:text-navy-900">
        <ArrowLeft size={14} />
        受注・設置・解約の一覧
      </Link>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <Link to={`/customers?id=${customer.id}`} className="text-[15px] text-navy-600 underline-offset-2 hover:underline">
            {customer.company}
          </Link>
          <h1 className="mt-1 font-serif text-[26px] font-semibold tracking-wide text-navy-900">
            {order.title}
            <span className="ml-2 text-[17px] font-normal text-ink-500">{order.boardName}</span>
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[14px] text-ink-500">
            {ph && <PhasePill phase={ph} />}
            {pc && ph === "設置済" && <Pill tone="bad">{pc.partial ? "一部解約予定" : "解約予定"}</Pill>}
            {!order.kikakuNo && <Pill tone="warn">企画と連携待ち</Pill>}
            {order.legacy && <Pill tone="gray">新システム導入前からの契約</Pill>}
            <span>
              担当 {staffName(order.repId)}({rep?.branch})
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {ph === "設置済" && (
            <Button variant="outline" onClick={() => setCancelOpen(true)}>
              解約予定を登録
            </Button>
          )}
          {order.dealId && (
            <Link to={`/deals/${order.dealId}`}>
              <Button variant="ghost">見込みの記録を見る</Button>
            </Link>
          )}
        </div>
      </div>

      {/* 連携の状態(デモでは手動で取り込みを再現) */}
      {(!order.kikakuNo || (!order.actualInstallDate && ph === "受注済・未設置")) && (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-warn-300 bg-warn-50 px-5 py-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1 text-[15px] leading-relaxed text-ink-900">
            {!order.kikakuNo ? (
              <>
                <span className="font-semibold">工事指示システムの企画と、まだ紐づいていません。</span>
                企画が登録されると、企画番号・受注日・金額が自動で入ります。
              </>
            ) : (
              <>
                <span className="font-semibold">設置の完了待ちです。</span>
                製造部が施工完了を登録すると、設置日が自動で入り「設置済」になります。
                {installOverdue(order) && <span className="ml-1 font-medium text-bad-600">設置予定日を過ぎています。</span>}
              </>
            )}
            <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink-500">
              このデモでは、右のボタンで連携の結果を再現できます。 <QTag id="Q06" />
            </div>
          </div>
          {!order.kikakuNo ? (
            <Button loading={busy === "sync"} onClick={() => run("sync", () => syncOrder(order.id), "工事指示システムから企画を取り込みました", "企画番号が紐づきました")}>
              <RefreshCw size={14} />
              企画を取り込む(デモ)
            </Button>
          ) : (
            <Button
              loading={busy === "install"}
              onClick={() => run("install", () => installOrder(order.id, todayISO()), "施工完了を取り込みました", "設置日に本日が入り「設置済」になりました。今月の設置実績に加算されます。")}
            >
              <Wrench size={14} />
              施工完了を取り込む(デモ)
            </Button>
          )}
        </div>
      )}

      {/* 流れ */}
      <Card className="mb-6 px-5 py-4">
        <div className="mb-3 flex items-center gap-1.5 text-[14px] font-semibold text-navy-900">
          見込み → 受注 → 設置 → 解約 <span className="text-[12.5px] font-normal text-ink-500">(1つの案件として引き継ぎ)</span>
        </div>
        <ol className="grid grid-cols-3 gap-2">
          {steps.map((s) => (
            <li key={s.label} className={"rounded-md border px-3 py-2.5 " + (s.done ? "border-navy-200 bg-navy-50" : s.plan && s.date ? "border-dashed border-navy-300" : "border-ink-200")}>
              <div className="flex items-center gap-1.5 text-[14px] font-semibold text-navy-900">
                {s.done ? <Check size={14} /> : <span className="h-3.5 w-3.5 rounded-full border border-ink-300" />}
                {s.label}
              </div>
              <div className="tnum mt-1 text-[13px] text-ink-600">
                {s.date ? (s.done ? fmtDate(s.date) : `予定 ${fmtDate(s.date)}`) : "—"}
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="受注の情報"
              right={
                <span className="flex flex-wrap items-center gap-2 text-[12px] text-ink-500">
                  <SourceTag kind="link" />
                  <SourceTag kind="input" />
                </span>
              }
            />
            <div className="px-5 py-2">
              <Row label="企画番号" src="link">
                {order.kikakuNo ? <span className="tnum">{order.kikakuNo}</span> : <Pill tone="warn">連携待ち</Pill>}
              </Row>
              <Row label="受注日(成約日)" src="link">
                <span className="tnum">{fmtDate(order.orderDate)}</span>
              </Row>
              <Row label="設置予定日" src="input">
                <span className="tnum">{order.plannedInstallDate ? fmtDate(order.plannedInstallDate) : "—"}</span>
              </Row>
              <Row label="設置日(実績)" src="link">
                {order.actualInstallDate ? <span className="tnum">{fmtDate(order.actualInstallDate)}</span> : <span className="text-ink-400">未設置(製造部の施工完了で自動)</span>}
              </Row>
              <Row label="営業担当者" src="link">
                {staffName(order.repId)}
                <span className="ml-1 text-[13px] text-ink-500">
                  ({rep?.area} / {rep?.branch})
                </span>
              </Row>
              <Row label="最終連携" src="link">
                <span className="tnum text-[14px] text-ink-600">{order.syncedAt ? fmtDateTime(order.syncedAt) : "—"}</span>
              </Row>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="金額(税抜)"
              right={
                <label className="flex items-center gap-1.5 text-[13px] text-ink-600">
                  <input type="checkbox" className="h-4 w-4 accent-[oklch(29.5%_0.047_262)]" checked={tax} onChange={(e) => setTax(e.target.checked)} />
                  税込も表示 <QTag id="Q05" />
                </label>
              }
            />
            <div className="px-5 py-2">
              <Row label="広告料(月額)" src="link">
                {m(order.adFee)}
                {curFee !== null && curFee !== order.adFee && <span className="tnum ml-2 text-[13px] text-bad-600">一部解約後 {yen(curFee)}</span>}
              </Row>
              <Row label="化粧料" src="link">
                {m(order.makeupFee)}
              </Row>
              <Row label="地代(年額)" src="link">
                {order.landRent === null ? <span className="text-warn-700">未入力</span> : <span className="tnum">{yen(order.landRent)}</span>}
              </Row>
              <Row label="地代比率" src="input">
                <span className="tnum">{ratio === null ? "計算不可" : (ratio * 100).toFixed(1) + "%"}</span>
                <span className="ml-2 text-[12.5px] text-ink-400">自動計算 = 地代 ÷(広告料 × 12)</span>
              </Row>
            </div>
          </Card>

          <Card>
            <CardHeader title="解約" sub="予定と実績を分けて記録します。予定を登録しただけでは「解約済」になりません" right={<QTag id="Q13" />} />
            {cancels.length === 0 ? (
              <div className="px-5 py-6 text-center text-[14px] text-ink-500">解約の予定・実績はありません。</div>
            ) : (
              <div className="divide-y divide-ink-100">
                {cancels.map((c) => {
                  const done = !!c.actualDate && c.actualDate <= todayISO();
                  return (
                    <div key={c.id} className={"px-5 py-3.5 " + (c.withdrawn ? "opacity-60" : "")}>
                      <div className="flex flex-wrap items-center gap-2">
                        {c.withdrawn ? <Pill tone="gray">撤回済み</Pill> : done ? <Pill tone="gray">解約済(実績)</Pill> : <Pill tone="bad">解約予定</Pill>}
                        {c.partial && <Pill tone="warn">一部解約</Pill>}
                        <span className="tnum ml-auto text-[15px] font-semibold text-navy-900">−{yen(c.fee)}/月</span>
                      </div>
                      <div className="tnum mt-1.5 grid gap-x-4 gap-y-0.5 text-[13px] text-ink-600 sm:grid-cols-2">
                        <span>解約予定日 {c.plannedDate ? fmtDate(c.plannedDate) : "—"}</span>
                        <span>解約日(実績) {done ? fmtDate(c.actualDate!) : "—"}</span>
                        <span>WF番号 {c.wfNo ?? "未提出"}</span>
                        <span>理由 {c.reason}</span>
                      </div>
                      {!c.withdrawn && !done && (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            loading={busy === c.id}
                            onClick={() =>
                              run(c.id, () => confirmCancel(order.id, c.id, c.plannedDate! < todayISO() ? c.plannedDate! : todayISO()), "解約の実績を取り込みました", "WFの承認済みとして、解約日(実績)が入りました。")
                            }
                          >
                            <Link2 size={13} />
                            WFの承認を取り込む(デモ)
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setWithdrawId(c.id)}>
                            <Undo2 size={13} />
                            予定を撤回
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="看板" right={<QTag id="Q03" />} />
            <div className="px-5 py-2">
              <Row label="寸法" src="link">
                {order.widthMm && order.heightMm ? (
                  <span className="tnum">
                    {order.widthMm.toLocaleString()} × {order.heightMm.toLocaleString()} mm
                  </span>
                ) : (
                  <span className="text-warn-700">未入力</span>
                )}
              </Row>
              <Row label="面数" src="link">
                {order.faceCount ? FACE_COUNT_LABEL[order.faceCount] : "—"}
              </Row>
              <Row label="高さ区分" src="link">
                {order.heightClass ?? "—"}
              </Row>
              <Row label="看板の区分" src="input">
                {order.signType ?? "—"}
              </Row>
              <Row label="土地の区分" src="input">
                {order.landType ?? "—"}
              </Row>
              <Row label="獲得経路" src="input">
                {order.channel ?? "—"}
                {order.investment && <Pill tone="navy" className="ml-2">投資看板</Pill>}
              </Row>
            </div>
          </Card>

          <Card>
            <CardHeader title="屋外広告物掲出契約書" sub="スキャンデータ(PDF・画像)" right={<QTag id="Q16" />} />
            <div className="space-y-2 px-5 py-4">
              {order.attachments.length > 0 && (
                <div className="overflow-hidden rounded-md border border-ink-200">
                  {order.attachments.map((f) => (
                    <div key={f.id} className="flex min-h-12 items-center gap-2.5 border-b border-ink-100 px-3.5 py-2 last:border-0">
                      {f.kind === "image" ? <ImageIcon size={16} className="text-navy-600" /> : <FileText size={16} className="text-navy-600" />}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14px] text-ink-900">{f.name}</div>
                        <div className="tnum text-[12px] text-ink-400">
                          {fmtDate(f.uploadedAt)} ・ {f.by}
                        </div>
                      </div>
                      <button
                        className="grid h-9 w-9 place-items-center rounded text-ink-400 hover:bg-ink-100 hover:text-navy-900"
                        aria-label="開く"
                        onClick={() => toast("このデモでは、ファイルの表示は省略しています", { description: "本番では、権限のある人だけが開ける形で表示します。" })}
                      >
                        <Download size={15} />
                      </button>
                      <button className="grid h-9 w-9 place-items-center rounded text-ink-400 hover:bg-ink-100 hover:text-bad-600" aria-label="削除" onClick={() => setRemoveId(f.id)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <ScanPicker
                files={[]}
                sample={`${order.kikakuNo ?? "新規"}_屋外広告物掲出契約書.pdf`}
                onAdd={(x) => {
                  addAttachments(order.id, x);
                  toast.success(`${x.length}件のファイルを添付しました`);
                }}
                onRemove={() => {}}
              />
            </div>
          </Card>

          <Card>
            <CardHeader title="お客様" />
            <div className="px-5 py-2">
              <Row label="クライアント名" src="link">
                {customer.company}
              </Row>
              <Row label="業種" src="link">
                {customer.industry}
              </Row>
              <Row label="案件の備考" src="input">
                {order.notes || "—"}
              </Row>
            </div>
          </Card>
        </div>
      </div>

      <CancelModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        fee={curFee ?? 0}
        onSubmit={async (v) => {
          await fakeApi(null, 500);
          planCancel(order.id, v);
          toast.success("解約予定を登録しました", { description: "解約日(実績)は、WFの承認後に自動で入る想定です。それまでは予定として集計されます。" });
        }}
      />
      <Confirm
        open={!!withdrawId}
        title="解約予定を撤回しますか"
        message="撤回した予定は消さずに「撤回済み」として残り、解約予定の集計から外れます。"
        confirmLabel="撤回する"
        onClose={() => setWithdrawId(null)}
        onConfirm={async () => {
          await fakeApi(null);
          withdrawCancel(order.id, withdrawId!);
          setWithdrawId(null);
          toast.success("解約予定を撤回しました");
        }}
      />
      <Confirm
        open={!!removeId}
        title="このファイルを削除しますか"
        message="本番では、削除や差し替えの履歴を残す想定です。"
        confirmLabel="削除する"
        danger
        onClose={() => setRemoveId(null)}
        onConfirm={async () => {
          await fakeApi(null);
          removeAttachment(order.id, removeId!);
          setRemoveId(null);
          toast.success("ファイルを削除しました");
        }}
      />
    </>
  );
}

function CancelModal({
  open,
  onClose,
  fee,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  fee: number;
  onSubmit: (v: { plannedDate: string; fee: number; partial: boolean; reason: string }) => Promise<void>;
}) {
  const [date, setDate] = useState("");
  const [partial, setPartial] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("販促予算の見直し");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState(false);
  if (open !== last) {
    setLast(open);
    if (open) {
      setDate("");
      setPartial(false);
      setAmount(String(fee));
      setTouched(false);
    }
  }
  const n = Number(amount);
  const errs = {
    date: !date ? "解約予定日を選択してください" : "",
    amount: !(n > 0) ? "減る広告料を入力してください" : n > fee ? `現在の広告料(${yen(fee)})を超えています` : "",
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="解約予定を登録"
      sub="解約の連絡を受けた時点で登録します(WFの提出前でも登録できます)"
      width={520}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            loading={busy}
            onClick={async () => {
              setTouched(true);
              if (errs.date || errs.amount) return;
              setBusy(true);
              await onSubmit({ plannedDate: date, fee: n, partial, reason });
              setBusy(false);
              onClose();
            }}
          >
            登録する
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {[
            [false, "全部を解約", "この契約の広告料がすべてなくなる"],
            [true, "一部を解約", "一部の面だけやめるなど、減る分だけ登録"],
          ].map(([v, l, d]) => (
            <button
              key={String(v)}
              type="button"
              onClick={() => {
                setPartial(v as boolean);
                setAmount(v ? String(Math.round(fee / 2 / 1000) * 1000) : String(fee));
              }}
              className={"min-h-11 rounded-md border px-3 py-2 text-left transition " + (partial === v ? "border-navy-900 bg-navy-900 text-white" : "border-ink-300 hover:border-navy-300")}
            >
              <span className="block text-[15px] font-medium">{l as string}</span>
              <span className={"mt-0.5 block text-[12px] leading-snug " + (partial === v ? "text-white/75" : "text-ink-500")}>{d as string}</span>
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="解約予定日" required error={touched ? errs.date : ""} hint="撤去日・申請日ではなく、解約の効力が生じる日">
            <input type="date" className={inputCls + (touched && errs.date ? errCls : "")} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="解約で減る広告料(月額・税抜)" required error={touched ? errs.amount : ""}>
            <input type="number" inputMode="numeric" className={inputCls + " tnum" + (touched && errs.amount ? errCls : "")} value={amount} disabled={!partial} onChange={(e) => setAmount(e.target.value)} />
          </Field>
        </div>
        <Field label="理由">
          <select className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)}>
            {["販促予算の見直し", "店舗閉鎖", "店舗移転", "他媒体への切替", "事業縮小", "一部の面の掲出をやめる", "その他"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>
      </div>
    </Modal>
  );
}
