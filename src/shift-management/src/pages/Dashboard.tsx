import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Users,
  CheckCircle2,
  Clock,
  CalendarCheck,
  Bell,
  Plus,
  Trash2,
  Send,
  ChevronRight,
  Megaphone,
  Pin,
} from "lucide-react";
import { useStore } from "../store";
import { useLoad } from "../lib/useLoad";
import {
  Card,
  StatTile,
  Progress,
  Button,
  Avatar,
  Pill,
  Modal,
  Field,
  inputCls,
  Skeleton,
} from "../components/ui";
import { fmtMd, weekdayLabel, isWeekend, daysUntil, fromNow } from "../lib/date";

export default function Dashboard() {
  const loading = useLoad();
  const navigate = useNavigate();
  const { period, members, submissions, requests, assignments, announcements } = useStore();
  const removeAnnouncement = useStore((s) => s.removeAnnouncement);
  const [annOpen, setAnnOpen] = useState(false);

  const activeMembers = useMemo(() => members.filter((m) => m.active), [members]);
  const submittedIds = useMemo(
    () => new Set(submissions.filter((s) => s.submittedAt).map((s) => s.memberId)),
    [submissions],
  );
  const notSubmitted = activeMembers.filter((m) => !submittedIds.has(m.id));
  const submittedCount = activeMembers.length - notSubmitted.length;
  const submitRate = Math.round((submittedCount / Math.max(1, activeMembers.length)) * 100);

  const totalAssigned = assignments.length;
  const remainDays = daysUntil(period.deadline);

  // 日別の勤務可能人数(棒グラフ)
  const chartData = useMemo(
    () =>
      period.dates.map((date) => {
        const avail = requests.filter(
          (r) => r.date === date && r.availability !== "ng",
        ).length;
        const assigned = assignments.filter((a) => a.date === date).length;
        return {
          date,
          label: fmtMd(date),
          wd: weekdayLabel(date),
          avail,
          assigned,
          weekend: isWeekend(date),
        };
      }),
    [period.dates, requests, assignments],
  );

  const remind = (name: string) =>
    toast.success(`${name} さんへ提出リマインドを送信しました`, {
      description: "(デモ:実際の通知は送信されません)",
    });

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">ダッシュボード</h1>
          <p className="mt-1 text-sm text-ink-500">
            {period.label}（{fmtMd(period.start)}〜{fmtMd(period.end)}）の状況
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Pill tone={period.status === "公開済" ? "green" : period.status === "作成中" ? "amber" : "blue"}>
            {period.status}
          </Pill>
          <span
            className={
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold " +
              (remainDays <= 2 ? "bg-rose-50 text-rose-600" : "bg-ink-100 text-ink-600")
            }
          >
            <span className={"h-2 w-2 rounded-full " + (remainDays <= 2 ? "bg-rose-500 pulse-dot" : "bg-ink-400")} />
            希望締切まで あと{Math.max(0, remainDays)}日
          </span>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          label="提出済み"
          value={`${submittedCount}/${activeMembers.length}`}
          unit="人"
          tone="green"
          icon={<CheckCircle2 size={16} />}
        />
        <StatTile label="未提出" value={notSubmitted.length} unit="人" tone="amber" icon={<Clock size={16} />} />
        <StatTile label="登録スタッフ" value={activeMembers.length} unit="人" tone="brand" icon={<Users size={16} />} />
        <StatTile label="割当済みコマ" value={totalAssigned} unit="件" tone="brand" icon={<CalendarCheck size={16} />} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* 提出状況 */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h2 className="text-sm font-bold text-ink-900">シフト希望の提出状況</h2>
            <button
              onClick={() => navigate("/shift")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              シフト表へ <ChevronRight size={14} />
            </button>
          </div>
          <div className="px-5 py-4">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-ink-700">提出率</span>
              <span className="tnum font-bold text-ink-900">{submitRate}%</span>
            </div>
            <Progress pct={submitRate} tone={submitRate >= 80 ? "green" : "amber"} />

            <div className="mt-4">
              <div className="mb-2 text-xs font-semibold text-ink-500">
                未提出のスタッフ（{notSubmitted.length}人）
              </div>
              {notSubmitted.length === 0 ? (
                <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  全員が提出済みです。シフト作成に進めます。
                </div>
              ) : (
                <ul className="divide-y divide-ink-100 overflow-hidden rounded-xl border border-ink-200">
                  {notSubmitted.map((m) => (
                    <li key={m.id} className="flex items-center gap-3 px-3 py-2.5">
                      <Avatar name={m.name} color={m.color} size={32} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-ink-800">{m.name}</div>
                        <div className="text-[11px] text-ink-400">{m.positions.join("・")}</div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => remind(m.name)}>
                        <Send size={13} /> 催促
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>

        {/* お知らせ */}
        <Card>
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-ink-900">
              <Megaphone size={16} className="text-brand-500" /> お知らせ
            </h2>
            <Button size="sm" variant="ghost" onClick={() => setAnnOpen(true)}>
              <Plus size={14} /> 投稿
            </Button>
          </div>
          <ul className="thin-scroll max-h-[360px] divide-y divide-ink-100 overflow-y-auto">
            {announcements.map((a) => (
              <li key={a.id} className="group px-5 py-3.5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {a.pinned && <Pin size={12} className="shrink-0 text-brand-500" />}
                      <span className="truncate text-sm font-semibold text-ink-800">{a.title}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-500">{a.body}</p>
                    <div className="mt-1 text-[11px] text-ink-400">{fromNow(a.at)}</div>
                  </div>
                  <button
                    onClick={() => {
                      removeAnnouncement(a.id);
                      toast.success("お知らせを削除しました");
                    }}
                    className="opacity-0 transition group-hover:opacity-100"
                    aria-label="削除"
                  >
                    <Trash2 size={14} className="text-ink-400 hover:text-rose-500" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* 日別の勤務可能人数 */}
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink-900">日別の勤務可能人数（提出された希望から集計）</h2>
          <div className="hidden items-center gap-4 text-xs text-ink-500 sm:flex">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-brand-400" /> 勤務可能
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-brand-700" /> 割当済み
            </span>
          </div>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }} barGap={2}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "oklch(58% 0.014 252)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "oklch(58% 0.014 252)" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "oklch(96% 0.005 250)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid oklch(92% 0.007 250)",
                  fontSize: 12,
                }}
                formatter={(v: number, n) => [`${v}人`, n === "avail" ? "勤務可能" : "割当済み"]}
              />
              <Bar dataKey="avail" radius={[4, 4, 0, 0]} maxBarSize={22}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.weekend ? "oklch(70% 0.15 40)" : "oklch(70% 0.14 263)"} />
                ))}
              </Bar>
              <Bar dataKey="assigned" radius={[4, 4, 0, 0]} maxBarSize={22} fill="oklch(47% 0.15 266)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <AnnouncementModal open={annOpen} onClose={() => setAnnOpen(false)} />
    </div>
  );
}

function AnnouncementModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const add = useStore((s) => s.addAnnouncement);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [err, setErr] = useState<{ title?: string; body?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = () => {
    const e: typeof err = {};
    if (!title.trim()) e.title = "タイトルを入力してください";
    if (!body.trim()) e.body = "本文を入力してください";
    setErr(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => {
      add({ title: title.trim(), body: body.trim() });
      setLoading(false);
      setTitle("");
      setBody("");
      onClose();
      toast.success("お知らせを投稿しました");
    }, 500);
  };

  return (
    <Modal open={open} onClose={onClose} title="お知らせを投稿">
      <div className="space-y-4">
        <Field label="タイトル" required error={err.title}>
          <input
            className={inputCls}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例:8月前半シフトについて"
          />
        </Field>
        <Field label="本文" required error={err.body}>
          <textarea
            className={inputCls + " min-h-28 resize-none"}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="スタッフに伝えたい内容を入力"
          />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={submit} loading={loading}>
            <Bell size={15} /> 投稿する
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}
