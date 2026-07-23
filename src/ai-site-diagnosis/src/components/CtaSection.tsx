import { toast } from "sonner";
import { MessageCircle, PhoneCall, ArrowRight } from "lucide-react";

/**
 * 診断結果からの「無料相談 / LINE追加」導線。
 * ※ココナラ規約により、モックには実際の外部リンク（LINE・問い合わせフォーム等）は設置しません。
 *   本番では公式アカウント連携や相談フォームに接続する想定です。
 */
export default function CtaSection() {
  const notice = () =>
    toast("このデモでは外部連携を省略しています", {
      description: "本番ではLINE公式アカウント・相談フォームへ接続します。",
    });

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--color-brand)]/30 bg-gradient-to-br from-[var(--color-brand)]/10 to-[var(--color-brand-2)]/10 p-6 text-center sm:p-8">
      <h3 className="text-xl font-bold sm:text-2xl">
        改善の進め方、<span className="text-gradient">無料で相談</span>できます
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-white/60">
        診断結果をもとに、優先度の高い改善から具体的にご提案します。
        しつこい営業はありません。
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          onClick={notice}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)] px-6 py-3 font-bold text-black shadow-[0_0_24px_var(--color-brand-2)]/60 transition hover:brightness-110 active:scale-[0.98]"
        >
          <PhoneCall size={18} /> 無料で相談する
          <ArrowRight size={16} />
        </button>
        <button
          onClick={notice}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#06C755]/50 bg-[#06C755]/15 px-6 py-3 font-bold text-[#4ade80] transition hover:bg-[#06C755]/25 active:scale-[0.98]"
        >
          <MessageCircle size={18} /> LINEで受け取る
        </button>
      </div>
      <p className="mt-4 text-[11px] text-white/35">
        ※デモのため、ボタンを押しても外部サイトへは遷移しません
      </p>
    </section>
  );
}
