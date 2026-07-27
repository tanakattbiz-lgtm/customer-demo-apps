import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { motion } from "motion/react";
import { Bot, Sparkles, ArrowRight, MessageCircle, BookOpen, BarChart3 } from "lucide-react";
import { useStore } from "./store";
import { Layout } from "./components/Layout";
import { ChatWidget } from "./components/ChatWidget";
import { Dashboard } from "./pages/Dashboard";
import { Logs } from "./pages/Logs";
import { LogDetail } from "./pages/LogDetail";
import { Knowledge } from "./pages/Knowledge";
import { Button, Spinner } from "./components/ui";

export default function App() {
  const authed = useStore((s) => s.authed);
  if (!authed) return <Login />;

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/logs/:id" element={<LogDetail />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <ChatWidget />
    </>
  );
}

function Login() {
  const login = useStore((s) => s.login);
  const [loading, setLoading] = useState(false);

  function enter() {
    setLoading(true);
    setTimeout(login, 650);
  }

  return (
    <div className="grid min-h-full lg:grid-cols-2">
      {/* 左:ブランド面 */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-2.5 text-white">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
            <Bot size={22} />
          </div>
          <div className="text-lg font-bold">ChatOps Console</div>
        </div>

        <div className="relative z-10 space-y-6 text-white">
          <h1 className="text-3xl leading-snug font-bold">
            AIチャットボットで、
            <br />
            一次対応を自動化する。
          </h1>
          <ul className="space-y-3 text-sm text-white/85">
            {[
              { icon: MessageCircle, t: "サイトに埋め込むチャットUIウィジェット" },
              { icon: Sparkles, t: "生成AIがナレッジを参照して自動回答（RAG）" },
              { icon: BarChart3, t: "会話ログと解決率をダッシュボードで可視化" },
            ].map(({ icon: Icon, t }) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/15">
                  <Icon size={16} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-xs text-white/50">株式会社○○ 様 ご提案用デモ</div>

        {/* 装飾グロー */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
      </div>

      {/* 右:ログインフォーム */}
      <div className="flex items-center justify-center bg-ink-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                <Bot size={22} />
              </div>
              <div className="text-lg font-bold text-ink-900">ChatOps Console</div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-ink-900">管理コンソールにログイン</h2>
          <p className="mt-1 text-sm text-ink-500">運用チーム向けの管理画面です。</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              enter();
            }}
            className="mt-6 space-y-4"
          >
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">メールアドレス</span>
              <input
                defaultValue="admin@example.com"
                className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">パスワード</span>
              <input
                type="password"
                defaultValue="demo-password"
                className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Spinner /> ログイン中…
                </>
              ) : (
                <>
                  ログイン <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-50 px-3.5 py-2.5 text-xs text-brand-700">
            <BookOpen size={14} className="shrink-0" />
            デモ用アカウントを入力済みです。「ログイン」を押すとそのまま入れます。
          </div>

          <p className="mt-6 text-center text-[11px] text-ink-400">
            これはご提案用のモックです。実在の認証・個人情報は含みません。
          </p>
        </motion.div>
      </div>
    </div>
  );
}
