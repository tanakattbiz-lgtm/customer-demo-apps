import { BarChart3, TrendingUp, TrendingDown, Target, Lightbulb } from "lucide-react";
import type { Agg } from "../lib/analytics";
import type { KpiEval } from "../lib/analytics";
import type { Proposal } from "../data/seed";
import { num, pct, delta } from "../lib/format";

/**
 * Google Chat のボットカード(Cards v2)を模した通知プレビュー。
 * 実際に送信される整形済みメッセージのイメージを顧客に見せる。
 */
export function GoogleChatCard({
  space,
  periodLabel,
  cur,
  wow,
  kpis,
  proposals,
}: {
  space: string;
  periodLabel: string;
  cur: Agg;
  wow: { users: number; cvr: number; conversions: number };
  kpis: KpiEval[];
  proposals: Proposal[];
}) {
  const rows: { label: string; value: string; d: number }[] = [
    { label: "ユーザー数", value: num(cur.users) + " 人", d: wow.users },
    { label: "コンバージョン", value: num(cur.conversions) + " 件", d: wow.conversions },
    { label: "CV率", value: pct(cur.cvr), d: wow.cvr },
  ];

  return (
    <div className="rounded-2xl bg-[oklch(97%_0.003_275)] p-3">
      {/* Chat スペースヘッダー */}
      <div className="mb-2 flex items-center gap-2 px-1 text-xs text-ink-400">
        <span className="grid h-5 w-5 place-items-center rounded bg-ink-200 text-[10px]">#</span>
        {space}
      </div>

      {/* ボットメッセージ */}
      <div className="flex gap-2.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
          <BarChart3 size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5">
            <span className="text-sm font-bold text-ink-900">Insight Agent</span>
            <span className="rounded bg-ink-200 px-1 py-0.5 text-[9px] font-semibold text-ink-500">
              APP
            </span>
            <span className="text-[11px] text-ink-400">今</span>
          </div>

          {/* カード本体 */}
          <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
            <div className="bg-brand-600 px-4 py-3 text-white">
              <div className="text-sm font-bold">週次アクセス解析レポート</div>
              <div className="text-[11px] opacity-90">{periodLabel} / ○○株式会社 コーポレートサイト</div>
            </div>

            <div className="space-y-3 px-4 py-3.5">
              {/* 主要指標 */}
              <div>
                <SectionLabel icon={<TrendingUp size={12} />} text="主要指標(前週比)" />
                <div className="mt-1.5 space-y-1.5">
                  {rows.map((r) => (
                    <div key={r.label} className="flex items-center justify-between text-sm">
                      <span className="text-ink-600">{r.label}</span>
                      <span className="tnum flex items-center gap-2">
                        <span className="font-semibold text-ink-900">{r.value}</span>
                        <span
                          className={
                            "inline-flex items-center gap-0.5 text-xs font-semibold " +
                            (r.d >= 0 ? "text-emerald-600" : "text-rose-600")
                          }
                        >
                          {r.d >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          {delta(r.d)}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-ink-100" />

              {/* KPI 進捗 */}
              <div>
                <SectionLabel icon={<Target size={12} />} text="KPI 進捗(月次)" />
                <div className="mt-1.5 space-y-1">
                  {kpis.map((k) => (
                    <div key={k.kpi.id} className="flex items-center justify-between text-sm">
                      <span className="text-ink-600">{k.kpi.label}</span>
                      <span className="tnum flex items-center gap-1.5 font-medium text-ink-800">
                        {Math.round(k.ratio * 100)}%
                        <span
                          className={
                            "rounded px-1.5 py-0.5 text-[10px] font-semibold " +
                            (k.status === "達成"
                              ? "bg-emerald-100 text-emerald-700"
                              : k.status === "順調"
                                ? "bg-brand-100 text-brand-700"
                                : "bg-amber-100 text-amber-800")
                          }
                        >
                          {k.status}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {proposals.length > 0 && (
                <>
                  <div className="border-t border-ink-100" />
                  <div>
                    <SectionLabel icon={<Lightbulb size={12} />} text="AI 改善提案(優先度順)" />
                    <ol className="mt-1.5 space-y-1.5">
                      {proposals.map((p, i) => (
                        <li key={p.id} className="flex gap-2 text-sm">
                          <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                            {i + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="font-medium text-ink-800">{p.title}</div>
                            <div className="text-[11px] text-ink-400">{p.impact}</div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-1">
                <span className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700">
                  詳細レポートを開く
                </span>
                <span className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-500">
                  提案をタスク化
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1 text-[11px] font-semibold tracking-wide text-ink-400">
      <span className="text-brand-500">{icon}</span>
      {text}
    </div>
  );
}
