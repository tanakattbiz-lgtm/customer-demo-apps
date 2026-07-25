import { useMemo } from "react";
import { Link } from "react-router-dom";
import { subHours } from "date-fns";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  HeartPulse,
  BellRing,
  Wifi,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { useStore } from "../store";
import { useLoad } from "../lib/useLoad";
import { statusOf, STATUS_TONE, SEVERITY_TONE } from "../lib/domain";
import type { UserStatus } from "../data/seed";
import { ago } from "../lib/format";
import { Avatar, Card, Pill, Skeleton, StatusDot } from "../components/ui";

const STATUS_COLOR: Record<UserStatus, string> = {
  正常: "#10b981",
  注意: "#f59e0b",
  異常: "#f43f5e",
  オフライン: "#94a3b8",
};

export default function Dashboard() {
  const users = useStore((s) => s.users);
  const alerts = useStore((s) => s.alerts);
  const openSim = useStore((s) => s.openSim);
  const loading = useLoad();

  const withStatus = useMemo(
    () => users.map((u) => ({ u, st: statusOf(u, alerts) })),
    [users, alerts],
  );

  const counts = useMemo(() => {
    const c: Record<UserStatus, number> = { 正常: 0, 注意: 0, 異常: 0, オフライン: 0 };
    withStatus.forEach(({ st }) => (c[st] += 1));
    return c;
  }, [withStatus]);

  const unresolved = alerts.filter((a) => a.status !== "対応済");
  const online = users.filter((u) => u.online).length;
  const avgHR = useMemo(() => {
    const on = users.filter((u) => u.online);
    return on.length ? Math.round(on.reduce((s, u) => s + u.hr, 0) / on.length) : 0;
  }, [users]);

  // 直近12時間のアラート発生件数(2時間バケット)
  const trend = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: 6 }, (_, i) => {
      const from = subHours(now, (6 - i) * 2);
      const to = subHours(now, (5 - i) * 2);
      const label = `${from.getHours()}時`;
      const n = alerts.filter((a) => {
        const t = new Date(a.at);
        return t >= from && t < to;
      }).length;
      return { label, count: n };
    });
    return buckets;
  }, [alerts]);

  const pie = (Object.keys(counts) as UserStatus[])
    .map((k) => ({ name: k, value: counts[k] }))
    .filter((d) => d.value > 0);

  const attention = withStatus
    .filter(({ st }) => st === "異常" || st === "注意" || st === "オフライン")
    .sort((a, a2) => rank(a.st) - rank(a2.st));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">ダッシュボード</h1>
          <p className="mt-1 text-sm text-slate-500">
            見守り対象 {users.length} 名のリアルタイム状態を集約表示します。
          </p>
        </div>
        <button
          onClick={() => openSim()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          検証イベントを発報
          <ArrowRight size={15} />
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi loading={loading} icon={<Activity size={18} />} tone="teal" label="見守り中" value={`${online}`} unit={`/ ${users.length} 名`} />
        <Kpi loading={loading} icon={<BellRing size={18} />} tone="rose" label="未対応アラート" value={`${unresolved.filter((a) => a.status === "未対応").length}`} unit="件" />
        <Kpi loading={loading} icon={<HeartPulse size={18} />} tone="sky" label="平均心拍" value={`${avgHR}`} unit="bpm" />
        <Kpi loading={loading} icon={<Wifi size={18} />} tone="emerald" label="オンライン率" value={`${Math.round((online / users.length) * 100)}`} unit="%" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* トレンド */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">アラート発生件数(直近12時間)</h2>
            <Pill tone="gray">2時間ごと</Pill>
          </div>
          {loading ? (
            <Skeleton className="h-52 w-full" />
          ) : (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g-alert" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d9488" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip
                    cursor={{ stroke: "#cbd5e1", strokeDasharray: 4 }}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                    formatter={(v: number) => [`${v} 件`, "アラート"]}
                  />
                  <Area type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={2} fill="url(#g-alert)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* 状態内訳 */}
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-bold text-slate-800">状態の内訳</h2>
          {loading ? (
            <Skeleton className="h-52 w-full" />
          ) : (
            <div className="flex items-center gap-4">
              <div className="h-36 w-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pie} dataKey="value" nameKey="name" innerRadius={40} outerRadius={64} paddingAngle={2} stroke="none">
                      {pie.map((d) => (
                        <Cell key={d.name} fill={STATUS_COLOR[d.name as UserStatus]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                      formatter={(v: number, n) => [`${v} 名`, n as string]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {(Object.keys(counts) as UserStatus[]).map((k) => (
                  <div key={k} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600">
                      <StatusDot tone={STATUS_TONE[k]} />
                      {k}
                    </span>
                    <span className="tabular-nums font-semibold text-slate-800">{counts[k]} 名</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 要対応の利用者 */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">注意が必要な利用者</h2>
            <Link to="/monitors" className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:underline">
              一覧へ <ChevronRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : attention.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">現在、注意が必要な利用者はいません。</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {attention.slice(0, 5).map(({ u, st }) => (
                <li key={u.id}>
                  <Link to="/monitors" className="flex items-center gap-3 py-2.5 transition hover:opacity-80">
                    <Avatar name={u.name} color={u.color} size={38} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-800">{u.name} 様</div>
                      <div className="truncate text-xs text-slate-400">{u.location} ・ {u.device}</div>
                    </div>
                    <div className="text-right">
                      <Pill tone={STATUS_TONE[st]}>{st}</Pill>
                      <div className="mt-1 text-xs text-slate-400">
                        {u.online ? `${u.hr}bpm` : "通信なし"}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* 最新アラート */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">最新のアラート</h2>
            <Link to="/alerts" className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:underline">
              履歴へ <ChevronRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {alerts.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-start gap-3 py-2.5">
                  <StatusDot tone={SEVERITY_TONE[a.severity]} pulse={a.status === "未対応"} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">{a.kind}</span>
                      <span className="text-xs text-slate-400">{a.userName} 様</span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{a.message}</p>
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-xs text-slate-400">{ago(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function rank(st: UserStatus) {
  return { 異常: 0, 注意: 1, オフライン: 2, 正常: 3 }[st];
}

function Kpi({
  loading,
  icon,
  tone,
  label,
  value,
  unit,
}: {
  loading: boolean;
  icon: React.ReactNode;
  tone: "teal" | "rose" | "sky" | "emerald";
  label: string;
  value: string;
  unit: string;
}) {
  const bg: Record<string, string> = {
    teal: "bg-teal-50 text-teal-600",
    rose: "bg-rose-50 text-rose-600",
    sky: "bg-sky-50 text-sky-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <span className={"grid h-8 w-8 place-items-center rounded-lg " + bg[tone]}>{icon}</span>
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-7 w-20" />
      ) : (
        <div className="mt-2.5 flex items-baseline gap-1">
          <span className="tabular-nums text-2xl font-bold text-slate-900">{value}</span>
          <span className="text-xs text-slate-400">{unit}</span>
        </div>
      )}
    </Card>
  );
}
