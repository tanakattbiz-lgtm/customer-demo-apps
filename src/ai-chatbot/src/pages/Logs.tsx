import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MessagesSquare, Filter } from "lucide-react";
import { useStore } from "../store";
import type { SessionStatus } from "../data/seed";
import { Card, Pill, StatusDot, Skeleton, EmptyState, inputCls } from "../components/ui";
import { relTime, statusTone } from "../lib/format";
import { useLoad } from "../lib/useLoad";

const STATUSES: (SessionStatus | "すべて")[] = ["すべて", "解決済み", "未解決", "有人対応"];

export function Logs() {
  const sessions = useStore((s) => s.sessions);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<SessionStatus | "すべて">("すべて");
  const loading = useLoad([]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return [...sessions]
      .sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt))
      .filter((s) => (status === "すべて" ? true : s.status === status))
      .filter((s) =>
        !kw
          ? true
          : s.messages.some((m) => m.text.toLowerCase().includes(kw)) ||
            s.visitor.toLowerCase().includes(kw),
      );
  }, [sessions, q, status]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { すべて: sessions.length };
    for (const st of ["解決済み", "未解決", "有人対応"] as SessionStatus[])
      c[st] = sessions.filter((s) => s.status === st).length;
    return c;
  }, [sessions]);

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 lg:p-8">
      {/* フィルター */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="会話内容・訪問者で検索…"
            className={inputCls + " pl-9"}
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter size={15} className="hidden shrink-0 text-ink-400 sm:block" />
          {STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => setStatus(st)}
              className={
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition " +
                (status === st
                  ? "bg-brand-600 text-white"
                  : "border border-ink-200 bg-white text-ink-600 hover:bg-ink-50")
              }
            >
              {st}
              <span className="ml-1 opacity-70 tnum">{counts[st] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MessagesSquare size={26} />}
            title="該当する会話がありません"
            description="検索条件やステータスの絞り込みを変更してみてください。"
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((s) => {
            const firstQ = s.messages.find((m) => m.role === "user")?.text ?? "—";
            const turns = s.messages.length;
            return (
              <Link key={s.id} to={`/logs/${s.id}`}>
                <Card className="p-4 transition hover:border-brand-300 hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <StatusDot tone={statusTone(s.status)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-ink-900">{firstQ}</span>
                        {s.live && <Pill tone="violet">New</Pill>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-400">
                        <span>{s.visitor}</span>
                        <span>・{s.channel}</span>
                        <span>・{turns}往復</span>
                        {s.rating && (
                          <span className="text-amber-500">
                            ★ {s.rating}.0
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Pill tone={statusTone(s.status)}>{s.status}</Pill>
                      <span className="text-xs text-ink-400">{relTime(s.startedAt)}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
