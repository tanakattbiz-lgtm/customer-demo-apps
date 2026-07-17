import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  Bell,
  Filter,
  LayoutDashboard,
  ListChecks,
  Mail,
  Menu,
  SlidersHorizontal,
  X,
} from "lucide-react";

const NAV = [
  { to: "/", label: "ダッシュボード", icon: LayoutDashboard, end: true },
  { to: "/logs", label: "判定ログ", icon: ListChecks, end: false },
  { to: "/settings", label: "条件設定シート", icon: SlidersHorizontal, end: false },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-0.5">
      {NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-150 ease-out ${
              isActive
                ? "bg-brand-50 text-brand-700"
                : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
            }`
          }
        >
          <n.icon size={16} />
          {n.label}
        </NavLink>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
        <Filter size={16} />
      </div>
      <div className="leading-tight">
        <p className="text-[13px] font-bold text-ink-900">物件メール自動仕分け</p>
        <p className="text-[10px] text-ink-500">株式会社○○ 様 専用</p>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const notImplemented = () => toast.info("このデモでは省略しています");

  return (
    <div className="flex min-h-full bg-ink-100">
      {/* サイドバー(PC) */}
      <aside className="hidden w-60 shrink-0 border-r border-ink-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-ink-200 px-5 py-4">
          <Brand />
        </div>
        <div className="flex-1 p-3">
          <NavItems />
        </div>
        <div className="border-t border-ink-200 p-4">
          <div className="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2.5">
            <Mail size={14} className="shrink-0 text-ink-400" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[11px] font-medium text-ink-700">
                Gmail 連携中(OAuth)
              </p>
              <p className="truncate text-[10px] text-ink-400">
                owner@○○.example.jp
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* サイドバー(モバイル・ドロワー) */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-ink-900/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-white lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-ink-200 px-4 py-4">
                <Brand />
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1 text-ink-500 hover:bg-ink-100"
                  aria-label="閉じる"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 p-3">
                <NavItems onNavigate={() => setOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ヘッダー */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-ink-200 bg-white/90 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-md p-1.5 text-ink-600 hover:bg-ink-100 lg:hidden"
              aria-label="メニュー"
            >
              <Menu size={18} />
            </button>
            <span className="text-[13px] font-medium text-ink-700 lg:hidden">
              {NAV.find((n) => n.to === pathname)?.label ?? "物件メール自動仕分け"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={notImplemented}
              className="relative rounded-md p-2 text-ink-500 transition-colors duration-150 hover:bg-ink-100 hover:text-ink-800"
              aria-label="通知"
            >
              <Bell size={17} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-warn-600" />
            </button>
            <button
              onClick={notImplemented}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors duration-150 hover:bg-ink-100"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
                ○○
              </span>
              <span className="hidden text-[12px] font-medium text-ink-700 sm:block">
                管理者
              </span>
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
