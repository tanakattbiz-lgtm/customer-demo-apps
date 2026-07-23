import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildSeed, type Worksheet } from "./data/seed";

type NewWorksheet = Omit<Worksheet, "id" | "no" | "createdAt">;

type State = {
  worksheets: Worksheet[];
  addWorksheet: (input: NewWorksheet) => Worksheet;
  removeWorksheet: (id: string) => void;
  reset: () => void;
};

function nextNo(sheets: Worksheet[]): string {
  const max = sheets.reduce((m, s) => {
    const n = Number(s.no.split("-")[2] ?? 0);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 1042);
  return `WS-2026-${String(max + 1).padStart(4, "0")}`;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      worksheets: buildSeed(),

      addWorksheet: (input) => {
        const sheets = get().worksheets;
        const ws: Worksheet = {
          ...input,
          id: `ws-${Date.now()}`,
          no: nextNo(sheets),
          createdAt: new Date().toISOString(),
        };
        set({ worksheets: [ws, ...sheets] });
        return ws;
      },

      removeWorksheet: (id) =>
        set({ worksheets: get().worksheets.filter((s) => s.id !== id) }),

      reset: () => set({ worksheets: buildSeed() }),
    }),
    { name: "order-to-worksheet-v1" },
  ),
);
