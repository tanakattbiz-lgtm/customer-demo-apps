import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Ship,
  AlertTriangle,
  CalendarClock,
  BellRing,
  ChevronRight,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { useStore } from "../store/useStore";
import { Card, Pill, Progress, Skeleton, Avatar, StatusDot } from "../components/ui";
import PageHeader from "../components/PageHeader";
import { useLoad } from "../lib/useLoad";
import {
  voyageStatus,
  progressPct,
  currentItem,
  overdueItems,
  dueSoonItems,
  needsAttention,
  STATUS_TONE,
} from "../lib/voyage";
import { fromNow, yen } from "../lib/format";
import { shipperById, staffById } from "../data/seed";

const ALERT_TONE: Record<string, string> = {
  高: "red",
  中: "amber",
  低: "gray",
};

export default function Dashboard() {
  const loading = useLoad();
  const voyages = useStore((s) => s.voyages);
  const alerts = useStore((s) => s.alerts);
  const shippers = useStore((s) => s.shippers);
  const staff = useStore((s) => s.staff);

  const stats = useMemo(() => {
    const now = new Date();
    let active = 0,
      attention = 0,
      dueToday = 0,
      completed = 0;
    const dist: Record<string, number> = { 順調: 0, 要注意: 0, 遅延: 0, 不備: 0, 完了: 0 };
    for (const v of voyages) {
      const s = voyageStatus(v, now);
      dist[s] += 1;
      if (s === "完了") completed += 1;
      else active += 1;
      if (needsAttention(v, now)) attention += 1;
      if (dueSoonItems(v, now).length > 0 || overdueItems(v, now).length > 0) dueToday += 1;
    }
    return { active, attention, dueToday, completed, dist };
  }, [voyages]);

  const unread = alerts.filter((a) => a.status === "未確認").length;

  const attentionList = useMemo(
    () =>
      voyages
        .filter((v) => needsAttention(v))
        .sort((a, b) => {
          const order = { 不備: 0, 遅延: 1, 要注意: 2 } as Record<string, number>;
          return (order[voyageStatus(a)] ?? 9) - (order[voyageStatus(b)] ?? 9);
        })
        .slice(0, 6),
    [voyages],
  );

  const recentAlerts = alerts.slice(0, 6);

  const chartData = useMemo(
    () =>
      [
        { name: "順調", v: stats.dist["順調"], c: "oklch(62% 0.14 155)" },
        { name: "要注意", v: stats.dist["要注意"], c: "oklch(75% 0.15 80)" },
        { name: "遅延", v: stats.dist["遅延"], c: "oklch(63% 0.2 25)" },
        { name: "不備", v: stats.dist["不備"], c: "oklch(58% 0.2 15)" },
        { name: "完了", v: stats.dist["完了"], c: "oklch(70% 0.01 240)" },
      ],
    [stats],
  );

  return (
    <>
      <PageHeader
        title="ダッシュボード"
        subtitle="受注した配船案件の進捗をリアルタイムに監視しています。"
      />

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Kpi loading={loading} icon={<Ship size={18} />} tone="brand" label="進行中の案件" value={stats.active} unit="件" />
        <Kpi loading={loading} icon={<AlertTriangle size={18} />} tone="red" label="要対応(不備・遅延)" value={stats.attention} unit="件" />
        <Kpi loading={loading} icon={<CalendarClock size={18} />} tone="amber" label="期日が迫る案件" value={stats.dueToday} unit="件" />
        <Kpi loading={loading} icon={<BellRing size={18} />} tone="brand" label="未確認アラート" value={unread} unit="件" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* 要対応の案件 */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink-800">
              <AlertTriangle size={16} className="text-rose-500" />
              要対応の案件
            </h2>
            <Link to="/voyages" className="flex items-center gap-0.5 text-xs font-medium text-brand-600 hover:text-brand-700">
              すべて見る <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-ink-100">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-2/5" />
                    <Skeleton className="h-2.5 w-1/4" />
                  </div>
                </div>
              ))
            ) : attentionList.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-ink-400">
                現在、対応が必要な案件はありません。すべて順調に進行しています。
              </div>
            ) : (
              attentionList.map((v) => {
                const s = voyageStatus(v);
                const sh = shipperById(shippers, v.shipperId);
                const cur = currentItem(v);
                const pct = progressPct(v);
                return (
                  <Link
                    key={v.id}
                    to={`/voyages/${v.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-ink-50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Pill tone={STATUS_TONE[s] as never}>
                          <StatusDot tone={STATUS_TONE[s] as never} />
                          {s}
                        </Pill>
                        <span className="tnum text-xs text-ink-400">{v.code}</span>
                        {v.priority === "高" && <Pill tone="red">優先度 高</Pill>}
                      </div>
                      <div className="mt-1 truncate text-sm font-medium text-ink-800">
                        {sh?.name} — {v.cargo} / {v.cargoDetail}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-ink-400">
                        {v.loadPort} → {v.dischargePort}・現在: {cur?.label ?? "—"}
                      </div>
                    </div>
                    <div className="hidden w-28 shrink-0 sm:block">
                      <div className="mb-1 flex justify-between text-[11px] text-ink-400">
                        <span>進捗</span>
                        <span className="tnum">{pct}%</span>
                      </div>
                      <Progress pct={pct} tone={s === "遅延" || s === "不備" ? "red" : "amber"} />
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-ink-300" />
                  </Link>
                );
              })
            )}
          </div>
        </Card>

        {/* ステータス内訳 + ライブアラート */}
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-800">
              <Activity size={16} className="text-brand-500" />
              案件ステータス内訳
            </h2>
            {loading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "oklch(58% 0.014 240)" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "oklch(70% 0.012 240)" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: "oklch(96% 0.005 240)" }}
                      contentStyle={{ borderRadius: 12, border: "1px solid oklch(92% 0.007 240)", fontSize: 12 }}
                      formatter={(val) => [`${val} 件`, "案件数"]}
                    />
                    <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                      {chartData.map((d, i) => (
                        <Cell key={i} fill={d.c} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ライブアラート + 担当者 */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink-800">
              <span className="live-dot inline-block h-2 w-2 rounded-full bg-emerald-500" />
              ライブアラートフィード
            </h2>
            <Link to="/alerts" className="flex items-center gap-0.5 text-xs font-medium text-brand-600 hover:text-brand-700">
              アラート一覧 <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-ink-100">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5">
                  <Skeleton className="h-3 w-3/5" />
                </div>
              ))
            ) : recentAlerts.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-ink-400">アラートはありません。</div>
            ) : (
              recentAlerts.map((a) => (
                <Link key={a.id} to={`/voyages/${a.voyageId}`} className="flex items-start gap-3 px-5 py-3.5 transition hover:bg-ink-50">
                  <span className="mt-1.5">
                    <StatusDot tone={ALERT_TONE[a.severity] as never} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={ALERT_TONE[a.severity] as never}>{a.kind}</Pill>
                      <span className="tnum text-xs text-ink-400">{a.voyageCode}</span>
                      {a.status === "未確認" && <span className="text-[10px] font-bold text-rose-500">● 未確認</span>}
                    </div>
                    <div className="mt-1 line-clamp-2 text-sm text-ink-700">{a.message}</div>
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-[11px] text-ink-400">{fromNow(a.at)}</span>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink-800">
            担当者別の稼働
          </h2>
          <div className="space-y-3.5">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
              : staff
                  .filter((s) => s.team !== "管理部")
                  .map((s) => {
                    const mine = voyages.filter((v) => v.assigneeId === s.id && voyageStatus(v) !== "完了");
                    const risk = mine.filter((v) => needsAttention(v)).length;
                    return (
                      <div key={s.id} className="flex items-center gap-3">
                        <Avatar name={s.name} color={s.color} size={30} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-ink-800">{s.name}</div>
                          <div className="text-[11px] text-ink-400">担当 {mine.length} 件</div>
                        </div>
                        {risk > 0 ? (
                          <Pill tone="red">要対応 {risk}</Pill>
                        ) : (
                          <Pill tone="green">順調</Pill>
                        )}
                      </div>
                    );
                  })}
          </div>
        </Card>
      </div>

      {/* 今月の受注(サマリ) */}
      <SummaryStrip loading={loading} voyages={voyages} shippers={shippers} staff={staff} />
    </>
  );
}

function Kpi({
  loading,
  icon,
  label,
  value,
  unit,
  tone,
}: {
  loading: boolean;
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  tone: "brand" | "red" | "amber";
}) {
  const bg: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600",
    red: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <Card className="p-4 sm:p-5">
      <div className={"mb-3 grid h-9 w-9 place-items-center rounded-xl " + bg[tone]}>{icon}</div>
      {loading ? (
        <Skeleton className="h-7 w-16" />
      ) : (
        <div className="flex items-baseline gap-1">
          <span className="tnum text-2xl font-bold text-ink-900 sm:text-3xl">{value}</span>
          <span className="text-sm text-ink-400">{unit}</span>
        </div>
      )}
      <div className="mt-0.5 text-xs text-ink-500">{label}</div>
    </Card>
  );
}

function SummaryStrip({
  loading,
  voyages,
  shippers,
  staff,
}: {
  loading: boolean;
  voyages: ReturnType<typeof useStore.getState>["voyages"];
  shippers: ReturnType<typeof useStore.getState>["shippers"];
  staff: ReturnType<typeof useStore.getState>["staff"];
}) {
  const totalFreight = voyages.reduce((a, v) => a + v.freight, 0);
  const recent = [...voyages].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)).slice(0, 3);
  return (
    <Card className="mt-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-ink-400">受注案件 総運賃(サンプル期間)</div>
          {loading ? <Skeleton className="mt-1 h-7 w-32" /> : <div className="tnum text-2xl font-bold text-ink-900">{yen(totalFreight)}</div>}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {recent.map((v) => {
            const sh = shipperById(shippers, v.shipperId);
            const st = staffById(staff, v.assigneeId);
            return (
              <div key={v.id} className="flex items-center gap-2 text-ink-500">
                <span className="tnum text-xs text-ink-400">{v.code}</span>
                <span className="text-ink-700">{sh?.name}</span>
                <span className="text-xs text-ink-400">担当 {st?.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
