import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  FileSpreadsheet,
  Search,
  Wand2,
  MapPin,
  ArrowRight,
  Paperclip,
  CheckCircle2,
} from "lucide-react";
import { useStore } from "../store";
import { findAddress, type DocType } from "../data/seed";
import { fakeApi } from "../lib/fakeApi";
import {
  Button,
  Card,
  DocBadge,
  EmptyState,
  Skeleton,
  Stat,
  StatusBadge,
  yen,
} from "../components/ui";

export default function Import() {
  const { imported, rows, importList, generate } = useStore();
  const [importing, setImporting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState<"all" | DocType>("all");
  const [q, setQ] = useState("");
  const nav = useNavigate();

  const onImport = async () => {
    setImporting(true);
    await fakeApi(null, 700);
    importList();
    setImporting(false);
    toast.success("リスト.xlsx を取り込みました（50 件）");
  };

  const onGenerate = async () => {
    setGenerating(true);
    const ids = rows.filter((r) => r.status === "未生成").map((r) => r.id);
    await fakeApi(null, 900);
    generate(ids);
    setGenerating(false);
    toast.success(`書類を ${ids.length} 件生成しました`, {
      description: "書類A/B のPDFへ差し込み済みです",
    });
  };

  const summary = useMemo(() => {
    const a = rows.filter((r) => r.docType === "A").length;
    const b = rows.filter((r) => r.docType === "B").length;
    const companies = new Set(rows.map((r) => r.company));
    const unmatched = [...companies].filter((c) => !findAddress(c)).length;
    const done = rows.filter((r) => r.status === "生成済み").length;
    return { a, b, uniq: companies.size, unmatched, done };
  }, [rows]);

  const shown = useMemo(() => {
    return rows.filter((r) => {
      if (filter !== "all" && r.docType !== filter) return false;
      if (q && !(`${r.company}${r.item}${r.refNo}`.includes(q))) return false;
      return true;
    });
  }, [rows, filter, q]);

  if (!imported && !importing) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHead />
        <div className="mt-6">
          <EmptyState
            icon={<FileSpreadsheet size={22} />}
            title="リストを取り込んで始めましょう"
            desc="リスト.xlsx を読み込むと、C列の書類種別で書類A/Bへ自動振り分けし、F列の企業名を住所録と照合します。"
            action={
              <div className="mt-1 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-600">
                  <Paperclip size={15} className="text-ink-400" />
                  リスト.xlsx
                  <span className="text-ink-400">・50 行 / 7 列</span>
                </div>
                <Button icon={<FileSpreadsheet size={16} />} onClick={onImport}>
                  リスト.xlsx を取り込む
                </Button>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHead />
        <Button
          icon={<Wand2 size={16} />}
          loading={generating}
          onClick={onGenerate}
          disabled={summary.done === rows.length && rows.length > 0}
        >
          {summary.done === rows.length && rows.length > 0
            ? "すべて生成済み"
            : "書類を一括生成"}
        </Button>
      </div>

      {/* サマリー */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {importing ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[76px]" />
          ))
        ) : (
          <>
            <Stat label="総件数" value={rows.length} sub="取り込み済み" />
            <Stat label="書類A（納品書）" value={summary.a} tone="brand" />
            <Stat label="書類B（請求書）" value={summary.b} tone="teal" />
            <Stat label="宛先（重複除く）" value={summary.uniq} sub="ラベル対象" />
            <Stat
              label="住所未照合"
              value={summary.unmatched}
              tone={summary.unmatched ? "amber" : "ink"}
              sub="要・住所録追加"
            />
          </>
        )}
      </div>

      {/* フィルタ + 検索 */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-ink-200 bg-white p-0.5">
          {(
            [
              ["all", "すべて"],
              ["A", "書類A"],
              ["B", "書類B"],
            ] as const
          ).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === v
                  ? "bg-brand-600 text-white"
                  : "text-ink-600 hover:bg-ink-100"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="企業名・品名・伝票番号で検索"
            className="w-full rounded-lg border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      {/* テーブル */}
      <Card className="mt-3 overflow-hidden">
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs text-ink-500">
                <th className="px-4 py-2.5 font-medium">No.</th>
                <th className="px-3 py-2.5 font-medium">C列・書類</th>
                <th className="px-3 py-2.5 font-medium">F列・宛先企業</th>
                <th className="px-3 py-2.5 font-medium">住所照合</th>
                <th className="px-3 py-2.5 font-medium">品名 / 件名</th>
                <th className="px-3 py-2.5 text-right font-medium">金額</th>
                <th className="px-3 py-2.5 font-medium">状態</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {importing
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-ink-100">
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j} className="px-3 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : shown.map((r, i) => {
                    const addr = findAddress(r.company);
                    return (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(i, 12) * 0.015 }}
                        onClick={() => nav(`/documents?row=${r.id}`)}
                        className="cursor-pointer border-b border-ink-100 transition-colors last:border-0 hover:bg-brand-50/40"
                      >
                        <td className="px-4 py-2.5 tnum text-ink-400">
                          {String(r.no).padStart(2, "0")}
                        </td>
                        <td className="px-3 py-2.5">
                          <DocBadge type={r.docType} />
                        </td>
                        <td className="px-3 py-2.5 font-medium text-ink-800">
                          {r.company}
                        </td>
                        <td className="px-3 py-2.5">
                          {addr ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                              <CheckCircle2 size={13} />
                              照合済み
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-700">
                              <MapPin size={13} />
                              未照合
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-ink-600">
                          <span className="line-clamp-1">{r.item}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right tnum text-ink-800">
                          {yen(r.amount)}
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-3 py-2.5 text-ink-300">
                          <ArrowRight size={15} />
                        </td>
                      </motion.tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
        {!importing && shown.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-ink-500">
            該当する結果がありません
          </div>
        )}
      </Card>

      <p className="mt-3 text-xs text-ink-400">
        行をクリックすると、リストの値が書類A/BのPDFへ差し込まれた状態を確認できます。
      </p>
    </div>
  );
}

function PageHead() {
  return (
    <div>
      <h1 className="text-xl font-bold text-ink-900">取り込み・振り分け</h1>
      <p className="mt-1 text-sm text-ink-500">
        リスト.xlsx を取り込み、C列の書類種別で書類A/Bへ自動振り分け・住所録と照合します。
      </p>
    </div>
  );
}
