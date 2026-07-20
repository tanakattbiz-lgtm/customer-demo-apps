import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  Wallet,
  Target,
  Handshake,
  Users2,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  Filter,
} from "lucide-react";
import { useStore, repOf } from "../store";
import PageHeader from "../components/PageHeader";
import { Card, Skeleton, Progress, Avatar } from "../components/ui";
import { useLoad } from "../lib/useLoad";
import { yen, man, pct } from "../lib/format";
import {
  sumKpi,
  inMonth,
  visibleReports,
  deltaPct,
  dailySeries,
  memberRanking,
  recentMonths,
  monthLabel,
  type Kpi,
} from "../lib/metrics";

const BRAND = "oklch(54% 0.19 270)";

export default function Dashboard() {
  const navigate = useNavigate();
  const reports = useStore((s) => s.reports);
  const reps = useStore((s) => s.reps);
  const currentUserId = useStore((s) => s.currentUserId);
  const me = repOf(reps, currentUserId);
  const isAdmin = me?.role === "管理者";

  const months = useMemo(() => recentMonths(6), []);
  const [monthKeyStr, setMonthKeyStr] = useState(months[0].key);
  const loading = useLoad([monthKeyStr, currentUserId]);

  const scoped = useMemo(() => visibleReports(reports, me), [reports, me]);

  const cur = useMemo(() => sumKpi(inMonth(scoped, monthKeyStr)), [scoped, monthKeyStr]);
  const prevKey = months[months.findIndex((m) => m.key === monthKeyStr) + 1]?.key;
  const prev = useMemo(
    () => (prevKey ? sumKpi(inMonth(scoped, prevKey)) : null),
    [scoped, prevKey],
  );

  const series = useMemo(() => dailySeries(scoped, monthKeyStr), [scoped, monthKeyStr]);
  const ranking = useMemo(
    () => memberRanking(reports, reps, monthKeyStr),
    [reports, reps, monthKeyStr],
  );

  // 目標:管理者は全社員の目標合計、社員は自分の目標
  const target = isAdmin
    ? reps.filter((r) => r.role === "社員").reduce((a, r) => a + r.monthlyTarget, 0)
    : me?.monthlyTarget ?? 0;
  const achieveRate = target > 0 ? (cur.amount / target) * 100 : 0;

  return (
    <div>
      <PageHeader
        title="ダッシュボード"
        subtitle={
          isAdmin
            ? "全営業メンバーの受注・KPI をリアルタイムに集計しています。"
            : `${me?.name} さんの営業実績サマリーです。`
        }
        actions={
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-ink-400" />
            <select
              value={monthKeyStr}
              onChange={(e) => setMonthKeyStr(e.target.value)}
              className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 outline-none focus:border-brand-400"
            >
              {months.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* ---- KPI カード ---- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          loading={loading}
          icon={<Wallet size={18} />}
          label="受注金額"
          value={yen(cur.amount)}
          delta={prev ? deltaPct(cur.amount, prev.amount) : null}
          tone="brand"
        />
        <KpiCard
          loading={loading}
          icon={<Target size={18} />}
          label="目標達成率"
          value={`${Math.round(achieveRate)}%`}
          sub={`目標 ${man(target)}`}
          progress={achieveRate}
          tone="green"
        />
        <KpiCard
          loading={loading}
          icon={<Handshake size={18} />}
          label="受注件数"
          value={`${cur.deals} 件`}
          delta={prev ? deltaPct(cur.deals, prev.deals) : null}
          tone="violet"
        />
        <KpiCard
          loading={loading}
          icon={<Users2 size={18} />}
          label="商談件数"
          value={`${cur.meetings} 件`}
          delta={prev ? deltaPct(cur.meetings, prev.meetings) : null}
          tone="amber"
        />
      </div>

      {/* ---- 推移グラフ ---- */}
      <div className={"mt-4 grid gap-4 " + (isAdmin ? "lg:grid-cols-5" : "lg:grid-cols-3")}>
        <Card className={"p-5 " + (isAdmin ? "lg:col-span-3" : "lg:col-span-2")}>
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink-800">受注金額の推移(累計)</h2>
            <span className="text-xs text-ink-400">{monthLabel(monthKeyStr)}</span>
          </div>
          <p className="mb-3 text-xs text-ink-400">日次の受注金額と月内の累計を表示します。</p>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={256}>
              <AreaChart data={series} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillCum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={BRAND} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(92% 0.007 275)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "oklch(58% 0.014 275)" }}
                  interval={4}
                  tickLine={false}
                  axisLine={{ stroke: "oklch(92% 0.007 275)" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(58% 0.014 275)" }}
                  tickFormatter={(v) => (v === 0 ? "0" : man(v))}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <Tooltip content={<ChartTip />} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  name="累計受注金額"
                  stroke={BRAND}
                  strokeWidth={2.4}
                  fill="url(#fillCum)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* ---- ファネル ---- */}
        <Card className={"p-5 " + (isAdmin ? "lg:col-span-2" : "lg:col-span-1")}>
          <h2 className="mb-1 text-sm font-bold text-ink-800">商談ファネル</h2>
          <p className="mb-4 text-xs text-ink-400">訪問から受注までの転換状況。</p>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Funnel kpi={cur} />
          )}
        </Card>
      </div>

      {/* ---- メンバー別ランキング(管理者のみ) ---- */}
      {isAdmin && (
        <Card className="mt-4 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Trophy size={17} className="text-brand-500" />
            <h2 className="text-sm font-bold text-ink-800">メンバー別 受注金額ランキング</h2>
            <span className="ml-auto text-xs text-ink-400">目標達成率つき</span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
              <ResponsiveContainer width="100%" height={Math.max(200, ranking.length * 44)}>
                <BarChart
                  data={ranking.map((r) => ({ name: r.rep.name, amount: r.amount }))}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(92% 0.007 275)" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => (v === 0 ? "0" : man(v))}
                    tick={{ fontSize: 11, fill: "oklch(58% 0.014 275)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "oklch(38% 0.016 279)" }}
                    tickLine={false}
                    axisLine={false}
                    width={72}
                  />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "oklch(96% 0.005 275)" }} />
                  <Bar dataKey="amount" name="受注金額" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {ranking.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? BRAND : "oklch(70% 0.14 272)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {ranking.map((r, i) => (
                  <div
                    key={r.rep.id}
                    className="flex items-center gap-3 rounded-xl border border-ink-100 px-3 py-2"
                  >
                    <span className="tnum w-5 text-center text-sm font-bold text-ink-400">{i + 1}</span>
                    <Avatar name={r.rep.name} color={r.rep.color} size={30} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-sm font-medium text-ink-800">{r.rep.name}</span>
                        <span className="tnum text-xs font-semibold text-ink-700">{man(r.amount)}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Progress pct={r.rate} tone={r.rate >= 100 ? "green" : r.rate >= 60 ? "brand" : "amber"} />
                        <span className="tnum w-10 shrink-0 text-right text-[11px] text-ink-400">
                          {Math.round(r.rate)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-ink-200 bg-white px-5 py-4">
        <div className="text-sm text-ink-500">
          {isAdmin ? "各メンバーの日報・売上の明細を確認できます。" : "日報の入力・過去の実績はこちらから。"}
        </div>
        <button
          onClick={() => navigate("/reports")}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          日報・売上を開く <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ---------------- KPI Card ----------------
function KpiCard({
  loading,
  icon,
  label,
  value,
  sub,
  delta,
  progress,
  tone,
}: {
  loading: boolean;
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  delta?: number | null;
  progress?: number;
  tone: "brand" | "green" | "violet" | "amber";
}) {
  const toneCls: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600",
    green: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <Card className="p-4">
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className={"grid h-9 w-9 place-items-center rounded-xl " + toneCls[tone]}>{icon}</div>
            {typeof delta === "number" && (
              <span
                className={
                  "inline-flex items-center gap-0.5 text-xs font-semibold " +
                  (delta >= 0 ? "text-emerald-600" : "text-rose-500")
                }
              >
                {delta >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {pct(Math.abs(delta) === 0 ? 0 : delta)}
              </span>
            )}
          </div>
          <div className="mt-3 text-xs font-medium text-ink-500">{label}</div>
          <div className="tnum mt-0.5 text-xl font-bold text-ink-900">{value}</div>
          {typeof progress === "number" && (
            <div className="mt-2">
              <Progress pct={progress} tone={progress >= 100 ? "green" : "brand"} />
            </div>
          )}
          {sub && <div className="mt-1 text-[11px] text-ink-400">{sub}</div>}
          {typeof delta === "number" && !sub && (
            <div className="mt-1 text-[11px] text-ink-400">前月比</div>
          )}
        </>
      )}
    </Card>
  );
}

// ---------------- Funnel ----------------
function Funnel({ kpi }: { kpi: Kpi }) {
  const stages = [
    { label: "訪問", value: kpi.visits, tone: "bg-brand-200 text-brand-800" },
    { label: "商談", value: kpi.meetings, tone: "bg-brand-300 text-brand-900" },
    { label: "提案", value: kpi.proposals, tone: "bg-brand-400 text-white" },
    { label: "受注", value: kpi.deals, tone: "bg-brand-600 text-white" },
  ];
  const max = Math.max(1, kpi.visits);
  return (
    <div className="space-y-2.5">
      {stages.map((s, i) => {
        const prev = i === 0 ? s.value : stages[i - 1].value;
        const conv = prev > 0 ? Math.round((s.value / prev) * 100) : 0;
        return (
          <div key={s.label}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-ink-600">{s.label}</span>
              <span className="tnum text-ink-500">
                {s.value} 件{i > 0 && <span className="ml-1 text-ink-400">(転換 {conv}%)</span>}
              </span>
            </div>
            <div className="mt-1 h-8 w-full overflow-hidden rounded-lg bg-ink-100">
              <div
                className={"flex h-full items-center rounded-lg px-2 text-xs font-semibold transition-[width] duration-700 " + s.tone}
                style={{ width: `${Math.max(8, (s.value / max) * 100)}%` }}
              >
                {s.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------- Chart Tooltip ----------------
function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs shadow-lg">
      <div className="mb-1 font-semibold text-ink-700">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="tnum text-ink-600">
          {p.name}:<span className="ml-1 font-semibold text-ink-900">{yen(p.value)}</span>
        </div>
      ))}
    </div>
  );
}
