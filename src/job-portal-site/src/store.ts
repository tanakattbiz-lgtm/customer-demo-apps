import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildSeed,
  type AppData,
  type Job,
  type Application,
} from "./data/seed";

interface State extends AppData {
  savedIds: string[]; // 気になる(ブックマーク)
  appliedIds: string[]; // 応募済みの求人ID

  addJob: (j: Omit<Job, "id" | "postedAt" | "views" | "published">) => Job;
  togglePublish: (id: string) => void;
  toggleSave: (id: string) => void;
  addApplication: (a: Omit<Application, "id" | "appliedAt" | "status">) => void;
  setAppStatus: (id: string, status: Application["status"]) => void;
  reset: () => void;
}

let seq = 100;
const genId = (p: string) => `${p}-${(seq++).toString(36)}${(Date.now() % 9973).toString(36)}`;

export const useStore = create<State>()(
  persist(
    (set) => ({
      ...buildSeed(),
      savedIds: [],
      appliedIds: [],

      addJob: (input) => {
        const job: Job = {
          ...input,
          id: genId("job"),
          postedAt: new Date().toISOString(),
          views: 0,
          published: true,
        };
        set((s) => ({ jobs: [job, ...s.jobs] }));
        return job;
      },

      togglePublish: (id) =>
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === id ? { ...j, published: !j.published } : j,
          ),
        })),

      toggleSave: (id) =>
        set((s) => ({
          savedIds: s.savedIds.includes(id)
            ? s.savedIds.filter((x) => x !== id)
            : [id, ...s.savedIds],
        })),

      addApplication: (input) =>
        set((s) => ({
          applications: [
            {
              ...input,
              id: genId("app"),
              appliedAt: new Date().toISOString(),
              status: "新規応募",
            },
            ...s.applications,
          ],
          appliedIds: [input.jobId, ...s.appliedIds],
        })),

      setAppStatus: (id, status) =>
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id ? { ...a, status } : a,
          ),
        })),

      reset: () => set({ ...buildSeed(), savedIds: [], appliedIds: [] }),
    }),
    {
      name: "job-portal-store",
      version: 1,
    },
  ),
);
