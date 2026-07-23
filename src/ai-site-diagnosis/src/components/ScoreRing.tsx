import { useEffect, useRef, useState } from "react";

interface Props {
  /** 0-100 */
  score: number;
  color: string;
  size?: number;
  /** 中央のサブラベル（例: "総合スコア"） */
  label?: string;
  /** アニメーションで数値をカウントアップ */
  animate?: boolean;
}

/** 円形のスコアメーター。表示時に0→scoreへカウントアップする。 */
export default function ScoreRing({
  score,
  color,
  size = 220,
  label = "総合スコア",
  animate = true,
}: Props) {
  const stroke = Math.round(size * 0.075);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [shown, setShown] = useState(animate ? 0 : score);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!animate) {
      setShown(score);
      return;
    }
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setShown(score);
      return;
    }
    const start = performance.now();
    const dur = 1100;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(eased * score));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [score, animate]);

  const offset = c - (shown / 100) * c;

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-ink-3)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 10px ${color})`,
            transition: "stroke-dashoffset 80ms linear",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className="tnum font-bold leading-none"
          style={{ fontSize: size * 0.3, color }}
        >
          {shown}
        </span>
        <span className="mt-1 text-sm text-white/50">{label}</span>
      </div>
    </div>
  );
}
