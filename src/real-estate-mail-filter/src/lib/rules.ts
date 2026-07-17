import type { Mail } from "../data/seed";

/** 条件設定シートの内容 */
export type Conditions = {
  prefs: string[];
  structures: string[];
  /** 築年数の上限(年) */
  maxAge: number;
  labelName: string;
  archiveUnmatched: boolean;
  notifyLine: boolean;
};

export const DEFAULT_CONDITIONS: Conditions = {
  prefs: ["愛知県"],
  structures: ["RC造"],
  maxAge: 30,
  labelName: "要確認",
  archiveUnmatched: true,
  notifyLine: true,
};

/** 条件1件ごとの照合結果 */
export type Check = {
  label: string;
  expected: string;
  actual: string;
  ok: boolean;
};

export type Action = "label" | "archive" | "skip";

export type Judgement = {
  /** 1段目: 物件情報メールか */
  isProperty: boolean;
  /** 2段目: 条件に合致したか(物件メールのみ意味を持つ) */
  matched: boolean;
  checks: Check[];
  action: Action;
  /** 画面に出す判定理由 */
  reason: string;
  /** 築年数 */
  age: number | null;
};

const THIS_YEAR = 2026;

/**
 * 2段構えの判定。
 * 1段目で「不動産物件情報メールか」を判定し、通常の業務メールはここで処理対象から外す(= skip)。
 * 2段目で物件メールのみを条件照合し、合致ならラベル付与、非合致ならアーカイブ。
 */
export function judge(mail: Mail, cond: Conditions): Judgement {
  if (!mail.isProperty || !mail.extracted) {
    return {
      isProperty: false,
      matched: false,
      checks: [],
      action: "skip",
      reason: `物件情報メールではないと判定(${mail.classifyReason})。ラベル付与・アーカイブは行いません。`,
      age: null,
    };
  }

  const ex = mail.extracted;
  const age = THIS_YEAR - ex.builtYear;

  const checks: Check[] = [
    {
      label: "所在地",
      expected: cond.prefs.length ? cond.prefs.join(" / ") : "(未設定)",
      actual: `${ex.pref}${ex.city}`,
      ok: cond.prefs.includes(ex.pref),
    },
    {
      label: "構造",
      expected: cond.structures.length ? cond.structures.join(" / ") : "(未設定)",
      actual: ex.structure,
      ok: cond.structures.includes(ex.structure),
    },
    {
      label: "築年数",
      expected: `築${cond.maxAge}年以内`,
      actual: `築${age}年(${ex.builtYear}年築)`,
      ok: age <= cond.maxAge,
    },
  ];

  const matched = checks.every((c) => c.ok);
  const ng = checks.filter((c) => !c.ok);

  const reason = matched
    ? `全条件に合致(${checks.map((c) => c.label).join("・")})。抽出元: ${ex.source}`
    : `${ng.map((c) => `${c.label}が条件外(${c.actual})`).join("、")}。抽出元: ${ex.source}`;

  return {
    isProperty: true,
    matched,
    checks,
    action: matched ? "label" : cond.archiveUnmatched ? "archive" : "skip",
    reason,
    age,
  };
}

/** LINE通知の本文(テンプレートは設定画面でプレビューできる) */
export function lineMessage(mail: Mail, cond: Conditions): string {
  const ex = mail.extracted;
  if (!ex) return "";
  const age = THIS_YEAR - ex.builtYear;
  return [
    `【要確認】条件に合致する物件が届きました`,
    ``,
    `${ex.pref}${ex.city}`,
    `${ex.structure} / 築${age}年(${ex.builtYear}年築)`,
    `${ex.price.toLocaleString()}万円 / 表面利回り ${ex.yieldPct.toFixed(2)}%`,
    ``,
    `差出人: ${mail.from}`,
    `件名: ${mail.subject}`,
    ``,
    `Gmailで「${cond.labelName}」ラベルをご確認ください。`,
  ].join("\n");
}

export function actionLabel(action: Action): string {
  if (action === "label") return "ラベル付与";
  if (action === "archive") return "アーカイブ";
  return "処理なし";
}
