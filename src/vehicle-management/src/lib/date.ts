import { differenceInCalendarDays, format, parseISO } from "date-fns";

export function fmtDate(iso: string): string {
  return format(parseISO(iso), "yyyy/MM/dd");
}

export function fmtDateTime(iso: string): string {
  return format(new Date(iso), "yyyy/MM/dd HH:mm");
}

export function fmtTime(iso: string): string {
  return format(new Date(iso), "HH:mm");
}

/** 今日を基準にした残日数(車検アラート等に使用) */
export function daysUntil(iso: string): number {
  return differenceInCalendarDays(parseISO(iso), new Date());
}
