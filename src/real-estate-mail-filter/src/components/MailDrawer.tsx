import { AnimatePresence, motion } from "motion/react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Archive,
  Check,
  CircleSlash,
  FileText,
  Paperclip,
  Tag,
  X,
} from "lucide-react";
import type { Row } from "../lib/rows";
import { actionLabel, lineMessage, type Conditions } from "../lib/rules";
import { Badge, Button } from "./ui";
import { LinePreview } from "./LinePreview";

export function ActionBadge({ row }: { row: Row }) {
  const { j } = row;
  if (j.action === "label")
    return (
      <Badge tone="warn" icon={<Tag size={11} />}>
        ラベル付与
      </Badge>
    );
  if (j.action === "archive")
    return (
      <Badge tone="muted" icon={<Archive size={11} />}>
        アーカイブ
      </Badge>
    );
  return (
    <Badge tone="muted" icon={<CircleSlash size={11} />}>
      処理なし
    </Badge>
  );
}

export function MailDrawer({
  row,
  cond,
  reviewed,
  onToggleReviewed,
  onClose,
}: {
  row: Row | null;
  cond: Conditions;
  reviewed: boolean;
  onToggleReviewed: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {row && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink-900/30"
          />
          <motion.aside
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-ink-200 bg-white"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-ink-200 px-5 py-4">
              <div className="min-w-0">
                <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                  {row.j.isProperty ? (
                    <Badge tone="brand">物件情報メール</Badge>
                  ) : (
                    <Badge tone="muted">通常業務メール</Badge>
                  )}
                  <ActionBadge row={row} />
                </div>
                <h2 className="truncate text-sm font-bold text-ink-900">
                  {row.mail.subject}
                </h2>
                <p className="mt-0.5 truncate text-[11px] text-ink-500">
                  {row.mail.from}(
                  {row.mail.fromAddr}) ・{" "}
                  <span className="tnum">
                    {format(row.at, "M月d日(E) HH:mm", { locale: ja })}
                  </span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-ink-500 transition-colors duration-150 hover:bg-ink-100"
                aria-label="閉じる"
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              {/* 判定 */}
              <section>
                <h3 className="mb-2 text-[11px] font-bold tracking-wide text-ink-500">
                  判定結果
                </h3>
                <div className="rounded-lg border border-ink-200">
                  <div className="border-b border-ink-200 px-4 py-3">
                    <p className="text-[11px] font-medium text-ink-500">
                      STEP 1 ─ 物件情報メールかどうか
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-ink-800">
                      {row.j.isProperty ? "物件情報メールと判定" : "対象外と判定"}
                      <span className="tnum ml-1.5 text-ink-500">
                        (確信度 {Math.round(row.mail.confidence * 100)}%)
                      </span>
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
                      {row.mail.classifyReason}
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[11px] font-medium text-ink-500">
                      STEP 2 ─ 条件照合
                    </p>
                    {row.j.isProperty ? (
                      <table className="mt-2 w-full text-[12px]">
                        <tbody className="divide-y divide-ink-100">
                          {row.j.checks.map((c) => (
                            <tr key={c.label}>
                              <td className="w-16 py-1.5 align-top text-ink-500">
                                {c.label}
                              </td>
                              <td className="py-1.5 align-top text-ink-800">
                                {c.actual}
                                <span className="ml-1 text-[11px] text-ink-400">
                                  / 条件: {c.expected}
                                </span>
                              </td>
                              <td className="w-14 py-1.5 text-right align-top">
                                {c.ok ? (
                                  <Badge tone="ok">合致</Badge>
                                ) : (
                                  <Badge tone="muted">非該当</Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="mt-1 text-[12px] text-ink-500">
                        STEP 1 で対象外と判定されたため、条件照合・ラベル付与・アーカイブは行いません。
                      </p>
                    )}
                    <p className="mt-3 rounded-md bg-ink-50 px-3 py-2 text-[11px] leading-relaxed text-ink-600">
                      {row.j.reason}
                    </p>
                    <p className="mt-2 text-[11px] text-ink-500">
                      実行した処理:{" "}
                      <span className="font-medium text-ink-800">
                        {actionLabel(row.j.action)}
                        {row.j.action === "label" && `(ラベル「${cond.labelName}」)`}
                      </span>
                    </p>
                  </div>
                </div>
              </section>

              {/* LINE通知 */}
              {row.j.action === "label" && (
                <section className="mt-6">
                  <h3 className="mb-2 text-[11px] font-bold tracking-wide text-ink-500">
                    LINE通知{cond.notifyLine ? "" : "(現在オフ・プレビューのみ)"}
                  </h3>
                  <LinePreview message={lineMessage(row.mail, cond)} at={row.at} />
                </section>
              )}

              {/* 抽出項目 */}
              {row.mail.extracted && (
                <section className="mt-6">
                  <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-ink-500">
                    抽出項目
                    <Badge tone={row.mail.extracted.source === "添付PDF" ? "brand" : "muted"}>
                      {row.mail.extracted.source === "添付PDF" ? (
                        <>
                          <FileText size={10} className="mr-0.5" />
                          添付PDFから読み取り
                        </>
                      ) : (
                        "本文から読み取り"
                      )}
                    </Badge>
                  </h3>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-lg border border-ink-200 px-4 py-3.5 text-[12px]">
                    {[
                      ["所在地", `${row.mail.extracted.pref}${row.mail.extracted.city}`],
                      ["構造", row.mail.extracted.structure],
                      [
                        "築年",
                        `${row.mail.extracted.builtYear}年(築${row.j.age}年)`,
                      ],
                      ["建物面積", `${row.mail.extracted.areaSqm.toLocaleString()}㎡`],
                      ["価格", `${row.mail.extracted.price.toLocaleString()}万円`],
                      ["表面利回り", `${row.mail.extracted.yieldPct.toFixed(2)}%`],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-[10px] text-ink-500">{k}</dt>
                        <dd className="tnum mt-0.5 font-medium text-ink-900">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}

              {/* メール本文 */}
              <section className="mt-6">
                <h3 className="mb-2 text-[11px] font-bold tracking-wide text-ink-500">
                  メール本文
                </h3>
                <div className="rounded-lg border border-ink-200 bg-ink-50 px-4 py-3.5">
                  <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-ink-700">
                    {row.mail.body}
                  </p>
                  {row.mail.attachment && (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-2.5 py-1.5">
                      <Paperclip size={12} className="text-ink-400" />
                      <span className="text-[11px] text-ink-700">
                        {row.mail.attachment}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {row.j.action === "label" && (
              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-ink-200 px-5 py-3.5">
                <p className="text-[11px] text-ink-500">
                  {reviewed ? "確認済みとして記録されています" : "未確認の物件です"}
                </p>
                <Button
                  variant={reviewed ? "secondary" : "primary"}
                  onClick={() => onToggleReviewed(row.mail.id)}
                >
                  <Check size={14} />
                  {reviewed ? "未確認に戻す" : "確認済みにする"}
                </Button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
