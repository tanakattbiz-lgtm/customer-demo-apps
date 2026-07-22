import { type ReactNode, useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  Coffee,
  Menu,
  X,
  Heart,
  LogOut,
  QrCode,
  RotateCcw,
  Bell,
} from "lucide-react";
import { useStore } from "../store";
import { CURRENT_ADMIN, STORE_NAME, STORE_BRANCH } from "../data/seed";
import { todayTips } from "../lib/calc";
import { Avatar } from "./ui";

const NAV = [
  { to: "/", label: "ダッシュボード", icon: LayoutDashboard, end: true },
  { to: "/staff", label: "スタッフ管理", icon: Users },
];

function Clock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = t.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  const dd = t.toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" });
  return (
    <div className="hidden text-right leading-tight sm:block">
      <div className="tnum text-sm font-semibold text-ink-800">{hh}</div>
      <div className="text-[11px] text-ink-400">{dd}</div>
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useStore((s) => s.logout);
  const reset = useStore((s) => s.reset);
  const tips = useStore((s) => s.tips);
  const todays = useMemo(() => todayTips(tips).length, [tips]);

  const onLogout = () => {
    logout();
    navigate("/login");
  };
  const onReset = () => {
    reset();
    toast.success("デモデータを初期状態に戻しました");
  };

  return (
    <div className="flex min-h-screen bg-ink-100">
      {/* ---- Sidebar (desktop) ---- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-ink-200 bg-white lg:flex">
        <Brand />
        <NavItems onNavigate={() => {}} todays={todays} />
        <Footer onLogout={onLogout} onReset={onReset} />
      </aside>

      {/* ---- Drawer (mobile) ---- */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between">
              <Brand />
              <button
                className="mr-3 grid h-9 w-9 place-items-center rounded-lg text-ink-500 hover:bg-ink-100"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <NavItems onNavigate={() => setOpen(false)} todays={todays} />
            <Footer onLogout={onLogout} onReset={onReset} />
          </aside>
        </div>
      )}

      {/* ---- Main ---- */}
      <div className="flex min-w-0 flex-1 flex-col lg:ml-60">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-ink-200 bg-white/85 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="grid h-9 w-9 place-items-center rounded-lg text-ink-600 hover:bg-ink-100 lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="leading-tight">
              <div className="text-sm font-bold text-ink-900">
                {STORE_NAME} <span className="text-ink-400">{STORE_BRANCH}</span>
              </div>
              <div className="text-[11px] text-ink-400">チップ管理コンソール</div>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Clock />
            <Link
              to="/tip"
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
            >
              <QrCode size={15} />
              <span className="hidden sm:inline">チップ画面</span>
            </Link>
            <button
              onClick={() => toast("新着の通知はありません", { icon: "🔔" })}
              className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-600 transition hover:bg-ink-100"
              aria-label="通知"
            >
              <Bell size={19} />
              {todays > 0 && (
                <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-heart-500 px-1 text-[10px] font-bold text-white">
                  {todays}
                </span>
              )}
            </button>
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar name="店" color="oklch(61% 0.17 35)" size={34} />
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
        <Coffee size={19} />
      </div>
      <div className="leading-tight">
        <div className="flex items-center gap-1 text-sm font-bold text-ink-900">
          Tip<span className="text-brand-600">Jar</span>
          <Heart size={12} className="fill-heart-500 text-heart-500" />
        </div>
        <div className="text-[11px] text-ink-400">店舗チップ管理</div>
      </div>
    </div>
  );
}

function NavItems({ onNavigate, todays }: { onNavigate: () => void; todays: number }) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-2">
      {NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition " +
            (isActive ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900")
          }
        >
          <n.icon size={18} />
          <span>{n.label}</span>
          {n.to === "/" && todays > 0 && (
            <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-brand-100 px-1 text-[10px] font-bold text-brand-700">
              {todays}
            </span>
          )}
        </NavLink>
      ))}
      <NavLink
        to="/tip"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
      >
        <QrCode size={18} />
        <span>チップ受付画面</span>
        <span className="ml-auto text-[10px] text-ink-400">お客様用</span>
      </NavLink>
    </nav>
  );
}

function Footer({ onLogout, onReset }: { onLogout: () => void; onReset: () => void }) {
  return (
    <div className="border-t border-ink-100 p-3">
      <button
        onClick={onReset}
        className="mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-500 transition hover:bg-ink-100 hover:text-ink-800"
      >
        <RotateCcw size={16} />
        デモデータをリセット
      </button>
      <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
        <Avatar name="高" color="oklch(52% 0.15 34)" size={34} />
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm font-semibold text-ink-800">{CURRENT_ADMIN.name}</div>
          <div className="truncate text-[11px] text-ink-400">{CURRENT_ADMIN.role}</div>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-500 transition hover:bg-ink-100 hover:text-ink-800"
      >
        <LogOut size={16} />
        ログアウト
      </button>
    </div>
  );
}
