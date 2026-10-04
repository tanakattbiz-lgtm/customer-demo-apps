import { type ReactNode, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { toast } from "sonner";
import {
  BarChart3,
  CalendarClock,
  Handshake,
  Building2,
  LayoutGrid,
  FileSignature,
  ArrowRightLeft,
  Menu,
  X,
  RotateCcw,
  Home,
  BookOpen,
} from "lucide-react";
import { useStore } from "../store";
import { ME_ID, STAFF } from "../data/seed";
import { todayISO } from "../lib/format";
import { Avatar, Confirm } from "./ui";
import Tour, { useTour, useTourSeen } from "./Tour";

type NavItem = { to: string; label: string; desc: string; icon: typeof BarChart3; end?: boolean; badge?: number };

function useNav(): { group: string; items: NavItem[] }[] {
  const deals = useStore((s) => s.deals);
  const handovers = useStore((s) => s.handovers);
  return useMemo(() => {
    const today = todayISO();
    const due = deals.filter(
      (d) => d.repId === ME_ID && d.nextAction && d.nextAction.date <= today && d.stage !== "成約" && d.stage !== "失注",
    ).length;
    const pending = handovers.filter((h) => h.status !== "受領済").length;
    return [
      { group: "", items: [{ to: "/", label: "ホーム", desc: "やりたいことを選ぶ", icon: Home, end: true }] },
      {
        group: "営業",
        items: [
          { to: "/follow-ups", label: "やること一覧", desc: "お客様への次回対応", icon: CalendarClock, badge: due },
          { to: "/deals", label: "商談", desc: "進めている商談", icon: Handshake },
          { to: "/customers", label: "お客様", desc: "見込み客・広告主", icon: Building2 },
        ],
      },
      { group: "看板", items: [{ to: "/boards", label: "看板の空きを探す", desc: "空き状況・仮押さえ", icon: LayoutGrid }] },
      {
        group: "契約",
        items: [
          { to: "/contracts", label: "契約の一覧", desc: "広告契約・土地契約", icon: FileSignature },
          { to: "/handover", label: "管理部への書類提出", desc: "確認・差し戻しの状況", icon: ArrowRightLeft, badge: pending },
        ],
      },
      { group: "経営", items: [{ to: "/dashboard", label: "会社全体の数字", desc: "新規・解約・稼働率", icon: BarChart3 }] },
    ];
  }, [deals, handovers]);
}

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav = useNav();
  const startTour = useTour((s) => s.start);
  const seen = useTourSeen((s) => s.seen);
  const active = useTour((s) => s.active);
  // 初回アクセス時は、操作ガイドの案内を表示する
  useEffect(() => {
    if (!seen && !active) {
      const t = setTimeout(startTour, 900);
      return () => clearTimeout(t);
    }
  }, [seen, active, startTour]);
  const current = nav.flatMap((g) => g.items).find((i) => (i.end ? loc.pathname === i.to : loc.pathname.startsWith(i.to)));

  return (
    <div className="min-h-screen bg-ink-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[256px] flex-col bg-navy-900 text-white lg:flex">
        <SideContent nav={nav} onNavigate={() => {}} />
      </aside>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-navy-950/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-navy-900 text-white"
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <button
                aria-label="メニューを閉じる"
                className="absolute top-4 right-3 grid h-8 w-8 place-items-center rounded-md text-white/60 hover:bg-white/10 hover:text-white"
                onClick={() => setOpen(false)}
              >
                <X size={17} />
              </button>
              <SideContent nav={nav} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-col lg:ml-[256px]">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-ink-200 bg-white/92 px-4 backdrop-blur sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              data-tour="nav"
              aria-label="メニューを開く"
              className="grid h-9 w-9 place-items-center rounded-md text-navy-900 hover:bg-ink-100 lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu size={19} />
            </button>
            <div className="truncate text-[15px] text-ink-500">
              <span className="hidden sm:inline">営業・看板管理システム</span>
              {current && (
                <>
                  <span className="mx-2 hidden text-ink-300 sm:inline">/</span>
                  <span className="font-medium text-navy-900">{current.label}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="tnum hidden text-[13px] text-ink-500 md:block">
              {format(new Date(), "yyyy年M月d日(E)", { locale: ja })}
            </div>
            <button
              onClick={startTour}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-ink-300 bg-white px-3 text-[14px] font-medium text-navy-900 transition hover:border-navy-300 hover:bg-navy-50"
            >
              <BookOpen size={16} />
              操作ガイド
            </button>
          </div>
        </header>
        <main className="min-w-0 px-4 py-7 sm:px-8 lg:py-9">
          <motion.div
            key={loc.pathname}
            className="mx-auto w-full max-w-[1240px]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
      <Tour />
    </div>
  );
}

function SideContent({ nav, onNavigate }: { nav: ReturnType<typeof useNav>; onNavigate: () => void }) {
  const reset = useStore((s) => s.reset);
  const [confirm, setConfirm] = useState(false);
  const me = STAFF.find((s) => s.id === ME_ID)!;
  return (
    <>
      <div className="flex items-center gap-3 px-6 pt-6 pb-7">
        <Logo />
        <div className="leading-tight">
          <div className="font-serif text-[17px] font-semibold tracking-[0.12em]">○○広告社</div>
          <div className="mt-1 text-[11.5px] tracking-[0.08em] text-white/50">営業・看板管理システム</div>
        </div>
      </div>
      <nav data-tour="nav" className="thin-scroll flex-1 overflow-y-auto px-3">
        {nav.map((g) => (
          <div key={g.group || "home"} className="mb-4">
            {g.group && <div className="px-3 pb-1.5 text-[12px] tracking-[0.2em] text-white/40">{g.group}</div>}
            {g.items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                data-tour={"nav-" + (it.to.slice(1) || "home")}
                end={it.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  "group relative mb-1 flex min-h-12 items-center gap-3 rounded-md px-3 py-1.5 text-[15px] transition duration-200 " +
                  (isActive ? "bg-white/10 font-medium text-white" : "text-white/65 hover:bg-white/5 hover:text-white")
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute top-2 bottom-2 left-0 w-[2px] rounded-full bg-white" />}
                    <it.icon size={16} strokeWidth={1.7} />
                    <span className="flex-1 leading-tight">
                      <span className="block">{it.label}</span>
                      <span className={"mt-0.5 block text-[12px] " + (isActive ? "text-white/70" : "text-white/45")}>{it.desc}</span>
                    </span>
                    {!!it.badge && (
                      <span className="tnum min-w-5 rounded bg-white px-1.5 py-px text-center text-[12px] font-semibold text-navy-900">
                        {it.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={me.name} size={32} tone="light" />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[15px] font-medium">{me.name}</div>
            <div className="mt-0.5 truncate text-[12px] text-white/50">
              {me.branch} {me.dept}
            </div>
          </div>
        </div>
        <button
          onClick={() => setConfirm(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-white/45 transition hover:text-white"
        >
          <RotateCcw size={12} />
          デモデータを初期状態に戻す
        </button>
      </div>
      <Confirm
        open={confirm}
        title="デモデータを初期状態に戻しますか"
        message="このデモで追加・変更した内容はすべて消去され、初期のサンプルデータに戻ります。"
        confirmLabel="初期状態に戻す"
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          reset();
          setConfirm(false);
          toast.success("デモデータを初期状態に戻しました");
        }}
      />
    </>
  );
}

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
      <rect x="0.5" y="0.5" width="33" height="33" rx="5" fill="none" stroke="currentColor" strokeOpacity="0.35" />
      <rect x="7" y="8" width="20" height="12" rx="1" fill="currentColor" />
      <rect x="16" y="20" width="2" height="7" fill="currentColor" />
      <rect x="11" y="26.5" width="12" height="1.4" fill="currentColor" opacity="0.6" />
    </svg>
  );
}
