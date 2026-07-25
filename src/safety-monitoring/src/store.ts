import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildSeed,
  type Alert,
  type AlertKind,
  type AlertStatus,
  type AppData,
  type Severity,
  type Watchee,
} from "./data/seed";
import { EVENT_CATALOG } from "./lib/domain";

interface Settings {
  liveMonitoring: boolean; // ライブ監視シミュレーション
  autoAlert: boolean; // 監視中に自動でイベントを発報する
}

interface UIState {
  simOpen: boolean; // 検証シミュレータ(ダミーデータ入力)の開閉
  simUserId: string | null; // 事前選択された対象者
}

interface State extends AppData {
  settings: Settings;
  ui: UIState;

  // 検証・監視
  injectEvent: (userId: string, kind: AlertKind) => Alert | null;
  tick: () => void; // ライブ値のドリフト
  pushAlert: (a: Omit<Alert, "id" | "at" | "status"> & { at?: string }) => void;
  setAlertStatus: (id: string, status: AlertStatus) => void;
  setOnline: (userId: string, online: boolean) => void;

  // UI
  openSim: (userId?: string) => void;
  closeSim: () => void;
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  reset: () => void;
}

let idc = 0;
const genId = (p: string) => `${p}_${Date.now().toString(36)}_${(idc++).toString(36)}`;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...buildSeed(),
      settings: { liveMonitoring: true, autoAlert: true },
      ui: { simOpen: false, simUserId: null },

      injectEvent: (userId, kind) => {
        const def = EVENT_CATALOG.find((e) => e.kind === kind);
        const user = get().users.find((u) => u.id === userId);
        if (!def || !user) return null;
        const { message, patch } = def.build(user);

        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId
              ? { ...u, ...patch, online: true, lastSyncAt: new Date().toISOString() }
              : u,
          ),
        }));

        const alert: Alert = {
          id: genId("al"),
          userId: user.id,
          userName: user.name,
          kind: def.kind,
          severity: def.severity,
          message,
          at: new Date().toISOString(),
          status: "未対応",
        };
        set((s) => ({ alerts: [alert, ...s.alerts] }));
        return alert;
      },

      tick: () =>
        set((s) => ({
          users: s.users.map((u) => {
            if (!u.online) return u;
            const hr = clamp(u.hr + Math.round(Math.random() * 6 - 3), 46, 165);
            const steps = u.steps + Math.floor(Math.random() * 22);
            const battery = clamp(
              u.battery - (Math.random() < 0.25 ? 1 : 0),
              0,
              100,
            );
            return {
              ...u,
              hr,
              steps,
              battery,
              online: battery > 0,
              lastSyncAt: new Date().toISOString(),
            };
          }),
        })),

      pushAlert: (a) =>
        set((s) => ({
          alerts: [
            {
              ...a,
              id: genId("al"),
              at: a.at ?? new Date().toISOString(),
              status: "未対応" as AlertStatus,
            },
            ...s.alerts,
          ],
        })),

      setAlertStatus: (id, status) =>
        set((s) => ({
          alerts: s.alerts.map((a) => (a.id === id ? { ...a, status } : a)),
        })),

      setOnline: (userId, online) =>
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  online,
                  wearing: online ? u.wearing : false,
                  hr: online ? u.restingHR : 0,
                  lastSyncAt: new Date().toISOString(),
                }
              : u,
          ),
        })),

      openSim: (userId) =>
        set((s) => ({ ui: { simOpen: true, simUserId: userId ?? s.ui.simUserId } })),
      closeSim: () => set((s) => ({ ui: { ...s.ui, simOpen: false } })),

      setSetting: (k, v) => set((s) => ({ settings: { ...s.settings, [k]: v } })),

      reset: () =>
        set({
          ...buildSeed(),
          settings: { liveMonitoring: true, autoAlert: true },
          ui: { simOpen: false, simUserId: null },
        }),
    }),
    {
      name: "safety-monitoring-store",
      version: 1,
      partialize: (s) => ({
        users: s.users,
        alerts: s.alerts,
        settings: s.settings,
      }),
    },
  ),
);

// 型の再エクスポート(画面側の利便性)
export type { Alert, AlertKind, Severity, Watchee };
