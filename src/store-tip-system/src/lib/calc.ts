import { subDays, isSameDay, isSameMonth, format } from "date-fns";
import type { Staff, Tip, PayMethod } from "../data/seed";

export function sum(tips: Tip[]): number {
  return tips.reduce((a, t) => a + t.amount, 0);
}

export function todayTips(tips: Tip[]): Tip[] {
  const now = new Date();
  return tips.filter((t) => isSameDay(new Date(t.at), now));
}

export function monthTips(tips: Tip[]): Tip[] {
  const now = new Date();
  return tips.filter((t) => isSameMonth(new Date(t.at), now));
}

export function pendingPayout(tips: Tip[]): number {
  return sum(tips.filter((t) => t.status === "精算待ち"));
}

/** 直近 n 日の日次合計(チャート用) */
export function dailySeries(tips: Tip[], days = 14) {
  const out: { day: string; label: string; total: number; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const dayTips = tips.filter((t) => isSameDay(new Date(t.at), d));
    out.push({
      day: format(d, "yyyy-MM-dd"),
      label: format(d, "M/d"),
      total: sum(dayTips),
      count: dayTips.length,
    });
  }
  return out;
}

/** スタッフ別の集計(件数・合計)。降順。 */
export function byStaff(tips: Tip[], staff: Staff[]) {
  return staff
    .map((s) => {
      const mine = tips.filter((t) => t.staffId === s.id);
      return { staff: s, total: sum(mine), count: mine.length };
    })
    .sort((a, b) => b.total - a.total);
}

/** 決済手段の内訳 */
export function byMethod(tips: Tip[]) {
  const map = new Map<PayMethod, number>();
  for (const t of tips) map.set(t.method, (map.get(t.method) ?? 0) + t.amount);
  return [...map.entries()].map(([method, total]) => ({ method, total })).sort((a, b) => b.total - a.total);
}
