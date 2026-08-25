import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  ClipboardList,
  Menu,
  Phone,
  RotateCcw,
  ShoppingCart,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../store";
import { BRANCHES } from "../data/seed";
import { Button } from "./ui";

const NAV = [
  { to: "/rental", label: "レンタル機械" },
  { to: "/ict", label: "ICT 建機" },
  { to: "/simulator", label: "見積シミュレーター" },
  { to: "/company", label: "会社案内" },
  { to: "/contact", label: "お問い合わせ" },
];

/* ---------- ロゴ(発注元名は伏字) ---------- */
function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="トップページへ">
      <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-ink-900 shadow-[var(--shadow-soft)]">
        <svg viewBox="0 0 32 32" className="h-6 w-6">
          <path d="M5 22 h22 a2 2 0 0 1 0 4 H5 a2 2 0 0 1 0-4 Z" fill="var(--color-sun-500)" />
          <path d="M8 20 L11 11 a2 2 0 0 1 2-1.5 h7 a2 2 0 0 1 2 1.6 L24 20 Z" fill="var(--color-sun-400)" />
          <path d="M20 12 L28 6" stroke="var(--color-sun-500)" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block text-[15px] font-black tracking-tight text-ink-900">
          ○○レンタル
        </span>
        {!compact && (
          <span className="block text-[9px] font-bold tracking-[0.22em] text-ink-400">
            MACHINERY RENTAL
          </span>
        )}
      </span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cartCount = useStore((s) => s.cart.length);
  const orderCount = useStore((s) => s.orders.filter((o) => o.status !== "キャンセル").length);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* 上部の細いお知らせバー */}
      <div className="bg-ink-900 px-4 py-1.5 text-center text-[11px] font-medium text-ink-100 sm:text-xs">
        <span className="text-sun-400 font-bold">お知らせ</span>
        <span className="mx-2 opacity-40">|</span>
        オンライン在庫照会をリニューアル。空き状況をその場で確認できます
      </div>

      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled ? "glass border-ink-200 shadow-[var(--shadow-soft)]" : "border-transparent bg-white"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `relative rounded-full px-3.5 py-2 text-[13px] font-bold transition-colors ${
                    isActive ? "text-ink-900" : "text-ink-500 hover:text-ink-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {n.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-sun-100"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <a
              href="tel:0859000000"
              onClick={(e) => {
                e.preventDefault();
                toast.info("このデモでは発信は行いません", {
                  description: "実際のサイトでは各営業所へ直接発信されます",
                });
              }}
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-bold text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 md:inline-flex"
            >
              <Phone size={15} />
              0859-00-0000
            </a>

            <Link
              to="/mypage"
              className="relative grid h-10 w-10 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
              aria-label="申込履歴"
            >
              <ClipboardList size={19} />
              {orderCount > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-sea-500 px-1 text-[10px] font-bold text-white">
                  {orderCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative grid h-10 w-10 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
              aria-label="見積カート"
            >
              <ShoppingCart size={19} />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-sun-600 px-1 text-[10px] font-black text-ink-900"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            <Link to="/rental" className="hidden sm:block">
              <Button size="sm" variant="secondary" className="ml-1">
                空き状況を見る
              </Button>
            </Link>

            <button
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full text-ink-700 transition-colors hover:bg-ink-100 lg:hidden"
              aria-label="メニューを開く"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* モバイルドロワー */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-ink-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 right-0 z-[61] flex w-[min(340px,86vw)] flex-col bg-white shadow-[var(--shadow-pop)] lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4">
                <Logo compact />
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-full text-ink-600 hover:bg-ink-100"
                  aria-label="メニューを閉じる"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <Link
                  to="/"
                  className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-bold text-ink-800 hover:bg-ink-50"
                >
                  ホーム <ArrowUpRight size={16} className="text-ink-300" />
                </Link>
                {NAV.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-bold text-ink-800 hover:bg-ink-50"
                  >
                    {n.label} <ArrowUpRight size={16} className="text-ink-300" />
                  </Link>
                ))}
                <div className="my-3 h-px bg-ink-200" />
                <Link
                  to="/mypage"
                  className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-bold text-ink-800 hover:bg-ink-50"
                >
                  申込履歴 <ArrowUpRight size={16} className="text-ink-300" />
                </Link>
                <Link
                  to="/cart"
                  className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-bold text-ink-800 hover:bg-ink-50"
                >
                  見積カート({cartCount}) <ArrowUpRight size={16} className="text-ink-300" />
                </Link>
              </nav>
              <div className="border-t border-ink-200 p-4">
                <Link to="/rental">
                  <Button variant="secondary" className="w-full" size="lg">
                    空き状況を見る
                  </Button>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function Footer() {
  const resetAll = useStore((s) => s.resetAll);

  return (
    <footer className="mt-24 border-t border-ink-200 bg-ink-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-ink-500">
              山陰 6 営業所から、建設機械と ICT 施工を届けるレンタル会社です。「借りて終わり」に
              しない伴走が私たちの仕事です。
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-ink-200 bg-white px-3 py-1 text-[11px] font-bold text-ink-500">
                ISO 9001
              </span>
              <span className="rounded-full border border-ink-200 bg-white px-3 py-1 text-[11px] font-bold text-ink-500">
                ISO 14001
              </span>
              <span className="rounded-full border border-ink-200 bg-white px-3 py-1 text-[11px] font-bold text-ink-500">
                健康経営優良法人
              </span>
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-black tracking-wider text-ink-900">サービス</p>
            <ul className="space-y-2.5 text-[13px] text-ink-500">
              <li><Link to="/rental" className="hover:text-ink-900">レンタル機械を探す</Link></li>
              <li><Link to="/ict" className="hover:text-ink-900">ICT 建機・施工支援</Link></li>
              <li><Link to="/simulator" className="hover:text-ink-900">見積シミュレーター</Link></li>
              <li><Link to="/mypage" className="hover:text-ink-900">申込履歴</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-black tracking-wider text-ink-900">会社案内</p>
            <ul className="space-y-2.5 text-[13px] text-ink-500">
              <li><Link to="/company" className="hover:text-ink-900">会社概要・沿革</Link></li>
              <li><Link to="/company#branches" className="hover:text-ink-900">営業所一覧</Link></li>
              <li><Link to="/company#recruit" className="hover:text-ink-900">採用情報</Link></li>
              <li><Link to="/contact" className="hover:text-ink-900">お問い合わせ</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-black tracking-wider text-ink-900">営業所</p>
            <ul className="space-y-2.5 text-[13px] text-ink-500">
              {BRANCHES.slice(0, 6).map((b) => (
                <li key={b.id} className="flex items-baseline justify-between gap-2">
                  <span>{b.name}</span>
                  <span className="tnum text-[11px] text-ink-400">{b.tel}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-ink-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] leading-relaxed text-ink-400">
            © ○○レンタル株式会社(デモ)— 本サイトは提案用のモックです。掲載の社名・料金・実績は
            すべて架空のサンプルデータです。
          </p>
          <button
            onClick={() => {
              resetAll();
              toast.success("デモデータを初期状態に戻しました");
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ink-300 bg-white px-3.5 py-2 text-[11px] font-bold text-ink-600 transition-colors hover:bg-ink-100"
          >
            <RotateCcw size={13} />
            デモデータをリセット
          </button>
        </div>
      </div>
    </footer>
  );
}
