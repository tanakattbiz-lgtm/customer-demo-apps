import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import type { DocType, RowStatus } from "../data/seed";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} />;
}

export function DocBadge({ type }: { type: DocType }) {
  const map: Record<DocType, string> = {
    A: "bg-brand-50 text-brand-700 ring-brand-600/20",
    B: "bg-teal-50 text-teal-700 ring-teal-600/20",
  };
  const label: Record<DocType, string> = { A: "書類A・納品書", B: "書類B・請求書" };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${map[type]}`}
    >
      <span className="mono font-bold">{type}</span>
      <span className="hidden sm:inline">{label[type].slice(3)}</span>
    </span>
  );
}

export function StatusBadge({ status }: { status: RowStatus }) {
  const map: Record<RowStatus, string> = {
    生成済み: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    未生成: "bg-ink-100 text-ink-500 ring-ink-400/25",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${map[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({
  variant = "primary",
  loading,
  icon,
  children,
  className = "",
  disabled,
  ...rest
}: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500";
  const styles: Record<string, string> = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-600/20",
    outline: "border border-ink-300 bg-white text-ink-700 hover:bg-ink-50",
    ghost: "text-ink-600 hover:bg-ink-100",
  };
  return (
    <button
      className={`${base} ${styles[variant]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-ink-200 bg-white ${className}`}
    >
      {children}
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
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-300 bg-white/60 px-6 py-16 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-brand-50 text-brand-500">
        {icon}
      </div>
      <div>
        <p className="font-medium text-ink-800">{title}</p>
        <p className="mt-1 text-sm text-ink-500">{desc}</p>
      </div>
      {action}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  tone = "ink",
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  tone?: "ink" | "brand" | "teal" | "amber";
}) {
  const toneMap: Record<string, string> = {
    ink: "text-ink-900",
    brand: "text-brand-700",
    teal: "text-teal-700",
    amber: "text-amber-700",
  };
  return (
    <div className="rounded-xl border border-ink-200 bg-white px-4 py-3.5">
      <p className="text-xs text-ink-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tnum ${toneMap[tone]}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-400">{sub}</p>}
    </div>
  );
}

export const yen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;
