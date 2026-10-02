import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { addDays, format, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  FileSignature,
  LayoutGrid,
  Mail,
  MessageSquare,
  MonitorPlay,
  PencilLine,
  Phone,
  Presentation,
  Trash2,
  Users,
} from "lucide-react";
import { useStore, staffName } from "../store";
import { OPEN_STAGES, STAGE_PROB, type ActivityType, type Stage } from "../data/seed";
import { fakeApi } from "../lib/fakeApi";
import { useLoad } from "../lib/useLoad";
import { contractState, faceLookup, handoverOf, holdActive } from "../lib/domain";
import { daysFromToday, fmtDate, fmtDateJa, fmtDateTime, fmtPeriod, relDay, todayISO, yen } from "../lib/format";
import { ActivityModal, DealFormModal, NextActionModal } from "../components/forms";
import CloseDealModal from "../components/CloseDealModal";
import { Button, Card, CardHeader, Confirm, DL, EmptyState, Field, Modal, Pill, Skeleton, inputCls } from "../components/ui";
import { ContractPill, HandoverPill, StagePill } from "../components/pills";

const ACT_ICON: Record<ActivityType, typeof Phone> = {
  訪問: Users,
  電話: Phone,
  メール: Mail,
  提案: Presentation,
  オンライン: MonitorPlay,
};

export default function DealDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const loading = useLoad(380);
  const deal = useStore((s) => s.deals.find((d) => d.id === id));
  const customer = useStore((s) => s.customers.find((c) => c.id === deal?.customerId));
  const allActivities = useStore((s) => s.activities);
  const allHolds = useStore((s) => s.holds);
  const boards = useStore((s) => s.boards);
  const contract = useStore((s) => s.contracts.find((c) => c.id === deal?.contractId));
  const handovers = useStore((s) => s.handovers);
  const setStage = useStore((s) => s.setStage);
  const removeDeal = useStore((s) => s.removeDeal);
  const extendHold = useStore((s) => s.extendHold);
  const releaseHold = useStore((s) => s.releaseHold);

  const [logOpen, setLogOpen] = useState(false);
  const [naOpen, setNaOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [lostOpen, setLostOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [releaseId, setReleaseId] = useState<string | null>(null);

  const lookup = useMemo(() => faceLookup(boards), [boards]);
  const activities = useMemo(
    () => allActivities.filter((a) => a.dealId === id).sort((a, b) => b.date.localeCompare(a.date)),
    [allActivities, id],
  );
  const holds = allHolds.filter((h) => h.dealId === id);

  if (!deal || !customer) {
    return (
      <Card>
        <EmptyState
          icon={<FileSignature size={20} />}
          title="商談が見つかりません"
          description="削除されたか、URLが正しくない可能性があります。"
          action={
            <Link to="/deals">
              <Button>商談一覧へ戻る</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  const isOpen = OPEN_STAGES.includes(deal.stage);
  const amount = deal.monthlyBudget * deal.months;
  const ho = contract ? handoverOf(handovers, contract.id) : undefined;

  const changeStage = async (s: Stage) => {
    if (s === deal.stage) return;
    await fakeApi(null, 200);
    setStage(deal.id, s);
    toast.success(`ステージを「${s}」に変更しました`);
  };

  return (
    <>
      <Link to="/deals" className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] text-ink-500 transition hover:text-navy-900">
        <ArrowLeft size={14} />
        商談一覧
      </Link>

      {/* ヘッダー */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <Link to={`/customers?id=${customer.id}`} className="text-[13px] text-navy-600 underline-offset-2 hover:underline">
            {customer.company}
          </Link>
          <h1 className="mt-1 font-serif text-[24px] font-semibold tracking-wide text-navy-900">{deal.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-ink-500">
            <StagePill stage={deal.stage} />
            <span>
              見込金額 <span className="tnum font-semibold text-navy-900">{yen(amount)}</span>
            </span>
            <span>担当 {staffName(deal.repId)}</span>
            <span className="tnum">受注予定 {fmtDate(deal.expectedClose)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isOpen && (
            <>
              <Button variant="ghost" onClick={() => setDelOpen(true)} aria-label="削除">
                <Trash2 size={14} />
              </Button>
              <Button variant="outline" onClick={() => setLostOpen(true)}>
                失注にする
              </Button>
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                編集
              </Button>
              <Button onClick={() => setCloseOpen(true)}>
                <FileSignature size={14} />
                成約登録・引継ぎ
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ステージ */}
      {deal.stage !== "失注" ? (
        <Card className="mb-6 px-2 py-2">
          <div className="thin-scroll flex overflow-x-auto">
            {[...OPEN_STAGES, "成約" as Stage].map((s, i, arr) => {
              const pos = arr.indexOf(deal.stage);
              const done = i < pos;
              const active = i === pos;
              const clickable = isOpen && s !== "成約";
              return (
                <button
                  key={s}
                  disabled={!clickable}
                  onClick={() => (s === "成約" ? setCloseOpen(true) : changeStage(s))}
                  className={
                    "group flex min-w-[120px] flex-1 items-center gap-2.5 rounded-md px-3 py-2.5 text-left transition " +
                    (clickable ? "hover:bg-ink-50" : "cursor-default")
                  }
                >
                  <span
                    className={
                      "tnum grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-semibold transition " +
                      (active
                        ? "border-navy-900 bg-navy-900 text-white"
                        : done
                          ? "border-navy-300 bg-navy-100 text-navy-800"
                          : "border-ink-300 text-ink-400")
                    }
                  >
                    {done ? <Check size={12} /> : i + 1}
                  </span>
                  <span className="leading-tight">
                    <span className={"block text-[12.5px] " + (active ? "font-semibold text-navy-900" : done ? "text-navy-800" : "text-ink-500")}>{s}</span>
                    <span className="tnum block text-[10.5px] text-ink-400">確度 {STAGE_PROB[s]}%</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      ) : (
        <div className="mb-6 rounded-lg border border-bad-100 bg-bad-50 px-5 py-3.5 text-[13px] text-bad-700">
          この商談は失注として記録されています。理由: {deal.lostReason ?? "—"}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* 左 */}
        <div className="space-y-6">
          {isOpen && (
            <Card>
              <CardHeader
                title="次回対応"
                right={
                  <Button variant="ghost" size="sm" onClick={() => setNaOpen(true)}>
                    <CalendarClock size={13} />
                    {deal.nextAction ? "変更" : "設定"}
                  </Button>
                }
              />
              <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
                {deal.nextAction ? (
                  <>
                    <div className="w-32 shrink-0">
                      <div className="tnum text-[15px] font-semibold text-navy-900">{fmtDateJa(deal.nextAction.date)}</div>
                      <div className={"text-[12px] " + (daysFromToday(deal.nextAction.date) < 0 ? "font-medium text-bad-600" : "text-ink-500")}>
                        {relDay(deal.nextAction.date)}
                      </div>
                    </div>
                    <div className="flex-1 text-[14px] text-ink-900">{deal.nextAction.content}</div>
                  </>
                ) : (
                  <div className="flex-1 text-[13px] text-warn-700">次回対応が設定されていません。次の一手を決めておきましょう。</div>
                )}
                <Button onClick={() => setLogOpen(true)}>
                  <PencilLine size={14} />
                  対応を記録
                </Button>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader
              title="営業活動の履歴"
              sub={`${activities.length}件`}
              right={
                <Button variant="outline" size="sm" onClick={() => setLogOpen(true)}>
                  活動を記録
                </Button>
              }
            />
            {loading ? (
              <div className="space-y-4 p-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <EmptyState icon={<MessageSquare size={20} />} title="まだ活動が記録されていません" description="訪問・電話・提案などの内容を記録しましょう。" />
            ) : (
              <ol className="relative px-5 py-4">
                <AnimatePresence initial={false}>
                  {activities.map((a, i) => {
                    const Icon = ACT_ICON[a.type];
                    return (
                      <motion.li
                        key={a.id}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative flex gap-4 pb-5 last:pb-0"
                      >
                        {i < activities.length - 1 && <span className="absolute top-8 bottom-0 left-[15px] w-px bg-ink-200" />}
                        <span className="z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink-200 bg-white text-navy-700">
                          <Icon size={14} />
                        </span>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex flex-wrap items-center gap-x-2.5 text-[12px] text-ink-500">
                            <span className="font-semibold text-navy-900">{a.type}</span>
                            <span className="tnum">{fmtDateTime(a.date)}</span>
                            <span>{staffName(a.repId)}</span>
                          </div>
                          <p className="mt-1 text-[13px] leading-relaxed text-ink-800">{a.memo}</p>
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ol>
            )}
          </Card>
        </div>

        {/* 右 */}
        <div className="space-y-6">
          {contract && (
            <Card className="border-navy-200">
              <CardHeader title="成約した契約" right={<ContractPill state={contractState(contract)} />} />
              <div className="space-y-3 px-5 py-4">
                <DL
                  items={[
                    ["契約番号", <span className="tnum">{contract.no}</span>],
                    ["掲載期間", fmtPeriod(contract.startMonth, contract.endMonth)],
                    ["月額", <span className="tnum">{yen(contract.monthlyFee)}</span>],
                    ["引継ぎ", ho ? <HandoverPill status={ho.status} /> : <Pill tone="ok">受領済</Pill>],
                  ]}
                />
                <div className="flex gap-2 pt-1">
                  <Link to={`/handover?id=${ho?.id ?? ""}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      引継ぎ状況
                    </Button>
                  </Link>
                  <Link to={`/contracts?id=${contract.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      契約詳細
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {isOpen && (
            <Card>
              <CardHeader
                title="仮押さえ中の広告面"
                sub="期限までに成約しない場合は自動解除"
                right={
                  <Button variant="outline" size="sm" onClick={() => nav(`/boards?deal=${deal.id}`)}>
                    <LayoutGrid size={13} />
                    空きを探す
                  </Button>
                }
              />
              {holds.length === 0 ? (
                <div className="px-5 py-6 text-center text-[12.5px] text-ink-500">
                  仮押さえ中の面はありません。
                  <br />
                  「空きを探す」から看板の空き状況を確認できます。
                </div>
              ) : (
                <div className="divide-y divide-ink-100">
                  {holds.map((h) => {
                    const l = lookup.get(h.faceId);
                    const active = holdActive(h);
                    const left = daysFromToday(h.expiresAt);
                    return (
                      <div key={h.id} className="px-5 py-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <Link to={`/boards/${l?.board.id}`} className="min-w-0 text-[13px] font-medium text-navy-900 hover:underline">
                            {l?.board.name} {l?.face.label}
                          </Link>
                          {!active ? (
                            <Pill tone="gray">期限切れ</Pill>
                          ) : left <= 3 ? (
                            <Pill tone="warn">残り{left}日</Pill>
                          ) : (
                            <Pill tone="navy">残り{left}日</Pill>
                          )}
                        </div>
                        <div className="mt-1 text-[11.5px] text-ink-500">{fmtPeriod(h.startMonth, h.endMonth)}</div>
                        <div className="tnum mt-0.5 text-[11.5px] text-ink-500">期限 {fmtDate(h.expiresAt)}</div>
                        <div className="mt-2 flex gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const base = active ? parseISO(h.expiresAt) : new Date();
                              const until = format(addDays(base, 7), "yyyy-MM-dd");
                              const max = format(addDays(new Date(), 30), "yyyy-MM-dd");
                              await fakeApi(null, 250);
                              extendHold(h.id, until > max ? max : until);
                              toast.success("仮押さえ期限を延長しました", { description: `新しい期限: ${fmtDate(until > max ? max : until)}` });
                            }}
                          >
                            7日延長
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setReleaseId(h.id)}>
                            解除
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          <Card>
            <CardHeader title="商談情報" />
            <div className="px-5 py-4">
              <DL
                items={[
                  ["月額予算", <span className="tnum">{yen(deal.monthlyBudget)}</span>],
                  ["掲載期間", `${deal.months}ヶ月`],
                  ["見込金額", <span className="tnum font-semibold">{yen(amount)}</span>],
                  ["確度", `${STAGE_PROB[deal.stage]}%`],
                  ["登録日", <span className="tnum">{fmtDate(deal.createdAt)}</span>],
                ]}
              />
            </div>
          </Card>

          <Card>
            <CardHeader title="顧客情報" />
            <div className="px-5 py-4">
              <DL
                items={[
                  ["会社名", customer.company],
                  ["業種", customer.industry],
                  ["先方担当", `${customer.contact}(${customer.contactTitle})`],
                  [
                    "電話",
                    <a href={`tel:${customer.phone}`} className="tnum text-navy-700 hover:underline">
                      {customer.phone}
                    </a>,
                  ],
                  ["所在地", customer.address],
                ]}
              />
            </div>
          </Card>
        </div>
      </div>

      <ActivityModal open={logOpen} onClose={() => setLogOpen(false)} customerId={customer.id} dealId={isOpen ? deal.id : undefined} title={`${customer.company} / ${deal.title}`} />
      <NextActionModal open={naOpen} onClose={() => setNaOpen(false)} deal={deal} />
      <DealFormModal open={editOpen} onClose={() => setEditOpen(false)} deal={deal} />
      <CloseDealModal open={closeOpen} onClose={() => setCloseOpen(false)} deal={deal} />
      <LostModal open={lostOpen} onClose={() => setLostOpen(false)} onSubmit={async (r) => {
        await fakeApi(null);
        setStage(deal.id, "失注", r);
        toast.success("失注として記録しました", { description: "仮押さえ中の面は解除されました。" });
      }} />
      <Confirm
        open={delOpen}
        title="この商談を削除しますか"
        message="活動履歴は顧客に紐づいたまま残ります。仮押さえ中の面は解除されます。この操作は取り消せません。"
        confirmLabel="削除する"
        danger
        onClose={() => setDelOpen(false)}
        onConfirm={async () => {
          await fakeApi(null);
          removeDeal(deal.id);
          toast.success("商談を削除しました");
          nav("/deals");
        }}
      />
      <Confirm
        open={!!releaseId}
        title="仮押さえを解除しますか"
        message="解除すると、この面は他の担当者が仮押さえできるようになります。"
        confirmLabel="解除する"
        onClose={() => setReleaseId(null)}
        onConfirm={async () => {
          await fakeApi(null);
          releaseHold(releaseId!);
          setReleaseId(null);
          toast.success("仮押さえを解除しました");
        }}
      />
    </>
  );
}

function LostModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (reason: string) => Promise<void> }) {
  const [reason, setReason] = useState("予算不足");
  const [busy, setBusy] = useState(false);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="失注として記録"
      width={440}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            loading={busy}
            onClick={async () => {
              setBusy(true);
              await onSubmit(reason);
              setBusy(false);
              onClose();
            }}
          >
            記録する
          </Button>
        </>
      }
    >
      <Field label="失注理由">
        <select className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)}>
          {["予算不足", "Web広告を優先", "競合他社に決定", "希望エリアに空きなし", "時期の見送り", "その他"].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </Field>
      <p className="mt-3 text-[12px] text-ink-500">失注にすると、この商談の仮押さえはすべて解除されます。({todayISO().replaceAll("-", "/")} 記録)</p>
    </Modal>
  );
}
