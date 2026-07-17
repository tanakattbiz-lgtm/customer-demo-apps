import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Inbox,
  Plus,
  Search,
  SearchX,
  X,
} from "lucide-react";
import { useStore } from "../store";
import {
  CATEGORIES,
  PRIORITY_LABEL,
  STAFF,
  STATUS_LABEL,
  STATUS_TONE,
  type Job,
  type Status,
} from "../data/seed";
import { fakeApi, useLoad } from "../lib/fakeApi";
import { Avatar, Button, Card, EmptyState, Pill, Skeleton, StatusDot, inputCls } from "../components/ui";

const PER_PAGE = 8;
const today = () => new Date().toISOString().slice(0, 10);

type SortKey = "dueDate" | "createdAt" | "priority";

const PRIORITY_ORDER = { high: 0, normal: 1, low: 2 } as const;

function ListSkeleton() {
  return (
    <div className="divide-y divide-ink-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="hidden h-5 w-16 rounded-full sm:block" />
          <Skeleton className="hidden h-7 w-7 rounded-full md:block" />
          <Skeleton className="hidden h-4 w-20 lg:block" />
        </div>
      ))}
    </div>
  );
}

/** CSV に変換（Excel で開けるよう BOM 付き） */
function toCsv(jobs: Job[]): string {
  const head = [
    "案件番号",
    "件名",
    "分類",
    "依頼元",
    "依頼部署",
    "担当者",
    "優先度",
    "ステータス",
    "期限",
    "見積工数(h)",
    "実績工数(h)",
    "金額(円)",
  ];
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = jobs.map((j) =>
    [
      j.code,
      j.title,
      j.category,
      j.requester,
      j.requesterDept,
      STAFF.find((s) => s.id === j.assigneeId)?.name ?? "未割当",
      PRIORITY_LABEL[j.priority],
      STATUS_LABEL[j.status],
      j.dueDate,
      j.estimateHours,
      j.actualHours,
      j.amount,
    ]
      .map(esc)
      .join(","),
  );
  return "﻿" + [head.map(esc).join(","), ...rows].join("\r\n");
}

export default function Jobs() {
  const loading = useLoad(560);
  const jobs = useStore((s) => s.jobs);
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status | "all">("all");
  const [assignee, setAssignee] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortKey>("dueDate");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    const out = jobs.filter((j) => {
      if (status !== "all" && j.status !== status) return false;
      if (category !== "all" && j.category !== category) return false;
      if (assignee === "none" ? j.assigneeId !== null : assignee !== "all" && j.assigneeId !== assignee)
        return false;
      if (!kw) return true;
      return (
        j.title.toLowerCase().includes(kw) ||
        j.code.toLowerCase().includes(kw) ||
        j.requester.toLowerCase().includes(kw)
      );
    });
    return out.sort((a, b) => {
      if (sort === "priority") return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (sort === "createdAt") return b.createdAt.localeCompare(a.createdAt);
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [jobs, q, status, assignee, category, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const filterOn = q !== "" || status !== "all" || assignee !== "all" || category !== "all";

  const resetFilters = () => {
    setQ("");
    setStatus("all");
    setAssignee("all");
    setCategory("all");
    setPage(1);
  };

  const exportCsv = async () => {
    setExporting(true);
    await fakeApi(null, 600);
    const blob = new Blob([toCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `案件一覧_${format(new Date(), "yyyyMMdd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
    toast.success(`${filtered.length}件をCSVに出力しました`);
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: jobs.length };
    for (const j of jobs) c[j.status] = (c[j.status] ?? 0) + 1;
    return c;
  }, [jobs]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">案件一覧</h1>
          <p className="mt-1 text-sm text-ink-500">
            各部署からの依頼を一元管理し、担当者と進捗を追跡します。
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" loading={exporting} onClick={exportCsv} disabled={!filtered.length}>
            {!exporting && <Download size={16} />}
            CSV出力
          </Button>
          <Button onClick={() => navigate("/jobs/new")}>
            <Plus size={16} />
            新規登録
          </Button>
        </div>
      </div>

      {/* ステータスタブ */}
      <div className="thin-scroll mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {(["all", "todo", "doing", "review", "done", "hold"] as const).map((s) => {
          const active = status === s;
          return (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={
                "flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition duration-150 " +
                (active
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50")
              }
            >
              {s !== "all" && <StatusDot tone={active ? "gray" : STATUS_TONE[s]} />}
              {s === "all" ? "すべて" : STATUS_LABEL[s]}
              <span className={"tnum " + (active ? "text-white/70" : "text-ink-400")}>
                {counts[s] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* 絞り込み */}
      <Card className="mb-4 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="件名・案件番号・依頼者で検索"
              className={inputCls + " pl-9"}
            />
          </div>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className={inputCls + " sm:w-40"}
          >
            <option value="all">分類：すべて</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={assignee}
            onChange={(e) => {
              setAssignee(e.target.value);
              setPage(1);
            }}
            className={inputCls + " sm:w-40"}
          >
            <option value="all">担当：すべて</option>
            <option value="none">未割当</option>
            {STAFF.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className={inputCls + " sm:w-36"}
          >
            <option value="dueDate">期限が近い順</option>
            <option value="createdAt">登録が新しい順</option>
            <option value="priority">優先度が高い順</option>
          </select>
        </div>
        {filterOn && (
          <div className="mt-2.5 flex items-center gap-2 border-t border-ink-100 pt-2.5 text-xs text-ink-500">
            <ArrowUpDown size={13} />
            <span className="tnum">{filtered.length}</span> 件に絞り込み中
            <button
              onClick={resetFilters}
              className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-ink-600 transition hover:bg-ink-100"
            >
              <X size={12} />
              条件をクリア
            </button>
          </div>
        )}
      </Card>

      {/* 一覧 */}
      <Card className="overflow-hidden">
        {loading ? (
          <ListSkeleton />
        ) : !jobs.length ? (
          <EmptyState
            icon={<Inbox size={24} />}
            title="案件がまだありません"
            description="最初の案件を登録して、部署からの依頼をここで管理しましょう。"
            action={
              <Button onClick={() => navigate("/jobs/new")}>
                <Plus size={16} />
                最初の案件を登録
              </Button>
            }
          />
        ) : !filtered.length ? (
          <EmptyState
            icon={<SearchX size={24} />}
            title="該当する結果がありません"
            description="検索条件を変更するか、条件をクリアしてもう一度お試しください。"
            action={
              <Button variant="outline" onClick={resetFilters}>
                条件をクリア
              </Button>
            }
          />
        ) : (
          <>
            {/* 見出し行（PC のみ） */}
            <div className="hidden border-b border-ink-100 bg-ink-50/60 px-5 py-2.5 text-[11px] font-semibold tracking-wide text-ink-500 lg:grid lg:grid-cols-[104px_1fr_92px_120px_92px_84px] lg:gap-4">
              <div>案件番号</div>
              <div>件名</div>
              <div>ステータス</div>
              <div>担当者</div>
              <div>期限</div>
              <div className="text-right">見積工数</div>
            </div>
            <div className="divide-y divide-ink-100">
              {rows.map((j, i) => {
                const staff = STAFF.find((s) => s.id === j.assigneeId);
                const late = j.status !== "done" && j.dueDate < today();
                return (
                  <motion.div
                    key={j.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: Math.min(i * 0.02, 0.12), ease: "easeOut" }}
                  >
                    <Link
                      to={`/jobs/${j.id}`}
                      className="block px-5 py-3.5 transition duration-150 hover:bg-ink-50 lg:grid lg:grid-cols-[104px_1fr_92px_120px_92px_84px] lg:items-center lg:gap-4"
                    >
                      <div className="tnum text-xs font-medium text-ink-400">{j.code}</div>
                      <div className="mt-1 min-w-0 lg:mt-0">
                        <div className="truncate text-sm font-medium text-ink-900">{j.title}</div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-400">
                          <span>{j.category}</span>
                          <span>·</span>
                          <span>
                            {j.requesterDept} {j.requester}
                          </span>
                          {j.priority === "high" && (
                            <Pill tone="red" className="ml-1">
                              優先度 高
                            </Pill>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 lg:mt-0 lg:contents">
                        <div>
                          <Pill tone={STATUS_TONE[j.status]}>
                            <StatusDot tone={STATUS_TONE[j.status]} />
                            {STATUS_LABEL[j.status]}
                          </Pill>
                        </div>
                        <div className="flex items-center gap-2">
                          {staff ? (
                            <>
                              <Avatar name={staff.name} color={staff.color} size={24} />
                              <span className="truncate text-xs text-ink-600">{staff.name}</span>
                            </>
                          ) : (
                            <span className="text-xs text-ink-400">未割当</span>
                          )}
                        </div>
                        <div
                          className={
                            "tnum text-xs " + (late ? "font-semibold text-rose-600" : "text-ink-600")
                          }
                        >
                          {format(parseISO(j.dueDate), "M/d")}
                          {late && <span className="ml-1 text-[10px]">超過</span>}
                        </div>
                        <div className="tnum text-xs text-ink-500 lg:text-right">
                          {j.estimateHours}h
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* ページネーション */}
            <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3">
              <div className="tnum text-xs text-ink-500">
                {filtered.length} 件中 {(current - 1) * PER_PAGE + 1}–
                {Math.min(current * PER_PAGE, filtered.length)} 件
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(current - 1)}
                  disabled={current <= 1}
                  aria-label="前へ"
                  className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="tnum px-2 text-xs text-ink-600">
                  {current} / {pageCount}
                </span>
                <button
                  onClick={() => setPage(current + 1)}
                  disabled={current >= pageCount}
                  aria-label="次へ"
                  className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
