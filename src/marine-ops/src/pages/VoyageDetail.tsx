import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Ship,
  MapPin,
  User,
  CalendarClock,
  CircleDollarSign,
  Check,
  Play,
  AlertTriangle,
  Clock,
  CircleCheck,
  Circle,
} from "lucide-react";
import { useStore } from "../store/useStore";
import {
  Card,
  Pill,
  Progress,
  StatusDot,
  Avatar,
  Button,
  Modal,
  Field,
  inputCls,
} from "../components/ui";
import { fakeApi } from "../lib/fakeApi";
import {
  voyageStatus,
  progressPct,
  overdueItems,
  STATUS_TONE,
  ITEM_TONE,
} from "../lib/voyage";
import { ymdFull, md_hm, yen, fromNow } from "../lib/format";
import { shipperById, staffById, vesselName, type ItemStatus } from "../data/seed";

export default function VoyageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const voyage = useStore((s) => s.voyages.find((v) => v.id === id));
  const shippers = useStore((s) => s.shippers);
  const staff = useStore((s) => s.staff);
  const alerts = useStore((s) => s.alerts);
  const updateItemStatus = useStore((s) => s.updateItemStatus);

  const [busyItem, setBusyItem] = useState<string | null>(null);
  const [defectFor, setDefectFor] = useState<string | null>(null);
  const [defectNote, setDefectNote] = useState("");
  const [defectErr, setDefectErr] = useState("");

  const voyageAlerts = useMemo(
    () => alerts.filter((a) => a.voyageId === id).slice(0, 8),
    [alerts, id],
  );

  if (!voyage) {
    return (
      <div className="py-20 text-center">
        <p className="text-ink-500">案件が見つかりません。</p>
        <Link to="/voyages" className="mt-3 inline-block text-sm text-brand-600 hover:underline">
          ← 配船案件へ戻る
        </Link>
      </div>
    );
  }

  const sh = shipperById(shippers, voyage.shipperId);
  const assignee = staffById(staff, voyage.assigneeId);
  const s = voyageStatus(voyage);
  const pct = progressPct(voyage);
  const overdue = overdueItems(voyage);

  const setStatus = async (itemId: string, status: ItemStatus, note?: string) => {
    setBusyItem(itemId);
    await fakeApi(true, 500);
    updateItemStatus(voyage.id, itemId, status, note);
    setBusyItem(null);
    if (status === "完了") toast.success("確認事項を完了にしました");
    else if (status === "進行中") toast.message("確認事項に着手しました");
  };

  const submitDefect = async () => {
    if (defectNote.trim().length < 4) {
      setDefectErr("不備の内容を入力してください(4文字以上)。");
      return;
    }
    const itemId = defectFor!;
    setDefectFor(null);
    setBusyItem(itemId);
    await fakeApi(true, 600);
    updateItemStatus(voyage.id, itemId, "不備", defectNote.trim());
    setBusyItem(null);
    setDefectNote("");
    setDefectErr("");
    toast.error("不備を報告し、管理者へ通知しました", {
      description: "アラート一覧に追加されました。",
    });
  };

  return (
    <>
      {/* 戻る */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-500 transition hover:text-ink-800"
      >
        <ArrowLeft size={16} /> 戻る
      </button>

      {/* ヘッダ */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={STATUS_TONE[s] as never}>
                <StatusDot tone={STATUS_TONE[s] as never} />
                {s}
              </Pill>
              <span className="tnum text-sm text-ink-400">{voyage.code}</span>
              {voyage.priority === "高" && <Pill tone="red">優先度 高</Pill>}
              {overdue.length > 0 && <Pill tone="red">期日超過 {overdue.length}</Pill>}
            </div>
            <h1 className="mt-2 text-xl font-bold text-ink-900 sm:text-2xl">{sh?.name}</h1>
            <p className="mt-0.5 text-sm text-ink-500">
              {voyage.cargo} / {voyage.cargoDetail}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-ink-400">進捗</div>
            <div className="tnum text-3xl font-bold text-ink-900">{pct}%</div>
          </div>
        </div>
        <div className="mt-4">
          <Progress pct={pct} tone={s === "遅延" || s === "不備" ? "red" : s === "要注意" ? "amber" : s === "完了" ? "green" : "brand"} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-sm sm:grid-cols-3 lg:grid-cols-6">
          <Info icon={<MapPin size={15} />} label="航路">
            {voyage.loadPort} → {voyage.dischargePort}
          </Info>
          <Info icon={<Ship size={15} />} label="本船">
            {vesselName(voyage.vesselId)}
          </Info>
          <Info icon={<User size={15} />} label="運航担当">
            <span className="inline-flex items-center gap-1.5">
              <Avatar name={assignee?.name ?? "?"} color={assignee?.color} size={20} />
              {assignee?.name}
            </span>
          </Info>
          <Info icon={<CalendarClock size={15} />} label="出港 / 入港予定">
            {ymdFull(voyage.etd).slice(5)} / {ymdFull(voyage.eta).slice(5)}
          </Info>
          <Info icon={<Clock size={15} />} label="受注日">
            {ymdFull(voyage.receivedAt)}
          </Info>
          <Info icon={<CircleDollarSign size={15} />} label="運賃">
            {yen(voyage.freight)}
          </Info>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* 確認事項チェックリスト */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
            <h2 className="text-sm font-bold text-ink-800">確認事項(進捗チェックリスト)</h2>
            <span className="text-xs text-ink-400">
              {voyage.items.filter((i) => i.status === "完了").length} / {voyage.items.length} 完了
            </span>
          </div>
          <ol className="relative">
            {voyage.items.map((it, idx) => {
              const isOverdue = it.status !== "完了" && it.status !== "不備" && new Date(it.dueAt) < new Date();
              const busy = busyItem === it.id;
              const itemAssignee = staffById(staff, it.assigneeId);
              return (
                <li key={it.id} className="relative border-b border-ink-100 px-5 py-4 last:border-0">
                  <div className="flex items-start gap-3">
                    {/* ステータスアイコン */}
                    <div className="mt-0.5 shrink-0">
                      {it.status === "完了" ? (
                        <CircleCheck size={22} className="text-emerald-500" />
                      ) : it.status === "不備" ? (
                        <AlertTriangle size={22} className="text-rose-500" />
                      ) : it.status === "進行中" ? (
                        <div className="grid h-[22px] w-[22px] place-items-center rounded-full border-2 border-brand-500">
                          <span className="h-2 w-2 rounded-full bg-brand-500" />
                        </div>
                      ) : (
                        <Circle size={22} className="text-ink-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-ink-400">STEP {idx + 1}</span>
                        <span className="text-sm font-semibold text-ink-800">{it.label}</span>
                        <Pill tone={ITEM_TONE[it.status] as never}>{it.status}</Pill>
                        {isOverdue && <Pill tone="red">期日超過</Pill>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-400">
                        <span className="inline-flex items-center gap-1">
                          <Avatar name={itemAssignee?.name ?? "?"} color={itemAssignee?.color} size={16} />
                          {itemAssignee?.name}
                        </span>
                        <span className={isOverdue ? "font-medium text-rose-500" : ""}>
                          期日 {ymdFull(it.dueAt).slice(5)}
                        </span>
                        {it.completedAt && <span className="text-emerald-600">完了 {md_hm(it.completedAt)}</span>}
                      </div>
                      {it.note && it.status === "不備" && (
                        <div className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                          <b>不備の内容:</b> {it.note}
                        </div>
                      )}

                      {/* アクション */}
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {it.status === "未着手" && (
                          <Button variant="outline" loading={busy} onClick={() => setStatus(it.id, "進行中")} className="!px-3 !py-1.5 !text-xs">
                            <Play size={13} /> 着手する
                          </Button>
                        )}
                        {(it.status === "進行中" || it.status === "不備") && (
                          <Button variant="primary" loading={busy} onClick={() => setStatus(it.id, "完了")} className="!px-3 !py-1.5 !text-xs">
                            <Check size={13} /> 完了にする
                          </Button>
                        )}
                        {it.status !== "完了" && it.status !== "不備" && (
                          <Button
                            variant="outline"
                            disabled={busy}
                            onClick={() => {
                              setDefectFor(it.id);
                              setDefectNote("");
                              setDefectErr("");
                            }}
                            className="!px-3 !py-1.5 !text-xs !text-rose-600 hover:!bg-rose-50"
                          >
                            <AlertTriangle size={13} /> 不備を報告
                          </Button>
                        )}
                        {it.status === "完了" && (
                          <button
                            disabled={busy}
                            onClick={() => setStatus(it.id, "進行中")}
                            className="text-xs text-ink-400 transition hover:text-ink-600"
                          >
                            完了を取り消す
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        {/* サイド:この案件のアラート履歴 */}
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="mb-1 text-sm font-bold text-ink-800">遠隔モニタリング状況</h2>
            <p className="text-xs text-ink-400">この案件でシステムが検出したアラート</p>
            <div className="mt-4 space-y-3">
              {voyageAlerts.length === 0 ? (
                <div className="rounded-xl bg-emerald-50 px-3 py-4 text-center text-xs text-emerald-700">
                  検出されたアラートはありません。順調に進行しています。
                </div>
              ) : (
                voyageAlerts.map((a) => (
                  <div key={a.id} className="flex items-start gap-2.5">
                    <span className="mt-1.5">
                      <StatusDot tone={a.severity === "高" ? "red" : a.severity === "中" ? "amber" : "gray"} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Pill tone={a.severity === "高" ? "red" : a.severity === "中" ? "amber" : "gray"}>{a.kind}</Pill>
                        <span className="text-[11px] text-ink-400">{fromNow(a.at)}</span>
                      </div>
                      <p className="mt-1 text-xs text-ink-600">{a.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-bold text-ink-800">この案件の流れ</h2>
            <p className="text-xs leading-relaxed text-ink-500">
              受注 → 用船契約 → 配船確定 → 積地手配 → 船積み・書類確認 → 揚地手配 → 完了報告 → 運賃請求 → 入金確認。
              各ステップの期日超過や不備を検出すると、担当者と管理者へ自動でアラートが飛びます。
            </p>
          </Card>
        </div>
      </div>

      {/* 不備報告モーダル */}
      <Modal open={defectFor !== null} onClose={() => setDefectFor(null)} title="不備を報告する" width={460}>
        <p className="text-sm text-ink-600">
          報告すると、この確認事項が「不備」になり、<b>管理者へアラートが通知</b>されます。
        </p>
        <div className="mt-4">
          <Field label="不備の内容" required error={defectErr}>
            <textarea
              className={inputCls + " min-h-24 resize-none"}
              placeholder="例:検数票の数量と契約数量に相違あり。荷主へ照会中。"
              value={defectNote}
              onChange={(e) => setDefectNote(e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDefectFor(null)}>
            キャンセル
          </Button>
          <Button variant="danger" onClick={submitDefect}>
            <AlertTriangle size={15} /> 報告して通知
          </Button>
        </div>
      </Modal>
    </>
  );
}

function Info({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-ink-400">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium text-ink-800">{children}</div>
    </div>
  );
}
