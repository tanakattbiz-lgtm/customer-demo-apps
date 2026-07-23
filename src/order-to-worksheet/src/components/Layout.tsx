import { useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  FileInput,
  History,
  LayoutDashboard,
  Bell,
  Menu,
  X,
  RotateCcw,
  Factory,
} from "lucide-react";
import { useStore } from "../store";

const NAV = [
  { to: "/", label: "オーダー変換", icon: FileInput, end: true },
  { to: "/history", label: "変換履歴", icon: History, end: false },
  { to: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard, end: false },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-brand-600 text-white"
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
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <div className="grid size-9 place-items-center rounded-lg bg-brand-600 text-white">
        <Factory size={18} />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold text-ink-900">指示書コンバータ</p>
        <p className="text-[11px] text-ink-500">株式会社○○ 製造管理</p>
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const reset = useStore((s) => s.reset);
  const loc = useLocation();
  const title =
    NAV.find((n) => (n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to)))
      ?.label ?? "オーダー変換";

  const doReset = () => {
    reset();
    toast.success("デモデータを初期状態に戻しました");
  };

  return (
    <div className="flex min-h-full bg-ink-100">
      {/* サイドバー(PC) */}
      <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r border-ink-200 bg-white px-4 py-5 lg:flex">
        <Brand />
        <NavItems />
        <div className="mt-auto space-y-2">
          <button
            onClick={doReset}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-ink-500 transition-colors hover:bg-ink-100"
          >
            <RotateCcw size={14} />
            デモデータをリセット
          </button>
          <p className="px-3 text-[11px] leading-relaxed text-ink-400">
            ※ 提案用デモ。入力内容はブラウザに保存されます。
          </p>
        </div>
      </aside>

      {/* ドロワー(モバイル) */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col gap-6 bg-white px-4 py-5 shadow-xl">
            <div className="flex items-center justify-between">
              <Brand />
              <button onClick={() => setOpen(false)} className="text-ink-500">
                <X size={20} />
              </button>
            </div>
            <NavItems onNavigate={() => setOpen(false)} />
            <button
              onClick={doReset}
              className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-ink-500 hover:bg-ink-100"
            >
              <RotateCcw size={14} />
              デモデータをリセット
            </button>
          </aside>
        </div>
      )}

      {/* 本体 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-ink-200 bg-white/85 px-4 backdrop-blur lg:px-8">
          <button
            onClick={() => setOpen(true)}
            className="text-ink-600 lg:hidden"
            aria-label="メニュー"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-sm font-semibold text-ink-800">{title}</h1>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => toast("このデモでは通知機能は省略しています")}
              className="relative grid size-9 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100"
              aria-label="通知"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-brand-500" />
            </button>
            <button
              onClick={() => toast("このデモではアカウント設定は省略しています")}
              className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-ink-100"
            >
              <span className="grid size-8 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                管理
              </span>
              <span className="hidden text-xs text-ink-600 sm:block">
                管理ユーザー
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
