import { useEffect, useRef, useState } from "react";
import { Sparkle } from "lucide-react";

// AIアドバイスをタイピング風に表示するパネル
export function AiAdvice({ text }: { text: string }) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    setShown("");
    setDone(false);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(text);
      setDone(true);
      return;
    }
    let i = 0;
    const tick = () => {
      i = Math.min(text.length, i + 2 + Math.floor(Math.random() * 3));
      setShown(text.slice(0, i));
      if (i < text.length) {
        ref.current = window.setTimeout(tick, 18);
      } else {
        setDone(true);
      }
    };
    ref.current = window.setTimeout(tick, 350);
    return () => {
      if (ref.current) clearTimeout(ref.current);
    };
  }, [text]);

  return (
    <div className="overflow-hidden rounded-2xl border border-primary-200 bg-gradient-to-b from-primary-50 to-white">
      <div className="flex items-center gap-2.5 border-b border-primary-100 bg-white/60 px-5 py-3.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white">
          <Sparkle size={15} />
        </span>
        <div>
          <p className="text-sm font-bold text-primary-800">AI税務アドバイザー</p>
          <p className="text-[11px] text-slate-500">
            {done ? "分析完了" : "結果を分析しています…"}
          </p>
        </div>
      </div>
      <div className="px-5 py-4">
        {shown.split("\n\n").map((para, idx, arr) => (
          <p key={idx} className="mb-3 text-sm leading-7 text-slate-700 last:mb-0">
            {para}
            {!done && idx === arr.length - 1 && <span className="ai-caret" />}
          </p>
        ))}
        {done && (
          <p className="mt-4 border-t border-primary-100 pt-3 text-[11px] leading-relaxed text-slate-400">
            ※AIによる参考情報です。税務判断は必ず税理士等の専門家にご確認ください。
          </p>
        )}
      </div>
    </div>
  );
}
