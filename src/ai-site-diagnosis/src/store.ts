import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Diagnosis } from "./lib/diagnose";

interface DiagState {
  /** 診断履歴（新しい順） */
  history: Diagnosis[];
  add: (d: Diagnosis) => void;
  get: (id: string) => Diagnosis | undefined;
  reset: () => void;
}

export const useDiagStore = create<DiagState>()(
  persist(
    (set, get) => ({
      history: [],
      add: (d) =>
        set((s) => ({
          // 同一IDは重複させず先頭へ。最大20件まで保持
          history: [d, ...s.history.filter((x) => x.id !== d.id)].slice(0, 20),
        })),
      get: (id) => get().history.find((x) => x.id === id),
      reset: () => set({ history: [] }),
    }),
    { name: "ai-site-diagnosis-v1" },
  ),
);
