import { subHours, subDays } from "date-fns";

// ─────────────────────────────────────────────────────────────
//  型定義
//  ※ ブランド名はすべて架空(実在ブランドは使用しない)。
//     LINE 経由のオンライン査定依頼を管理するための業務システム。
// ─────────────────────────────────────────────────────────────

export type Status = "未対応" | "査定中" | "回答済";
export const STATUSES: Status[] = ["未対応", "査定中", "回答済"];

export type Category = "バッグ" | "財布・小物" | "時計" | "貴金属(金)" | "ジュエリー";
export const CATEGORIES: Category[] = ["バッグ", "財布・小物", "時計", "貴金属(金)", "ジュエリー"];

/** 友だち追加の流入経路(Lステップの導線分析用) */
export type Channel = "チラシ" | "WEB広告" | "Instagram" | "店頭QR" | "紹介" | "自然検索";
export const CHANNELS: Channel[] = ["チラシ", "WEB広告", "Instagram", "店頭QR", "紹介", "自然検索"];

export type Method = "宅配査定" | "店頭査定" | "出張査定";
export type Rank = "S" | "A" | "B" | "C";

export interface Message {
  id: string;
  from: "customer" | "staff" | "system";
  text: string;
  at: string;
}

export interface AppraisalRequest {
  id: string;
  code: string; // AP-2026-0001
  customerName: string;
  lineName: string;
  category: Category;
  brand: string; // 架空ブランド or 素材
  itemName: string;
  rank: Rank;
  conditionNote: string;
  photos: number; // 受付画像の枚数
  channel: Channel;
  method: Method;
  tags: string[];
  status: Status;
  quote?: number; // 査定回答額(担当者が手入力。自動算出はしない)
  assigneeId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  color: string;
}

export interface AppData {
  requests: AppraisalRequest[];
  staff: Staff[];
}

export const CURRENT_USER_ID = "st1";

export const STAFF: Staff[] = [
  { id: "st1", name: "佐々木 玲奈", role: "査定リーダー", color: "oklch(52% 0.12 155)" },
  { id: "st2", name: "田村 亮太", role: "査定担当", color: "oklch(55% 0.13 250)" },
  { id: "st3", name: "橋本 美咲", role: "査定担当", color: "oklch(58% 0.14 30)" },
  { id: "st4", name: "小林 大輔", role: "貴金属担当", color: "oklch(56% 0.12 90)" },
];

// ─────────────────────────────────────────────────────────────
//  サンプル生成用の素材
// ─────────────────────────────────────────────────────────────

const CUSTOMERS = [
  "山田 佳奈", "鈴木 健一", "高橋 美穂", "伊藤 拓也", "渡辺 さゆり",
  "中村 隆", "小林 恵子", "加藤 悠斗", "吉田 真理", "松本 直樹",
  "井上 沙織", "木村 遼", "林 由美", "清水 大地", "森 かおり",
  "池田 翔太", "橋本 綾", "阿部 誠", "石川 千夏", "山口 智也",
  "岡田 麻衣", "藤田 竜也", "後藤 春香", "村上 和彦", "近藤 里奈",
  "斎藤 涼", "遠藤 千尋",
];

// LINE 表示名(ニックネーム風)
const LINE_NAMES = [
  "kana🌸", "けんいち", "みほ", "taku_0428", "sayuri.w",
  "たかし", "keiko", "yuto", "まりん", "Naoki",
  "saori__", "ryo", "yumi_h", "だいち", "kaori",
  "SHOTA", "あや", "makoto", "chinatsu", "tomo_y",
  "mai", "tatsu", "haru", "kazu", "rina.k",
  "りょう", "chihiro",
];

// バッグ・革小物・時計・ジュエリー系の架空ブランド
const BRANDS_LUX = ["NOIR PARIS", "MAISON RÊVE", "V. ATELIER", "GRANDE MILANO", "CIEL", "LUMIÈRE", "AUBE"];
const BRANDS_WATCH = ["REGAL CHRONO", "MERIDIAN", "AUBE", "HÉLM"];

const ITEMS: Record<Category, string[]> = {
  バッグ: ["チェーンショルダーバッグ", "トートバッグ", "ハンドバッグ", "ボストンバッグ", "2WAYバッグ"],
  "財布・小物": ["長財布", "二つ折り財布", "カードケース", "キーケース", "コインケース"],
  時計: ["自動巻き腕時計", "クロノグラフ", "デイト 3針", "スケルトン腕時計"],
  "貴金属(金)": ["K18 ネックレス", "K24 インゴット 50g", "純金コイン", "K18 リング", "喜平ネックレス K18"],
  ジュエリー: ["ダイヤモンドリング 0.5ct", "パールネックレス", "ダイヤピアス", "テニスブレスレット"],
};

const CONDITIONS = [
  "使用感少なめ。角スレ軽微。付属品(箱・保存袋)あり。",
  "未使用に近い。ギャランティカードあり。",
  "内側に汚れあり。金具に小キズ。",
  "全体的に使用感あり。ベルト部分に劣化。",
  "美品。目立つダメージなし。",
  "型崩れあり。付属品なし。",
  "刻印確認済み。重量実測あり。",
];

const TAG_POOL = ["新規", "リピーター", "高額見込", "要フォロー", "宅配キット送付済", "VIP", "相見積り中"];

const RANKS: Rank[] = ["S", "A", "B", "C"];
const METHODS: Method[] = ["宅配査定", "店頭査定", "出張査定"];

// 決め打ちのステータス分布(未対応が程よく残るように)
const STATUS_PLAN: Status[] = [
  "未対応", "未対応", "未対応", "未対応", "未対応", "未対応",
  "査定中", "査定中", "査定中", "査定中", "査定中",
  "回答済", "回答済", "回答済", "回答済", "回答済", "回答済", "回答済", "回答済",
  "回答済", "回答済", "査定中", "未対応", "回答済", "未対応", "査定中", "回答済",
];

let idc = 100;
const nid = (p: string) => `${p}${(idc++).toString(36)}`;

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

// 疑似乱数(seed 固定でビルドごとに安定させる)
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function brandFor(cat: Category, r: number): string {
  if (cat === "貴金属(金)") return "地金・金製品";
  if (cat === "時計") return BRANDS_WATCH[Math.floor(r * BRANDS_WATCH.length)];
  return BRANDS_LUX[Math.floor(r * BRANDS_LUX.length)];
}

function quoteFor(cat: Category, rank: Rank, r: number): number {
  const base: Record<Category, number> = {
    バッグ: 180000,
    "財布・小物": 42000,
    時計: 520000,
    "貴金属(金)": 380000,
    ジュエリー: 260000,
  };
  const rk: Record<Rank, number> = { S: 1.4, A: 1.1, B: 0.8, C: 0.55 };
  const raw = base[cat] * rk[rank] * (0.7 + r * 0.7);
  // 千円単位に丸め
  return Math.round(raw / 1000) * 1000;
}

function buildMessages(
  now: Date,
  createdHrsAgo: number,
  status: Status,
  brand: string,
  itemName: string,
  quote: number | undefined,
  staffName: string,
): Message[] {
  const t0 = subHours(now, createdHrsAgo);
  const msgs: Message[] = [
    {
      id: nid("m"),
      from: "system",
      text: "オンライン査定フォームの回答を受け付けました。",
      at: t0.toISOString(),
    },
    {
      id: nid("m"),
      from: "customer",
      text: `${brand}の${itemName}を査定してほしいです。写真を送ります📷`,
      at: subHours(now, createdHrsAgo - 0.05).toISOString(),
    },
  ];
  if (status === "査定中" || status === "回答済") {
    msgs.push({
      id: nid("m"),
      from: "staff",
      text: `${staffName}です。査定を承りました。写真を確認のうえ、金額をご案内いたします。少々お待ちください。`,
      at: subHours(now, Math.max(0.4, createdHrsAgo - 1.5)).toISOString(),
    });
  }
  if (status === "回答済" && quote != null) {
    msgs.push({
      id: nid("m"),
      from: "staff",
      text: `査定額は ¥${quote.toLocaleString("ja-JP")} でございます。ご検討のうえ、宅配キットの送付をご希望でしたらお知らせください。`,
      at: subHours(now, Math.max(0.2, createdHrsAgo - 3)).toISOString(),
    });
  }
  return msgs;
}

export function buildSeed(): AppData {
  const now = new Date();
  const requests: AppraisalRequest[] = [];

  for (let i = 0; i < STATUS_PLAN.length; i++) {
    const rand = rng(i * 131 + 7);
    const cat = pick(CATEGORIES, i * 3 + (i % 5));
    const status = STATUS_PLAN[i];
    const rank = pick(RANKS, i + (i % 3));
    const brand = brandFor(cat, rand());
    const itemName = pick(ITEMS[cat], i + Math.floor(rand() * 4));
    const createdHrsAgo =
      status === "未対応" ? 1 + rand() * 20 : status === "査定中" ? 10 + rand() * 40 : 24 + rand() * 240;

    const quote = status === "回答済" ? quoteFor(cat, rank, rand()) : undefined;
    const assignee = status === "未対応" ? "" : STAFF[(i % (STAFF.length - 1)) + 1].id;
    const assigneeName = STAFF.find((s) => s.id === assignee)?.name ?? "担当";

    const tags: string[] = [];
    tags.push(i % 4 === 0 ? "リピーター" : "新規");
    if ((quote ?? 0) > 400000 || cat === "時計") tags.push("高額見込");
    if (i % 6 === 0) tags.push("要フォロー");
    if (i % 7 === 0) tags.push("VIP");
    if (pick(METHODS, i) === "宅配査定" && status !== "未対応") tags.push("宅配キット送付済");

    const createdAt = subHours(now, createdHrsAgo).toISOString();
    const updatedAt =
      status === "未対応"
        ? createdAt
        : subHours(now, Math.max(0.2, createdHrsAgo - (status === "回答済" ? 3 : 1))).toISOString();

    requests.push({
      id: nid("req"),
      code: `AP-2026-${String(1042 - i).padStart(4, "0")}`,
      customerName: pick(CUSTOMERS, i),
      lineName: pick(LINE_NAMES, i),
      category: cat,
      brand,
      itemName,
      rank,
      conditionNote: pick(CONDITIONS, i + (i % 3)),
      photos: 2 + Math.floor(rand() * 5),
      channel: pick(CHANNELS, i + Math.floor(rand() * 6)),
      method: pick(METHODS, i),
      tags,
      status,
      quote,
      assigneeId: assignee,
      messages: buildMessages(now, createdHrsAgo, status, brand, itemName, quote, assigneeName),
      createdAt,
      updatedAt,
    });
  }

  // 作成日時の新しい順
  requests.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return { requests, staff: STAFF };
}

// 疑似の「新規流入」用テンプレ(ライブ受付シミュレーション)
export function makeIncoming(now = new Date()): AppraisalRequest {
  const r = rng(Math.floor(now.getTime() / 1000) % 100000);
  const cat = pick(CATEGORIES, Math.floor(r() * 5));
  const rank = pick(RANKS, Math.floor(r() * 4));
  const brand = brandFor(cat, r());
  const itemName = pick(ITEMS[cat], Math.floor(r() * 5));
  const idx = Math.floor(r() * CUSTOMERS.length);
  return {
    id: nid("req"),
    code: `AP-2026-${String(1043 + Math.floor(r() * 40)).padStart(4, "0")}`,
    customerName: pick(CUSTOMERS, idx),
    lineName: pick(LINE_NAMES, idx),
    category: cat,
    brand,
    itemName,
    rank,
    conditionNote: pick(CONDITIONS, Math.floor(r() * CONDITIONS.length)),
    photos: 2 + Math.floor(r() * 5),
    channel: pick(CHANNELS, Math.floor(r() * CHANNELS.length)),
    method: pick(METHODS, Math.floor(r() * 3)),
    tags: ["新規"],
    status: "未対応",
    assigneeId: "",
    messages: buildMessages(now, 0.05, "未対応", brand, itemName, undefined, ""),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export { TAG_POOL };
