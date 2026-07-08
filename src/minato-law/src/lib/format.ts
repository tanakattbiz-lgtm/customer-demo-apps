import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
} from "date-fns";
import { ja } from "date-fns/locale";

export function yen(n: number): string {
  return "¥" + n.toLocaleString("ja-JP");
}

export function shortDate(iso: string): string {
  return format(new Date(iso), "M月d日", { locale: ja });
}

export function fullDate(iso: string): string {
  return format(new Date(iso), "yyyy年M月d日(E)", { locale: ja });
}

export function dateTime(iso: string): string {
  return format(new Date(iso), "M/d HH:mm", { locale: ja });
}

export function relative(iso: string): string {
  const d = new Date(iso);
  return formatDistanceToNow(d, { addSuffix: true, locale: ja });
}

/** チャットの時刻ラベル */
export function chatTime(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "昨日 " + format(d, "HH:mm");
  return format(d, "M/d HH:mm");
}

export function initials(name: string): string {
  return name.trim().slice(0, 1);
}
