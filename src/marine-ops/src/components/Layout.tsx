import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Ship,
  BellRing,
  Users,
  Settings as SettingsIcon,
  Menu,
  X,
  Anchor,
  LogOut,
} from "lucide-react";
import { useStore, LIVE_KINDS } from "../store/useStore";
import { Avatar } from "./ui";
import { voyageStatus, needsAttention } from "../lib/voyage";

const NAV = [
  { to: "/", label: "ダッシュボード", icon: LayoutDashboard, end: true },
  { to: "/voyages", label: "配船案件", icon: Ship },
  { to: "/alerts", label: "アラート", icon: BellRing },
  { to: "/staff", label: "担当者", icon: Users },
  { to: "/settings", label: "設定", icon: SettingsIcon },
];

function Clock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = t.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dd = t.toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" });
  return (
    <div className="hidden text-right leading-tight sm:block">
      <div className="tnum text-sm font-semibold text-ink-800">{hh}</div>
      <div className="text-[11px] text-ink-400">{dd}</div>
    </div>
  );
}

/** ライブ監視シミュレーション:一定間隔で at-risk 案件のイベントを検出し、
 *  管理者へ通知(トースト + アラート)する。提案の肝を体感させる仕掛け。 */
function useLiveMonitor() {
  const settings = useStore((s) => s.settings);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!settings.liveMonitoring) return;
    let stopped = false;

    const tick = () => {
      if (stopped) return;
      const st = useStore.getState();
      const active = st.voyages.filter((v) => {
        const s = voyageStatus(v);
        return s !== "完了";
      });
      if (active.length === 0) return;
      // 既に注意が必要な案件を優先して拾う(なければ任意)
      const pool = active.filter((v) => needsAttention(v));
      const target = (pool.length ? pool : active)[Math.floor(Math.random() * (pool.length ? pool.length : active.length))];
      const ev = LIVE_KINDS[Math.floor(Math.random() * LIVE_KINDS.length)];
      const item = target.items.find((i) => i.status !== "完了");
      const label = item ? `「${item.label}」` : "";
      st.pushAlert({
        voyageId: target.id,
        voyageCode: target.code,
        kind: ev.kind,
        severity: ev.severity,
        message: `${label}${ev.tpl}`,
        assigneeId: target.assigneeId,
      });
      toast.warning(`アラート検出 — ${target.code}`, {
        description: `${label}${ev.tpl}`,
      });
    };

    // 最初は少し待ってから、以降ランダム間隔で
    const schedule = () => {
      const ms = 22000 + Math.random() * 16000;
      timer.current = window.setTimeout(() => {
        tick();
        schedule();
      }, ms);
    };
    schedule();

    return () => {
      stopped = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [settings.liveMonitoring]);
}

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useStore((s) => s.logout);
  const settings = useStore((s) => s.settings);
  const alerts = useStore((s) => s.alerts);
  const staff = useStore((s) => s.staff);
  const me = staff[0];
  const unread = useMemo(() => alerts.filter((a) => a.status === "未確認").length, [alerts]);

  useLiveMonitor();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-ink-100">
      {/* ---- Sidebar (desktop) ---- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-ink-200 bg-white lg:flex">
        <Brand />
        <NavItems onNavigate={() => {}} unread={unread} />
        <Footer me={me?.name ?? "管理者"} role={me?.role ?? ""} onLogout={onLogout} />
      </aside>

      {/* ---- Drawer (mobile) ---- */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between">
              <Brand />
              <button className="mr-3 grid h-9 w-9 place-items-center rounded-lg text-ink-500 hover:bg-ink-100" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <NavItems onNavigate={() => setOpen(false)} unread={unread} />
            <Footer me={me?.name ?? "管理者"} role={me?.role ?? ""} onLogout={onLogout} />
          </aside>
        </div>
      )}

      {/* ---- Main ---- */}
      <div className="flex min-w-0 flex-1 flex-col lg:ml-60">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-ink-200 bg-white/85 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button className="grid h-9 w-9 place-items-center rounded-lg text-ink-600 hover:bg-ink-100 lg:hidden" onClick={() => setOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className={"live-dot inline-block h-2.5 w-2.5 rounded-full " + (settings.liveMonitoring ? "bg-emerald-500" : "bg-ink-300")} />
              <span className="text-sm font-medium text-ink-700">
                {settings.liveMonitoring ? "ライブ監視中" : "監視 停止中"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Clock />
            <NavLink to="/alerts" className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-600 transition hover:bg-ink-100">
              <BellRing size={19} />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </NavLink>
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
        <Anchor size={19} />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold text-ink-900">○○汽船</div>
        <div className="text-[11px] text-ink-400">配船・運航モニタ</div>
      </div>
    </div>
  );
}

function NavItems({ onNavigate, unread }: { onNavigate: () => void; unread: number }) {
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
          {n.to === "/alerts" && unread > 0 && (
            <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function Footer({ me, role, onLogout }: { me: string; role: string; onLogout: () => void }) {
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
        onClick={onLogout}
        className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-500 transition hover:bg-ink-100 hover:text-ink-800"
      >
        <LogOut size={16} />
        ログアウト
      </button>
    </div>
  );
}
