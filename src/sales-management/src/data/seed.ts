import { subDays, format, isWeekend } from "date-fns";

export type Role = "管理者" | "社員";

export interface Rep {
  id: string;
  name: string;
  role: Role;
  team: string;
  color: string;
  /** 月間 受注金額 目標(円) */
  monthlyTarget: number;
}

export interface Report {
  id: string;
  repId: string;
  /** yyyy-MM-dd */
  date: string;
  visits: number; // 訪問件数
  meetings: number; // 商談件数
  proposals: number; // 提案件数
  deals: number; // 受注件数
  amount: number; // 受注金額(円)
  client: string; // 主要商談先
  note: string; // 所感・日報本文
  createdAt: string;
}

export interface AppData {
  reps: Rep[];
  reports: Report[];
}

/** ログイン直後の既定ユーザー(営業部長=管理者) */
export const CURRENT_USER_ID = "rep_admin";

const TEAM_A = "第一営業部";
const TEAM_B = "第二営業部";

const REPS: Rep[] = [
  { id: "rep_admin", name: "村上 健司", role: "管理者", team: "営業本部", color: "oklch(54% 0.19 270)", monthlyTarget: 0 },
  { id: "rep_sato", name: "佐藤 美咲", role: "社員", team: TEAM_A, color: "oklch(60% 0.15 20)", monthlyTarget: 4_000_000 },
  { id: "rep_takeda", name: "武田 亮太", role: "社員", team: TEAM_A, color: "oklch(58% 0.14 155)", monthlyTarget: 3_500_000 },
  { id: "rep_ito", name: "伊藤 里奈", role: "社員", team: TEAM_A, color: "oklch(62% 0.16 60)", monthlyTarget: 3_000_000 },
  { id: "rep_kimura", name: "木村 大輔", role: "社員", team: TEAM_B, color: "oklch(56% 0.16 320)", monthlyTarget: 4_500_000 },
  { id: "rep_hayashi", name: "林 彩花", role: "社員", team: TEAM_B, color: "oklch(60% 0.14 200)", monthlyTarget: 3_200_000 },
  { id: "rep_nakada", name: "中田 悠斗", role: "社員", team: TEAM_B, color: "oklch(55% 0.15 100)", monthlyTarget: 2_800_000 },
];

// 商談先のダミー(架空。発注元とは無関係の一般的な社名)
const CLIENTS = [
  "みらいフーズ株式会社",
  "青葉電機工業",
  "サンライズ物流",
  "株式会社ハートフルケア",
  "西日本テクノサービス",
  "グリーンリーフ商事",
  "東海プリント工業",
  "ときわ建設株式会社",
  "アルファ通信システム",
  "こもれびクリニック",
  "大和メディカル機器",
  "リノベ住販",
  "はやて運輸株式会社",
  "北斗自動車販売",
  "エクセル人材サービス",
];

const NOTES = [
  "既存顧客のフォロー訪問。増設案件の見込みあり。来週見積もりを提出予定。",
  "新規テレアポから初回訪問。担当者の反応は良好。次回は決裁者同席で商談。",
  "競合が価格提示済み。差別化ポイントを整理して再提案が必要。",
  "デモを実施。機能面は高評価だが導入時期は未定。定期的にフォローする。",
  "契約締結。導入スケジュールの調整に入る。上長へ共有済み。",
  "見積もり金額で調整中。あと一歩。決裁のタイミングを見極める。",
  "先方の予算取りが来期にずれ込む見込み。長期案件として管理する。",
  "紹介案件で初商談。ニーズが明確でスピード感あり。提案書を前倒しで作成。",
  "既存の保守契約更新の打診。追加要望のヒアリングを実施した。",
  "展示会で名刺交換した見込み客へ訪問。関心は高いが社内調整に時間がかかる。",
  "クレーム対応の訪問。誠実に対応し関係は改善。追加提案の余地あり。",
  "オンライン商談を実施。資料送付のみで終了。次アクションを明確化する。",
];

let idc = 100;
const genId = () => `rp_${(idc++).toString(36)}${Math.floor(Math.random() * 46656).toString(36)}`;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** 「今日」を基準に直近 ~45 日分の日報を各営業ごとに生成する。 */
export function buildSeed(): AppData {
  const reports: Report[] = [];
  const members = REPS.filter((r) => r.role === "社員");
  const today = new Date();

  for (let d = 44; d >= 0; d--) {
    const day = subDays(today, d);
    if (isWeekend(day)) continue; // 平日のみ
    const dateStr = format(day, "yyyy-MM-dd");

    for (const rep of members) {
      // 稼働率:だいたい8割の平日で日報あり
      if (Math.random() < 0.2) continue;

      const visits = randInt(2, 6);
      const meetings = Math.min(visits, randInt(1, 4));
      const proposals = Math.min(meetings, randInt(0, 2));
      const dealHit = Math.random() < 0.28 && proposals > 0;
      const deals = dealHit ? (Math.random() < 0.15 ? 2 : 1) : 0;
      const amount = deals > 0 ? deals * randInt(30, 300) * 10000 : 0;

      reports.push({
        id: genId(),
        repId: rep.id,
        date: dateStr,
        visits,
        meetings,
        proposals,
        deals,
        amount,
        client: pick(CLIENTS),
        note: pick(NOTES),
        createdAt: day.toISOString(),
      });
    }
  }

  // 新しい順に
  reports.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return { reps: REPS, reports };
}
