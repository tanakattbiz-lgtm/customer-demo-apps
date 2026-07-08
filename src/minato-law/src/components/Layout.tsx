import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  MessageSquare,
  CreditCard,
  Bell,
  Settings,
  Menu,
  X,
  Search,
  Scale,
  Plus,
} from "lucide-react";
import { useStore, staffById } from "../store/useStore";
import { Avatar } from "./ui";

const NAV = [
  { to: "/", label: "ダッシュボード", icon: LayoutDashboard, end: true },
  { to: "/matters", label: "案件管理", icon: Briefcase },
  { to: "/clients", label: "顧問先・会員", icon: Users },
  { to: "/chat", label: "メッセージ", icon: MessageSquare },
  { to: "/billing", label: "請求・決済", icon: CreditCard },
  { to: "/notifications", label: "通知", icon: Bell },
  { to: "/settings", label: "設定", icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const loc = useLocation();
  const staff = useStore((s) => s.staff);
  const me = staffById(staff, useStore((s) => s.currentUserId));
  const messages = useStore((s) => s.messages);
  const notifications = useStore((s) => s.notifications);

  const unreadMsgs = messages.filter((m) => m.from === "client" && !m.read).length;
  const unreadNotif = notifications.filter((n) => n.status !== "開封").length;

  const badge = (to: string) =>
    to === "/chat" ? unreadMsgs : to === "/notifications" ? unreadNotif : 0;

  const Sidebar = (
    <nav className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-6">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-white/10 text-white ring-1 ring-white/15">
          <Scale size={18} />
        </div>
        <div className="leading-tight">
          <div className="font-serif text-[15px] font-semibold text-white">LegalFlow</div>
          <div className="text-[11px] text-brand-200">みなと総合法律事務所</div>
        </div>
      </div>
      <div className="flex-1 space-y-1 px-3">
        {NAV.map((n) => {
          const b = badge(n.to);
          return (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onClick={() => setDrawer(false)}
              className={({ isActive }) =>
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition " +
                (isActive
                  ? "bg-white/12 text-white"
                  : "text-brand-200 hover:bg-white/8 hover:text-white")
              }
            >
              <n.icon size={18} className="shrink-0" />
              <span className="flex-1">{n.label}</span>
              {b > 0 && (
                <span className="grid min-w-5 place-items-center rounded-full bg-gold-500 px-1.5 text-[11px] font-bold text-brand-950">
                  {b}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
      <div className="m-3 rounded-xl bg-white/8 p-3">
        <div className="flex items-center gap-2.5">
          {me && <Avatar name={me.name} color={me.color} size={34} />}
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-semibold text-white">
              {me?.name}
            </div>
            <div className="truncate text-[11px] text-brand-200">{me?.title}</div>
          </div>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="flex h-full bg-ink-100">
      {/* デスクトップサイドバー */}
      <aside className="hidden w-64 shrink-0 bg-brand-900 lg:block">{Sidebar}</aside>

      {/* モバイルドロワー */}
      <AnimatePresence>
        {drawer && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-ink-900/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              className="absolute top-0 left-0 h-full w-64 bg-brand-900"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
            >
              <button
                onClick={() => setDrawer(false)}
                className="absolute top-4 right-3 grid h-8 w-8 place-items-center rounded-lg text-brand-200 hover:bg-white/10"
                aria-label="閉じる"
              >
                <X size={18} />
              </button>
              {Sidebar}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* メイン */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-ink-200 bg-white/85 px-4 py-3 backdrop-blur-md sm:px-6">
          <button
            onClick={() => setDrawer(true)}
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-600 hover:bg-ink-100 lg:hidden"
            aria-label="メニュー"
          >
            <Menu size={20} />
          </button>
          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400"
            />
            <input
              placeholder="案件・顧問先を検索…"
              onFocus={() =>
                toast("このデモでは上部検索は省略しています", {
                  description: "各画面内の検索・絞り込みはすべて動作します。",
                })
              }
              className="w-full rounded-xl border border-ink-200 bg-ink-50 py-2 pr-3 pl-9 text-sm outline-none focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-400/20"
            />
          </div>
          <div className="flex-1 sm:hidden" />
          <NavLink
            to="/matters?new=1"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">新規案件</span>
          </NavLink>
          <NavLink
            to="/notifications"
            className="relative grid h-9 w-9 place-items-center rounded-lg text-ink-600 hover:bg-ink-100"
            aria-label="通知"
          >
            <Bell size={19} />
            {unreadNotif > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </NavLink>
        </header>

        <main className="thin-scroll flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={loc.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
