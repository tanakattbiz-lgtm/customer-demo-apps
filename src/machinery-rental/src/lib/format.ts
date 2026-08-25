import { differenceInCalendarDays, format, isToday, isTomorrow } from "date-fns";
import { ja } from "date-fns/locale";

export const yen = (n: number) => `¥${Math.round(n).toLocaleString("ja-JP")}`;

export const ymd = (d: Date | string) => format(new Date(d), "yyyy/MM/dd");

export const md = (d: Date | string) => format(new Date(d), "M月d日(E)", { locale: ja });

export const ymdhm = (d: Date | string) => format(new Date(d), "yyyy/MM/dd HH:mm");

export function relativeDay(d: Date | string): string {
  const date = new Date(d);
  if (isToday(date)) return "本日";
  if (isTomorrow(date)) return "明日";
  const diff = differenceInCalendarDays(date, new Date());
  if (diff > 0 && diff <= 14) return `${diff}日後`;
  if (diff < 0 && diff >= -14) return `${-diff}日前`;
  return ymd(date);
}

/**
 * レンタル料金の計算ロジック(デモ用)
 * 1〜2日: 日極 / 3〜6日: 日極 × 0.9 / 7〜29日: 日極 × 0.8 / 30日〜: 月極ベース
 */
export function calcBaseFee(dayRate: number, monthRate: number, days: number): number {
  if (days <= 0) return 0;
  if (days >= 30) {
    const months = Math.floor(days / 30);
    const rest = days % 30;
    return months * monthRate + rest * dayRate * 0.8;
  }
  if (days >= 7) return days * dayRate * 0.8;
  if (days >= 3) return days * dayRate * 0.9;
  return days * dayRate;
}

export function discountLabel(days: number): string | null {
  if (days >= 30) return "月極レート適用";
  if (days >= 7) return "長期割 20% OFF";
  if (days >= 3) return "連続割 10% OFF";
  return null;
}
