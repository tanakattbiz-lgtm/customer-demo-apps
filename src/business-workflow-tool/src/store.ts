import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildSeed, STAFF, STATUS_LABEL, type Job, type Status } from "./data/seed";

type NewJob = Omit<Job, "id" | "code" | "createdAt" | "history" | "actualHours">;

type State = {
  jobs: Job[];
  addJob: (input: NewJob) => Job;
  updateJob: (id: string, patch: Partial<Job>) => void;
  removeJob: (id: string) => void;
  setStatus: (id: string, status: Status) => void;
  assign: (id: string, assigneeId: string | null) => void;
  reset: () => void;
};

const stamp = (who: string, text: string) => ({
  at: new Date().toISOString(),
  who,
  text,
});

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      jobs: buildSeed(),

      addJob: (input) => {
        const jobs = get().jobs;
        const maxNo = jobs.reduce((m, j) => {
          const n = Number(j.code.split("-")[2] ?? 0);
          return Number.isFinite(n) ? Math.max(m, n) : m;
        }, 0);
        const job: Job = {
          ...input,
          id: `job-${Date.now()}`,
          code: `REQ-2026-${String(maxNo + 1).padStart(4, "0")}`,
          createdAt: new Date().toISOString(),
          actualHours: 0,
          history: [stamp(input.requester, "案件を登録しました")],
        };
        set({ jobs: [job, ...jobs] });
        return job;
      },

      updateJob: (id, patch) =>
        set({
          jobs: get().jobs.map((j) =>
            j.id === id
              ? { ...j, ...patch, history: [...j.history, stamp("操作ユーザー", "内容を更新しました")] }
              : j,
          ),
        }),

      removeJob: (id) => set({ jobs: get().jobs.filter((j) => j.id !== id) }),

      setStatus: (id, status) =>
        set({
          jobs: get().jobs.map((j) =>
            j.id === id
              ? {
                  ...j,
                  status,
                  history: [
                    ...j.history,
                    stamp("操作ユーザー", `ステータスを「${STATUS_LABEL[status]}」に変更しました`),
                  ],
                }
              : j,
          ),
        }),

      assign: (id, assigneeId) =>
        set({
          jobs: get().jobs.map((j) => {
            if (j.id !== id) return j;
            const name = STAFF.find((s) => s.id === assigneeId)?.name;
            return {
              ...j,
              assigneeId,
              history: [
                ...j.history,
                stamp("操作ユーザー", name ? `担当者を ${name} に割り当てました` : "担当者の割り当てを解除しました"),
              ],
            };
          }),
        }),

      reset: () => set({ jobs: buildSeed() }),
    }),
    { name: "bwt-demo-v1" },
  ),
);
