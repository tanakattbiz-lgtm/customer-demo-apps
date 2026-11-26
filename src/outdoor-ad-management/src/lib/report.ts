/**
 * 営業報告の集計(項目定義 S01〜S26・ルール R01〜R11 の仮案をそのまま実装)。
 * すべて「同じ元データ(見込案件・契約締結)」から計算し、担当者・営業所・エリアで絞るだけにする(R11)。
 */
import { endOfMonth, format } from "date-fns";
import { ORG, STAFF, OPEN_STAGES, type Deal, type Order, type Stage } from "../data/seed";
import { addMonthKey, keyToDate, thisMonth, todayISO } from "./format";

// ======================= 表示範囲 =======================
export type Scope =
  | { kind: "rep"; id: string }
  | { kind: "office"; name: string }
  | { kind: "area"; name: string }
  | { kind: "all" };

export const scopeKey = (s: Scope) =>
  s.kind === "rep" ? `rep:${s.id}` : s.kind === "office" ? `office:${s.name}` : s.kind === "area" ? `area:${s.name}` : "all";
export function parseScope(v: string | null): Scope | null {
  if (!v) return null;
  if (v === "all") return { kind: "all" };
  const [k, ...rest] = v.split(":");
  const x = rest.join(":");
  if (k === "rep" && STAFF.some((s) => s.id === x)) return { kind: "rep", id: x };
  if (k === "office" && ORG.some((a) => a.offices.includes(x))) return { kind: "office", name: x };
  if (k === "area" && ORG.some((a) => a.area === x)) return { kind: "area", name: x };
  return null;
}
export function repsIn(s: Scope): string[] {
  if (s.kind === "rep") return [s.id];
  if (s.kind === "office") return STAFF.filter((x) => x.branch === s.name).map((x) => x.id);
  if (s.kind === "area") return STAFF.filter((x) => x.area === s.name).map((x) => x.id);
  return STAFF.map((x) => x.id);
}
export function scopeLabel(s: Scope): string {
  if (s.kind === "rep") return STAFF.find((x) => x.id === s.id)?.name ?? "";
  if (s.kind === "office") return s.name;
  if (s.kind === "area") return s.name;
  return "営業部 全体";
}
/** 1つ下の階層(担当者 → なし、営業所 → 担当者、エリア → 営業所、全体 → エリア) */
export function childrenOf(s: Scope): Scope[] {
  if (s.kind === "office") return STAFF.filter((x) => x.branch === s.name).map((x) => ({ kind: "rep", id: x.id }));
  if (s.kind === "area") return (ORG.find((a) => a.area === s.name)?.offices ?? []).map((name) => ({ kind: "office", name }));
  if (s.kind === "all") return ORG.map((a) => ({ kind: "area", name: a.area }));
  return [];
}
export function parentOf(s: Scope): Scope | null {
  if (s.kind === "rep") {
    const st = STAFF.find((x) => x.id === s.id);
    return st ? { kind: "office", name: st.branch } : null;
  }
  if (s.kind === "office") {
    const a = ORG.find((x) => x.offices.includes(s.name));
    return a ? { kind: "area", name: a.area } : null;
  }
  if (s.kind === "area") return { kind: "all" };
  return null;
}

// ======================= 日付 =======================
export const monthEndISO = (m: string) => format(endOfMonth(keyToDate(m)), "yyyy-MM-dd");
const inMonth = (d: string | null | undefined, m: string) => !!d && d.slice(0, 7) === m;
/** 対象月の基準日: 当月は今日、過去月はその月末(R01・R08) */
export const baseDateOf = (m: string) => (m === thisMonth() ? todayISO() : monthEndISO(m));

// ======================= 状態の判定(A06) =======================
export type Phase = "未設置案件" | "設置済" | "解約済";
export const liveCancels = (o: Order) => o.cancels.filter((c) => !c.withdrawn);
export function phaseOf(o: Order, base = todayISO()): Phase | null {
  if (o.orderDate > base) return null;
  const full = liveCancels(o).find((c) => !c.partial && c.actualDate && c.actualDate <= base);
  if (full) return "解約済";
  if (o.actualInstallDate && o.actualInstallDate <= base) return "設置済";
  return "未設置案件";
}
/** 解約予定(未実施)があるか */
export const pendingCancel = (o: Order, base = todayISO()) =>
  liveCancels(o).find((c) => c.plannedDate && (!c.actualDate || c.actualDate > base));
/** 設置予定日を過ぎても設置日が入っていない */
export const installOverdue = (o: Order, base = todayISO()) =>
  !o.actualInstallDate && !!o.plannedInstallDate && o.plannedInstallDate < base && phaseOf(o, base) === "未設置案件";

// ======================= 件数・金額の集計(S01〜S20) =======================
export interface Agg {
  count: number;
  ad: number;
  adMissing: number;
  makeup: number;
  makeupMissing: number;
  rent: number;
  rentMissing: number;
  /** 地代合計 ÷(広告料合計 × 12)。計算できないときは null(R04) */
  ratio: number | null;
}
type Money = { adFee: number | null; makeupFee: number | null; landRent: number | null };
export function agg(items: Money[]): Agg {
  const a: Agg = { count: items.length, ad: 0, adMissing: 0, makeup: 0, makeupMissing: 0, rent: 0, rentMissing: 0, ratio: null };
  let adForRatio = 0;
  items.forEach((x) => {
    if (x.adFee === null) a.adMissing++;
    else a.ad += x.adFee;
    if (x.makeupFee === null) a.makeupMissing++;
    else a.makeup += x.makeupFee;
    if (x.landRent === null) a.rentMissing++;
    else {
      a.rent += x.landRent;
      if (x.adFee !== null) adForRatio += x.adFee;
    }
  });
  a.ratio = adForRatio > 0 ? a.rent / (adForRatio * 12) : null;
  return a;
}
export const dealMoney = (d: Deal): Money => ({ adFee: d.monthlyBudget, makeupFee: d.makeupFee, landRent: d.landRent });

export interface Snapshot {
  month: string;
  base: string;
  prospects: { agg: Agg; deals: Deal[] } | null;
  ordered: { agg: Agg; orders: Order[] };
  backlog: { agg: Agg; orders: Order[] };
  installed: { agg: Agg; orders: Order[] };
}
export function snapshot(orders: Order[], deals: Deal[], scope: Scope, month: string): Snapshot {
  const reps = new Set(repsIn(scope));
  const base = baseDateOf(month);
  const end = monthEndISO(month);
  const mine = orders.filter((o) => reps.has(o.repId));
  // S06〜S10 今月の契約締結: 対象月初 ≦ 契約締結日 ＜ 翌月初(基準日まで)
  const ordered = mine.filter((o) => inMonth(o.orderDate, month) && o.orderDate <= base);
  // S11〜S15 未設置案件(R02): 契約締結日 ≦ 月末 かつ(設置日なし または 設置日 ＞ 月末)。当月契約締結を含む
  const cut = base < end ? base : end;
  const backlog = mine.filter((o) => o.orderDate <= cut && phaseOf(o, cut) === "未設置案件");
  // S16〜S20 今月設置
  const installed = mine.filter((o) => inMonth(o.actualInstallDate, month) && o.actualInstallDate! <= base);
  // S01〜S05 見込案件: 進行中の未契約(過去月は月末の状態の保存が要る → Q09)
  const isCurrent = month === thisMonth();
  const pros = isCurrent ? deals.filter((d) => reps.has(d.repId) && OPEN_STAGES.includes(d.stage)) : null;
  return {
    month,
    base,
    prospects: pros ? { agg: agg(pros.map(dealMoney)), deals: pros } : null,
    ordered: { agg: agg(ordered), orders: ordered },
    backlog: { agg: agg(backlog), orders: backlog },
    installed: { agg: agg(installed), orders: installed },
  };
}

// ======================= 3ヶ月の予定と実績(S21〜S26・R07〜R09) =======================
export interface PlanOptions {
  /** whole: 月全体の見通し(実績 + 同月内の残予定)/ remaining: 残りの予定だけ(Q12) */
  mode: "whole" | "remaining";
  /** 契約締結予定に含める見込案件段階(Q12) */
  stages: Stage[];
  /** 設置予定に、未契約の見込案件を含めるか(Q12) */
  prospectInstall: boolean;
}
export const DEFAULT_PLAN: PlanOptions = { mode: "whole", stages: ["面談予定", "提案済み", "最終調整中"], prospectInstall: false };

export interface Line {
  /** 実績(未到来の月は null) */
  amount: number | null;
  count: number | null;
  items: { kind: "deal" | "order"; id: string; amount: number; date: string; note?: string }[];
}
export interface MonthCol {
  month: string;
  future: boolean;
  orderPlan: Line;
  orderActual: Line;
  installPlan: Line;
  installActual: Line;
  cancelPlan: Line;
  cancelActual: Line;
  netPlan: number;
  netActual: number | null;
}
const sumLine = (items: Line["items"], future = false): Line =>
  future
    ? { amount: null, count: null, items: [] }
    : { amount: items.reduce((s, x) => s + x.amount, 0), count: items.length, items };

export function threeMonths(orders: Order[], deals: Deal[], scope: Scope, opt: PlanOptions, base = todayISO()): MonthCol[] {
  const reps = new Set(repsIn(scope));
  const mine = orders.filter((o) => reps.has(o.repId));
  const pros = deals.filter((d) => reps.has(d.repId) && opt.stages.includes(d.stage) && OPEN_STAGES.includes(d.stage));
  const M = base.slice(0, 7);
  return [0, 1, 2].map((i) => {
    const m = addMonthKey(M, i);
    const future = i > 0;
    // ---- 契約締結 ----
    const oAct = mine
      .filter((o) => inMonth(o.orderDate, m) && o.orderDate <= base)
      .map((o) => ({ kind: "order" as const, id: o.id, amount: o.adFee ?? 0, date: o.orderDate }));
    const oRem = pros
      .filter((d) => inMonth(d.expectedClose, m) && d.expectedClose >= (i === 0 ? base : "0"))
      .map((d) => ({ kind: "deal" as const, id: d.id, amount: d.monthlyBudget ?? 0, date: d.expectedClose, note: d.stage }));
    // ---- 設置 ----
    const iAct = mine
      .filter((o) => inMonth(o.actualInstallDate, m) && o.actualInstallDate! <= base)
      .map((o) => ({ kind: "order" as const, id: o.id, amount: o.adFee ?? 0, date: o.actualInstallDate! }));
    const iRem: Line["items"] = mine
      .filter((o) => !o.actualInstallDate && inMonth(o.plannedInstallDate, m) && phaseOf(o, base) === "未設置案件")
      .map((o) => ({ kind: "order" as const, id: o.id, amount: o.adFee ?? 0, date: o.plannedInstallDate!, note: "未設置案件" }));
    // 当月の予定に、予定日を過ぎた未設置も含める(月全体の見通し)
    if (i === 0)
      mine
        .filter((o) => installOverdue(o, base) && !inMonth(o.plannedInstallDate, m))
        .forEach((o) => iRem.push({ kind: "order", id: o.id, amount: o.adFee ?? 0, date: o.plannedInstallDate!, note: "予定日超過" }));
    if (opt.prospectInstall)
      pros
        .filter((d) => d.expectedClose && addMonthKey(d.expectedClose.slice(0, 7), 1) === m)
        .forEach((d) => iRem.push({ kind: "deal", id: d.id, amount: d.monthlyBudget ?? 0, date: d.expectedClose, note: "未契約の見込案件" }));
    // ---- 解約 ----
    const cAct: Line["items"] = [];
    const cRem: Line["items"] = [];
    mine.forEach((o) =>
      liveCancels(o).forEach((c) => {
        if (c.actualDate && c.actualDate <= base) {
          if (inMonth(c.actualDate, m)) cAct.push({ kind: "order", id: o.id, amount: c.fee, date: c.actualDate, note: c.partial ? "一部解約" : undefined });
        } else if (inMonth(c.plannedDate, m)) {
          cRem.push({ kind: "order", id: o.id, amount: c.fee, date: c.plannedDate!, note: c.partial ? "一部解約" : undefined });
        }
      }),
    );
    const whole = opt.mode === "whole";
    const orderPlan = sumLine(whole ? [...oAct, ...oRem] : oRem);
    const installPlan = sumLine(whole ? [...iAct, ...iRem] : iRem);
    const cancelPlan = sumLine(whole ? [...cAct, ...cRem] : cRem);
    const installActual = sumLine(iAct, future);
    const cancelActual = sumLine(cAct, future);
    return {
      month: m,
      future,
      orderPlan,
      orderActual: sumLine(oAct, future),
      installPlan,
      installActual,
      cancelPlan,
      cancelActual,
      // S25: 設置予定 − 解約予定(契約締結予定額は加えない)
      netPlan: installPlan.amount! - cancelPlan.amount!,
      // S26: 設置実績 − 解約実績
      netActual: future ? null : installActual.amount! - cancelActual.amount!,
    };
  });
}

// ======================= 約1年先の見通し(要件書4章) =======================
export interface ForecastRow {
  month: string;
  /** 設置済みで継続中の広告料(解約予定を差し引き) */
  running: number;
  /** 未設置案件の設置予定 */
  backlog: number;
  /** 未契約の見込案件(契約締結予定日の翌月に設置と仮定) */
  prospect: number;
}
export function forecast12(orders: Order[], deals: Deal[], scope: Scope, base = todayISO()): ForecastRow[] {
  const reps = new Set(repsIn(scope));
  const mine = orders.filter((o) => reps.has(o.repId));
  const pros = deals.filter((d) => reps.has(d.repId) && OPEN_STAGES.includes(d.stage) && d.expectedClose && d.monthlyBudget);
  const M = base.slice(0, 7);
  return Array.from({ length: 12 }, (_, i) => {
    const m = addMonthKey(M, i);
    const end = monthEndISO(m);
    let running = 0;
    let backlog = 0;
    mine.forEach((o) => {
      const ph = phaseOf(o, base);
      if (!ph || ph === "解約済" || o.adFee === null) return;
      const cut = liveCancels(o).filter((c) => (c.actualDate ?? c.plannedDate ?? "9") <= end).reduce((s, c) => s + c.fee, 0);
      const fee = Math.max(0, o.adFee - cut);
      if (ph === "設置済") running += fee;
      else if ((o.plannedInstallDate ?? "9") <= end || installOverdue(o, base)) backlog += fee;
    });
    const prospect = pros
      .filter((d) => addMonthKey(d.expectedClose.slice(0, 7), 1) <= m)
      .reduce((s, d) => s + (d.monthlyBudget ?? 0), 0);
    return { month: m, running, backlog, prospect };
  });
}

// ======================= 表示用 =======================
export const yenK = (n: number) => {
  const sign = n < 0 ? "−" : "";
  return sign + "¥" + Math.abs(Math.round(n)).toLocaleString("ja-JP");
};
export const signedYen = (n: number) => (n > 0 ? "+" : n < 0 ? "−" : "±") + "¥" + Math.abs(Math.round(n)).toLocaleString("ja-JP");
export const ratioPct = (r: number | null) => (r === null ? "計算不可" : (r * 100).toFixed(1) + "%");

// ======================= 累計広告料・期・目標(営業部のExcelで追っている数字) =======================
/** 期は3月始まり。基準日を含む期の初日(yyyy-MM-dd) */
export function fiscalStart(base = todayISO()): string {
  const y = Number(base.slice(0, 4));
  const m = Number(base.slice(5, 7));
  return `${m >= 3 ? y : y - 1}-03-01`;
}
/** 期の名前(例: 2026年3月〜2027年2月) */
export function fiscalLabel(base = todayISO()): string {
  const s = fiscalStart(base);
  const y = Number(s.slice(0, 4));
  return `${y}年3月〜${y + 1}年2月`;
}
const dayBefore = (iso: string) => format(new Date(new Date(iso + "T00:00:00").getTime() - 86400000), "yyyy-MM-dd");

/**
 * 累計広告料: 基準日の時点で、設置済みで掲載が続いている広告料(月額)の合計。
 * 一部解約は減った額だけ引き、全部の解約は外す。
 */
export function runningAd(orders: Order[], reps: Set<string>, base = todayISO()): { amount: number; count: number; missing: number } {
  let amount = 0;
  let count = 0;
  let missing = 0;
  orders
    .filter((o) => reps.has(o.repId) && o.actualInstallDate && o.actualInstallDate <= base)
    .forEach((o) => {
      const done = liveCancels(o).filter((c) => c.actualDate && c.actualDate <= base);
      if (done.some((c) => !c.partial)) return;
      count++;
      if (o.adFee === null) {
        missing++;
        return;
      }
      amount += Math.max(0, o.adFee - done.reduce((s, c) => s + c.fee, 0));
    });
  return { amount, count, missing };
}

export interface Cumulative {
  fiscal: string;
  now: number;
  count: number;
  missing: number;
  atStart: number;
  /** 期首からの純増(累計広告料の増減) */
  netSinceStart: number;
}
export function cumulative(orders: Order[], scope: Scope, base = todayISO()): Cumulative {
  const reps = new Set(repsIn(scope));
  const now = runningAd(orders, reps, base);
  const start = runningAd(orders, reps, dayBefore(fiscalStart(base)));
  return { fiscal: fiscalLabel(base), now: now.amount, count: now.count, missing: now.missing, atStart: start.amount, netSinceStart: now.amount - start.amount };
}

/** 月ごとの実績(過去月の平均から、デモ用の目標を作るため) */
function monthActuals(orders: Order[], reps: Set<string>, m: string) {
  const mine = orders.filter((o) => reps.has(o.repId));
  const ordered = mine.filter((o) => inMonth(o.orderDate, m)).reduce((s, o) => s + (o.adFee ?? 0), 0);
  const installed = mine.filter((o) => inMonth(o.actualInstallDate, m)).reduce((s, o) => s + (o.adFee ?? 0), 0);
  const cancelled = mine.reduce((s, o) => s + liveCancels(o).filter((c) => inMonth(c.actualDate, m)).reduce((t, c) => t + c.fee, 0), 0);
  return { ordered, installed, net: installed - cancelled };
}
const round10k = (v: number) => Math.max(10000, Math.round(v / 10000) * 10000);

export interface Targets {
  /** 新規契約(契約締結)の広告料の目標(月額) */
  ordered: number;
  /** 純増の目標(月額) */
  net: number;
}
/**
 * 目標(月)。本番は所長・部長が入力する想定。
 * デモでは、担当者ごとに直近6か月の平均の1.1倍を仮の目標にし、表示する範囲で足している。
 */
export function targetsOf(orders: Order[], scope: Scope, month = thisMonth()): Targets {
  return repsIn(scope).reduce(
    (t, id) => {
      const reps = new Set([id]);
      const past = [1, 2, 3, 4, 5, 6].map((i) => monthActuals(orders, reps, addMonthKey(month, -i)));
      const avg = (k: "ordered" | "net") => past.reduce((s, x) => s + x[k], 0) / past.length;
      return { ordered: t.ordered + round10k(avg("ordered") * 1.1), net: t.net + round10k(Math.max(avg("net"), avg("ordered") * 0.3) * 1.1) };
    },
    { ordered: 0, net: 0 },
  );
}

// ======================= 獲得経路ごとの集計 =======================
export interface ChannelRow {
  channel: string;
  prospectCount: number;
  prospectAd: number;
  orderedCount: number;
  orderedAd: number;
}
export function byChannel(orders: Order[], deals: Deal[], scope: Scope, channels: string[], month = thisMonth()): ChannelRow[] {
  const reps = new Set(repsIn(scope));
  const base = baseDateOf(month);
  const rows = new Map<string, ChannelRow>();
  const row = (c: string | null) => {
    const k = c ?? "未入力";
    if (!rows.has(k)) rows.set(k, { channel: k, prospectCount: 0, prospectAd: 0, orderedCount: 0, orderedAd: 0 });
    return rows.get(k)!;
  };
  channels.forEach((c) => row(c));
  deals
    .filter((d) => reps.has(d.repId) && OPEN_STAGES.includes(d.stage))
    .forEach((d) => {
      const r = row(d.channel);
      r.prospectCount++;
      r.prospectAd += d.monthlyBudget ?? 0;
    });
  orders
    .filter((o) => reps.has(o.repId) && inMonth(o.orderDate, month) && o.orderDate <= base)
    .forEach((o) => {
      const r = row(o.channel);
      r.orderedCount++;
      r.orderedAd += o.adFee ?? 0;
    });
  return [...rows.values()].filter((r) => channels.includes(r.channel) || r.prospectCount + r.orderedCount > 0);
}
