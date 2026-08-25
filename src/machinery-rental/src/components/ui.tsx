import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

/* ---------------- ボタン ---------------- */
type BtnProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 font-bold rounded-full transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed select-none";

const BTN_VARIANT: Record<string, string> = {
  primary:
    "bg-ink-900 text-white hover:bg-ink-800 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5 active:translate-y-0",
  secondary:
    "bg-sun-500 text-ink-900 hover:bg-sun-400 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5 active:translate-y-0",
  outline: "border border-ink-300 text-ink-800 bg-white hover:bg-ink-50 hover:border-ink-400",
  ghost: "text-ink-700 hover:bg-ink-100",
  danger: "bg-ng-500 text-white hover:bg-ng-700",
};

const BTN_SIZE: Record<string, string> = {
  sm: "text-xs px-3.5 py-2",
  md: "text-sm px-5 py-2.5",
  lg: "text-[15px] px-7 py-3.5",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading,
  className = "",
  disabled,
  ...rest
}: BtnProps) {
  return (
    <button
      className={`${BTN_BASE} ${BTN_VARIANT[variant]} ${BTN_SIZE[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

/* ---------------- バッジ ---------------- */
export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "sun" | "sea" | "ok" | "warn" | "ng";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-ink-100 text-ink-600 border-ink-200",
    sun: "bg-sun-100 text-sun-900 border-sun-200",
    sea: "bg-sea-50 text-sea-700 border-sea-200",
    ok: "bg-ok-100 text-ok-700 border-ok-100",
    warn: "bg-warn-100 text-warn-700 border-warn-100",
    ng: "bg-ng-100 text-ng-700 border-ng-100",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold leading-5 ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ---------------- スクロール連動フェードイン ---------------- */
export function Reveal({
  children,
  delay = 0,
  y = 14,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y }}
      animate={inView || reduce ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- 数値カウントアップ ---------------- */
export function CountUp({
  to,
  decimals = 0,
  duration = 1400,
  className = "",
}: {
  to: number;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduce]);

  return (
    <span ref={ref} className={`tnum ${className}`}>
      {val.toLocaleString("ja-JP", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}

/* ---------------- スケルトン ---------------- */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

export function MachineCardSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-4">
      <Skeleton className="mb-4 aspect-[3/2] w-full rounded-xl" />
      <Skeleton className="mb-2 h-4 w-2/3" />
      <Skeleton className="mb-4 h-3 w-1/3" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-8 w-full rounded-full" />
    </div>
  );
}

/* ---------------- 空状態 ---------------- */
export function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-300 bg-ink-50 px-6 py-16 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-sun-100 text-sun-800">
        {icon}
      </div>
      <p className="text-base font-bold text-ink-900">{title}</p>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ink-500">{desc}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ---------------- セクション見出し ---------------- */
export function SectionHeading({
  eyebrow,
  title,
  desc,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  desc?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <div
        className={`mb-3 flex items-center gap-2.5 ${align === "center" ? "justify-center" : ""}`}
      >
        <span className="h-px w-8 bg-sun-600" />
        <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-sun-800">
          {eyebrow}
        </span>
      </div>
      <h2 className="text-2xl font-black leading-tight tracking-tight text-ink-900 sm:text-3xl md:text-[2.1rem]">
        {title}
      </h2>
      {desc && (
        <p
          className={`mt-4 text-[15px] leading-relaxed text-ink-600 ${align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"}`}
        >
          {desc}
        </p>
      )}
    </div>
  );
}
