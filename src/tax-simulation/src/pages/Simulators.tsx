import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Home as HomeIcon, Landmark, HandCoins, Building2, ChevronRight, History } from "lucide-react";
import { SIMULATORS, simMeta, type SimType } from "../data/simulators";
import { useStore } from "../store/useStore";
import { man } from "../lib/tax";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export const SIM_ICONS: Record<SimType, typeof HomeIcon> = {
  sale: HomeIcon,
  inheritance: Landmark,
  gift: HandCoins,
  rental: Building2,
};

export function Simulators() {
  const history = useStore((s) => s.history);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-en text-xs font-bold uppercase tracking-[0.2em] text-primary-600">
        Simulators
      </p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
        税金シミュレーション
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        知りたい税金を選んでください。入力は約1分、会員登録は不要です。
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {SIMULATORS.map((s, i) => {
          const Icon = SIM_ICONS[s.type];
          return (
            <motion.div
              key={s.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05, ease: "easeOut" }}
            >
              <Link
                to={`/simulators/${s.type}`}
                className="group flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors duration-200 group-hover:bg-primary-600 group-hover:text-white">
                  <Icon size={22} />
                </span>
                <span className="flex-1">
                  <span className="flex items-center justify-between">
                    <span className="text-lg font-bold">{s.title}</span>
                    <ChevronRight size={17} className="text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary-500" />
                  </span>
                  <span className="mt-1 block text-[13px] leading-6 text-slate-500">{s.desc}</span>
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {history.length > 0 && (
        <div className="mt-12">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <History size={16} className="text-slate-400" />
            最近のシミュレーション
          </h2>
          <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            {history.slice(0, 5).map((h) => (
              <Link
                key={h.id}
                to={`/simulators/${h.type}`}
                className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {simMeta(h.type).title} — {h.summary}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(h.date), { addSuffix: true, locale: ja })}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-primary-700">
                  {man(h.totalTax)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
