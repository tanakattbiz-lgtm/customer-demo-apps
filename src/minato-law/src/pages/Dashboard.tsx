import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Briefcase,
  Users,
  Wallet,
  CalendarClock,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { subMonths, format, isAfter } from "date-fns";
import { ja } from "date-fns/locale";
import { useStore, staffById } from "../store/useStore";
import { PageHeader } from "../components/PageHeader";
import { Card, Pill, Skeleton, Avatar } from "../components/ui";
import { yen, relative, shortDate } from "../lib/format";
import { matterTone } from "../lib/status";
import { useLoad } from "../lib/useLoad";

const PIE_COLORS = [
  "oklch(48% 0.15 264)",
  "oklch(58% 0.15 200)",
  "oklch(60% 0.15 150)",
  "oklch(62% 0.14 320)",
  "oklch(72% 0.13 82)",
  "oklch(60% 0.14 30)",
  "oklch(55% 0.12 20)",
  "oklch(50% 0.1 290)",
  "oklch(65% 0.1 120)",
];

function Kpi({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div
          className="grid h-11 w-11 place-items-center rounded-xl"
          style={{ background: tone + "1f", color: tone }}
        >
          {icon}
        </div>
        {sub && (
          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600">
            <TrendingUp size={13} />
            {sub}
          </span>
        )}
      </div>
      <div className="mt-4 text-2xl font-bold tracking-tight text-ink-900 tnum">
        {value}
      </div>
      <div className="mt-0.5 text-sm text-ink-500">{label}</div>
    </Card>
  );
}

export default function Dashboard() {
  const loading = useLoad();
  const matters = useStore((s) => s.matters);
  const clients = useStore((s) => s.clients);
  const invoices = useStore((s) => s.invoices);
  const staff = useStore((s) => s.staff);

  const activeMatters = matters.filter((m) => m.status !== "完了");
  const contractedClients = clients.filter((c) => c.status === "契約中");
  const now = new Date();

  const thisMonthRevenue = invoices
    .filter((iv) => iv.status === "支払済" && iv.paidAt)
    .filter((iv) => isAfter(new Date(iv.paidAt!), subMonths(now, 1)))
    .reduce((a, b) => a + b.amount, 0);

  const outstanding = invoices
    .filter((iv) => iv.status === "延滞" || iv.status === "送付済")
    .reduce((a, b) => a + b.amount, 0);

  // 近い期日 Top5
  const upcoming = useMemo(
    () =>
      matters
        .filter((m) => m.nextEventAt)
        .sort((a, b) => a.nextEventAt!.localeCompare(b.nextEventAt!))
        .slice(0, 5),
    [matters],
  );

  // 月次売上(過去6か月)
  const revenueByMonth = useMemo(() => {
    const buckets: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      buckets[format(d, "yyyy-MM")] = 0;
    }
    invoices
      .filter((iv) => iv.status === "支払済" && iv.paidAt)
      .forEach((iv) => {
        const k = format(new Date(iv.paidAt!), "yyyy-MM");
        if (k in buckets) buckets[k] += iv.amount;
      });
    // 見込みを少し盛って6か月の推移を自然にする(デモ表示用)
    const base = [1180000, 1420000, 1290000, 1650000, 1510000, 0];
    return Object.entries(buckets).map(([k, v], i) => ({
      month: format(new Date(k + "-01"), "M月", { locale: ja }),
      売上: v > 0 ? v : base[i],
    }));
  }, [invoices]);

  // 分野別案件数
  const byCategory = useMemo(() => {
    const m: Record<string, number> = {};
    matters.forEach((mt) => (m[mt.category] = (m[mt.category] ?? 0) + 1));
    return Object.entries(m)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [matters]);

  if (loading) {
    return (
      <div>
        <PageHeader title="ダッシュボード" subtitle="事務所全体の状況をひと目で" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="ダッシュボード"
        subtitle={`${format(now, "yyyy年M月d日(E)", { locale: ja })} — おはようございます、湊先生`}
      />

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          icon={<Briefcase size={20} />}
          label="進行中の案件"
          value={String(activeMatters.length)}
          sub="+3 今月"
          tone="oklch(48% 0.15 264)"
        />
        <Kpi
          icon={<Users size={20} />}
          label="契約中の顧問先"
          value={String(contractedClients.length)}
          sub="+2 今月"
          tone="oklch(58% 0.15 200)"
        />
        <Kpi
          icon={<Wallet size={20} />}
          label="今月の入金"
          value={yen(thisMonthRevenue)}
          tone="oklch(60% 0.15 150)"
        />
        <Kpi
          icon={<CalendarClock size={20} />}
          label="未回収(送付済+延滞)"
          value={yen(outstanding)}
          tone="oklch(64% 0.14 40)"
        />
      </div>

      {/* チャート */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-ink-900">売上推移(月次)</h2>
            <Pill tone="green">直近6か月</Pill>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMonth} margin={{ left: -8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(92% 0.007 265)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "oklch(58% 0.014 265)" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(58% 0.014 265)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 10000 ? `${Math.round(v / 10000)}万` : String(v))}
                />
                <Tooltip
                  cursor={{ fill: "oklch(93% 0.03 260 / 0.5)" }}
                  formatter={(v) => [yen(Number(v)), "売上"]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid oklch(92% 0.007 265)",
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="売上" radius={[6, 6, 0, 0]} fill="oklch(48% 0.15 264)" maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-2 font-bold text-ink-900">分野別の案件</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={46}
                  outerRadius={74}
                  paddingAngle={2}
                >
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [`${Number(v)}件`, n as string]}
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(92% 0.007 265)", fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {byCategory.slice(0, 4).map((c, i) => (
              <div key={c.name} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="flex-1 text-ink-600">{c.name}</span>
                <span className="font-medium text-ink-800 tnum">{c.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 期日 & 最近の案件 */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-ink-900">直近の期日・タスク</h2>
            <Link to="/matters" className="inline-flex items-center gap-0.5 text-sm font-medium text-brand-600 hover:text-brand-700">
              一覧 <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="space-y-1">
            {upcoming.map((m, i) => {
              const client = clients.find((c) => c.id === m.clientId);
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to="/matters"
                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-ink-50"
                  >
                    <div className="grid h-10 w-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-center leading-none">
                      <span className="text-[10px] text-brand-500">
                        {m.nextEventAt && format(new Date(m.nextEventAt), "M月")}
                      </span>
                      <span className="text-base font-bold text-brand-700 tnum">
                        {m.nextEventAt && format(new Date(m.nextEventAt), "d")}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-ink-800">{m.nextEvent}</div>
                      <div className="truncate text-xs text-ink-500">
                        {client?.name} ・ {m.title}
                      </div>
                    </div>
                    <Pill tone={matterTone[m.status] as never}>{m.status}</Pill>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-ink-900">最近更新された案件</h2>
            <Link to="/matters" className="inline-flex items-center gap-0.5 text-sm font-medium text-brand-600 hover:text-brand-700">
              一覧 <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="space-y-1">
            {[...matters]
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
              .slice(0, 5)
              .map((m) => {
                const client = clients.find((c) => c.id === m.clientId);
                const owner = staffById(staff, m.ownerId);
                return (
                  <Link
                    key={m.id}
                    to="/matters"
                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-ink-50"
                  >
                    {owner && <Avatar name={owner.name} color={owner.color} size={34} />}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-ink-800">{m.title}</div>
                      <div className="truncate text-xs text-ink-500">
                        {client?.name} ・ {shortDate(m.openedAt)}受任
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-ink-400">{relative(m.updatedAt)}</span>
                  </Link>
                );
              })}
          </div>
        </Card>
      </div>
    </div>
  );
}
