import { useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  FileSpreadsheet,
  FileText,
  Tags,
  Bell,
  RotateCcw,
  Menu,
  X,
  Bot,
} from "lucide-react";
import { useStore } from "../store";

const NAV = [
  { to: "/", label: "取り込み・振り分け", icon: FileSpreadsheet },
  { to: "/documents", label: "書類差し込み", icon: FileText },
  { to: "/labels", label: "宛名ラベル", icon: Tags },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const reset = useStore((s) => s.reset);
  const loc = useLocation();

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
              isActive
                ? "bg-brand-50 text-brand-700"
                : "text-ink-600 hover:bg-ink-100"
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-full">
      {/* サイドバー(PC) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-200 bg-white lg:flex">
        <Brand />
        <div className="flex-1 px-3 py-4">{nav}</div>
        <ResetBlock
          onReset={() => {
            reset();
            toast.success("初期状態に戻しました");
          }}
        />
      </aside>

      {/* ドロワー(モバイル) */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-ink-200 pr-2">
              <Brand />
              <button
                className="rounded-lg p-2 text-ink-500 hover:bg-ink-100"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 px-3 py-4">{nav}</div>
            <ResetBlock
              onReset={() => {
                reset();
                setOpen(false);
                toast.success("初期状態に戻しました");
              }}
            />
          </aside>
        </div>
      )}

      {/* 本体 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-ink-200 bg-white/85 px-4 backdrop-blur lg:px-6">
          <button
            className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>
          <p className="text-sm font-medium text-ink-700">
            {NAV.find((n) => n.to === loc.pathname)?.label ?? "取り込み・振り分け"}
          </p>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => toast("このデモでは通知機能は省略しています")}
              className="rounded-lg p-2 text-ink-500 hover:bg-ink-100"
              aria-label="通知"
            >
              <Bell size={18} />
            </button>
            <div className="ml-1 flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-ink-100">
              <div className="grid size-7 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                担
              </div>
              <span className="hidden text-sm text-ink-700 sm:inline">担当者</span>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-4">
      <div className="grid size-9 place-items-center rounded-lg bg-brand-600 text-white">
        <Bot size={20} />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold text-ink-900">DocuFlow</p>
        <p className="text-[11px] text-ink-400">書類・宛名ラベル自動化</p>
      </div>
    </div>
  );
}

function ResetBlock({ onReset }: { onReset: () => void }) {
  return (
    <div className="border-t border-ink-200 p-3">
      <button
        onClick={onReset}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-ink-500 hover:bg-ink-100"
      >
        <RotateCcw size={14} />
        デモを初期状態に戻す
      </button>
      <p className="mt-2 px-3 text-[10px] leading-relaxed text-ink-400">
        株式会社○○様 向け 提案デモ ／ サンプルデータは架空のものです
      </p>
    </div>
  );
}
