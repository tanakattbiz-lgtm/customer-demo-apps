import { format, formatDistanceToNowStrict, differenceInCalendarDays } from "date-fns";
import { ja } from "date-fns/locale";

export const fmtDate = (iso: string) => format(new Date(iso), "yyyy/MM/dd", { locale: ja });

export const fmtDateShort = (iso: string) => format(new Date(iso), "M/d(E)", { locale: ja });

export const fmtDateTime = (iso: string) => format(new Date(iso), "yyyy/MM/dd HH:mm", { locale: ja });

export const fmtTime = (iso: string) => format(new Date(iso), "HH:mm", { locale: ja });

export const fromNow = (iso: string) => formatDistanceToNowStrict(new Date(iso), { addSuffix: true, locale: ja });

/** 納期までの残日数(過去なら負) */
export const daysUntil = (iso: string) => differenceInCalendarDays(new Date(iso), new Date());

/** 拡張子でファイルの種別を判定 */
export function fileKind(name: string): "pdf" | "dxf" | "other" {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".dxf")) return "dxf";
  return "other";
}
