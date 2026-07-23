import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildSeed,
  type AppData,
  type Settings,
  type Notification,
  type Proposal,
  type Kpi,
} from "./data/seed";

interface State extends AppData {
  // 設定
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  updateKpiTarget: (id: string, target: number) => void;
  toggleProposalPin: (id: string) => void;
  pinned: string[]; // 提案の採用(ピン留め)

  // 通知
  pushNotification: (n: Omit<Notification, "id" | "sentAt"> & { sentAt?: string }) => void;

  reset: () => void;
}

let idc = 0;
const genId = () => `nt_${Date.now().toString(36)}_${(idc++).toString(36)}`;

export const useStore = create<State>()(
  persist(
    (set) => ({
      ...buildSeed(),
      pinned: ["p1", "p2"],

      setSetting: (k, v) => set((s) => ({ settings: { ...s.settings, [k]: v } })),

      updateKpiTarget: (id, target) =>
        set((s) => ({
          kpis: s.kpis.map((k: Kpi) => (k.id === id ? { ...k, target } : k)),
        })),

      toggleProposalPin: (id) =>
        set((s) => ({
          pinned: s.pinned.includes(id) ? s.pinned.filter((x) => x !== id) : [...s.pinned, id],
        })),

      pushNotification: (n) =>
        set((s) => ({
          notifications: [
            { ...n, id: genId(), sentAt: n.sentAt ?? new Date().toISOString() },
            ...s.notifications,
          ],
        })),

      reset: () => set({ ...buildSeed(), pinned: ["p1", "p2"] }),
    }),
    {
      name: "analytics-report-agent",
      // metrics/channels/proposals は再生成コストが軽く、日付相対なので永続化しない
      partialize: (s) => ({
        settings: s.settings,
        kpis: s.kpis,
        notifications: s.notifications,
        pinned: s.pinned,
      }),
      merge: (persisted, current) => ({ ...current, ...(persisted as object) }),
    },
  ),
);

export type { Proposal };
