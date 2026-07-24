import { addDays, setHours, setMinutes, startOfDay, subDays, subHours } from "date-fns";

// ---------------------------------------------------------------------------
// 型定義
// ---------------------------------------------------------------------------
export type MenuId = "free30" | "online30" | "paid60";
export type ResStatus = "確定" | "来店済" | "キャンセル";
export type NotifType = "予約確定" | "リマインド" | "新規友だち" | "テスト送信" | "キャンセル";
export type NotifStatus = "成功" | "失敗";
export type CalendarProvider = "google" | "zoom" | "timerex";

export interface Menu {
  id: MenuId;
  name: string;
  durationMin: number;
  price: number; // 0 = 無料
  badge?: string;
  desc: string;
}

export interface Reservation {
  id: string;
  name: string;
  kana: string;
  menuId: MenuId;
  start: string; // ISO
  status: ResStatus;
  calendarSynced: boolean;
  reminderSent: boolean;
  isNew?: boolean;
  note?: string;
  createdAt: string;
}

export interface NotifLog {
  id: string;
  type: NotifType;
  to: string;
  channel: "LINEプッシュ" | "メール";
  status: NotifStatus;
  at: string;
  detail?: string;
}

export interface AppData {
  reservations: Reservation[];
  logs: NotifLog[];
}

// ---------------------------------------------------------------------------
// マスタ(予約メニュー)
// ---------------------------------------------------------------------------
export const MENUS: Menu[] = [
  {
    id: "free30",
    name: "30分無料相談",
    durationMin: 30,
    price: 0,
    badge: "登録3日間限定",
    desc: "はじめての方向け。お悩みやご希望をお気軽にご相談ください。",
  },
  {
    id: "online30",
    name: "オンライン相談(30分)",
    durationMin: 30,
    price: 0,
    badge: "ZOOM対応",
    desc: "ビデオ通話でご自宅から。URLは予約後に自動でお送りします。",
  },
  {
    id: "paid60",
    name: "じっくり個別相談(60分)",
    durationMin: 60,
    price: 5500,
    desc: "具体的なプランづくりまで。時間をかけてご相談いただけます。",
  },
];

export const menuById = (id: MenuId): Menu => MENUS.find((m) => m.id === id) ?? MENUS[0];

// 店舗の営業時間(30分刻み)
export const BUSINESS = { startHour: 10, endHour: 18, slotMin: 30 };

// ---------------------------------------------------------------------------
// ダミーデータ生成(「今日」基準の相対生成)
// ---------------------------------------------------------------------------
const iso = (dayOffset: number, hour: number, min: number): string =>
  setMinutes(setHours(startOfDay(addDays(new Date(), dayOffset)), hour), min).toISOString();

const NAMES: [string, string][] = [
  ["佐藤 美咲", "さとう みさき"],
  ["田中 健一", "たなか けんいち"],
  ["鈴木 陽子", "すずき ようこ"],
  ["高橋 大輔", "たかはし だいすけ"],
  ["渡辺 さくら", "わたなべ さくら"],
  ["伊藤 翔太", "いとう しょうた"],
  ["山本 真由美", "やまもと まゆみ"],
  ["中村 悠斗", "なかむら ゆうと"],
  ["小林 愛", "こばやし あい"],
  ["加藤 直樹", "かとう なおき"],
  ["吉田 香織", "よしだ かおり"],
  ["山田 拓也", "やまだ たくや"],
  ["松本 恵", "まつもと めぐみ"],
  ["井上 隆", "いのうえ たかし"],
  ["木村 千夏", "きむら ちなつ"],
  ["林 一郎", "はやし いちろう"],
  ["清水 麻衣", "しみず まい"],
  ["森 健太", "もり けんた"],
];

const NOTES = [
  "はじめての相談です。よろしくお願いします。",
  "SNS運用について相談したいです。",
  "スケジュールの調整をお願いしたいです。",
  "資料を事前に見ておきたいです。",
  "",
  "オンラインでお願いできると助かります。",
  "",
];

// 予約が入る時間帯(hour, min)
const SLOTS: [number, number][] = [
  [10, 0], [10, 30], [11, 0], [11, 30], [13, 0], [13, 30],
  [14, 0], [14, 30], [15, 0], [15, 30], [16, 0], [16, 30], [17, 0],
];

interface SeedRow {
  n: number; // 名前index
  day: number; // 日オフセット
  slot: number; // SLOTS index
  menu: MenuId;
  status: ResStatus;
  note: number;
}

// 過去(来店済/キャンセル) + 本日 + 未来(確定) をバランス良く配置
const ROWS: SeedRow[] = [
  { n: 0, day: -6, slot: 2, menu: "free30", status: "来店済", note: 0 },
  { n: 1, day: -5, slot: 6, menu: "paid60", status: "来店済", note: 1 },
  { n: 2, day: -4, slot: 1, menu: "free30", status: "来店済", note: 4 },
  { n: 3, day: -3, slot: 8, menu: "online30", status: "来店済", note: 5 },
  { n: 4, day: -3, slot: 3, menu: "free30", status: "キャンセル", note: 2 },
  { n: 5, day: -2, slot: 10, menu: "free30", status: "来店済", note: 4 },
  { n: 6, day: -1, slot: 4, menu: "paid60", status: "来店済", note: 3 },
  { n: 7, day: -1, slot: 9, menu: "free30", status: "来店済", note: 4 },
  // 本日
  { n: 8, day: 0, slot: 2, menu: "free30", status: "確定", note: 0 },
  { n: 9, day: 0, slot: 7, menu: "online30", status: "確定", note: 5 },
  { n: 10, day: 0, slot: 11, menu: "free30", status: "確定", note: 4 },
  // 未来
  { n: 11, day: 1, slot: 1, menu: "free30", status: "確定", note: 1 },
  { n: 12, day: 1, slot: 8, menu: "paid60", status: "確定", note: 3 },
  { n: 13, day: 2, slot: 5, menu: "online30", status: "確定", note: 5 },
  { n: 14, day: 2, slot: 12, menu: "free30", status: "確定", note: 4 },
  { n: 15, day: 3, slot: 0, menu: "free30", status: "確定", note: 0 },
  { n: 16, day: 4, slot: 6, menu: "paid60", status: "確定", note: 3 },
  { n: 17, day: 5, slot: 3, menu: "free30", status: "確定", note: 4 },
];

export function buildSeed(): AppData {
  const reservations: Reservation[] = ROWS.map((r, i) => {
    const [name, kana] = NAMES[r.n];
    const [h, m] = SLOTS[r.slot];
    const note = NOTES[r.note];
    return {
      id: `res_${i.toString(36)}${r.day}${r.slot}`,
      name,
      kana,
      menuId: r.menu,
      start: iso(r.day, h, m),
      status: r.status,
      calendarSynced: r.status !== "キャンセル",
      reminderSent: r.day <= 0 && r.status !== "キャンセル",
      note: note || undefined,
      createdAt: iso(r.day - 2, 9, 12),
    };
  });

  const logs: NotifLog[] = [
    // ── 修正前:プッシュ通知が届かなかった履歴(この案件の困りごと) ──
    {
      id: "log_e1",
      type: "予約確定",
      to: "渡辺 さくら",
      channel: "LINEプッシュ",
      status: "失敗",
      at: subDays(new Date(), 8).toISOString(),
      detail: "外部連携ツールのWebhook設定不備により配信エラー(修正済み)",
    },
    {
      id: "log_e2",
      type: "新規友だち",
      to: "松本 恵",
      channel: "LINEプッシュ",
      status: "失敗",
      at: subDays(new Date(), 8).toISOString(),
      detail: "アクセストークン期限切れ(修正済み)",
    },
    // ── 修正後:正常に配信 ──
    { id: "log_1", type: "新規友だち", to: "佐藤 美咲", channel: "LINEプッシュ", status: "成功", at: subDays(new Date(), 6).toISOString() },
    { id: "log_2", type: "予約確定", to: "佐藤 美咲", channel: "LINEプッシュ", status: "成功", at: subDays(new Date(), 6).toISOString() },
    { id: "log_3", type: "リマインド", to: "田中 健一", channel: "LINEプッシュ", status: "成功", at: subDays(new Date(), 5).toISOString() },
    { id: "log_4", type: "予約確定", to: "鈴木 陽子", channel: "LINEプッシュ", status: "成功", at: subDays(new Date(), 4).toISOString() },
    { id: "log_5", type: "予約確定", to: "中村 悠斗", channel: "LINEプッシュ", status: "成功", at: subDays(new Date(), 3).toISOString() },
    { id: "log_6", type: "リマインド", to: "小林 愛", channel: "LINEプッシュ", status: "成功", at: subDays(new Date(), 2).toISOString() },
    { id: "log_7", type: "リマインド", to: "森 健太", channel: "LINEプッシュ", status: "成功", at: subHours(new Date(), 20).toISOString() },
    { id: "log_8", type: "予約確定", to: "清水 麻衣", channel: "LINEプッシュ", status: "成功", at: subHours(new Date(), 6).toISOString() },
    { id: "log_9", type: "リマインド", to: "木村 千夏", channel: "LINEプッシュ", status: "成功", at: subHours(new Date(), 2).toISOString() },
  ];

  return { reservations, logs };
}
