/** 見込案件の段階の名前と基準。営業部で変えられる(設定は見込案件の画面から) */
import { useStore } from "../store";
import { STAGE_DEF, STAGE_LABEL, type OpenStage, type Stage } from "../data/seed";

export function useStageText() {
  const t = useStore((s) => s.stageText);
  const open = (s: Stage): s is OpenStage => !!t && s in t;
  return {
    label: (s: Stage) => (open(s) ? t[s].label : STAGE_LABEL[s]),
    def: (s: Stage) => (open(s) ? t[s].def : STAGE_DEF[s]),
  };
}
