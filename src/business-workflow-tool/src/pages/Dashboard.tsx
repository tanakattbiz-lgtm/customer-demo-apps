import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { format, isSameDay, parseISO, subDays } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, CheckCircle2, ChevronRight, Timer, TrendingUp } from "lucide-react";
import { useStore } from "../store";
import { CATEGORIES, STAFF, STATUS_LABEL, STATUS_TONE, type Status } from "../data/seed";
import { useLoad } from "../lib/fakeApi";
import { Avatar, Card, Pill, Skeleton, StatusDot } from "../components/ui";

const today = () => new Date().toISOString().slice(0, 10);

const AXIS = { fontSize: 11, fill: "oklch(58% 0.014 265)" };
const GRID = "oklch(92% 0.007 265)";
const BRAND = "oklch(51% 0.16 264)";
const BRAND_SOFT = "oklch(79% 0.09 264)";

function Tile({
  label,
  value,
  unit,
  icon,
  tone = "ink",
  sub,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  tone?: "ink" | "amber" | "rose" | "emerald";
  sub?: string;
}) {
  const toneCls = {
    ink: "bg-brand-50 text-brand-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    emerald: "bg-emerald-50 text-emerald-600",
  }[tone];
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-ink-500">{label}</span>
        <span className={"grid h-7 w-7 place-items-center rounded-lg " + toneCls}>{icon}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="tnum text-2xl font-bold text-ink-900">{value}</span>
        {unit && <span className="text-xs font-medium text-ink-500">{unit}</span>}
      </div>
      {sub && <div className="mt-1 text-[11px] text-ink-400">{sub}</div>}
    </Card>
  );
}

function ChartTip({
  active,
  payload,
  label,
  unit = "件",
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string | number;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-ink-200 bg-white px-3 py-2 shadow-sm">
      <div className="text-xs font-medium text-ink-700">{label}</div>
      <div className="tnum text-sm font-bold text-ink-900">
        {payload[0].value}
        {unit}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const loading = useLoad(620);
  const jobs = useStore((s) => s.jobs);

  const kpi = useMemo(() => {
    const open = jobs.filter((j) => j.status !== "done");
    const overdue = open.filter((j) => j.dueDate < today());
    const done = jobs.filter((j) => j.status === "done");
    const savedHours = done.reduce((a, j) => a + Math.max(0, j.estimateHours - j.actualHours), 0);
    const rate = jobs.length ? Math.round((done.length / jobs.length) * 100) : 0;
    return {
      open: open.length,
      overdue: overdue.length,
      done: done.length,
      rate,
      savedHours: Math.round(savedHours * 10) / 10,
    };
  }, [jobs]);

  const byStatus = useMemo(() => {
    const order: Status[] = ["todo", "doing", "review", "done", "hold"];
    return order.map((s) => ({
      status: s,
      label: STATUS_LABEL[s],
      count: jobs.filter((j) => j.status === s).length,
    }));
  }, [jobs]);

  const byCategory = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        name: c,
        件数: jobs.filter((j) => j.category === c).length,
      })),
    [jobs],
  );

  // 直近14日の完了件数推移（履歴の最終更新日を完了日とみなす）
  const trend = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => subDays(new Date(), 13 - i));
    return days.map((d) => ({
      name: format(d, "M/d"),
      件数: jobs.filter((j) => {
        if (j.status !== "done") return false;
        const last = j.history[j.history.length - 1];
        return last ? isSameDay(parseISO(last.at), d) : false;
      }).length,
    }));
  }, [jobs]);

  const workload = useMemo(
    () =>
      STAFF.map((s) => {
        const mine = jobs.filter(
          (j) => j.assigneeId === s.id && j.status !== "done" && j.status !== "hold",
        );
        return {
          staff: s,
          count: mine.length,
          hours: Math.round(mine.reduce((a, j) => a + j.estimateHours, 0) * 10) / 10,
          late: mine.filter((j) => j.dueDate < today()).length,
        };
      }).sort((a, b) => b.hours - a.hours),
    [jobs],
  );

  const maxHours = Math.max(1, ...workload.map((w) => w.hours));

  const attention = useMemo(
    () =>
      jobs
        .filter((j) => j.status !== "done" && (j.dueDate < today() || j.priority === "high"))
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 5),
    [jobs],
  );

  if (loading) {
    return (
      <div className="mx-auto grid max-w-6xl gap-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="mx-auto max-w-6xl"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink-900">ダッシュボード</h1>
        <p className="mt-1 text-sm text-ink-500">
          {format(new Date(), "yyyy年M月d日")}時点・全 {jobs.length} 件の集計
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          label="対応中の案件"
          value={kpi.open}
          unit="件"
          icon={<Timer size={15} />}
          sub={`完了 ${kpi.done} 件 / 全 ${jobs.length} 件`}
        />
        <Tile
          label="期限超過"
          value={kpi.overdue}
          unit="件"
          tone={kpi.overdue > 0 ? "rose" : "emerald"}
          icon={<AlertTriangle size={15} />}
          sub={kpi.overdue > 0 ? "至急の確認が必要です" : "超過はありません"}
        />
        <Tile
          label="完了率"
          value={kpi.rate}
          unit="%"
          tone="emerald"
          icon={<CheckCircle2 size={15} />}
          sub="登録済み案件に対する割合"
        />
        <Tile
          label="工数削減（見積比）"
          value={kpi.savedHours}
          unit="h"
          tone="amber"
          icon={<TrendingUp size={15} />}
          sub="完了案件の見積 − 実績の合計"
        />
      </div>

      {/* ステータス内訳 */}
      <Card className="mt-5 p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink-800">ステータス内訳</h2>
        <div className="flex h-2 overflow-hidden rounded-full bg-ink-100">
          {byStatus.map((s) => {
            const pct = jobs.length ? (s.count / jobs.length) * 100 : 0;
            const bg: Record<string, string> = {
              gray: "bg-ink-300",
              blue: "bg-brand-500",
              amber: "bg-amber-400",
              green: "bg-emerald-500",
              red: "bg-rose-400",
            };
            return (
              <div
                key={s.status}
                className={"transition-[width] duration-500 " + bg[STATUS_TONE[s.status]]}
                style={{ width: `${pct}%` }}
              />
            );
          })}
        </div>
        <div className="mt-3.5 flex flex-wrap gap-x-5 gap-y-2">
          {byStatus.map((s) => (
            <Link
              key={s.status}
              to="/"
              className="flex items-center gap-1.5 text-xs text-ink-600 transition hover:text-ink-900"
            >
              <StatusDot tone={STATUS_TONE[s.status]} />
              {s.label}
              <span className="tnum font-semibold text-ink-900">{s.count}</span>
            </Link>
          ))}
        </div>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* 分類別 */}
        <Card className="p-5">
          <h2 className="mb-1 text-sm font-semibold text-ink-800">分類別の案件件数</h2>
          <p className="mb-4 text-xs text-ink-400">どの業務に依頼が集中しているかを把握します</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid horizontal={false} stroke={GRID} />
                <XAxis type="number" allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={104}
                  tick={AXIS}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTip />} cursor={{ fill: "oklch(96% 0.005 265)" }} />
                <Bar dataKey="件数" radius={[0, 4, 4, 0]} barSize={14}>
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? BRAND : BRAND_SOFT} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 完了推移 */}
        <Card className="p-5">
          <h2 className="mb-1 text-sm font-semibold text-ink-800">完了件数の推移（直近14日）</h2>
          <p className="mb-4 text-xs text-ink-400">処理のペースと滞留の兆候を確認します</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} stroke={GRID} />
                <XAxis tick={AXIS} dataKey="name" axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={AXIS} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Line
                  type="monotone"
                  dataKey="件数"
                  stroke={BRAND}
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: BRAND, strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* 担当者別 */}
        <Card className="p-5">
          <h2 className="mb-1 text-sm font-semibold text-ink-800">担当者別の負荷</h2>
          <p className="mb-4 text-xs text-ink-400">進行中案件の見積工数の合計</p>
          <div className="grid gap-3.5">
            {workload.map((w) => (
              <div key={w.staff.id} className="flex items-center gap-3">
                <Avatar name={w.staff.name} color={w.staff.color} size={28} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-xs font-medium text-ink-800">{w.staff.name}</span>
                    <span className="tnum shrink-0 text-xs text-ink-500">
                      {w.count}件・{w.hours}h
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-[width] duration-500"
                      style={{ width: `${Math.max(2, (w.hours / maxHours) * 100)}%` }}
                    />
                  </div>
                </div>
                {w.late > 0 && (
                  <Pill tone="red" className="shrink-0">
                    超過{w.late}
                  </Pill>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* 要対応 */}
        <Card className="overflow-hidden">
          <div className="px-5 pb-4 pt-5">
            <h2 className="mb-1 text-sm font-semibold text-ink-800">要対応の案件</h2>
            <p className="text-xs text-ink-400">期限超過・優先度が高い案件</p>
          </div>
          {attention.length ? (
            <div className="divide-y divide-ink-100 border-t border-ink-100">
              {attention.map((j) => {
                const late = j.dueDate < today();
                return (
                  <Link
                    key={j.id}
                    to={`/jobs/${j.id}`}
                    className="flex items-center gap-3 px-5 py-3 transition duration-150 hover:bg-ink-50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-ink-900">{j.title}</div>
                      <div className="tnum mt-0.5 text-[11px] text-ink-400">
                        {j.code}・期限 {format(parseISO(j.dueDate), "M/d")}
                      </div>
                    </div>
                    {late ? (
                      <Pill tone="red">期限超過</Pill>
                    ) : (
                      <Pill tone="amber">優先度 高</Pill>
                    )}
                    <ChevronRight size={15} className="shrink-0 text-ink-300" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="border-t border-ink-100 px-5 py-10 text-center text-xs text-ink-400">
              要対応の案件はありません
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  );
}
