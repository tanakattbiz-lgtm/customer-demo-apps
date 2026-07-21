import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { MapPin, Heart, Sparkles } from "lucide-react";
import type { Job } from "../data/seed";
import { isNew } from "../data/seed";
import { wageText, fromNow } from "../lib/format";
import { useStore } from "../store";
import { CategoryIcon } from "./CategoryIcon";
import { Tag } from "./ui";

export function JobCard({ job, index = 0 }: { job: Job; index?: number }) {
  const saved = useStore((s) => s.savedIds.includes(job.id));
  const toggleSave = useStore((s) => s.toggleSave);
  const applied = useStore((s) => s.appliedIds.includes(job.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.03, 0.25) }}
    >
      <Link
        to={`/job/${job.id}`}
        className="group block h-full rounded-2xl border border-ink-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-600/5"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-500">
              <CategoryIcon category={job.category} size={20} />
            </span>
            <div className="flex flex-col gap-1">
              {isNew(job.postedAt) && (
                <Tag tone="brand">
                  <Sparkles size={12} /> 新着
                </Tag>
              )}
              <span className="text-xs font-medium text-ink-400">{job.category}</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleSave(job.id);
            }}
            aria-label="気になる"
            className={
              "grid h-9 w-9 shrink-0 place-items-center rounded-full transition " +
              (saved
                ? "bg-brand-100 text-brand-600"
                : "text-ink-300 hover:bg-ink-100 hover:text-brand-500")
            }
          >
            <Heart size={18} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>

        <h3 className="mb-1 line-clamp-2 font-bold text-ink-900 group-hover:text-brand-700">
          {job.title}
        </h3>
        <p className="mb-3 line-clamp-1 text-sm text-mint-700">{job.catch}</p>

        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-600">
          <span className="inline-flex items-center gap-1">
            <MapPin size={14} className="text-ink-400" />
            {job.prefecture} {job.city}
          </span>
          <span className="font-bold text-brand-700">{wageText(job.wage)}</span>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {job.tags.slice(0, 3).map((t) => (
            <Tag key={t} tone="mint">
              {t}
            </Tag>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-ink-100 pt-3 text-xs text-ink-400">
          <span>{job.employment}</span>
          <span>{applied ? "応募済み" : fromNow(job.postedAt) + "に掲載"}</span>
        </div>
      </Link>
    </motion.div>
  );
}
