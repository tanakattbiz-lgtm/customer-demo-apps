import { addMonths, differenceInCalendarDays, format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

// ---------- 月キー(yyyy-MM) ----------
export const monthKey = (d: Date) => format(d, "yyyy-MM");
export const thisMonth = () => monthKey(new Date());
export const keyToDate = (k: string) => parseISO(k + "-01");
export const addMonthKey = (k: string, n: number) => monthKey(addMonths(keyToDate(k), n));
export const monthsBetween = (a: string, b: string) => {
  const [ay, am] = a.split("-").map(Number);
  const [by, bm] = b.split("-").map(Number);
  return (by - ay) * 12 + (bm - am) + 1;
};
export const monthRange = (from: string, count: number) =>
  Array.from({ length: count }, (_, i) => addMonthKey(from, i));
export const fmtMonth = (k: string) => {
  const [y, m] = k.split("-");
  return `${y}年${Number(m)}月`;
};
export const fmtMonthShort = (k: string) => {
  const [y, m] = k.split("-");
  return `${y.slice(2)}/${m}`;
};
export const fmtPeriod = (a: string, b: string) =>
  `${fmtMonth(a)} 〜 ${fmtMonth(b)}(${monthsBetween(a, b)}ヶ月)`;

// ---------- 日付 ----------
export const todayISO = () => format(new Date(), "yyyy-MM-dd");
export const fmtDate = (iso: string) => format(parseISO(iso), "yyyy/MM/dd");
export const fmtDateJa = (iso: string) => format(parseISO(iso), "M月d日(E)", { locale: ja });
export const fmtDateTime = (iso: string) => format(parseISO(iso), "yyyy/MM/dd HH:mm");
export const daysFromToday = (iso: string) =>
  differenceInCalendarDays(parseISO(iso), new Date());

export function relDay(iso: string) {
  const d = daysFromToday(iso);
  if (d === 0) return "今日";
  if (d === 1) return "明日";
  if (d === -1) return "昨日";
  if (d < 0) return `${-d}日超過`;
  return `${d}日後`;
}

// ---------- 金額 ----------
export const yen = (n: number) => "¥" + Math.round(n).toLocaleString("ja-JP");
export const man = (n: number) => {
  const v = n / 10000;
  return (v >= 100 ? Math.round(v).toLocaleString("ja-JP") : v.toFixed(1)) + "万円";
};
export const oku = (n: number) => (n / 100000000).toFixed(2) + "億円";
export const num = (n: number) => Math.round(n).toLocaleString("ja-JP");
export const pct = (n: number, d = 1) => n.toFixed(d) + "%";
