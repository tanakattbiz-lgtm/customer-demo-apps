import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildRows, type ListRow } from "./data/seed";

type State = {
  imported: boolean; // リスト.xlsx を取り込み済みか
  rows: ListRow[];
  importList: () => void;
  generate: (ids: string[]) => void;
  reset: () => void;
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      imported: false,
      rows: [],

      importList: () => set({ imported: true, rows: buildRows() }),

      generate: (ids) =>
        set({
          rows: get().rows.map((r) =>
            ids.includes(r.id) ? { ...r, status: "生成済み" } : r,
          ),
        }),

      reset: () => set({ imported: false, rows: [] }),
    }),
    { name: "document-automation-v1" },
  ),
);
