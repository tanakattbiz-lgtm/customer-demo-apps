import { subDays, subHours, subMinutes, addDays } from "date-fns";

// ============================================================
// 型定義
// ============================================================
export type MatterStatus = "受任前" | "進行中" | "期日調整中" | "和解交渉" | "完了";
export type MatterCategory =
  | "離婚・親権"
  | "相続・遺言"
  | "労働問題"
  | "交通事故"
  | "債務整理"
  | "企業法務"
  | "刑事弁護"
  | "不動産"
  | "顧問";

export type ClientType = "個人" | "法人";
export type ClientPlan = "スポット" | "顧問(ライト)" | "顧問(スタンダード)" | "顧問(プレミアム)";
export type ClientStatus = "見込み" | "契約中" | "休眠";

export type InvoiceStatus = "未請求" | "送付済" | "支払済" | "延滞";

export interface Staff {
  id: string;
  name: string;
  role: "弁護士" | "パラリーガル" | "事務";
  title: string;
  color: string; // アバター背景
}

export interface Client {
  id: string;
  name: string;
  kana: string;
  type: ClientType;
  plan: ClientPlan;
  status: ClientStatus;
  contact: string; // 担当者名(法人)/ 本人
  email: string;
  phone: string;
  address: string;
  ownerId: string; // 主担当弁護士
  note: string;
  createdAt: string;
}

export interface Matter {
  id: string;
  code: string; // 事件番号
  title: string;
  clientId: string;
  category: MatterCategory;
  status: MatterStatus;
  ownerId: string;
  fee: number; // 着手金+報酬の見込み
  nextEvent?: string; // 次回期日/タスク
  nextEventAt?: string;
  openedAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  clientId: string;
  from: "client" | "staff";
  authorId?: string; // staff の場合
  text: string;
  at: string;
  read: boolean;
}

export interface Invoice {
  id: string;
  no: string;
  clientId: string;
  matterId?: string;
  subject: string;
  amount: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
  paidAt?: string;
  method?: "クレジットカード";
  cardBrand?: string;
  cardLast4?: string;
}

export type NotifChannel = "メール";
export interface Notification {
  id: string;
  channel: NotifChannel;
  event: string; // 種別
  to: string; // 宛先
  subject: string;
  at: string;
  status: "送信済" | "開封";
}

export interface AppData {
  staff: Staff[];
  clients: Client[];
  matters: Matter[];
  messages: Message[];
  invoices: Invoice[];
  notifications: Notification[];
}

// ============================================================
// スタッフ(固定)
// ============================================================
export const STAFF: Staff[] = [
  { id: "s1", name: "湊 隆一", role: "弁護士", title: "代表弁護士", color: "oklch(48% 0.15 264)" },
  { id: "s2", name: "白石 真希", role: "弁護士", title: "パートナー弁護士", color: "oklch(55% 0.14 200)" },
  { id: "s3", name: "藤原 拓也", role: "弁護士", title: "アソシエイト", color: "oklch(58% 0.15 150)" },
  { id: "s4", name: "神谷 美咲", role: "弁護士", title: "アソシエイト", color: "oklch(60% 0.14 320)" },
  { id: "s5", name: "大西 洋輔", role: "パラリーガル", title: "パラリーガル", color: "oklch(62% 0.12 60)" },
  { id: "s6", name: "森田 綾", role: "事務", title: "事務局", color: "oklch(58% 0.1 30)" },
];

export const CURRENT_USER_ID = "s1";

// ============================================================
// シード生成(現在時刻を基準に相対生成)
// ============================================================
const CLIENT_SRC: Array<
  Omit<Client, "id" | "createdAt" | "ownerId"> & { ownerId: string; daysAgo: number }
> = [
  { name: "株式会社大和ロジスティクス", kana: "やまとろじすてぃくす", type: "法人", plan: "顧問(スタンダード)", status: "契約中", contact: "総務部 田所 健", email: "tadokoro@yamato-logi.example.co.jp", phone: "03-5432-1100", address: "東京都港区海岸2-4-8", ownerId: "s1", note: "月次で契約書レビュー。物流業界特有の下請法対応あり。", daysAgo: 420 },
  { name: "グリーンリーフ商事株式会社", kana: "ぐりーんりーふしょうじ", type: "法人", plan: "顧問(プレミアム)", status: "契約中", contact: "法務室 桑原 里奈", email: "kuwabara@greenleaf.example.co.jp", phone: "03-6677-2200", address: "東京都千代田区丸の内1-2-3", ownerId: "s2", note: "海外取引の与信・債権回収を継続支援。", daysAgo: 610 },
  { name: "佐々木 由美子", kana: "ささきゆみこ", type: "個人", plan: "スポット", status: "契約中", contact: "本人", email: "y.sasaki@example.com", phone: "090-1234-5678", address: "神奈川県横浜市西区みなとみらい3-1", ownerId: "s2", note: "離婚調停。親権・養育費でもめている。", daysAgo: 62 },
  { name: "有限会社山田製作所", kana: "やまだせいさくしょ", type: "法人", plan: "顧問(ライト)", status: "契約中", contact: "代表 山田 昇", email: "yamada@yamada-ss.example.jp", phone: "045-223-4567", address: "神奈川県川崎市高津区久本1-5", ownerId: "s3", note: "従業員との未払残業代トラブル対応中。", daysAgo: 190 },
  { name: "田村 浩二", kana: "たむらこうじ", type: "個人", plan: "スポット", status: "契約中", contact: "本人", email: "koji.tamura@example.com", phone: "080-9876-5432", address: "東京都世田谷区三軒茶屋2-11-6", ownerId: "s3", note: "交通事故(被害者側)。後遺障害等級の異議申立を検討。", daysAgo: 45 },
  { name: "NPO法人みらい子ども支援", kana: "みらいこどもしえん", type: "法人", plan: "顧問(ライト)", status: "契約中", contact: "事務局長 岡田 静", email: "okada@mirai-kodomo.example.org", phone: "03-3344-5566", address: "東京都豊島区南池袋1-8-2", ownerId: "s4", note: "寄付規程・個人情報の取扱い整備。", daysAgo: 300 },
  { name: "中西 亮", kana: "なかにしりょう", type: "個人", plan: "スポット", status: "契約中", contact: "本人", email: "r.nakanishi@example.com", phone: "070-3322-1188", address: "埼玉県さいたま市大宮区桜木町1-7", ownerId: "s1", note: "多重債務。任意整理で交渉中。", daysAgo: 80 },
  { name: "株式会社ブルースカイ観光", kana: "ぶるーすかいかんこう", type: "法人", plan: "顧問(スタンダード)", status: "契約中", contact: "経営企画 三宅 亜紀", email: "miyake@bluesky-travel.example.co.jp", phone: "06-6789-0011", address: "大阪府大阪市北区梅田3-2-1", ownerId: "s2", note: "キャンセルポリシー・約款の改定支援。", daysAgo: 250 },
  { name: "小林 早苗", kana: "こばやしさなえ", type: "個人", plan: "スポット", status: "契約中", contact: "本人", email: "sanae.k@example.com", phone: "090-4455-6677", address: "千葉県船橋市本町4-3-9", ownerId: "s4", note: "父の相続。遺産分割協議がまとまらない。", daysAgo: 110 },
  { name: "テックノヴァ株式会社", kana: "てっくのゔぁ", type: "法人", plan: "顧問(プレミアム)", status: "契約中", contact: "CTO 渡辺 遼", email: "watanabe@technova.example.io", phone: "03-4000-1234", address: "東京都渋谷区神南1-19-11", ownerId: "s1", note: "SaaS の利用規約・個人情報保護方針。資金調達の準備。", daysAgo: 520 },
  { name: "株式会社北陸フーズ", kana: "ほくりくふーず", type: "法人", plan: "顧問(スタンダード)", status: "契約中", contact: "管理部 長谷川 誠", email: "hasegawa@hokuriku-foods.example.jp", phone: "076-233-4455", address: "石川県金沢市片町1-3-2", ownerId: "s3", note: "FC 加盟店との契約紛争。", daysAgo: 340 },
  { name: "井上 和彦", kana: "いのうえかずひこ", type: "個人", plan: "スポット", status: "契約中", contact: "本人", email: "k.inoue@example.com", phone: "080-1212-3434", address: "東京都練馬区石神井町2-6-1", ownerId: "s4", note: "刑事事件(在宅)。示談交渉を進める。", daysAgo: 30 },
  { name: "株式会社アーバンエステート", kana: "あーばんえすてーと", type: "法人", plan: "顧問(ライト)", status: "契約中", contact: "取締役 早瀬 拓真", email: "hayase@urban-estate.example.co.jp", phone: "03-7788-9900", address: "東京都新宿区西新宿6-5-1", ownerId: "s2", note: "賃貸物件の明渡し・原状回復トラブル。", daysAgo: 175 },
  { name: "松本 里佳", kana: "まつもとりか", type: "個人", plan: "スポット", status: "見込み", contact: "本人", email: "rika.m@example.com", phone: "090-8899-0011", address: "東京都杉並区高円寺北3-22", ownerId: "s4", note: "初回相談待ち。ハラスメント被害の相談。", daysAgo: 4 },
  { name: "株式会社さくらメディカル", kana: "さくらめでぃかる", type: "法人", plan: "顧問(スタンダード)", status: "見込み", contact: "人事部 内田 香織", email: "uchida@sakura-medical.example.jp", phone: "03-2211-3344", address: "東京都文京区本郷3-1-5", ownerId: "s1", note: "顧問契約の提案中。就業規則の全面改定ニーズ。", daysAgo: 9 },
  { name: "橋本 大輔", kana: "はしもとだいすけ", type: "個人", plan: "スポット", status: "休眠", contact: "本人", email: "d.hashimoto@example.com", phone: "080-5566-7788", address: "神奈川県藤沢市鵠沼2-4-7", ownerId: "s3", note: "過去に債務整理を受任。完了済み。", daysAgo: 500 },
];

const MATTER_SRC: Array<{
  title: string;
  clientIdx: number;
  category: MatterCategory;
  status: MatterStatus;
  ownerId: string;
  fee: number;
  nextEvent?: string;
  nextInDays?: number;
  openedDaysAgo: number;
  updatedHoursAgo: number;
}> = [
  { title: "下請取引基本契約の改定レビュー", clientIdx: 0, category: "企業法務", status: "進行中", ownerId: "s1", fee: 480000, nextEvent: "修正版の返送", nextInDays: 3, openedDaysAgo: 40, updatedHoursAgo: 5 },
  { title: "海外代理店との売掛金回収", clientIdx: 1, category: "企業法務", status: "和解交渉", ownerId: "s2", fee: 1200000, nextEvent: "相手方代理人と協議", nextInDays: 6, openedDaysAgo: 95, updatedHoursAgo: 20 },
  { title: "離婚調停(親権・養育費)", clientIdx: 2, category: "離婚・親権", status: "期日調整中", ownerId: "s2", fee: 660000, nextEvent: "第3回調停期日", nextInDays: 12, openedDaysAgo: 60, updatedHoursAgo: 2 },
  { title: "未払残業代請求への対応", clientIdx: 3, category: "労働問題", status: "進行中", ownerId: "s3", fee: 540000, nextEvent: "証拠資料の精査", nextInDays: 2, openedDaysAgo: 55, updatedHoursAgo: 30 },
  { title: "交通事故 後遺障害等級 異議申立", clientIdx: 4, category: "交通事故", status: "進行中", ownerId: "s3", fee: 420000, nextEvent: "医療照会の回答待ち", nextInDays: 9, openedDaysAgo: 40, updatedHoursAgo: 8 },
  { title: "寄付金規程・個人情報規程の整備", clientIdx: 5, category: "企業法務", status: "完了", ownerId: "s4", fee: 280000, openedDaysAgo: 120, updatedHoursAgo: 240 },
  { title: "任意整理(3社)", clientIdx: 6, category: "債務整理", status: "和解交渉", ownerId: "s1", fee: 330000, nextEvent: "A社との和解案調整", nextInDays: 4, openedDaysAgo: 70, updatedHoursAgo: 12 },
  { title: "旅行約款・キャンセル規定の改定", clientIdx: 7, category: "企業法務", status: "進行中", ownerId: "s2", fee: 600000, nextEvent: "改定案の社内説明会", nextInDays: 7, openedDaysAgo: 30, updatedHoursAgo: 26 },
  { title: "遺産分割協議の代理交渉", clientIdx: 8, category: "相続・遺言", status: "期日調整中", ownerId: "s4", fee: 720000, nextEvent: "他の相続人へ受任通知", nextInDays: 5, openedDaysAgo: 90, updatedHoursAgo: 3 },
  { title: "利用規約・プライバシーポリシー全面改定", clientIdx: 9, category: "企業法務", status: "進行中", ownerId: "s1", fee: 900000, nextEvent: "ドラフトv2レビュー", nextInDays: 3, openedDaysAgo: 45, updatedHoursAgo: 1 },
  { title: "資金調達に伴う投資契約レビュー", clientIdx: 9, category: "企業法務", status: "受任前", ownerId: "s1", fee: 800000, nextEvent: "見積の提示", nextInDays: 2, openedDaysAgo: 6, updatedHoursAgo: 4 },
  { title: "FC加盟店との契約解除紛争", clientIdx: 10, category: "企業法務", status: "和解交渉", ownerId: "s3", fee: 980000, nextEvent: "調停申立書の作成", nextInDays: 8, openedDaysAgo: 80, updatedHoursAgo: 16 },
  { title: "刑事示談交渉(在宅事件)", clientIdx: 11, category: "刑事弁護", status: "進行中", ownerId: "s4", fee: 500000, nextEvent: "被害者側と示談協議", nextInDays: 1, openedDaysAgo: 20, updatedHoursAgo: 6 },
  { title: "テナント明渡し・原状回復請求", clientIdx: 12, category: "不動産", status: "進行中", ownerId: "s2", fee: 460000, nextEvent: "内容証明の発送", nextInDays: 4, openedDaysAgo: 50, updatedHoursAgo: 9 },
  { title: "労務相談(顧問・月次)", clientIdx: 3, category: "顧問", status: "進行中", ownerId: "s3", fee: 120000, nextEvent: "定例MTG", nextInDays: 10, openedDaysAgo: 190, updatedHoursAgo: 48 },
  { title: "就業規則の全面改定(提案)", clientIdx: 14, category: "労働問題", status: "受任前", ownerId: "s1", fee: 650000, nextEvent: "提案書の送付", nextInDays: 2, openedDaysAgo: 8, updatedHoursAgo: 5 },
  { title: "債務整理(完了)", clientIdx: 15, category: "債務整理", status: "完了", ownerId: "s3", fee: 300000, openedDaysAgo: 480, updatedHoursAgo: 720 },
];

function pad(n: number, len = 3) {
  return String(n).padStart(len, "0");
}

export function buildSeed(): AppData {
  const now = new Date();

  const clients: Client[] = CLIENT_SRC.map((c, i) => ({
    id: "c" + (i + 1),
    name: c.name,
    kana: c.kana,
    type: c.type,
    plan: c.plan,
    status: c.status,
    contact: c.contact,
    email: c.email,
    phone: c.phone,
    address: c.address,
    ownerId: c.ownerId,
    note: c.note,
    createdAt: subDays(now, c.daysAgo).toISOString(),
  }));

  const matters: Matter[] = MATTER_SRC.map((m, i) => ({
    id: "m" + (i + 1),
    code: `2026-${pad(i + 101)}`,
    title: m.title,
    clientId: clients[m.clientIdx].id,
    category: m.category,
    status: m.status,
    ownerId: m.ownerId,
    fee: m.fee,
    nextEvent: m.nextEvent,
    nextEventAt: m.nextInDays != null ? addDays(now, m.nextInDays).toISOString() : undefined,
    openedAt: subDays(now, m.openedDaysAgo).toISOString(),
    updatedAt: subHours(now, m.updatedHoursAgo).toISOString(),
  }));

  // ---- チャット(顧問先ごとのスレッド。テキストのみ) ----
  const messages: Message[] = [];
  let mid = 1;
  const push = (
    clientId: string,
    from: "client" | "staff",
    text: string,
    minsAgo: number,
    authorId?: string,
    read = true,
  ) => {
    messages.push({
      id: "msg" + mid++,
      clientId,
      from,
      authorId,
      text,
      at: subMinutes(now, minsAgo).toISOString(),
      read,
    });
  };

  // 佐々木由美子(c3)— 離婚調停
  push("c3", "client", "白石先生、お世話になっております。次回の調停の日程ですが、平日の午前中は難しく…夕方でも大丈夫でしょうか。", 60 * 26, undefined, true);
  push("c3", "staff", "佐々木様、ご連絡ありがとうございます。裁判所と調整のうえ、候補日をご案内いたします。少々お待ちください。", 60 * 25, "s2");
  push("c3", "staff", "第3回期日は◯月◯日の15:30〜で仮押さえしました。正式に確定しましたら書面でもお送りします。", 60 * 24, "s2");
  push("c3", "client", "ありがとうございます。助かります。養育費の件で追加の資料を用意した方がよいものはありますか?", 60 * 3, undefined, false);
  push("c3", "client", "直近3か月の給与明細はお渡しした通りですが、賞与の資料も必要でしょうか。", 60 * 2 + 40, undefined, false);

  // テックノヴァ(c10)— 企業法務
  push("c10", "client", "渡辺です。利用規約ドラフトv2、社内レビューで2点コメントしました。特に第12条(免責)の表現を相談したいです。", 60 * 8, undefined, false);
  push("c10", "staff", "ありがとうございます。第12条は消費者契約法との関係で調整が必要な箇所です。修正案を今日中にお返しします。", 60 * 7, "s1");
  push("c10", "client", "助かります!資金調達のスケジュールが前倒しになりそうで、投資契約のレビューもお願いできればと。", 60 * 6, undefined, false);

  // 中西亮(c7)— 債務整理
  push("c7", "client", "任意整理の件、A社から連絡が直接来てしまったのですが、どう対応すればよいでしょうか。", 60 * 30, undefined, true);
  push("c7", "staff", "中西様、ご心配なく。受任通知を送付済みですので、今後の連絡はすべて当事務所宛になります。直接のやり取りは不要です。", 60 * 29, "s1");
  push("c7", "client", "承知しました。安心しました、ありがとうございます。", 60 * 28, undefined, true);

  // 大和ロジスティクス(c1)
  push("c1", "client", "田所です。基本契約の修正版、拝受しました。第7条の検収条件について社内で確認します。", 60 * 50, undefined, true);
  push("c1", "staff", "ご確認よろしくお願いいたします。ご不明点あればいつでもご連絡ください。", 60 * 49, "s1");

  // 小林早苗(c9)— 相続
  push("c9", "client", "神谷先生、遺産分割の件、兄が協議に応じてくれそうです。次のステップを教えてください。", 60 * 5, undefined, false);

  // ---- 請求・決済 ----
  const invoices: Invoice[] = [
    { id: "iv1", no: "INV-2026-0101", clientId: "c1", matterId: "m1", subject: "顧問料(4月分)", amount: 88000, status: "支払済", issuedAt: subDays(now, 35).toISOString(), dueAt: subDays(now, 20).toISOString(), paidAt: subDays(now, 22).toISOString(), method: "クレジットカード", cardBrand: "Visa", cardLast4: "4242" },
    { id: "iv2", no: "INV-2026-0102", clientId: "c2", subject: "顧問料(4月分)", amount: 165000, status: "支払済", issuedAt: subDays(now, 34).toISOString(), dueAt: subDays(now, 19).toISOString(), paidAt: subDays(now, 25).toISOString(), method: "クレジットカード", cardBrand: "Mastercard", cardLast4: "5511" },
    { id: "iv3", no: "INV-2026-0103", clientId: "c3", matterId: "m3", subject: "離婚調停 着手金", amount: 330000, status: "支払済", issuedAt: subDays(now, 58).toISOString(), dueAt: subDays(now, 43).toISOString(), paidAt: subDays(now, 50).toISOString(), method: "クレジットカード", cardBrand: "Visa", cardLast4: "8888" },
    { id: "iv4", no: "INV-2026-0121", clientId: "c1", matterId: "m1", subject: "顧問料(5月分)", amount: 88000, status: "送付済", issuedAt: subDays(now, 6).toISOString(), dueAt: addDays(now, 9).toISOString() },
    { id: "iv5", no: "INV-2026-0122", clientId: "c8", subject: "約款改定 着手金", amount: 330000, status: "送付済", issuedAt: subDays(now, 4).toISOString(), dueAt: addDays(now, 11).toISOString() },
    { id: "iv6", no: "INV-2026-0123", clientId: "c9", matterId: "m9", subject: "遺産分割 着手金", amount: 396000, status: "送付済", issuedAt: subDays(now, 3).toISOString(), dueAt: addDays(now, 12).toISOString() },
    { id: "iv7", no: "INV-2026-0110", clientId: "c4", matterId: "m4", subject: "労働問題 着手金", amount: 297000, status: "延滞", issuedAt: subDays(now, 40).toISOString(), dueAt: subDays(now, 5).toISOString() },
    { id: "iv8", no: "INV-2026-0111", clientId: "c11", subject: "FC紛争 着手金", amount: 539000, status: "延滞", issuedAt: subDays(now, 38).toISOString(), dueAt: subDays(now, 3).toISOString() },
    { id: "iv9", no: "INV-2026-0124", clientId: "c10", matterId: "m10", subject: "規約改定 中間金", amount: 495000, status: "送付済", issuedAt: subDays(now, 2).toISOString(), dueAt: addDays(now, 13).toISOString() },
    { id: "iv10", no: "INV-2026-0125", clientId: "c5", matterId: "m5", subject: "交通事故 着手金", amount: 231000, status: "未請求", issuedAt: subDays(now, 1).toISOString(), dueAt: addDays(now, 14).toISOString() },
    { id: "iv11", no: "INV-2026-0104", clientId: "c10", subject: "顧問料(4月分)", amount: 220000, status: "支払済", issuedAt: subDays(now, 33).toISOString(), dueAt: subDays(now, 18).toISOString(), paidAt: subDays(now, 30).toISOString(), method: "クレジットカード", cardBrand: "Amex", cardLast4: "1007" },
    { id: "iv12", no: "INV-2026-0105", clientId: "c8", subject: "顧問料(4月分)", amount: 110000, status: "支払済", issuedAt: subDays(now, 32).toISOString(), dueAt: subDays(now, 17).toISOString(), paidAt: subDays(now, 15).toISOString(), method: "クレジットカード", cardBrand: "Visa", cardLast4: "3311" },
  ];

  // ---- メール通知ログ ----
  const notifications: Notification[] = [
    { id: "n1", channel: "メール", event: "請求書送付", to: "watanabe@technova.example.io", subject: "【みなと総合法律事務所】請求書(INV-2026-0124)送付のお知らせ", at: subHours(now, 2).toISOString(), status: "開封" },
    { id: "n2", channel: "メール", event: "期日リマインド", to: "y.sasaki@example.com", subject: "【リマインド】調停期日のご案内", at: subHours(now, 5).toISOString(), status: "開封" },
    { id: "n3", channel: "メール", event: "入金確認", to: "tadokoro@yamato-logi.example.co.jp", subject: "ご入金を確認いたしました(INV-2026-0101)", at: subHours(now, 26).toISOString(), status: "開封" },
    { id: "n4", channel: "メール", event: "新規メッセージ", to: "kuwabara@greenleaf.example.co.jp", subject: "担当弁護士から新しいメッセージが届いています", at: subHours(now, 30).toISOString(), status: "送信済" },
    { id: "n5", channel: "メール", event: "支払期限リマインド", to: "yamada@yamada-ss.example.jp", subject: "【お支払いのお願い】INV-2026-0110 のお支払期限が過ぎています", at: subHours(now, 48).toISOString(), status: "送信済" },
    { id: "n6", channel: "メール", event: "面談予約確定", to: "rika.m@example.com", subject: "初回相談のご予約が確定しました", at: subHours(now, 60).toISOString(), status: "開封" },
    { id: "n7", channel: "メール", event: "書面共有", to: "watanabe@technova.example.io", subject: "利用規約ドラフト v2 を共有しました", at: subHours(now, 8).toISOString(), status: "開封" },
    { id: "n8", channel: "メール", event: "請求書送付", to: "hayase@urban-estate.example.co.jp", subject: "【みなと総合法律事務所】請求書送付のお知らせ", at: subHours(now, 72).toISOString(), status: "送信済" },
  ];

  return { staff: STAFF, clients, matters, messages, invoices, notifications };
}
