import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export const yen = (n: number) => "¥" + n.toLocaleString("ja-JP");

export const fromNow = (iso: string) =>
  formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ja });

export const dateLabel = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};
