import { Link } from "react-router-dom";
import { ScanLine } from "lucide-react";

/** 全画面共通のガワ。ロゴはプロダクトの一般名（発注元の屋号は伏字）。 */
export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[var(--color-ink)]/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] shadow-[0_0_18px_var(--color-brand-2)]">
            <ScanLine size={18} className="text-black" />
          </span>
          <span className="text-[15px] font-bold tracking-wide">
            SITE<span className="text-gradient">SCORE</span>
            <span className="ml-1 align-middle text-[10px] font-normal text-white/40">
              AI
            </span>
          </span>
        </Link>
        <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/60">
          無料ホームページ診断
        </span>
      </div>
    </header>
  );
}
