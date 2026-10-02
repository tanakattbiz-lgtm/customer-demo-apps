import type { AdContract, Board, Face, Handover, Hold } from "../data/seed";
import { addMonthKey, thisMonth, todayISO } from "./format";

export const effectiveEnd = (c: AdContract) => c.cancelMonth ?? c.endMonth;

export type ContractState = "掲載予定" | "掲載中" | "満了間近" | "解約予定" | "満了" | "解約済";
export function contractState(c: AdContract, cur = thisMonth()): ContractState {
  if (c.cancelMonth) return cur > c.cancelMonth ? "解約済" : "解約予定";
  if (cur < c.startMonth) return "掲載予定";
  if (cur > c.endMonth) return "満了";
  if (c.endMonth <= addMonthKey(cur, 2)) return "満了間近";
  return "掲載中";
}

export const holdActive = (h: Hold, today = todayISO()) => h.expiresAt >= today;

export type Cell =
  | { kind: "contract"; contract: AdContract }
  | { kind: "hold"; hold: Hold }
  | { kind: "pre" }
  | { kind: "free" };

export interface FaceIndex {
  contracts: Map<string, AdContract[]>;
  holds: Map<string, Hold[]>;
}

export function buildIndex(contracts: AdContract[], holds: Hold[]): FaceIndex {
  const ci = new Map<string, AdContract[]>();
  const hi = new Map<string, Hold[]>();
  contracts.forEach((c) =>
    c.faceIds.forEach((f) => {
      if (!ci.has(f)) ci.set(f, []);
      ci.get(f)!.push(c);
    }),
  );
  const today = todayISO();
  holds
    .filter((h) => holdActive(h, today))
    .forEach((h) => {
      if (!hi.has(h.faceId)) hi.set(h.faceId, []);
      hi.get(h.faceId)!.push(h);
    });
  return { contracts: ci, holds: hi };
}

export function cellAt(idx: FaceIndex, board: Board, face: Face, m: string): Cell {
  if (m < board.installMonth) return { kind: "pre" };
  const c = idx.contracts.get(face.id)?.find((c) => c.startMonth <= m && effectiveEnd(c) >= m);
  if (c) return { kind: "contract", contract: c };
  const h = idx.holds.get(face.id)?.find((h) => h.startMonth <= m && h.endMonth >= m);
  if (h) return { kind: "hold", hold: h };
  return { kind: "free" };
}

/** 指定期間が丸ごと空いているか(ignoreDealId の仮押さえは自分の枠として無視) */
export function isFree(
  idx: FaceIndex,
  board: Board,
  face: Face,
  from: string,
  to: string,
  ignoreDealId?: string,
) {
  if (from < board.installMonth) return false;
  if (idx.contracts.get(face.id)?.some((c) => c.startMonth <= to && effectiveEnd(c) >= from)) return false;
  if (
    idx.holds
      .get(face.id)
      ?.some((h) => h.dealId !== ignoreDealId && h.startMonth <= to && h.endMonth >= from)
  )
    return false;
  return true;
}

/** from から連続して空いている最終月 */
export function freeUntil(idx: FaceIndex, board: Board, face: Face, from: string, max = 24) {
  let last = from;
  for (let i = 1; i < max; i++) {
    const m = addMonthKey(from, i);
    if (cellAt(idx, board, face, m).kind !== "free") break;
    last = m;
  }
  return last;
}

export function handoverOf(handovers: Handover[], contractId: string) {
  return handovers.find((h) => h.contractId === contractId);
}

export function faceLookup(boards: Board[]) {
  const map = new Map<string, { board: Board; face: Face }>();
  boards.forEach((b) => b.faces.forEach((f) => map.set(f.id, { board: b, face: f })));
  return map;
}
