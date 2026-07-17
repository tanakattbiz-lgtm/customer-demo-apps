import { type ReactNode, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  Bell,
  ClipboardList,
  LayoutDashboard,
  Menu,
  RotateCcw,
  Settings,
  X,
} from "lucide-react";
import { useStore } from "../store";
import { Avatar, Button, Modal } from "./ui";

const NAV = [
  { to: "/", label: "案件一覧", icon: ClipboardList },
  { to: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={onNavigate}
          className={({ isActive }) =>
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition duration-150 " +
            (isActive
              ? "bg-brand-50 text-brand-700"
              : "text-ink-600 hover:bg-ink-100 hover:text-ink-900")
          }
        >
          <Icon size={17} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-6 py-5">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
        ○
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold text-ink-900">業務ワークフロー</div>
        <div className="text-[11px] text-ink-400">株式会社○○</div>
      </div>
    </div>
  );
}

function ResetButton({ compact = false }: { compact?: boolean }) {
  const reset = useStore((s) => s.reset);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 500));
    reset();
    setBusy(false);
    setOpen(false);
    toast.success("デモデータを初期状態に戻しました");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-500 transition duration-150 hover:bg-ink-100 hover:text-ink-800 " +
          (compact ? "" : "w-full")
        }
      >
        <RotateCcw size={16} />
        デモデータをリセット
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="デモデータをリセット">
        <p className="text-sm leading-relaxed text-ink-600">
          このデモで追加・編集した内容をすべて破棄し、初期のサンプルデータに戻します。
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button variant="danger" loading={busy} onClick={run}>
            リセットする
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const { pathname } = useLocation();
  const overdue = useStore((s) =>
    s.jobs.filter((j) => j.status !== "done" && j.dueDate < new Date().toISOString().slice(0, 10)).length,
  );

  const notImplemented = () => toast("このデモでは省略しています");

  return (
    <div className="flex min-h-full">
      {/* サイドバー（PC） */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-ink-200 bg-white lg:flex">
        <Brand />
        <NavItems />
        <div className="mt-auto border-t border-ink-100 p-3">
          <ResetButton />
        </div>
      </aside>

      {/* ドロワー（モバイル） */}
      <AnimatePresence>
        {drawer && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-ink-900/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              className="relative z-10 flex h-full w-64 flex-col bg-white"
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between">
                <Brand />
                <button
                  onClick={() => setDrawer(false)}
                  aria-label="閉じる"
                  className="mr-3 grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100"
                >
                  <X size={18} />
                </button>
              </div>
              <NavItems onNavigate={() => setDrawer(false)} />
              <div className="mt-auto border-t border-ink-100 p-3">
                <ResetButton />
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ヘッダー */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-ink-200 bg-white/85 px-4 backdrop-blur-sm sm:px-6">
          <button
            onClick={() => setDrawer(true)}
            aria-label="メニュー"
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100 lg:hidden"
          >
            <Menu size={19} />
          </button>
          <div className="text-sm font-semibold text-ink-800">
            {NAV.find((n) => n.to === pathname)?.label ?? "案件詳細"}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={notImplemented}
              aria-label="通知"
              className="relative grid h-9 w-9 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100"
            >
              <Bell size={18} />
              {overdue > 0 && (
                <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {overdue}
                </span>
              )}
            </button>
            <button
              onClick={notImplemented}
              aria-label="設定"
              className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100 sm:grid"
            >
              <Settings size={18} />
            </button>
            <button
              onClick={notImplemented}
              className="ml-1 flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition hover:bg-ink-100"
            >
              <Avatar name="藤井 奈緒" color="oklch(51% 0.16 264)" size={28} />
              <span className="hidden text-xs font-medium text-ink-700 sm:block">藤井 奈緒</span>
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
