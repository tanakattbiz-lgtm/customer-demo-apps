import { type ReactNode, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  LayoutDashboard,
  ClipboardList,
  Menu,
  X,
  TrendingUp,
  LogOut,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  UserRound,
  Bell,
} from "lucide-react";
import { useStore, repOf } from "../store";
import { Avatar, Pill } from "./ui";

const NAV = [
  { to: "/", label: "ダッシュボード", icon: LayoutDashboard, end: true },
  { to: "/reports", label: "日報・売上", icon: ClipboardList },
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

/** 権限デモ用のユーザー切替。管理者/社員でシステムの見え方が変わることを体感させる。 */
function UserSwitcher() {
  const reps = useStore((s) => s.reps);
  const currentUserId = useStore((s) => s.currentUserId);
  const setCurrentUser = useStore((s) => s.setCurrentUser);
  const me = repOf(reps, currentUserId);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-2 py-1.5 transition hover:bg-ink-50"
      >
        <Avatar name={me?.name ?? "?"} color={me?.color} size={30} />
        <div className="hidden text-left leading-tight sm:block">
          <div className="text-xs font-semibold text-ink-800">{me?.name}</div>
          <div className="text-[10px] text-ink-400">{me?.role}</div>
        </div>
        <ChevronDown size={15} className="text-ink-400" />
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-xl">
          <div className="flex items-center gap-1.5 border-b border-ink-100 px-3.5 py-2.5 text-[11px] font-semibold text-ink-500">
            <ShieldCheck size={13} /> 権限デモ:ユーザーを切替
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {reps.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setCurrentUser(r.id);
                  setOpen(false);
                  toast.success(`${r.name}(${r.role})に切り替えました`);
                }}
                className={
                  "flex w-full items-center gap-2.5 px-3.5 py-2 text-left transition hover:bg-ink-50 " +
                  (r.id === currentUserId ? "bg-brand-50" : "")
                }
              >
                <Avatar name={r.name} color={r.color} size={30} />
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="truncate text-sm font-medium text-ink-800">{r.name}</div>
                  <div className="truncate text-[11px] text-ink-400">{r.team}</div>
                </div>
                <Pill tone={r.role === "管理者" ? "violet" : "gray"}>{r.role}</Pill>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useStore((s) => s.logout);
  const reset = useStore((s) => s.reset);
  const reps = useStore((s) => s.reps);
  const currentUserId = useStore((s) => s.currentUserId);
  const me = repOf(reps, currentUserId);

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
        <NavItems onNavigate={() => {}} />
        <SideFooter me={me?.name ?? "管理者"} role={me?.role ?? ""} onReset={onReset} onLogout={onLogout} />
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
            <NavItems onNavigate={() => setOpen(false)} />
            <SideFooter me={me?.name ?? "管理者"} role={me?.role ?? ""} onReset={onReset} onLogout={onLogout} />
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
            <div className="hidden items-center gap-1.5 text-sm font-medium text-ink-600 sm:flex">
              <UserRound size={16} className="text-brand-500" />
              {me?.role === "管理者" ? "全社ビュー(管理者権限)" : `${me?.name} の個人ビュー`}
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Clock />
            <button
              onClick={() => toast("このデモでは通知機能は省略しています(フェーズ2)")}
              className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-600 transition hover:bg-ink-100"
              aria-label="通知"
            >
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-500" />
            </button>
            <UserSwitcher />
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
        <TrendingUp size={19} />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold text-ink-900">SalesBoard</div>
        <div className="text-[11px] text-ink-400">営業管理システム</div>
      </div>
    </div>
  );
}

function NavItems({ onNavigate }: { onNavigate: () => void }) {
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
            (isActive
              ? "bg-brand-50 text-brand-700"
              : "text-ink-600 hover:bg-ink-100 hover:text-ink-900")
          }
        >
          <n.icon size={18} />
          <span>{n.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function SideFooter({
  me,
  role,
  onReset,
  onLogout,
}: {
  me: string;
  role: string;
  onReset: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="border-t border-ink-100 p-3">
      <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
        <Avatar name={me} size={34} />
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm font-semibold text-ink-800">{me}</div>
          <div className="truncate text-[11px] text-ink-400">{role}</div>
        </div>
      </div>
      <button
        onClick={onReset}
        className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-500 transition hover:bg-ink-100 hover:text-ink-800"
      >
        <RotateCcw size={16} />
        デモデータをリセット
      </button>
      <button
        onClick={onLogout}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-500 transition hover:bg-ink-100 hover:text-ink-800"
      >
        <LogOut size={16} />
        ログアウト
      </button>
    </div>
  );
}
