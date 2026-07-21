import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { Briefcase, Heart, LayoutDashboard } from "lucide-react";
import { useStore } from "./store";
import Portal from "./pages/Portal";
import JobDetail from "./pages/JobDetail";
import Admin from "./pages/Admin";

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-ink-50">
      <PublicHeader />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Portal />} />
          <Route path="/job/:id" element={<JobDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <PublicFooter />
    </div>
  );
}

function PublicHeader() {
  const savedCount = useStore((s) => s.savedIds.length);
  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
            <Briefcase size={18} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold text-ink-900">○○ワーク</span>
            <span className="text-[10px] font-medium tracking-widest text-brand-500">
              JOB PORTAL
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="hidden items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-600 sm:inline-flex">
            <Heart size={14} fill="currentColor" /> 気になる
            <span className="tnum">{savedCount}</span>
          </span>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-sm font-semibold text-ink-600 transition hover:border-brand-300 hover:text-brand-600"
            title="採用担当者向けの管理画面"
          >
            <LayoutDashboard size={14} />
            <span className="hidden sm:inline">採用担当の方</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="mt-6 border-t border-ink-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
              <Briefcase size={16} />
            </span>
            <span className="font-bold text-ink-800">○○ワーク</span>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-500">
            <span className="cursor-default">会社紹介</span>
            <span className="cursor-default">採用情報</span>
            <span className="cursor-default">ご利用ガイド</span>
            <span className="cursor-default">利用規約</span>
            <Link to="/admin" className="font-medium text-ink-600 hover:text-brand-600">
              採用担当の方はこちら
            </Link>
          </nav>
        </div>
        <p className="mt-6 text-xs leading-relaxed text-ink-400">
          ※本サイトは提案用のデモ(モックアップ)です。掲載している求人・企業名・応募者情報はすべて架空のサンプルであり、実在のものではありません。
          <br />
          © ○○ワーク DEMO — Job Portal Mockup
        </p>
      </div>
    </footer>
  );
}
