import { type ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, X } from "lucide-react";

// LINE ブランドグリーン(顧客向け画面のアクセント)
export const LINE_GREEN = "#06C755";

// ---------------- Spinner ----------------
export function Spinner({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <Loader2 className={"animate-spin " + className} size={size} />;
}

// ---------------- Badge / Pill ----------------
const TONE: Record<string, string> = {
  gray: "bg-slate-100 text-slate-600",
  green: "bg-emerald-100 text-emerald-700",
  blue: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-rose-100 text-rose-700",
  violet: "bg-violet-100 text-violet-700",
};

export type Tone = keyof typeof TONE;

export function Pill({ tone = "gray", children, className = "" }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap " +
        (TONE[tone] ?? TONE.gray) +
        " " +
        className
      }
    >
      {children}
    </span>
  );
}

export function StatusDot({ tone = "gray" }: { tone?: Tone }) {
  const c: Record<string, string> = {
    gray: "bg-slate-400",
    green: "bg-emerald-500",
    blue: "bg-sky-500",
    amber: "bg-amber-500",
    red: "bg-rose-500",
    violet: "bg-violet-500",
  };
  return <span className={"inline-block h-2 w-2 shrink-0 rounded-full " + (c[tone] ?? c.gray)} />;
}

// ---------------- Card ----------------
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={
        "rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] " + className
      }
    >
      {children}
    </div>
  );
}

// ---------------- Skeleton ----------------
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={"animate-pulse rounded-md bg-slate-200 " + className} />;
}

// ---------------- EmptyState ----------------
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-500">{icon}</div>
      <div className="text-base font-semibold text-slate-800">{title}</div>
      {description && <div className="max-w-sm text-sm text-slate-500">{description}</div>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

// ---------------- Buttons ----------------
export function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  ...rest
}: {
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline" | "danger" | "line";
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";
  const styles: Record<string, string> = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
    ghost: "text-slate-600 hover:bg-slate-100",
    outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    line: "text-white shadow-sm hover:brightness-105",
  };
  const style = variant === "line" ? { backgroundColor: LINE_GREEN } : undefined;
  return (
    <button
      className={base + " " + styles[variant] + " " + className}
      style={style}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

// ---------------- Field / input ----------------
export function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25";

// ---------------- Toggle ----------------
export function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-40 " +
        (checked ? "bg-emerald-500" : "bg-slate-300")
      }
    >
      <span
        className={
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 " +
          (checked ? "translate-x-5" : "translate-x-0")
        }
      />
    </button>
  );
}

// ---------------- Modal ----------------
export function Modal({
  open,
  onClose,
  title,
  children,
  width = 480,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative z-10 max-h-[92vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
            style={{ maxWidth: width }}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <button
                onClick={onClose}
                aria-label="閉じる"
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[calc(92vh-60px)] overflow-y-auto px-5 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// 数字を等幅で整列
export const tnum = "[font-variant-numeric:tabular-nums]";
