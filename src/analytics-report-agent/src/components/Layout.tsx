import { type ReactNode, useState } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Sparkles,
  Settings as SettingsIcon,
  Menu,
  X,
  BarChart3,
  Bell,
  RefreshCw,
} from "lucide-react";
import { useStore } from "../store";
import { WEEKDAYS } from "../data/seed";

const NAV = [
  { to: "/", label: "ダッシュボード", icon: LayoutDashboard, end: true },
  { to: "/report", label: "レポート＆改善提案", icon: Sparkles },
  { to: "/settings", label: "設定", icon: SettingsIcon },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const settings = useStore((s) => s.settings);

  const schedule =
    settings.freq === "weekly"
      ? `毎週${WEEKDAYS[settings.weekday]}曜 ${settings.hour}:00`
      : `毎月1日 ${settings.hour}:00`;

  return (
    <div className="flex min-h-screen bg-ink-100">
      {/* ---- Sidebar (desktop) ---- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-ink-200 bg-white lg:flex">
        <Brand />
        <NavItems onNavigate={() => {}} />
        <AgentStatus schedule={schedule} enabled={settings.autoSend} />
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
            <AgentStatus schedule={schedule} enabled={settings.autoSend} />
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
              <span
                className={
                  "live-dot inline-block h-2.5 w-2.5 rounded-full " +
                  (settings.autoSend ? "bg-emerald-500" : "bg-ink-300")
                }
              />
              <span className="hidden text-sm font-medium text-ink-700 sm:inline">
                {settings.autoSend ? `次回通知 ${schedule}` : "自動通知 停止中"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.info("最新のGA4データを取得しました", { description: "このデモではサンプルデータを表示しています。" })}
              className="hidden items-center gap-2 rounded-xl border border-ink-200 px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-50 sm:flex"
            >
              <RefreshCw size={15} />
              データ更新
            </button>
            <button
              onClick={() => toast("通知はありません", { description: "新しいアラートが発生するとここに表示されます。" })}
              className="grid h-10 w-10 place-items-center rounded-xl text-ink-600 transition hover:bg-ink-100"
              aria-label="通知"
            >
              <Bell size={19} />
            </button>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              解
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
        <BarChart3 size={19} />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold text-ink-900">Insight Agent</div>
        <div className="text-[11px] text-ink-400">GA4 解析＆改善提案</div>
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

function AgentStatus({ schedule, enabled }: { schedule: string; enabled: boolean }) {
  return (
    <div className="border-t border-ink-100 p-3">
      <div className="rounded-xl bg-ink-50 px-3 py-3">
        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-ink-500">
          <Sparkles size={12} className="text-brand-500" />
          自動レポート
        </div>
        <div className="text-sm font-semibold text-ink-800">
          {enabled ? schedule : "停止中"}
        </div>
        <div className="mt-0.5 text-[11px] text-ink-400">Google Chat へ自動送信</div>
      </div>
    </div>
  );
}
