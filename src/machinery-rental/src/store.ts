import { create } from "zustand";
import { persist } from "zustand/middleware";

/* =========================================================
   コーポレートサイトのため、保持するのは
   「お問い合わせの控え」と「資料の閲覧履歴」のみ。
   ブラウザ内(localStorage)にのみ保存される。
   ========================================================= */

export type Inquiry = {
  id: string;
  createdAt: string;
  category: string;
  company: string;
  name: string;
  tel: string;
  email: string;
  /** 機種ページから引き継いだ問い合わせ対象 */
  subject: string;
  body: string;
};

type State = {
  inquiries: Inquiry[];
  viewedCatalogs: string[];
  addInquiry: (i: Omit<Inquiry, "id" | "createdAt">) => Inquiry;
  markCatalogViewed: (id: string) => void;
  resetAll: () => void;
};

let seq = 0;
const receiptNo = () => {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const n = (Math.floor(now.getTime() / 1000) % 10000) + seq++;
  return `IQ-${ymd}-${String(n).padStart(4, "0")}`;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      inquiries: [],
      viewedCatalogs: [],

      addInquiry: (i) => {
        const record: Inquiry = {
          ...i,
          id: receiptNo(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ inquiries: [record, ...s.inquiries] }));
        return record;
      },

      markCatalogViewed: (id) =>
        set((s) => ({
          viewedCatalogs: s.viewedCatalogs.includes(id)
            ? s.viewedCatalogs
            : [...s.viewedCatalogs, id],
        })),

      resetAll: () => set({ inquiries: [], viewedCatalogs: [] }),
    }),
    { name: "machinery-rental-corp-demo" },
  ),
);
