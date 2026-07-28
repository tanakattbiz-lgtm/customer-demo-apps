import { type ReactNode, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ClipboardList,
  BarChart3,
  Menu,
  X,
  Gem,
  Bell,
  Settings as SettingsIcon,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useStore } from "../store";
import { Avatar, Button, Modal } from "./ui";

const NAV = [
  { to: "/", label: "査定依頼", icon: ClipboardList, end: true },
  { to: "/dashboard", label: "ダッシュボード", icon: BarChart3 },
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

/** LINE からの新規査定依頼が届くのを再現する。提案の肝(受付の自動化)を体感させる。 */
function useLiveIntake() {
  const liveIntake = useStore((s) => s.settings.liveIntake);
  const receive = useStore((s) => s.receive);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!liveIntake) return;
    let stopped = false;
    const schedule = () => {
      const ms = 26000 + Math.random() * 20000;
      timer.current = window.setTimeout(() => {
        if (stopped) return;
        const r = receive();
        toast.success("LINE から新規査定依頼", {
          description: `${r.lineName} 様 — ${r.brand} / ${r.itemName}`,
        });
        schedule();
      }, ms);
    };
    schedule();
    return () => {
      stopped = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [liveIntake, receive]);
}

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const staff = useStore((s) => s.staff);
  const requests = useStore((s) => s.requests);
  const me = staff[0];
  const pending = requests.filter((r) => r.status === "未対応").length;

  useLiveIntake();

  return (
    <div className="flex min-h-screen bg-ink-100">
      {/* ---- Sidebar (desktop) ---- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-ink-200 bg-white lg:flex">
        <Brand />
        <NavItems onNavigate={() => {}} pending={pending} />
        <SidebarFooter me={me?.name ?? "担当者"} role={me?.role ?? ""} onSettings={() => setSettingsOpen(true)} />
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
            <NavItems onNavigate={() => setOpen(false)} pending={pending} />
            <SidebarFooter
              me={me?.name ?? "担当者"}
              role={me?.role ?? ""}
              onSettings={() => {
                setOpen(false);
                setSettingsOpen(true);
              }}
            />
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
            <LiveBadge />
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Clock />
            <button
              onClick={() => navigate("/")}
              className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-600 transition hover:bg-ink-100"
              aria-label="未対応の依頼"
            >
              <Bell size={19} />
              {pending > 0 && (
                <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {pending}
                </span>
              )}
            </button>
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar name={me?.name ?? "担"} color={me?.color} size={34} />
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function LiveBadge() {
  const live = useStore((s) => s.settings.liveIntake);
  return (
    <div className="flex items-center gap-2">
      <span
        className={"live-dot inline-block h-2.5 w-2.5 rounded-full " + (live ? "bg-brand-500" : "bg-ink-300")}
      />
      <span className="text-sm font-medium text-ink-700">
        {live ? "LINE 受付 稼働中" : "受付 停止中"}
      </span>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
        <Gem size={18} />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold text-ink-900">○○買取</div>
        <div className="text-[11px] text-ink-400">LINE 査定 管理</div>
      </div>
    </div>
  );
}

function NavItems({ onNavigate, pending }: { onNavigate: () => void; pending: number }) {
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
          {n.end && pending > 0 && (
            <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {pending}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarFooter({
  me,
  role,
  onSettings,
}: {
  me: string;
  role: string;
  onSettings: () => void;
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
        onClick={onSettings}
        className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-500 transition hover:bg-ink-100 hover:text-ink-800"
      >
        <SettingsIcon size={16} />
        設定
      </button>
    </div>
  );
}

function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const settings = useStore((s) => s.settings);
  const setSetting = useStore((s) => s.setSetting);
  const reset = useStore((s) => s.reset);
  const receive = useStore((s) => s.receive);

  return (
    <Modal open={open} onClose={onClose} title="設定">
      <div className="space-y-5">
        <Toggle
          label="LINE 受付シミュレーション"
          desc="オンにすると、LINE から新規査定依頼が届く様子を再現します。"
          checked={settings.liveIntake}
          onChange={(v) => setSetting("liveIntake", v)}
        />
        <Toggle
          label="新規依頼を自動で自分に割当"
          desc="受付した依頼を、ログイン中の担当者へ自動でアサインします。"
          checked={settings.autoAssign}
          onChange={(v) => setSetting("autoAssign", v)}
        />

        <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-ink-800">
            <Sparkles size={15} className="text-brand-500" />
            デモ操作
          </div>
          <p className="mb-3 text-xs text-ink-500">
            動作確認用のツールです。新しい依頼を手動で受け付けたり、初期データに戻せます。
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const r = receive();
                toast.success("査定依頼を受け付けました", { description: `${r.brand} / ${r.itemName}` });
                onClose();
              }}
            >
              <Bell size={15} />
              新規依頼を受け付ける
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                reset();
                toast.success("初期データに戻しました");
                onClose();
              }}
            >
              <RotateCcw size={15} />
              初期データに戻す
            </Button>
          </div>
        </div>

        <p className="text-center text-[11px] text-ink-400">
          ※ これは提案用のデモです。実在の個人情報・ブランドは含まれていません。
        </p>
      </div>
    </Modal>
  );
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium text-ink-800">{label}</div>
        <div className="mt-0.5 text-xs text-ink-500">{desc}</div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition " +
          (checked ? "bg-brand-500" : "bg-ink-300")
        }
      >
        <span
          className={
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all " +
            (checked ? "left-[22px]" : "left-0.5")
          }
        />
      </button>
    </div>
  );
}
