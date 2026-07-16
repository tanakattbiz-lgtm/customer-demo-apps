import { type ReactNode, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Menu,
  X,
  CalendarClock,
  LogOut,
  Smartphone,
  RotateCcw,
} from "lucide-react";
import { useStore, LEADER_ID, memberById } from "../store";
import { Avatar } from "./ui";

const NAV = [
  { to: "/", label: "ダッシュボード", icon: LayoutDashboard, end: true },
  { to: "/shift", label: "シフト表", icon: CalendarDays },
  { to: "/members", label: "スタッフ管理", icon: Users },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useStore((s) => s.logout);
  const reset = useStore((s) => s.reset);
  const period = useStore((s) => s.period);
  const members = useStore((s) => s.members);
  const leader = memberById(members, LEADER_ID) ?? members[0];

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
        <Footer me={leader?.name ?? "管理者"} role="バイトリーダー" onLogout={onLogout} onReset={onReset} />
      </aside>

      {/* ---- Drawer (mobile) ---- */}
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
            <NavItems onNavigate={() => setOpen(false)} />
            <Footer me={leader?.name ?? "管理者"} role="バイトリーダー" onLogout={onLogout} onReset={onReset} />
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
            <div>
              <div className="text-sm font-bold text-ink-900">{period.label}</div>
              <div className="text-[11px] text-ink-400">シフト管理</div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate("/staff")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-2.5 py-2 text-xs font-semibold text-ink-600 transition hover:bg-ink-50 sm:px-3"
            >
              <Smartphone size={15} />
              <span className="hidden sm:inline">スタッフ画面を見る</span>
              <span className="sm:hidden">スタッフ</span>
            </button>
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar name={leader?.name ?? "管"} color={leader?.color} size={34} />
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
        <CalendarClock size={19} />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold text-ink-900">○○ダイニング</div>
        <div className="text-[11px] text-ink-400">シフト管理システム</div>
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

function Footer({
  me,
  role,
  onLogout,
  onReset,
}: {
  me: string;
  role: string;
  onLogout: () => void;
  onReset: () => void;
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
