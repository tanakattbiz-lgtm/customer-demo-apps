import {
  STAGE_ORDER,
  type Member,
  type Scenario,
  scenarioForStage,
} from "../data/seed";
import { daysSince } from "./format";

/** この日数以上アクティブがなければ「要フォロー」とみなす(完了・離脱を除く) */
export const STALL_DAYS = 4;

export function isStalled(m: Member, now: Date = new Date()): boolean {
  if (m.stage === "done" || m.stage === "churn") return false;
  return daysSince(m.lastActiveAt, now) >= STALL_DAYS;
}

/** パイプライン全体での進捗率(0〜100)。done=100 / churn は現在地で頭打ち */
export function overallProgress(m: Member, scenarios: Scenario[]): number {
  if (m.stage === "done") return 100;
  const activeStages = STAGE_ORDER.slice(0, 3); // friend, account, trade
  const idx = activeStages.indexOf(m.stage === "churn" ? "trade" : m.stage);
  if (idx < 0) return 100;
  const sc = scenarioForStage(scenarios, m.stage === "churn" ? "trade" : m.stage);
  const total = sc?.steps.length ?? 1;
  const frac = Math.min(1, m.stepIndex / total);
  return Math.round(((idx + frac) / 3) * 100);
}

/** 現ステージのシナリオで、次に配信されるステップ(なければ null) */
export function nextStep(m: Member, scenarios: Scenario[]) {
  const sc = scenarioForStage(scenarios, m.stage);
  if (!sc) return null;
  return sc.steps[m.stepIndex] ?? null;
}

/** 現ステージのシナリオ内で全ステップ配信済みか */
export function stageStepsDone(m: Member, scenarios: Scenario[]): boolean {
  const sc = scenarioForStage(scenarios, m.stage);
  if (!sc) return true;
  return m.stepIndex >= sc.steps.length;
}
