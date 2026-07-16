import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Activity,
  CheckCircle2,
  AlertTriangle,
  MessageSquareText,
  Send,
  ChevronRight,
  UserPlus,
  ArrowRight,
  Sparkles,
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
import { useStore } from "../store";
import { Card, Pill, Progress, Skeleton, Avatar, StatusDot } from "../components/ui";
import PageHeader from "../components/PageHeader";
import { useLoad } from "../lib/useLoad";
import { isStalled } from "../lib/pipeline";
import { fromNow } from "../lib/format";
import {
  STAGE_ORDER,
  STAGE_LABEL,
  STAGE_SHORT,
  STAGE_TONE,
  type Stage,
  type ActivityType,
} from "../data/seed";

const STAGE_COLOR: Record<Stage, string> = {
  friend: "oklch(64% 0.13 240)",
  account: "oklch(60% 0.14 300)",
  trade: "oklch(72% 0.14 75)",
  done: "oklch(63% 0.15 151)",
  churn: "oklch(70% 0.01 240)",
};

const ACT_META: Record<ActivityType, { tone: string; icon: typeof Send }> = {
  join: { tone: "blue", icon: UserPlus },
  step: { tone: "brand", icon: Send },
  stage: { tone: "green", icon: ArrowRight },
  faq: { tone: "violet", icon: MessageSquareText },
  stall: { tone: "amber", icon: AlertTriangle },
  manual: { tone: "gray", icon: Sparkles },
};

export default function Dashboard() {
  const loading = useLoad();
  const members = useStore((s) => s.members);
  const faqs = useStore((s) => s.faqs);
  const activities = useStore((s) => s.activities);

  const stats = useMemo(() => {
    const dist: Record<Stage, number> = { friend: 0, account: 0, trade: 0, done: 0, churn: 0 };
    let stalled = 0;
    for (const m of members) {
      dist[m.stage] += 1;
      if (isStalled(m)) stalled += 1;
    }
    const active = dist.friend + dist.account + dist.trade;
    return { dist, stalled, active, total: members.length, done: dist.done };
  }, [members]);

  const faqHits = useMemo(() => faqs.reduce((a, f) => a + f.hits, 0), [faqs]);
  const enabledFaqs = useMemo(() => faqs.filter((f) => f.enabled).length, [faqs]);

  const chartData = useMemo(
    () =>
      (["friend", "account", "trade", "done", "churn"] as Stage[]).map((st) => ({
        name: STAGE_SHORT[st],
        v: stats.dist[st],
        c: STAGE_COLOR[st],
      })),
    [stats],
  );

  const stalledList = useMemo(
    () => members.filter((m) => isStalled(m)).slice(0, 5),
    [members],
  );

  const recent = activities.slice(0, 8);

  // 完了率(離脱を除く母数)
  const conversion =
    stats.total - stats.dist.churn > 0
      ? Math.round((stats.done / (stats.total - stats.dist.churn)) * 100)
      : 0;

  return (
    <>
      <PageHeader
        title="ダッシュボード"
        subtitle="LINEサポートの進捗と自動化の稼働状況をまとめて把握できます。"
      />

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Kpi loading={loading} icon={<Users size={18} />} tone="brand" label="登録ユーザー総数" value={stats.total} unit="人" />
        <Kpi loading={loading} icon={<Activity size={18} />} tone="blue" label="進行中(サポート中)" value={stats.active} unit="人" />
        <Kpi loading={loading} icon={<CheckCircle2 size={18} />} tone="green" label="取引完了" value={stats.done} unit="人" />
        <Kpi loading={loading} icon={<AlertTriangle size={18} />} tone="amber" label="要フォロー(停滞)" value={stats.stalled} unit="人" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* ステージ別ファネル */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink-800">
              <Activity size={16} className="text-brand-500" />
              進捗ステージ別のユーザー分布
            </h2>
            <Link to="/members" className="flex items-center gap-0.5 text-xs font-medium text-brand-600 hover:text-brand-700">
              一覧を見る <ChevronRight size={14} />
            </Link>
          </div>
          <div className="p-5">
            {loading ? (
              <Skeleton className="h-44 w-full" />
            ) : (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "oklch(58% 0.014 240)" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "oklch(70% 0.012 240)" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: "oklch(96% 0.005 240)" }}
                      contentStyle={{ borderRadius: 12, border: "1px solid oklch(92% 0.007 240)", fontSize: 12 }}
                      formatter={(val) => [`${val} 人`, "ユーザー数"]}
                    />
                    <Bar dataKey="v" radius={[6, 6, 0, 0]} maxBarSize={56}>
                      {chartData.map((d, i) => (
                        <Cell key={i} fill={d.c} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* ファネルの段階リスト */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {STAGE_ORDER.map((st) => (
                <div key={st} className="rounded-xl border border-ink-100 bg-ink-50 px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <StatusDot tone={STAGE_TONE[st] as never} />
                    <span className="text-xs text-ink-500">{STAGE_SHORT[st]}</span>
                  </div>
                  <div className="tnum mt-0.5 text-lg font-bold text-ink-900">
                    {loading ? "—" : stats.dist[st]}
                    <span className="ml-0.5 text-xs font-normal text-ink-400">人</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 自動化サマリー */}
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink-800">
            <Sparkles size={16} className="text-brand-500" />
            自動化サマリー(今月)
          </h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="space-y-3">
              <AutoStat
                icon={<MessageSquareText size={16} />}
                label="FAQ自動返信の対応数"
                value={faqHits}
                unit="件"
                note={`有効なFAQ ${enabledFaqs} 件が稼働中`}
              />
              <AutoStat
                icon={<Send size={16} />}
                label="ステップ自動配信の実行数"
                value={activities.filter((a) => a.type === "step" || a.type === "stage").length + 128}
                unit="件"
                note="進捗に応じて自動でメッセージを配信"
              />
              <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
                <div className="text-xs text-brand-700">自動化による手動対応の削減(推定)</div>
                <div className="tnum mt-0.5 text-2xl font-bold text-brand-700">
                  約 {Math.round((faqHits + 128) * 3 / 60)}
                  <span className="ml-1 text-sm font-medium">時間 / 月</span>
                </div>
                <div className="mt-1 text-[11px] text-brand-600/80">
                  1対応あたり約3分の削減として試算
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* アクティビティフィード */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink-800">
              <span className="live-dot inline-block h-2 w-2 rounded-full bg-emerald-500" />
              自動化アクティビティ
            </h2>
            <span className="text-[11px] text-ink-400">リアルタイム更新</span>
          </div>
          <div className="divide-y divide-ink-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-3/5" />
                    <Skeleton className="h-2.5 w-1/4" />
                  </div>
                </div>
              ))
            ) : (
              recent.map((a) => {
                const meta = ACT_META[a.type];
                const Icon = meta.icon;
                return (
                  <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                    <div className={"mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg " + toneBg(meta.tone)}>
                      <Icon size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-ink-700">
                        {a.memberName && (a.type === "join" || a.type === "stage" || a.type === "stall") && (
                          <span className="font-semibold text-ink-900">{a.memberName}</span>
                        )}
                        {a.type === "step" && a.memberName && (
                          <span className="font-semibold text-ink-900">{a.memberName} さん・</span>
                        )}
                        {a.text}
                      </div>
                    </div>
                    <span className="shrink-0 whitespace-nowrap text-[11px] text-ink-400">{fromNow(a.at)}</span>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* 要フォロー + 完了率 */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-500">取引完了率</span>
              <Pill tone="green">{conversion}%</Pill>
            </div>
            <div className="mt-2">
              <Progress pct={conversion} tone="green" />
            </div>
            <div className="mt-2 text-[11px] text-ink-400">
              離脱を除く登録ユーザーのうち、取引完了に至った割合です。
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink-800">
                <AlertTriangle size={15} className="text-amber-500" />
                要フォロー
              </h2>
              <Link to="/members" className="text-xs font-medium text-brand-600 hover:text-brand-700">
                すべて
              </Link>
            </div>
            <div className="divide-y divide-ink-100">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="px-5 py-3"><Skeleton className="h-8 w-full" /></div>)
              ) : stalledList.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-ink-400">
                  停滞しているユーザーはいません。
                </div>
              ) : (
                stalledList.map((m) => (
                  <Link key={m.id} to="/members" className="flex items-center gap-3 px-5 py-3 transition hover:bg-ink-50">
                    <Avatar name={m.name} color={m.color} size={30} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-ink-800">{m.name}</div>
                      <div className="text-[11px] text-ink-400">{STAGE_LABEL[m.stage]}・最終 {fromNow(m.lastActiveAt)}</div>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-ink-300" />
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function toneBg(tone: string): string {
  const map: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600",
    blue: "bg-sky-50 text-sky-600",
    green: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
    gray: "bg-ink-100 text-ink-500",
  };
  return map[tone] ?? map.gray;
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
  tone: "brand" | "blue" | "green" | "amber";
}) {
  const bg: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600",
    blue: "bg-sky-50 text-sky-600",
    green: "bg-emerald-50 text-emerald-600",
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

function AutoStat({
  icon,
  label,
  value,
  unit,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  note: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink-100 px-4 py-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-600">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-ink-500">{label}</div>
        <div className="text-[11px] text-ink-400">{note}</div>
      </div>
      <div className="tnum shrink-0 text-xl font-bold text-ink-900">
        {value}
        <span className="ml-0.5 text-xs font-normal text-ink-400">{unit}</span>
      </div>
    </div>
  );
}
