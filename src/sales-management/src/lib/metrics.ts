import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth, subMonths } from "date-fns";
import type { Report, Rep } from "../data/seed";

export interface Kpi {
  visits: number;
  meetings: number;
  proposals: number;
  deals: number;
  amount: number;
  count: number; // 日報件数
}

export const EMPTY_KPI: Kpi = {
  visits: 0,
  meetings: 0,
  proposals: 0,
  deals: 0,
  amount: 0,
  count: 0,
};

export function sumKpi(reports: Report[]): Kpi {
  return reports.reduce<Kpi>(
    (a, r) => ({
      visits: a.visits + r.visits,
      meetings: a.meetings + r.meetings,
      proposals: a.proposals + r.proposals,
      deals: a.deals + r.deals,
      amount: a.amount + r.amount,
      count: a.count + 1,
    }),
    { ...EMPTY_KPI },
  );
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7); // yyyy-MM
}

/** 権限に応じて閲覧可能な日報を返す。管理者は全件、社員は自分のみ。 */
export function visibleReports(reports: Report[], me: Rep | undefined): Report[] {
  if (!me || me.role === "管理者") return reports;
  return reports.filter((r) => r.repId === me.id);
}

export function inMonth(reports: Report[], key: string): Report[] {
  return reports.filter((r) => monthKey(r.date) === key);
}

/** 前月比(%)。前月が 0 のときは新規として +100% 扱い。 */
export function deltaPct(current: number, prev: number): number {
  if (prev === 0) return current === 0 ? 0 : 100;
  return ((current - prev) / prev) * 100;
}

/** 指定月の日次 受注金額 と 商談数 の推移(グラフ用) */
export function dailySeries(reports: Report[], key: string) {
  const [y, m] = key.split("-").map(Number);
  const base = new Date(y, m - 1, 1);
  const days = eachDayOfInterval({ start: startOfMonth(base), end: endOfMonth(base) });
  const byDay = new Map<string, { amount: number; meetings: number }>();
  for (const r of reports) {
    if (monthKey(r.date) !== key) continue;
    const cur = byDay.get(r.date) ?? { amount: 0, meetings: 0 };
    cur.amount += r.amount;
    cur.meetings += r.meetings;
    byDay.set(r.date, cur);
  }
  let cumulative = 0;
  return days.map((d) => {
    const ds = format(d, "yyyy-MM-dd");
    const v = byDay.get(ds) ?? { amount: 0, meetings: 0 };
    cumulative += v.amount;
    return {
      date: ds,
      label: format(d, "M/d"),
      amount: v.amount,
      cumulative,
      meetings: v.meetings,
    };
  });
}

/** メンバー別の受注金額ランキング(管理者ビュー用) */
export function memberRanking(reports: Report[], reps: Rep[], key: string) {
  const members = reps.filter((r) => r.role === "社員");
  return members
    .map((rep) => {
      const rs = reports.filter((r) => r.repId === rep.id && monthKey(r.date) === key);
      const kpi = sumKpi(rs);
      return {
        rep,
        amount: kpi.amount,
        deals: kpi.deals,
        meetings: kpi.meetings,
        rate: rep.monthlyTarget > 0 ? (kpi.amount / rep.monthlyTarget) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

/** 直近の月キー一覧(新しい順) */
export function recentMonths(count = 6, today = new Date()): { key: string; label: string }[] {
  return Array.from({ length: count }, (_, i) => {
    const d = subMonths(today, i);
    return { key: format(d, "yyyy-MM"), label: format(d, "yyyy年M月") };
  });
}

export function monthLabel(key: string): string {
  const d = parseISO(key + "-01");
  return format(d, "yyyy年M月");
}
