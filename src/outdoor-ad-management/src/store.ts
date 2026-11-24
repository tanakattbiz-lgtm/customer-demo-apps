import { create } from "zustand";
import { persist } from "zustand/middleware";
import { format } from "date-fns";
import {
  createSeed,
  ADMIN_NAME,
  ME_ID,
  STAFF,
  type Activity,
  type AdContract,
  type Board,
  type Customer,
  type Deal,
  type Handover,
  type HandoverDoc,
  type Hold,
  type LandContract,
  type NextAction,
  type Order,
  type Attachment,
  type SeedData,
  type Stage,
} from "./data/seed";
import { thisMonth, todayISO } from "./lib/format";

const now = () => format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
const uid = (p: string) => p + Math.random().toString(36).slice(2, 9);
const meName = () => STAFF.find((s) => s.id === ME_ID)!.name;

/** デモ操作で発生した当月の増減(経営ダッシュボードに加算) */
interface LiveStats {
  month: string;
  newAd: number;
  newAdFaces: number;
  cancelAd: number;
  cancelFaces: number;
  newLand: number;
}
const emptyLive = (): LiveStats => ({
  month: thisMonth(),
  newAd: 0,
  newAdFaces: 0,
  cancelAd: 0,
  cancelFaces: 0,
  newLand: 0,
});

export interface OrderInput {
  orderDate: string;
  plannedInstallDate: string | null;
  adFee: number | null;
  makeupFee: number | null;
  landRent: number | null;
  kikakuNo: string | null;
  boardName: string;
  attachments: Omit<Attachment, "id" | "uploadedAt" | "by">[];
}

export interface CloseInput {
  faceIds: string[];
  startMonth: string;
  endMonth: string;
  monthlyFee: number;
  docs: HandoverDoc[];
  note: string;
}

interface State extends SeedData {
  live: LiveStats;
  /** サンプルデータを生成した日(yyyy-MM-dd) */
  seededOn: string;
  /** 利用者がデータを変更したか(未変更なら日付が変わったときにサンプルデータを作り直す) */
  touched: boolean;
  // 顧客
  saveCustomer: (c: Customer) => void;
  removeCustomer: (id: string) => void;
  // 商談
  saveDeal: (d: Deal) => void;
  removeDeal: (id: string) => void;
  setStage: (id: string, stage: Stage, lost?: { kind: "見送り" | "失注"; reason: string }) => void;
  // 契約締結〜設置〜解約
  registerOrder: (dealId: string, input: OrderInput) => string;
  syncOrder: (id: string, kikakuNo?: string) => void;
  installOrder: (id: string, date: string) => void;
  planCancel: (id: string, input: { plannedDate: string; fee: number; partial: boolean; reason: string }) => void;
  withdrawCancel: (orderId: string, cancelId: string) => void;
  confirmCancel: (orderId: string, cancelId: string, actualDate: string) => void;
  addAttachments: (orderId: string, files: Omit<Attachment, "id" | "uploadedAt" | "by">[]) => void;
  removeAttachment: (orderId: string, fileId: string) => void;
  setNextAction: (id: string, na: NextAction | null) => void;
  addActivity: (a: Activity, next?: NextAction | null) => void;
  // 仮押さえ
  addHold: (h: Omit<Hold, "id" | "createdAt" | "repId">) => void;
  extendHold: (id: string, until: string) => void;
  releaseHold: (id: string) => void;
  // 契約締結 → 契約 → 引継ぎ
  closeDeal: (dealId: string, input: CloseInput) => string;
  cancelContract: (id: string, lastMonth: string, reason: string) => void;
  // 引継ぎ
  receiveHandover: (id: string) => void;
  rejectHandover: (id: string, issues: string[], note: string) => void;
  resubmitHandover: (id: string, docs: HandoverDoc[], note: string) => void;
  // 土地契約
  saveLand: (l: LandContract, newBoard?: Board) => void;
  terminateLand: (id: string) => void;
  reset: () => void;
}

const bumpLive = (live: LiveStats, patch: Partial<Record<keyof Omit<LiveStats, "month">, number>>) => {
  const base = live.month === thisMonth() ? live : emptyLive();
  const next = { ...base };
  (Object.keys(patch) as (keyof typeof patch)[]).forEach((k) => {
    next[k] = (next[k] as number) + (patch[k] ?? 0);
  });
  return next;
};

export const useStore = create<State>()(
  persist(
    (rawSet, get) => {
      // データを変更する操作はすべて「変更あり」として記録する
      const set: typeof rawSet = (partial) =>
        rawSet((s) => ({ ...(typeof partial === "function" ? partial(s) : partial), touched: true }));
      return {
      ...createSeed(),
      live: emptyLive(),
      seededOn: todayISO(),
      touched: false,

      saveCustomer: (c) =>
        set((s) => ({
          customers: s.customers.some((x) => x.id === c.id)
            ? s.customers.map((x) => (x.id === c.id ? c : x))
            : [c, ...s.customers],
        })),
      removeCustomer: (id) =>
        set((s) => {
          const dealIds = s.deals.filter((d) => d.customerId === id).map((d) => d.id);
          return {
            customers: s.customers.filter((c) => c.id !== id),
            deals: s.deals.filter((d) => d.customerId !== id),
            activities: s.activities.filter((a) => a.customerId !== id),
            holds: s.holds.filter((h) => !dealIds.includes(h.dealId)),
          };
        }),

      saveDeal: (d) =>
        set((s) => {
          const exists = s.deals.some((x) => x.id === d.id);
          const deal = { ...d, updatedAt: todayISO() };
          return {
            deals: exists ? s.deals.map((x) => (x.id === d.id ? deal : x)) : [deal, ...s.deals],
            customers: s.customers.map((c) =>
              c.id === d.customerId && (c.status === "契約前" || c.status === "休眠")
                ? { ...c, status: "商談中" }
                : c,
            ),
          };
        }),
      removeDeal: (id) =>
        set((s) => ({
          deals: s.deals.filter((d) => d.id !== id),
          activities: s.activities.map((a) => (a.dealId === id ? { ...a, dealId: undefined } : a)),
          holds: s.holds.filter((h) => h.dealId !== id),
        })),
      setStage: (id, stage, lost) =>
        set((s) => ({
          deals: s.deals.map((d) =>
            d.id === id
              ? {
                  ...d,
                  stage,
                  lostKind: stage === "失注" ? lost?.kind : undefined,
                  lostReason: stage === "失注" ? lost?.reason : undefined,
                  closedLostAt: stage === "失注" ? todayISO() : undefined,
                  nextAction: stage === "失注" ? null : d.nextAction,
                  updatedAt: todayISO(),
                }
              : d,
          ),
          holds: stage === "失注" ? s.holds.filter((h) => h.dealId !== id) : s.holds,
        })),
      setNextAction: (id, na) =>
        set((s) => ({
          deals: s.deals.map((d) => (d.id === id ? { ...d, nextAction: na, updatedAt: todayISO() } : d)),
        })),
      addActivity: (a, next) =>
        set((s) => ({
          activities: [a, ...s.activities],
          deals:
            a.dealId && next !== undefined
              ? s.deals.map((d) => (d.id === a.dealId ? { ...d, nextAction: next, updatedAt: todayISO() } : d))
              : s.deals,
        })),

      addHold: (h) =>
        set((s) => ({
          holds: [...s.holds, { ...h, id: uid("p"), createdAt: todayISO(), repId: ME_ID }],
        })),
      extendHold: (id, until) =>
        set((s) => ({ holds: s.holds.map((h) => (h.id === id ? { ...h, expiresAt: until } : h)) })),
      releaseHold: (id) => set((s) => ({ holds: s.holds.filter((h) => h.id !== id) })),

      closeDeal: (dealId, input) => {
        const s = get();
        const deal = s.deals.find((d) => d.id === dealId)!;
        const seq = s.contracts.length + 1;
        const id = uid("k");
        const no = `AD-${input.startMonth.replace("-", "").slice(2)}-${String(seq).padStart(4, "0")}`;
        const contract: AdContract = {
          id,
          no,
          customerId: deal.customerId,
          dealId,
          faceIds: input.faceIds,
          startMonth: input.startMonth,
          endMonth: input.endMonth,
          monthlyFee: input.monthlyFee,
          repId: deal.repId,
          createdAt: todayISO(),
        };
        const at = now();
        const handover: Handover = {
          id: uid("h"),
          no: `HO-${no.slice(3)}`,
          contractId: id,
          status: "提出済",
          docs: input.docs,
          submittedAt: at,
          updatedAt: at,
          issues: [],
          issueNote: "",
          history: [{ at, actor: meName(), role: "営業", action: "管理部へ提出", note: input.note || undefined }],
        };
        set({
          contracts: [contract, ...s.contracts],
          handovers: [handover, ...s.handovers],
          holds: s.holds.filter((h) => h.dealId !== dealId),
          deals: s.deals.map((d) =>
            d.id === dealId ? { ...d, stage: "契約締結", contractId: id, nextAction: null, updatedAt: todayISO() } : d,
          ),
          customers: s.customers.map((c) => (c.id === deal.customerId ? { ...c, status: "取引中" } : c)),
          live: bumpLive(s.live, { newAd: 1, newAdFaces: input.faceIds.length }),
        });
        return id;
      },
      cancelContract: (id, lastMonth, reason) =>
        set((s) => {
          const c = s.contracts.find((x) => x.id === id)!;
          return {
            contracts: s.contracts.map((x) =>
              x.id === id ? { ...x, cancelMonth: lastMonth, cancelledAt: todayISO(), cancelReason: reason } : x,
            ),
            live: bumpLive(s.live, { cancelAd: 1, cancelFaces: c.faceIds.length }),
          };
        }),

      receiveHandover: (id) =>
        set((s) => ({
          handovers: s.handovers.map((h) => {
            if (h.id !== id) return h;
            const at = now();
            return {
              ...h,
              status: "受領済",
              receivedAt: at,
              updatedAt: at,
              history: [...h.history, { at, actor: ADMIN_NAME, role: "管理部", action: "受領" }],
            };
          }),
        })),
      rejectHandover: (id, issues, note) =>
        set((s) => ({
          handovers: s.handovers.map((h) => {
            if (h.id !== id) return h;
            const at = now();
            return {
              ...h,
              status: "差し戻し",
              issues,
              issueNote: note,
              updatedAt: at,
              history: [
                ...h.history,
                { at, actor: ADMIN_NAME, role: "管理部", action: "差し戻し", note: [issues.join("、"), note].filter(Boolean).join(" / ") },
              ],
            };
          }),
        })),
      resubmitHandover: (id, docs, note) =>
        set((s) => ({
          handovers: s.handovers.map((h) => {
            if (h.id !== id) return h;
            const at = now();
            return {
              ...h,
              status: "再提出",
              docs,
              updatedAt: at,
              history: [...h.history, { at, actor: meName(), role: "営業", action: "修正して再提出", note: note || undefined }],
            };
          }),
        })),

      saveLand: (l, newBoard) =>
        set((s) => {
          const exists = s.lands.some((x) => x.id === l.id);
          return {
            boards: newBoard ? [...s.boards, newBoard] : s.boards,
            lands: exists ? s.lands.map((x) => (x.id === l.id ? l : x)) : [l, ...s.lands],
            live: exists ? s.live : bumpLive(s.live, { newLand: 1 }),
          };
        }),
      terminateLand: (id) =>
        set((s) => ({ lands: s.lands.map((l) => (l.id === id ? { ...l, terminated: true, autoRenew: false } : l)) })),

      registerOrder: (dealId, input) => {
        const s = get();
        const deal = s.deals.find((d) => d.id === dealId)!;
        const id = uid("o");
        const at = now();
        const order: Order = {
          id,
          kikakuNo: input.kikakuNo,
          syncedAt: input.kikakuNo ? at : null,
          dealId,
          customerId: deal.customerId,
          repId: deal.repId,
          title: deal.title,
          boardName: input.boardName,
          orderDate: input.orderDate,
          plannedInstallDate: input.plannedInstallDate,
          actualInstallDate: null,
          adFee: input.adFee,
          cancels: [],
          attachments: input.attachments.map((f) => ({ ...f, id: uid("f"), uploadedAt: todayISO(), by: meName() })),
          legacy: false,
          notes: deal.notes,
          widthMm: deal.widthMm,
          heightMm: deal.heightMm,
          faceCount: deal.faceCount,
          heightClass: deal.heightClass,
          signType: deal.signType,
          landType: deal.landType,
          channel: deal.channel,
          investment: deal.investment,
          makeupFee: input.makeupFee,
          landRent: input.landRent,
        };
        set({
          orders: [order, ...s.orders],
          holds: s.holds.filter((h) => h.dealId !== dealId),
          deals: s.deals.map((d) => (d.id === dealId ? { ...d, stage: "契約締結", orderId: id, nextAction: null, updatedAt: todayISO() } : d)),
          customers: s.customers.map((c) => (c.id === deal.customerId ? { ...c, status: "取引中" } : c)),
        });
        return id;
      },
      syncOrder: (id, kikakuNo) =>
        set((s) => {
          const max = s.orders.reduce((m, o) => Math.max(m, Number(o.kikakuNo ?? 0)), 0);
          return {
            orders: s.orders.map((o) =>
              o.id === id ? { ...o, kikakuNo: o.kikakuNo ?? kikakuNo ?? String(max + 1).padStart(9, "0"), syncedAt: now() } : o,
            ),
          };
        }),
      installOrder: (id, date) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, actualInstallDate: date, syncedAt: now() } : o)) })),
      planCancel: (id, input) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  cancels: [
                    ...o.cancels,
                    { id: uid("x"), plannedDate: input.plannedDate, actualDate: null, fee: input.fee, partial: input.partial, reason: input.reason, wfNo: null, withdrawn: false, registeredAt: todayISO() },
                  ],
                }
              : o,
          ),
        })),
      withdrawCancel: (orderId, cancelId) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId ? { ...o, cancels: o.cancels.map((c) => (c.id === cancelId ? { ...c, withdrawn: true } : c)) } : o,
          ),
        })),
      confirmCancel: (orderId, cancelId, actualDate) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  syncedAt: now(),
                  cancels: o.cancels.map((c) =>
                    c.id === cancelId ? { ...c, actualDate, wfNo: c.wfNo ?? `WF${actualDate.slice(2, 4)}${actualDate.slice(5, 7)}-${String(Math.floor(Math.random() * 9000) + 1000)}` } : c,
                  ),
                }
              : o,
          ),
        })),
      addAttachments: (orderId, files) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? { ...o, attachments: [...o.attachments, ...files.map((f) => ({ ...f, id: uid("f"), uploadedAt: todayISO(), by: meName() }))] }
              : o,
          ),
        })),
      removeAttachment: (orderId, fileId) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, attachments: o.attachments.filter((f) => f.id !== fileId) } : o)),
        })),

      reset: () => rawSet({ ...createSeed(), live: emptyLive(), seededOn: todayISO(), touched: false }),
      };
    },
    {
      name: "outdoor-ad-management-v4",
      // 前日以前に生成したサンプルデータが未変更のまま残っていれば、今日の日付で作り直す
      onRehydrateStorage: () => (state) => {
        if (state && !state.touched && state.seededOn !== todayISO()) state.reset();
      },
    },
  ),
);

export const staffName = (id: string) => STAFF.find((s) => s.id === id)?.name ?? "—";
export { uid, now };
