import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildSeed,
  menuById,
  type AppData,
  type CalendarProvider,
  type MenuId,
  type NotifLog,
  type NotifStatus,
  type NotifType,
  type Reservation,
} from "./data/seed";

export interface Settings {
  linePush: boolean; // LINEプッシュ通知
  emailNotify: boolean; // メール通知
  remindDayBefore: boolean; // 前日リマインド
  remindHourBefore: boolean; // 1時間前リマインド
  calendarProvider: CalendarProvider; // 連携先カレンダー
}

const DEFAULT_SETTINGS: Settings = {
  linePush: true,
  emailNotify: false,
  remindDayBefore: true,
  remindHourBefore: true,
  calendarProvider: "google",
};

interface NewReservation {
  name: string;
  kana: string;
  menuId: MenuId;
  start: string;
  note?: string;
}

interface State extends AppData {
  settings: Settings;

  addReservation: (r: NewReservation) => Reservation;
  cancelReservation: (id: string) => void;
  markSeen: (id: string) => void;

  pushLog: (type: NotifType, to: string, status?: NotifStatus, detail?: string) => void;
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  reset: () => void;
}

let idc = 0;
const genId = (p: string) => `${p}_${Date.now().toString(36)}_${(idc++).toString(36)}`;

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...buildSeed(),
      settings: DEFAULT_SETTINGS,

      addReservation: (r) => {
        const s = get().settings;
        const res: Reservation = {
          id: genId("res"),
          name: r.name,
          kana: r.kana,
          menuId: r.menuId,
          start: r.start,
          status: "確定",
          calendarSynced: true,
          reminderSent: false,
          isNew: true,
          note: r.note,
          createdAt: new Date().toISOString(),
        };
        set((st) => ({ reservations: [res, ...st.reservations] }));

        // 予約確定 → 各チャネルへ通知(困りごと=通知停止 の解消を可視化)
        if (s.linePush) get().pushLog("予約確定", r.name, "成功");
        if (s.emailNotify) {
          set((st) => ({
            logs: [
              {
                id: genId("log"),
                type: "予約確定",
                to: r.name,
                channel: "メール",
                status: "成功",
                at: new Date().toISOString(),
              },
              ...st.logs,
            ],
          }));
        }
        return res;
      },

      cancelReservation: (id) => {
        const res = get().reservations.find((x) => x.id === id);
        set((st) => ({
          reservations: st.reservations.map((x) =>
            x.id === id ? { ...x, status: "キャンセル", calendarSynced: false } : x,
          ),
        }));
        if (res && get().settings.linePush) {
          get().pushLog("キャンセル", res.name, "成功", `${menuById(res.menuId).name} の予約を取消`);
        }
      },

      markSeen: (id) =>
        set((st) => ({
          reservations: st.reservations.map((x) => (x.id === id ? { ...x, isNew: false } : x)),
        })),

      pushLog: (type, to, status = "成功", detail) =>
        set((st) => ({
          logs: [
            {
              id: genId("log"),
              type,
              to,
              channel: "LINEプッシュ" as const,
              status,
              at: new Date().toISOString(),
              detail,
            } satisfies NotifLog,
            ...st.logs,
          ],
        })),

      setSetting: (k, v) => set((st) => ({ settings: { ...st.settings, [k]: v } })),

      reset: () => set({ ...buildSeed(), settings: DEFAULT_SETTINGS }),
    }),
    {
      name: "line-booking-store",
      version: 1,
      partialize: (s) => ({
        reservations: s.reservations,
        logs: s.logs,
        settings: s.settings,
      }),
    },
  ),
);
