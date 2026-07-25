import { subDays, subHours, subMinutes } from "date-fns";

// ---------------- 型 ----------------
export type Severity = "高" | "中" | "低";
export type AlertStatus = "未対応" | "対応中" | "対応済";
export type AlertKind =
  | "転倒検知"
  | "心拍異常"
  | "長時間不動"
  | "離設検知"
  | "低バッテリー"
  | "未装着"
  | "オフライン";
export type UserStatus = "正常" | "注意" | "異常" | "オフライン";

/** 見守り対象者(ウェアラブル端末を装着した利用者) */
export interface Watchee {
  id: string;
  name: string;
  kana: string;
  age: number;
  gender: "男" | "女";
  care: string; // 要介護度
  plan: "施設" | "在宅";
  location: string; // 居室 or 住所エリア
  device: string; // Apple Watch モデル
  deviceId: string;
  color: string; // アバター色
  restingHR: number; // 安静時心拍の基準値
  // --- ライブ値(監視でドリフトする) ---
  hr: number;
  steps: number;
  battery: number;
  online: boolean;
  wearing: boolean;
  lastSyncAt: string;
}

export interface Alert {
  id: string;
  userId: string;
  userName: string;
  kind: AlertKind;
  severity: Severity;
  message: string;
  at: string;
  status: AlertStatus;
}

export interface AppData {
  users: Watchee[];
  alerts: Alert[];
}

export const CURRENT_USER = { name: "見守りセンター 当直", role: "オペレーター" };

// ---------------- ダミー人物 ----------------
const COLORS = [
  "#0d9488", "#0891b2", "#4f46e5", "#7c3aed", "#db2777",
  "#ea580c", "#ca8a04", "#16a34a", "#0284c7", "#9333ea",
];

type PersonSeed = [
  name: string,
  kana: string,
  age: number,
  gender: "男" | "女",
  care: string,
  plan: "施設" | "在宅",
  location: string,
  device: string,
];

const PEOPLE: PersonSeed[] = [
  ["佐藤 千代", "サトウ チヨ", 84, "女", "要介護2", "施設", "A棟 201号室", "Apple Watch SE"],
  ["鈴木 正一", "スズキ ショウイチ", 78, "男", "要支援2", "在宅", "北区・戸建て", "Apple Watch Series 8"],
  ["高橋 ハル", "タカハシ ハル", 88, "女", "要介護3", "施設", "A棟 205号室", "Apple Watch SE"],
  ["田中 茂", "タナカ シゲル", 81, "男", "要介護1", "施設", "B棟 302号室", "Apple Watch Series 9"],
  ["伊藤 芳子", "イトウ ヨシコ", 76, "女", "要支援1", "在宅", "中央区・マンション", "Apple Watch Series 8"],
  ["渡辺 健三", "ワタナベ ケンゾウ", 90, "男", "要介護4", "施設", "A棟 108号室", "Apple Watch SE"],
  ["山本 スミ", "ヤマモト スミ", 85, "女", "要介護2", "施設", "B棟 306号室", "Apple Watch SE"],
  ["中村 幸雄", "ナカムラ ユキオ", 73, "男", "自立", "在宅", "南区・戸建て", "Apple Watch Series 9"],
  ["小林 富美", "コバヤシ フミ", 79, "女", "要介護1", "在宅", "西区・アパート", "Apple Watch Series 8"],
  ["加藤 勇", "カトウ イサム", 82, "男", "要介護2", "施設", "A棟 210号室", "Apple Watch SE"],
  ["吉田 きよ", "ヨシダ キヨ", 87, "女", "要介護3", "施設", "B棟 301号室", "Apple Watch SE"],
  ["山田 三郎", "ヤマダ サブロウ", 75, "男", "要支援1", "在宅", "東区・マンション", "Apple Watch Series 8"],
  ["佐々木 とし", "ササキ トシ", 91, "女", "要介護4", "施設", "A棟 103号室", "Apple Watch SE"],
  ["松本 清", "マツモト キヨシ", 80, "男", "要介護1", "施設", "B棟 305号室", "Apple Watch Series 9"],
  ["井上 房子", "イノウエ フサコ", 83, "女", "要介護2", "在宅", "中央区・戸建て", "Apple Watch SE"],
  ["木村 昭夫", "キムラ アキオ", 77, "男", "要支援2", "在宅", "北区・マンション", "Apple Watch Series 8"],
];

// 疑似乱数(seed 固定で毎回同じ初期状態を作る)
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function buildSeed(): AppData {
  const rng = makeRng(20260725);
  const now = new Date();

  const users: Watchee[] = PEOPLE.map((p, i) => {
    const [name, kana, age, gender, care, plan, location, device] = p;
    const restingHR = 60 + Math.floor(rng() * 22); // 60〜82
    const online = i !== 5; // 1名だけオフライン(状態出し分け用)
    return {
      id: `u${i + 1}`,
      name,
      kana,
      age,
      gender,
      care,
      plan,
      location,
      device,
      deviceId: `AW-${(4200 + i * 37).toString().padStart(4, "0")}`,
      color: COLORS[i % COLORS.length],
      restingHR,
      hr: online ? restingHR + Math.floor(rng() * 10) - 3 : 0,
      steps: Math.floor(rng() * 3200) + 180,
      battery: online ? 20 + Math.floor(rng() * 78) : 12,
      online,
      wearing: online,
      lastSyncAt: (online
        ? subMinutes(now, Math.floor(rng() * 4))
        : subHours(now, 3)
      ).toISOString(),
    };
  });

  // --- 履歴アラート(直近3日ぶん) ---
  const A = (
    userIdx: number,
    kind: AlertKind,
    severity: Severity,
    message: string,
    at: Date,
    status: AlertStatus,
  ): Alert => {
    const u = users[userIdx];
    return {
      id: `seed_al_${userIdx}_${kind}_${at.getTime()}`,
      userId: u.id,
      userName: u.name,
      kind,
      severity,
      message,
      at: at.toISOString(),
      status,
    };
  };

  const alerts: Alert[] = [
    A(2, "転倒検知", "高", "居室内で転倒を検知。加速度センサーが強い衝撃を検出しました。", subMinutes(now, 8), "対応中"),
    A(0, "心拍異常", "高", "心拍数が 128bpm に上昇。安静時基準を大きく超過しています。", subMinutes(now, 34), "未対応"),
    A(6, "長時間不動", "中", "60分以上、体動が確認できません。安否確認を推奨します。", subMinutes(now, 52), "未対応"),
    A(1, "離設検知", "中", "見守り範囲(半径300m)からの逸脱を検知しました。", subHours(now, 2), "対応中"),
    A(9, "低バッテリー", "低", "デバイス残量が 14% です。充電をご案内ください。", subHours(now, 3), "対応済"),
    A(11, "未装着", "低", "デバイスが装着されていない可能性があります。", subHours(now, 5), "対応済"),
    A(12, "転倒検知", "高", "浴室前で転倒を検知。職員が駆けつけ対応しました。", subHours(now, 9), "対応済"),
    A(4, "心拍異常", "高", "心拍数が一時的に 119bpm を記録。安静により回復を確認。", subHours(now, 14), "対応済"),
    A(7, "離設検知", "中", "外出時間帯に見守り範囲を逸脱。ご家族へ連絡済み。", subHours(now, 20), "対応済"),
    A(3, "長時間不動", "中", "午睡中に体動なし。訪室にて安否を確認しました。", subDays(now, 1), "対応済"),
    A(10, "低バッテリー", "低", "夜間にデバイス残量が 9% に低下。充電を実施。", subDays(now, 1), "対応済"),
    A(14, "転倒検知", "高", "玄関先で転倒を検知。軽傷、経過観察中。", subDays(now, 1), "対応済"),
    A(5, "オフライン", "低", "デバイスとの通信が3時間途絶。端末の電源を確認中。", subHours(now, 3), "対応中"),
    A(8, "心拍異常", "高", "心拍数が 122bpm を記録。かかりつけ医へ情報共有済み。", subDays(now, 2), "対応済"),
  ];

  return { users, alerts };
}
