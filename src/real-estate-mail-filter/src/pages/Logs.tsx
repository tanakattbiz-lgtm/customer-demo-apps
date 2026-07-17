import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Paperclip,
  SearchX,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { useStore } from "../store";
import { useRows, type Row } from "../lib/rows";
import { useLoad } from "../lib/useLoad";
import { Badge, Card, EmptyState, TableSkeleton } from "../components/ui";
import { ActionBadge, MailDrawer } from "../components/MailDrawer";

type Tab = "all" | "label" | "archive" | "skip";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "label", label: "要確認" },
  { key: "archive", label: "アーカイブ" },
  { key: "skip", label: "対象外(通常業務メール)" },
];

const PER_PAGE = 10;

export function Logs() {
  const loading = useLoad(600);
  const { conditions, reviewed, toggleReviewed } = useStore();
  const rows = useRows(conditions);
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Row | null>(null);

  const counts = useMemo(
    () => ({
      all: rows.length,
      label: rows.filter((r) => r.j.action === "label").length,
      archive: rows.filter((r) => r.j.action === "archive").length,
      skip: rows.filter((r) => r.j.action === "skip").length,
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const kw = q.trim();
    return rows.filter((r) => {
      if (tab !== "all" && r.j.action !== tab) return false;
      if (!kw) return true;
      const ex = r.mail.extracted;
      const hay = [
        r.mail.subject,
        r.mail.from,
        ex ? `${ex.pref}${ex.city} ${ex.structure}` : "",
      ].join(" ");
      return hay.includes(kw);
    });
  }, [rows, tab, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const pageRows = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const changeTab = (t: Tab) => {
    setTab(t);
    setPage(1);
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="text-lg font-bold text-ink-900">判定ログ</h1>
        <p className="mt-1 text-xs text-ink-500">
          受信したメール1通ごとの判定結果です。行をクリックすると、抽出項目・判定理由・実行した処理を確認できます。
        </p>
      </header>

      <Card>
        {/* フィルタ */}
        <div className="flex flex-col gap-3 border-b border-ink-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => changeTab(t.key)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors duration-150 ease-out ${
                  tab === t.key
                    ? "bg-brand-600 text-white"
                    : "text-ink-600 hover:bg-ink-100"
                }`}
              >
                {t.label}
                <span className="tnum ml-1.5 opacity-70">{counts[t.key]}</span>
              </button>
            ))}
          </div>
          <div className="relative sm:w-56">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="件名・差出人・所在地で検索"
              className="w-full rounded-lg border border-ink-300 py-1.5 pl-8 pr-3 text-[12px] text-ink-800 transition-colors duration-150 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={8} />
        ) : pageRows.length === 0 ? (
          <EmptyState
            icon={<SearchX size={20} />}
            title="該当する結果がありません"
            desc="検索キーワードまたは絞り込みの条件を変更してお試しください。"
          />
        ) : (
          <>
            {/* 見出し(PC) */}
            <div className="hidden grid-cols-[110px_1fr_190px_150px] gap-4 border-b border-ink-200 bg-ink-50 px-6 py-2 text-[11px] font-medium text-ink-500 lg:grid">
              <span>受信</span>
              <span>差出人 / 件名</span>
              <span>抽出項目</span>
              <span>判定 / 処理</span>
            </div>

            <ul className="divide-y divide-ink-200">
              {pageRows.map((r, i) => {
                const ex = r.mail.extracted;
                return (
                  <motion.li
                    key={r.mail.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.18, delay: Math.min(i * 0.02, 0.12) }}
                  >
                    <button
                      onClick={() => setSelected(r)}
                      className="grid w-full grid-cols-1 gap-2 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-ink-50 sm:px-6 lg:grid-cols-[110px_1fr_190px_150px] lg:items-center lg:gap-4"
                    >
                      <span className="tnum text-[11px] text-ink-500">
                        {format(r.at, "M/d(E) HH:mm", { locale: ja })}
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate text-[11px] text-ink-500">
                          {r.mail.from}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5">
                          <span className="truncate text-[13px] font-medium text-ink-900">
                            {r.mail.subject}
                          </span>
                          {r.mail.attachment && (
                            <Paperclip size={11} className="shrink-0 text-ink-400" />
                          )}
                        </span>
                      </span>

                      <span className="min-w-0">
                        {ex ? (
                          <>
                            <span className="tnum block truncate text-[12px] text-ink-700">
                              {ex.pref}
                              {ex.city}
                            </span>
                            <span className="tnum mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-500">
                              {ex.structure} / 築{r.j.age}年
                              {ex.source === "添付PDF" && (
                                <FileText size={10} className="text-brand-500" />
                              )}
                            </span>
                          </>
                        ) : (
                          <span className="text-[11px] text-ink-400">
                            物件情報なし(抽出対象外)
                          </span>
                        )}
                      </span>

                      <span className="flex flex-wrap items-center gap-1.5">
                        {r.j.isProperty ? (
                          r.j.matched ? (
                            <Badge tone="ok">条件合致</Badge>
                          ) : (
                            <Badge tone="muted">条件外</Badge>
                          )
                        ) : (
                          <Badge tone="muted">通常業務メール</Badge>
                        )}
                        <ActionBadge row={r} />
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </ul>

            {/* ページネーション */}
            <div className="flex items-center justify-between gap-3 border-t border-ink-200 px-4 py-3 sm:px-6">
              <p className="tnum text-[11px] text-ink-500">
                {filtered.length} 件中 {(current - 1) * PER_PAGE + 1}〜
                {Math.min(current * PER_PAGE, filtered.length)} 件を表示
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={current === 1}
                  className="rounded-md border border-ink-300 p-1.5 text-ink-600 transition-colors duration-150 hover:bg-ink-50 disabled:opacity-40"
                  aria-label="前のページ"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="tnum px-2 text-[11px] text-ink-600">
                  {current} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={current === totalPages}
                  className="rounded-md border border-ink-300 p-1.5 text-ink-600 transition-colors duration-150 hover:bg-ink-50 disabled:opacity-40"
                  aria-label="次のページ"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      <MailDrawer
        row={selected}
        cond={conditions}
        reviewed={selected ? !!reviewed[selected.mail.id] : false}
        onToggleReviewed={toggleReviewed}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
