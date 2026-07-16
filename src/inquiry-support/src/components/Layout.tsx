import { type ReactNode, useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Inbox as InboxIcon,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
  LogOut,
  Bell,
} from "lucide-react";
import { useStore } from "../store";
import { Avatar } from "./ui";

const NAV = [
  { to: "/", label: "受信箱", icon: InboxIcon, end: true },
  { to: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
];

function Clock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = t.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dd = t.toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
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
  const inquiries = useStore((s) => s.inquiries);
  const staff = useStore((s) => s.staff);
  const me = staff[0];
  const pending = useMemo(
    () => inquiries.filter((q) => q.status === "未対応").length,
    [inquiries],
  );

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-ink-100">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-ink-200 bg-white lg:flex">
        <Brand />
        <NavItems onNavigate={() => {}} pending={pending} />
        <Footer me={me?.name ?? "管理者"} role={me?.role ?? ""} color={me?.color} onLogout={onLogout} />
      </aside>

      {/* Drawer (mobile) */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
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
            <NavItems onNavigate={() => setOpen(false)} pending={pending} />
            <Footer me={me?.name ?? "管理者"} role={me?.role ?? ""} color={me?.color} onLogout={onLogout} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col lg:ml-60">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-ink-200 bg-white/85 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="grid h-9 w-9 place-items-center rounded-lg text-ink-600 hover:bg-ink-100 lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-brand-700">
              <Sparkles size={15} />
              <span className="text-xs font-semibold">AIアシスト有効</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Clock />
            <button
              onClick={() =>
                toast("このデモでは通知一覧は省略しています", { icon: "🔔" })
              }
              className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-600 transition hover:bg-ink-100"
            >
              <Bell size={19} />
              {pending > 0 && (
                <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {pending}
                </span>
              )}
            </button>
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar name={me?.name ?? "管"} color={me?.color} size={34} />
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
        <InboxIcon size={19} />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold text-ink-900">問い合わせデスク</div>
        <div className="text-[11px] text-ink-400">株式会社○○</div>
      </div>
    </div>
  );
}

function NavItems({
  onNavigate,
  pending,
}: {
  onNavigate: () => void;
  pending: number;
}) {
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
          {n.to === "/" && pending > 0 && (
            <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
              {pending}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function Footer({
  me,
  role,
  color,
  onLogout,
}: {
  me: string;
  role: string;
  color?: string;
  onLogout: () => void;
}) {
  return (
    <div className="border-t border-ink-100 p-3">
      <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
        <Avatar name={me} color={color} size={34} />
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm font-semibold text-ink-800">{me}</div>
          <div className="truncate text-[11px] text-ink-400">{role}</div>
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
