import { formatDistanceToNowStrict, format } from "date-fns";
import { ja } from "date-fns/locale";

/** 「3分前」「2時間前」のような相対時刻 */
export function timeAgo(iso: string): string {
  const d = new Date(iso);
  const diffSec = (Date.now() - d.getTime()) / 1000;
  if (diffSec < 45) return "たった今";
  return formatDistanceToNowStrict(d, { locale: ja, addSuffix: true });
}

/** 「2026年7月」形式(プロフィールの登録日など) */
export function joinMonth(iso: string): string {
  return format(new Date(iso), "yyyy年M月", { locale: ja });
}

/** id から決定的にアバターのグラデーションを選ぶ */
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, oklch(72% 0.16 44), oklch(64% 0.19 22))",
  "linear-gradient(135deg, oklch(72% 0.15 190), oklch(62% 0.16 235))",
  "linear-gradient(135deg, oklch(74% 0.16 145), oklch(64% 0.17 175))",
  "linear-gradient(135deg, oklch(72% 0.16 300), oklch(62% 0.18 330))",
  "linear-gradient(135deg, oklch(76% 0.15 85), oklch(66% 0.17 55))",
  "linear-gradient(135deg, oklch(70% 0.15 260), oklch(62% 0.17 290))",
];

export function avatarGradient(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}

export function nf(n: number): string {
  return n.toLocaleString("ja-JP");
}
