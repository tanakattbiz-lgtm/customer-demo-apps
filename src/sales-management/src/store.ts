import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildSeed, CURRENT_USER_ID, type AppData, type Report, type Rep } from "./data/seed";

export type NewReport = Omit<Report, "id" | "createdAt">;

interface State extends AppData {
  authed: boolean;
  currentUserId: string;

  login: () => void;
  logout: () => void;
  setCurrentUser: (id: string) => void;

  addReport: (r: NewReport) => Report;
  updateReport: (id: string, patch: Partial<NewReport>) => void;
  deleteReport: (id: string) => void;
  importReports: (rows: NewReport[]) => number;

  reset: () => void;
}

let idc = 0;
const genId = () => `rp_${Date.now().toString(36)}${(idc++).toString(36)}`;

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...buildSeed(),
      authed: false,
      currentUserId: CURRENT_USER_ID,

      login: () => set({ authed: true }),
      logout: () => set({ authed: false }),
      setCurrentUser: (id) => set({ currentUserId: id }),

      addReport: (r) => {
        const rec: Report = { ...r, id: genId(), createdAt: new Date().toISOString() };
        set((s) => ({ reports: sortReports([rec, ...s.reports]) }));
        return rec;
      },

      updateReport: (id, patch) =>
        set((s) => ({
          reports: sortReports(s.reports.map((x) => (x.id === id ? { ...x, ...patch } : x))),
        })),

      deleteReport: (id) => set((s) => ({ reports: s.reports.filter((x) => x.id !== id) })),

      importReports: (rows) => {
        const recs: Report[] = rows.map((r) => ({
          ...r,
          id: genId(),
          createdAt: new Date().toISOString(),
        }));
        set((s) => ({ reports: sortReports([...recs, ...s.reports]) }));
        return recs.length;
      },

      reset: () => set({ ...buildSeed(), currentUserId: CURRENT_USER_ID }),
    }),
    {
      name: "sales-management-store",
      version: 1,
      partialize: (s) => ({
        reps: s.reps,
        reports: s.reports,
        authed: s.authed,
        currentUserId: s.currentUserId,
      }),
    },
  ),
);

function sortReports(list: Report[]): Report[] {
  return [...list].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : a.createdAt < b.createdAt ? 1 : -1,
  );
}

// ---- セレクタ的ヘルパー ----
export function repOf(reps: Rep[], id: string): Rep | undefined {
  return reps.find((r) => r.id === id);
}
