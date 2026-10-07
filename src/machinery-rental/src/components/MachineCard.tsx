import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import type { Machine } from "../data/seed";
import { MachineArt } from "./MachineArt";
import { Tag } from "./ui";

export function MachineCard({ m, index = 0 }: { m: Machine; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/rental/${m.id}`}
        className="group flex h-full flex-col border border-ink-200 bg-white transition-colors duration-300 hover:border-navy-300"
      >
        <div className="relative overflow-hidden border-b border-ink-100 bg-ink-25">
          <MachineArt
            kind={m.art}
            idKey={`card-${m.id}`}
            className="w-full text-navy-700 transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
          {(m.ict || m.electric || m.isNew) && (
            <div className="absolute left-4 top-4 flex flex-col items-start gap-1.5">
              {m.isNew && <Tag tone="amber">NEW</Tag>}
              {m.ict && <Tag tone="navy">ICT</Tag>}
              {m.electric && <Tag tone="outline">電動</Tag>}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <p className="label-en text-ink-400">{m.group}</p>
          <h3 className="serif mt-3 text-[16px] leading-[1.6] text-ink-900 transition-colors group-hover:text-navy-700">
            {m.name}
          </h3>
          <p className="tnum mt-2 text-[11.5px] tracking-wide text-ink-400">{m.model}</p>

          <p className="mt-4 border-t border-ink-100 pt-4 text-[12px] leading-[1.9] text-ink-600">
            {m.headline}
          </p>

          <div className="mt-auto flex items-center justify-between pt-6">
            <span className="text-[11.5px] tracking-wide text-ink-500">諸元を見る</span>
            <span className="grid h-8 w-8 place-items-center border border-ink-200 text-ink-400 transition-all duration-300 group-hover:border-navy-600 group-hover:text-navy-700">
              <ArrowUpRight size={13} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
