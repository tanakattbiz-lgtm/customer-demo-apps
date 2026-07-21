import { subMinutes } from "date-fns";

// ===================================================================
//  レースデータ取得・自動掲載 管理ダッシュボード — ダミーデータ生成
//  ※ 実在の競走馬・騎手・レースではありません。すべて架空の自作データです。
// ===================================================================

// ---- 枠番カラー(JRA 標準の 8 色。結果テーブルの装飾に使用) ----
export const FRAME_COLORS: Record<number, { bg: string; fg: string; ring?: string }> = {
  1: { bg: "#ffffff", fg: "#1b1b1b", ring: "#c9ccd1" },
  2: { bg: "#1b1b1b", fg: "#ffffff" },
  3: { bg: "#e0322b", fg: "#ffffff" },
  4: { bg: "#2a6ff0", fg: "#ffffff" },
  5: { bg: "#f4c81e", fg: "#1b1b1b" },
  6: { bg: "#159a51", fg: "#ffffff" },
  7: { bg: "#f0801f", fg: "#ffffff" },
  8: { bg: "#f18fb6", fg: "#1b1b1b" },
};

// ---- 状態 ----
// 出走表(番組表)生成のステータス
export type CardStatus = "未生成" | "生成済" | "公開済";
// 確定結果のステータス
export type ResultStatus = "発走前" | "確定" | "掲載済";

export type LogLevel = "info" | "success" | "warn" | "error";

export interface Entry {
  no: number; // 馬番
  frame: number; // 枠番
  horse: string; // 馬名
  sexAge: string; // 性齢(牡4 等)
  jockey: string; // 騎手
  weight: number; // 斤量
  odds: number; // 単勝オッズ
  pop: number; // 人気
  bodyWeight: number; // 馬体重
  bodyDiff: number; // 増減
}

export interface ResultRow {
  place: number; // 着順
  no: number; // 馬番
  frame: number;
  horse: string;
  jockey: string;
  pop: number;
  odds: number;
  time: string; // タイム
  margin: string; // 着差
  passing: string; // 通過順位
  bodyWeight: number;
  bodyDiff: number;
}

export interface Payout {
  label: string; // 式別
  combo: string; // 組み合わせ
  yen: number; // 払戻金(100円あたり)
  pop: number; // 人気
}

export interface Race {
  id: string;
  meetingId: string;
  track: string; // 競馬場
  no: number; // R
  name: string; // レース名
  grade?: string; // G1 / OP など
  start: string; // 発走時刻 "HH:mm"
  distance: number; // 距離(m)
  surface: "芝" | "ダート";
  headcount: number; // 頭数
  cardStatus: CardStatus;
  resultStatus: ResultStatus;
  cardPublishedAt?: string; // ISO
  resultPublishedAt?: string; // ISO
  entries: Entry[];
  result?: ResultRow[];
  payouts?: Payout[];
  winTime?: string; // 勝ちタイム
}

export interface Meeting {
  id: string;
  track: string; // 競馬場
  kai: number; // 開催回
  day: number; // 開催日目
  weather: string;
  going: string; // 馬場状態
}

export interface LogEntry {
  id: string;
  at: string; // ISO
  level: LogLevel;
  job: string; // ジョブ種別
  raceId?: string;
  raceLabel?: string; // "東京 11R" 等
  message: string;
}

export interface AppData {
  meetings: Meeting[];
  races: Race[];
  logs: LogEntry[];
}

// ---- 決定的な擬似乱数(ビルドのたびに同じデータが出るように) ----
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}
const pick = <T,>(r: () => number, arr: T[]): T => arr[Math.floor(r() * arr.length)];
const rint = (r: () => number, min: number, max: number) => min + Math.floor(r() * (max - min + 1));

// ---- 名前プール(すべて架空) ----
const HORSE_PARTS_A = [
  "サクラ", "メイショウ", "ヒカリ", "ゴールド", "シルバー", "テイエム", "ダイワ", "ナリタ",
  "トウカイ", "マチカネ", "ロード", "キタサン", "エイシン", "スマート", "ヴィクトリー", "ミラクル",
  "アドマイヤ", "コスモ", "サトノ", "タイキ", "ウイニング", "シゲル", "セイウン", "マイネル",
];
const HORSE_PARTS_B = [
  "ブレイヴ", "ソレイユ", "ノヴァ", "リアン", "クレスト", "オーロラ", "パイオニア", "エターナル",
  "ラプソディ", "グロウ", "テソーロ", "ミラージュ", "ゼファー", "アリエス", "フェリシア", "ルミナス",
  "トルネード", "カレント", "ブロッサム", "ホライゾン", "レガシー", "セレーネ", "アバンチュール", "コメット",
];
const JOCKEYS = [
  "武内", "佐々木", "藤田", "岩崎", "川端", "松村", "戸崎", "石橋",
  "横山", "田辺", "西村", "北村", "菅原", "坂井", "永野", "内田",
  "秋山", "浜中", "和田", "河原", "国分", "亀山",
];

const RACE_NAMES_NORMAL = [
  "3歳未勝利", "3歳1勝クラス", "2歳新馬", "サラ系一般", "4歳以上1勝クラス",
  "4歳以上2勝クラス", "3歳以上3勝クラス", "牝馬限定 1勝クラス",
];
const RACE_NAMES_SPECIAL = [
  { name: "菖蒲特別", grade: undefined },
  { name: "青嵐賞", grade: undefined },
  { name: "夏木立オープン", grade: "OP" },
  { name: "涼風ステークス", grade: "L" },
];
const FEATURE = { name: "みなづきカップ", grade: "G3" };

const TRACKS = [
  { track: "東京", kai: 3, day: 6, weather: "晴", going: "良" },
  { track: "福島", kai: 2, day: 4, weather: "曇", going: "稍重" },
  { track: "中京", kai: 4, day: 3, weather: "晴", going: "良" },
];

// 開催ごとの「消化済みレース数」= もう発走が終わっているレース数(全12R中)
const PROGRESS: Record<string, number> = { 東京: 8, 福島: 7, 中京: 6 };
// そのうち末尾いくつを「確定(掲載待ち)」のまま残すか
const PENDING: Record<string, number> = { 東京: 2, 福島: 1, 中京: 2 };

function buildEntries(r: () => number, headcount: number): Entry[] {
  // 枠番の割り当て(頭数を 8 枠へなるべく均等に、余りは若い枠から)
  const base = Math.floor(headcount / 8);
  const extra = headcount % 8;
  const frameCounts = Array.from({ length: 8 }, (_, i) => base + (i < extra ? 1 : 0));
  const frameByIndex: number[] = [];
  for (let f = 1; f <= 8; f++) for (let k = 0; k < frameCounts[f - 1]; k++) frameByIndex.push(f);

  // 人気(オッズ)を作る:1〜headcount のランク
  const pops = Array.from({ length: headcount }, (_, i) => i + 1);
  // シャッフルして馬番へ人気を割り当て
  for (let i = pops.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [pops[i], pops[j]] = [pops[j], pops[i]];
  }

  return Array.from({ length: headcount }, (_, i) => {
    const no = i + 1;
    const pop = pops[i];
    // 人気からオッズを逆算(1番人気ほど低オッズ)
    const oddsBase = [1.8, 3.6, 5.2, 7.4, 9.8, 13, 18, 24, 33, 45, 60, 80, 110, 150, 200, 280, 380, 500];
    const odds = +(oddsBase[Math.min(pop - 1, oddsBase.length - 1)] * (0.85 + r() * 0.4)).toFixed(1);
    const bw = rint(r, 440, 522);
    return {
      no,
      frame: frameByIndex[i],
      horse: pick(r, HORSE_PARTS_A) + pick(r, HORSE_PARTS_B),
      sexAge: pick(r, ["牡", "牝", "セ"]) + rint(r, 2, 6),
      jockey: pick(r, JOCKEYS),
      weight: pick(r, [54, 55, 56, 57, 53, 54.5, 55.5]),
      odds,
      pop,
      bodyWeight: bw,
      bodyDiff: rint(r, -14, 14),
    };
  });
}

function buildResult(r: () => number, entries: Entry[], distance: number): { rows: ResultRow[]; payouts: Payout[]; winTime: string } {
  // 人気順を基準に、多少の波乱を混ぜて着順を決める
  const ordered = [...entries].sort((a, b) => a.pop - b.pop);
  // 上位人気の一部を入れ替えて波乱を演出
  for (let i = 0; i < ordered.length - 1; i++) {
    if (r() < 0.28) [ordered[i], ordered[i + 1]] = [ordered[i + 1], ordered[i]];
  }

  // 勝ちタイム(距離から概算)
  const secPer200 = 12.0 + r() * 0.6;
  const totalSec = (distance / 200) * secPer200;
  const fmtTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec - m * 60;
    return `${m}:${s.toFixed(1).padStart(4, "0")}`;
  };
  const winTime = fmtTime(totalSec);

  const margins = ["", "クビ", "1/2", "3/4", "1", "1.1/4", "1.1/2", "2", "2.1/2", "3", "アタマ", "ハナ", "4", "5"];
  const rows: ResultRow[] = ordered.map((e, i) => {
    const gap = i * (0.1 + r() * 0.28);
    return {
      place: i + 1,
      no: e.no,
      frame: e.frame,
      horse: e.horse,
      jockey: e.jockey,
      pop: e.pop,
      odds: e.odds,
      time: fmtTime(totalSec + gap),
      margin: i === 0 ? "" : pick(r, margins.slice(1)),
      passing: Array.from({ length: distance >= 2000 ? 4 : distance >= 1400 ? 3 : 2 }, () =>
        rint(r, 1, Math.min(entries.length, 12)),
      ).join("-"),
      bodyWeight: e.bodyWeight,
      bodyDiff: e.bodyDiff,
    };
  });

  const win = rows[0], second = rows[1], third = rows[2];
  const wide = (a: ResultRow, b: ResultRow) => Math.max(a.no, b.no) + "-" + Math.min(a.no, b.no);
  const asc = (a: ResultRow, b: ResultRow) => Math.min(a.no, b.no) + "-" + Math.max(a.no, b.no);
  const tanpuku = Math.round(win.odds * 100);
  const payouts: Payout[] = [
    { label: "単勝", combo: String(win.no), yen: tanpuku, pop: win.pop },
    { label: "複勝", combo: String(win.no), yen: Math.round(tanpuku * (0.28 + r() * 0.14)), pop: win.pop },
    { label: "複勝", combo: String(second.no), yen: Math.round(second.odds * 100 * (0.2 + r() * 0.12)), pop: second.pop },
    { label: "馬連", combo: asc(win, second), yen: Math.round(win.odds * second.odds * (18 + r() * 22)), pop: rint(r, 1, 30) },
    { label: "馬単", combo: win.no + "→" + second.no, yen: Math.round(win.odds * second.odds * (36 + r() * 40)), pop: rint(r, 1, 60) },
    { label: "ワイド", combo: wide(win, second), yen: Math.round(win.odds * second.odds * (6 + r() * 8)), pop: rint(r, 1, 20) },
    { label: "三連複", combo: [win.no, second.no, third.no].sort((a, b) => a - b).join("-"), yen: Math.round(win.odds * second.odds * third.odds * (2 + r() * 4)), pop: rint(r, 1, 120) },
    { label: "三連単", combo: `${win.no}→${second.no}→${third.no}`, yen: Math.round(win.odds * second.odds * third.odds * (10 + r() * 22)), pop: rint(r, 1, 400) },
  ];
  return { rows, payouts, winTime };
}

let logSeq = 0;
const genLogId = () => `log_${(logSeq++).toString(36)}_${(logSeq * 31) % 9973}`;

export function buildSeed(): AppData {
  const meetings: Meeting[] = [];
  const races: Race[] = [];
  const logs: LogEntry[] = [];
  const now = new Date();

  TRACKS.forEach((t, ti) => {
    const meetingId = `m_${t.track}`;
    meetings.push({ id: meetingId, track: t.track, kai: t.kai, day: t.day, weather: t.weather, going: t.going });

    const done = PROGRESS[t.track];
    const pending = PENDING[t.track];

    for (let no = 1; no <= 12; no++) {
      const r = rng(1000 * (ti + 1) + no * 7 + 3);
      const isFeature = no === 11;
      const isSpecial = no >= 9 && !isFeature;
      let name: string, grade: string | undefined;
      if (isFeature) {
        name = FEATURE.name;
        grade = FEATURE.grade;
      } else if (isSpecial) {
        const sp = pick(r, RACE_NAMES_SPECIAL);
        name = sp.name;
        grade = sp.grade;
      } else {
        name = pick(r, RACE_NAMES_NORMAL);
        grade = undefined;
      }

      const surface: "芝" | "ダート" = r() < 0.55 ? "芝" : "ダート";
      const distance = pick(r, surface === "芝" ? [1400, 1600, 1800, 2000, 2400] : [1200, 1400, 1700, 1800]);
      const headcount = rint(r, 11, 18);
      // 発走時刻: 10:00 から約30分間隔
      const startMin = 10 * 60 + (no - 1) * 31 + rint(r, 0, 4);
      const start = `${String(Math.floor(startMin / 60)).padStart(2, "0")}:${String(startMin % 60).padStart(2, "0")}`;

      const entries = buildEntries(r, headcount);

      const finished = no <= done;
      const isPending = finished && no > done - pending; // 末尾 pending 本は掲載待ち
      let cardStatus: CardStatus;
      let resultStatus: ResultStatus;
      let result: ResultRow[] | undefined;
      let payouts: Payout[] | undefined;
      let winTime: string | undefined;
      let cardPublishedAt: string | undefined;
      let resultPublishedAt: string | undefined;

      // 出走表(番組表)は朝一で全レース生成・公開済み。ただし最終2Rは未生成を残す。
      if (no >= 11 && !finished && r() < 0.6 && no === 12) {
        cardStatus = "未生成";
      } else {
        cardStatus = "公開済";
        cardPublishedAt = subMinutes(now, 300 + (12 - no) * 6).toISOString();
      }

      if (finished) {
        const built = buildResult(r, entries, distance);
        result = built.rows;
        payouts = built.payouts;
        winTime = built.winTime;
        if (isPending) {
          resultStatus = "確定"; // 結果は確定済み・掲載待ち(操作対象)
        } else {
          resultStatus = "掲載済";
          resultPublishedAt = subMinutes(now, 8 + (done - no) * 22).toISOString();
        }
      } else {
        resultStatus = "発走前";
      }

      races.push({
        id: `r_${t.track}_${no}`,
        meetingId,
        track: t.track,
        no,
        name,
        grade,
        start,
        distance,
        surface,
        headcount,
        cardStatus,
        resultStatus,
        cardPublishedAt,
        resultPublishedAt,
        entries,
        result,
        payouts,
        winTime,
      });
    }
  });

  // ---- 実行ログ(直近の自動処理履歴) ----
  const published = races.filter((r) => r.resultStatus === "掲載済");
  const pushLog = (minsAgo: number, level: LogLevel, job: string, message: string, race?: Race) => {
    logs.push({
      id: genLogId(),
      at: subMinutes(now, minsAgo).toISOString(),
      level,
      job,
      raceId: race?.id,
      raceLabel: race ? `${race.track} ${race.no}R` : undefined,
      message,
    });
  };

  // 朝一のスケジュール取得
  pushLog(342, "success", "スケジュール取得", "本日の開催3場・全36レースの番組表を JRA-VAN より取得しました。");
  pushLog(340, "success", "ページ生成", "開催一覧・各レースページの枠組みを自動生成しました。(36ページ)");
  pushLog(338, "info", "ページ生成", "出走表テーブルを各レースページへ反映しました。");

  // 掲載済みレースの結果取得・公開ログ
  published
    .slice()
    .sort((a, b) => (b.resultPublishedAt! < a.resultPublishedAt! ? -1 : 1))
    .slice(0, 20)
    .forEach((r, i) => {
      const mins = 8 + i * 14 + Math.floor((i % 3) * 2);
      pushLog(mins + 2, "info", "結果取得", `レース確定を検知。確定データ(着順・オッズ・払戻)を取得中…`, r);
      pushLog(mins, "success", "結果掲載", `結果テーブルを生成し、ページを自動更新・公開しました。`, r);
    });

  // ときどき警告・エラーを混ぜる(現実味)
  pushLog(96, "warn", "結果取得", "競馬最強の法則WEB API の応答が遅延(2.4s)。リトライして取得に成功しました。", published[3]);
  pushLog(150, "error", "結果取得", "API が一時的に 503 を返却。10秒後にリトライして復旧しました。", published[6]);
  pushLog(210, "warn", "スケジュール取得", "馬体重データの一部が未確定のため、確定後に再取得するようスケジュールしました。");

  logs.sort((a, b) => (a.at < b.at ? 1 : -1));

  return { meetings, races, logs };
}

export const DEMO_USER = { id: "kanri01", name: "運用管理者", role: "サイト運用担当" };

// ---- 実行時にレース結果を生成する(自動処理シミュレーション用) ----
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 未確定のレースに対して確定結果(着順・払戻・勝ちタイム)を生成する */
export function generateResult(race: Race): { rows: ResultRow[]; payouts: Payout[]; winTime: string } {
  const r = rng(hashString(race.id));
  return buildResult(r, race.entries, race.distance);
}
