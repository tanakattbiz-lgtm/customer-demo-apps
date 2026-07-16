import { type ReactNode } from "react";
import { avatarGradient } from "../lib/format";
import type { User } from "../data/seed";

/** 頭文字アバター(決定的グラデーション) */
export function Avatar({
  user,
  size = 44,
  ring = false,
}: {
  user: Pick<User, "id" | "name">;
  size?: number;
  ring?: boolean;
}) {
  const initial = user.name.replace(/\s/g, "").slice(0, 1);
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full font-bold text-white select-none ${
        ring ? "ring-2 ring-white" : ""
      }`}
      style={{
        width: size,
        height: size,
        background: avatarGradient(user.id),
        fontSize: size * 0.42,
      }}
      aria-hidden
    >
      {initial}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
  type = "button",
  className = "",
  loading = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "outline" | "soft";
  size?: "sm" | "md";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  loading?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2";
  const sizes = {
    sm: "text-sm px-3.5 py-1.5",
    md: "text-sm px-5 py-2.5",
  };
  const variants = {
    primary:
      "bg-brand-600 text-white shadow-sm shadow-brand-600/25 hover:bg-brand-700 hover:shadow-md hover:shadow-brand-600/30",
    soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
    outline: "border border-ink-300 text-ink-700 bg-white hover:bg-ink-50 hover:border-ink-400",
    ghost: "text-ink-600 hover:bg-ink-100",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
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
      className={`rounded-2xl border border-ink-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Chip({
  children,
  onClick,
  active = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-brand-600 text-white"
          : "bg-ink-100 text-ink-600 hover:bg-ink-200"
      }`}
    >
      {children}
    </button>
  );
}

/** 投稿カードのスケルトン */
export function PostSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="skeleton h-11 w-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 w-32 rounded" />
          <div className="skeleton h-3 w-20 rounded" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="skeleton h-3.5 w-full rounded" />
        <div className="skeleton h-3.5 w-11/12 rounded" />
        <div className="skeleton h-3.5 w-2/3 rounded" />
      </div>
    </div>
  );
}
