import { type ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Bell, CalendarRange, LayoutDashboard, Menu as MenuIcon, MessageCircle, Settings, X } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../store";
import { LINE_GREEN } from "./ui";

const NAV = [
  { to: "/admin", label: "予約管理", icon: LayoutDashboard },
  { to: "/admin/settings", label: "通知・連携設定", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [drawer, setDrawer] = useState(false);
  const logs = useStore((s) => s.logs);
  const failed = logs.filter((l) => l.status === "失敗").length;

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ backgroundColor: LINE_GREEN }}>
          <MessageCircle size={18} />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold text-slate-900">○○サロン</div>
          <div className="text-[11px] text-slate-400">LINE予約 管理画面</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((n) => {
          const active = pathname === n.to;
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setDrawer(false)}
              className={
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition " +
                (active ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-100")
              }
            >
              <n.icon size={18} />
              {n.label}
            </Link>
          );
        })}
        <Link
          to="/book"
          onClick={() => setDrawer(false)}
          className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          <CalendarRange size={18} />
          お客様の予約画面
        </Link>
      </nav>
      <div className="border-t border-slate-100 p-4">
        <div className="rounded-xl bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500">
          <div className="font-semibold text-slate-700">提案デモ</div>
          LINE連携 予約・無料相談システムの画面イメージです。データはブラウザ内に保存されます。
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* PC サイドバー */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">{Sidebar}</aside>

      {/* モバイルドロワー */}
      <AnimatePresence>
        {drawer && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-slate-900/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <button
                onClick={() => setDrawer(false)}
                className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
                aria-label="閉じる"
              >
                <X size={18} />
              </button>
              {Sidebar}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ヘッダー */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-6">
          <button
            onClick={() => setDrawer(true)}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="メニュー"
          >
            <MenuIcon size={20} />
          </button>
          <div className="flex-1" />
          <button
            onClick={() =>
              toast(failed > 0 ? `未対応の配信エラーが${failed}件あります` : "新着の通知はありません", {
                icon: <Bell size={16} />,
              })
            }
            className="relative grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100"
            aria-label="通知"
          >
            <Bell size={19} />
            {failed > 0 && (
              <span className="absolute top-1.5 right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {failed}
              </span>
            )}
          </button>
          <button
            onClick={() => toast("このデモではプロフィール設定を省略しています")}
            className="flex items-center gap-2 rounded-full py-1 pr-1 pl-1 transition hover:bg-slate-100"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-800 text-xs font-bold text-white">
              店長
            </span>
          </button>
        </header>
        <main className="min-w-0 flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
