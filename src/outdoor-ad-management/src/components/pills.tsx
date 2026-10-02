import type { CustomerStatus, HandoverStatus, Rank, Stage } from "../data/seed";
import type { ContractState } from "../lib/domain";
import { Pill, type Tone } from "./ui";

const STAGE_TONE: Record<Stage, Tone> = {
  初回接触: "gray",
  ヒアリング: "gray",
  提案: "navy",
  見積提出: "navy",
  交渉: "solid",
  成約: "ok",
  失注: "bad",
};
export const StagePill = ({ stage }: { stage: Stage }) => <Pill tone={STAGE_TONE[stage]}>{stage}</Pill>;

const CONTRACT_TONE: Record<ContractState, Tone> = {
  掲載予定: "navy",
  掲載中: "ok",
  満了間近: "warn",
  解約予定: "bad",
  満了: "gray",
  解約済: "gray",
};
export const ContractPill = ({ state }: { state: ContractState }) => <Pill tone={CONTRACT_TONE[state]}>{state}</Pill>;

const HO_TONE: Record<HandoverStatus, Tone> = {
  提出済: "navy",
  差し戻し: "bad",
  再提出: "warn",
  受領済: "ok",
};
const HO_LABEL: Record<HandoverStatus, string> = {
  提出済: "管理部 確認待ち",
  差し戻し: "差し戻し",
  再提出: "再提出 確認待ち",
  受領済: "受領済",
};
export const HandoverPill = ({ status }: { status: HandoverStatus }) => <Pill tone={HO_TONE[status]}>{HO_LABEL[status]}</Pill>;

export const RankPill = ({ rank }: { rank: Rank }) => (
  <span
    className={
      "inline-grid h-5 w-5 place-items-center rounded text-[11px] font-semibold " +
      (rank === "A" ? "bg-navy-900 text-white" : rank === "B" ? "bg-navy-100 text-navy-800" : "bg-ink-100 text-ink-500")
    }
  >
    {rank}
  </span>
);

const CS_TONE: Record<CustomerStatus, Tone> = { 見込み: "gray", 商談中: "navy", 取引中: "ok", 休眠: "gray" };
export const CustomerStatusPill = ({ status }: { status: CustomerStatus }) => <Pill tone={CS_TONE[status]}>{status}</Pill>;
