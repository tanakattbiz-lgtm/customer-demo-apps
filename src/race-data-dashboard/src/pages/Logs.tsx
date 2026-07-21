import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Info,
  CircleCheck,
  TriangleAlert,
  CircleAlert,
  ScrollText,
  Search,
} from "lucide-react";
import { useStore } from "../store";
import { useLoad } from "../lib/useLoad";
import { relTime, clockTime } from "../lib/format";
import type { LogLevel } from "../data/seed";
import { Card, Skeleton, Pill, EmptyState, inputCls } from "../components/ui";

const LEVEL_META: Record<LogLevel, { icon: React.ReactNode; label: string; tone: "blue" | "green" | "amber" | "red" }> = {
  info: { icon: <Info size={16} className="text-sky-500" />, label: "情報", tone: "blue" },
  success: { icon: <CircleCheck size={16} className="text-emerald-500" />, label: "成功", tone: "green" },
  warn: { icon: <TriangleAlert size={16} className="text-amber-500" />, label: "警告", tone: "amber" },
  error: { icon: <CircleAlert size={16} className="text-rose-500" />, label: "エラー", tone: "red" },
};

const FILTERS: { key: "all" | LogLevel; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "success", label: "成功" },
  { key: "info", label: "情報" },
  { key: "warn", label: "警告" },
  { key: "error", label: "エラー" },
];

export default function Logs() {
  const loading = useLoad();
  const navigate = useNavigate();
  const logs = useStore((s) => s.logs);
  const [filter, setFilter] = useState<"all" | LogLevel>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: logs.length, info: 0, success: 0, warn: 0, error: 0 };
    logs.forEach((l) => (c[l.level] += 1));
    return c;
  }, [logs]);

  const shown = useMemo(() => {
    const kw = q.trim();
    return logs.filter((l) => {
      if (filter !== "all" && l.level !== filter) return false;
      if (kw && !(`${l.job} ${l.message} ${l.raceLabel ?? ""}`.includes(kw))) return false;
      return true;
    });
  }, [logs, filter, q]);

  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <ScrollText size={22} className="text-brand-600" />
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">実行ログ</h1>
        <Pill tone="gray" className="!px-2.5">
          {logs.length} 件
        </Pill>
      </div>

      {/* フィルタ + 検索 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition " +
              (filter === f.key
                ? "bg-brand-600 text-white shadow-sm"
                : "border border-ink-200 bg-white text-ink-600 hover:bg-ink-100")
            }
          >
            {f.label}
            <span className="tnum ml-1.5 opacity-70">{counts[f.key]}</span>
          </button>
        ))}
        <div className="relative ml-auto w-full sm:w-64">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            className={inputCls + " !pl-9"}
            placeholder="ジョブ・メッセージを検索"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <EmptyState
            icon={<Search size={22} />}
            title="該当するログがありません"
            description="フィルタや検索条件を変更してください。"
          />
        ) : (
          <ul className="divide-y divide-ink-100">
            {shown.map((l) => {
              const m = LEVEL_META[l.level];
              return (
                <li
                  key={l.id}
                  className={
                    "flex items-start gap-3 px-4 py-3 transition sm:px-5 " +
                    (l.raceId ? "cursor-pointer hover:bg-ink-50" : "")
                  }
                  onClick={() => l.raceId && navigate(`/races/${l.raceId}`)}
                >
                  <span className="mt-0.5 shrink-0">{m.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={m.tone} className="!px-2 !py-0">
                        {m.label}
                      </Pill>
                      <span className="text-xs font-semibold text-ink-700">{l.job}</span>
                      {l.raceLabel && (
                        <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[11px] font-medium text-ink-600">
                          {l.raceLabel}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-sm text-ink-700">{l.message}</div>
                  </div>
                  <div className="shrink-0 text-right leading-tight">
                    <div className="tnum text-xs font-medium text-ink-600">{clockTime(l.at)}</div>
                    <div className="text-[11px] text-ink-400">{relTime(l.at)}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
