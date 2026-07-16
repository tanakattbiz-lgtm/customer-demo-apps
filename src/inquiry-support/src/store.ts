import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildSeed,
  CURRENT_USER_ID,
  RAW_SAMPLES,
  type AppData,
  type Inquiry,
  type Status,
  type Template,
} from "./data/seed";

interface Settings {
  autoOrganize: boolean; // 受信時に AI で自動整理する
  notifyUrgent: boolean; // 緊急度「高」を通知する
}

interface State extends AppData {
  currentUserId: string;
  authed: boolean;
  settings: Settings;

  login: () => void;
  logout: () => void;

  // 問い合わせ
  addSampleInquiry: () => string; // 新規受信をシミュレート。作成した id を返す
  organize: (id: string) => void; // 未整理 → AI 整理済みへ
  setStatus: (id: string, status: Status) => void;
  assign: (id: string, userId: string) => void;
  saveDraft: (id: string, text: string) => void;
  sendReply: (id: string, text: string) => void;

  // テンプレート
  addTemplate: (t: Omit<Template, "id">) => void;
  deleteTemplate: (id: string) => void;

  // システム
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  reset: () => void;
}

let idc = 100;
const genId = (p: string) => `${p}_${(idc++).toString(36)}${(idc * 7) % 97}`;

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...buildSeed(),
      currentUserId: CURRENT_USER_ID,
      authed: false,
      settings: { autoOrganize: true, notifyUrgent: true },

      login: () => set({ authed: true }),
      logout: () => set({ authed: false }),

      addSampleInquiry: () => {
        const pool = RAW_SAMPLES;
        const s = pool[Math.floor(Math.random() * pool.length)];
        const seq = 149 + (idc % 900);
        const id = genId("inq");
        const inq: Inquiry = {
          id,
          code: `INQ-2026-${String(seq).padStart(4, "0")}`,
          customerName: s.customerName,
          company: s.company,
          channel: s.channel,
          receivedAt: new Date().toISOString(),
          subject: s.subject,
          body: s.body,
          // AI 結果は保持しつつ、organized=false で「未整理」表示にする
          organized: false,
          category: s.result.category,
          summary: s.result.summary,
          priority: s.result.priority,
          sentiment: s.result.sentiment,
          fields: s.result.fields,
          status: "未対応",
        };
        set((st) => ({ inquiries: [inq, ...st.inquiries] }));
        return id;
      },

      organize: (id) =>
        set((st) => ({
          inquiries: st.inquiries.map((q) =>
            q.id === id ? { ...q, organized: true } : q,
          ),
        })),

      setStatus: (id, status) =>
        set((st) => ({
          inquiries: st.inquiries.map((q) =>
            q.id === id ? { ...q, status } : q,
          ),
        })),

      assign: (id, userId) =>
        set((st) => ({
          inquiries: st.inquiries.map((q) =>
            q.id === id ? { ...q, assigneeId: userId } : q,
          ),
        })),

      saveDraft: (id, text) =>
        set((st) => ({
          inquiries: st.inquiries.map((q) =>
            q.id === id ? { ...q, draft: text } : q,
          ),
        })),

      sendReply: (id, text) =>
        set((st) => ({
          inquiries: st.inquiries.map((q) =>
            q.id === id
              ? {
                  ...q,
                  draft: text,
                  status: "返信済み" as Status,
                  repliedAt: new Date().toISOString(),
                  assigneeId: q.assigneeId ?? get().currentUserId,
                }
              : q,
          ),
        })),

      addTemplate: (t) =>
        set((st) => ({ templates: [...st.templates, { ...t, id: genId("t") }] })),

      deleteTemplate: (id) =>
        set((st) => ({ templates: st.templates.filter((t) => t.id !== id) })),

      setSetting: (k, v) =>
        set((st) => ({ settings: { ...st.settings, [k]: v } })),

      reset: () =>
        set({
          ...buildSeed(),
          settings: { autoOrganize: true, notifyUrgent: true },
        }),
    }),
    {
      name: "inquiry-support-store",
      version: 1,
      partialize: (s) => ({
        inquiries: s.inquiries,
        templates: s.templates,
        staff: s.staff,
        settings: s.settings,
        authed: s.authed,
      }),
    },
  ),
);
