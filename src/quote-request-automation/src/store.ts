import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildSeed, type AppData, type Part, type HistoryRecord, type SendMode } from "./data/seed";
import type { DraftEmail } from "./lib/compose";

interface Settings {
  /** 送信の既定モード */
  defaultMode: SendMode;
  /** 図面が未検出の依頼先への送信を止める */
  blockOnMissing: boolean;
  /** 送信控えを自分宛にも残す(Bcc相当のダミー設定) */
  keepCopy: boolean;
}

interface State extends AppData {
  authed: boolean;
  currentProjectId: string;
  settings: Settings;

  // auth
  login: () => void;
  logout: () => void;

  // project
  setCurrentProject: (id: string) => void;

  // parts (CRUD)
  addPart: (p: Omit<Part, "id">) => void;
  updatePart: (id: string, patch: Partial<Omit<Part, "id" | "projectId">>) => void;
  deletePart: (id: string) => void;
  setPartSuppliers: (id: string, supplierIds: string[]) => void;

  // send
  recordSend: (project: { code: string; name: string }, emails: DraftEmail[], mode: SendMode) => HistoryRecord[];

  // settings / system
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  reset: () => void;
}

let idc = 0;
const genId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${(idc++).toString(36)}`;

const DEFAULT_SETTINGS: Settings = { defaultMode: "送信", blockOnMissing: false, keepCopy: true };

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...buildSeed(),
      authed: false,
      currentProjectId: "pj1",
      settings: { ...DEFAULT_SETTINGS },

      login: () => set({ authed: true }),
      logout: () => set({ authed: false }),

      setCurrentProject: (id) => set({ currentProjectId: id }),

      addPart: (p) => set((s) => ({ parts: [{ ...p, id: genId("pt") }, ...s.parts] })),

      updatePart: (id, patch) =>
        set((s) => ({ parts: s.parts.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),

      deletePart: (id) => set((s) => ({ parts: s.parts.filter((p) => p.id !== id) })),

      setPartSuppliers: (id, supplierIds) =>
        set((s) => ({ parts: s.parts.map((p) => (p.id === id ? { ...p, supplierIds } : p)) })),

      recordSend: (project, emails, mode) => {
        const at = new Date().toISOString();
        const records: HistoryRecord[] = emails.map((e) => ({
          id: genId("h"),
          at,
          mode,
          supplierId: e.supplier.id,
          supplierName: e.supplier.name,
          contact: e.supplier.contact,
          projectCode: project.code,
          projectName: project.name,
          subject: e.subject,
          parts: e.parts.map((p) => p.name),
          attachments: e.attachments,
          missing: e.missing,
        }));
        set((s) => ({ history: [...records, ...s.history] }));
        return records;
      },

      setSetting: (k, v) => set((s) => ({ settings: { ...s.settings, [k]: v } })),

      reset: () => set({ ...buildSeed(), settings: { ...DEFAULT_SETTINGS }, currentProjectId: "pj1" }),
    }),
    {
      name: "quote-request-automation-store",
      version: 1,
      partialize: (s) => ({
        suppliers: s.suppliers,
        projects: s.projects,
        parts: s.parts,
        drawingFolder: s.drawingFolder,
        history: s.history,
        settings: s.settings,
        currentProjectId: s.currentProjectId,
        authed: s.authed,
      }),
    },
  ),
);
