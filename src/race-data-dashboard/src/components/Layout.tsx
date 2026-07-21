import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "sonner";
import {
  LayoutDashboard,
  ScrollText,
  Settings as SettingsIcon,
  Menu,
  X,
  Trophy,
  RefreshCw,
  Power,
  Radio,
} from "lucide-react";
import { useStore } from "../store";
import { Modal, Button } from "./ui";

const NAV = [
  { to: "/", label: "ダッシュボード", icon: LayoutDashboard, end: true },
  { to: "/logs", label: "実行ログ", icon: ScrollText },
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

/**
 * 自動処理シミュレーション。
 * 一定間隔で「確定 → 結果取得 → 自動掲載」を進行させ、提案の肝(全自動運用)を体感させる。
 * ・確定・掲載待ちのレースがあれば自動公開
 * ・なければ発走前のレースを 1 本「確定」させる(以降のtickで公開される)
 */
function useAutoRunner() {
  const autoRun = useStore((s) => s.settings.autoRun);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!autoRun) return;
    let stopped = false;

    const tick = () => {
      if (stopped) return;
      const st = useStore.getState();
      const pending = st.races.find((r) => r.resultStatus === "確定");
      if (pending) {
        st.publishResult(pending.id);
        toast.success(`自動掲載 — ${pending.track} ${pending.no}R`, {
          description: "確定結果を取得し、レースページを自動更新しました。",
        });
        return;
      }
      const upcoming = st.races.find((r) => r.resultStatus === "発走前" && r.cardStatus === "公開済");
      if (upcoming) {
        st.confirmRace(upcoming.id);
        toast(`レース確定を検知 — ${upcoming.track} ${upcoming.no}R`, {
          description: "確定データの取得を開始しました。",
        });
      }
    };

    const schedule = () => {
      const ms = 14000 + Math.random() * 10000;
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
  }, [autoRun]);
}

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const autoRun = useStore((s) => s.settings.autoRun);

  useAutoRunner();

  return (
    <div className="flex min-h-screen bg-ink-100">
      {/* ---- Sidebar (desktop) ---- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-ink-200 bg-white lg:flex">
        <Brand />
        <NavItems onNavigate={() => {}} />
        <SidebarFooter onOpenSettings={() => setSettingsOpen(true)} />
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
            <SidebarFooter onOpenSettings={() => setSettingsOpen(true)} />
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
                  "live-dot inline-block h-2.5 w-2.5 rounded-full " + (autoRun ? "bg-emerald-500" : "bg-ink-300")
                }
              />
              <span className="text-sm font-medium text-ink-700">
                {autoRun ? "自動処理 稼働中" : "自動処理 停止中"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Clock />
            <button
              onClick={() => setSettingsOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl text-ink-600 transition hover:bg-ink-100"
              aria-label="設定"
            >
              <SettingsIcon size={19} />
            </button>
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

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
        <Trophy size={19} />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold text-ink-900">○○競馬ポータル</div>
        <div className="text-[11px] text-ink-400">データ取得・自動掲載</div>
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
            (isActive ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900")
          }
        >
          <n.icon size={18} />
          <span>{n.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarFooter({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <div className="border-t border-ink-100 p-3">
      <div className="rounded-xl bg-ink-50 px-3 py-2.5 text-[11px] leading-relaxed text-ink-500">
        データソース
        <div className="mt-1 flex items-center gap-1.5 font-medium text-ink-700">
          <Radio size={12} className="text-emerald-500" /> JRA-VAN
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 font-medium text-ink-700">
          <Radio size={12} className="text-emerald-500" /> 競馬最強の法則WEB
        </div>
      </div>
      <button
        onClick={onOpenSettings}
        className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-500 transition hover:bg-ink-100 hover:text-ink-800"
      >
        <SettingsIcon size={16} />
        システム設定
      </button>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={"relative h-6 w-11 shrink-0 rounded-full transition " + (on ? "bg-brand-500" : "bg-ink-300")}
    >
      <span
        className={"absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all " + (on ? "left-[22px]" : "left-0.5")}
      />
    </button>
  );
}

function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const settings = useStore((s) => s.settings);
  const setSetting = useStore((s) => s.setSetting);
  const reset = useStore((s) => s.reset);

  const rows: { key: keyof typeof settings; label: string; desc: string }[] = [
    { key: "morningSchedule", label: "朝一スケジュール自動取得", desc: "毎朝 5:30 に当日の番組表・出走表を取得し、ページを生成します。" },
    { key: "autoRun", label: "確定検知・自動処理", desc: "各レースの確定を検知して結果データを自動取得します。" },
    { key: "autoPublish", label: "取得後の自動公開", desc: "結果テーブルを生成後、対象ページを即時公開します。" },
  ];

  return (
    <Modal open={open} onClose={onClose} title="システム設定" width={520}>
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.key} className="flex items-start justify-between gap-4 rounded-xl px-1 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                {r.key !== "morningSchedule" && <Power size={14} className="text-ink-400" />}
                {r.label}
              </div>
              <div className="mt-0.5 text-xs leading-relaxed text-ink-500">{r.desc}</div>
            </div>
            <Toggle on={settings[r.key]} onChange={(v) => setSetting(r.key, v)} />
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-ink-200 bg-ink-50 p-4">
        <div className="text-sm font-semibold text-ink-800">デモデータのリセット</div>
        <p className="mt-1 text-xs leading-relaxed text-ink-500">
          レースの掲載状況・実行ログを初期状態に戻します。動作確認をやり直すときに使用します。
        </p>
        <Button
          variant="outline"
          className="mt-3"
          onClick={() => {
            reset();
            toast.success("デモデータを初期状態にリセットしました。");
            onClose();
          }}
        >
          <RefreshCw size={15} /> 初期状態に戻す
        </Button>
      </div>
    </Modal>
  );
}
