import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Eye, Users, MousePointerClick, Target, ArrowRight, Sparkles } from "lucide-react";
import { useStore } from "../store";
import { useLoad } from "../lib/fakeApi";
import { week, month, growth, evalKpis, type KpiEval } from "../lib/analytics";
import { num, compact, pct, md } from "../lib/format";
import { Card, Skeleton, Delta, Progress, Pill } from "../components/ui";

export default function Dashboard() {
  const loading = useLoad(560);
  const metrics = useStore((s) => s.metrics);
  const channels = useStore((s) => s.channels);
  const kpis = useStore((s) => s.kpis);
  const [range, setRange] = useState<7 | 28>(7);

  const w = useMemo(() => week(metrics), [metrics]);
  const m = useMemo(() => month(metrics), [metrics]);
  const cur = range === 7 ? w : m;

  const kpiEvals = useMemo(() => evalKpis(metrics, channels, kpis), [metrics, channels, kpis]);

  const chartData = useMemo(
    () =>
      metrics.slice(-30).map((d) => ({
        date: md(d.date),
        ユーザー: d.users,
        CV: d.conversions,
      })),
    [metrics],
  );

  const totalChannelUsers = channels.reduce((a, c) => a + c.users, 0);

  const cards = [
    {
      key: "pv",
      label: "ページビュー",
      icon: Eye,
      value: compact(cur.cur.pv),
      raw: num(cur.cur.pv),
      d: growth(cur.cur.pv, cur.prev.pv),
    },
    {
      key: "users",
      label: "ユーザー数",
      icon: Users,
      value: compact(cur.cur.users),
      raw: num(cur.cur.users),
      d: growth(cur.cur.users, cur.prev.users),
    },
    {
      key: "cv",
      label: "コンバージョン",
      icon: MousePointerClick,
      value: num(cur.cur.conversions),
      raw: num(cur.cur.conversions) + " 件",
      d: growth(cur.cur.conversions, cur.prev.conversions),
    },
    {
      key: "cvr",
      label: "コンバージョン率",
      icon: Target,
      value: pct(cur.cur.cvr),
      raw: pct(cur.cur.cvr, 2),
      d: growth(cur.cur.cvr, cur.prev.cvr),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-900">ダッシュボード</h1>
          <p className="mt-0.5 text-sm text-ink-500">
            ○○株式会社 コーポレートサイト・GA4 の主要指標を自動集計しています
          </p>
        </div>
        <div className="inline-flex rounded-xl border border-ink-200 bg-white p-0.5 text-sm font-medium">
          {([7, 28] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={
                "rounded-lg px-3.5 py-1.5 transition " +
                (range === r ? "bg-brand-600 text-white shadow-sm" : "text-ink-500 hover:text-ink-800")
              }
            >
              {r === 7 ? "直近7日" : "直近28日"}
            </button>
          ))}
        </div>
      </div>

      {/* 指標カード */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-3 h-8 w-24" />
                <Skeleton className="mt-3 h-3 w-16" />
              </Card>
            ))
          : cards.map((c) => (
              <Card key={c.key} className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-500">{c.label}</span>
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-500">
                    <c.icon size={15} />
                  </span>
                </div>
                <div className="tnum mt-2 text-2xl font-bold text-ink-900">{c.value}</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <Delta value={c.d} />
                  <span className="text-[11px] text-ink-400">
                    {range === 7 ? "前週比" : "前月比"}
                  </span>
                </div>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 推移グラフ */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-ink-900">ユーザー数・CVの推移</h2>
              <p className="text-xs text-ink-400">直近30日</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <LegendDot color="oklch(62% 0.17 272)" label="ユーザー" />
              <LegendDot color="oklch(74% 0.16 62)" label="CV" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 6, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(62% 0.17 272)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="oklch(62% 0.17 272)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gCv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(74% 0.16 62)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="oklch(74% 0.16 62)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(92.5% 0.006 275)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "oklch(58% 0.014 275)" }}
                    interval={5}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="l"
                    tick={{ fontSize: 11, fill: "oklch(58% 0.014 275)" }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    tickFormatter={(v: number) => compact(v)}
                  />
                  <YAxis yAxisId="r" orientation="right" hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid oklch(92.5% 0.006 275)",
                      fontSize: 12,
                      boxShadow: "0 8px 24px oklch(0% 0 0 / 0.08)",
                    }}
                    formatter={(v: number) => num(v)}
                  />
                  <Area
                    yAxisId="l"
                    type="monotone"
                    dataKey="ユーザー"
                    stroke="oklch(62% 0.17 272)"
                    strokeWidth={2}
                    fill="url(#gUsers)"
                    isAnimationActive={false}
                    dot={false}
                  />
                  <Area
                    yAxisId="r"
                    type="monotone"
                    dataKey="CV"
                    stroke="oklch(74% 0.16 62)"
                    strokeWidth={2}
                    fill="url(#gCv)"
                    isAnimationActive={false}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* チャネル内訳 */}
        <Card className="p-5">
          <h2 className="text-sm font-bold text-ink-900">流入チャネル</h2>
          <p className="text-xs text-ink-400">直近28日・ユーザー構成比</p>
          {loading ? (
            <Skeleton className="mt-4 h-56 w-full" />
          ) : (
            <>
              <div className="mx-auto mt-2 h-36 w-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channels}
                      dataKey="users"
                      nameKey="label"
                      innerRadius={44}
                      outerRadius={62}
                      paddingAngle={2}
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {channels.map((c) => (
                        <Cell key={c.key} fill={c.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid oklch(92.5% 0.006 275)", fontSize: 12 }}
                      formatter={(v: number) => num(v) + " 人"}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-2">
                {channels.map((c) => (
                  <div key={c.key} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                    <span className="text-ink-600">{c.label}</span>
                    <span className="tnum ml-auto font-medium text-ink-800">
                      {pct(c.users / totalChannelUsers, 0)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* KPI 進捗 */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink-900">KPI 進捗(月次目標に対する達成度)</h2>
            <p className="text-xs text-ink-400">直近28日の実績 / 目標値は設定画面で変更できます</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
            : kpiEvals.map((k) => <KpiRow key={k.kpi.id} k={k} />)}
        </div>
      </Card>

      {/* 改善提案への導線 */}
      <Card className="flex flex-col items-start gap-3 border-brand-200 bg-brand-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
            <Sparkles size={18} />
          </span>
          <div>
            <div className="text-sm font-bold text-ink-900">AI が今週の改善提案をまとめました</div>
            <div className="text-xs text-ink-500">
              データの要約・KPI評価・具体的な打ち手を確認し、Google Chat へ通知できます
            </div>
          </div>
        </div>
        <Link
          to="/report"
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          レポートを見る
          <ArrowRight size={16} />
        </Link>
      </Card>
    </div>
  );
}

function KpiRow({ k }: { k: KpiEval }) {
  const tone = k.status === "達成" ? "green" : k.status === "順調" ? "brand" : "amber";
  const val =
    k.kpi.metric === "cvr" || k.kpi.metric === "organicRatio"
      ? k.value.toFixed(1) + k.kpi.unit
      : num(k.value) + k.kpi.unit;
  return (
    <div className="rounded-xl border border-ink-100 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-700">{k.kpi.label}</span>
        <Pill tone={tone as "green" | "brand" | "amber"}>{k.status}</Pill>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="tnum text-lg font-bold text-ink-900">{val}</span>
        <span className="tnum text-xs text-ink-400">
          目標 {k.kpi.metric === "cvr" || k.kpi.metric === "organicRatio" ? k.kpi.target : num(k.kpi.target)}
          {k.kpi.unit}
        </span>
      </div>
      <div className="mt-2">
        <Progress pct={k.ratio * 100} tone={tone as "green" | "brand" | "amber"} />
      </div>
      <div className="tnum mt-1 text-right text-[11px] font-semibold text-ink-500">
        達成率 {Math.round(k.ratio * 100)}%
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-ink-500">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
