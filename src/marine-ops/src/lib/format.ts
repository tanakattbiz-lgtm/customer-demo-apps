import { format, formatDistanceToNowStrict } from "date-fns";
import { ja } from "date-fns/locale";

export const yen = (n: number) => "¥" + n.toLocaleString("ja-JP");

export const ymd = (iso: string) => format(new Date(iso), "M/d", { locale: ja });

export const ymdFull = (iso: string) =>
  format(new Date(iso), "yyyy年M月d日", { locale: ja });

export const md_hm = (iso: string) =>
  format(new Date(iso), "M/d HH:mm", { locale: ja });

export const hm = (iso: string) => format(new Date(iso), "HH:mm", { locale: ja });

export const fromNow = (iso: string) =>
  formatDistanceToNowStrict(new Date(iso), { locale: ja, addSuffix: true });
