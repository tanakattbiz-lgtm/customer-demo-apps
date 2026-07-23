import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Wand2,
  Loader2,
  ClipboardPaste,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  ArrowRight,
  ListChecks,
} from "lucide-react";
import { fakeApi } from "../lib/fakeApi";
import {
  parseOrder,
  validateDraft,
  statusFromChecks,
  type Check,
  type Draft,
} from "../lib/parse";
import { CATEGORIES, SAMPLE_ORDERS } from "../data/seed";
import { useStore } from "../store";
import { Field } from "../components/ui";

const DEFAULT_PROCESS: Record<string, string[]> = {
  切削加工: ["材料切断", "機械加工", "バリ取り", "検査"],
  研削加工: ["前加工", "熱処理", "研削", "検査"],
  溶接: ["切断", "組立", "溶接", "外観検査"],
  プレス: ["ブランク抜き", "曲げ", "仕上げ", "検査"],
  組立: ["部品準備", "組立", "動作確認", "検査"],
  その他: ["受入", "加工", "検査"],
};

const CHECK_STYLE = {
  error: { icon: AlertCircle, cls: "text-red-600", bg: "bg-red-50 border-red-200" },
  warn: {
    icon: AlertTriangle,
    cls: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
  },
  info: { icon: Info, cls: "text-brand-600", bg: "bg-brand-50 border-brand-200" },
} as const;

function CheckRow({ c }: { c: Check }) {
  const s = CHECK_STYLE[c.level];
  const Icon = s.icon;
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 ${s.bg}`}>
      <Icon size={16} className={`mt-0.5 shrink-0 ${s.cls}`} />
      <p className="text-sm text-ink-700">
        <span className="font-medium">{c.field}</span>
        <span className="mx-1.5 text-ink-300">·</span>
        {c.message}
      </p>
    </div>
  );
}

export default function Convert() {
  const navigate = useNavigate();
  const addWorksheet = useStore((s) => s.addWorksheet);

  const [raw, setRaw] = useState(SAMPLE_ORDERS[0].text);
  const [parsing, setParsing] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  // 編集後のドラフトから毎回チェックを再計算(入力チェックがリアルタイム追従)
  const checks = useMemo(() => (draft ? validateDraft(draft) : []), [draft]);
  const { status, canConfirm } = statusFromChecks(checks);
  const counts = useMemo(
    () => ({
      error: checks.filter((c) => c.level === "error").length,
      warn: checks.filter((c) => c.level === "warn").length,
    }),
    [checks],
  );

  const runConvert = async () => {
    if (!raw.trim()) {
      toast.error("オーダー原文を入力してください");
      return;
    }
    setParsing(true);
    setDraft(null);
    const res = await fakeApi(parseOrder(raw), 620);
    setDraft(res.draft);
    setParsing(false);
    const st = statusFromChecks(res.checks);
    if (st.status === "確定")
      toast.success("変換しました。内容を確認して保存してください");
    else toast.warning("変換しました。指摘事項をご確認ください");
  };

  const patch = (p: Partial<Draft>) =>
    setDraft((d) => (d ? { ...d, ...p } : d));

  const onCategory = (category: string) =>
    patch({
      category,
      process:
        draft?.matchedMaster && draft.process.length
          ? draft.process
          : DEFAULT_PROCESS[category] ?? [],
    });

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    const ws = await fakeApi(
      addWorksheet({
        client: draft.client,
        partCode: draft.partCode,
        partName: draft.partName,
        quantity: draft.quantity,
        unit: draft.unit,
        category: draft.category,
        material: draft.material,
        surface: draft.surface,
        dueDate: draft.dueDate,
        process: draft.process,
        note: draft.note,
        status,
        raw: draft.raw,
      }),
      520,
    );
    setSaving(false);
    toast.success(`作業指示書 ${ws.no} を保存しました`);
    navigate("/history");
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-ink-900">
          取引先オーダー → 作業指示書 変換
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          メールやFAXで届いた発注内容を貼り付けると、品番マスタと照合して指示書項目を自動抽出し、入力チェックまで行います。
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* --- 左: オーダー取り込み --- */}
        <section className="rounded-xl border border-ink-200 bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <ClipboardPaste size={16} className="text-brand-600" />
            <h3 className="text-sm font-semibold text-ink-800">
              1. オーダー原文を取り込む
            </h3>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {SAMPLE_ORDERS.map((s) => (
              <button
                key={s.label}
                onClick={() => {
                  setRaw(s.text);
                  setDraft(null);
                }}
                className="rounded-full border border-ink-200 bg-ink-50 px-3 py-1 text-xs text-ink-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                例: {s.label}
              </button>
            ))}
          </div>

          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            spellCheck={false}
            className="thin-scroll h-72 w-full resize-none rounded-lg border border-ink-200 bg-ink-50/50 p-3 text-sm leading-relaxed text-ink-800 outline-none transition-colors focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
            placeholder="発注書の本文をここに貼り付けてください…"
          />

          <button
            onClick={runConvert}
            disabled={parsing}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {parsing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                解析中…
              </>
            ) : (
              <>
                <Wand2 size={16} />
                指示書に変換する
              </>
            )}
          </button>
        </section>

        {/* --- 右: 変換結果 + 入力チェック --- */}
        <section className="rounded-xl border border-ink-200 bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <ListChecks size={16} className="text-brand-600" />
            <h3 className="text-sm font-semibold text-ink-800">
              2. 変換結果と入力チェック
            </h3>
          </div>

          {parsing && (
            <div className="grid h-72 place-items-center">
              <div className="flex flex-col items-center gap-3 text-ink-400">
                <Loader2 size={22} className="animate-spin text-brand-500" />
                <span className="text-xs">品番マスタと照合しています…</span>
              </div>
            </div>
          )}

          {!parsing && !draft && (
            <div className="grid h-72 place-items-center rounded-lg border border-dashed border-ink-200 text-center">
              <div className="px-6 text-ink-400">
                <Wand2 size={26} className="mx-auto mb-2 opacity-60" />
                <p className="text-sm">
                  左のオーダーを変換すると、
                  <br />
                  ここに指示書ドラフトとチェック結果が表示されます。
                </p>
              </div>
            </div>
          )}

          {!parsing && draft && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* サマリバー */}
              <div className="flex flex-wrap items-center gap-3 rounded-lg bg-ink-50 px-3 py-2 text-xs">
                <span className="flex items-center gap-1 text-red-600">
                  <AlertCircle size={14} />
                  エラー {counts.error}
                </span>
                <span className="flex items-center gap-1 text-amber-600">
                  <AlertTriangle size={14} />
                  警告 {counts.warn}
                </span>
                <span
                  className={`ml-auto flex items-center gap-1 font-medium ${
                    canConfirm ? "text-emerald-600" : "text-ink-400"
                  }`}
                >
                  <CheckCircle2 size={14} />
                  判定: {status}
                </span>
              </div>

              {/* 抽出フィールド(一部は手直し可能) */}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <Field label="取引先" value={draft.client} />
                <div>
                  <dt className="text-xs text-ink-500">品番</dt>
                  <dd className="mt-0.5 mono text-sm text-ink-900">
                    {draft.partCode || <span className="text-ink-400">—</span>}
                    {draft.matchedMaster ? (
                      <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
                        マスタ照合
                      </span>
                    ) : (
                      draft.partCode && (
                        <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                          未登録
                        </span>
                      )
                    )}
                  </dd>
                </div>
                <Field label="品名" value={draft.partName} />
                <Field label="材料" value={draft.material} muted={!draft.material} />

                {/* 数量: 手直し可 */}
                <div>
                  <dt className="text-xs text-ink-500">数量</dt>
                  <dd className="mt-1 flex items-center gap-1.5">
                    <input
                      type="number"
                      value={draft.quantity ?? ""}
                      onChange={(e) =>
                        patch({
                          quantity:
                            e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                      className="w-24 rounded-md border border-ink-200 px-2 py-1 text-sm tnum outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    />
                    <span className="text-sm text-ink-500">{draft.unit}</span>
                  </dd>
                </div>

                {/* 加工区分: マスタ未登録時は選択 */}
                <div>
                  <dt className="text-xs text-ink-500">加工区分</dt>
                  <dd className="mt-1">
                    <select
                      value={draft.category}
                      onChange={(e) => onCategory(e.target.value)}
                      className="w-full rounded-md border border-ink-200 bg-white px-2 py-1 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    >
                      <option value="">(未設定)</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </dd>
                </div>

                {/* 納期: 手直し可 */}
                <div>
                  <dt className="text-xs text-ink-500">納期</dt>
                  <dd className="mt-1">
                    <input
                      type="date"
                      value={draft.dueDate ?? ""}
                      onChange={(e) =>
                        patch({ dueDate: e.target.value || null })
                      }
                      className="w-full rounded-md border border-ink-200 px-2 py-1 text-sm tnum outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    />
                  </dd>
                </div>
                <Field label="表面処理" value={draft.surface} muted={!draft.surface} />
              </dl>

              {/* 自動展開された工程 */}
              <div>
                <p className="mb-1.5 text-xs text-ink-500">
                  自動展開された工程（{draft.process.length}）
                </p>
                {draft.process.length ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {draft.process.map((p, i) => (
                      <span key={p} className="flex items-center gap-1.5">
                        <span className="rounded-md bg-brand-50 px-2 py-1 text-xs text-brand-700">
                          {p}
                        </span>
                        {i < draft.process.length - 1 && (
                          <ArrowRight size={12} className="text-ink-300" />
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-ink-400">
                    加工区分を設定すると工程が展開されます。
                  </p>
                )}
              </div>

              {/* 入力チェック一覧 */}
              <div className="space-y-1.5">
                {checks.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    <CheckCircle2 size={16} />
                    指摘事項はありません。すべての必須項目が揃っています。
                  </div>
                ) : (
                  checks.map((c, i) => <CheckRow key={i} c={c} />)
                )}
              </div>

              <button
                onClick={save}
                disabled={!canConfirm || saving}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    保存中…
                  </>
                ) : canConfirm ? (
                  <>
                    指示書を保存する（{status}）
                    <ArrowRight size={16} />
                  </>
                ) : (
                  "エラーを解消すると保存できます"
                )}
              </button>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}
