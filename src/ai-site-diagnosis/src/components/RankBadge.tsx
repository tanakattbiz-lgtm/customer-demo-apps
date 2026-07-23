import type { Rank } from "../lib/diagnose";
import { RANK_META } from "./rankMeta";

interface Props {
  rank: Rank;
  size?: "sm" | "lg";
}

/** A〜Dのランクバッジ。案件の🟢🔵🟡🔴表示に対応。 */
export default function RankBadge({ rank, size = "lg" }: Props) {
  const m = RANK_META[rank];
  const lg = size === "lg";
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border font-bold"
      style={{
        borderColor: m.color,
        color: m.color,
        background: `color-mix(in oklch, ${m.color} 14%, transparent)`,
        padding: lg ? "8px 18px" : "3px 12px",
        fontSize: lg ? 22 : 13,
        boxShadow: lg ? `0 0 24px color-mix(in oklch, ${m.color} 40%, transparent)` : undefined,
      }}
    >
      <span
        className="grid place-items-center rounded-full font-black text-black"
        style={{
          background: m.color,
          width: lg ? 34 : 20,
          height: lg ? 34 : 20,
          fontSize: lg ? 20 : 12,
        }}
      >
        {rank}
      </span>
      <span>{lg ? `${m.label}ランク` : m.label}</span>
    </div>
  );
}
