import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type Design,
  type DesignStatus,
  DEFAULT_TRANSFORM,
  makeSeedDesigns,
  SIZES,
} from "./data/seed";

let counter = 0;
function newId() {
  counter += 1;
  return `dsn_new${counter}_${counter.toString(36)}`;
}

type State = {
  designs: Design[];
  createDesign: (partial?: Partial<Design>) => Design;
  saveDesign: (d: Design) => void;
  removeDesign: (id: string) => void;
  duplicateDesign: (id: string) => Design | null;
  setStatus: (id: string, status: DesignStatus) => void;
  getDesign: (id: string) => Design | undefined;
  reset: () => void;
};

function nowIso() {
  return new Date().toISOString();
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      designs: makeSeedDesigns(),

      createDesign: (partial) => {
        const ts = nowIso();
        const d: Design = {
          id: newId(),
          name: "無題のデザイン",
          sizeId: SIZES[2].id,
          imageSrc: null,
          bgColor: "#ffffff",
          transform: { ...DEFAULT_TRANSFORM },
          qty: 20,
          status: "draft",
          createdAt: ts,
          updatedAt: ts,
          ...partial,
        };
        set((s) => ({ designs: [d, ...s.designs] }));
        return d;
      },

      saveDesign: (d) =>
        set((s) => ({
          designs: s.designs.map((x) => (x.id === d.id ? { ...d, updatedAt: nowIso() } : x)),
        })),

      removeDesign: (id) => set((s) => ({ designs: s.designs.filter((x) => x.id !== id) })),

      duplicateDesign: (id) => {
        const src = get().designs.find((x) => x.id === id);
        if (!src) return null;
        const ts = nowIso();
        const copy: Design = {
          ...src,
          id: newId(),
          name: `${src.name} のコピー`,
          status: "draft",
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => ({ designs: [copy, ...s.designs] }));
        return copy;
      },

      setStatus: (id, status) =>
        set((s) => ({
          designs: s.designs.map((x) => (x.id === id ? { ...x, status, updatedAt: nowIso() } : x)),
        })),

      getDesign: (id) => get().designs.find((x) => x.id === id),

      reset: () => set({ designs: makeSeedDesigns() }),
    }),
    { name: "badge-simulator-v1" },
  ),
);
