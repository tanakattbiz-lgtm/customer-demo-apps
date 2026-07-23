import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Search,
  Trash2,
  X,
  FileText,
  ArrowRight,
  Inbox,
  Printer,
} from "lucide-react";
import { useStore } from "../store";
import { useLoad } from "../lib/fakeApi";
import type { Worksheet, WsStatus } from "../data/seed";
import { StatusBadge, Skeleton, EmptyState, Field } from "../components/ui";

const FILTERS: (WsStatus | "すべて")[] = ["すべて", "確定", "要確認", "下書き"];

function DetailModal({
  ws,
  onClose,
}: {
  ws: Worksheet;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-ink-900/45"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.22 }}
        className="thin-scroll relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:max-w-2xl sm:rounded-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-ink-400 transition-colors hover:text-ink-700"
        >
          <X size={20} />
        </button>

        {/* 指示書ヘッダ */}
        <div className="flex items-start justify-between border-b border-ink-200 pb-4">
          <div>
            <p className="text-xs text-ink-500">作業指示書</p>
            <p className="mono mt-0.5 text-lg font-bold text-ink-900">{ws.no}</p>
          </div>
          <div className="text-right">
            <StatusBadge status={ws.status} />
            <p className="mt-1.5 text-xs text-ink-400">
              発行 {format(new Date(ws.createdAt), "yyyy/MM/dd HH:mm")}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 py-5 sm:grid-cols-3">
          <Field label="取引先" value={ws.client} />
          <Field label="品番" value={ws.partCode} mono />
          <Field label="品名" value={ws.partName} />
          <Field
            label="数量"
            value={
              ws.quantity !== null
                ? `${ws.quantity.toLocaleString()} ${ws.unit}`
                : "—"
            }
          />
          <Field label="加工区分" value={ws.category} />
          <Field label="材料" value={ws.material} />
          <Field label="表面処理" value={ws.surface} />
          <Field
            label="納期"
            value={ws.dueDate ? format(new Date(ws.dueDate), "yyyy/MM/dd") : "—"}
          />
        </dl>

        <div className="border-t border-ink-200 py-4">
          <p className="mb-2 text-xs text-ink-500">工程</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {ws.process.length ? (
              ws.process.map((p, i) => (
                <span key={p} className="flex items-center gap-1.5">
                  <span className="rounded-md bg-brand-50 px-2 py-1 text-xs text-brand-700">
                    {i + 1}. {p}
                  </span>
                  {i < ws.process.length - 1 && (
                    <ArrowRight size={12} className="text-ink-300" />
                  )}
                </span>
              ))
            ) : (
              <span className="text-sm text-ink-400">—</span>
            )}
          </div>
        </div>

        {ws.note && (
          <div className="border-t border-ink-200 py-4">
            <p className="mb-1 text-xs text-ink-500">特記事項</p>
            <p className="text-sm text-ink-700">{ws.note}</p>
          </div>
        )}

        <div className="border-t border-ink-200 pt-4">
          <p className="mb-1 text-xs text-ink-500">取り込んだオーダー原文</p>
          <pre className="thin-scroll mono max-h-32 overflow-y-auto whitespace-pre-wrap rounded-lg bg-ink-50 p-3 text-xs text-ink-600">
            {ws.raw}
          </pre>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => toast("このデモでは印刷/PDF出力は省略しています")}
            className="flex items-center gap-2 rounded-lg border border-ink-200 px-4 py-2 text-sm text-ink-600 transition-colors hover:bg-ink-100"
          >
            <Printer size={15} />
            指示書を出力
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            閉じる
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function HistoryPage() {
  const worksheets = useStore((s) => s.worksheets);
  const removeWorksheet = useStore((s) => s.removeWorksheet);
  const loading = useLoad(560);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("すべて");
  const [detail, setDetail] = useState<Worksheet | null>(null);
  const [confirm, setConfirm] = useState<Worksheet | null>(null);

  const rows = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return worksheets.filter((w) => {
      if (filter !== "すべて" && w.status !== filter) return false;
      if (!kw) return true;
      return [w.no, w.client, w.partCode, w.partName].some((v) =>
        v.toLowerCase().includes(kw),
      );
    });
  }, [worksheets, q, filter]);

  const doDelete = () => {
    if (!confirm) return;
    removeWorksheet(confirm.id);
    toast.success(`${confirm.no} を削除しました`);
    setConfirm(null);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink-900">変換履歴</h2>
          <p className="mt-1 text-sm text-ink-500">
            変換・保存した作業指示書を一覧で管理します（全 {worksheets.length} 件）。
          </p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <FileText size={16} />
          新規変換
        </Link>
      </div>

      {/* 検索・絞り込み */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="指示書番号・取引先・品番・品名で検索"
            className="w-full rounded-lg border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="flex gap-1 rounded-lg border border-ink-200 bg-white p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-brand-600 text-white"
                  : "text-ink-500 hover:bg-ink-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* テーブル */}
      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs text-ink-500">
                <th className="px-4 py-2.5 font-medium">指示書番号</th>
                <th className="px-4 py-2.5 font-medium">取引先</th>
                <th className="px-4 py-2.5 font-medium">品番 / 品名</th>
                <th className="px-4 py-2.5 text-right font-medium">数量</th>
                <th className="px-4 py-2.5 font-medium">納期</th>
                <th className="px-4 py-2.5 font-medium">状態</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-ink-100">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6">
                    {worksheets.length === 0 ? (
                      <EmptyState
                        icon={<Inbox size={22} />}
                        title="変換済みの指示書がありません"
                        desc="オーダーを取り込んで最初の作業指示書を作成しましょう。"
                        action={
                          <Link
                            to="/"
                            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                          >
                            オーダーを変換する
                          </Link>
                        }
                      />
                    ) : (
                      <p className="py-6 text-center text-sm text-ink-500">
                        「{q}」に該当する結果がありません。
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                rows.map((w) => (
                  <tr
                    key={w.id}
                    onClick={() => setDetail(w)}
                    className="cursor-pointer border-b border-ink-100 transition-colors last:border-0 hover:bg-brand-50/40"
                  >
                    <td className="whitespace-nowrap px-4 py-3 mono text-ink-800">
                      {w.no}
                    </td>
                    <td className="px-4 py-3 text-ink-700">{w.client}</td>
                    <td className="px-4 py-3">
                      <div className="mono text-xs text-ink-500">{w.partCode}</div>
                      <div className="text-ink-800">{w.partName}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tnum text-ink-700">
                      {w.quantity !== null
                        ? `${w.quantity.toLocaleString()} ${w.unit}`
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tnum text-ink-600">
                      {w.dueDate ? format(new Date(w.dueDate), "MM/dd") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={w.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirm(w);
                        }}
                        className="rounded-md p-1.5 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label="削除"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 詳細モーダル */}
      <AnimatePresence>
        {detail && (
          <DetailModal ws={detail} onClose={() => setDetail(null)} />
        )}
      </AnimatePresence>

      {/* 削除確認 */}
      <AnimatePresence>
        {confirm && (
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink-900/45"
              onClick={() => setConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
            >
              <div className="flex items-start gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
                  <Trash2 size={16} />
                </div>
                <div>
                  <p className="font-semibold text-ink-900">指示書を削除しますか？</p>
                  <p className="mt-1 text-sm text-ink-500">
                    <span className="mono">{confirm.no}</span>（{confirm.partName}）を
                    削除します。この操作は取り消せません。
                  </p>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setConfirm(null)}
                  className="rounded-lg border border-ink-200 px-4 py-2 text-sm text-ink-600 transition-colors hover:bg-ink-100"
                >
                  キャンセル
                </button>
                <button
                  onClick={doDelete}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  削除する
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
