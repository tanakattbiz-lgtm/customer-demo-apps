import { formatDistanceToNowStrict, format } from "date-fns";
import { ja } from "date-fns/locale";

export const yen = (n?: number | null): string =>
  n == null ? "—" : "¥" + Math.round(n).toLocaleString("ja-JP");

/** 「3時間前」のような相対表記 */
export const relTime = (iso: string): string =>
  formatDistanceToNowStrict(new Date(iso), { addSuffix: true, locale: ja });

export const fmtDateTime = (iso: string): string =>
  format(new Date(iso), "M月d日(E) HH:mm", { locale: ja });

export const fmtDate = (iso: string): string =>
  format(new Date(iso), "M/d", { locale: ja });

export const fmtTime = (iso: string): string =>
  format(new Date(iso), "HH:mm", { locale: ja });
