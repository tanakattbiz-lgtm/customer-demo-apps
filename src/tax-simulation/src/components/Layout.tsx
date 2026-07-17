import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Bell, Calculator, Menu, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../store/useStore";
import { useEffect } from "react";

const NAV = [
  { to: "/", label: "ホーム" },
  { to: "/simulators", label: "シミュレーション" },
  { to: "/experts", label: "専門家をさがす" },
  { to: "/mypage", label: "マイページ" },
];

export function Layout() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const resetAll = useStore((s) => s.resetAll);
  const requests = useStore((s) => s.requests);

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0 });
  }, [loc.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm shadow-primary-600/30">
              <Calculator size={18} />
            </span>
            <span className="leading-tight">
              <span className="block text-[15px] font-extrabold tracking-tight">
                税シミュ<span className="text-primary-600">navi</span>
              </span>
              <span className="font-en block text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Tax Simulation Portal
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors duration-150 ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-ink"
                  }`
                }
              >
                {n.label}
                {n.to === "/mypage" && requests.length > 0 && (
                  <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white">
                    {requests.length}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => toast("新しい通知はありません", { description: "このデモでは通知機能は省略しています" })}
              className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
              aria-label="通知"
            >
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
              aria-label="メニュー"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    isActive ? "bg-primary-50 text-primary-700" : "text-slate-600"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-navy text-slate-300">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="flex items-center gap-2 text-white">
                <Calculator size={16} />
                <span className="text-sm font-bold">税シミュnavi</span>
              </p>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-400">
                税金の概算シミュレーションとAIアドバイス、専門家への相談をワンストップで。
                運営: 株式会社○○(東京都品川区)
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
              {["利用規約", "プライバシーポリシー", "特定商取引法に基づく表記", "運営会社"].map((l) => (
                <button
                  key={l}
                  onClick={() => toast(`「${l}」ページ`, { description: "このデモでは省略しています" })}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  {l}
                </button>
              ))}
              <button
                onClick={() => {
                  resetAll();
                  toast.success("デモデータを初期状態に戻しました");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-1.5 text-slate-300 transition-colors hover:border-slate-400 hover:text-white"
              >
                <RotateCcw size={12} />
                デモをリセット
              </button>
            </div>
          </div>
          <p className="mt-8 border-t border-slate-700/60 pt-4 text-[11px] text-slate-500">
            © 2026 ○○ Inc. — 本サイトは提案用デモです。試算結果は概算であり、実際の税額を保証するものではありません。
          </p>
        </div>
      </footer>
    </div>
  );
}
