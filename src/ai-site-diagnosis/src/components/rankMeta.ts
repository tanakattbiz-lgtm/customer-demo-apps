import type { Rank } from "../lib/diagnose";

export interface RankMeta {
  rank: Rank;
  label: string;
  color: string; // css color (theme var)
  dot: string; // 案件の🟢🔵🟡🔴に対応する絵文字
  message: string;
}

export const RANK_META: Record<Rank, RankMeta> = {
  A: {
    rank: "A",
    label: "優秀",
    color: "var(--color-rank-a)",
    dot: "🟢",
    message: "広告の受け皿として十分に機能しています。さらに伸ばせる余地も。",
  },
  B: {
    rank: "B",
    label: "良好",
    color: "var(--color-rank-b)",
    dot: "🔵",
    message: "土台は良好。あと一手で問い合わせ率を大きく伸ばせます。",
  },
  C: {
    rank: "C",
    label: "改善の余地あり",
    color: "var(--color-rank-c)",
    dot: "🟡",
    message: "せっかくの広告流入を取りこぼしている可能性があります。",
  },
  D: {
    rank: "D",
    label: "要改善",
    color: "var(--color-rank-d)",
    dot: "🔴",
    message: "今のままでは広告費が成果につながりにくい状態です。",
  },
};
