import { addDays, subDays, subHours } from "date-fns";

/* ------------------------------------------------------------------
 * 業務効率化ツール（サンプル構成）のダミーデータ
 * 発注元の名称は伏字（株式会社○○）。ここに入るのは「システム内のサンプルデータ」。
 * 実在する企業・人物は使用しない。
 * ---------------------------------------------------------------- */

export type Status = "todo" | "doing" | "review" | "done" | "hold";
export type Priority = "high" | "normal" | "low";

export const STATUS_LABEL: Record<Status, string> = {
  todo: "未着手",
  doing: "対応中",
  review: "確認待ち",
  done: "完了",
  hold: "保留",
};

export const STATUS_TONE: Record<Status, "gray" | "blue" | "amber" | "green" | "red"> = {
  todo: "gray",
  doing: "blue",
  review: "amber",
  done: "green",
  hold: "red",
};

/** 業務フローの順序（ステータスの進行はこの順） */
export const STATUS_FLOW: Status[] = ["todo", "doing", "review", "done"];

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: "高",
  normal: "中",
  low: "低",
};

export const CATEGORIES = [
  "見積作成",
  "受発注処理",
  "請求・入金処理",
  "データ入力・集計",
  "問い合わせ対応",
  "資料・帳票作成",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const DEPARTMENTS = [
  "営業部",
  "製造部",
  "購買部",
  "総務部",
  "カスタマーサポート",
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export type Staff = {
  id: string;
  name: string;
  dept: Department;
  color: string;
};

export const STAFF: Staff[] = [
  { id: "u1", name: "藤井 奈緒", dept: "営業部", color: "oklch(51% 0.16 264)" },
  { id: "u2", name: "大槻 涼平", dept: "購買部", color: "oklch(52% 0.14 195)" },
  { id: "u3", name: "西尾 千晶", dept: "総務部", color: "oklch(54% 0.15 155)" },
  { id: "u4", name: "宮下 拓真", dept: "製造部", color: "oklch(55% 0.14 60)" },
  { id: "u5", name: "堀内 美咲", dept: "カスタマーサポート", color: "oklch(52% 0.16 20)" },
  { id: "u6", name: "長谷川 亮", dept: "営業部", color: "oklch(48% 0.15 300)" },
];

export type HistoryEntry = {
  at: string;
  who: string;
  text: string;
};

export type Job = {
  id: string;
  code: string;
  title: string;
  category: Category;
  requester: string;
  requesterDept: Department;
  assigneeId: string | null;
  priority: Priority;
  status: Status;
  dueDate: string; // ISO (yyyy-MM-dd)
  createdAt: string; // ISO
  estimateHours: number;
  actualHours: number;
  amount: number; // 円（見積・請求金額。0 は金額なし業務）
  note: string;
  history: HistoryEntry[];
};

/** タイトル・依頼元・金額感を手作りしたレコード種 */
type Spec = {
  title: string;
  category: Category;
  requester: string;
  requesterDept: Department;
  amount: number;
  est: number;
};

const SPECS: Spec[] = [
  { title: "北関東エリア 定期補充品の見積書作成", category: "見積作成", requester: "小野寺 健吾", requesterDept: "営業部", amount: 480000, est: 3 },
  { title: "梱包資材の追加発注（7月分）", category: "受発注処理", requester: "大槻 涼平", requesterDept: "購買部", amount: 128000, est: 1.5 },
  { title: "6月度 請求書の一括発行と送付", category: "請求・入金処理", requester: "西尾 千晶", requesterDept: "総務部", amount: 0, est: 5 },
  { title: "受注実績の月次集計（部門別）", category: "データ入力・集計", requester: "長谷川 亮", requesterDept: "営業部", amount: 0, est: 4 },
  { title: "納期遅延に関する問い合わせ一次回答", category: "問い合わせ対応", requester: "堀内 美咲", requesterDept: "カスタマーサポート", amount: 0, est: 1 },
  { title: "新規取引先向け 会社案内資料の改訂", category: "資料・帳票作成", requester: "藤井 奈緒", requesterDept: "営業部", amount: 0, est: 6 },
  { title: "工作機械オプション部品の見積作成", category: "見積作成", requester: "宮下 拓真", requesterDept: "製造部", amount: 1240000, est: 4 },
  { title: "旧型モデル在庫の引当と受注登録", category: "受発注処理", requester: "小野寺 健吾", requesterDept: "営業部", amount: 356000, est: 2 },
  { title: "入金消込（振込明細との突合）", category: "請求・入金処理", requester: "西尾 千晶", requesterDept: "総務部", amount: 0, est: 3.5 },
  { title: "顧客マスタの重複レコード整理", category: "データ入力・集計", requester: "長谷川 亮", requesterDept: "営業部", amount: 0, est: 8 },
  { title: "取扱説明書の記載内容に関する照会", category: "問い合わせ対応", requester: "堀内 美咲", requesterDept: "カスタマーサポート", amount: 0, est: 1.5 },
  { title: "四半期 生産計画レポートの作成", category: "資料・帳票作成", requester: "宮下 拓真", requesterDept: "製造部", amount: 0, est: 7 },
  { title: "長期保守契約（3年）の見積提示", category: "見積作成", requester: "藤井 奈緒", requesterDept: "営業部", amount: 2860000, est: 5 },
  { title: "切削工具の定期発注（8月納入分）", category: "受発注処理", requester: "大槻 涼平", requesterDept: "購買部", amount: 742000, est: 2 },
  { title: "請求金額の訂正と再発行対応", category: "請求・入金処理", requester: "堀内 美咲", requesterDept: "カスタマーサポート", amount: 96000, est: 2 },
  { title: "問い合わせ内容の分類タグ付け（前月分）", category: "データ入力・集計", requester: "堀内 美咲", requesterDept: "カスタマーサポート", amount: 0, est: 4 },
  { title: "返品受付フローに関する社内照会", category: "問い合わせ対応", requester: "西尾 千晶", requesterDept: "総務部", amount: 0, est: 1 },
  { title: "安全衛生講習の案内文書作成", category: "資料・帳票作成", requester: "西尾 千晶", requesterDept: "総務部", amount: 0, est: 2 },
  { title: "試作品評価用サンプルの見積依頼", category: "見積作成", requester: "宮下 拓真", requesterDept: "製造部", amount: 214000, est: 2.5 },
  { title: "取引先A社 追加ロットの受注処理", category: "受発注処理", requester: "長谷川 亮", requesterDept: "営業部", amount: 1085000, est: 3 },
  { title: "未入金先への支払案内リスト作成", category: "請求・入金処理", requester: "西尾 千晶", requesterDept: "総務部", amount: 0, est: 3 },
  { title: "出荷実績データの取り込みと検証", category: "データ入力・集計", requester: "宮下 拓真", requesterDept: "製造部", amount: 0, est: 5 },
  { title: "納品書再発行の依頼対応", category: "問い合わせ対応", requester: "堀内 美咲", requesterDept: "カスタマーサポート", amount: 0, est: 0.5 },
  { title: "展示会配布用 製品比較表の作成", category: "資料・帳票作成", requester: "藤井 奈緒", requesterDept: "営業部", amount: 0, est: 6 },
  { title: "消耗品パッケージの年間見積作成", category: "見積作成", requester: "大槻 涼平", requesterDept: "購買部", amount: 638000, est: 3 },
  { title: "検査治具の緊急発注", category: "受発注処理", requester: "宮下 拓真", requesterDept: "製造部", amount: 425000, est: 1 },
  { title: "経費精算データの月次取りまとめ", category: "請求・入金処理", requester: "西尾 千晶", requesterDept: "総務部", amount: 0, est: 4 },
  { title: "在庫棚卸結果の入力と差異抽出", category: "データ入力・集計", requester: "大槻 涼平", requesterDept: "購買部", amount: 0, est: 9 },
  { title: "見積有効期限に関する確認依頼", category: "問い合わせ対応", requester: "小野寺 健吾", requesterDept: "営業部", amount: 0, est: 0.5 },
  { title: "業務手順書（受発注編）の更新", category: "資料・帳票作成", requester: "大槻 涼平", requesterDept: "購買部", amount: 0, est: 8 },
];

/** 決定的な擬似乱数（デモを開くたびに並びが変わらないように） */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

const NOTES = [
  "先方の希望納期がタイトなため、前倒しで着手予定。",
  "前回と同条件で問題ないか、依頼元に確認済み。",
  "添付の仕様書に沿って処理する。差異があれば都度確認。",
  "月次の定例業務。テンプレートを流用して対応。",
  "",
  "",
];

export function buildSeed(): Job[] {
  const rand = rng(20260717);
  const now = new Date();

  // ステータスの分布（一覧が現実的に見えるよう、完了を多めに）
  const statusPlan: Status[] = [
    "todo", "todo", "todo", "todo", "todo",
    "doing", "doing", "doing", "doing", "doing", "doing",
    "review", "review", "review",
    "done", "done", "done", "done", "done", "done", "done", "done", "done",
    "hold", "hold",
    "doing", "todo", "done", "review", "done",
  ];
  const priorityPlan: Priority[] = [
    "high", "normal", "normal", "low", "normal", "high", "normal", "low",
    "normal", "normal", "high", "normal", "high", "normal", "normal", "low",
    "normal", "low", "normal", "high", "normal", "normal", "low", "normal",
    "normal", "high", "normal", "normal", "low", "normal",
  ];

  return SPECS.map((spec, i) => {
    const status = statusPlan[i];
    const priority = priorityPlan[i];

    // 作成日は過去 1〜40 日、期限は作成日から 3〜18 日後
    const createdDaysAgo = 1 + Math.floor(rand() * 40);
    const createdAt = subHours(subDays(now, createdDaysAgo), Math.floor(rand() * 8));
    const dueDate = addDays(createdAt, 3 + Math.floor(rand() * 16));

    // 未着手以外は担当者を割り当てる（未着手の一部は未割当＝運用のリアル）
    const assignee =
      status === "todo" && rand() < 0.6 ? null : STAFF[Math.floor(rand() * STAFF.length)];

    const ratio =
      status === "done" ? 0.85 + rand() * 0.45 : status === "todo" ? 0 : 0.2 + rand() * 0.5;
    const actualHours = Math.round(spec.est * ratio * 2) / 2;

    const history: HistoryEntry[] = [
      { at: createdAt.toISOString(), who: spec.requester, text: "案件を登録しました" },
    ];
    if (assignee) {
      history.push({
        at: addDays(createdAt, 1).toISOString(),
        who: "システム",
        text: `担当者を ${assignee.name} に割り当てました`,
      });
    }
    if (status !== "todo") {
      history.push({
        at: addDays(createdAt, 2).toISOString(),
        who: assignee?.name ?? "システム",
        text: `ステータスを「${STATUS_LABEL[status]}」に変更しました`,
      });
    }

    return {
      id: `job-${String(i + 1).padStart(3, "0")}`,
      code: `REQ-2026-${String(i + 1).padStart(4, "0")}`,
      title: spec.title,
      category: spec.category,
      requester: spec.requester,
      requesterDept: spec.requesterDept,
      assigneeId: assignee?.id ?? null,
      priority,
      status,
      dueDate: iso(dueDate),
      createdAt: createdAt.toISOString(),
      estimateHours: spec.est,
      actualHours,
      amount: spec.amount,
      note: NOTES[Math.floor(rand() * NOTES.length)],
      history,
    };
  });
}
