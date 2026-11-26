import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useStore } from "../store";
import { DEFAULT_STAGE_TEXT, OPEN_STAGES, STAGE_NO, type OpenStage, type StageText } from "../data/seed";
import { Button, Field, Modal, inputCls } from "./ui";

/** 見込案件の段階の名前と基準を変える(営業部で決めた内容に合わせる) */
export default function StageSettings({ open, onClose }: { open: boolean; onClose: () => void }) {
  const saved = useStore((s) => s.stageText);
  const setStageText = useStore((s) => s.setStageText);
  const [t, setT] = useState<Record<OpenStage, StageText>>(DEFAULT_STAGE_TEXT);
  useEffect(() => {
    if (open) setT(saved ?? DEFAULT_STAGE_TEXT);
  }, [open, saved]);
  const stages = OPEN_STAGES as OpenStage[];
  const valid = stages.every((s) => t[s].label.trim());
  const save = () => {
    setStageText(stages.reduce((a, s) => ({ ...a, [s]: { label: t[s].label.trim(), def: t[s].def.trim() } }), {} as Record<OpenStage, StageText>));
    onClose();
    toast.success("段階の名前と基準を変更しました", { description: "見込案件の一覧・詳細・営業報告に反映されます。" });
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="見込案件の段階の設定"
      sub="段階の名前と基準を、営業部で決めた内容に合わせて変えられます"
      width={640}
      footer={
        <>
          <Button variant="ghost" onClick={() => setT(DEFAULT_STAGE_TEXT)}>
            初期の内容に戻す
          </Button>
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={save} disabled={!valid}>
            保存する
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {stages.map((s) => (
          <div key={s} className="rounded-md border border-ink-200 px-4 py-3">
            <div className="mb-2 text-[14px] font-semibold text-navy-900">段階 {STAGE_NO[s]}</div>
            <div className="grid gap-3">
              <Field label="名前" required>
                <input className={inputCls} value={t[s].label} onChange={(e) => setT({ ...t, [s]: { ...t[s], label: e.target.value } })} />
              </Field>
              <Field label="この段階にする基準">
                <input className={inputCls} value={t[s].def} onChange={(e) => setT({ ...t, [s]: { ...t[s], def: e.target.value } })} />
              </Field>
            </div>
          </div>
        ))}
        <p className="text-[12.5px] leading-relaxed text-ink-500">
          このデモでは名前と基準を変えられます。本番では、段階の数(何段階にするか)と、各段階で入力する項目も変えられるようにします。
        </p>
      </div>
    </Modal>
  );
}
