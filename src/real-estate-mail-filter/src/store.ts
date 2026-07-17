import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_CONDITIONS, type Conditions } from "./lib/rules";

type State = {
  conditions: Conditions;
  /** 要確認物件の確認済みチェック(メールID → true) */
  reviewed: Record<string, boolean>;
  /** 最後に条件を保存(=再判定)した日時 */
  lastRunAt: string | null;
  setConditions: (c: Conditions) => void;
  toggleReviewed: (id: string) => void;
  markRun: () => void;
  reset: () => void;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      conditions: DEFAULT_CONDITIONS,
      reviewed: {},
      lastRunAt: null,
      setConditions: (conditions) => set({ conditions }),
      toggleReviewed: (id) =>
        set((s) => ({ reviewed: { ...s.reviewed, [id]: !s.reviewed[id] } })),
      markRun: () => set({ lastRunAt: new Date().toISOString() }),
      reset: () =>
        set({ conditions: DEFAULT_CONDITIONS, reviewed: {}, lastRunAt: null }),
    }),
    { name: "re-mail-filter-v1" },
  ),
);
