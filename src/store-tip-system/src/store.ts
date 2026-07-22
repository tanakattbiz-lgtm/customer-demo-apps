import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildSeed,
  type AppData,
  type Staff,
  type Tip,
  type TipStatus,
  type PayMethod,
} from "./data/seed";

interface State extends AppData {
  authed: boolean;

  login: () => void;
  logout: () => void;

  // staff CRUD
  addStaff: (input: { name: string; role: string }) => Staff;
  updateStaff: (id: string, patch: Partial<Pick<Staff, "name" | "role" | "active">>) => void;
  toggleActive: (id: string) => void;

  // tips
  addTip: (input: {
    staffId: string;
    amount: number;
    message?: string;
    from: string;
    method: PayMethod;
  }) => Tip;
  setTipStatus: (id: string, status: TipStatus) => void;
  settleStaff: (staffId: string) => number; // 精算待ち→精算済。件数を返す

  reset: () => void;
}

let idc = Math.floor(Math.random() * 9000) + 1000;
const genId = (p: string) => `${p}_${(idc++).toString(36)}${(idc * 7) % 97}`;

const AVATAR_COLORS = [
  "oklch(62% 0.16 35)",
  "oklch(58% 0.13 250)",
  "oklch(60% 0.14 160)",
  "oklch(60% 0.16 300)",
  "oklch(64% 0.15 90)",
];

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...buildSeed(),
      authed: false,

      login: () => set({ authed: true }),
      logout: () => set({ authed: false }),

      addStaff: (input) => {
        const staff = get().staff;
        const s: Staff = {
          id: genId("stf"),
          name: input.name.trim(),
          role: input.role.trim() || "スタッフ",
          color: AVATAR_COLORS[staff.length % AVATAR_COLORS.length],
          active: true,
          joinedAt: new Date().toISOString(),
          handle: `staff-${(staff.length + 1).toString().padStart(2, "0")}`,
        };
        set({ staff: [...staff, s] });
        return s;
      },

      updateStaff: (id, patch) =>
        set((st) => ({
          staff: st.staff.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),

      toggleActive: (id) =>
        set((st) => ({
          staff: st.staff.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
        })),

      addTip: (input) => {
        const t: Tip = {
          id: genId("tip"),
          staffId: input.staffId,
          amount: input.amount,
          message: input.message?.trim() || undefined,
          from: input.from.trim() || "匿名の応援",
          method: input.method,
          at: new Date().toISOString(),
          status: "精算待ち",
        };
        set((st) => ({ tips: [t, ...st.tips] }));
        return t;
      },

      setTipStatus: (id, status) =>
        set((st) => ({
          tips: st.tips.map((t) => (t.id === id ? { ...t, status } : t)),
        })),

      settleStaff: (staffId) => {
        const target = get().tips.filter((t) => t.staffId === staffId && t.status === "精算待ち");
        if (target.length === 0) return 0;
        set((st) => ({
          tips: st.tips.map((t) =>
            t.staffId === staffId && t.status === "精算待ち" ? { ...t, status: "精算済" } : t,
          ),
        }));
        return target.length;
      },

      reset: () => set({ ...buildSeed() }),
    }),
    {
      name: "store-tip-system",
      version: 1,
      partialize: (s) => ({ staff: s.staff, tips: s.tips, authed: s.authed }),
    },
  ),
);
