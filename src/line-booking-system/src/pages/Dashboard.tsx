import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, isSameDay, isToday, subDays } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Bell,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Check,
  Search,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { menuById, type ResStatus, type Reservation } from "../data/seed";
import { useStore } from "../store";
import { fakeApi } from "../lib/fakeApi";
import { AdminShell } from "../components/AdminShell";
import { Button, Card, EmptyState, Modal, Pill, Skeleton, StatusDot, tnum, type Tone } from "../components/ui";

const STATUS_TONE: Record<ResStatus, Tone> = { 確定: "green", 来店済: "blue", キャンセル: "gray" };
const menuTone: Record<string, Tone> = { free30: "green", online30: "violet", paid60: "amber" };

export default function Dashboard() {
  const reservations = useStore((s) => s.reservations);
  const logs = useStore((s) => s.logs);
  const cancelReservation = useStore((s) => s.cancelReservation);
  const markSeen = useStore((s) => s.markSeen);

  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState<ResStatus | "all">("all");
  const [detail, setDetail] = useState<Reservation | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<Reservation | null>(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    setLoading(true);
    fakeApi(null, 600).then(() => setLoading(false));
  }, []);

  // ── KPI ──
  const kpi = useMemo(() => {
    const active = reservations.filter((r) => r.status !== "キャンセル");
    const today = active.filter((r) => isToday(new Date(r.start)));
    const weekAgo = subDays(new Date(), 7);
    const freeThisWeek = active.filter(
      (r) => r.menuId === "free30" && new Date(r.createdAt) >= weekAgo,
    ).length;
    const total = logs.length;
    const ok = logs.filter((l) => l.status === "成功").length;
    const rate = total ? Math.round((ok / total) * 100) : 100;
    return { today: today.length, freeThisWeek, rate, failed: logs.filter((l) => l.status === "失敗").length };
  }, [reservations, logs]);

  // ── 本日のスケジュール ──
  const todaySchedule = useMemo(
    () =>
      reservations
        .filter((r) => r.status !== "キャンセル" && isSameDay(new Date(r.start), new Date()))
        .sort((a, b) => +new Date(a.start) - +new Date(b.start)),
    [reservations],
  );

  // ── 直近7日の予約数(グラフ) ──
  const chart = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(new Date(), 6 - i);
      const count = reservations.filter(
        (r) => r.status !== "キャンセル" && isSameDay(new Date(r.createdAt), day),
      ).length;
      return { label: format(day, "M/d"), 予約: count };
    });
  }, [reservations]);

  // ── 一覧(検索・絞り込み・並び替え) ──
  const rows = useMemo(() => {
    const kw = q.trim();
    return reservations
      .filter((r) => (statusF === "all" ? true : r.status === statusF))
      .filter((r) => (kw ? r.name.includes(kw) || r.kana.includes(kw) : true))
      .sort((a, b) => +new Date(b.start) - +new Date(a.start));
  }, [reservations, q, statusF]);

  const doCancel = async () => {
    if (!confirmCancel) return;
    setCanceling(true);
    await fakeApi(null, 600);
    cancelReservation(confirmCancel.id);
    setCanceling(false);
    toast.success("予約をキャンセルしました。お客様へLINEで通知しました");
    setConfirmCancel(null);
    setDetail(null);
  };

  const openDetail = (r: Reservation) => {
    if (r.isNew) markSeen(r.id);
    setDetail(r);
  };

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* 見出し */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">予約管理</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              LINEから届いた予約と、通知・カレンダー連携の状況をまとめて確認できます。
            </p>
          </div>
          <div className="text-sm text-slate-400">{format(new Date(), "yyyy年M月d日(E)", { locale: ja })}</div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi loading={loading} icon={<CalendarCheck size={18} />} tone="green" label="本日の予約" value={`${kpi.today}件`} />
          <Kpi loading={loading} icon={<Sparkles size={18} />} tone="amber" label="今週の無料相談" value={`${kpi.freeThisWeek}件`} />
          <Kpi
            loading={loading}
            icon={<Bell size={18} />}
            tone={kpi.failed > 0 ? "red" : "green"}
            label="通知配信 成功率"
            value={`${kpi.rate}%`}
            sub={kpi.failed > 0 ? `未対応エラー ${kpi.failed}件` : "全件届いています"}
          />
          <Kpi loading={loading} icon={<CalendarClock size={18} />} tone="blue" label="カレンダー連携" value="正常" sub="Googleと同期中" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 本日のスケジュール */}
          <Card className="lg:col-span-1">
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
              <CalendarDays size={16} className="text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800">本日のスケジュール</h2>
            </div>
            <div className="p-3">
              {loading ? (
                <div className="space-y-2 p-2">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : todaySchedule.length === 0 ? (
                <EmptyState icon={<CalendarDays size={22} />} title="本日の予約はありません" />
              ) : (
                <ul className="space-y-1.5">
                  {todaySchedule.map((r) => (
                    <li key={r.id}>
                      <button
                        onClick={() => openDetail(r)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
                      >
                        <div className={"w-12 shrink-0 text-sm font-bold text-slate-900 " + tnum}>
                          {format(new Date(r.start), "HH:mm")}
                        </div>
                        <div className="h-8 w-px bg-slate-200" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-slate-800">{r.name} さま</div>
                          <div className="truncate text-xs text-slate-400">{menuById(r.menuId).name}</div>
                        </div>
                        {r.isNew && <Pill tone="red">NEW</Pill>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {/* グラフ */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <h2 className="text-sm font-bold text-slate-800">直近7日の予約受付数</h2>
              <Pill tone="green">
                <Users size={12} /> 合計 {chart.reduce((a, b) => a + b.予約, 0)}件
              </Pill>
            </div>
            <div className="h-56 p-4">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: "#f1f5f9" }}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                      formatter={(v: number) => [`${v}件`, "予約"]}
                    />
                    <Bar dataKey="予約" fill="#06C755" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        {/* 予約一覧 */}
        <Card>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-3.5">
            <h2 className="mr-auto text-sm font-bold text-slate-800">予約一覧</h2>
            <div className="relative">
              <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="お名前で検索"
                className="w-44 rounded-lg border border-slate-200 py-1.5 pr-3 pl-8 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
            </div>
            <div className="flex rounded-lg border border-slate-200 p-0.5 text-xs">
              {(["all", "確定", "来店済", "キャンセル"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusF(s)}
                  className={
                    "rounded-md px-2.5 py-1 font-medium transition " +
                    (statusF === s ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-100")
                  }
                >
                  {s === "all" ? "すべて" : s}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState
              icon={<Search size={22} />}
              title="該当する予約がありません"
              description="検索条件や絞り込みを変更してください。"
            />
          ) : (
            <>
              {/* PC: テーブル */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                      <th className="px-5 py-2.5 font-medium">日時</th>
                      <th className="px-3 py-2.5 font-medium">お客様</th>
                      <th className="px-3 py-2.5 font-medium">メニュー</th>
                      <th className="px-3 py-2.5 font-medium">連携</th>
                      <th className="px-3 py-2.5 font-medium">状態</th>
                      <th className="px-5 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.id}
                        className="cursor-pointer border-b border-slate-50 transition hover:bg-slate-50"
                        onClick={() => openDetail(r)}
                      >
                        <td className={"px-5 py-3 font-medium text-slate-800 " + tnum}>
                          {format(new Date(r.start), "M/d HH:mm", { locale: ja })}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800">{r.name}</span>
                            {r.isNew && <Pill tone="red">NEW</Pill>}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <Pill tone={menuTone[r.menuId] ?? "gray"}>{menuById(r.menuId).name}</Pill>
                        </td>
                        <td className="px-3 py-3">
                          {r.calendarSynced ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                              <Check size={13} /> 登録済
                            </span>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                            <StatusDot tone={STATUS_TONE[r.status]} />
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {r.status === "確定" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmCancel(r);
                              }}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                              aria-label="キャンセル"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* モバイル: カード */}
              <ul className="divide-y divide-slate-50 md:hidden">
                {rows.map((r) => (
                  <li key={r.id}>
                    <button onClick={() => openDetail(r)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{r.name}</span>
                          {r.isNew && <Pill tone="red">NEW</Pill>}
                        </div>
                        <div className={"mt-0.5 text-xs text-slate-400 " + tnum}>
                          {format(new Date(r.start), "M/d HH:mm", { locale: ja })}・{menuById(r.menuId).name}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        <StatusDot tone={STATUS_TONE[r.status]} />
                        {r.status}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      {/* 詳細モーダル */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="予約の詳細">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-800 text-sm font-bold text-white">
                {detail.name.trim().slice(0, 1)}
              </span>
              <div>
                <div className="font-bold text-slate-900">{detail.name} さま</div>
                <div className="text-xs text-slate-400">{detail.kana}</div>
              </div>
              <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <StatusDot tone={STATUS_TONE[detail.status]} />
                {detail.status}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-sm">
              <DRow label="日時" value={format(new Date(detail.start), "yyyy年M月d日(E) HH:mm〜", { locale: ja })} />
              <DRow label="メニュー" value={`${menuById(detail.menuId).name}(${menuById(detail.menuId).durationMin}分)`} />
              <DRow
                label="カレンダー"
                value={detail.calendarSynced ? "Googleカレンダーに登録済み" : "未登録"}
              />
              <DRow label="リマインド" value={detail.reminderSent ? "送信済み" : "予約日の前日に自動送信"} />
            </div>
            {detail.note && (
              <div className="rounded-xl border border-slate-200 p-3 text-sm">
                <div className="mb-1 text-xs font-medium text-slate-400">相談したいこと</div>
                <div className="text-slate-700">{detail.note}</div>
              </div>
            )}
            {detail.status === "確定" && (
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="danger" onClick={() => setConfirmCancel(detail)}>
                  <Trash2 size={16} /> 予約をキャンセル
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* キャンセル確認 */}
      <Modal open={!!confirmCancel} onClose={() => (canceling ? null : setConfirmCancel(null))} title="予約をキャンセルしますか?" width={420}>
        {confirmCancel && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              <b>{confirmCancel.name} さま</b>({format(new Date(confirmCancel.start), "M月d日 HH:mm", { locale: ja })}
              )の予約をキャンセルします。お客様のLINEへ自動でお知らせが届きます。
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmCancel(null)} disabled={canceling}>
                やめる
              </Button>
              <Button variant="danger" loading={canceling} onClick={doCancel}>
                キャンセルする
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminShell>
  );
}

function Kpi({
  loading,
  icon,
  tone,
  label,
  value,
  sub,
}: {
  loading: boolean;
  icon: React.ReactNode;
  tone: Tone;
  label: string;
  value: string;
  sub?: string;
}) {
  const bg: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-sky-50 text-sky-600",
    red: "bg-rose-50 text-rose-600",
    gray: "bg-slate-100 text-slate-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2.5">
        <span className={"grid h-9 w-9 place-items-center rounded-xl " + bg[tone]}>{icon}</span>
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-7 w-20" />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={"mt-3 text-2xl font-bold text-slate-900 " + tnum}>
          {value}
        </motion.div>
      )}
      {sub && !loading && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </Card>
  );
}

function DRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <span className="shrink-0 text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-800">{value}</span>
    </div>
  );
}
