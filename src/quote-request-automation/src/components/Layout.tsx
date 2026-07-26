import { type ReactNode, useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FileSpreadsheet, History, Settings as SettingsIcon, Menu, X, Mail, LogOut, Factory } from "lucide-react";
import { useStore } from "../store";
import { CURRENT_USER } from "../data/seed";

const NAV = [
  { to: "/", label: "見積依頼シート", icon: FileSpreadsheet, end: true },
  { to: "/history", label: "送信履歴", icon: History },
  { to: "/settings", label: "設定", icon: SettingsIcon },
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
  const history = useStore((s) => s.history);
  const todayCount = useMemo(() => {
    const d0 = new Date().toDateString();
    return history.filter((h) => new Date(h.at).toDateString() === d0).length;
  }, [history]);

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-ink-100">
      {/* ---- Sidebar (desktop) ---- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-ink-200 bg-white lg:flex">
        <Brand />
        <NavItems onNavigate={() => {}} todayCount={todayCount} />
        <Footer onLogout={onLogout} />
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
            <NavItems onNavigate={() => setOpen(false)} todayCount={todayCount} />
            <Footer onLogout={onLogout} />
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
            <div className="flex items-center gap-2">
              <span className="live-dot inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-ink-700">
                Outlook 連携: <span className="text-emerald-600">接続済み</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Clock />
            <div className="hidden items-center gap-2.5 sm:flex">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                {CURRENT_USER.initial}
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-ink-800">{CURRENT_USER.name}</div>
                <div className="text-[11px] text-ink-400">{CURRENT_USER.role}</div>
              </div>
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
        <Factory size={18} />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold text-ink-900">株式会社○○</div>
        <div className="text-[11px] text-ink-400">見積依頼 自動送信ツール</div>
      </div>
    </div>
  );
}

function NavItems({ onNavigate, todayCount }: { onNavigate: () => void; todayCount: number }) {
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
          {n.to === "/history" && todayCount > 0 && (
            <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-brand-100 px-1 text-[10px] font-bold text-brand-700">
              {todayCount}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function Footer({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="border-t border-ink-100 p-3">
      <div className="mb-1 flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2.5 text-xs text-ink-500">
        <Mail size={15} className="text-brand-500" />
        <span>メール送信は Outlook 経由</span>
      </div>
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
