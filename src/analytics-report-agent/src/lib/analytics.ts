import type { DailyMetric, Channel, Kpi } from "../data/seed";

export interface Agg {
  pv: number;
  users: number;
  sessions: number;
  conversions: number;
  cvr: number; // 0..1
}

export function aggregate(rows: DailyMetric[]): Agg {
  const pv = rows.reduce((a, m) => a + m.pv, 0);
  const users = rows.reduce((a, m) => a + m.users, 0);
  const sessions = rows.reduce((a, m) => a + m.sessions, 0);
  const conversions = rows.reduce((a, m) => a + m.conversions, 0);
  return { pv, users, sessions, conversions, cvr: sessions ? conversions / sessions : 0 };
}

/** 前期間比。cur/prev の増減率(prev=0 は 0 扱い)。 */
export const growth = (cur: number, prev: number) => (prev ? (cur - prev) / prev : 0);

export interface Period {
  cur: Agg;
  prev: Agg;
}

/** 直近 n 日 と その前 n 日 を集計 */
export function period(metrics: DailyMetric[], n: number): Period {
  const cur = metrics.slice(-n);
  const prev = metrics.slice(-n * 2, -n);
  return { cur: aggregate(cur), prev: aggregate(prev) };
}

export const week = (m: DailyMetric[]) => period(m, 7);
export const month = (m: DailyMetric[]) => period(m, 28);

/** オーガニック流入比率(%) */
export function organicRatio(channels: Channel[]): number {
  const total = channels.reduce((a, c) => a + c.users, 0);
  const o = channels.find((c) => c.key === "organic");
  return total && o ? (o.users / total) * 100 : 0;
}

export type KpiStatus = "達成" | "順調" | "要改善";

export interface KpiEval {
  kpi: Kpi;
  value: number; // 実測値(unit に対応)
  ratio: number; // target に対する達成率(0..1+)
  status: KpiStatus;
}

/** KPI を直近 28 日ベースで評価 */
export function evalKpis(metrics: DailyMetric[], channels: Channel[], kpis: Kpi[]): KpiEval[] {
  const m = aggregate(metrics.slice(-28));
  return kpis.map((kpi) => {
    let value = 0;
    switch (kpi.metric) {
      case "users":
        value = m.users;
        break;
      case "conversions":
        value = m.conversions;
        break;
      case "cvr":
        value = m.cvr * 100;
        break;
      case "organicRatio":
        value = organicRatio(channels);
        break;
    }
    const ratio = kpi.target ? value / kpi.target : 0;
    const status: KpiStatus = ratio >= 1 ? "達成" : ratio >= 0.85 ? "順調" : "要改善";
    return { kpi, value, ratio, status };
  });
}
