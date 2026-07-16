import { addDays, addMonths, startOfMonth, subDays } from "date-fns";
import { toDateStr } from "../lib/date";

// ---------------- 型定義 ----------------
export type Availability = "ok" | "limited" | "ng";
export type PeriodStatus = "受付中" | "作成中" | "公開済";
export type Position = "ホール" | "キッチン" | "レジ" | "ドリンク";

export interface Member {
  id: string;
  name: string;
  kana: string;
  role: "リーダー" | "スタッフ";
  positions: Position[];
  color: string;
  active: boolean;
  hiredAt: string;
}

/** シフト希望(スタッフが1日ごとに提出する) */
export interface ShiftRequest {
  memberId: string;
  date: string; // YYYY-MM-DD
  availability: Availability;
  from?: string; // "17:00"(availability === "limited" のとき)
  to?: string;
  note?: string;
}

/** 提出状況 */
export interface Submission {
  memberId: string;
  submittedAt?: string; // 未提出なら undefined
}

/** 確定シフトの1コマ */
export interface Assignment {
  id: string;
  memberId: string;
  date: string;
  from: string;
  to: string;
  position: Position;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  at: string;
  pinned?: boolean;
}

export interface Period {
  id: string;
  label: string;
  start: string;
  end: string;
  dates: string[];
  deadline: string; // 希望提出の締切
  status: PeriodStatus;
  targetPerDay: number; // 1日あたりの必要人数(目安)
}

export interface AppData {
  period: Period;
  members: Member[];
  requests: ShiftRequest[];
  submissions: Submission[];
  assignments: Assignment[];
  announcements: Announcement[];
}

// 管理者(バイトリーダー)として最初にログインするメンバー
export const LEADER_ID = "m1";
// スタッフ画面で最初に「あなた」として選ばれるメンバー(未提出者にして提出フローを体感させる)
export const DEFAULT_STAFF_ID = "m6";

const POS_COLOR: Record<Position, string> = {
  ホール: "oklch(60% 0.16 264)",
  キッチン: "oklch(60% 0.15 40)",
  レジ: "oklch(58% 0.14 155)",
  ドリンク: "oklch(60% 0.15 300)",
};
export const POSITION_LIST: Position[] = ["ホール", "キッチン", "レジ", "ドリンク"];
export const positionColor = (p: Position) => POS_COLOR[p];

const MEMBER_SRC: Omit<Member, "color" | "active" | "hiredAt">[] = [
  { id: "m1", name: "山口 彩", kana: "やまぐち あや", role: "リーダー", positions: ["ホール", "レジ"] },
  { id: "m2", name: "田中 拓海", kana: "たなか たくみ", role: "スタッフ", positions: ["キッチン"] },
  { id: "m3", name: "鈴木 美咲", kana: "すずき みさき", role: "スタッフ", positions: ["ホール", "ドリンク"] },
  { id: "m4", name: "佐々木 蓮", kana: "ささき れん", role: "スタッフ", positions: ["キッチン", "ホール"] },
  { id: "m5", name: "高橋 結衣", kana: "たかはし ゆい", role: "スタッフ", positions: ["レジ", "ホール"] },
  { id: "m6", name: "渡辺 陽向", kana: "わたなべ ひなた", role: "スタッフ", positions: ["ホール"] },
  { id: "m7", name: "伊藤 大和", kana: "いとう やまと", role: "スタッフ", positions: ["キッチン"] },
  { id: "m8", name: "中村 さくら", kana: "なかむら さくら", role: "スタッフ", positions: ["ドリンク", "ホール"] },
  { id: "m9", name: "小林 颯太", kana: "こばやし そうた", role: "スタッフ", positions: ["キッチン", "レジ"] },
  { id: "m10", name: "加藤 芽依", kana: "かとう めい", role: "スタッフ", positions: ["ホール", "ドリンク"] },
  { id: "m11", name: "吉田 律", kana: "よしだ りつ", role: "スタッフ", positions: ["ホール"] },
  { id: "m12", name: "山本 莉子", kana: "やまもと りこ", role: "スタッフ", positions: ["レジ", "ドリンク"] },
  { id: "m13", name: "松本 悠真", kana: "まつもと ゆうま", role: "スタッフ", positions: ["キッチン"] },
  { id: "m14", name: "井上 心春", kana: "いのうえ こはる", role: "スタッフ", positions: ["ホール", "レジ"] },
];

const AVATAR_COLORS = [
  "oklch(55% 0.16 264)",
  "oklch(56% 0.15 40)",
  "oklch(55% 0.14 155)",
  "oklch(56% 0.15 300)",
  "oklch(55% 0.15 210)",
  "oklch(57% 0.14 90)",
];

function buildMembers(now: Date): Member[] {
  return MEMBER_SRC.map((m, i) => ({
    ...m,
    color: AVATAR_COLORS[i % AVATAR_COLORS.length],
    active: true,
    hiredAt: toDateStr(subDays(now, 40 + i * 23)),
  }));
}

// 提出済みの時刻をばらつかせる(決定的)
const LIMITED_RANGES: [string, string][] = [
  ["17:00", "22:00"],
  ["18:00", "22:00"],
  ["10:00", "15:00"],
  ["13:00", "18:00"],
];

// 決定的な希望パターン生成(見た目が自然になるよう調整)
function genAvailability(mi: number, di: number, weekend: boolean): Availability {
  const h = (mi * 3 + di * 5 + (mi % 4)) % 10;
  if (weekend) {
    if (h < 7) return "ok";
    if (h < 9) return "limited";
    return "ng";
  }
  if (h < 4) return "ok";
  if (h < 6) return "limited";
  return "ng";
}

// 未提出にするメンバー(提出状況にリアリティを持たせる)
const NOT_SUBMITTED = new Set(["m6", "m11", "m13"]);

function buildRequestsAndSubmissions(
  members: Member[],
  period: Period,
  now: Date,
): { requests: ShiftRequest[]; submissions: Submission[] } {
  const requests: ShiftRequest[] = [];
  const submissions: Submission[] = [];
  members.forEach((m, mi) => {
    const submitted = !NOT_SUBMITTED.has(m.id);
    submissions.push({
      memberId: m.id,
      submittedAt: submitted ? subDays(now, (mi % 5) + 1).toISOString() : undefined,
    });
    if (!submitted) return;
    period.dates.forEach((date, di) => {
      const weekend = [0, 6].includes(new Date(date + "T00:00:00").getDay());
      const av = genAvailability(mi, di, weekend);
      const req: ShiftRequest = { memberId: m.id, date, availability: av };
      if (av === "limited") {
        const [from, to] = LIMITED_RANGES[(mi + di) % LIMITED_RANGES.length];
        req.from = from;
        req.to = to;
      }
      requests.push(req);
    });
  });
  return { requests, submissions };
}

// 一部の日は下書きの割当を入れておく(「作成途中」の手応え)
function buildDraftAssignments(
  members: Member[],
  requests: ShiftRequest[],
  period: Period,
): Assignment[] {
  const assignments: Assignment[] = [];
  let seq = 0;
  const canWork = (memberId: string, date: string) =>
    requests.find(
      (r) => r.memberId === memberId && r.date === date && r.availability !== "ng",
    );
  // 前半6日を下書き(作成途中の手応え)。以降は未割当のまま残す。
  period.dates.slice(0, 6).forEach((date, di) => {
    const weekend = [0, 6].includes(new Date(date + "T00:00:00").getDay());
    const pool = members.filter((m) => m.active && canWork(m.id, date));
    const pick = pool.slice(0, weekend ? 4 : 3);
    pick.forEach((m, k) => {
      const req = canWork(m.id, date);
      const from = req?.from ?? (weekend ? (k === 0 ? "10:00" : "16:00") : "17:00");
      const to = req?.to ?? "22:00";
      assignments.push({
        id: `as_seed_${di}_${k}_${seq++}`,
        memberId: m.id,
        date,
        from,
        to,
        position: m.positions[0],
      });
    });
  });
  return assignments;
}

function buildAnnouncements(now: Date, deadline: string): Announcement[] {
  const dl = `${Number(deadline.split("-")[1])}/${Number(deadline.split("-")[2])}`;
  return [
    {
      id: "an1",
      pinned: true,
      title: "【重要】8月前半シフトの希望提出について",
      body: `8月前半（8/1〜8/14）のシフト希望は ${dl}(締切) までにご提出ください。未提出の場合、シフトに入れないことがあります。ご協力をお願いします。`,
      at: subDays(now, 1).toISOString(),
    },
    {
      id: "an2",
      title: "お盆期間の増員のお願い",
      body: "8/9〜8/14は繁忙期のため、可能な方は積極的にシフトへのご協力をお願いします。時間帯の相談も受け付けています。",
      at: subDays(now, 2).toISOString(),
    },
    {
      id: "an3",
      title: "新しいスタッフが加わりました",
      body: "今月から井上さんがホールに加わりました。見かけたら気軽に声をかけてあげてください。よろしくお願いします。",
      at: subDays(now, 4).toISOString(),
    },
    {
      id: "an4",
      title: "夏用制服への切り替えについて",
      body: "8月より夏用制服に切り替わります。サイズ交換が必要な方は店長までお知らせください。",
      at: subDays(now, 6).toISOString(),
    },
  ];
}

export function buildSeed(): AppData {
  const now = new Date();
  const start = startOfMonth(addMonths(now, 1)); // 翌月1日
  const dates: string[] = [];
  for (let i = 0; i < 14; i++) dates.push(toDateStr(addDays(start, i)));
  const end = dates[dates.length - 1];
  const deadline = toDateStr(addDays(now, 4));

  const startM = start.getMonth() + 1;
  const period: Period = {
    id: "p_2026_08_a",
    label: `${start.getFullYear()}年 ${startM}月 前半`,
    start: dates[0],
    end,
    dates,
    deadline,
    status: "受付中",
    targetPerDay: 3,
  };

  const members = buildMembers(now);
  const { requests, submissions } = buildRequestsAndSubmissions(members, period, now);
  const assignments = buildDraftAssignments(members, requests, period);
  const announcements = buildAnnouncements(now, deadline);

  return { period, members, requests, submissions, assignments, announcements };
}
