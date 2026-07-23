import { subDays } from "date-fns";

/* =========================================================================
 * GA4 解析＆改善提案 自動レポートエージェント — シードデータ
 *
 * 想定業務:
 *   GA4(Google Analytics Data API)から日次でアクセスデータを取得 →
 *   AI が状況を要約し KPI 進捗を評価 → 改善提案を生成 →
 *   整形したレポートを週次で Google Chat のスペースへ自動通知する。
 *
 * ここに入っているのはすべて自作のダミーデータ(実在の企業・個人ではない)。
 * 発注元は「○○株式会社」として伏字にしている。
 * ========================================================================= */

const iso = (d: Date) => d.toISOString();

// ---- 型定義 --------------------------------------------------------------

/** GA4 の 1 日分の主要指標 */
export interface DailyMetric {
  date: string; // ISO(その日の 00:00)
  pv: number; // ページビュー
  users: number; // ユーザー数
  sessions: number; // セッション数
  conversions: number; // コンバージョン数
}

/** 流入チャネル別の内訳(直近 28 日集計) */
export interface Channel {
  key: string;
  label: string;
  users: number;
  sessions: number;
  conversions: number;
  color: string;
}

/** KPI 目標(月次=直近 28 日で評価) */
export type KpiMetric = "users" | "conversions" | "cvr" | "organicRatio";

export interface Kpi {
  id: string;
  label: string;
  metric: KpiMetric;
  target: number;
  unit: string;
  higherIsBetter: boolean;
}

/** AI が生成する改善提案 */
export type Priority = "高" | "中" | "低";

export interface Proposal {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  impact: string; // 期待効果
  detail: string; // 具体的な打ち手
  basis: string; // データ上の根拠
}

/** Google Chat への通知履歴 */
export type SendStatus = "送信成功" | "送信失敗";

export interface Notification {
  id: string;
  sentAt: string;
  title: string;
  period: string; // 対象期間の表示
  space: string; // 宛先スペース名
  status: SendStatus;
  trigger: "週次自動" | "月次自動" | "手動";
  headline: string; // 本文冒頭の要約
}

export interface Settings {
  propertyName: string; // GA4 プロパティ名(伏字)
  propertyId: string; // GA4 プロパティ ID(ダミー)
  spaceName: string; // Google Chat スペース名
  webhookMasked: string; // Webhook URL(マスク表示)
  webhookConnected: boolean;
  freq: "weekly" | "monthly";
  weekday: number; // 0=日 .. 6=土(週次)
  hour: number; // 送信時刻(時)
  includeProposals: boolean; // 改善提案を本文に含める
  autoSend: boolean; // 自動送信の有効/無効
}

export interface AppData {
  metrics: DailyMetric[];
  channels: Channel[];
  kpis: Kpi[];
  proposals: Proposal[];
  notifications: Notification[];
  settings: Settings;
}

// ---- 日次メトリクスの生成(90 日・今日基準) -----------------------------
//
// 実データっぽく見せるため:曜日変動(週末は減少)・ゆるやかな右肩上がり・
// 施策が効いた直近 2 週間のわずかな上振れ、を決定論的に合成する。

function buildMetrics(): DailyMetric[] {
  const days = 90;
  const out: DailyMetric[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(new Date(), i);
    d.setHours(0, 0, 0, 0);
    const dow = d.getDay();
    const idx = days - 1 - i; // 0(古) → 89(新)

    // 緩やかな成長トレンド
    const trend = 1 + idx * 0.0042;
    // 週末の落ち込み
    const weekend = dow === 0 || dow === 6 ? 0.72 : 1;
    // 決定論的な日次ゆらぎ(擬似ノイズ)
    const wobble = 1 + 0.08 * Math.sin(idx * 1.3) + 0.05 * Math.cos(idx * 0.7);
    // 直近 2 週間の施策効果(LP 改善が効いた想定)
    const recentLift = idx >= days - 14 ? 1 + (idx - (days - 15)) * 0.006 : 1;

    const base = 1180; // 基準ユーザー数
    const users = Math.round(base * trend * weekend * wobble * recentLift);
    const sessions = Math.round(users * (1.28 + 0.05 * Math.sin(idx * 0.5)));
    const pv = Math.round(sessions * (2.9 + 0.3 * Math.cos(idx * 0.4)));
    // CV 率は直近ほど改善(2.4% → 3.2% 前後)
    const cvr = 0.024 + idx * 0.00009 + 0.0015 * Math.sin(idx * 0.9);
    const conversions = Math.max(6, Math.round(sessions * cvr));

    out.push({ date: iso(d), pv, users, sessions, conversions });
  }
  return out;
}

const METRICS = buildMetrics();

// ---- チャネル内訳(直近 28 日) -------------------------------------------

function buildChannels(): Channel[] {
  const last28 = METRICS.slice(-28);
  const tUsers = last28.reduce((a, m) => a + m.users, 0);
  const tSess = last28.reduce((a, m) => a + m.sessions, 0);
  const tCv = last28.reduce((a, m) => a + m.conversions, 0);

  // 構成比(合計 1.0)。CV は Organic / Paid に厚めに寄せる。
  const defs = [
    { key: "organic", label: "オーガニック検索", u: 0.41, c: 0.44, color: "oklch(62% 0.17 272)" },
    { key: "direct", label: "ダイレクト", u: 0.22, c: 0.2, color: "oklch(70% 0.14 273)" },
    { key: "referral", label: "リファラル", u: 0.12, c: 0.1, color: "oklch(64% 0.15 155)" },
    { key: "social", label: "ソーシャル", u: 0.15, c: 0.09, color: "oklch(74% 0.16 62)" },
    { key: "paid", label: "有料検索", u: 0.1, c: 0.17, color: "oklch(66% 0.16 30)" },
  ];
  return defs.map((d) => ({
    key: d.key,
    label: d.label,
    users: Math.round(tUsers * d.u),
    sessions: Math.round(tSess * d.u),
    conversions: Math.round(tCv * d.c),
    color: d.color,
  }));
}

// ---- KPI 目標 ------------------------------------------------------------

const KPIS: Kpi[] = [
  { id: "kpi_users", label: "月間ユーザー数", metric: "users", target: 42000, unit: "人", higherIsBetter: true },
  { id: "kpi_cv", label: "月間コンバージョン数", metric: "conversions", target: 1400, unit: "件", higherIsBetter: true },
  { id: "kpi_cvr", label: "コンバージョン率", metric: "cvr", target: 3.2, unit: "%", higherIsBetter: true },
  { id: "kpi_organic", label: "オーガニック流入比率", metric: "organicRatio", target: 45, unit: "%", higherIsBetter: true },
];

// ---- AI 改善提案(初期セット) --------------------------------------------

const PROPOSALS: Proposal[] = [
  {
    id: "p1",
    title: "トップLPのファーストビューにCTAを追加",
    category: "CVR改善",
    priority: "高",
    impact: "CV率 +0.4pt / 月間CV +170件 見込み",
    detail:
      "トップページのファーストビュー内に主要導線(資料請求)のボタンを設置。現状はスクロール2画面目以降にしか導線がなく、離脱直前のユーザーを取りこぼしています。ボタン文言は「無料で資料を受け取る」を推奨。",
    basis: "トップページの直帰率が 58.2% と全ページ平均(41.0%)より高く、CV前の主要離脱点になっています。",
  },
  {
    id: "p2",
    title: "「料金」ページの内部リンク導線を強化",
    category: "回遊改善",
    priority: "高",
    impact: "回遊率 +12% / 補助的にCVへ寄与",
    detail:
      "料金ページからよくある質問・導入事例への内部リンクを追加し、比較検討中ユーザーの不安を解消する導線を作ります。関連ページ3枚をカード形式で下部に配置。",
    basis: "料金ページの平均エンゲージメント時間は 2分18秒と長く関心は高い一方、次ページ遷移率が 21% に留まっています。",
  },
  {
    id: "p3",
    title: "モバイルのページ表示速度を改善",
    category: "技術改善",
    priority: "中",
    impact: "モバイル直帰率 -6pt 見込み",
    detail:
      "ヒーロー画像の遅延読み込みと WebP 化、未使用CSSの削減で LCP を短縮します。まずはトップと料金ページの2枚を優先対応。",
    basis: "モバイルのCV率(2.1%)がPC(4.0%)の約半分。表示速度に起因する初期離脱が疑われます。",
  },
  {
    id: "p4",
    title: "オーガニック流入キーワードに沿ったFAQ拡充",
    category: "SEO・集客",
    priority: "中",
    impact: "オーガニック流入 +8% 見込み",
    detail:
      "検索流入の多い比較・料金系クエリに対応するFAQ記事を3本追加し、検討層の受け皿を広げます。既存の導入事例ページへの内部リンクも合わせて設置。",
    basis: "オーガニック流入は前月比 +9.4% と好調で、指名外クエリの伸びが顕著。受け皿ページの拡充で伸びしろがあります。",
  },
  {
    id: "p5",
    title: "有料検索のLPを検索意図別に出し分け",
    category: "広告改善",
    priority: "低",
    impact: "有料検索CV率 +0.5pt 見込み",
    detail:
      "現在すべての広告がトップページに着地しています。「料金重視」「事例重視」の2パターンの専用LPへ出し分け、広告文とLPの一貫性を高めます。",
    basis: "有料検索は流入比10%に対しCV寄与17%と効率が高い一方、LP直帰率が63%と改善余地があります。",
  },
];

// ---- 通知履歴(初期・今日基準の相対日付) --------------------------------

const SPACE = "マーケ定例 / Web解析";

function buildNotifications(): Notification[] {
  const mk = (
    daysAgo: number,
    hour: number,
    period: string,
    headline: string,
    trigger: Notification["trigger"],
    status: SendStatus = "送信成功",
  ): Notification => {
    const d = subDays(new Date(), daysAgo);
    d.setHours(hour, 0, 0, 0);
    return {
      id: `nt_${daysAgo}_${hour}`,
      sentAt: iso(d),
      title: trigger === "月次自動" ? "月次アクセス解析レポート" : "週次アクセス解析レポート",
      period,
      space: SPACE,
      status,
      trigger,
      headline,
    };
  };
  return [
    mk(7, 9, "先週(月〜日)", "ユーザー数が前週比 +6.8%。オーガニック流入の伸びが牽引しました。", "週次自動"),
    mk(14, 9, "2週間前(月〜日)", "CV率が 2.9% → 3.0% に改善。料金ページの回遊が向上。", "週次自動"),
    mk(21, 9, "3週間前(月〜日)", "PVは横ばい。ソーシャル流入が一時的に減少しています。", "週次自動"),
    mk(28, 9, "先月(1日〜末日)", "月次サマリー:主要4KPIのうち3項目が目標ペース。", "月次自動"),
  ];
}

// ---- 初期設定 ------------------------------------------------------------

const SETTINGS: Settings = {
  propertyName: "○○株式会社 コーポレートサイト",
  propertyId: "GA4-4•••••217",
  spaceName: SPACE,
  webhookMasked: "https://chat.googleapis.com/v1/spaces/AAAA••••/messages?key=•••",
  webhookConnected: true,
  freq: "weekly",
  weekday: 1, // 月曜
  hour: 9,
  includeProposals: true,
  autoSend: true,
};

// ---- エクスポート --------------------------------------------------------

export function buildSeed(): AppData {
  return {
    metrics: METRICS,
    channels: buildChannels(),
    kpis: KPIS,
    proposals: PROPOSALS,
    notifications: buildNotifications(),
    settings: SETTINGS,
  };
}

export const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
