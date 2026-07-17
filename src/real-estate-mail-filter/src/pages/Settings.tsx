import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { AlertCircle, RotateCcw, Save } from "lucide-react";
import { useStore } from "../store";
import { MAILS, PREF_OPTIONS, STRUCTURE_OPTIONS, receivedAt } from "../data/seed";
import { judge, lineMessage, type Conditions } from "../lib/rules";
import { fakeApi } from "../lib/fakeApi";
import { Badge, Button, Card, SectionTitle } from "../components/ui";
import { LinePreview } from "../components/LinePreview";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors duration-150 ease-out ${
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-ink-300 bg-white text-ink-600 hover:border-ink-400 hover:bg-ink-50"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-ink-800">{label}</span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-500">
          {desc}
        </span>
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="block h-5 w-9 rounded-full bg-ink-300 transition-colors duration-200 peer-checked:bg-brand-600" />
        <span className="absolute left-0.5 top-0.5 block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out peer-checked:translate-x-4" />
      </span>
    </label>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-red-600">
      <AlertCircle size={11} />
      {message}
    </p>
  );
}

export function Settings() {
  const { conditions, setConditions, markRun, reset, lastRunAt } = useStore();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Conditions>(conditions);
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [touched, setTouched] = useState(false);

  const patch = (p: Partial<Conditions>) => {
    setDraft((d) => ({ ...d, ...p }));
    setTouched(true);
  };

  const errors = {
    prefs: draft.prefs.length === 0 ? "所在地を1つ以上選択してください" : "",
    structures: draft.structures.length === 0 ? "構造を1つ以上選択してください" : "",
    maxAge:
      !Number.isInteger(draft.maxAge) || draft.maxAge < 1 || draft.maxAge > 100
        ? "築年数は1〜100の整数で入力してください"
        : "",
    labelName: draft.labelName.trim() === "" ? "ラベル名を入力してください" : "",
  };
  const hasError = Object.values(errors).some(Boolean);

  /** 保存前に「この条件だと何件になるか」を即時に試算する */
  const preview = useMemo(() => {
    const judged = MAILS.map((m) => judge(m, draft));
    return {
      label: judged.filter((j) => j.action === "label").length,
      archive: judged.filter((j) => j.action === "archive").length,
      skip: judged.filter((j) => j.action === "skip").length,
    };
  }, [draft]);

  const sample = useMemo(() => {
    const hit = MAILS.map((m) => ({ m, at: receivedAt(m), j: judge(m, draft) }))
      .filter((r) => r.j.action === "label")
      .sort((a, b) => b.at.getTime() - a.at.getTime())[0];
    return hit ?? null;
  }, [draft]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(conditions);

  const save = async () => {
    setTouched(true);
    if (hasError) {
      toast.error("入力内容を確認してください");
      return;
    }
    setSaving(true);
    await fakeApi(null, 700);
    setConditions(draft);
    markRun();
    setSaving(false);
    toast.success(
      `条件を保存し、受信済み ${MAILS.length} 件を再判定しました(要確認 ${preview.label} 件)`,
    );
  };

  const doReset = async () => {
    setConfirmReset(false);
    await fakeApi(null, 400);
    reset();
    setDraft({
      prefs: ["愛知県"],
      structures: ["RC造"],
      maxAge: 30,
      labelName: "要確認",
      archiveUnmatched: true,
      notifyLine: true,
    });
    setTouched(false);
    toast.success("初期状態に戻しました");
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="text-lg font-bold text-ink-900">条件設定シート</h1>
        <p className="mt-1 text-xs text-ink-500">
          仕分けの条件はこの画面だけで変更できます(開発者による作業は不要です)。保存すると受信済みメールも再判定されます。
          {lastRunAt && (
            <>
              {" "}
              <span className="tnum text-ink-400">
                最終更新: {format(new Date(lastRunAt), "M月d日 HH:mm", { locale: ja })}
              </span>
            </>
          )}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <SectionTitle
              title="STEP 1 ─ 対象メールの判定"
              desc="通常の業務メールを誤って処理しないための第1段階"
            />
            <div className="px-6 py-5">
              <div className="rounded-lg border border-ink-200 bg-ink-50 px-4 py-3.5">
                <p className="text-[12px] font-medium text-ink-800">
                  不動産物件情報メールのみを自動仕分けの対象にする
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-ink-500">
                  件名・本文・添付PDF(販売図面)をAIが読み取り、物件情報メールかどうかを判定します。請求書・日程調整・セミナー案内などの通常業務メールは、ラベル付与もアーカイブも行いません。
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Badge tone="brand">常に有効</Badge>
                  <span className="tnum text-[11px] text-ink-500">
                    直近の受信 {MAILS.length} 件のうち {preview.skip} 件を対象外と判定
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle
              title="STEP 2 ─ 物件の条件"
              desc="物件情報メールから抽出した項目と照合する条件"
            />
            <div className="space-y-6 px-6 py-5">
              <div>
                <p className="mb-2 text-[12px] font-medium text-ink-800">
                  所在地(都道府県)
                  <span className="ml-1.5 text-[10px] font-normal text-ink-400">
                    複数選択可
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {PREF_OPTIONS.map((p) => (
                    <Chip
                      key={p}
                      active={draft.prefs.includes(p)}
                      onClick={() =>
                        patch({
                          prefs: draft.prefs.includes(p)
                            ? draft.prefs.filter((x) => x !== p)
                            : [...draft.prefs, p],
                        })
                      }
                    >
                      {p}
                    </Chip>
                  ))}
                </div>
                {touched && errors.prefs && <FieldError message={errors.prefs} />}
              </div>

              <div>
                <p className="mb-2 text-[12px] font-medium text-ink-800">
                  構造
                  <span className="ml-1.5 text-[10px] font-normal text-ink-400">
                    複数選択可
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {STRUCTURE_OPTIONS.map((s) => (
                    <Chip
                      key={s}
                      active={draft.structures.includes(s)}
                      onClick={() =>
                        patch({
                          structures: draft.structures.includes(s)
                            ? draft.structures.filter((x) => x !== s)
                            : [...draft.structures, s],
                        })
                      }
                    >
                      {s}
                    </Chip>
                  ))}
                </div>
                {touched && errors.structures && (
                  <FieldError message={errors.structures} />
                )}
              </div>

              <div>
                <label
                  htmlFor="maxAge"
                  className="mb-2 block text-[12px] font-medium text-ink-800"
                >
                  築年数の上限
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="maxAge"
                    type="number"
                    min={1}
                    max={100}
                    value={Number.isNaN(draft.maxAge) ? "" : draft.maxAge}
                    onChange={(e) => patch({ maxAge: parseInt(e.target.value, 10) })}
                    className={`tnum w-24 rounded-lg border px-3 py-1.5 text-[13px] text-ink-800 transition-colors duration-150 focus:outline-none ${
                      touched && errors.maxAge
                        ? "border-red-400 focus:border-red-500"
                        : "border-ink-300 focus:border-brand-500"
                    }`}
                  />
                  <span className="text-[12px] text-ink-600">年以内</span>
                </div>
                {touched && errors.maxAge && <FieldError message={errors.maxAge} />}
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle
              title="STEP 3 ─ 実行する処理"
              desc="判定結果に応じてGmail・LINEで行う処理"
            />
            <div className="px-6 py-2">
              <div className="py-3">
                <label
                  htmlFor="labelName"
                  className="mb-2 block text-[13px] font-medium text-ink-800"
                >
                  条件合致メールに付けるGmailラベル
                </label>
                <input
                  id="labelName"
                  value={draft.labelName}
                  onChange={(e) => patch({ labelName: e.target.value })}
                  className={`w-full max-w-xs rounded-lg border px-3 py-1.5 text-[13px] text-ink-800 transition-colors duration-150 focus:outline-none sm:w-56 ${
                    touched && errors.labelName
                      ? "border-red-400 focus:border-red-500"
                      : "border-ink-300 focus:border-brand-500"
                  }`}
                />
                {touched && errors.labelName && (
                  <FieldError message={errors.labelName} />
                )}
              </div>
              <div className="divide-y divide-ink-200 border-t border-ink-200">
                <Toggle
                  checked={draft.archiveUnmatched}
                  onChange={(v) => patch({ archiveUnmatched: v })}
                  label="条件外の物件メールを自動アーカイブする"
                  desc="受信トレイから外します(削除はしません)。通常業務メールは対象外です。"
                />
                <Toggle
                  checked={draft.notifyLine}
                  onChange={(v) => patch({ notifyLine: v })}
                  label="条件合致時にLINEへ通知する"
                  desc="ラベル付与と同時に、物件の要約をLINEへ送信します。"
                />
              </div>
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="danger" onClick={() => setConfirmReset(true)}>
              <RotateCcw size={14} />
              デモを初期状態に戻す
            </Button>
            <div className="flex items-center gap-3">
              {dirty && !saving && (
                <span className="text-[11px] text-warn-700">未保存の変更があります</span>
              )}
              <Button onClick={save} loading={saving} disabled={!dirty && !saving}>
                {!saving && <Save size={14} />}
                {saving ? "再判定中…" : "保存して再判定"}
              </Button>
            </div>
          </div>
        </div>

        {/* 右カラム: 影響プレビュー */}
        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <SectionTitle title="この条件での仕分け結果" desc="保存前に試算されます" />
            <div className="space-y-3 px-5 py-4">
              {[
                { label: "要確認(ラベル付与)", value: preview.label, tone: "text-warn-700" },
                { label: "自動アーカイブ", value: preview.archive, tone: "text-ink-800" },
                { label: "対象外(通常業務メール)", value: preview.skip, tone: "text-ink-800" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between gap-3">
                  <span className="text-[12px] text-ink-600">{s.label}</span>
                  <span className={`tnum text-lg font-bold ${s.tone}`}>
                    {s.value}
                    <span className="ml-0.5 text-[11px] font-medium text-ink-400">件</span>
                  </span>
                </div>
              ))}
              <button
                onClick={() => navigate("/logs")}
                className="w-full rounded-lg border border-ink-300 py-2 text-[12px] font-medium text-ink-600 transition-colors duration-150 hover:bg-ink-50"
              >
                判定ログで内訳を見る
              </button>
            </div>
          </Card>

          <Card>
            <SectionTitle
              title="LINE通知プレビュー"
              desc={draft.notifyLine ? "実際に届く文面" : "通知オフ(文面のみ表示)"}
            />
            <div className="p-4">
              {sample ? (
                <LinePreview
                  message={lineMessage(sample.m, draft)}
                  at={sample.at}
                  compact
                />
              ) : (
                <p className="px-2 py-6 text-center text-[12px] leading-relaxed text-ink-500">
                  現在の条件に合致する物件がないため、通知の例を表示できません。条件をゆるめてお試しください。
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* リセット確認ダイアログ */}
      <AnimatePresence>
        {confirmReset && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmReset(false)}
              className="fixed inset-0 z-40 bg-ink-900/40"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-ink-200 bg-white p-6 shadow-xl"
            >
              <h3 className="text-sm font-bold text-ink-900">デモを初期状態に戻します</h3>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-600">
                条件設定と確認済みチェックが、初期値(愛知県 / RC造 / 築30年以内)に戻ります。この操作は取り消せません。
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setConfirmReset(false)}>
                  キャンセル
                </Button>
                <Button variant="danger" onClick={doReset}>
                  初期状態に戻す
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
