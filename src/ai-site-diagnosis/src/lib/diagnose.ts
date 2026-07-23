// 入力URLから疑似的に診断結果を生成する。
// URL文字列をシードにした決定論的な乱数を使うので、同じURLなら毎回同じ結果になる（＝本物っぽさ）。
import {
  CATEGORIES,
  CATEGORY_MAP,
  type ActionTemplate,
  type CategoryKey,
} from "../data/seed";

export type Rank = "A" | "B" | "C" | "D";

export interface CategoryResult {
  key: CategoryKey;
  score: number;
  /** そのカテゴリの所見（1〜2件） */
  findings: string[];
  positive: boolean;
}

export interface Suggestion extends ActionTemplate {
  key: CategoryKey;
  priority: "高" | "中" | "低";
}

export interface Diagnosis {
  id: string;
  url: string;
  host: string;
  createdAt: number;
  total: number;
  rank: Rank;
  categories: CategoryResult[];
  suggestions: Suggestion[];
  /** レーダー/バー用の整形済みデータ */
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rankOf(total: number): Rank {
  if (total >= 85) return "A";
  if (total >= 70) return "B";
  if (total >= 55) return "C";
  return "D";
}

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return "https://" + trimmed;
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0];
  }
}

/** URLの妥当性チェック（デモ用の緩めの判定） */
export function isValidUrl(input: string): boolean {
  const url = normalizeUrl(input);
  try {
    const u = new URL(url);
    return !!u.hostname && u.hostname.includes(".");
  } catch {
    return false;
  }
}

export function diagnose(rawUrl: string, idSeed?: string): Diagnosis {
  const url = normalizeUrl(rawUrl);
  const host = hostOf(url);
  const seed = hashStr(host);
  const rand = mulberry32(seed);

  const categories: CategoryResult[] = CATEGORIES.map((cat) => {
    // 30〜96 の範囲でカテゴリごとにばらつかせる
    const base = 30 + Math.floor(rand() * 67);
    const score = Math.max(28, Math.min(97, base));
    const positive = score >= 70;
    const pool = positive ? cat.strong : cat.weak;
    const count = positive ? 1 : rand() > 0.5 ? 2 : 1;
    const findings: string[] = [];
    const used = new Set<number>();
    for (let i = 0; i < count && used.size < pool.length; i++) {
      let idx = Math.floor(rand() * pool.length);
      while (used.has(idx)) idx = (idx + 1) % pool.length;
      used.add(idx);
      findings.push(pool[idx]);
    }
    return { key: cat.key, score, findings, positive };
  });

  const weightSum = CATEGORIES.reduce((s, c) => s + c.weight, 0);
  const total = Math.round(
    categories.reduce((s, c) => s + c.score * CATEGORY_MAP[c.key].weight, 0) /
      weightSum,
  );

  // 改善提案：スコアの低いカテゴリから、想定インパクトの大きい順に最大4件
  const suggestions: Suggestion[] = categories
    .filter((c) => c.score < 78)
    .sort((a, b) => a.score - b.score)
    .flatMap((c) =>
      CATEGORY_MAP[c.key].actions.map((a) => ({
        ...a,
        key: c.key,
        priority: priorityOf(c.score),
      })),
    )
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 4);

  return {
    id: idSeed ?? `${seed.toString(36)}-${Math.floor(rand() * 1e6).toString(36)}`,
    url,
    host,
    createdAt: Date.now(),
    total,
    rank: rankOf(total),
    categories,
    suggestions,
  };
}

function priorityOf(score: number): Suggestion["priority"] {
  if (score < 50) return "高";
  if (score < 65) return "中";
  return "低";
}
