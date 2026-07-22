import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { ja } from "date-fns/locale";

/** 金額を ¥1,200 形式に */
export function yen(n: number): string {
  return "¥" + Math.round(n).toLocaleString("ja-JP");
}

/** 日時を「今日 / 昨日 / M月d日」+ 時刻で */
export function whenLabel(iso: string): string {
  const d = new Date(iso);
  const hm = format(d, "HH:mm");
  if (isToday(d)) return `今日 ${hm}`;
  if (isYesterday(d)) return `昨日 ${hm}`;
  return format(d, "M月d日 HH:mm", { locale: ja });
}

/** 「3分前」形式 */
export function ago(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ja });
}
