import { formatDistanceToNowStrict } from "date-fns";
import { ja } from "date-fns/locale";

/** ISO 文字列を「◯分前」の相対表記に */
export function relTime(iso: string): string {
  return formatDistanceToNowStrict(new Date(iso), { addSuffix: true, locale: ja });
}

/** ISO 文字列を "HH:mm:ss" に */
export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** 金額を "1,234円" 表記に */
export function yen(n: number): string {
  return n.toLocaleString("ja-JP") + "円";
}

/** 馬体重増減の表示("+6" / "-4" / "±0") */
export function diffLabel(d: number): string {
  if (d === 0) return "±0";
  return (d > 0 ? "+" : "") + d;
}
