/**
 * Googleカレンダーに予定を追加する画面を開くURL(Googleの公開の仕組み。ログイン中のカレンダーに追加される)。
 * 本番では、やることを自動でカレンダーに反映する形も選べる。
 */
import { addDays, format, parseISO } from "date-fns";

export function gcalUrl(title: string, date: string, details = ""): string {
  const d = parseISO(date);
  const dates = `${format(d, "yyyyMMdd")}/${format(addDays(d, 1), "yyyyMMdd")}`;
  const q = new URLSearchParams({ action: "TEMPLATE", text: title, dates, details });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}
