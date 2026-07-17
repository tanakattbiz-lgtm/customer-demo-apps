import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

/* ---------- 金額入力(万円単位) ---------- */
export function MoneyField({
  label, value, onChange, hint, error, required, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-baseline gap-2 text-sm font-semibold text-ink">
        {label}
        {required && (
          <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">必須</span>
        )}
      </label>
      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          value={value}
          min={0}
          placeholder={placeholder ?? "0"}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border bg-white px-4 py-3 pr-14 text-right text-lg font-semibold tabular-nums outline-none transition-shadow duration-200 focus:ring-4 ${
            error
              ? "border-red-400 focus:ring-red-100"
              : "border-slate-200 focus:border-primary-400 focus:ring-primary-100"
          }`}
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
          万円
        </span>
      </div>
      {error ? (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

/* ---------- 数値入力(単位付き) ---------- */
export function NumField({
  label, value, onChange, unit, hint, error, min = 0, max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  hint?: string;
  error?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>
      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border bg-white px-4 py-3 pr-12 text-right text-lg font-semibold tabular-nums outline-none transition-shadow duration-200 focus:ring-4 ${
            error
              ? "border-red-400 focus:ring-red-100"
              : "border-slate-200 focus:border-primary-400 focus:ring-primary-100"
          }`}
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
          {unit}
        </span>
      </div>
      {error ? (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

/* ---------- トグル ---------- */
export function Toggle({
  label, desc, checked, onChange,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors duration-200 ${
        checked
          ? "border-primary-300 bg-primary-50"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {desc && <span className="mt-0.5 block text-xs text-slate-500">{desc}</span>}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? "bg-primary-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

/* ---------- ボタン ---------- */
export function Button({
  children, onClick, loading, variant = "primary", type = "button", full, disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  loading?: boolean;
  variant?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
  full?: boolean;
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50";
  const styles = {
    primary:
      "bg-primary-600 text-white shadow-sm shadow-primary-600/25 hover:bg-primary-700 active:scale-[0.98]",
    ghost:
      "border border-slate-200 bg-white text-ink hover:bg-slate-50 active:scale-[0.98]",
    danger:
      "border border-red-200 bg-white text-red-600 hover:bg-red-50 active:scale-[0.98]",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`${base} ${styles[variant]} ${full ? "w-full" : ""}`}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

/* ---------- テキスト入力(フォーム用) ---------- */
export function TextField({
  label, value, onChange, type = "text", error, required, placeholder, textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  textarea?: boolean;
}) {
  const cls = `w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-shadow duration-200 focus:ring-4 ${
    error
      ? "border-red-400 focus:ring-red-100"
      : "border-slate-200 focus:border-primary-400 focus:ring-primary-100"
  }`;
  return (
    <div>
      <label className="mb-1.5 flex items-baseline gap-2 text-sm font-semibold text-ink">
        {label}
        {required && (
          <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">必須</span>
        )}
      </label>
      {textarea ? (
        <textarea
          value={value}
          rows={4}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      )}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

/* ---------- 選択チップ ---------- */
export function Chip({
  active, onClick, children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 ${
        active
          ? "border-primary-600 bg-primary-600 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------- スケルトン ---------- */
export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

/* ---------- 免責 ---------- */
export function Disclaimer() {
  return (
    <p className="text-[11px] leading-relaxed text-slate-400">
      ※本シミュレーションは一般的な税制に基づく概算です。実際の税額は個別の事情・最新の税制により異なります。正確な金額は税理士等の専門家にご確認ください。
    </p>
  );
}

/* ---------- 評価の星 ---------- */
export function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width="13" height="13" viewBox="0 0 24 24"
          fill={n <= Math.round(rating) ? "currentColor" : "none"}
          stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

/* ---------- モーダル ---------- */
export function Modal({
  open, onClose, children, title,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
}) {
  const [, setMounted] = useState(false);
  if (!open) return null;
  void setMounted;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="閉じる"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
