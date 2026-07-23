import { format } from "date-fns";
import { ja } from "date-fns/locale";

export const num = (n: number) => Math.round(n).toLocaleString("ja-JP");

/** 桁の大きい数を 1.2万 のように短縮 */
export const compact = (n: number) => {
  if (n >= 10000) return (n / 10000).toFixed(n >= 100000 ? 0 : 1) + "万";
  if (n >= 1000) return (n / 1000).toFixed(1) + "千";
  return num(n);
};

export const pct = (r: number, digits = 1) => `${(r * 100).toFixed(digits)}%`;

/** 増減率(0.068 → "+6.8%")。符号付き。 */
export const delta = (r: number, digits = 1) =>
  `${r >= 0 ? "+" : ""}${(r * 100).toFixed(digits)}%`;

export const md = (iso: string) => format(new Date(iso), "M/d", { locale: ja });

export const mdFull = (iso: string) =>
  format(new Date(iso), "yyyy年M月d日", { locale: ja });

export const md_hm = (iso: string) =>
  format(new Date(iso), "M/d HH:mm", { locale: ja });

export const wdmd = (iso: string) =>
  format(new Date(iso), "M/d(E)", { locale: ja });
