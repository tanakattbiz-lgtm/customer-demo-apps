import { useMemo } from "react";
import { Link } from "react-router-dom";
import { format, subDays, isSameDay } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  FileCheck2,
  AlertTriangle,
  Timer,
  Layers,
  ArrowRight,
} from "lucide-react";
import { useStore } from "../store";
import { useLoad } from "../lib/fakeApi";
import { CATEGORIES, type Worksheet } from "../data/seed";
import { Skeleton, StatusBadge } from "../components/ui";

const STATUS_COLOR: Record<string, string> = {
  確定: "oklch(65% 0.16 155)",
  要確認: "oklch(75% 0.15 75)",
  下書き: "oklch(70% 0.01 250)",
};

function daysToDue(w: Worksheet): number | null {
  if (!w.dueDate) return null;
  return Math.round((new Date(w.dueDate).getTime() - Date.now()) / 86400000);
}

function StatCard({
  icon,
  label,
  value,
  sub,
  tone = "brand",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone?: "brand" | "amber" | "red";
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-500">{label}</span>
        <span className={`grid size-8 place-items-center rounded-lg ${tones[tone]}`}>
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tnum text-ink-900">{value}</p>
      <p className="mt-0.5 text-xs text-ink-400">{sub}</p>
    </div>
  );
}

export default function Dashboard() {
  const worksheets = useStore((s) => s.worksheets);
  const loading = useLoad(560);

  const stats = useMemo(() => {
    const need = worksheets.filter((w) => w.status === "要確認").length;
    const soon = worksheets.filter((w) => {
      const d = daysToDue(w);
      return d !== null && d >= 0 && d <= 7;
    }).length;
    const total = worksheets.length;

    const byCat = CATEGORIES.map((c) => ({
      name: c,
      件数: worksheets.filter((w) => w.category === c).length,
    })).filter((r) => r.件数 > 0);

    const byStatus = (["確定", "要確認", "下書き"] as const).map((s) => ({
      name: s,
      value: worksheets.filter((w) => w.status === s).length,
    }));

    const trend = Array.from({ length: 14 }).map((_, i) => {
      const day = subDays(new Date(), 13 - i);
      return {
        day: format(day, "M/d"),
        件数: worksheets.filter((w) => isSameDay(new Date(w.createdAt), day)).length,
      };
    });

    return { need, soon, total, byCat, byStatus, trend };
  }, [worksheets]);

  const upcoming = useMemo(
    () =>
      worksheets
        .filter((w) => {
          const d = daysToDue(w);
          return d !== null && d >= 0;
        })
        .sort((a, b) => (daysToDue(a) ?? 0) - (daysToDue(b) ?? 0))
        .slice(0, 6),
    [worksheets],
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h2 className="text-lg font-bold text-ink-900">ダッシュボード</h2>
        <p className="mt-1 text-sm text-ink-500">
          変換した指示書の状況を俯瞰します。
        </p>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FileCheck2 size={16} />}
          label="累計指示書"
          value={`${stats.total}`}
          sub="変換・保存された件数"
        />
        <StatCard
          icon={<AlertTriangle size={16} />}
          label="要確認"
          value={`${stats.need}`}
          sub="警告ありで保存された指示書"
          tone="amber"
        />
        <StatCard
          icon={<Timer size={16} />}
          label="7日以内納期"
          value={`${stats.soon}`}
          sub="短納期で工程調整が必要"
          tone="red"
        />
        <StatCard
          icon={<Layers size={16} />}
          label="加工区分"
          value={`${stats.byCat.length}`}
          sub="取り扱い中の区分数"
        />
      </div>

      {/* チャート */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-ink-200 bg-white p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-ink-800">
            日別 変換件数（直近14日）
          </h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={stats.trend} margin={{ left: -20, right: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(92% 0.006 250)" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "oklch(58% 0.013 252)" }}
                tickLine={false}
                axisLine={{ stroke: "oklch(92% 0.006 250)" }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "oklch(58% 0.013 252)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "oklch(94% 0.03 240)" }}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid oklch(92% 0.006 250)",
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="件数"
                fill="oklch(49% 0.15 232)"
                radius={[4, 4, 0, 0]}
                maxBarSize={26}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-ink-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-ink-800">状態の内訳</h3>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie
                data={stats.byStatus}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={72}
                paddingAngle={2}
              >
                {stats.byStatus.map((s) => (
                  <Cell key={s.name} fill={STATUS_COLOR[s.name]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid oklch(92% 0.006 250)",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {stats.byStatus.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: STATUS_COLOR[s.name] }}
                />
                <span className="text-ink-600">{s.name}</span>
                <span className="ml-auto tnum font-medium text-ink-800">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 加工区分別 + 直近納期 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-ink-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-ink-800">
            加工区分別 件数
          </h3>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart
              data={stats.byCat}
              layout="vertical"
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid
                horizontal={false}
                strokeDasharray="3 3"
                stroke="oklch(92% 0.006 250)"
              />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "oklch(58% 0.013 252)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={70}
                tick={{ fontSize: 11, fill: "oklch(48% 0.014 254)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "oklch(94% 0.03 240)" }}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid oklch(92% 0.006 250)",
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="件数"
                fill="oklch(57% 0.14 232)"
                radius={[0, 4, 4, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-ink-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink-800">
              納期が近い指示書
            </h3>
            <Link
              to="/history"
              className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700"
            >
              一覧へ
              <ArrowRight size={13} />
            </Link>
          </div>
          <ul className="divide-y divide-ink-100">
            {upcoming.map((w) => {
              const d = daysToDue(w) ?? 0;
              return (
                <li key={w.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink-800">{w.partName}</p>
                    <p className="mono text-xs text-ink-400">
                      {w.no} · {w.client}
                    </p>
                  </div>
                  <StatusBadge status={w.status} />
                  <span
                    className={`w-14 shrink-0 text-right text-xs font-medium tnum ${
                      d <= 5 ? "text-red-600" : "text-ink-500"
                    }`}
                  >
                    残り{d}日
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
