import { formatDistanceToNow, format } from "date-fns";
import { ja } from "date-fns/locale";
import type { Wage } from "../data/seed";

export function wageText(w: Wage): string {
  return w.type === "月給"
    ? `月給 ${w.min}万〜${w.max}万円`
    : `時給 ${w.min.toLocaleString()}〜${w.max.toLocaleString()}円`;
}

/** 並び替え用: おおよその月収(円)に正規化 */
export function wageSort(w: Wage): number {
  return w.type === "月給" ? w.min * 10000 : w.min * 160;
}

export function fromNow(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ja });
}

export function ymd(iso: string): string {
  return format(new Date(iso), "yyyy/MM/dd HH:mm");
}
