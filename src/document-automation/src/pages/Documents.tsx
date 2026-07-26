import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Download, FileText, MapPin, Printer } from "lucide-react";
import { useStore } from "../store";
import { findAddress, type ListRow } from "../data/seed";
import { fakeApi } from "../lib/fakeApi";
import {
  Button,
  Card,
  DocBadge,
  EmptyState,
  yen,
} from "../components/ui";

export default function Documents() {
  const rows = useStore((s) => s.rows);
  const imported = useStore((s) => s.imported);
  const [params, setParams] = useSearchParams();
  const [exporting, setExporting] = useState(false);

  const selectedId = params.get("row") ?? rows[0]?.id;
  const selected = rows.find((r) => r.id === selectedId) ?? rows[0];

  const [filter, setFilter] = useState<"all" | "A" | "B">("all");
  const list = useMemo(
    () => rows.filter((r) => filter === "all" || r.docType === filter),
    [rows, filter],
  );

  if (!imported) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={<FileText size={22} />}
          title="まずリストを取り込んでください"
          desc="「取り込み・振り分け」画面でリスト.xlsx を読み込むと、各行の書類プレビューを確認できます。"
        />
      </div>
    );
  }

  const onExport = async () => {
    setExporting(true);
    await fakeApi(null, 800);
    setExporting(false);
    toast.success("PDFを書き出しました", {
      description: `${selected.company} 宛 ${selected.docType === "A" ? "納品書" : "請求書"}.pdf`,
    });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">書類差し込みプレビュー</h1>
          <p className="mt-1 text-sm text-ink-500">
            リストの値が、書類A/BのPDF雛形の
            <span className="insert-val mx-0.5">赤字箇所</span>
            へ差し込まれた状態です。
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            icon={<Printer size={16} />}
            onClick={() => toast("このデモでは印刷プレビューは省略しています")}
          >
            <span className="hidden sm:inline">印刷</span>
          </Button>
          <Button icon={<Download size={16} />} loading={exporting} onClick={onExport}>
            PDF出力
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* 行リスト */}
        <div>
          <div className="mb-2 inline-flex rounded-lg border border-ink-200 bg-white p-0.5">
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
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  filter === v ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-ink-100"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <Card className="thin-scroll max-h-[70vh] overflow-y-auto">
            <ul>
              {list.map((r) => {
                const active = r.id === selected?.id;
                return (
                  <li key={r.id}>
                    <button
                      onClick={() => setParams({ row: r.id })}
                      className={`flex w-full items-center gap-2 border-b border-ink-100 px-3 py-2.5 text-left transition-colors last:border-0 ${
                        active ? "bg-brand-50" : "hover:bg-ink-50"
                      }`}
                    >
                      <span className="mono text-xs text-ink-400">
                        {String(r.no).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink-800">
                          {r.company}
                        </p>
                        <p className="truncate text-xs text-ink-400">{r.item}</p>
                      </div>
                      <DocBadge type={r.docType} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        {/* プレビュー */}
        <div>
          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <DocPaper row={selected} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function Ins({ children }: { children: React.ReactNode }) {
  return <span className="insert-val">{children}</span>;
}

function DocPaper({ row }: { row: ListRow }) {
  const addr = findAddress(row.company);
  const unit = row.qty ? Math.round(row.amount / row.qty) : row.amount;
  const tax = Math.round(row.amount * 0.1);
  const total = row.amount + tax;
  const issued = format(new Date(row.issuedAt), "yyyy年M月d日");

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-ink-200 bg-ink-50 px-4 py-2 text-xs text-ink-500">
        <DocBadge type={row.docType} />
        雛形: 書類{row.docType}.pdf
        <span className="ml-auto mono">{row.refNo}</span>
      </div>

      <div className="bg-white p-6 sm:p-10">
        {/* 帳票見出し */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-[0.4em] text-ink-900">
            {row.docType === "A" ? "納 品 書" : "請 求 書"}
          </h2>
          <p className="mt-1 text-xs text-ink-400">
            No. <Ins>{row.refNo}</Ins> ／ 発行日 <Ins>{issued}</Ins>
          </p>
        </div>

        {/* 宛先 & 発行元 */}
        <div className="mt-8 flex flex-wrap justify-between gap-6">
          <div className="min-w-[220px]">
            <p className="text-lg font-medium text-ink-900">
              <Ins>{row.company}</Ins>　御中
            </p>
            <div className="mt-1.5 text-xs leading-relaxed text-ink-500">
              {addr ? (
                <>
                  <p>〒{addr.postal}</p>
                  <p>
                    <Ins>{addr.address}</Ins>
                  </p>
                  <p className="mt-0.5">ご担当：{addr.contact.split(" ").slice(-2).join(" ")} 様</p>
                </>
              ) : (
                <p className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-amber-700 ring-1 ring-inset ring-amber-600/20">
                  <MapPin size={12} />
                  住所録に未登録（住所は空欄で出力）
                </p>
              )}
            </div>
          </div>
          <div className="text-right text-xs leading-relaxed text-ink-500">
            <p className="text-sm font-bold text-ink-800">株式会社○○</p>
            <p>〒000-0000</p>
            <p>東京都△△区□□ 1-2-3</p>
            <p className="mt-1">登録番号 T0000000000000</p>
            <div className="mt-2 ml-auto grid size-12 place-items-center rounded-full border border-dashed border-ink-300 text-[10px] text-ink-300">
              印
            </div>
          </div>
        </div>

        {/* 金額サマリ(請求書) */}
        {row.docType === "B" && (
          <div className="mt-6 rounded-lg bg-ink-50 px-5 py-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink-600">ご請求金額（税込）</span>
              <span className="text-2xl font-bold tnum text-ink-900">
                <Ins>{yen(total)}</Ins>
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-400">
              お支払期限 <Ins>{format(new Date(row.issuedAt), "yyyy年M月d日")}</Ins> 末締め翌月末
            </p>
          </div>
        )}

        {/* 明細 */}
        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-ink-300 text-xs text-ink-500">
              <th className="py-2 text-left font-medium">品目 / 件名</th>
              <th className="py-2 text-right font-medium">数量</th>
              <th className="py-2 text-right font-medium">単価</th>
              <th className="py-2 text-right font-medium">金額</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-ink-100">
              <td className="py-2.5 text-ink-800">
                <Ins>{row.item}</Ins>
              </td>
              <td className="py-2.5 text-right tnum text-ink-700">
                <Ins>{row.qty}</Ins>
              </td>
              <td className="py-2.5 text-right tnum text-ink-700">{yen(unit)}</td>
              <td className="py-2.5 text-right tnum text-ink-800">
                <Ins>{yen(row.amount)}</Ins>
              </td>
            </tr>
            <tr className="text-ink-300">
              <td className="py-2.5">　</td>
              <td /> <td /> <td />
            </tr>
          </tbody>
          <tfoot className="text-sm">
            <tr>
              <td colSpan={2} />
              <td className="py-1 text-right text-ink-500">小計</td>
              <td className="py-1 text-right tnum text-ink-700">{yen(row.amount)}</td>
            </tr>
            <tr>
              <td colSpan={2} />
              <td className="py-1 text-right text-ink-500">消費税(10%)</td>
              <td className="py-1 text-right tnum text-ink-700">{yen(tax)}</td>
            </tr>
            <tr className="border-t border-ink-300">
              <td colSpan={2} />
              <td className="py-2 text-right font-medium text-ink-700">合計</td>
              <td className="py-2 text-right text-base font-bold tnum text-ink-900">
                {yen(total)}
              </td>
            </tr>
          </tfoot>
        </table>

        <p className="mt-8 text-center text-[10px] text-ink-300">
          — このプレビューはデモ用に生成した雛形です。<span className="insert-val">赤字</span>がリストから差し込まれた項目です —
        </p>
      </div>
    </Card>
  );
}
