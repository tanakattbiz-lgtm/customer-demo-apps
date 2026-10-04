import { type ReactNode, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, HelpCircle, Lightbulb, Loader2, X } from "lucide-react";

// ---------------- Page header ----------------
/** 画面タイトル + 「この画面でできること」の手順ガイド(初めての人向け。閉じた状態は記憶する) */
export function PageHeader({
  title,
  description,
  actions,
  guide,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  guide?: string[];
}) {
  const key = "guide-closed:" + title;
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(key) !== "1";
    } catch {
      return true;
    }
  });
  const toggle = () => {
    setOpen((o) => {
      try {
        localStorage.setItem(key, o ? "1" : "0");
      } catch {
        /* noop */
      }
      return !o;
    });
  };
  return (
    <div className="mb-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-[28px] font-semibold tracking-wide text-navy-900">{title}</h1>
          {description && <p className="mt-1.5 text-[15px] leading-relaxed text-ink-600">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {guide && (
        <div className="mt-4 rounded-lg border border-navy-100 bg-navy-50/70">
          <button
            onClick={toggle}
            aria-expanded={open}
            className="flex w-full items-center gap-2 px-5 py-3 text-left text-[15px] font-semibold text-navy-900"
          >
            <Lightbulb size={17} className="text-navy-600" />
            この画面の使い方
            <ChevronDown size={17} className={"ml-auto text-navy-500 transition " + (open ? "rotate-180" : "")} />
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.ol
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="grid gap-2.5 overflow-hidden px-5 pb-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {guide.map((g, i) => (
                  <li key={i} className="flex gap-3 rounded-md bg-white px-3.5 py-3 text-[14px] leading-relaxed text-ink-800">
                    <span className="tnum grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy-900 text-[13px] font-semibold text-white">
                      {i + 1}
                    </span>
                    <span>{g}</span>
                  </li>
                ))}
              </motion.ol>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ---------------- Help(用語の説明) ----------------
export function Help({ text, label }: { text: string; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={(label ?? "") + "の説明"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onBlur={() => setOpen(false)}
        className="grid h-5 w-5 place-items-center rounded-full text-ink-400 transition hover:text-navy-700"
      >
        <HelpCircle size={15} />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute top-6 left-1/2 z-50 w-64 -translate-x-1/2 rounded-md bg-navy-950 px-3.5 py-2.5 text-left text-[13px] leading-relaxed font-normal tracking-normal whitespace-normal text-white shadow-lg"
        >
          {label && <span className="mb-0.5 block font-semibold">{label}</span>}
          {text}
        </span>
      )}
    </span>
  );
}

// ---------------- Avatar ----------------
export function Avatar({ name, size = 28, tone = "navy" }: { name: string; size?: number; tone?: "navy" | "light" }) {
  return (
    <div
      title={name}
      className={
        "grid shrink-0 place-items-center rounded-full font-medium " +
        (tone === "navy" ? "bg-navy-800 text-white" : "bg-navy-100 text-navy-800")
      }
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {name.trim().slice(0, 1)}
    </div>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return <Loader2 className={"animate-spin " + className} size={15} />;
}

// ---------------- Pill ----------------
const TONE = {
  gray: "bg-ink-100 text-ink-600 ring-ink-200",
  navy: "bg-navy-50 text-navy-800 ring-navy-200",
  solid: "bg-navy-900 text-white ring-navy-900",
  ok: "bg-ok-50 text-ok-700 ring-ok-600/25",
  warn: "bg-warn-50 text-warn-700 ring-warn-300",
  bad: "bg-bad-50 text-bad-700 ring-bad-100",
} as const;
export type Tone = keyof typeof TONE;

export function Pill({ tone = "gray", children, className = "" }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-[5px] px-2 py-[3px] text-[12.5px] leading-none font-medium whitespace-nowrap ring-1 ring-inset " +
        TONE[tone] +
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
  ...rest
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={"rounded-lg border border-ink-200 bg-white shadow-[0_1px_2px_oklch(25%_0.04_262/0.04)] " + className}>
      {children}
    </div>
  );
}

export function CardHeader({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink-200 px-5 py-3.5">
      <div className="min-w-0">
        <div className="text-[15px] font-semibold text-navy-900">{title}</div>
        {sub && <div className="mt-0.5 text-[12.5px] text-ink-500">{sub}</div>}
      </div>
      {right}
    </div>
  );
}

// ---------------- Skeleton ----------------
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={"skeleton rounded " + className} />;
}
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="divide-y divide-ink-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="hidden h-4 w-32 sm:block" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

// ---------------- Empty ----------------
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
    <div className="flex flex-col items-center justify-center gap-2.5 px-6 py-14 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full border border-navy-200 text-navy-500">{icon}</div>
      <div className="mt-1 text-sm font-semibold text-navy-900">{title}</div>
      {description && <div className="max-w-sm text-[15px] leading-relaxed text-ink-500">{description}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ---------------- Button ----------------
export function Button({
  children,
  variant = "primary",
  loading = false,
  size = "md",
  className = "",
  ...rest
}: {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "md" | "sm";
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition duration-200 ease-out active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400/40 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap";
  const sizes = { md: "h-11 px-5 text-[15px]", sm: "h-9 px-3.5 text-[14px]" };
  const styles = {
    primary: "bg-navy-900 text-white hover:bg-navy-800 shadow-[0_1px_0_oklch(100%_0_0/0.08)_inset]",
    outline: "border border-ink-300 bg-white text-navy-900 hover:border-navy-300 hover:bg-navy-50",
    ghost: "text-ink-600 hover:bg-ink-100 hover:text-navy-900",
    danger: "border border-bad-100 bg-white text-bad-600 hover:bg-bad-50",
  };
  return (
    <button
      className={`${base} ${sizes[size]} ${styles[variant]} ${className}`}
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
  hint,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={"block " + className}>
      <span className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-ink-600">
        {label}
        {required && <span className="text-[11.5px] font-normal text-bad-500">必須</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-[12.5px] text-ink-400">{hint}</span>}
      {error && <span className="mt-1 block text-[12.5px] text-bad-600">{error}</span>}
    </label>
  );
}

export const inputCls =
  "h-11 w-full rounded-md border border-ink-300 bg-white px-3 text-[15px] text-ink-900 outline-none transition placeholder:text-ink-400 hover:border-ink-400 focus:border-navy-500 focus:ring-2 focus:ring-navy-400/20";
export const textareaCls = inputCls.replace("h-11", "min-h-24 py-2.5 leading-relaxed");
export const errCls = " border-bad-500 focus:border-bad-500 focus:ring-bad-500/15";

// ---------------- Overlay base ----------------
function useOverlay(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
}

export function Modal({
  open,
  onClose,
  title,
  sub,
  children,
  footer,
  width = 560,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  sub?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  useOverlay(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-navy-950/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-xl bg-white shadow-[0_24px_60px_-12px_oklch(20%_0.04_262/0.35)] sm:rounded-lg"
            style={{ maxWidth: width }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-ink-200 px-6 py-4">
              <div>
                <h3 className="text-[17px] font-semibold text-navy-900">{title}</h3>
                {sub && <p className="mt-0.5 text-[13px] text-ink-500">{sub}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="閉じる"
                className="-mr-2 grid h-8 w-8 place-items-center rounded-md text-ink-400 transition hover:bg-ink-100 hover:text-navy-900"
              >
                <X size={17} />
              </button>
            </div>
            <div className="thin-scroll flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && (
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-ink-200 bg-ink-50 px-6 py-3.5">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  sub,
  children,
  footer,
  width = 520,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  useOverlay(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40">
          <motion.div
            className="absolute inset-0 bg-navy-950/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            className="absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-[-24px_0_60px_-20px_oklch(20%_0.04_262/0.3)]"
            style={{ maxWidth: width }}
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-ink-200 px-6 py-4">
              <div className="min-w-0">
                <div className="text-[17px] font-semibold text-navy-900">{title}</div>
                {sub && <div className="mt-0.5 text-[13px] text-ink-500">{sub}</div>}
              </div>
              <button
                onClick={onClose}
                aria-label="閉じる"
                className="-mr-2 grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink-400 transition hover:bg-ink-100 hover:text-navy-900"
              >
                <X size={17} />
              </button>
            </div>
            <div className="thin-scroll flex-1 overflow-y-auto">{children}</div>
            {footer && (
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-ink-200 bg-ink-50 px-6 py-3.5">
                {footer}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

// ---------------- Confirm ----------------
export function Confirm({
  open,
  title,
  message,
  confirmLabel = "実行する",
  danger,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal
      open={open}
      onClose={() => !busy && onClose()}
      title={title}
      width={440}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            キャンセル
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            loading={busy}
            onClick={async () => {
              setBusy(true);
              await onConfirm();
              setBusy(false);
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-[15px] leading-relaxed text-ink-700">{message}</div>
    </Modal>
  );
}

// ---------------- Tabs ----------------
export function Tabs<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { value: T; label: string; count?: number }[];
}) {
  return (
    <div className="thin-scroll -mx-1 flex gap-1 overflow-x-auto px-1">
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={
              "relative flex h-11 shrink-0 items-center gap-1.5 px-3.5 text-[15px] transition " +
              (active ? "font-semibold text-navy-900" : "text-ink-500 hover:text-navy-900")
            }
          >
            {it.label}
            {it.count !== undefined && (
              <span
                className={
                  "tnum rounded px-1.5 py-px text-[12px] " +
                  (active ? "bg-navy-900 text-white" : "bg-ink-100 text-ink-500")
                }
              >
                {it.count}
              </span>
            )}
            {active && <motion.span layoutId={`tab-${items[0].value}`} className="absolute inset-x-2 -bottom-px h-[2px] bg-navy-900" />}
          </button>
        );
      })}
    </div>
  );
}

// ---------------- Segmented ----------------
export function Segmented<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { value: T; label: string; icon?: ReactNode }[];
}) {
  return (
    <div className="inline-flex rounded-md border border-ink-300 bg-white p-0.5">
      {items.map((it) => (
        <button
          key={it.value}
          onClick={() => onChange(it.value)}
          className={
            "inline-flex h-9 items-center gap-1.5 rounded-[5px] px-3.5 text-[14px] transition " +
            (value === it.value ? "bg-navy-900 text-white" : "text-ink-600 hover:text-navy-900")
          }
        >
          {it.icon}
          {it.label}
        </button>
      ))}
    </div>
  );
}

// ---------------- Pagination ----------------
export function Pagination({
  page,
  total,
  per,
  onChange,
}: {
  page: number;
  total: number;
  per: number;
  onChange: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / per));
  if (total === 0) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-t border-ink-200 px-5 py-3 text-[13px] text-ink-500">
      <div className="tnum">
        {total}件中 {(page - 1) * per + 1}〜{Math.min(page * per, total)}件
      </div>
      <div className="flex items-center gap-1">
        <button
          aria-label="前のページ"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="grid h-9 w-9 place-items-center rounded-md border border-ink-200 transition hover:bg-ink-50 disabled:opacity-40"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="tnum px-2">
          {page} / {pages}
        </span>
        <button
          aria-label="次のページ"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          className="grid h-9 w-9 place-items-center rounded-md border border-ink-200 transition hover:bg-ink-50 disabled:opacity-40"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ---------------- Definition list ----------------
export function DL({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[96px_1fr] gap-x-4 gap-y-2.5 text-[15px]">
      {items.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-ink-500">{k}</dt>
          <dd className="min-w-0 text-ink-900">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SortTh({
  label,
  k,
  sort,
  onSort,
  className = "",
}: {
  label: string;
  k: string;
  sort: { key: string; dir: 1 | -1 };
  onSort: (k: string) => void;
  className?: string;
}) {
  const active = sort.key === k;
  return (
    <th className={"px-4 py-2.5 font-medium " + className}>
      <button onClick={() => onSort(k)} className={"inline-flex items-center gap-1 transition hover:text-navy-900 " + (active ? "text-navy-900" : "")}>
        {label}
        {active ? (sort.dir === 1 ? <ArrowUp size={11} /> : <ArrowDown size={11} />) : <ChevronsUpDown size={11} className="opacity-50" />}
      </button>
    </th>
  );
}

export const thCls = "px-4 py-2.5 font-medium";
export const tableHeadCls = "whitespace-nowrap border-b border-ink-200 bg-ink-50 text-left text-[12.5px] text-ink-500";
