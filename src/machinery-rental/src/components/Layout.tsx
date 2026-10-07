import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, ChevronDown, Menu, Phone, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { BRANCHES, RENTAL_CATEGORIES } from "../data/seed";
import { useStore } from "../store";

const NAV: { to: string; label: string; en: string; children?: { to: string; label: string }[] }[] =
  [
    {
      to: "/rental",
      label: "レンタル",
      en: "Rental",
      children: RENTAL_CATEGORIES.map((c) => ({
        to: `/rental?cat=${c.id}`,
        label: c.label,
      })),
    },
    { to: "/ictmachine", label: "ICT 建機", en: "ICT" },
    { to: "/catalog", label: "オンラインカタログ", en: "Catalog" },
    { to: "/overview", label: "会社概要", en: "Company" },
    { to: "/news", label: "お知らせ", en: "News" },
    { to: "/recruit", label: "採用情報", en: "Recruit" },
  ];

/* ---------- ロゴ(発注元名は伏字) ---------- */
function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const light = tone === "light";
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="トップページへ">
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden="true">
        <rect
          x="0.75"
          y="0.75"
          width="38.5"
          height="38.5"
          fill="none"
          stroke={light ? "rgba(255,255,255,0.5)" : "var(--color-ink-300)"}
          strokeWidth="1"
        />
        <path
          d="M9 27 L15 15 L25 15 L31 27 Z"
          fill="none"
          stroke={light ? "#fff" : "var(--color-navy-800)"}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M25 15 L33 8"
          stroke="var(--color-amber-500)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M9 31 L31 31"
          stroke={light ? "rgba(255,255,255,0.45)" : "var(--color-ink-300)"}
          strokeWidth="1"
        />
      </svg>
      <span className="leading-none">
        <span
          className={`serif block text-[16px] tracking-[0.06em] ${light ? "text-white" : "text-ink-900"}`}
        >
          ○○レンタル
        </span>
        <span
          className={`label-en mt-1.5 block ${light ? "text-white/45" : "text-ink-400"}`}
          style={{ fontSize: "8.5px", letterSpacing: "0.28em" }}
        >
          Machinery Rental
        </span>
      </span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [spRentalOpen, setSpRentalOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
    setDropdown(null);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
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
      {/* ユーティリティバー */}
      <div className="hidden border-b border-ink-200 bg-ink-25 lg:block">
        <div className="mx-auto flex h-9 max-w-[1200px] items-center justify-end gap-6 px-6 sm:px-8 lg:px-12">
          <span className="text-[11px] text-ink-500">
            受付 8:00 - 17:30(土日祝休)／ 故障・トラブルは 24 時間受付
          </span>
          <Link
            to="/terms"
            className="text-[11px] text-ink-500 transition-colors hover:text-navy-700"
          >
            レンタル基本約款
          </Link>
          <Link
            to="/contact"
            className="text-[11px] text-ink-500 transition-colors hover:text-navy-700"
          >
            お問い合わせ
          </Link>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md transition-colors duration-300 ${
          scrolled ? "border-ink-200" : "border-ink-100"
        }`}
        onMouseLeave={() => setDropdown(null)}
      >
        <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between gap-6 px-6 sm:px-8 lg:h-[76px] lg:px-12">
          <Logo />

          <nav className="hidden h-full items-stretch gap-0.5 lg:flex">
            {NAV.map((n) => (
              <div
                key={n.to}
                className="relative flex items-stretch"
                onMouseEnter={() => setDropdown(n.children ? n.to : null)}
              >
                <NavLink
                  to={n.to}
                  className={({ isActive }) =>
                    `relative flex items-center gap-1 whitespace-nowrap px-3.5 text-[12.5px] tracking-wide transition-colors xl:px-4 xl:text-[13px] ${
                      isActive ? "text-navy-800" : "text-ink-600 hover:text-navy-800"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {n.label}
                      {n.children && <ChevronDown size={12} className="text-ink-400" />}
                      <span
                        className={`absolute inset-x-3 bottom-0 h-px origin-left bg-amber-500 transition-transform duration-300 ${
                          isActive ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </>
                  )}
                </NavLink>

                {/* ドロップダウン */}
                <AnimatePresence>
                  {n.children && dropdown === n.to && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 top-full w-60 border border-ink-200 border-t-0 bg-white shadow-[0_18px_40px_-24px_rgba(20,30,50,0.28)]"
                    >
                      {n.children.map((c) => (
                        <Link
                          key={c.to}
                          to={c.to}
                          className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5 text-[12.5px] text-ink-600 transition-colors last:border-b-0 hover:bg-ink-25 hover:text-navy-800"
                        >
                          {c.label}
                          <ArrowUpRight size={13} className="text-ink-300" />
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="tel:0859000000"
              onClick={(e) => {
                e.preventDefault();
                toast.info("このデモでは発信を行いません", {
                  description: "実際のサイトでは本社・米子営業所へ発信されます",
                });
              }}
              className="hidden items-center gap-2 whitespace-nowrap text-ink-700 transition-colors hover:text-navy-700 xl:flex"
            >
              <Phone size={14} className="text-amber-600" />
              <span className="tnum text-[15px] tracking-wide">0859-00-0000</span>
            </a>

            <Link
              to="/contact"
              className="hidden h-[68px] items-center whitespace-nowrap bg-navy-800 px-6 text-[12.5px] tracking-wide text-white transition-colors hover:bg-navy-700 lg:flex lg:h-[76px] xl:px-7 xl:text-[13px]"
            >
              お問い合わせ
            </Link>

            <button
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center text-ink-700 transition-colors hover:text-navy-700 lg:hidden"
              aria-label="メニューを開く"
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* モバイルメニュー */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-navy-900/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 right-0 z-[61] flex w-[min(360px,88vw)] flex-col bg-white lg:hidden"
            >
              <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-ink-200 px-6">
                <Logo />
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-10 w-10 place-items-center text-ink-500"
                  aria-label="メニューを閉じる"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto">
                <Link
                  to="/"
                  className="flex items-baseline gap-3 border-b border-ink-100 px-6 py-4 text-[14px] text-ink-800"
                >
                  <span className="label-en w-16 shrink-0 text-ink-300">Top</span>
                  ホーム
                </Link>

                {/* レンタルは子項目を展開 */}
                <button
                  onClick={() => setSpRentalOpen((v) => !v)}
                  className="flex w-full items-center gap-3 border-b border-ink-100 px-6 py-4 text-left text-[14px] text-ink-800"
                >
                  <span className="label-en w-16 shrink-0 text-ink-300">Rental</span>
                  レンタル
                  <ChevronDown
                    size={14}
                    className={`ml-auto text-ink-400 transition-transform ${spRentalOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {spRentalOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden bg-ink-25"
                    >
                      <Link
                        to="/rental"
                        className="block border-b border-ink-100 px-6 py-3.5 pl-[88px] text-[13px] text-ink-600"
                      >
                        すべての機械
                      </Link>
                      {RENTAL_CATEGORIES.map((c) => (
                        <Link
                          key={c.id}
                          to={`/rental?cat=${c.id}`}
                          className="block border-b border-ink-100 px-6 py-3.5 pl-[88px] text-[13px] text-ink-600"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {NAV.filter((n) => !n.children).map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    className="flex items-baseline gap-3 border-b border-ink-100 px-6 py-4 text-[14px] text-ink-800"
                  >
                    <span className="label-en w-16 shrink-0 text-ink-300">{n.en}</span>
                    {n.label}
                  </Link>
                ))}
                <Link
                  to="/terms"
                  className="flex items-baseline gap-3 border-b border-ink-100 px-6 py-4 text-[14px] text-ink-800"
                >
                  <span className="label-en w-16 shrink-0 text-ink-300">Terms</span>
                  レンタル基本約款
                </Link>
              </nav>

              <div className="shrink-0 border-t border-ink-200 p-6">
                <Link
                  to="/contact"
                  className="flex h-12 items-center justify-center bg-navy-800 text-[13px] tracking-wide text-white"
                >
                  お問い合わせ
                </Link>
                <p className="mt-4 text-center text-[11px] text-ink-500">
                  受付 8:00 - 17:30(土日祝休)
                </p>
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
    <footer className="mt-auto bg-navy-900 text-white">
      <div className="mx-auto max-w-[1200px] px-6 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-7 max-w-xs text-[12.5px] leading-[2] text-white/55">
              山陰両県 8 営業所。建設機械のレンタルと ICT 施工支援を通じて、
              地域の現場を支えています。
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {["ISO 9001", "ISO 14001", "健康経営優良法人"].map((t) => (
                <span
                  key={t}
                  className="border border-white/15 px-2.5 py-1 text-[10px] tracking-wide text-white/50"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <p className="label-en text-amber-400">Rental</p>
              <ul className="mt-5 space-y-3 text-[12.5px] text-white/65">
                {RENTAL_CATEGORIES.map((c) => (
                  <li key={c.id}>
                    <Link to={`/rental?cat=${c.id}`} className="underline-grow hover:text-white">
                      {c.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/ictmachine" className="underline-grow hover:text-white">
                    ICT 建機
                  </Link>
                </li>
                <li>
                  <Link to="/catalog" className="underline-grow hover:text-white">
                    オンラインカタログ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="label-en text-amber-400">Company</p>
              <ul className="mt-5 space-y-3 text-[12.5px] text-white/65">
                <li>
                  <Link to="/overview" className="underline-grow hover:text-white">
                    会社概要
                  </Link>
                </li>
                <li>
                  <Link to="/overview#philosophy" className="underline-grow hover:text-white">
                    経営理念
                  </Link>
                </li>
                <li>
                  <Link to="/overview#history" className="underline-grow hover:text-white">
                    沿革
                  </Link>
                </li>
                <li>
                  <Link to="/overview#branches" className="underline-grow hover:text-white">
                    営業所一覧
                  </Link>
                </li>
                <li>
                  <Link to="/news" className="underline-grow hover:text-white">
                    お知らせ
                  </Link>
                </li>
                <li>
                  <Link to="/recruit" className="underline-grow hover:text-white">
                    採用情報
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="label-en text-amber-400">Contact</p>
              <ul className="mt-5 space-y-3 text-[12.5px] text-white/65">
                <li>
                  <Link to="/contact" className="underline-grow hover:text-white">
                    お問い合わせ
                  </Link>
                </li>
                <li>
                  <Link to="/overview#faq" className="underline-grow hover:text-white">
                    よくあるご質問
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="underline-grow hover:text-white">
                    レンタル基本約款
                  </Link>
                </li>
              </ul>
              <p className="mt-7 label-en text-amber-400">Head office</p>
              <p className="tnum mt-4 text-[17px] tracking-wide text-white">0859-00-0000</p>
              <p className="mt-1.5 text-[11px] text-white/45">
                受付 8:00 - 17:30(土日祝休)
              </p>
            </div>
          </div>
        </div>

        {/* 営業所一覧 */}
        <div className="mt-14 border-t border-white/10 pt-10">
          <p className="label-en mb-5 text-white/40">Network</p>
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
            {BRANCHES.map((b) => (
              <div
                key={b.id}
                className="flex items-baseline justify-between gap-3 border-b border-white/[0.07] pb-2.5"
              >
                <span className="text-[12px] text-white/70">{b.name}</span>
                <span className="tnum text-[11px] text-white/40">{b.tel}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10.5px] leading-[1.9] text-white/35">
            © ○○レンタル株式会社(デモ)　本サイトは提案用のモックです。掲載の社名・所在地・
            電話番号・実績はすべて架空のサンプルです。
          </p>
          <button
            onClick={() => {
              resetAll();
              toast.success("デモデータを初期状態に戻しました");
            }}
            className="inline-flex shrink-0 items-center gap-2 border border-white/15 px-3.5 py-2 text-[10.5px] text-white/50 transition-colors hover:border-white/35 hover:text-white/80"
          >
            <RotateCcw size={12} />
            デモデータをリセット
          </button>
        </div>
      </div>
    </footer>
  );
}
