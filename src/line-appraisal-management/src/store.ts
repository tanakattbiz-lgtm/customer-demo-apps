import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildSeed,
  makeIncoming,
  CURRENT_USER_ID,
  type AppData,
  type AppraisalRequest,
  type Status,
  type Message,
} from "./data/seed";

interface Settings {
  liveIntake: boolean; // LINE からの新規受付シミュレーション
  autoAssign: boolean; // 新規受付を自動で担当割当
}

interface State extends AppData {
  currentUserId: string;
  settings: Settings;

  setStatus: (id: string, status: Status) => void;
  assign: (id: string, staffId: string) => void;
  setQuote: (id: string, quote: number) => void; // 査定額を確定 → 回答済へ
  reply: (id: string, text: string) => void;
  toggleTag: (id: string, tag: string) => void;
  receive: (req?: AppraisalRequest) => AppraisalRequest;

  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  reset: () => void;
}

let idc = 0;
const genId = (p: string) => `${p}_${(idc++).toString(36)}_${(idc * 7) % 9973}`;

const touch = (r: AppraisalRequest): AppraisalRequest => ({
  ...r,
  updatedAt: new Date().toISOString(),
});

const sysMsg = (text: string): Message => ({
  id: genId("m"),
  from: "system",
  text,
  at: new Date().toISOString(),
});

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...buildSeed(),
      currentUserId: CURRENT_USER_ID,
      settings: { liveIntake: true, autoAssign: false },

      setStatus: (id, status) =>
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id !== id
              ? r
              : touch({
                  ...r,
                  status,
                  assigneeId:
                    status !== "未対応" && !r.assigneeId ? get().currentUserId : r.assigneeId,
                  messages: [...r.messages, sysMsg(`ステータスを「${status}」に変更しました。`)],
                }),
          ),
        })),

      assign: (id, staffId) =>
        set((s) => ({
          requests: s.requests.map((r) => (r.id !== id ? r : touch({ ...r, assigneeId: staffId }))),
        })),

      setQuote: (id, quote) =>
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id !== id
              ? r
              : touch({
                  ...r,
                  quote,
                  status: "回答済",
                  assigneeId: r.assigneeId || get().currentUserId,
                  messages: [
                    ...r.messages,
                    {
                      id: genId("m"),
                      from: "staff",
                      text: `査定額は ¥${quote.toLocaleString("ja-JP")} でございます。ご検討ください。`,
                      at: new Date().toISOString(),
                    },
                  ],
                }),
          ),
        })),

      reply: (id, text) =>
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id !== id
              ? r
              : touch({
                  ...r,
                  messages: [
                    ...r.messages,
                    { id: genId("m"), from: "staff", text, at: new Date().toISOString() },
                  ],
                }),
          ),
        })),

      toggleTag: (id, tag) =>
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id !== id
              ? r
              : touch({
                  ...r,
                  tags: r.tags.includes(tag) ? r.tags.filter((t) => t !== tag) : [...r.tags, tag],
                }),
          ),
        })),

      receive: (req) => {
        const incoming = req ?? makeIncoming();
        const assigned = get().settings.autoAssign
          ? { ...incoming, assigneeId: get().currentUserId }
          : incoming;
        set((s) => ({ requests: [assigned, ...s.requests] }));
        return assigned;
      },

      setSetting: (k, v) => set((s) => ({ settings: { ...s.settings, [k]: v } })),

      reset: () =>
        set({ ...buildSeed(), settings: { liveIntake: true, autoAssign: false } }),
    }),
    {
      name: "line-appraisal-store",
      version: 1,
      partialize: (s) => ({
        requests: s.requests,
        staff: s.staff,
        settings: s.settings,
      }),
    },
  ),
);
