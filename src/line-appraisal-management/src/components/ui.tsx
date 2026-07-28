import { type ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Loader2 } from "lucide-react";

// ---------------- Avatar ----------------
export function Avatar({
  name,
  color = "oklch(52% 0.12 155)",
  size = 34,
}: {
  name: string;
  color?: string;
  size?: number;
}) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.4 }}
    >
      {name.trim().slice(0, 1)}
    </div>
  );
}

// ---------------- Spinner ----------------
export function Spinner({ className = "" }: { className?: string }) {
  return <Loader2 className={"animate-spin " + className} size={16} />;
}

// ---------------- Badge / Pill ----------------
const TONE: Record<string, string> = {
  gray: "bg-ink-200 text-ink-700",
  green: "bg-brand-100 text-brand-700",
  blue: "bg-sky-100 text-sky-700",
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

export function StatusDot({ tone = "gray" }: { tone?: keyof typeof TONE }) {
  const c: Record<string, string> = {
    gray: "bg-ink-400",
    green: "bg-brand-500",
    blue: "bg-sky-500",
    amber: "bg-amber-500",
    red: "bg-rose-500",
    violet: "bg-violet-500",
  };
  return <span className={"inline-block h-2 w-2 rounded-full " + (c[tone] ?? c.gray)} />;
}

// ---------------- Card ----------------
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={
        "rounded-2xl border border-ink-200 bg-white shadow-[0_1px_2px_oklch(0%_0_0_/_0.04)] " +
        className
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
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-500">
        {icon}
      </div>
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
  children,
  width = 520,
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
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
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
            <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
              <h3 className="text-base font-bold text-ink-900">{title}</h3>
              <button
                onClick={onClose}
                aria-label="閉じる"
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="thin-scroll max-h-[calc(92vh-64px)] overflow-y-auto px-6 py-5">
              {children}
            </div>
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
  variant?: "primary" | "ghost" | "outline" | "danger";
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";
  const styles: Record<string, string> = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
    ghost: "text-ink-600 hover:bg-ink-100",
    outline: "border border-ink-200 bg-white text-ink-700 hover:bg-ink-50",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  return (
    <button
      className={base + " " + styles[variant] + " " + className}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

// ---------------- Field ----------------
export function Field({
  label,
  required,
  error,
  children,
  hint,
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

// ---------------- StatusBadge (査定ステータス専用) ----------------
import type { Status } from "../data/seed";

export function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { tone: keyof typeof TONE; dot: keyof typeof TONE }> = {
    未対応: { tone: "amber", dot: "amber" },
    査定中: { tone: "blue", dot: "blue" },
    回答済: { tone: "green", dot: "green" },
  };
  const m = map[status];
  return (
    <Pill tone={m.tone}>
      <StatusDot tone={m.dot} />
      {status}
    </Pill>
  );
}

// 商品の受付画像プレースホルダ(実画像を持たないため意匠で代替)
export function PhotoTile({ label, i = 0, className = "" }: { label?: string; i?: number; className?: string }) {
  const hues = [155, 250, 30, 90, 300, 200];
  const h = hues[i % hues.length];
  return (
    <div
      className={"relative grid place-items-center overflow-hidden rounded-lg " + className}
      style={{
        background: `linear-gradient(135deg, oklch(92% 0.04 ${h}), oklch(80% 0.06 ${h}))`,
      }}
    >
      <svg viewBox="0 0 24 24" width="26" height="26" className="text-white/80" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10" r="1.6" />
        <path d="M4 17l4.5-4 3 2.5L15 12l5 5" />
      </svg>
      {label && (
        <span className="absolute bottom-1 left-1 rounded bg-black/35 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {label}
        </span>
      )}
    </div>
  );
}
