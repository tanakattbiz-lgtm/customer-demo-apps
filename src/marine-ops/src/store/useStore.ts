import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildSeed,
  CURRENT_USER_ID,
  type AppData,
  type Voyage,
  type CheckItem,
  type ItemStatus,
  type Alert,
  type AlertStatus,
  type AlertKind,
} from "../data/seed";

interface Settings {
  liveMonitoring: boolean; // ライブ監視シミュレーション
  notifyOnDefect: boolean; // 不備発生時に管理者へ通知
  notifyOnDue: boolean; // 期日接近を通知
}

interface State extends AppData {
  currentUserId: string;
  authed: boolean;
  settings: Settings;

  // auth
  login: () => void;
  logout: () => void;

  // voyages / items
  updateItemStatus: (voyageId: string, itemId: string, status: ItemStatus, note?: string) => void;
  addNote: (voyageId: string, itemId: string, note: string) => void;
  addVoyage: (v: Voyage) => void;

  // alerts
  pushAlert: (a: Omit<Alert, "id" | "at" | "status"> & { at?: string }) => void;
  setAlertStatus: (id: string, status: AlertStatus) => void;
  resolveAlertsForItem: (voyageId: string, label: string) => void;

  // settings / system
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  reset: () => void;
}

let idc = 0;
const genId = (prefix: string) => `${prefix}_${(idc++).toString(36)}_${(idc * 7) % 9973}`;

const touch = (v: Voyage): Voyage => ({ ...v, updatedAt: new Date().toISOString() });

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...buildSeed(),
      currentUserId: CURRENT_USER_ID,
      authed: false,
      settings: { liveMonitoring: true, notifyOnDefect: true, notifyOnDue: true },

      login: () => set({ authed: true }),
      logout: () => set({ authed: false }),

      updateItemStatus: (voyageId, itemId, status, note) => {
        set((s) => ({
          voyages: s.voyages.map((v) => {
            if (v.id !== voyageId) return v;
            const items = v.items.map((it): CheckItem => {
              if (it.id !== itemId) return it;
              return {
                ...it,
                status,
                note: note ?? (status === "不備" ? it.note : undefined),
                completedAt: status === "完了" ? new Date().toISOString() : undefined,
              };
            });
            return touch({ ...v, items });
          }),
        }));

        const v = get().voyages.find((x) => x.id === voyageId);
        const item = v?.items.find((i) => i.id === itemId);
        if (!v || !item) return;

        // 不備 → 管理者へアラート
        if (status === "不備" && get().settings.notifyOnDefect) {
          get().pushAlert({
            voyageId: v.id,
            voyageCode: v.code,
            kind: "不備",
            severity: v.priority === "高" ? "高" : "中",
            message: `「${item.label}」に不備 — ${note ?? item.note ?? "内容を確認してください。"}`,
            assigneeId: v.assigneeId,
          });
        }
        // 完了 → その確認事項の未対応アラートを解消
        if (status === "完了") {
          get().resolveAlertsForItem(v.id, item.label);
        }
      },

      addNote: (voyageId, itemId, note) =>
        set((s) => ({
          voyages: s.voyages.map((v) =>
            v.id !== voyageId
              ? v
              : touch({
                  ...v,
                  items: v.items.map((it) => (it.id === itemId ? { ...it, note } : it)),
                }),
          ),
        })),

      addVoyage: (v) => set((s) => ({ voyages: [v, ...s.voyages] })),

      pushAlert: (a) =>
        set((s) => ({
          alerts: [
            {
              ...a,
              id: genId("al"),
              at: a.at ?? new Date().toISOString(),
              status: "未確認" as AlertStatus,
            },
            ...s.alerts,
          ],
        })),

      setAlertStatus: (id, status) =>
        set((s) => ({
          alerts: s.alerts.map((a) => (a.id === id ? { ...a, status } : a)),
        })),

      resolveAlertsForItem: (voyageId, label) =>
        set((s) => ({
          alerts: s.alerts.map((a) =>
            a.voyageId === voyageId && a.message.includes(label) && a.status !== "対応済"
              ? { ...a, status: "対応済" }
              : a,
          ),
        })),

      setSetting: (k, v) => set((s) => ({ settings: { ...s.settings, [k]: v } })),

      reset: () =>
        set({
          ...buildSeed(),
          settings: { liveMonitoring: true, notifyOnDefect: true, notifyOnDue: true },
        }),
    }),
    {
      name: "marine-ops-store",
      version: 2,
      partialize: (s) => ({
        voyages: s.voyages,
        alerts: s.alerts,
        settings: s.settings,
        staff: s.staff,
        shippers: s.shippers,
        // authed はセッション性が高いので永続化してよい(デモ利便性)
        authed: s.authed,
      }),
    },
  ),
);

// ---- ライブ監視シミュレーション用の候補メッセージ ----
export const LIVE_KINDS: { kind: AlertKind; severity: "高" | "中" | "低"; tpl: string }[] = [
  { kind: "停滞", severity: "低", tpl: "進捗の更新が48時間ありません。担当者へ状況確認を推奨します。" },
  { kind: "期日接近", severity: "中", tpl: "確認事項の期日が24時間以内に迫っています。" },
  { kind: "不備", severity: "高", tpl: "船積み書類に記載不備の可能性。内容を確認してください。" },
  { kind: "期日超過", severity: "高", tpl: "確認事項が期日を超過しました。至急対応してください。" },
];
