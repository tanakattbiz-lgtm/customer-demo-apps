import { subDays, setHours, setMinutes } from "date-fns";

// ── 発注元(店舗)の名称は伏字(絶対ルール11)──
export const STORE_NAME = "○○コーヒースタンド";
export const STORE_BRANCH = "けやき通り店";

export type PayMethod = "クレジット" | "PayPay" | "交通系IC" | "d払い" | "楽天ペイ";
export const PAY_METHODS: PayMethod[] = ["クレジット", "PayPay", "交通系IC", "d払い", "楽天ペイ"];

export type TipStatus = "受取済" | "精算待ち" | "精算済";

export interface Staff {
  id: string;
  name: string;
  role: string; // 役職
  color: string; // アバター色(oklch)
  active: boolean;
  joinedAt: string; // 入店日
  handle: string; // チップページ用スラッグ(QR に埋め込む想定)
}

export interface Tip {
  id: string;
  staffId: string;
  amount: number;
  message?: string;
  from: string; // 送り主のニックネーム(匿名可)
  method: PayMethod;
  at: string; // ISO
  status: TipStatus;
}

export interface AppData {
  staff: Staff[];
  tips: Tip[];
}

export const CURRENT_ADMIN = { name: "店長 / 高橋 結衣", role: "店舗管理者" };

// アバター用のやわらかい配色
const COLORS = [
  "oklch(62% 0.16 35)",
  "oklch(58% 0.13 250)",
  "oklch(60% 0.14 160)",
  "oklch(60% 0.16 300)",
  "oklch(64% 0.15 90)",
  "oklch(58% 0.15 20)",
  "oklch(60% 0.13 200)",
  "oklch(62% 0.14 130)",
];

const STAFF_DEF: Omit<Staff, "id" | "color" | "active" | "joinedAt" | "handle">[] = [
  { name: "佐藤 美咲", role: "バリスタ" },
  { name: "田中 陽向", role: "ホールスタッフ" },
  { name: "鈴木 蓮", role: "キッチン" },
  { name: "山本 大和", role: "バリスタ" },
  { name: "中村 楓", role: "ホールスタッフ" },
  { name: "小林 颯太", role: "キッチン" },
  { name: "加藤 さくら", role: "ホールスタッフ" },
  { name: "渡辺 悠真", role: "バリスタ" },
];

const MESSAGES = [
  "いつも笑顔で対応してくれてありがとう!",
  "ラテアート最高でした☕",
  "おすすめのケーキ、すごく美味しかったです",
  "丁寧な接客に感謝です。また来ます!",
  "忙しい中ありがとうございました",
  "元気をもらいました。応援してます!",
  "コーヒーの淹れ方、いつも勉強になります",
  "テキパキした対応が気持ちよかったです",
  "子ども連れに優しくしてくれて助かりました",
  "今日も一杯美味しかったです",
  "",
  "",
  "",
];

const NICKS = [
  "常連のK",
  "ゆうこ",
  "近所の者",
  "コーヒー好き",
  "はじめて来ました",
  "在宅ワーカー",
  "朝の常連",
  "M.S",
  "匿名の応援",
  "また来ます",
  "けやき通りの住人",
  "散歩帰り",
];

// 決定論的な擬似乱数(シード固定でデモの見た目を安定させる)
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const AMOUNTS = [100, 100, 200, 300, 300, 300, 500, 500, 500, 800, 1000, 1000, 1500, 2000, 3000];

export const CURRENT_STAFF_ID = "stf_1"; // チップページの初期選択

export function buildSeed(): AppData {
  const rng = makeRng(20260722);

  const staff: Staff[] = STAFF_DEF.map((d, i) => ({
    ...d,
    id: `stf_${i + 1}`,
    color: COLORS[i % COLORS.length],
    active: i !== 7, // 1名は休止中(状態出し分けの確認用)
    joinedAt: subDays(new Date(), 120 + i * 40).toISOString(),
    handle: `staff-${String(i + 1).padStart(2, "0")}`,
  }));
  const activeStaff = staff.filter((s) => s.active);

  const tips: Tip[] = [];
  let n = 0;
  // 直近14日分。夕方に多め・人気スタッフに偏らせて「本物っぽさ」を出す。
  for (let day = 13; day >= 0; day--) {
    const base = subDays(new Date(), day);
    const isWeekend = [0, 6].includes(base.getDay());
    const count = Math.floor((isWeekend ? 4 : 2) + rng() * 4);
    for (let k = 0; k < count; k++) {
      const s = activeStaff[Math.floor(rng() * rng() * activeStaff.length)]; // 若い index に偏る=人気差
      const hour = 8 + Math.floor(rng() * 12);
      const minute = Math.floor(rng() * 60);
      let at = setMinutes(setHours(base, hour), minute);
      if (day === 0) {
        // 今日の分は「今」より前に収める
        const now = new Date();
        if (at.getTime() > now.getTime()) at = subDays(now, 0);
      }
      const amount = AMOUNTS[Math.floor(rng() * AMOUNTS.length)];
      const msg = MESSAGES[Math.floor(rng() * MESSAGES.length)];
      // 古い受取ほど精算済み、直近は受取済/精算待ち
      let status: TipStatus = "受取済";
      if (day > 7) status = "精算済";
      else if (day > 2) status = rng() > 0.5 ? "精算待ち" : "精算済";
      tips.push({
        id: `tip_${(n++).toString(36)}`,
        staffId: s.id,
        amount,
        message: msg || undefined,
        from: NICKS[Math.floor(rng() * NICKS.length)],
        method: PAY_METHODS[Math.floor(rng() * PAY_METHODS.length)],
        at: at.toISOString(),
        status,
      });
    }
  }
  tips.sort((a, b) => +new Date(b.at) - +new Date(a.at));
  return { staff, tips };
}
