import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Search,
  Sparkles,
  ArrowRight,
  ScanSearch,
  BarChart3,
  Wand2,
  Clock,
  History,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { isValidUrl, normalizeUrl } from "../lib/diagnose";
import { SAMPLE_SITES } from "../data/seed";
import { useDiagStore } from "../store";
import RankBadge from "../components/RankBadge";
import { RANK_META } from "../components/rankMeta";

const HOW = [
  {
    icon: ScanSearch,
    title: "URLを入力",
    desc: "診断したいホームページのURLを貼るだけ。会員登録は不要です。",
  },
  {
    icon: Wand2,
    title: "AIが自動解析",
    desc: "デザイン・SEO・速度・集客導線など6項目をAIが多角的に採点します。",
  },
  {
    icon: BarChart3,
    title: "スコア＆改善提案",
    desc: "総合スコアとランク、優先度つきの改善提案カードをその場で表示。",
  },
];

export default function Landing() {
  const nav = useNavigate();
  const [url, setUrl] = useState("");
  const [touched, setTouched] = useState(false);
  const history = useDiagStore((s) => s.history);
  const reset = useDiagStore((s) => s.reset);

  const valid = isValidUrl(url);

  const submit = (raw?: string) => {
    const target = raw ?? url;
    if (!isValidUrl(target)) {
      setTouched(true);
      toast.error("正しいURLを入力してください");
      return;
    }
    nav("/analyzing", { state: { url: normalizeUrl(target) } });
  };

  return (
    <div className="bg-grid">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-14 text-center sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
            <Sparkles size={13} className="text-[var(--color-brand)]" />
            OpenAIを活用したAIサイト診断
          </span>
          <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-5xl">
            あなたのHPは
            <span className="text-gradient"> 何点</span>?
            <br className="hidden sm:block" />
            <span className="text-2xl sm:text-4xl">
              広告が“もったいない”か、30秒で診断。
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/60 sm:text-base">
            URLを入れるだけ。AIがデザイン・SEO・表示速度・集客導線を採点し、
            今日から直せる改善ポイントを提示します。
          </p>
        </motion.div>

        {/* URL form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-8 max-w-xl"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex flex-col gap-2 rounded-2xl border border-white/12 bg-[var(--color-ink-2)]/80 p-2 backdrop-blur sm:flex-row"
          >
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-black/30 px-3">
              <Search size={18} className="shrink-0 text-white/40" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="https://your-site.com"
                inputMode="url"
                autoComplete="off"
                className="w-full bg-transparent py-3 text-[15px] outline-none placeholder:text-white/30"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)] px-6 py-3 font-bold text-black transition hover:brightness-110 active:scale-[0.98]"
            >
              無料で診断する
              <ArrowRight size={18} />
            </button>
          </form>
          {touched && url && !valid && (
            <p className="mt-2 text-left text-xs text-[var(--color-rank-d)]">
              URLの形式が正しくないようです（例: https://example.com）
            </p>
          )}

          {/* Sample sites */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-white/50">
            <span>サンプルで試す:</span>
            {SAMPLE_SITES.map((s) => (
              <button
                key={s.url}
                onClick={() => {
                  setUrl(s.url);
                  submit(s.url);
                }}
                className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-white/70 transition hover:border-[var(--color-brand)]/50 hover:text-white"
              >
                {s.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* social proof */}
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-3 text-center">
          {[
            { n: "12,400+", l: "診断実績" },
            { n: "6項目", l: "AI採点" },
            { n: "30秒", l: "で結果表示" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-xl border border-white/8 bg-white/[0.03] py-3"
            >
              <div className="tnum text-xl font-bold text-white sm:text-2xl">
                {s.n}
              </div>
              <div className="mt-0.5 text-[11px] text-white/50">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {HOW.map((h, i) => (
            <div
              key={h.title}
              className="rounded-2xl border border-white/10 bg-[var(--color-ink-2)]/60 p-5"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-[var(--color-brand)]">
                  <h.icon size={18} />
                </span>
                <span className="text-xs font-bold text-white/40">
                  STEP {i + 1}
                </span>
              </div>
              <h3 className="mt-3 font-bold">{h.title}</h3>
              <p className="mt-1 text-sm text-white/55">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* History */}
      {history.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 pb-16">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white/70">
              <History size={16} /> 最近の診断
            </h2>
            <button
              onClick={() => {
                reset();
                toast.success("診断履歴をリセットしました");
              }}
              className="inline-flex items-center gap-1 text-xs text-white/40 transition hover:text-white/70"
            >
              <Trash2 size={13} /> リセット
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {history.slice(0, 6).map((d) => (
              <button
                key={d.id}
                onClick={() => nav(`/result/${d.id}`)}
                className="group flex items-center justify-between rounded-xl border border-white/10 bg-[var(--color-ink-2)]/60 p-3 text-left transition hover:border-white/25"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{d.host}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-white/40">
                    <Clock size={11} />
                    {new Date(d.createdAt).toLocaleString("ja-JP", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="tnum text-lg font-bold"
                    style={{ color: RANK_META[d.rank].color }}
                  >
                    {d.total}
                  </span>
                  <RankBadge rank={d.rank} size="sm" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-white/10 px-4 py-8 text-center text-xs text-white/35">
        <p>提供: 株式会社○○（デモ表示のため社名は伏せています）</p>
        <p className="mt-1">
          ※本ツールは提案用のデモです。診断結果はサンプル生成された疑似データです。
        </p>
      </footer>
    </div>
  );
}
