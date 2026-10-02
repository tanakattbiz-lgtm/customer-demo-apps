/**
 * ダミーデータ(すべて架空)。
 * 日付は「今日」を基準に相対生成し、乱数は固定シードなのでリセットすると同じ内容に戻る。
 */
import { addDays, format, setHours, setMinutes, subDays } from "date-fns";
import { addMonthKey, monthKey } from "../lib/format";

// ======================= 型 =======================
export type Area = "大阪" | "兵庫" | "京都" | "奈良" | "滋賀" | "和歌山";
export const AREAS: Area[] = ["大阪", "兵庫", "京都", "奈良", "滋賀", "和歌山"];

export type BoardType = "ビル屋上" | "壁面" | "野立て" | "ロードサイド" | "駅前";
export const BOARD_TYPES: BoardType[] = ["ビル屋上", "壁面", "野立て", "ロードサイド", "駅前"];

export interface Staff {
  id: string;
  name: string;
  branch: string;
  dept: string;
}

export interface Face {
  id: string;
  label: string;
  direction: string;
  price: number; // 月額定価
}

export interface Board {
  id: string;
  code: string;
  name: string;
  address: string;
  area: Area;
  type: BoardType;
  size: string;
  lighting: boolean;
  traffic: number; // 1日あたり交通量(台・人)
  installMonth: string; // 設置(販売開始)月
  faces: Face[];
}

export interface AdContract {
  id: string;
  no: string;
  customerId: string;
  dealId?: string;
  faceIds: string[];
  startMonth: string;
  endMonth: string;
  monthlyFee: number;
  repId: string;
  createdAt: string;
  cancelMonth?: string; // 解約時: 最終掲載月
  cancelledAt?: string;
  cancelReason?: string;
}

export interface LandContract {
  id: string;
  no: string;
  boardId: string;
  ownerName: string;
  ownerKind: "個人" | "法人";
  ownerPhone: string;
  ownerAddress: string;
  rent: number; // 月額賃料
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  repId: string;
  createdAt: string;
  terminated?: boolean;
}

export type CustomerStatus = "見込み" | "商談中" | "取引中" | "休眠";
export type Rank = "A" | "B" | "C";
export interface Customer {
  id: string;
  company: string;
  industry: string;
  contact: string;
  contactTitle: string;
  phone: string;
  email: string;
  address: string;
  area: Area;
  rank: Rank;
  status: CustomerStatus;
  source: string;
  repId: string;
  createdAt: string;
  memo: string;
}

export type Stage = "初回接触" | "ヒアリング" | "提案" | "見積提出" | "交渉" | "成約" | "失注";
export const OPEN_STAGES: Stage[] = ["初回接触", "ヒアリング", "提案", "見積提出", "交渉"];
export const STAGES: Stage[] = [...OPEN_STAGES, "成約", "失注"];
export const STAGE_PROB: Record<Stage, number> = {
  初回接触: 10,
  ヒアリング: 20,
  提案: 40,
  見積提出: 60,
  交渉: 80,
  成約: 100,
  失注: 0,
};

export interface NextAction {
  date: string; // yyyy-MM-dd
  content: string;
}

export interface Deal {
  id: string;
  customerId: string;
  title: string;
  stage: Stage;
  monthlyBudget: number;
  months: number;
  expectedClose: string;
  repId: string;
  nextAction: NextAction | null;
  createdAt: string;
  updatedAt: string;
  lostReason?: string;
  contractId?: string;
}

export type ActivityType = "訪問" | "電話" | "メール" | "提案" | "オンライン";
export const ACTIVITY_TYPES: ActivityType[] = ["訪問", "電話", "メール", "提案", "オンライン"];
export interface Activity {
  id: string;
  customerId: string;
  dealId?: string;
  type: ActivityType;
  date: string; // ISO datetime
  memo: string;
  repId: string;
}

export interface Hold {
  id: string;
  faceId: string;
  dealId: string;
  startMonth: string;
  endMonth: string;
  expiresAt: string; // yyyy-MM-dd(この日まで有効)
  repId: string;
  createdAt: string;
}

export type HandoverStatus = "提出済" | "差し戻し" | "再提出" | "受領済";
export const DOC_KINDS = ["契約書(押印済)", "掲出申込書", "広告原稿データ", "請求先情報"] as const;
export const REQUIRED_DOCS: string[] = ["契約書(押印済)", "掲出申込書"];
export const ISSUE_OPTIONS = [
  "契約書の押印漏れ",
  "契約金額と申込書の金額が不一致",
  "掲載期間の記載誤り",
  "請求先情報の不足",
  "広告原稿データの未添付",
  "その他",
];

export interface HandoverDoc {
  kind: string;
  fileName: string | null;
}
export interface HandoverEvent {
  at: string;
  actor: string;
  role: "営業" | "管理部";
  action: string;
  note?: string;
}
export interface Handover {
  id: string;
  no: string;
  contractId: string;
  status: HandoverStatus;
  docs: HandoverDoc[];
  submittedAt: string;
  updatedAt: string;
  receivedAt?: string;
  issues: string[];
  issueNote: string;
  history: HandoverEvent[];
}

// ======================= 乱数 =======================
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ======================= 担当者 =======================
export const ME_ID = "u01";
export const ADMIN_NAME = "藤井 美咲";
export const ADMIN_DEPT = "管理部 契約課";

export const STAFF: Staff[] = [
  { id: "u01", name: "中村 拓也", branch: "大阪本社", dept: "営業1課" },
  { id: "u02", name: "松本 恵", branch: "大阪本社", dept: "営業1課" },
  { id: "u03", name: "井上 健太", branch: "大阪本社", dept: "営業2課" },
  { id: "u04", name: "木村 沙織", branch: "大阪本社", dept: "営業2課" },
  { id: "u05", name: "林 翔平", branch: "大阪本社", dept: "営業3課" },
  { id: "u06", name: "清水 由香", branch: "大阪本社", dept: "営業3課" },
  { id: "u07", name: "山口 誠", branch: "神戸支店", dept: "営業課" },
  { id: "u08", name: "森 彩花", branch: "神戸支店", dept: "営業課" },
  { id: "u09", name: "池田 亮", branch: "神戸支店", dept: "営業課" },
  { id: "u10", name: "橋本 真理子", branch: "京都支店", dept: "営業課" },
  { id: "u11", name: "阿部 大輝", branch: "京都支店", dept: "営業課" },
  { id: "u12", name: "石川 直樹", branch: "奈良営業所", dept: "営業課" },
  { id: "u13", name: "前田 優子", branch: "滋賀営業所", dept: "営業課" },
  { id: "u14", name: "岡田 隼人", branch: "和歌山営業所", dept: "営業課" },
];

// ======================= 看板マスタ =======================
type Loc = [string, string, Area, BoardType];
const LOCS: Loc[] = [
  ["国道2号 西本町交差点", "兵庫県尼崎市西本町4丁目", "兵庫", "ロードサイド"],
  ["新御堂筋 江坂北", "大阪府吹田市江坂町2丁目", "大阪", "ビル屋上"],
  ["阪神高速 湊町出口前", "大阪府大阪市浪速区湊町1丁目", "大阪", "ビル屋上"],
  ["国道1号 樟葉バイパス", "大阪府枚方市楠葉朝日3丁目", "大阪", "野立て"],
  ["中央大通 本町東", "大阪府大阪市中央区本町2丁目", "大阪", "壁面"],
  ["国道171号 茨木IC南", "大阪府茨木市中穂積3丁目", "大阪", "ロードサイド"],
  ["梅田 茶屋町交差点", "大阪府大阪市北区茶屋町", "大阪", "壁面"],
  ["なんば 千日前通", "大阪府大阪市中央区難波千日前", "大阪", "ビル屋上"],
  ["天王寺 あべの筋", "大阪府大阪市阿倍野区阿倍野筋1丁目", "大阪", "駅前"],
  ["国道26号 堺市北花田口", "大阪府堺市堺区北花田口町", "大阪", "ロードサイド"],
  ["近畿道 東大阪JCT付近", "大阪府東大阪市本庄西2丁目", "大阪", "野立て"],
  ["国道163号 門真南", "大阪府門真市三ツ島6丁目", "大阪", "ロードサイド"],
  ["京橋 駅前広場", "大阪府大阪市都島区東野田町2丁目", "大阪", "駅前"],
  ["国道170号 岸和田和泉IC", "大阪府岸和田市岡山町", "大阪", "野立て"],
  ["三宮 フラワーロード", "兵庫県神戸市中央区雲井通5丁目", "兵庫", "ビル屋上"],
  ["国道2号 明石大蔵谷", "兵庫県明石市大蔵谷", "兵庫", "ロードサイド"],
  ["阪神高速 西宮IC前", "兵庫県西宮市津門大塚町", "兵庫", "ビル屋上"],
  ["姫路 大手前通り", "兵庫県姫路市駅前町", "兵庫", "駅前"],
  ["国道176号 宝塚中筋", "兵庫県宝塚市中筋3丁目", "兵庫", "野立て"],
  ["山陽道 三木小野IC付近", "兵庫県三木市加佐", "兵庫", "野立て"],
  ["加古川 駅南ロータリー", "兵庫県加古川市加古川町篠原町", "兵庫", "駅前"],
  ["京都駅前 烏丸通", "京都府京都市下京区烏丸通塩小路下る", "京都", "ビル屋上"],
  ["堀川通 五条交差点", "京都府京都市下京区堀川通五条", "京都", "壁面"],
  ["国道1号 伏見 竹田", "京都府京都市伏見区竹田向代町", "京都", "ロードサイド"],
  ["名神高速 京都南IC前", "京都府京都市伏見区竹田中島町", "京都", "野立て"],
  ["四条河原町 交差点", "京都府京都市下京区四条通河原町", "京都", "壁面"],
  ["国道24号 城陽寺田", "京都府城陽市寺田", "京都", "ロードサイド"],
  ["国道9号 亀岡追分", "京都府亀岡市追分町", "京都", "野立て"],
  ["国道24号 奈良大森町", "奈良県奈良市大森町", "奈良", "ロードサイド"],
  ["近鉄奈良 駅前", "奈良県奈良市東向中町", "奈良", "駅前"],
  ["国道165号 橿原 八木", "奈良県橿原市八木町1丁目", "奈良", "ロードサイド"],
  ["西名阪 天理IC付近", "奈良県天理市櫟本町", "奈良", "野立て"],
  ["国道1号 大津 瀬田", "滋賀県大津市大萱1丁目", "滋賀", "ロードサイド"],
  ["草津 駅前通り", "滋賀県草津市大路1丁目", "滋賀", "駅前"],
  ["国道8号 彦根 長曽根", "滋賀県彦根市長曽根南町", "滋賀", "野立て"],
  ["国道161号 堅田", "滋賀県大津市本堅田5丁目", "滋賀", "ロードサイド"],
  ["国道26号 和歌山 紀三井寺", "和歌山県和歌山市紀三井寺", "和歌山", "ロードサイド"],
  ["和歌山駅 東口", "和歌山県和歌山市美園町5丁目", "和歌山", "駅前"],
  ["国道42号 海南 日方", "和歌山県海南市日方", "和歌山", "野立て"],
  ["阪和道 和歌山IC前", "和歌山県和歌山市府中", "和歌山", "野立て"],
  ["国道43号 尼崎 大物", "兵庫県尼崎市大物町2丁目", "兵庫", "ビル屋上"],
  ["御堂筋 心斎橋", "大阪府大阪市中央区心斎橋筋1丁目", "大阪", "壁面"],
];
// 設置予定(土地契約は締結済み、看板設置前)
const PLANNED: Loc[] = [
  ["国道2号 須磨 板宿", "兵庫県神戸市須磨区大黒町", "兵庫", "ロードサイド"],
  ["国道1号 高槻 大塚", "大阪府高槻市大塚町3丁目", "大阪", "野立て"],
  ["京奈和道 木津IC付近", "京都府木津川市木津", "京都", "野立て"],
];

const SIZES: Record<BoardType, string[]> = {
  ビル屋上: ["W12.0m × H4.0m", "W15.0m × H5.0m", "W10.0m × H3.5m"],
  壁面: ["W6.0m × H9.0m", "W5.0m × H7.5m", "W8.0m × H4.0m"],
  野立て: ["W6.0m × H3.0m", "W8.0m × H3.6m", "W5.4m × H2.7m"],
  ロードサイド: ["W4.5m × H2.0m", "W6.0m × H2.4m", "W3.6m × H1.8m"],
  駅前: ["W3.0m × H2.0m", "W4.0m × H3.0m", "W2.4m × H1.6m"],
};
const BASE_PRICE: Record<BoardType, number> = {
  ビル屋上: 160000,
  壁面: 120000,
  野立て: 45000,
  ロードサイド: 38000,
  駅前: 65000,
};
const AREA_FACTOR: Record<Area, number> = {
  大阪: 1.25,
  兵庫: 1.05,
  京都: 1.1,
  奈良: 0.8,
  滋賀: 0.75,
  和歌山: 0.7,
};
const DIRS = ["上り車線向き", "下り車線向き", "交差点正面", "駅改札方向", "北面", "南面"];

// ======================= 顧客 =======================
const ADVERTISERS: [string, string][] = [
  ["株式会社なにわ住建", "住宅・不動産"],
  ["北摂ホームズ株式会社", "住宅・不動産"],
  ["医療法人 青葉会 こばやし整形外科", "医療"],
  ["ささき歯科クリニック", "医療"],
  ["株式会社泉州オートモール", "自動車販売"],
  ["淀川モータース株式会社", "自動車販売"],
  ["学校法人 若葉学園", "教育"],
  ["個別指導塾 ステップアカデミー", "教育"],
  ["株式会社みどり葬祭", "冠婚葬祭"],
  ["ベルフォーレ迎賓館", "冠婚葬祭"],
  ["株式会社浪花ガーデン", "外食"],
  ["焼肉 だいもん", "外食"],
  ["株式会社コトブキ家具センター", "小売"],
  ["ホームセンター ひだまり", "小売"],
  ["六甲ウォーター株式会社", "メーカー"],
  ["丸栄製菓株式会社", "メーカー"],
  ["株式会社大和リフォーム工房", "住宅・不動産"],
  ["湖西ホテル株式会社", "観光・宿泊"],
  ["有馬ゆけむり荘", "観光・宿泊"],
  ["株式会社きのくに観光", "観光・宿泊"],
  ["さくら総合法律事務所", "士業"],
  ["税理士法人 堂島パートナーズ", "士業"],
  ["株式会社ハートフル介護サービス", "介護・福祉"],
  ["社会福祉法人 ひかり会", "介護・福祉"],
  ["株式会社タカハシ自動車整備", "自動車販売"],
  ["株式会社南港中古車センター", "自動車販売"],
  ["株式会社阪奈ハウジング", "住宅・不動産"],
  ["スポーツクラブ フィットライフ", "サービス"],
  ["株式会社クリーンライフ", "サービス"],
  ["株式会社やまと引越センター", "サービス"],
  ["ドラッグストア すこやか", "小売"],
  ["株式会社京ほうじ茶本舗", "メーカー"],
  ["株式会社岸和田だんじり酒造", "メーカー"],
  ["メモリアルホール和光", "冠婚葬祭"],
  ["医療法人 健生会 みなみ内科", "医療"],
  ["株式会社ニシキ不動産販売", "住宅・不動産"],
  ["パティスリー ラ・メール", "外食"],
  ["株式会社湾岸ロジスティクス", "物流"],
  ["株式会社サンライズ保険サービス", "金融・保険"],
  ["京阪ブライダル株式会社", "冠婚葬祭"],
];
const PROSPECTS: [string, string][] = [
  ["株式会社新大阪デンタルグループ", "医療"],
  ["株式会社ことり保育園", "教育"],
  ["株式会社イコマ住宅設備", "住宅・不動産"],
  ["株式会社淡路フードサービス", "外食"],
  ["アクア眼科クリニック", "医療"],
  ["株式会社宇治抹茶庵", "メーカー"],
  ["株式会社ウエスト中古農機", "小売"],
  ["株式会社びわこ物産", "メーカー"],
  ["ミナミ自動車学校", "教育"],
  ["株式会社セントラル保険代理店", "金融・保険"],
  ["株式会社千里ハウスメーカー", "住宅・不動産"],
  ["医療法人 碧水会 たかの皮膚科", "医療"],
  ["株式会社阪神タイヤセンター", "自動車販売"],
  ["株式会社紀州梅園", "メーカー"],
  ["ホテル ポートサイド神戸", "観光・宿泊"],
  ["株式会社ライフケア北摂", "介護・福祉"],
  ["株式会社御影ワイナリー", "メーカー"],
  ["整骨院 からだ工房", "医療"],
  ["株式会社ひまわり葬祭", "冠婚葬祭"],
  ["株式会社大阪湾マリーナ", "観光・宿泊"],
  ["株式会社奈良ホームテック", "住宅・不動産"],
  ["スクール Bright English", "教育"],
  ["株式会社なんばビューティー", "サービス"],
  ["株式会社伏見モーターズ", "自動車販売"],
  ["株式会社琵琶湖リゾート開発", "観光・宿泊"],
  ["焼き鳥 とりまさ", "外食"],
  ["株式会社兵庫ソーラー", "サービス"],
  ["株式会社大東ペットクリニック", "医療"],
];

const SURNAMES = ["田中", "高橋", "渡辺", "伊藤", "小林", "加藤", "吉田", "山田", "佐々木", "山崎", "中島", "藤田", "小川", "後藤", "岡本", "長谷川", "村上", "近藤", "石井", "坂本", "遠藤", "青木", "藤原", "西村", "福田", "太田", "三浦", "藤井", "岡崎", "原田"];
const GIVEN = ["浩二", "美穂", "健一", "裕子", "誠", "直美", "和也", "智子", "隆", "由美子", "聡", "久美子", "大介", "麻衣", "修", "加奈子", "博之", "真由美", "剛", "恵子"];
const TITLES = ["代表取締役", "販促部 部長", "総務課長", "マーケティング担当", "院長", "事務長", "店長", "広報担当", "営業企画課長", "取締役"];
const SOURCES = ["飛び込み", "紹介", "問い合わせ", "既存深耕", "展示会"];
const CITY: Record<Area, string[]> = {
  大阪: ["大阪府大阪市北区", "大阪府吹田市", "大阪府堺市北区", "大阪府東大阪市", "大阪府豊中市", "大阪府枚方市"],
  兵庫: ["兵庫県神戸市中央区", "兵庫県尼崎市", "兵庫県西宮市", "兵庫県姫路市", "兵庫県明石市"],
  京都: ["京都府京都市中京区", "京都府京都市伏見区", "京都府宇治市", "京都府長岡京市"],
  奈良: ["奈良県奈良市", "奈良県橿原市", "奈良県生駒市"],
  滋賀: ["滋賀県大津市", "滋賀県草津市", "滋賀県彦根市"],
  和歌山: ["和歌山県和歌山市", "和歌山県海南市", "和歌山県田辺市"],
};
const TEL_PREFIX: Record<Area, string> = {
  大阪: "06",
  兵庫: "078",
  京都: "075",
  奈良: "0742",
  滋賀: "077",
  和歌山: "073",
};
const AREA_REPS: Record<Area, string[]> = {
  大阪: ["u01", "u02", "u03", "u04", "u05", "u06"],
  兵庫: ["u07", "u08", "u09"],
  京都: ["u10", "u11"],
  奈良: ["u12"],
  滋賀: ["u13"],
  和歌山: ["u14"],
};

const LAND_OWNERS_PERSON = ["今井 正男", "上田 道子", "大野 茂", "川口 和子", "北川 昭", "久保 節子", "小山 勝", "斉藤 文子", "島田 稔", "杉本 弘", "高田 幸子", "竹内 実", "辻 洋子", "中川 清", "野口 武", "浜田 美津子", "平野 進", "松田 義雄", "宮本 京子", "安田 哲也"];
const LAND_OWNERS_CORP = ["有限会社 森田興産", "株式会社 千代田土地", "有限会社 西浜商事", "株式会社 協和ビル管理", "株式会社 弥生地所", "合同会社 丸山資産管理", "株式会社 ナカガワ倉庫"];

const ACT_MEMOS: Record<ActivityType, string[]> = {
  訪問: [
    "先方担当者と面談。来春の新店オープンに合わせた告知を検討中とのこと。",
    "現地の視認性について説明。車線方向と信号待ち時間に関心あり。",
    "決裁者(社長)同席。予算感は月額20万円前後で調整可能とのこと。",
    "既存掲出の効果をヒアリング。来店時アンケートで看板認知が多いと好評。",
  ],
  電話: [
    "前回提案の反応を確認。社内で比較検討中、来週回答予定。",
    "空き面の状況を共有。仮押さえを希望されたため手配。",
    "掲出開始時期の確認。4月開始で調整したいとのこと。",
    "見積金額について確認の連絡。長期割引の適用条件を説明。",
  ],
  メール: [
    "提案書と現地写真を送付。",
    "見積書(12ヶ月・2面)を送付。",
    "デザイン入稿の仕様書を送付。",
    "仮押さえ期限のご案内を送付。",
  ],
  提案: [
    "幹線道路沿い2面のセット提案を実施。認知拡大プランとして好感触。",
    "駅前面と郊外ロードサイド面の組み合わせで提案。",
    "競合他社の掲出状況を踏まえたエリア戦略を提案。",
  ],
  オンライン: [
    "オンラインで掲出シミュレーションを共有。",
    "本社担当者を交えてWeb会議。複数エリア展開を検討中。",
  ],
};
const NEXT_CONTENTS = [
  "見積書の回答確認",
  "提案書を持参して再訪問",
  "決裁者同席で最終提案",
  "仮押さえ期限前に意思確認",
  "現地立会い(視認性の確認)",
  "デザイン案の打ち合わせ",
  "契約条件のすり合わせ",
  "追加面の空き状況を連絡",
  "社内稟議の進捗確認",
  "初回訪問のアポイント取得",
];
const DEAL_TITLES = [
  "新店オープン告知",
  "ブランド認知拡大",
  "来場誘導(住宅展示場)",
  "求人・採用告知",
  "幹線道路沿い長期掲出",
  "駅前エリア集中掲出",
  "春の入学・入会キャンペーン",
  "郊外店舗への誘導",
  "開院告知",
  "周年記念キャンペーン",
];

export interface SeedData {
  boards: Board[];
  customers: Customer[];
  deals: Deal[];
  activities: Activity[];
  holds: Hold[];
  contracts: AdContract[];
  lands: LandContract[];
  handovers: Handover[];
}

// ======================= 生成 =======================
export function createSeed(): SeedData {
  const rnd = mulberry32(20261002);
  const pick = <T,>(a: readonly T[]): T => a[Math.floor(rnd() * a.length)];
  const int = (min: number, max: number) => min + Math.floor(rnd() * (max - min + 1));
  const today = new Date();
  const cur = monthKey(today);
  const iso = (d: Date) => format(d, "yyyy-MM-dd");
  const dt = (d: Date) => format(setMinutes(setHours(d, int(9, 18)), pick([0, 15, 30, 45])), "yyyy-MM-dd'T'HH:mm:ss");
  const phone = (a: Area) => {
    const p = TEL_PREFIX[a];
    const mid = String(int(10 ** (5 - p.length), 10 ** (6 - p.length) - 1));
    return `${p}-${mid}-${int(1000, 9999)}`;
  };

  // ---- 看板 ----
  const boards: Board[] = [];
  const mkBoard = (loc: Loc, i: number, planned: boolean) => {
    const [name, address, area, type] = loc;
    const faceCount = type === "ビル屋上" || type === "ロードサイド" ? int(1, 2) : type === "野立て" ? 2 : 1;
    const traffic = type === "駅前" ? int(28, 95) * 1000 : int(18, 72) * 1000;
    const base = BASE_PRICE[type] * AREA_FACTOR[area] * (0.85 + traffic / 200000);
    const id = `b${String(i + 1).padStart(3, "0")}`;
    const faces: Face[] = Array.from({ length: faceCount }, (_, f) => ({
      id: `${id}-${"ABC"[f]}`,
      label: `${"ABC"[f]}面`,
      direction: faceCount === 1 ? pick(["交差点正面", "駅改札方向", "北面", "南面"]) : DIRS[f],
      price: Math.round((base * (f === 0 ? 1 : 0.9)) / 1000) * 1000,
    }));
    boards.push({
      id,
      code: `KB-${String(10200 + i * 37).padStart(5, "0")}`,
      name,
      address,
      area,
      type,
      size: pick(SIZES[type]),
      lighting: type !== "野立て" || rnd() > 0.4,
      traffic,
      installMonth: planned ? addMonthKey(cur, int(2, 4)) : addMonthKey(cur, -int(30, 160)),
      faces,
    });
  };
  LOCS.forEach((l, i) => mkBoard(l, i, false));
  PLANNED.forEach((l, i) => mkBoard(l, LOCS.length + i, true));

  // ---- 顧客 ----
  const customers: Customer[] = [];
  const mkCustomer = (name: string, industry: string, status: CustomerStatus, idx: number) => {
    const area = pick(AREAS.slice(0, 3).concat(AREAS));
    const reps = AREA_REPS[area];
    // 自分(u01)の担当を多めに
    const repId = area === "大阪" && rnd() < 0.55 ? "u01" : pick(reps);
    const created = subDays(today, status === "取引中" ? int(200, 1400) : int(5, 180));
    customers.push({
      id: `c${String(idx + 1).padStart(3, "0")}`,
      company: name,
      industry,
      contact: `${pick(SURNAMES)} ${pick(GIVEN)}`,
      contactTitle: pick(TITLES),
      phone: phone(area),
      email: `info${int(10, 99)}@example.jp`,
      address: `${pick(CITY[area])}${int(1, 6)}丁目${int(1, 30)}-${int(1, 20)}`,
      area,
      rank: status === "取引中" ? pick(["A", "A", "B"] as Rank[]) : pick(["A", "B", "B", "C"] as Rank[]),
      status,
      source: status === "取引中" ? pick(["既存深耕", "紹介", "飛び込み"]) : pick(SOURCES),
      repId,
      createdAt: iso(created),
      memo: "",
    });
  };
  ADVERTISERS.forEach(([n, ind], i) => mkCustomer(n, ind, "取引中", i));
  PROSPECTS.forEach(([n, ind], i) => mkCustomer(n, ind, i < 20 ? "商談中" : i < 25 ? "見込み" : "休眠", ADVERTISERS.length + i));
  const advertisers = customers.filter((c) => c.status === "取引中");

  // ---- 広告契約(面ごとに時系列で敷き詰める) ----
  const contracts: AdContract[] = [];
  let cno = 1;
  const contractNo = (start: string) => `AD-${start.replace("-", "").slice(2)}-${String(cno++).padStart(4, "0")}`;
  boards.forEach((b) => {
    if (b.installMonth > cur) return;
    b.faces.forEach((f) => {
      let m = addMonthKey(cur, -int(14, 26));
      if (m < b.installMonth) m = b.installMonth;
      while (m <= addMonthKey(cur, 9)) {
        // 空き期間
        if (rnd() < 0.3) m = addMonthKey(m, int(1, 4));
        const len = pick([6, 12, 12, 12, 12, 24, 3, 6]);
        const start = m;
        const end = addMonthKey(start, len - 1);
        const adv = pick(advertisers);
        const created = subDays(new Date(start + "-01"), int(10, 50));
        if (created > today) break; // 未来の契約は作らない
        const c: AdContract = {
          id: `k${String(contracts.length + 1).padStart(4, "0")}`,
          no: "",
          customerId: adv.id,
          faceIds: [f.id],
          startMonth: start,
          endMonth: end,
          monthlyFee: Math.round((f.price * (len >= 12 ? 0.92 : 1)) / 1000) * 1000,
          repId: adv.repId,
          createdAt: iso(created),
        };
        c.no = contractNo(start);
        // 中途解約(過去)
        if (end < cur && rnd() < 0.12 && len >= 12) {
          c.cancelMonth = addMonthKey(start, int(4, len - 3));
          c.cancelledAt = iso(subDays(new Date(addMonthKey(c.cancelMonth, 0) + "-01"), 20));
          c.cancelReason = pick(["販促予算の見直し", "店舗閉鎖", "他媒体への切替"]);
        }
        contracts.push(c);
        m = addMonthKey(c.cancelMonth ?? end, 1);
      }
    });
  });
  // 解約予定(進行中の契約のうち数件)
  contracts
    .filter((c) => c.startMonth <= cur && c.endMonth > addMonthKey(cur, 3) && !c.cancelMonth)
    .slice(3, 6)
    .forEach((c, i) => {
      c.cancelMonth = addMonthKey(cur, i + 1);
      c.cancelledAt = iso(subDays(today, int(1, 12)));
      c.cancelReason = pick(["販促予算の見直し", "店舗移転", "他媒体への切替"]);
    });

  // ---- 引継ぎ(直近に作成された契約) ----
  const handovers: Handover[] = [];
  const recent = contracts
    .filter((c) => c.createdAt >= iso(subDays(today, 40)))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  recent.forEach((c, i) => {
    const rep = STAFF.find((s) => s.id === c.repId)!;
    let subDate = new Date(`${c.createdAt}T${String(int(9, 18)).padStart(2, "0")}:${pick(["05", "20", "40"])}:00`);
    if (subDate > today) subDate = new Date(today.getTime() - 2 * 3600000);
    const sub = format(subDate, "yyyy-MM-dd'T'HH:mm:ss");
    const age = -Math.round((new Date(c.createdAt).getTime() - today.getTime()) / 86400000);
    const plan: HandoverStatus[] = ["提出済", "提出済", "差し戻し", "再提出", "提出済", "差し戻し"];
    const status: HandoverStatus = i < plan.length ? plan[i] : age > 10 ? "受領済" : pick(["提出済", "受領済"] as HandoverStatus[]);
    const docs: HandoverDoc[] = DOC_KINDS.map((k) => ({
      kind: k,
      fileName: k === "広告原稿データ" && rnd() < 0.3 ? null : `${c.no}_${k.replace(/[()]/g, "")}.pdf`,
    }));
    const history: HandoverEvent[] = [{ at: sub, actor: rep.name, role: "営業", action: "管理部へ提出" }];
    const h: Handover = {
      id: `h${String(i + 1).padStart(3, "0")}`,
      no: `HO-${c.no.slice(3)}`,
      contractId: c.id,
      status,
      docs,
      submittedAt: sub,
      updatedAt: sub,
      issues: [],
      issueNote: "",
      history,
    };
    const later = (d: number) => {
      let t = new Date(format(addDays(subDate, d), "yyyy-MM-dd'T'") + `${int(10, 17)}:${pick(["10", "30", "50"])}:00`);
      if (t > today) t = new Date(Math.min(today.getTime() - 30 * 60000, subDate.getTime() + d * 3600000));
      return format(t, "yyyy-MM-dd'T'HH:mm:ss");
    };
    if (status === "差し戻し" || status === "再提出") {
      h.issues = [pick(ISSUE_OPTIONS.slice(0, 4))];
      h.issueNote = "該当箇所を修正のうえ、再提出をお願いします。";
      history.push({ at: later(1), actor: ADMIN_NAME, role: "管理部", action: "差し戻し", note: h.issues.join("、") });
      h.updatedAt = later(1);
      if (status === "再提出") {
        history.push({ at: later(2), actor: rep.name, role: "営業", action: "修正して再提出", note: "ご指摘の箇所を修正しました。" });
        h.updatedAt = later(2);
      }
    }
    if (status === "受領済") {
      history.push({ at: later(1), actor: ADMIN_NAME, role: "管理部", action: "受領" });
      h.receivedAt = later(1);
      h.updatedAt = later(1);
    }
    handovers.push(h);
  });

  // ---- 土地契約 ----
  const lands: LandContract[] = boards.map((b, i) => {
    const corp = rnd() < 0.3;
    const planned = b.installMonth > cur;
    const start = planned ? subDays(today, int(3, 25)) : subDays(today, int(400, 5200));
    const years = pick([3, 5, 5, 10]);
    let end = addDays(start, years * 365);
    // 自動更新ありで満了済のものは次の満了日に繰り延べ
    while (end < today) end = addDays(end, years * 365);
    if (i % 9 === 4) end = addDays(today, int(20, 85)); // 更新期限が近いもの
    return {
      id: `l${String(i + 1).padStart(3, "0")}`,
      no: `LD-${format(start, "yyMM")}-${String(i + 101).padStart(4, "0")}`,
      boardId: b.id,
      ownerName: corp ? pick(LAND_OWNERS_CORP) : pick(LAND_OWNERS_PERSON),
      ownerKind: corp ? "法人" : "個人",
      ownerPhone: phone(b.area),
      ownerAddress: b.address.replace(/\d+丁目$/, "") + `${int(1, 9)}-${int(1, 30)}`,
      rent: Math.round((b.faces.reduce((s, f) => s + f.price, 0) * (0.12 + rnd() * 0.1)) / 1000) * 1000,
      startDate: iso(start),
      endDate: iso(end),
      autoRenew: i % 9 === 4 ? false : rnd() > 0.2,
      repId: pick(AREA_REPS[b.area]),
      createdAt: iso(start),
    };
  });

  // ---- 商談 ----
  const deals: Deal[] = [];
  const activities: Activity[] = [];
  const prospects = customers.filter((c) => c.status === "商談中");
  const stagePlan: Stage[] = [
    "交渉", "交渉", "交渉", "見積提出", "見積提出", "見積提出", "見積提出", "提案", "提案", "提案", "提案", "提案",
    "ヒアリング", "ヒアリング", "ヒアリング", "ヒアリング", "初回接触", "初回接触", "初回接触", "初回接触",
  ];
  const dealCustomers = [...prospects, ...advertisers.slice(0, 10)];
  dealCustomers.forEach((cu, i) => {
    const stage: Stage = i < stagePlan.length ? stagePlan[i] : pick(["提案", "見積提出", "ヒアリング", "交渉"] as Stage[]);
    const created = subDays(today, int(8, 75));
    const months = pick([6, 12, 12, 12, 24]);
    const budget = pick([4, 6, 8, 12, 15, 18, 24, 30, 36]) * 10000;
    const naOffset = [-4, -2, -1, 0, 0, 0, 1, 1, 2, 3, 4, 5, 7, 9, 12][i % 15];
    const id = `d${String(i + 1).padStart(3, "0")}`;
    const repId = i < 12 ? "u01" : cu.repId;
    deals.push({
      id,
      customerId: cu.id,
      title: `${pick(DEAL_TITLES)}`,
      stage,
      monthlyBudget: budget,
      months,
      expectedClose: iso(addDays(today, int(5, 70))),
      repId,
      nextAction: i % 11 === 10 ? null : { date: iso(addDays(today, naOffset)), content: pick(NEXT_CONTENTS) },
      createdAt: iso(created),
      updatedAt: iso(subDays(today, int(0, 6))),
    });
    cu.repId = repId;
    const n = int(2, 5);
    for (let k = 0; k < n; k++) {
      const type = k === 0 ? "訪問" : pick(ACTIVITY_TYPES);
      const d = subDays(today, Math.max(1, Math.round(((n - k) / n) * (created.getTime() < today.getTime() ? (today.getTime() - created.getTime()) / 86400000 : 5))));
      activities.push({
        id: `a${String(activities.length + 1).padStart(4, "0")}`,
        customerId: cu.id,
        dealId: id,
        type,
        date: dt(d),
        memo: pick(ACT_MEMOS[type]),
        repId,
      });
    }
  });
  // 失注・成約済の履歴も少し
  [advertisers[12], advertisers[13]].forEach((cu, i) => {
    deals.push({
      id: `d${String(deals.length + 1).padStart(3, "0")}`,
      customerId: cu.id,
      title: i === 0 ? "周年記念キャンペーン" : "求人・採用告知",
      stage: "失注",
      monthlyBudget: 80000,
      months: 6,
      expectedClose: iso(subDays(today, 20)),
      repId: cu.repId,
      nextAction: null,
      createdAt: iso(subDays(today, 70)),
      updatedAt: iso(subDays(today, 18)),
      lostReason: i === 0 ? "予算不足" : "Web広告を優先",
    });
  });

  // ---- 仮押さえ(空いている面に) ----
  const holds: Hold[] = [];
  const busy = (faceId: string, a: string, b: string) =>
    contracts.some((c) => c.faceIds.includes(faceId) && c.startMonth <= b && (c.cancelMonth ?? c.endMonth) >= a) ||
    holds.some((h) => h.faceId === faceId && h.startMonth <= b && h.endMonth >= a);
  const holdDeals = deals.filter((d) => d.stage === "交渉" || d.stage === "見積提出" || d.stage === "提案").slice(0, 10);
  const allFaces = boards.filter((b) => b.installMonth <= cur).flatMap((b) => b.faces.map((f) => ({ b, f })));
  let fi = 3;
  holdDeals.forEach((d, i) => {
    const want = i % 3 === 0 ? 2 : 1;
    let made = 0;
    for (let tries = 0; tries < allFaces.length && made < want; tries++) {
      const { f } = allFaces[(fi += 7) % allFaces.length];
      const s = addMonthKey(cur, i < 3 ? 0 : int(1, 3));
      const e = addMonthKey(s, Math.min(d.months, 12) - 1);
      if (busy(f.id, s, e)) continue;
      holds.push({
        id: `p${String(holds.length + 1).padStart(3, "0")}`,
        faceId: f.id,
        dealId: d.id,
        startMonth: s,
        endMonth: e,
        expiresAt: iso(addDays(today, i === 4 ? -1 : [2, 5, 9, 12, 3, 14, 7, 20, 6, 11][i])),
        repId: d.repId,
        createdAt: iso(subDays(today, int(2, 10))),
      });
      made++;
    }
  });

  return { boards, customers, deals, activities, holds, contracts, lands, handovers };
}

// ======================= 経営集計(全社規模のベース値) =======================
export const COMPANY = {
  totalFaces: 17000,
  salesReps: 170,
};

export interface BranchStat {
  branch: string;
  area: Area;
  reps: number;
  faces: number;
  occupancy: number; // %
  newAd: number; // 月間
  cancelAd: number;
  newLand: number;
}
export const BRANCHES: BranchStat[] = [
  { branch: "大阪本社", area: "大阪", reps: 62, faces: 6120, occupancy: 88.4, newAd: 84, cancelAd: 41, newLand: 66 },
  { branch: "神戸支店", area: "兵庫", reps: 34, faces: 3740, occupancy: 85.1, newAd: 45, cancelAd: 26, newLand: 41 },
  { branch: "京都支店", area: "京都", reps: 28, faces: 2890, occupancy: 86.7, newAd: 38, cancelAd: 19, newLand: 37 },
  { branch: "奈良営業所", area: "奈良", reps: 16, faces: 1560, occupancy: 79.2, newAd: 19, cancelAd: 12, newLand: 21 },
  { branch: "滋賀営業所", area: "滋賀", reps: 14, faces: 1410, occupancy: 77.8, newAd: 17, cancelAd: 11, newLand: 18 },
  { branch: "和歌山営業所", area: "和歌山", reps: 16, faces: 1280, occupancy: 74.5, newAd: 15, cancelAd: 10, newLand: 17 },
];

/** 過去12ヶ月 + 当月の全社推移(固定シードで毎回同じ形) */
export function companySeries() {
  const rnd = mulberry32(777);
  const cur = monthKey(new Date());
  return Array.from({ length: 12 }, (_, i) => {
    const m = addMonthKey(cur, i - 11);
    const season = Math.sin(((Number(m.slice(5)) - 3) / 12) * Math.PI * 2);
    return {
      month: m,
      newAd: Math.round(212 + season * 14 + rnd() * 18 - 6 + i * 0.6),
      cancelAd: Math.round(118 + rnd() * 16 - 8 - season * 5),
      newLand: Math.round(196 + rnd() * 18 - 9 + season * 6),
      occupancy: 82.6 + i * 0.21 + (rnd() - 0.5) * 0.4,
      revenue: Math.round((5.72 + i * 0.034 + (rnd() - 0.5) * 0.06) * 1e8),
    };
  });
}

