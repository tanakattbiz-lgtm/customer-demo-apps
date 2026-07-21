import { type ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Loader2, Star, Car } from "lucide-react";

// ---------------- Spinner ----------------
export function Spinner({ className = "" }: { className?: string }) {
  return <Loader2 className={"animate-spin " + className} size={16} />;
}

// ---------------- Stars ----------------
export function Stars({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center" aria-label={`評価 ${value}`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative" style={{ width: size, height: size }}>
            <Star size={size} className="absolute text-ink-200" fill="currentColor" strokeWidth={0} />
            <span className="absolute overflow-hidden" style={{ width: `${fill * 100}%`, height: size }}>
              <Star size={size} className="text-amber-400" fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

// ---------------- Rating input ----------------
export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n}点`}
          className="transition active:scale-90"
        >
          <Star
            size={28}
            strokeWidth={0}
            fill="currentColor"
            className={n <= value ? "text-amber-400" : "text-ink-200 hover:text-amber-200"}
          />
        </button>
      ))}
    </div>
  );
}

// ---------------- Pill ----------------
const TONE: Record<string, string> = {
  gray: "bg-ink-100 text-ink-600 border-ink-200",
  blue: "bg-brand-50 text-brand-700 border-brand-200",
  aqua: "bg-aqua-500/12 text-aqua-500 border-aqua-500/25",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  red: "bg-rose-50 text-rose-700 border-rose-200",
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
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap " +
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

// ---------------- PhotoTile(施工写真プレースホルダー) ----------------
// 実写真の代わりに、艶のあるグラデーション面 + 車シルエットで施工イメージを表現。
export function PhotoTile({
  hue,
  label,
  className = "",
  rounded = "rounded-xl",
  icon = true,
}: {
  hue: number;
  label?: string;
  className?: string;
  rounded?: string;
  icon?: boolean;
}) {
  const bg = `radial-gradient(120% 90% at 20% 15%, oklch(78% 0.12 ${hue}) 0%, oklch(55% 0.16 ${hue}) 45%, oklch(32% 0.1 ${hue}) 100%)`;
  return (
    <div
      className={`gloss relative overflow-hidden ${rounded} ${className}`}
      style={{ background: bg }}
    >
      {icon && (
        <Car
          className="absolute -bottom-3 -right-2 text-white/15"
          size={96}
          strokeWidth={1.5}
        />
      )}
      {label && (
        <span className="absolute bottom-2 left-3 right-3 truncate text-xs font-medium text-white/95 drop-shadow">
          {label}
        </span>
      )}
    </div>
  );
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
            <div className="thin-scroll max-h-[calc(92vh-64px)] overflow-y-auto px-6 py-5">{children}</div>
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
    <button className={base + " " + styles[variant] + " " + className} disabled={loading || rest.disabled} {...rest}>
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
