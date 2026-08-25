import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ---------------- ボタン ---------------- */
type BtnProps = {
  children: ReactNode;
  variant?: "solid" | "outline" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const BTN_BASE =
  "group/btn inline-flex items-center justify-center gap-2.5 font-medium rounded-[2px] transition-all duration-300 ease-out disabled:opacity-40 disabled:cursor-not-allowed select-none tracking-wide";

const BTN_VARIANT: Record<string, string> = {
  solid: "bg-navy-800 text-white hover:bg-navy-700",
  accent: "bg-amber-500 text-navy-900 hover:bg-amber-400",
  outline: "border border-ink-300 text-ink-800 bg-white hover:border-navy-700 hover:text-navy-700",
  ghost: "text-ink-600 hover:text-navy-700",
};

const BTN_SIZE: Record<string, string> = {
  sm: "text-[12px] px-4 py-2.5",
  md: "text-[13px] px-6 py-3",
  lg: "text-[14px] px-9 py-4",
};

export function Button({
  children,
  variant = "solid",
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
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

/** 矢印つきテキストリンク(コーポレートサイトの標準導線) */
export function ArrowLink({
  to,
  children,
  className = "",
  tone = "dark",
}: {
  to: string;
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <Link
      to={to}
      className={`group/al inline-flex items-center gap-3 text-[13px] font-medium tracking-wide transition-colors ${
        tone === "light" ? "text-white/80 hover:text-white" : "text-ink-700 hover:text-navy-700"
      } ${className}`}
    >
      <span className="underline-grow">{children}</span>
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-300 group-hover/al:translate-x-1 ${
          tone === "light"
            ? "border-white/30 group-hover/al:border-white/60"
            : "border-ink-300 group-hover/al:border-navy-600"
        }`}
      >
        <ArrowRight size={12} />
      </span>
    </Link>
  );
}

/* ---------------- タグ ---------------- */
export function Tag({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "navy" | "amber" | "outline";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-ink-100 text-ink-600",
    navy: "bg-navy-800 text-white",
    amber: "bg-amber-100 text-amber-700",
    outline: "border border-ink-300 text-ink-500",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[2px] px-2.5 py-1 text-[10.5px] font-medium leading-4 tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ---------------- スクロール連動フェード ---------------- */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y }}
      animate={inView || reduce ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay, ease: EASE }}
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
  duration = 1600,
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
      setVal(to * (1 - Math.pow(1 - p, 4)));
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

/* ---------------- セクション見出し ---------------- */
export function SectionHead({
  en,
  ja,
  lead,
  align = "left",
  tone = "dark",
}: {
  en: string;
  ja: ReactNode;
  lead?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
}) {
  const center = align === "center";
  return (
    <div className={center ? "text-center" : ""}>
      <div className={`flex items-center gap-3 ${center ? "justify-center" : ""}`}>
        <span className={`h-px w-6 ${tone === "light" ? "bg-amber-400" : "bg-amber-500"}`} />
        <span className={`label-en ${tone === "light" ? "text-amber-300" : "text-amber-600"}`}>
          {en}
        </span>
      </div>
      <h2
        className={`serif mt-5 text-[26px] leading-[1.5] sm:text-[32px] lg:text-[36px] ${
          tone === "light" ? "text-white" : "text-ink-900"
        }`}
      >
        {ja}
      </h2>
      {lead && (
        <p
          className={`mt-6 text-[14px] leading-[2] ${center ? "mx-auto max-w-2xl" : "max-w-2xl"} ${
            tone === "light" ? "text-white/70" : "text-ink-600"
          }`}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

/* ---------------- ページ見出し(下層ページ共通) ---------------- */
export function PageHead({
  en,
  ja,
  lead,
  breadcrumb,
}: {
  en: string;
  ja: string;
  lead?: string;
  breadcrumb: { label: string; to?: string }[];
}) {
  return (
    <section className="wash border-b border-ink-200">
      <div className="blueprint">
        <div className="mx-auto max-w-[1200px] px-6 pb-16 pt-12 sm:px-8 lg:px-12 lg:pb-24 lg:pt-16">
          <nav className="thin-scroll flex items-center gap-2 overflow-x-auto text-[11px] text-ink-400">
            {breadcrumb.map((b, i) => (
              <span key={b.label} className="flex shrink-0 items-center gap-2">
                {i > 0 && <span className="text-ink-300">/</span>}
                {b.to ? (
                  <Link to={b.to} className="transition-colors hover:text-navy-700">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-ink-600">{b.label}</span>
                )}
              </span>
            ))}
          </nav>

          <div className="mt-10 lg:mt-14">
            <span className="label-en text-amber-600">{en}</span>
            <h1 className="serif mt-4 text-[30px] leading-[1.4] text-ink-900 sm:text-[40px] lg:text-[46px]">
              {ja}
            </h1>
            {lead && (
              <p className="mt-6 max-w-2xl text-[14px] leading-[2] text-ink-600">{lead}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- スケルトン ---------------- */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="border border-ink-200 p-6">
      <Skeleton className="mb-6 aspect-[16/10] w-full" />
      <Skeleton className="mb-3 h-3.5 w-2/3" />
      <Skeleton className="mb-6 h-3 w-1/3" />
      <Skeleton className="h-3 w-full" />
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
    <div className="flex flex-col items-center justify-center border border-ink-200 bg-ink-25 px-6 py-20 text-center">
      <div className="mb-6 grid h-14 w-14 place-items-center border border-ink-300 text-ink-400">
        {icon}
      </div>
      <p className="serif text-[17px] text-ink-900">{title}</p>
      <p className="mt-3 max-w-md text-[13px] leading-[2] text-ink-500">{desc}</p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

/* ---------------- 罫線つき定義リスト ---------------- */
export function DefinitionList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="border-t border-ink-200">
      {items.map((f) => (
        <div
          key={f.label}
          className="flex flex-col gap-1 border-b border-ink-200 py-5 sm:flex-row sm:gap-10 sm:py-6"
        >
          <dt className="w-full shrink-0 text-[12px] font-medium tracking-wide text-ink-500 sm:w-40">
            {f.label}
          </dt>
          <dd className="text-[14px] leading-[1.9] text-ink-800">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}
