import type { ReactNode } from "react";
import type { WsStatus } from "../data/seed";

export function StatusBadge({ status }: { status: WsStatus }) {
  const map: Record<WsStatus, string> = {
    確定: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    要確認: "bg-amber-50 text-amber-700 ring-amber-600/20",
    下書き: "bg-ink-100 text-ink-500 ring-ink-400/25",
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

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} />;
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
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-300 bg-white/60 px-6 py-14 text-center">
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

export function Field({
  label,
  value,
  mono,
  muted,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  muted?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd
        className={`mt-0.5 text-sm ${muted ? "text-ink-400" : "text-ink-900"} ${
          mono ? "mono" : ""
        }`}
      >
        {value || <span className="text-ink-400">—</span>}
      </dd>
    </div>
  );
}
