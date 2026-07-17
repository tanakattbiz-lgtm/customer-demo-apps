import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-ink-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  desc,
  right,
}: {
  title: string;
  desc?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink-200 px-6 py-4">
      <div className="min-w-0">
        <h2 className="text-[15px] font-bold text-ink-900">{title}</h2>
        {desc && <p className="mt-0.5 text-xs text-ink-500">{desc}</p>}
      </div>
      {right}
    </div>
  );
}

type Tone = "ok" | "warn" | "muted" | "brand" | "line";

const toneClass: Record<Tone, string> = {
  ok: "bg-ok-50 text-ok-700 ring-ok-500/25",
  warn: "bg-warn-50 text-warn-700 ring-warn-600/25",
  muted: "bg-ink-100 text-ink-600 ring-ink-300",
  brand: "bg-brand-50 text-brand-700 ring-brand-500/25",
  line: "bg-[color-mix(in_oklch,var(--color-line-500)_12%,white)] text-line-600 ring-line-500/30",
};

export function Badge({
  children,
  tone = "muted",
  icon,
}: {
  children: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset whitespace-nowrap ${toneClass[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  loading = false,
  disabled = false,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary:
      "border border-ink-300 bg-white text-ink-700 hover:bg-ink-50 hover:border-ink-400",
    ghost: "text-ink-600 hover:bg-ink-100",
    danger: "border border-ink-300 bg-white text-red-600 hover:bg-red-50 hover:border-red-300",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-ink-200 ${className}`} />;
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="divide-y divide-ink-200">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="hidden h-4 w-32 sm:block" />
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  );
}

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
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400">
        {icon}
      </div>
      <p className="text-sm font-bold text-ink-800">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-ink-500">{desc}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Stat({
  label,
  value,
  unit,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  tone?: "default" | "warn" | "ok";
}) {
  const valueTone =
    tone === "warn" ? "text-warn-700" : tone === "ok" ? "text-ok-700" : "text-ink-900";
  return (
    <Card className="px-5 py-4">
      <p className="text-xs font-medium text-ink-500">{label}</p>
      <p className={`mt-2 tnum text-2xl font-bold ${valueTone}`}>
        {value}
        {unit && <span className="ml-1 text-xs font-medium text-ink-500">{unit}</span>}
      </p>
      {hint && <p className="mt-1 text-[11px] text-ink-400">{hint}</p>}
    </Card>
  );
}
