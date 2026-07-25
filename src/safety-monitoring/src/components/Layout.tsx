import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "sonner";
import {
  LayoutDashboard,
  HeartPulse,
  BellRing,
  ShieldCheck,
  Menu,
  X,
  FlaskConical,
  RotateCcw,
} from "lucide-react";
import { useStore } from "../store";
import { LIVE_EVENTS } from "../lib/domain";
import { Avatar, Button } from "./ui";
import Simulator from "./Simulator";
import { CURRENT_USER } from "../data/seed";

const NAV = [
  { to: "/", label: "ダッシュボード", icon: LayoutDashboard, end: true },
  { to: "/monitors", label: "見守り一覧", icon: HeartPulse },
  { to: "/alerts", label: "アラート履歴", icon: BellRing },
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
      <div className="tabular-nums text-sm font-semibold text-slate-800">{hh}</div>
      <div className="text-[11px] text-slate-400">{dd}</div>
    </div>
  );
}

/** ライブ監視シミュレーション:一定間隔でライブ値を更新し、
 *  設定が有効なら擬似イベントを自動発報して当直へ通知する。 */
function useLiveMonitor() {
  const live = useStore((s) => s.settings.liveMonitoring);
  const auto = useStore((s) => s.settings.autoAlert);
  const timer = useRef<number | null>(null);

  // ライブ値のドリフト(数秒ごと)
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => useStore.getState().tick(), 4000);
    return () => clearInterval(id);
  }, [live]);

  // 自動イベント発報(ランダム間隔)
  useEffect(() => {
    if (!live || !auto) return;
    let stopped = false;
    const schedule = () => {
      const ms = 26000 + Math.random() * 18000;
      timer.current = window.setTimeout(() => {
        if (stopped) return;
        const st = useStore.getState();
        const online = st.users.filter((u) => u.online);
        if (online.length) {
          const target = online[Math.floor(Math.random() * online.length)];
          const ev = LIVE_EVENTS[Math.floor(Math.random() * LIVE_EVENTS.length)];
          const alert = st.injectEvent(target.id, ev.kind);
          if (alert)
            toast.warning(`アラート検出 — ${target.name} 様`, { description: alert.message });
        }
        schedule();
      }, ms);
    };
    schedule();
    return () => {
      stopped = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [live, auto]);
}

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const alerts = useStore((s) => s.alerts);
  const live = useStore((s) => s.settings.liveMonitoring);
  const openSim = useStore((s) => s.openSim);
  const unread = useMemo(() => alerts.filter((a) => a.status === "未対応").length, [alerts]);

  useLiveMonitor();

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* ---- Sidebar (desktop) ---- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-200 bg-white lg:flex">
        <Brand />
        <NavItems onNavigate={() => {}} unread={unread} />
        <SideFooter />
      </aside>

      {/* ---- Drawer (mobile) ---- */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between">
              <Brand />
              <button
                className="mr-3 grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <NavItems onNavigate={() => setOpen(false)} unread={unread} />
            <SideFooter />
          </aside>
        </div>
      )}

      {/* ---- Main ---- */}
      <div className="flex min-w-0 flex-1 flex-col lg:ml-60">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/85 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="relative inline-flex h-2.5 w-2.5">
                {live && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-70 motion-safe:animate-ping" />
                )}
                <span className={"relative inline-flex h-2.5 w-2.5 rounded-full " + (live ? "bg-emerald-500" : "bg-slate-300")} />
              </span>
              <span className="text-sm font-medium text-slate-700">
                {live ? "ライブ監視中" : "監視 停止中"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Clock />
            <Button className="hidden !px-3 !py-2 sm:inline-flex" variant="outline" onClick={() => openSim()}>
              <FlaskConical size={16} />
              検証シミュレータ
            </Button>
            <NavLink
              to="/alerts"
              className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100"
            >
              <BellRing size={19} />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </NavLink>
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar name="当" color="#0f766e" size={34} />
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      {/* 検証用ダミーデータ入力(グローバル) */}
      <Simulator />

      {/* モバイル用の発報 FAB */}
      <button
        onClick={() => openSim()}
        className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-teal-600 text-white shadow-lg shadow-teal-600/30 transition hover:bg-teal-700 sm:hidden"
        aria-label="検証シミュレータ"
      >
        <FlaskConical size={22} />
      </button>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-teal-600 text-white">
        <ShieldCheck size={19} />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold text-slate-900">○○みまもりケア</div>
        <div className="text-[11px] text-slate-400">見守りモニタリング PoC</div>
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
            (isActive ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")
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

function SideFooter() {
  const reset = useStore((s) => s.reset);
  const onReset = () => {
    if (confirm("検証データを初期状態に戻します。よろしいですか?")) {
      reset();
      toast.success("初期データにリセットしました");
    }
  };
  return (
    <div className="border-t border-slate-100 p-3">
      <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
        <Avatar name="当" color="#0f766e" size={34} />
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm font-semibold text-slate-800">{CURRENT_USER.name}</div>
          <div className="truncate text-[11px] text-slate-400">{CURRENT_USER.role}</div>
        </div>
      </div>
      <button
        onClick={onReset}
        className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
      >
        <RotateCcw size={16} />
        検証データをリセット
      </button>
    </div>
  );
}
