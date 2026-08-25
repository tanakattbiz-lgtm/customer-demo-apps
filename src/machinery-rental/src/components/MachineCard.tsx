import { Link } from "react-router-dom";
import { Heart, Leaf, Satellite, Star } from "lucide-react";
import { motion } from "motion/react";
import type { Machine } from "../data/seed";
import { yen } from "../lib/format";
import { useStore } from "../store";
import { Badge } from "./ui";
import { MachineArt } from "./MachineArt";

export function StockDot({ total }: { total: number }) {
  const tone =
    total === 0 ? "text-ng-500" : total <= 3 ? "text-warn-500" : "text-ok-500";
  const label = total === 0 ? "在庫なし" : total <= 3 ? `残り ${total} 台` : `在庫あり ${total} 台`;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${tone}`}>
      <span className="relative inline-block h-2 w-2">
        <span className="absolute inset-0 rounded-full bg-current" />
        {total > 0 && <span className="ping-soft absolute inset-0" />}
      </span>
      {label}
    </span>
  );
}

export function MachineCard({ m, index = 0 }: { m: Machine; index?: number }) {
  const favorites = useStore((s) => s.favorites);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const fav = favorites.includes(m.id);
  const total = Object.values(m.stock).reduce((a, b) => a + b, 0);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.035, 0.28), ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-sun-300 hover:shadow-[var(--shadow-lift)]"
    >
      <button
        onClick={() => toggleFavorite(m.id)}
        aria-label={fav ? "お気に入りから外す" : "お気に入りに追加"}
        className={`absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border transition-all ${
          fav
            ? "border-ng-100 bg-ng-100 text-ng-500"
            : "border-ink-200 bg-white/85 text-ink-400 hover:text-ng-500"
        }`}
      >
        <Heart size={15} fill={fav ? "currentColor" : "none"} />
      </button>

      <Link to={`/rental/${m.id}`} className="block overflow-hidden bg-sun-50">
        <MachineArt
          kind={m.art}
          idKey={`card-${m.id}`}
          className="aspect-[3/2] w-full transition-transform duration-500 ease-out group-hover:scale-[1.05]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {m.ict && (
            <Badge tone="sea">
              <Satellite size={11} /> ICT
            </Badge>
          )}
          {m.popular && <Badge tone="sun">人気</Badge>}
          {m.eco && !m.ict && !m.popular && (
            <Badge tone="ok">
              <Leaf size={11} /> 低燃費
            </Badge>
          )}
          <span className="tnum ml-auto flex items-center gap-1 text-[11px] font-bold text-ink-500">
            <Star size={11} className="fill-sun-500 text-sun-500" />
            {m.rating.toFixed(1)}
            <span className="font-normal text-ink-300">({m.reviews})</span>
          </span>
        </div>

        <Link to={`/rental/${m.id}`} className="block">
          <h3 className="text-[15px] font-bold leading-snug text-ink-900 group-hover:text-sun-800">
            {m.name}
          </h3>
        </Link>
        <p className="tnum mt-0.5 text-[11px] font-medium tracking-wide text-ink-400">
          {m.model} / {m.classLabel}
        </p>

        <p className="mt-2.5 line-clamp-2 text-[12.5px] leading-relaxed text-ink-500">{m.summary}</p>

        <div className="mt-auto pt-4">
          <StockDot total={total} />
          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="leading-none">
              <span className="text-[11px] font-bold text-ink-400">日極</span>
              <span className="tnum ml-1.5 text-xl font-black text-ink-900">{yen(m.dayRate)}</span>
              <span className="text-[11px] text-ink-400">〜</span>
            </p>
            <Link
              to={`/rental/${m.id}`}
              className="rounded-full bg-ink-900 px-3.5 py-2 text-[11px] font-bold text-white transition-colors hover:bg-sun-500 hover:text-ink-900"
            >
              詳細・空き
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
