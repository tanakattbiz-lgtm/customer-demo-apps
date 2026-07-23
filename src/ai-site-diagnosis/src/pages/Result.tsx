import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Share2,
  RotateCcw,
  Gauge,
  Copy,
  X,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useDiagStore } from "../store";
import { rankOf, type CategoryResult } from "../lib/diagnose";
import { CATEGORY_MAP } from "../data/seed";
import { RANK_META } from "../components/rankMeta";
import ScoreRing from "../components/ScoreRing";
import RankBadge from "../components/RankBadge";
import CtaSection from "../components/CtaSection";

function scoreColor(score: number): string {
  return RANK_META[rankOf(score)].color;
}

const PRIORITY_STYLE: Record<string, string> = {
  高: "text-[var(--color-rank-d)] border-[var(--color-rank-d)]/40 bg-[var(--color-rank-d)]/10",
  中: "text-[var(--color-rank-c)] border-[var(--color-rank-c)]/40 bg-[var(--color-rank-c)]/10",
  低: "text-[var(--color-rank-b)] border-[var(--color-rank-b)]/40 bg-[var(--color-rank-b)]/10",
};

export default function Result() {
  const { id } = useParams();
  const d = useDiagStore((s) => (id ? s.get(id) : undefined));
  const [share, setShare] = useState(false);

  if (!d) return <Navigate to="/" replace />;

  const meta = RANK_META[d.rank];
  const radarData = d.categories.map((c) => ({
    subject: CATEGORY_MAP[c.key].short,
    value: c.score,
  }));

  return (
    <div className="bg-grid min-h-screen pb-16">
      <div className="mx-auto max-w-5xl px-4 pt-8">
        {/* target */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-white/40">診断結果</p>
            <p className="text-lg font-bold">{d.host}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShare(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm transition hover:border-white/30"
            >
              <Share2 size={15} /> 結果をシェア
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm transition hover:border-white/30"
            >
              <RotateCcw size={15} /> 別のサイトを診断
            </Link>
          </div>
        </div>

        {/* score hero */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid items-center gap-6 rounded-2xl border border-white/10 bg-[var(--color-ink-2)]/70 p-6 sm:grid-cols-2 sm:p-8"
        >
          <div className="flex flex-col items-center">
            <ScoreRing score={d.total} color={meta.color} />
            <div className="mt-4">
              <RankBadge rank={d.rank} />
            </div>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-2xl font-bold leading-snug sm:text-3xl">
              <span className="text-white/70">あなたのホームページは</span>
              <br />
              <span className="tnum text-gradient text-4xl sm:text-5xl">
                {d.total}点
              </span>
              <span className="text-white/70"> でした</span>
            </p>
            <p className="mt-3 flex items-start gap-2 text-sm text-white/60">
              <span className="text-lg leading-none">{meta.dot}</span>
              {meta.message}
            </p>
            <button
              onClick={() => setShare(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)] px-5 py-2.5 text-sm font-bold text-black transition hover:brightness-110 active:scale-[0.98]"
            >
              <Share2 size={16} /> スコアをシェアする
            </button>
          </div>
        </motion.section>

        {/* radar + breakdown */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-[var(--color-ink-2)]/70 p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white/70">
              <Gauge size={16} /> 項目別スコア
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="72%">
                  <PolarGrid stroke="oklch(45% 0.03 265 / 0.5)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                  />
                  <Radar
                    dataKey="value"
                    stroke="var(--color-brand)"
                    fill="var(--color-brand)"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[var(--color-ink-2)]/70 p-5">
            <h2 className="mb-3 text-sm font-bold text-white/70">評価の内訳</h2>
            <div className="space-y-3">
              {d.categories.map((c, i) => (
                <CategoryRow key={c.key} c={c} delay={i * 0.05} />
              ))}
            </div>
          </section>
        </div>

        {/* suggestions */}
        <section className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-[var(--color-brand)]" />
            <h2 className="text-lg font-bold">今日から直せる改善提案</h2>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
              {d.suggestions.length}件
            </span>
          </div>
          {d.suggestions.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[var(--color-ink-2)]/70 p-8 text-center text-sm text-white/60">
              大きな改善点は見つかりませんでした。現状の運用を維持しつつ、更新頻度の継続を。
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {d.suggestions.map((s, i) => (
                <motion.div
                  key={s.key + s.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="flex flex-col rounded-2xl border border-white/10 bg-[var(--color-ink-2)]/70 p-5"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-bold ${PRIORITY_STYLE[s.priority]}`}
                    >
                      優先度 {s.priority}
                    </span>
                    <span className="text-xs text-white/40">
                      {CATEGORY_MAP[s.key].label}
                    </span>
                  </div>
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm text-white/60">
                    {s.detail}
                  </p>
                  <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-3 text-xs">
                    <span className="flex items-center gap-1 text-[var(--color-rank-a)]">
                      <TrendingUp size={13} /> 見込み +{s.impact}点
                    </span>
                    <span className="text-white/50">工数: {s.effort}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <div className="mt-8">
          <CtaSection />
        </div>
      </div>

      {/* share modal */}
      <AnimatePresence>
        {share && <ShareModal onClose={() => setShare(false)} d={d} />}
      </AnimatePresence>
    </div>
  );
}

function CategoryRow({ c, delay }: { c: CategoryResult; delay: number }) {
  const meta = CATEGORY_MAP[c.key];
  const color = scoreColor(c.score);
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium">
          {c.positive ? (
            <CheckCircle2 size={14} className="text-[var(--color-rank-a)]" />
          ) : (
            <AlertTriangle size={14} className="text-[var(--color-rank-c)]" />
          )}
          {meta.label}
        </span>
        <span className="tnum font-bold" style={{ color }}>
          {c.score}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${c.score}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
        />
      </div>
      <p className="mt-1 text-xs text-white/45">{c.findings[0]}</p>
    </div>
  );
}

function ShareModal({
  onClose,
  d,
}: {
  onClose: () => void;
  d: ReturnType<typeof useDiagStore.getState>["history"][number];
}) {
  const meta = RANK_META[d.rank];
  const caption = `私のホームページをAI診断してみたら ${d.total}点（${d.rank}ランク）でした！ ${meta.dot}\nあなたのサイトは何点? #AIサイト診断`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      toast.success("シェア用テキストをコピーしました");
    } catch {
      toast("コピーできませんでした", {
        description: "手動で選択してコピーしてください。",
      });
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-30 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/15 bg-[var(--color-ink-2)]"
        initial={{ scale: 0.94, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* shareable card */}
        <div
          className="relative p-6 text-center"
          style={{
            background: `radial-gradient(120% 90% at 50% 0%, color-mix(in oklch, ${meta.color} 30%, transparent), transparent 60%)`,
          }}
        >
          <button
            onClick={onClose}
            className="absolute right-3 top-3 text-white/50 transition hover:text-white"
          >
            <X size={18} />
          </button>
          <p className="text-xs font-bold tracking-widest text-white/50">
            AI SITE SCORE
          </p>
          <p className="mt-3 text-sm text-white/70">{d.host}</p>
          <p className="tnum my-2 text-6xl font-black" style={{ color: meta.color }}>
            {d.total}
            <span className="text-2xl text-white/50">点</span>
          </p>
          <div className="flex justify-center">
            <RankBadge rank={d.rank} />
          </div>
          <p className="mt-3 text-xs text-white/50">{meta.message}</p>
        </div>
        <div className="border-t border-white/10 p-4">
          <p className="whitespace-pre-line rounded-lg bg-black/30 p-3 text-xs text-white/70">
            {caption}
          </p>
          <button
            onClick={copy}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)] py-2.5 font-bold text-black transition hover:brightness-110 active:scale-[0.98]"
          >
            <Copy size={16} /> シェア用テキストをコピー
          </button>
          <p className="mt-2 text-center text-[11px] text-white/35">
            SNSに貼るだけで、あなたのスコアをシェアできます
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
