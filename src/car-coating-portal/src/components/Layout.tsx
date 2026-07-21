import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, Bookmark, Store, Search, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../store";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
        <Sparkles size={18} fill="currentColor" strokeWidth={0} />
      </span>
      <span className="leading-none">
        <span className="block text-[15px] font-extrabold tracking-tight text-ink-900">
          COATING<span className="text-brand-600">NAVI</span>
        </span>
        <span className="block text-[10px] font-medium text-ink-400">カーコーティング店 検索ポータル</span>
      </span>
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const bookmarks = useStore((s) => s.bookmarks);
  const reset = useStore((s) => s.reset);

  const nav = [
    { to: "/", label: "店舗をさがす", icon: Search, badge: 0, saved: false },
    { to: "/?saved=1", label: "保存した店", icon: Bookmark, badge: bookmarks.length, saved: true },
    { to: "/apply", label: "掲載をご検討の店舗様", icon: Store, badge: 0, saved: false },
  ];

  return (
    <div className="flex min-h-full flex-col bg-ink-100">
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-1">
            {nav.map((n) => {
              const savedView = pathname === "/" && location.search.includes("saved=1");
              const active = n.saved
                ? savedView
                : n.to === "/"
                  ? pathname === "/" && !savedView
                  : pathname.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={
                    "relative flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition sm:px-3 " +
                    (active ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-100")
                  }
                >
                  <Icon size={17} />
                  <span className="hidden sm:inline">{n.label}</span>
                  {!!n.badge && (
                    <span className="tnum grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                      {n.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>

      <footer className="border-t border-ink-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <span className="font-semibold text-ink-500">COATINGNAVI</span>（サービス名は仮）
            ／ 運営：株式会社○○
            <span className="ml-2 text-ink-300">※ 提案用デモ・データはすべてダミーです</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/apply")}
              className="text-ink-500 transition hover:text-brand-600"
            >
              掲載についてのご案内
            </button>
            <button
              onClick={() => {
                if (confirm("入力・保存したデモデータを初期状態に戻します。よろしいですか？")) {
                  reset();
                  toast.success("デモデータを初期状態に戻しました");
                  navigate("/");
                }
              }}
              className="inline-flex items-center gap-1 text-ink-500 transition hover:text-rose-600"
            >
              <RotateCcw size={13} /> デモをリセット
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
