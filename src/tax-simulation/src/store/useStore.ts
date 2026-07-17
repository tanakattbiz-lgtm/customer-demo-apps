import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SimType } from "../data/simulators";

export interface SimHistory {
  id: string;
  type: SimType;
  date: string;            // ISO
  summary: string;         // 入力概要
  totalTax: number;
  headline: string;        // 結果の見出し
}

export type RequestStatus = "受付中" | "日程調整中" | "確定";

export interface ConsultRequest {
  id: string;
  expertId: string;
  expertName: string;
  qualification: string;
  date: string;            // ISO 申込日時
  preferredDate: string;   // 希望日
  method: string;          // オンライン / 対面
  topic: string;
  message: string;
  name: string;
  email: string;
  status: RequestStatus;
}

interface Store {
  history: SimHistory[];
  requests: ConsultRequest[];
  addHistory: (h: SimHistory) => void;
  addRequest: (r: ConsultRequest) => void;
  cancelRequest: (id: string) => void;
  resetAll: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      history: [],
      requests: [],
      addHistory: (h) =>
        set((s) => ({ history: [h, ...s.history].slice(0, 50) })),
      addRequest: (r) => set((s) => ({ requests: [r, ...s.requests] })),
      cancelRequest: (id) =>
        set((s) => ({ requests: s.requests.filter((r) => r.id !== id) })),
      resetAll: () => set({ history: [], requests: [] }),
    }),
    { name: "tax-sim-store" }
  )
);

export const uid = () =>
  Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
