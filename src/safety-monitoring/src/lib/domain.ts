import type {
  Alert,
  AlertKind,
  Severity,
  UserStatus,
  Watchee,
} from "../data/seed";

// ---------------- 状態の導出 ----------------
/** 未対応/対応中アラートと通信状況から利用者の総合ステータスを導出する */
export function statusOf(user: Watchee, alerts: Alert[]): UserStatus {
  if (!user.online) return "オフライン";
  const active = alerts.filter((a) => a.userId === user.id && a.status !== "対応済");
  if (active.some((a) => a.severity === "高")) return "異常";
  if (active.some((a) => a.severity === "中")) return "注意";
  return "正常";
}

// ---------------- 配色トーン ----------------
export type Tone = "gray" | "green" | "amber" | "red" | "blue";

export const STATUS_TONE: Record<UserStatus, Tone> = {
  正常: "green",
  注意: "amber",
  異常: "red",
  オフライン: "gray",
};

export const SEVERITY_TONE: Record<Severity, Tone> = {
  高: "red",
  中: "amber",
  低: "blue",
};

export const ALERT_STATUS_TONE: Record<string, Tone> = {
  未対応: "red",
  対応中: "amber",
  対応済: "green",
};

// ---------------- 検証用イベント定義(ダミーデータ入力) ----------------
export interface EventDef {
  kind: AlertKind;
  severity: Severity;
  desc: string; // シミュレータ画面での説明
  /** アラート本文を生成し、対象者のライブ値へ与える変化を返す */
  build: (u: Watchee) => { message: string; patch: Partial<Watchee> };
}

export const EVENT_CATALOG: EventDef[] = [
  {
    kind: "転倒検知",
    severity: "高",
    desc: "加速度センサーが強い衝撃を検出した状況を再現します。",
    build: (u) => ({
      message: "転倒を検知しました。加速度センサーが強い衝撃を検出。至急、安否確認をお願いします。",
      patch: { hr: u.restingHR + 28 },
    }),
  },
  {
    kind: "心拍異常",
    severity: "高",
    desc: "安静時基準を大きく超える心拍数を再現します。",
    build: (u) => {
      const hr = u.restingHR + 52 + Math.floor(Math.random() * 14);
      return {
        message: `心拍数が ${hr}bpm に上昇。安静時基準(${u.restingHR}bpm)を大きく超過しています。`,
        patch: { hr },
      };
    },
  },
  {
    kind: "長時間不動",
    severity: "中",
    desc: "一定時間、体動が検出されない状況を再現します。",
    build: () => ({
      message: "60分以上、体動が確認できません。安否確認を推奨します。",
      patch: {},
    }),
  },
  {
    kind: "離設検知",
    severity: "中",
    desc: "見守り範囲(ジオフェンス)からの逸脱を再現します。",
    build: () => ({
      message: "見守り範囲(半径300m)からの逸脱を検知しました。位置情報を確認してください。",
      patch: {},
    }),
  },
  {
    kind: "低バッテリー",
    severity: "低",
    desc: "デバイス残量の低下を再現します。",
    build: () => {
      const battery = 6 + Math.floor(Math.random() * 9);
      return {
        message: `デバイス残量が ${battery}% です。充電をご案内ください。`,
        patch: { battery },
      };
    },
  },
  {
    kind: "未装着",
    severity: "低",
    desc: "デバイスが外れている状況を再現します。",
    build: () => ({
      message: "デバイスが装着されていない可能性があります。装着状況をご確認ください。",
      patch: { wearing: false },
    }),
  },
];

/** ライブ監視シミュレーションで自動発生させる候補イベント */
export const LIVE_EVENTS = EVENT_CATALOG.filter((e) => e.kind !== "未装着");

/** 端末HRの疑似波形を生成(詳細画面の推移グラフ用) */
export function synthHR(user: Watchee, points = 24): { t: string; hr: number }[] {
  if (!user.online) return [];
  const base = user.restingHR;
  const out: { t: string; hr: number }[] = [];
  for (let i = points - 1; i >= 0; i--) {
    const wobble = Math.sin(i / 2.4) * 4 + (Math.random() * 6 - 3);
    const drift = i === 0 ? user.hr - base : 0;
    const hr = Math.round(base + wobble + drift);
    out.push({ t: `-${i * 5}分`, hr: Math.max(48, hr) });
  }
  return out;
}
