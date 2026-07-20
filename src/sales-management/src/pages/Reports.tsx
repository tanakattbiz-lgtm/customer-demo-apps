import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import {
  Plus,
  Download,
  Upload,
  Search,
  ClipboardList,
  SearchX,
  Pencil,
  Trash2,
} from "lucide-react";
import { useStore, repOf } from "../store";
import type { Report } from "../data/seed";
import PageHeader from "../components/PageHeader";
import { Card, Button, Modal, Confirm, EmptyState, Skeleton, Avatar, Pill } from "../components/ui";
import ReportForm from "../components/ReportForm";
import { useLoad } from "../lib/useLoad";
import { yen, ymd, md, toCSV, downloadCSV, parseCSV } from "../lib/format";
import { visibleReports, sumKpi, recentMonths } from "../lib/metrics";

const CSV_HEADERS = ["日付", "担当者", "訪問", "商談", "提案", "受注", "受注金額", "商談先", "所感"];

export default function Reports() {
  const reports = useStore((s) => s.reports);
  const reps = useStore((s) => s.reps);
  const currentUserId = useStore((s) => s.currentUserId);
  const me = repOf(reps, currentUserId);
  const isAdmin = me?.role === "管理者";
  const deleteReport = useStore((s) => s.deleteReport);
  const importReports = useStore((s) => s.importReports);

  const months = useMemo(() => recentMonths(6), []);
  const [q, setQ] = useState("");
  const [repFilter, setRepFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const loading = useLoad([currentUserId]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Report | null>(null);
  const [detail, setDetail] = useState<Report | null>(null);
  const [toDelete, setToDelete] = useState<Report | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const scoped = useMemo(() => visibleReports(reports, me), [reports, me]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return scoped.filter((r) => {
      if (repFilter !== "all" && r.repId !== repFilter) return false;
      if (monthFilter !== "all" && r.date.slice(0, 7) !== monthFilter) return false;
      if (kw) {
        const rep = repOf(reps, r.repId);
        const hay = `${r.client} ${r.note} ${rep?.name ?? ""}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }, [scoped, q, repFilter, monthFilter, reps]);

  const totals = useMemo(() => sumKpi(filtered), [filtered]);
  const canModify = (r: Report) => isAdmin || r.repId === currentUserId;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (r: Report) => {
    setDetail(null);
    setEditing(r);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 450));
    deleteReport(toDelete.id);
    setDeleting(false);
    setToDelete(null);
    setDetail(null);
    toast.success("日報を削除しました");
  };

  // ---- CSV 出力 ----
  const exportCSV = () => {
    if (filtered.length === 0) {
      toast.error("出力対象のデータがありません。");
      return;
    }
    const rows = filtered.map((r) => [
      r.date,
      repOf(reps, r.repId)?.name ?? "",
      r.visits,
      r.meetings,
      r.proposals,
      r.deals,
      r.amount,
      r.client,
      r.note,
    ]);
    downloadCSV(`日報_${new Date().toISOString().slice(0, 10)}.csv`, toCSV(CSV_HEADERS, rows));
    toast.success(`${rows.length} 件を CSV に出力しました`);
  };

  // ---- CSV 取込 ----
  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length < 2) throw new Error("empty");
      const body = rows.slice(1); // 先頭はヘッダ
      const nameToId = new Map(reps.map((r) => [r.name, r.id]));
      const parsed = body.map((c) => {
        const repId = nameToId.get((c[1] ?? "").trim()) ?? currentUserId;
        return {
          repId: isAdmin ? repId : currentUserId,
          date: (c[0] ?? "").trim() || new Date().toISOString().slice(0, 10),
          visits: toInt(c[2]),
          meetings: toInt(c[3]),
          proposals: toInt(c[4]),
          deals: toInt(c[5]),
          amount: toInt(c[6]),
          client: (c[7] ?? "―").trim() || "―",
          note: (c[8] ?? "").trim() || "（CSV 取込）",
        };
      });
      const n = importReports(parsed);
      toast.success(`CSV から ${n} 件の日報を取り込みました`);
    } catch {
      toast.error("CSV の読み込みに失敗しました。フォーマットをご確認ください。");
    }
  };

  return (
    <div>
      <PageHeader
        title="日報・売上"
        subtitle={
          isAdmin
            ? "全メンバーの日報と受注実績です。検索・絞り込み・CSV 入出力に対応。"
            : `${me?.name} さんの日報一覧です。ご自身の記録のみ表示されます。`
        }
        actions={
          <>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onImport} />
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload size={16} /> CSV取込
            </Button>
            <Button variant="outline" onClick={exportCSV}>
              <Download size={16} /> CSV出力
            </Button>
            <Button onClick={openCreate}>
              <Plus size={16} /> 日報を登録
            </Button>
          </>
        }
      />

      {/* ---- フィルタ ---- */}
      <Card className="mb-4 p-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="商談先・所感・担当者で検索…"
              className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25"
            />
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <select
                value={repFilter}
                onChange={(e) => setRepFilter(e.target.value)}
                className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-700 outline-none focus:border-brand-400"
              >
                <option value="all">全担当者</option>
                {reps
                  .filter((r) => r.role === "社員")
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
              </select>
            )}
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-700 outline-none focus:border-brand-400"
            >
              <option value="all">全期間</option>
              {months.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* 集計ストリップ */}
        {!loading && (
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-ink-100 px-1 pt-3 text-xs text-ink-500">
            <span>
              件数 <b className="tnum text-ink-800">{filtered.length}</b>
            </span>
            <span>
              受注金額計 <b className="tnum text-ink-800">{yen(totals.amount)}</b>
            </span>
            <span>
              受注 <b className="tnum text-ink-800">{totals.deals}</b> 件
            </span>
            <span>
              商談 <b className="tnum text-ink-800">{totals.meetings}</b> 件
            </span>
          </div>
        )}
      </Card>

      {/* ---- 一覧 ---- */}
      {loading ? (
        <ListSkeleton />
      ) : filtered.length === 0 ? (
        <Card>
          {scoped.length === 0 ? (
            <EmptyState
              icon={<ClipboardList size={26} />}
              title="日報がまだありません"
              description="最初の日報を登録して、営業活動の記録を始めましょう。"
              action={
                <Button onClick={openCreate}>
                  <Plus size={16} /> 日報を登録
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<SearchX size={26} />}
              title="該当する結果がありません"
              description="検索条件・絞り込みを変更してお試しください。"
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQ("");
                    setRepFilter("all");
                    setMonthFilter("all");
                  }}
                >
                  条件をクリア
                </Button>
              }
            />
          )}
        </Card>
      ) : (
        <>
          {/* デスクトップ:テーブル */}
          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50 text-left text-xs text-ink-500">
                    <th className="px-4 py-3 font-medium">日付</th>
                    <th className="px-4 py-3 font-medium">担当者</th>
                    <th className="px-3 py-3 text-center font-medium">訪問</th>
                    <th className="px-3 py-3 text-center font-medium">商談</th>
                    <th className="px-3 py-3 text-center font-medium">提案</th>
                    <th className="px-3 py-3 text-center font-medium">受注</th>
                    <th className="px-4 py-3 text-right font-medium">受注金額</th>
                    <th className="px-4 py-3 font-medium">商談先</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {filtered.map((r) => {
                      const rep = repOf(reps, r.repId);
                      return (
                        <motion.tr
                          key={r.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, backgroundColor: "oklch(94% 0.02 20)" }}
                          onClick={() => setDetail(r)}
                          className="cursor-pointer border-b border-ink-100 transition last:border-0 hover:bg-brand-50/40"
                        >
                          <td className="tnum whitespace-nowrap px-4 py-3 text-ink-700">{md(r.date)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Avatar name={rep?.name ?? "?"} color={rep?.color} size={26} />
                              <span className="whitespace-nowrap text-ink-800">{rep?.name}</span>
                            </div>
                          </td>
                          <td className="tnum px-3 py-3 text-center text-ink-600">{r.visits}</td>
                          <td className="tnum px-3 py-3 text-center text-ink-600">{r.meetings}</td>
                          <td className="tnum px-3 py-3 text-center text-ink-600">{r.proposals}</td>
                          <td className="px-3 py-3 text-center">
                            {r.deals > 0 ? (
                              <Pill tone="green">{r.deals}</Pill>
                            ) : (
                              <span className="text-ink-300">—</span>
                            )}
                          </td>
                          <td className="tnum whitespace-nowrap px-4 py-3 text-right font-medium text-ink-800">
                            {r.amount > 0 ? yen(r.amount) : <span className="text-ink-300">—</span>}
                          </td>
                          <td className="max-w-[180px] truncate px-4 py-3 text-ink-600">{r.client}</td>
                          <td className="px-4 py-3 text-right">
                            {canModify(r) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEdit(r);
                                }}
                                className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-ink-100 hover:text-brand-600"
                                aria-label="編集"
                              >
                                <Pencil size={15} />
                              </button>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </Card>

          {/* モバイル:カード */}
          <div className="space-y-2.5 md:hidden">
            {filtered.map((r) => {
              const rep = repOf(reps, r.repId);
              return (
                <Card key={r.id} className="p-3.5" >
                  <button className="block w-full text-left" onClick={() => setDetail(r)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar name={rep?.name ?? "?"} color={rep?.color} size={28} />
                        <div className="leading-tight">
                          <div className="text-sm font-medium text-ink-800">{rep?.name}</div>
                          <div className="tnum text-[11px] text-ink-400">{md(r.date)}</div>
                        </div>
                      </div>
                      {r.deals > 0 ? (
                        <span className="tnum text-sm font-semibold text-emerald-600">{yen(r.amount)}</span>
                      ) : (
                        <Pill tone="gray">受注なし</Pill>
                      )}
                    </div>
                    <div className="mt-2 flex gap-3 text-[11px] text-ink-500">
                      <span>訪問 {r.visits}</span>
                      <span>商談 {r.meetings}</span>
                      <span>提案 {r.proposals}</span>
                      <span>受注 {r.deals}</span>
                    </div>
                    <div className="mt-1.5 truncate text-xs text-ink-500">{r.client} ／ {r.note}</div>
                  </button>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* ---- 登録/編集フォーム ---- */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "日報を編集" : "日報を登録"}
        width={600}
      >
        <ReportForm editing={editing} onDone={() => setFormOpen(false)} />
      </Modal>

      {/* ---- 詳細 ---- */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="日報の詳細" width={520}>
        {detail && <ReportDetail report={detail} onEdit={() => openEdit(detail)} onDelete={() => setToDelete(detail)} canModify={canModify(detail)} />}
      </Modal>

      {/* ---- 削除確認 ---- */}
      <Confirm
        open={!!toDelete}
        title="日報を削除しますか?"
        message={toDelete ? `${ymd(toDelete.date)} の日報を削除します。この操作は取り消せません。` : ""}
        confirmLabel="削除する"
        danger
        loading={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function toInt(v: string | undefined): number {
  const n = Number((v ?? "").toString().replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

// ---------------- Detail ----------------
function ReportDetail({
  report,
  onEdit,
  onDelete,
  canModify,
}: {
  report: Report;
  onEdit: () => void;
  onDelete: () => void;
  canModify: boolean;
}) {
  const reps = useStore((s) => s.reps);
  const rep = repOf(reps, report.repId);
  const kpi = [
    { label: "訪問", value: report.visits },
    { label: "商談", value: report.meetings },
    { label: "提案", value: report.proposals },
    { label: "受注", value: report.deals },
  ];
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar name={rep?.name ?? "?"} color={rep?.color} size={38} />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-ink-900">{rep?.name}</div>
            <div className="text-xs text-ink-400">{rep?.team}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="tnum text-sm font-semibold text-ink-800">{ymd(report.date)}</div>
          {report.deals > 0 && (
            <div className="tnum text-xs font-semibold text-emerald-600">{yen(report.amount)}</div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {kpi.map((k) => (
          <div key={k.label} className="rounded-xl border border-ink-100 bg-ink-50 py-2.5 text-center">
            <div className="tnum text-lg font-bold text-ink-900">{k.value}</div>
            <div className="text-[11px] text-ink-500">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="mb-1 text-xs font-medium text-ink-500">主要商談先</div>
        <div className="text-sm text-ink-800">{report.client}</div>
      </div>
      <div className="mt-3">
        <div className="mb-1 text-xs font-medium text-ink-500">所感・活動内容</div>
        <p className="whitespace-pre-wrap rounded-xl bg-ink-50 p-3 text-sm leading-relaxed text-ink-700">
          {report.note}
        </p>
      </div>

      {canModify && (
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="danger" onClick={onDelete}>
            <Trash2 size={15} /> 削除
          </Button>
          <Button variant="outline" onClick={onEdit}>
            <Pencil size={15} /> 編集
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------- Skeleton ----------------
function ListSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-ink-100 bg-ink-50 px-4 py-3">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="divide-y divide-ink-100">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="ml-auto h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </Card>
  );
}
