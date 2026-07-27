import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { ja } from "date-fns/locale";
import type { SessionStatus } from "../data/seed";
import type { Tone } from "../components/ui";

/** 相対的な時刻表示(◯分前 / 今日 HH:mm / 昨日 / M/d) */
export function relTime(iso: string): string {
  const d = new Date(iso);
  const diffMin = (Date.now() - d.getTime()) / 60000;
  if (diffMin < 60) return formatDistanceToNow(d, { locale: ja, addSuffix: true });
  if (isToday(d)) return `今日 ${format(d, "HH:mm")}`;
  if (isYesterday(d)) return `昨日 ${format(d, "HH:mm")}`;
  return format(d, "M/d HH:mm");
}

export function clock(iso: string): string {
  return format(new Date(iso), "HH:mm");
}

export function fullDate(iso: string): string {
  return format(new Date(iso), "yyyy/M/d HH:mm");
}

export function statusTone(s: SessionStatus): Tone {
  return s === "解決済み" ? "green" : s === "有人対応" ? "sky" : "amber";
}
