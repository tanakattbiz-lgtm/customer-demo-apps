import { type ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Loader2 } from "lucide-react";

// ---------------- Avatar ----------------
export function Avatar({
  name,
  color = "oklch(60% 0.14 250)",
  size = 36,
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
  brand: "bg-brand-100 text-brand-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-rose-100 text-rose-700",
  heart: "bg-rose-100 text-rose-600",
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
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
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
  variant?: "primary" | "ghost" | "outline" | "danger" | "heart";
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";
  const styles: Record<string, string> = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
    heart: "bg-heart-500 text-white hover:bg-heart-600 shadow-sm",
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

/** 疑似 QR コード(装飾用の決定論パターン。実データは埋め込まない) */
export function FakeQR({ seed, size = 132 }: { seed: string; size?: number }) {
  const n = 21;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const cell = size / n;
  const rects: ReactNode[] = [];
  const on = (x: number, y: number) => {
    h = (h * 1103515245 + 12345) >>> 0;
    return ((h >>> ((x + y) % 16)) & 1) === 1;
  };
  const finder = (ox: number, oy: number) => (
    <g key={`f-${ox}-${oy}`}>
      <rect x={ox * cell} y={oy * cell} width={cell * 7} height={cell * 7} fill="currentColor" />
      <rect x={(ox + 1) * cell} y={(oy + 1) * cell} width={cell * 5} height={cell * 5} fill="white" />
      <rect x={(ox + 2) * cell} y={(oy + 2) * cell} width={cell * 3} height={cell * 3} fill="currentColor" />
    </g>
  );
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      if (inFinder(x, y)) continue;
      if (on(x, y))
        rects.push(<rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill="currentColor" />);
    }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="text-ink-900">
      <rect width={size} height={size} fill="white" />
      {rects}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
    </svg>
  );
}
