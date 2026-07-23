import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Check, Loader2, ScanLine } from "lucide-react";
import { diagnose, hostOf } from "../lib/diagnose";
import { SCAN_STEPS } from "../data/seed";
import { useDiagStore } from "../store";

export default function Analyzing() {
  const loc = useLocation();
  const nav = useNavigate();
  const add = useDiagStore((s) => s.add);
  const url = (loc.state as { url?: string } | null)?.url;

  // 解析結果は最初に一度だけ確定させる（IDを安定させるため）
  const result = useMemo(() => (url ? diagnose(url) : null), [url]);
  const [step, setStep] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!result) return;
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const per = reduce ? 260 : 620;
    const timers: number[] = [];
    for (let i = 1; i <= SCAN_STEPS.length; i++) {
      timers.push(window.setTimeout(() => setStep(i), per * i));
    }
    timers.push(
      window.setTimeout(
        () => {
          if (doneRef.current) return;
          doneRef.current = true;
          add(result);
          nav(`/result/${result.id}`, { replace: true });
        },
        per * (SCAN_STEPS.length + 1),
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, [result, add, nav]);

  if (!url || !result) return <Navigate to="/" replace />;

  const pct = Math.round((step / SCAN_STEPS.length) * 100);

  return (
    <div className="bg-grid grid min-h-[calc(100vh-56px)] place-items-center px-4">
      <div className="w-full max-w-md text-center">
        {/* scanner visual */}
        <div className="relative mx-auto mb-8 grid h-28 w-28 place-items-center">
          <motion.span
            className="absolute inset-0 rounded-full border border-[var(--color-brand)]/40"
            animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
          <span className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] shadow-[0_0_36px_var(--color-brand-2)]">
            <ScanLine size={34} className="text-black" />
          </span>
        </div>

        <p className="text-xs font-medium text-white/40">診断中のサイト</p>
        <p className="mt-0.5 truncate text-lg font-bold">{hostOf(url)}</p>

        {/* progress */}
        <div className="mx-auto mt-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]"
            animate={{ width: `${pct}%` }}
            transition={{ ease: "easeOut" }}
          />
        </div>
        <p className="tnum mt-2 text-sm font-bold text-[var(--color-brand)]">
          {pct}%
        </p>

        {/* steps */}
        <ul className="mx-auto mt-6 space-y-2 text-left">
          {SCAN_STEPS.map((s, i) => {
            const state = i < step ? "done" : i === step ? "active" : "todo";
            return (
              <li
                key={s}
                className="flex items-center gap-3 text-sm transition"
                style={{ opacity: state === "todo" ? 0.35 : 1 }}
              >
                <span className="grid h-5 w-5 shrink-0 place-items-center">
                  {state === "done" ? (
                    <Check size={16} className="text-[var(--color-rank-a)]" />
                  ) : state === "active" ? (
                    <Loader2
                      size={16}
                      className="animate-spin text-[var(--color-brand)]"
                    />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                  )}
                </span>
                <span className={state === "done" ? "text-white/60" : ""}>
                  {s}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
