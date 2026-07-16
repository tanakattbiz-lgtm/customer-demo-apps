import { type ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, User as UserIcon, Search, Bell, LogOut, RotateCcw, Users } from "lucide-react";
import { toast } from "sonner";
import { useStore, useCurrentUser } from "../store";
import { Avatar } from "./ui";

function NavItem({
  to,
  icon,
  label,
  active,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-100"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const me = useCurrentUser();
  const logout = useStore((s) => s.logout);
  const reset = useStore((s) => s.reset);
  const [menuOpen, setMenuOpen] = useState(false);

  const notImplemented = () => toast("このデモでは省略しています", { icon: "🛠️" });

  return (
    <div className="min-h-full">
      {/* ヘッダー */}
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
              <Users size={17} strokeWidth={2.4} />
            </div>
            <span className="text-lg font-bold tracking-tight text-ink-900">
              wag+
            </span>
          </Link>

          {/* 検索(ガワ) */}
          <button
            onClick={notImplemented}
            className="ml-2 hidden flex-1 items-center gap-2 rounded-full bg-ink-100 px-4 py-2 text-sm text-ink-400 transition-colors hover:bg-ink-200 md:flex"
          >
            <Search size={16} />
            仲間・投稿を検索
          </button>

          <nav className="ml-auto flex items-center gap-1">
            <NavItem
              to="/"
              icon={<Home size={18} />}
              label="ホーム"
              active={pathname === "/"}
            />
            <NavItem
              to={`/u/${me.id}`}
              icon={<UserIcon size={18} />}
              label="マイページ"
              active={pathname.startsWith("/u/")}
            />
            <button
              onClick={notImplemented}
              className="relative rounded-full p-2 text-ink-600 transition-colors hover:bg-ink-100"
              aria-label="通知"
            >
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            {/* アバターメニュー */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                className="ml-1 rounded-full ring-brand-300 transition-all hover:ring-2"
              >
                <Avatar user={me} size={34} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-11 w-52 overflow-hidden rounded-2xl border border-ink-200 bg-white py-1 shadow-lg">
                  <div className="border-b border-ink-100 px-4 py-2.5">
                    <p className="truncate text-sm font-semibold text-ink-900">{me.name}</p>
                    <p className="truncate text-xs text-ink-400">@{me.handle}</p>
                  </div>
                  <button
                    onMouseDown={() => nav(`/u/${me.id}`)}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50"
                  >
                    <UserIcon size={15} /> マイページ
                  </button>
                  <button
                    onMouseDown={() => {
                      reset();
                      toast.success("デモデータを初期状態に戻しました");
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50"
                  >
                    <RotateCcw size={15} /> デモをリセット
                  </button>
                  <button
                    onMouseDown={() => {
                      logout();
                      nav("/login");
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50"
                  >
                    <LogOut size={15} /> ログアウト
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>

      <footer className="mx-auto max-w-5xl px-4 pb-10 pt-4 text-center text-xs text-ink-400">
        wag+ ／ コミュニティサイト提案デモ ・ このサイトはデモ用のダミーデータで動作しています
      </footer>
    </div>
  );
}
