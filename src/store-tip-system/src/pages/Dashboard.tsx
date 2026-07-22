import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Coins, TrendingUp, Hash, Heart, Wallet, ArrowRight, Trophy } from "lucide-react";
import { useStore } from "../store";
import { Avatar, Card, Pill, Skeleton } from "../components/ui";
import { useLoad } from "../lib/useLoad";
import { yen, whenLabel } from "../lib/format";
import {
  sum,
  todayTips,
  monthTips,
  pendingPayout,
  dailySeries,
  byStaff,
  byMethod,
} from "../lib/calc";

const METHOD_COLORS = [
  "oklch(61% 0.17 35)",
  "oklch(58% 0.13 250)",
  "oklch(60% 0.14 160)",
  "oklch(64% 0.15 90)",
  "oklch(60% 0.16 300)",
];

export default function Dashboard() {
  const tips = useStore((s) => s.tips);
  const staff = useStore((s) => s.staff);
  const loading = useLoad();

  const stats = useMemo(() => {
    const today = todayTips(tips);
    const month = monthTips(tips);
    return {
      todayTotal: sum(today),
      todayCount: today.length,
      monthTotal: sum(month),
      monthCount: month.length,
      avg: month.length ? Math.round(sum(month) / month.length) : 0,
      pending: pendingPayout(tips),
      series: dailySeries(tips, 14),
      ranking: byStaff(tips, staff).filter((r) => r.count > 0).slice(0, 5),
      methods: byMethod(month),
      recent: tips.slice(0, 8),
    };
  }, [tips, staff]);

  const staffById = useMemo(() => new Map(staff.map((s) => [s.id, s])), [staff]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">ダッシュボード</h1>
          <p className="mt-1 text-sm text-ink-500">お客様から届いたチップの受取状況と集計</p>
        </div>
        <Link
          to="/staff"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
        >
          スタッフ別の精算へ <ArrowRight size={16} />
        </Link>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Kpi
          loading={loading}
          icon={<Coins size={18} />}
          tone="brand"
          label="本日の受取"
          value={yen(stats.todayTotal)}
          sub={`${stats.todayCount} 件`}
        />
        <Kpi
          loading={loading}
          icon={<TrendingUp size={18} />}
          tone="green"
          label="今月の受取"
          value={yen(stats.monthTotal)}
          sub={`${stats.monthCount} 件`}
        />
        <Kpi
          loading={loading}
          icon={<Hash size={18} />}
          tone="violet"
          label="平均チップ額"
          value={yen(stats.avg)}
          sub="今月の1件あたり"
        />
        <Kpi
          loading={loading}
          icon={<Wallet size={18} />}
          tone="amber"
          label="精算待ち"
          value={yen(stats.pending)}
          sub="スタッフへ未精算"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* 受取推移 */}
        <Card className="min-w-0 lg:col-span-2">
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <h2 className="text-sm font-bold text-ink-900">受取推移(直近14日)</h2>
              <p className="text-xs text-ink-400">日次のチップ受取金額</p>
            </div>
            <Pill tone="brand">
              <Heart size={12} className="fill-heart-500 text-heart-500" /> 合計 {yen(sum(tips))}
            </Pill>
          </div>
          <div className="h-60 px-1 pb-3 pt-4">
            {loading ? (
              <div className="grid h-full place-items-center">
                <Skeleton className="h-40 w-[92%]" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.series} margin={{ top: 6, right: 16, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tipFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(61% 0.17 35)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="oklch(61% 0.17 35)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "oklch(58% 0.014 50)" }}
                    axisLine={false}
                    tickLine={false}
                    interval={1}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "oklch(58% 0.014 50)" }}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                    tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)}
                  />
                  <Tooltip
                    cursor={{ stroke: "oklch(86% 0.009 60)" }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid oklch(92% 0.007 60)",
                      fontSize: 12,
                      boxShadow: "0 8px 24px oklch(0% 0 0 / 0.08)",
                    }}
                    formatter={(v: number) => [yen(v), "受取"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="oklch(61% 0.17 35)"
                    strokeWidth={2.5}
                    fill="url(#tipFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* 決済手段内訳 */}
        <Card className="min-w-0">
          <div className="px-5 pt-5">
            <h2 className="text-sm font-bold text-ink-900">決済手段の内訳</h2>
            <p className="text-xs text-ink-400">今月の受取金額ベース</p>
          </div>
          {loading ? (
            <div className="grid h-56 place-items-center">
              <Skeleton className="h-32 w-32 rounded-full" />
            </div>
          ) : (
            <div className="flex flex-col items-center px-5 pb-5">
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.methods}
                      dataKey="total"
                      nameKey="method"
                      innerRadius={44}
                      outerRadius={66}
                      paddingAngle={2}
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {stats.methods.map((_, i) => (
                        <Cell key={i} fill={METHOD_COLORS[i % METHOD_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid oklch(92% 0.007 60)", fontSize: 12 }}
                      formatter={(v: number, n) => [yen(v), n as string]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 w-full space-y-1.5">
                {stats.methods.map((m, i) => (
                  <div key={m.method} className="flex items-center gap-2 text-xs">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: METHOD_COLORS[i % METHOD_COLORS.length] }}
                    />
                    <span className="text-ink-600">{m.method}</span>
                    <span className="tnum ml-auto font-medium text-ink-800">{yen(m.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* スタッフ・ランキング */}
        <Card className="min-w-0 lg:col-span-2">
          <div className="flex items-center gap-2 px-5 pt-5">
            <Trophy size={16} className="text-brand-500" />
            <h2 className="text-sm font-bold text-ink-900">スタッフ別ランキング</h2>
          </div>
          <div className="divide-y divide-ink-100 px-2 py-2">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="ml-auto h-4 w-16" />
                  </div>
                ))
              : stats.ranking.map((r, i) => (
                  <div key={r.staff.id} className="flex items-center gap-3 px-3 py-2.5">
                    <span
                      className={
                        "tnum grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold " +
                        (i === 0
                          ? "bg-amber-100 text-amber-700"
                          : i === 1
                            ? "bg-ink-200 text-ink-700"
                            : i === 2
                              ? "bg-brand-100 text-brand-700"
                              : "text-ink-400")
                      }
                    >
                      {i + 1}
                    </span>
                    <Avatar name={r.staff.name} color={r.staff.color} size={34} />
                    <div className="min-w-0 leading-tight">
                      <div className="truncate text-sm font-semibold text-ink-800">{r.staff.name}</div>
                      <div className="text-[11px] text-ink-400">
                        {r.staff.role} · {r.count} 件
                      </div>
                    </div>
                    <div className="tnum ml-auto text-sm font-bold text-ink-900">{yen(r.total)}</div>
                  </div>
                ))}
          </div>
        </Card>

        {/* 最近の受取 */}
        <Card className="min-w-0 lg:col-span-3">
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 className="text-sm font-bold text-ink-900">最近の受取</h2>
            <Pill tone="heart">
              <Heart size={11} className="fill-heart-500 text-heart-500" /> リアルタイム
            </Pill>
          </div>
          <div className="divide-y divide-ink-100 px-2 py-2">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))
              : stats.recent.map((t) => {
                  const s = staffById.get(t.staffId);
                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 px-3 py-3"
                    >
                      <Avatar name={s?.name ?? "?"} color={s?.color} size={36} />
                      <div className="min-w-0 flex-1 leading-tight">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-ink-800">{s?.name}</span>
                          <span className="text-[11px] text-ink-400">← {t.from}</span>
                        </div>
                        {t.message ? (
                          <div className="mt-0.5 truncate text-xs text-ink-500">「{t.message}」</div>
                        ) : (
                          <div className="mt-0.5 text-xs text-ink-300">メッセージなし</div>
                        )}
                        <div className="mt-0.5 text-[11px] text-ink-400">
                          {whenLabel(t.at)} · {t.method}
                        </div>
                      </div>
                      <div className="tnum shrink-0 text-sm font-bold text-brand-700">{yen(t.amount)}</div>
                    </motion.div>
                  );
                })}
          </div>
        </Card>
      </div>
    </div>
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
  tone: "brand" | "green" | "violet" | "amber";
  label: string;
  value: string;
  sub: string;
}) {
  const toneCls: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600",
    green: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className={"grid h-8 w-8 place-items-center rounded-lg " + toneCls[tone]}>{icon}</span>
        <span className="text-xs font-medium text-ink-500">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-7 w-24" />
      ) : (
        <div className="tnum mt-2.5 text-xl font-bold text-ink-900 sm:text-2xl">{value}</div>
      )}
      <div className="mt-0.5 text-[11px] text-ink-400">{sub}</div>
    </Card>
  );
}
