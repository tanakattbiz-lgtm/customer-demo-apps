import { type ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Loader2, FileText, FileBox, FileWarning } from "lucide-react";
import { fileKind } from "../lib/format";

// ---------------- Spinner ----------------
export function Spinner({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <Loader2 className={"animate-spin " + className} size={size} />;
}

// ---------------- Badge / Pill ----------------
const TONE: Record<string, string> = {
  gray: "bg-ink-200 text-ink-700",
  blue: "bg-brand-100 text-brand-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-rose-100 text-rose-700",
  violet: "bg-violet-100 text-violet-700",
};

export function Pill({
  tone = "gray",
  children,
  className = "",
}: {
  tone?: keyof typeof TONE;
  children: ReactNode;
  className?: string;
}) {
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

// ---------------- Card ----------------
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={
        "rounded-2xl border border-ink-200 bg-white shadow-[0_1px_2px_oklch(0%_0_0_/_0.04)] " + className
      }
    >
      {children}
    </div>
  );
}

// ---------------- Skeleton ----------------
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={"skeleton rounded-md " + className} />;
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
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-500">{icon}</div>
      <div className="text-base font-semibold text-ink-800">{title}</div>
      {description && <div className="max-w-sm text-sm text-ink-500">{description}</div>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

// ---------------- Modal ----------------
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 560,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
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
            className="absolute inset-0 bg-ink-900/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative z-10 flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
            style={{ maxWidth: width }}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-ink-100 px-6 py-4">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-ink-900">{title}</h3>
                {subtitle && <p className="mt-0.5 truncate text-xs text-ink-400">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="閉じる"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-2 border-t border-ink-100 bg-ink-50 px-6 py-3.5">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ---------------- Button ----------------
export function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  ...rest
}: {
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline" | "danger" | "subtle";
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";
  const styles: Record<string, string> = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
    ghost: "text-ink-600 hover:bg-ink-100",
    outline: "border border-ink-200 bg-white text-ink-700 hover:bg-ink-50",
    subtle: "bg-brand-50 text-brand-700 hover:bg-brand-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  return (
    <button className={base + " " + styles[variant] + " " + className} disabled={loading || rest.disabled} {...rest}>
      {loading && <Spinner />}
      {children}
    </button>
  );
}

// ---------------- Field / inputs ----------------
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
      <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-ink-700">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25";

// ---------------- FileChip(図面ファイル) ----------------
export function FileChip({ name }: { name: string }) {
  const kind = fileKind(name);
  const conf =
    kind === "pdf"
      ? { icon: <FileText size={13} />, cls: "bg-rose-50 text-rose-700 border-rose-200" }
      : kind === "dxf"
        ? { icon: <FileBox size={13} />, cls: "bg-brand-50 text-brand-700 border-brand-200" }
        : { icon: <FileWarning size={13} />, cls: "bg-ink-100 text-ink-600 border-ink-200" };
  return (
    <span
      className={
        "inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium " + conf.cls
      }
    >
      {conf.icon}
      <span className="tnum truncate">{name}</span>
    </span>
  );
}

// ---------------- Toggle ----------------
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2"
    >
      <span
        className={
          "relative h-6 w-11 rounded-full transition " + (checked ? "bg-brand-600" : "bg-ink-300")
        }
      >
        <span
          className={
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition " +
            (checked ? "translate-x-5" : "")
          }
        />
      </span>
      {label && <span className="text-sm text-ink-700">{label}</span>}
    </button>
  );
}
