import type { KBArticle } from "../data/seed";

/**
 * RAG(検索拡張生成)のモック実装。
 *
 * 本番では「ユーザー質問をベクトル化 → ベクトルDBで近傍検索 → 上位文書を
 * コンテキストとして生成AIに渡し回答を生成」という流れになる。
 * ここではその体験を再現するため、キーワード一致による簡易スコアリングで
 * ナレッジベースから関連記事を検索し、回答文を組み立てている。
 */

export interface Retrieval {
  article: KBArticle;
  score: number;
}

function normalize(t: string): string {
  return t
    .toLowerCase()
    .replace(/[、。！？!?.,・「」（）()\s]/g, "")
    .trim();
}

/** ナレッジベースから関連記事を検索(公開記事のみ) */
export function retrieve(query: string, kb: KBArticle[], topK = 3): Retrieval[] {
  const q = normalize(query);
  if (!q) return [];

  const scored = kb
    .filter((a) => a.published)
    .map((a) => {
      let score = 0;
      // キーワード一致(部分一致含む)
      for (const kw of a.keywords) {
        const k = normalize(kw);
        if (!k) continue;
        if (q.includes(k)) score += k.length >= 2 ? 3 : 1;
      }
      // 代表質問との文字重なり(2-gram)
      const qn = normalize(a.question);
      for (let i = 0; i < qn.length - 1; i++) {
        const bg = qn.slice(i, i + 2);
        if (q.includes(bg)) score += 0.5;
      }
      return { article: a, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}

export interface Answer {
  text: string;
  sourceIds: string[];
  resolved: boolean;
  confidence: number; // 0〜1
}

const FALLBACK =
  "申し訳ありません、その内容については確かな回答をご用意できませんでした。\nご質問の言い回しを変えてお試しいただくか、担当者におつなぎすることもできます。";

/** 検索結果から回答を生成(モック) */
export function generateAnswer(retrievals: Retrieval[]): Answer {
  const top = retrievals[0];
  // 閾値未満なら「わからない」と正直に答える(ハルシネーション抑制の再現)
  if (!top || top.score < 2.5) {
    return { text: FALLBACK, sourceIds: [], resolved: false, confidence: top ? 0.3 : 0.1 };
  }

  const maxScore = top.score;
  const cited = retrievals.filter((r) => r.score >= Math.max(2.5, maxScore * 0.55));
  const confidence = Math.min(0.98, 0.55 + maxScore * 0.05);

  return {
    text: top.article.answer,
    sourceIds: cited.map((r) => r.article.id),
    resolved: true,
    confidence,
  };
}
