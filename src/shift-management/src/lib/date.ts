import { differenceInCalendarDays } from "date-fns";

export const WEEK = ["日", "月", "火", "水", "木", "金", "土"];

/** ISO 文字列(YYYY-MM-DD)→「8/1」 */
export function fmtMd(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}`;
}

/** 曜日ラベル */
export function weekdayLabel(iso: string): string {
  return WEEK[dayOfWeek(iso)];
}

export function dayOfWeek(iso: string): number {
  return new Date(iso + "T00:00:00").getDay();
}

export function isSat(iso: string): boolean {
  return dayOfWeek(iso) === 6;
}
export function isSun(iso: string): boolean {
  return dayOfWeek(iso) === 0;
}
export function isWeekend(iso: string): boolean {
  const g = dayOfWeek(iso);
  return g === 0 || g === 6;
}

/** 締切までの残り日数(今日基準)。負なら過ぎている */
export function daysUntil(iso: string): number {
  return differenceInCalendarDays(new Date(iso + "T00:00:00"), startOfToday());
}

function startOfToday(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

/** ISO 日時 → 「7/14 16:48」 */
export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}/${dd} ${hh}:${mi}`;
}

/** 「◯日前 / ◯時間前」 */
export function fromNow(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "たった今";
  if (min < 60) return `${min}分前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}時間前`;
  const day = Math.floor(hr / 24);
  return `${day}日前`;
}

export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
