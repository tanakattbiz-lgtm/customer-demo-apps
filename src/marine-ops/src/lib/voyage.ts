import { differenceInHours } from "date-fns";
import type { Voyage, CheckItem, ItemStatus } from "../data/seed";

/* 配船案件の状態を「確認事項の状況 + 期日」から導出する。
 * 遠隔モニタリングの肝 = この判定ロジック。 */

export type VoyageStatus = "順調" | "要注意" | "遅延" | "不備" | "完了";

export const STATUS_TONE: Record<VoyageStatus, string> = {
  順調: "green",
  要注意: "amber",
  遅延: "red",
  不備: "red",
  完了: "gray",
};

export const ITEM_TONE: Record<ItemStatus, string> = {
  未着手: "gray",
  進行中: "blue",
  完了: "green",
  不備: "red",
};

/** 完了率(0..100) */
export function progressPct(v: Voyage): number {
  const done = v.items.filter((i) => i.status === "完了").length;
  return Math.round((done / v.items.length) * 100);
}

/** 期日を過ぎているのに未完の確認事項 */
export function overdueItems(v: Voyage, at: Date = new Date()): CheckItem[] {
  return v.items.filter(
    (i) => i.status !== "完了" && new Date(i.dueAt).getTime() < at.getTime(),
  );
}

/** 24時間以内に期日を迎える未完の確認事項 */
export function dueSoonItems(v: Voyage, at: Date = new Date()): CheckItem[] {
  return v.items.filter((i) => {
    if (i.status === "完了" || i.status === "不備") return false;
    const h = differenceInHours(new Date(i.dueAt), at);
    return h >= 0 && h <= 24;
  });
}

export function voyageStatus(v: Voyage, at: Date = new Date()): VoyageStatus {
  if (v.items.every((i) => i.status === "完了")) return "完了";
  if (v.items.some((i) => i.status === "不備")) return "不備";
  if (overdueItems(v, at).length > 0) return "遅延";
  if (dueSoonItems(v, at).length > 0) return "要注意";
  return "順調";
}

/** 現在対応中の確認事項(進行中 → なければ不備 → なければ最初の未着手) */
export function currentItem(v: Voyage): CheckItem | undefined {
  return (
    v.items.find((i) => i.status === "進行中") ??
    v.items.find((i) => i.status === "不備") ??
    v.items.find((i) => i.status === "未着手")
  );
}

/** 案件が「管理者の注意を要する」か */
export function needsAttention(v: Voyage, at: Date = new Date()): boolean {
  const s = voyageStatus(v, at);
  return s === "不備" || s === "遅延" || s === "要注意";
}
