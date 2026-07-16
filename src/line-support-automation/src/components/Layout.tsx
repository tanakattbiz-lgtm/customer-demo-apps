import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  Workflow,
  Menu,
  X,
  MessageCircleMore,
  Bell,
} from "lucide-react";
import { useStore } from "../store";
import { Avatar } from "./ui";
import { isStalled } from "../lib/pipeline";

const NAV = [
  { to: "/", label: "ダッシュボード", icon: LayoutDashboard, end: true },
  { to: "/members", label: "ユーザー進捗", icon: Users },
  { to: "/automation", label: "自動化設定", icon: Workflow },
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

/** 自動化シミュレーション:一定間隔で FAQ 自動返信・ステップ配信のイベントを発生させ、
 *  「システムが自律的に動いている」手応えを体感させる。 */
function useAutoSim() {
  const autoDelivery = useStore((s) => s.settings.autoDelivery);
  const autoFaqReply = useStore((s) => s.settings.autoFaqReply);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!autoDelivery && !autoFaqReply) return;
    let stopped = false;

    const tick = () => {
      if (stopped) return;
      const st = useStore.getState();
      const roll = Math.random();

      // FAQ 自動返信
      if (autoFaqReply && roll < 0.6) {
        const enabled = st.faqs.filter((f) => f.enabled);
        if (enabled.length === 0) return;
        const f = enabled[Math.floor(Math.random() * enabled.length)];
        st.updateFaq(f.id, { hits: f.hits + 1 });
        st.pushActivity({
          type: "faq",
          text: `FAQ自動返信:「${f.question}」に自動回答しました。`,
        });
        toast(`FAQ自動返信 — ${f.category}`, {
          description: f.question,
          icon: "💬",
        });
        return;
      }

      // ステップ自動配信
      if (autoDelivery) {
        const pool = st.members.filter((m) => m.stage !== "done" && m.stage !== "churn");
        if (pool.length === 0) return;
        const m = pool[Math.floor(Math.random() * pool.length)];
        const r = st.sendNextStep(m.id);
        if (r.ok) {
          if (r.advanced) {
            toast.success(`${m.name} さんが ${r.stageLabel} へ進みました`, {
              description: "ステップ配信が完了し、次のステージへ自動移行しました。",
            });
          } else {
            toast(`自動配信 — ${m.name} さん`, {
              description: r.stepTitle,
              icon: "📨",
            });
          }
        }
      }
    };

    const schedule = () => {
      const ms = 26000 + Math.random() * 18000;
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
  }, [autoDelivery, autoFaqReply]);
}

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const settings = useStore((s) => s.settings);
  const members = useStore((s) => s.members);
  const staff = useStore((s) => s.staff);
  const me = staff[0];

  const stalledCount = useMemo(() => members.filter((m) => isStalled(m)).length, [members]);
  const live = settings.autoDelivery || settings.autoFaqReply;

  useAutoSim();

  return (
    <div className="flex min-h-screen bg-ink-100">
      {/* ---- Sidebar (desktop) ---- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-ink-200 bg-white lg:flex">
        <Brand />
        <NavItems onNavigate={() => {}} stalled={stalledCount} />
        <FooterUser name={me?.name ?? "運用管理者"} role={me?.role ?? ""} color={me?.color} />
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
            <NavItems onNavigate={() => setOpen(false)} stalled={stalledCount} />
            <FooterUser name={me?.name ?? "運用管理者"} role={me?.role ?? ""} color={me?.color} />
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
                  (live ? "bg-emerald-500" : "bg-ink-300")
                }
              />
              <span className="text-sm font-medium text-ink-700">
                {live ? "自動化 稼働中" : "自動化 停止中"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Clock />
            <NavLink
              to="/members"
              className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-600 transition hover:bg-ink-100"
              title="要フォローのユーザー"
            >
              <Bell size={19} />
              {stalledCount > 0 && (
                <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                  {stalledCount}
                </span>
              )}
            </NavLink>
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar name={me?.name ?? "運"} color={me?.color} size={34} />
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
        <MessageCircleMore size={19} />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold text-ink-900">○○サポート運用</div>
        <div className="text-[11px] text-ink-400">LINE自動化コンソール</div>
      </div>
    </div>
  );
}

function NavItems({ onNavigate, stalled }: { onNavigate: () => void; stalled: number }) {
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
          {n.to === "/members" && stalled > 0 && (
            <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
              {stalled}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function FooterUser({ name, role, color }: { name: string; role: string; color?: string }) {
  return (
    <div className="border-t border-ink-100 p-3">
      <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
        <Avatar name={name} color={color} size={34} />
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm font-semibold text-ink-800">{name}</div>
          <div className="truncate text-[11px] text-ink-400">{role}</div>
        </div>
      </div>
    </div>
  );
}
