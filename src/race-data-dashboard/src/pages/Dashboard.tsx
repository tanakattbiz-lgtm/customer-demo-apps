import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileClock,
  ChevronRight,
  CloudDownload,
  Upload,
  Activity,
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
} from "lucide-react";
import { useStore } from "../store";
import { useLoad } from "../lib/useLoad";
import { relTime } from "../lib/format";
import type { LogLevel, Race } from "../data/seed";
import { fakeApi } from "../lib/fakeApi";
import {
  Card,
  Skeleton,
  Pill,
  Button,
  Spinner,
  CardStatusBadge,
  ResultStatusBadge,
} from "../components/ui";

// ---------------- KPI ----------------
function Stat({
  icon,
  label,
  value,
  sub,
  tone = "brand",
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  tone?: "brand" | "amber" | "green" | "ink";
}) {
  const bg: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-emerald-50 text-emerald-600",
    ink: "bg-ink-100 text-ink-600",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className={"grid h-10 w-10 place-items-center rounded-xl " + bg[tone]}>{icon}</div>
        <div className="text-sm font-medium text-ink-500">{label}</div>
      </div>
      <div className="mt-3 flex items-end gap-2">
        <div className="tnum text-3xl font-bold text-ink-900">{value}</div>
        {sub && <div className="pb-1 text-xs text-ink-400">{sub}</div>}
      </div>
    </Card>
  );
}

const LEVEL_ICON: Record<LogLevel, React.ReactNode> = {
  info: <Info size={15} className="text-sky-500" />,
  success: <CircleCheck size={15} className="text-emerald-500" />,
  warn: <TriangleAlert size={15} className="text-amber-500" />,
  error: <CircleAlert size={15} className="text-rose-500" />,
};

export default function Dashboard() {
  const loading = useLoad();
  const navigate = useNavigate();
  const races = useStore((s) => s.races);
  const meetings = useStore((s) => s.meetings);
  const logs = useStore((s) => s.logs);
  const publishCard = useStore((s) => s.publishCard);
  const publishResult = useStore((s) => s.publishResult);

  const [tab, setTab] = useState<string>("すべて");
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const stats = useMemo(() => {
    const published = races.filter((r) => r.resultStatus === "掲載済").length;
    const pending = races.filter((r) => r.resultStatus === "確定").length;
    const before = races.filter((r) => r.resultStatus === "発走前").length;
    const cardPub = races.filter((r) => r.cardStatus === "公開済").length;
    return { published, pending, before, cardPub, total: races.length };
  }, [races]);

  const pie = [
    { name: "掲載済", value: stats.published, color: "oklch(62% 0.14 155)" },
    { name: "確定・掲載待ち", value: stats.pending, color: "oklch(78% 0.15 75)" },
    { name: "発走前", value: stats.before, color: "oklch(86% 0.009 240)" },
  ].filter((d) => d.value > 0);

  const tracks = ["すべて", ...meetings.map((m) => m.track)];
  const shown = tab === "すべて" ? races : races.filter((r) => r.track === tab);

  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  const runResult = async (r: Race, e: React.MouseEvent) => {
    e.stopPropagation();
    setBusy((b) => ({ ...b, [r.id]: true }));
    await fakeApi(true, 900);
    publishResult(r.id);
    setBusy((b) => ({ ...b, [r.id]: false }));
    toast.success(`${r.track} ${r.no}R の結果を掲載しました。`);
  };

  const runCard = async (r: Race, e: React.MouseEvent) => {
    e.stopPropagation();
    setBusy((b) => ({ ...b, [r.id]: true }));
    await fakeApi(true, 800);
    publishCard(r.id);
    setBusy((b) => ({ ...b, [r.id]: false }));
    toast.success(`${r.track} ${r.no}R の出走表を生成・公開しました。`);
  };

  return (
    <div>
      {/* ---- Page header ---- */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">本日の開催・処理状況</h1>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
            <CalendarDays size={15} />
            {today}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {meetings.map((m) => (
            <Pill key={m.id} tone="gray" className="!px-3 !py-1">
              {m.track} {m.kai}回{m.day}日 ・ {m.weather} ・ 馬場{m.going}
            </Pill>
          ))}
        </div>
      </div>

      {/* ---- KPI ---- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px] rounded-2xl" />)
        ) : (
          <>
            <Stat icon={<CheckCircle2 size={20} />} tone="green" label="結果掲載済" value={stats.published} sub={`/ ${stats.total} R`} />
            <Stat icon={<Clock size={20} />} tone="amber" label="確定・掲載待ち" value={stats.pending} sub="要処理" />
            <Stat icon={<FileClock size={20} />} tone="ink" label="発走前" value={stats.before} sub="出走表公開済" />
            <Stat icon={<Upload size={20} />} tone="brand" label="出走表 公開率" value={`${Math.round((stats.cardPub / stats.total) * 100)}%`} sub={`${stats.cardPub}/${stats.total}`} />
          </>
        )}
      </div>

      {/* ---- Chart + activity ---- */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <div className="text-sm font-semibold text-ink-800">本日の掲載進捗</div>
          {loading ? (
            <Skeleton className="mt-4 h-40 rounded-xl" />
          ) : (
            <div className="mt-2 flex items-center gap-4">
              <div className="relative h-36 w-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pie} dataKey="value" innerRadius={44} outerRadius={64} paddingAngle={2} stroke="none">
                      {pie.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <div className="tnum text-2xl font-bold text-ink-900">
                    {Math.round((stats.published / stats.total) * 100)}%
                  </div>
                  <div className="text-[10px] text-ink-400">掲載完了</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {pie.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-ink-600">{d.name}</span>
                    <span className="tnum ml-auto font-semibold text-ink-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink-800">
              <Activity size={16} className="text-brand-500" /> 自動処理の直近アクティビティ
            </div>
            <button onClick={() => navigate("/logs")} className="text-xs font-medium text-brand-600 hover:text-brand-700">
              すべて見る
            </button>
          </div>
          {loading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 rounded-lg" />
              ))}
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-ink-100">
              {logs.slice(0, 5).map((l) => (
                <li key={l.id} className="flex items-start gap-3 py-2.5">
                  <span className="mt-0.5">{LEVEL_ICON[l.level]}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-ink-700">{l.job}</span>
                      {l.raceLabel && <Pill tone="brand" className="!px-2 !py-0">{l.raceLabel}</Pill>}
                    </div>
                    <div className="truncate text-sm text-ink-600">{l.message}</div>
                  </div>
                  <span className="tnum shrink-0 text-[11px] text-ink-400">{relTime(l.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* ---- Race table ---- */}
      <div className="mt-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {tracks.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition " +
                (tab === t ? "bg-brand-600 text-white shadow-sm" : "bg-white text-ink-600 hover:bg-ink-100 border border-ink-200")
              }
            >
              {t}
            </button>
          ))}
        </div>

        <Card className="overflow-hidden">
          <div className="thin-scroll overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs font-semibold text-ink-500">
                  <th className="px-4 py-3">R</th>
                  <th className="px-4 py-3">発走</th>
                  <th className="px-4 py-3">レース</th>
                  <th className="px-4 py-3">コース</th>
                  <th className="px-4 py-3 text-center">頭数</th>
                  <th className="px-4 py-3">出走表</th>
                  <th className="px-4 py-3">結果</th>
                  <th className="px-4 py-3 text-right">処理</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-ink-100">
                        <td colSpan={8} className="px-4 py-3">
                          <Skeleton className="h-6 rounded-md" />
                        </td>
                      </tr>
                    ))
                  : shown.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => navigate(`/races/${r.id}`)}
                        className="cursor-pointer border-b border-ink-100 transition last:border-0 hover:bg-brand-50/40"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="tnum font-bold text-ink-900">{r.no}R</span>
                            {r.grade && (
                              <span className="rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                {r.grade}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="tnum px-4 py-3 text-ink-600">{r.start}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-ink-900">{r.name}</div>
                          {tab === "すべて" && <div className="text-[11px] text-ink-400">{r.track}</div>}
                        </td>
                        <td className="px-4 py-3 text-ink-600">
                          <span className={r.surface === "芝" ? "text-emerald-600" : "text-amber-700"}>{r.surface}</span>
                          <span className="tnum"> {r.distance}m</span>
                        </td>
                        <td className="tnum px-4 py-3 text-center text-ink-600">{r.headcount}</td>
                        <td className="px-4 py-3">
                          <CardStatusBadge status={r.cardStatus} />
                        </td>
                        <td className="px-4 py-3">
                          <ResultStatusBadge status={r.resultStatus} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {r.cardStatus === "未生成" ? (
                              <Button variant="outline" className="!px-3 !py-1.5" onClick={(e) => runCard(r, e)} loading={busy[r.id]}>
                                {!busy[r.id] && <CloudDownload size={14} />} 出走表生成
                              </Button>
                            ) : r.resultStatus === "確定" ? (
                              <Button className="!px-3 !py-1.5" onClick={(e) => runResult(r, e)} loading={busy[r.id]}>
                                {!busy[r.id] && <Upload size={14} />} 結果を掲載
                              </Button>
                            ) : busy[r.id] ? (
                              <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                                <Spinner size={13} /> 処理中
                              </span>
                            ) : (
                              <ChevronRight size={18} className="text-ink-300" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
