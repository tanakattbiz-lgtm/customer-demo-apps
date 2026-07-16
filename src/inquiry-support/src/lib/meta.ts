import { formatDistanceToNowStrict } from "date-fns";
import { ja } from "date-fns/locale";
import type { Category, Priority, Sentiment, Status, Channel } from "../data/seed";
import type { Tone } from "../components/ui";

export const categoryTone: Record<Category, Tone> = {
  見積もり依頼: "blue",
  サービスの質問: "sky",
  "予約・日程": "violet",
  "要望・クレーム": "red",
  "手続き・書類": "amber",
  その他: "gray",
};

export const priorityTone: Record<Priority, Tone> = {
  高: "red",
  中: "amber",
  低: "gray",
};

export const statusTone: Record<Status, Tone> = {
  未対応: "amber",
  対応中: "blue",
  返信済み: "green",
};

export const sentimentTone: Record<Sentiment, Tone> = {
  好意的: "green",
  ふつう: "gray",
  要注意: "red",
};

export const channelLabel: Record<Channel, string> = {
  メール: "メール",
  Webフォーム: "Webフォーム",
  チャット: "チャット",
  電話メモ: "電話メモ",
};

export function relTime(iso: string): string {
  return formatDistanceToNowStrict(new Date(iso), { addSuffix: true, locale: ja });
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
