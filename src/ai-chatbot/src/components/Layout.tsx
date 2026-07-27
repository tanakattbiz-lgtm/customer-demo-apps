import { type ReactNode, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  MessagesSquare,
  BookOpen,
  Bot,
  Menu,
  Bell,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../store";
import { ConfirmDialog } from "./ui";

const NAV = [
  { to: "/", label: "ダッシュボード", icon: LayoutDashboard, end: true },
  { to: "/logs", label: "会話ログ", icon: MessagesSquare, end: false },
  { to: "/knowledge", label: "ナレッジベース", icon: BookOpen, end: false },
];

export function Layout({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const reset = useStore((s) => s.reset);
  const loc = useLocation();
  const title = NAV.find((n) => (n.end ? n.to === loc.pathname : loc.pathname.startsWith(n.to) && n.to !== "/"))?.label
    ?? "ダッシュボード";

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
          <Bot size={20} />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold text-ink-900">ChatOps Console</div>
          <div className="text-[11px] text-ink-400">株式会社○○</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={() => setDrawer(false)}
            className={({ isActive }) =>
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition " +
              (isActive
                ? "bg-brand-50 text-brand-700"
                : "text-ink-600 hover:bg-ink-100 hover:text-ink-900")
            }
          >
            <n.icon size={18} />
            {n.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ink-100 p-3">
        <button
          onClick={() => setConfirmReset(true)}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-500 transition hover:bg-ink-100 hover:text-ink-800"
        >
          <RotateCcw size={16} /> デモデータを初期化
        </button>
        <div className="mt-2 px-3 text-[11px] leading-relaxed text-ink-300">
          これはご提案用のデモです。データはブラウザ内にのみ保存されます。
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full bg-ink-100">
      {/* デスクトップ・サイドバー */}
      <aside className="hidden w-64 shrink-0 border-r border-ink-200 bg-white lg:block">{sidebar}</aside>

      {/* モバイル・ドロワー */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-ink-200 bg-white lg:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* トップバー */}
        <header className="flex items-center gap-3 border-b border-ink-200 bg-white/80 px-4 py-3 backdrop-blur lg:px-8">
          <button
            onClick={() => setDrawer(true)}
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100 lg:hidden"
            aria-label="メニュー"
          >
            <Menu size={20} />
          </button>
          <h1 className="flex-1 truncate text-base font-bold text-ink-900">{title}</h1>
          <button
            onClick={() => toast.info("このデモでは通知機能は省略しています")}
            className="relative grid h-9 w-9 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100"
            aria-label="通知"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </button>
          <div className="flex items-center gap-2 pl-1">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              管
            </div>
            <div className="hidden text-sm leading-tight sm:block">
              <div className="font-semibold text-ink-800">管理者</div>
              <div className="text-[11px] text-ink-400">運用チーム</div>
            </div>
          </div>
        </header>

        <main className="thin-scroll flex-1 overflow-y-auto">{children}</main>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="デモデータを初期化しますか？"
        message="ナレッジベースと会話ログを初期状態に戻します。デモ中に追加・編集した内容は失われます。"
        confirmText="初期化する"
        onConfirm={() => {
          reset();
          setConfirmReset(false);
          toast.success("デモデータを初期化しました");
        }}
        onClose={() => setConfirmReset(false)}
      />
    </div>
  );
}
