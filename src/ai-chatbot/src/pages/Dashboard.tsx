import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  MessagesSquare,
  CheckCircle2,
  Bot,
  Star,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useStore } from "../store";
import { seedDaily, KB_CATEGORIES, type KBCategory } from "../data/seed";
import { Card, StatCard, Pill, StatusDot, Skeleton } from "../components/ui";
import { relTime, statusTone } from "../lib/format";
import { useLoad } from "../lib/useLoad";

export function Dashboard() {
  const sessions = useStore((s) => s.sessions);
  const kb = useStore((s) => s.kb);
  const loading = useLoad([]);

  const daily = useMemo(() => seedDaily(), []);

  const stats = useMemo(() => {
    const total = sessions.length;
    const resolved = sessions.filter((s) => s.status === "解決済み").length;
    const bot = sessions.filter((s) => s.status !== "有人対応").length;
    const ratings = sessions
      .map((s) => s.rating)
      .filter((r): r is NonNullable<typeof r> => r != null);
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    return {
      total,
      resolveRate: total ? Math.round((resolved / total) * 100) : 0,
      deflection: total ? Math.round((bot / total) * 100) : 0,
      avg: avg.toFixed(1),
    };
  }, [sessions]);

  // カテゴリ別 参照回数(RAG がどの知識をよく使ったか)
  const byCategory = useMemo(() => {
    const counts = new Map<KBCategory, number>();
    KB_CATEGORIES.forEach((c) => counts.set(c, 0));
    const catOf = new Map(kb.map((a) => [a.id, a.category]));
    for (const s of sessions) {
      for (const m of s.messages) {
        for (const id of m.sourceIds ?? []) {
          const c = catOf.get(id);
          if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
        }
      }
    }
    const arr = [...counts.entries()].map(([cat, n]) => ({ cat, n }));
    const max = Math.max(1, ...arr.map((a) => a.n));
    return { arr: arr.sort((a, b) => b.n - a.n), max };
  }, [sessions, kb]);

  const recent = useMemo(
    () =>
      [...sessions]
        .sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt))
        .slice(0, 6),
    [sessions],
  );

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 lg:p-8">
      {/* AI 稼働バナー */}
      <div className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white px-5 py-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
          <Sparkles size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-ink-900">AIチャットボットは稼働中です</div>
          <div className="text-xs text-ink-500">
            公開ナレッジ {kb.filter((a) => a.published).length} 件を参照し、24時間自動で一次対応しています。
          </div>
        </div>
        <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="総会話数"
          value={stats.total}
          sub="過去14日の累計"
          icon={<MessagesSquare size={20} />}
          accent="brand"
        />
        <StatCard
          label="解決率"
          value={`${stats.resolveRate}%`}
          sub="AIで完結した割合"
          icon={<CheckCircle2 size={20} />}
          accent="green"
        />
        <StatCard
          label="自動対応率"
          value={`${stats.deflection}%`}
          sub="有人に渡さず対応"
          icon={<Bot size={20} />}
          accent="sky"
        />
        <StatCard
          label="満足度"
          value={stats.avg}
          sub="5段階評価の平均"
          icon={<Star size={20} />}
          accent="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 会話数推移 */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-ink-900">会話数の推移</h2>
              <p className="text-xs text-ink-400">日別の総会話数と解決件数</p>
            </div>
            <Pill tone="green">
              <TrendingUp size={12} /> 前週比 +18%
            </Pill>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(54% 0.22 289)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="oklch(54% 0.22 289)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(70% 0.15 165)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="oklch(70% 0.15 165)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(93% 0.006 270)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "oklch(59% 0.014 270)" }}
                  tickLine={false}
                  axisLine={false}
                  interval={1}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(59% 0.014 270)" }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid oklch(93% 0.006 270)",
                    fontSize: 12,
                    boxShadow: "0 8px 24px oklch(0% 0 0 / 0.08)",
                  }}
                  labelStyle={{ fontWeight: 700, color: "oklch(22% 0.01 278)" }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="総会話"
                  stroke="oklch(54% 0.22 289)"
                  strokeWidth={2}
                  fill="url(#gTotal)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="解決"
                  stroke="oklch(62% 0.15 165)"
                  strokeWidth={2}
                  fill="url(#gRes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* カテゴリ別参照 */}
        <Card className="p-5">
          <h2 className="text-sm font-bold text-ink-900">よく参照される知識</h2>
          <p className="mb-4 text-xs text-ink-400">RAGが引用したカテゴリ</p>
          <div className="space-y-3">
            {byCategory.arr.map(({ cat, n }) => (
              <div key={cat}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-ink-600">{cat}</span>
                  <span className="font-semibold text-ink-800 tnum">{n}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all"
                    style={{ width: `${(n / byCategory.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 最近の会話 */}
      <Card>
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
          <h2 className="text-sm font-bold text-ink-900">最近の会話</h2>
          <Link
            to="/logs"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            すべて見る <ArrowRight size={14} />
          </Link>
        </div>
        <ul className="divide-y divide-ink-100">
          {recent.map((s) => {
            const firstQ = s.messages.find((m) => m.role === "user")?.text ?? "—";
            return (
              <li key={s.id}>
                <Link
                  to={`/logs/${s.id}`}
                  className="flex items-center gap-3 px-5 py-3 transition hover:bg-ink-50"
                >
                  <StatusDot tone={statusTone(s.status)} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-ink-800">{firstQ}</div>
                    <div className="text-xs text-ink-400">
                      {s.visitor} ・ {s.channel}
                    </div>
                  </div>
                  <Pill tone={statusTone(s.status)}>{s.status}</Pill>
                  <span className="hidden w-20 text-right text-xs text-ink-400 sm:block">
                    {relTime(s.startedAt)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 lg:p-8">
      <Skeleton className="h-16 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}
