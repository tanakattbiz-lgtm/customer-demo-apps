import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  seedKnowledge,
  seedSessions,
  type KBArticle,
  type Session,
  type ChatMessage,
} from "./data/seed";
import { uid } from "./lib/fakeApi";

interface AppState {
  authed: boolean;
  kb: KBArticle[];
  sessions: Session[];

  login: () => void;
  logout: () => void;

  // ナレッジ CRUD
  saveArticle: (a: KBArticle) => void;
  deleteArticle: (id: string) => void;

  // 会話ログ
  addSession: (s: Session) => void;
  appendMessage: (sessionId: string, m: ChatMessage) => void;
  setSessionStatus: (sessionId: string, status: Session["status"]) => void;

  reset: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      authed: false,
      kb: seedKnowledge(),
      sessions: seedSessions(),

      login: () => set({ authed: true }),
      logout: () => set({ authed: false }),

      saveArticle: (a) =>
        set((st) => {
          const exists = st.kb.some((x) => x.id === a.id);
          return {
            kb: exists ? st.kb.map((x) => (x.id === a.id ? a : x)) : [a, ...st.kb],
          };
        }),
      deleteArticle: (id) => set((st) => ({ kb: st.kb.filter((x) => x.id !== id) })),

      addSession: (s) => set((st) => ({ sessions: [s, ...st.sessions] })),
      appendMessage: (sessionId, m) =>
        set((st) => ({
          sessions: st.sessions.map((s) =>
            s.id === sessionId ? { ...s, messages: [...s.messages, m] } : s,
          ),
        })),
      setSessionStatus: (sessionId, status) =>
        set((st) => ({
          sessions: st.sessions.map((s) => (s.id === sessionId ? { ...s, status } : s)),
        })),

      reset: () =>
        set({
          kb: seedKnowledge(),
          sessions: seedSessions(),
        }),
    }),
    {
      name: "ai-chatbot-demo",
      partialize: (s) => ({ kb: s.kb, sessions: s.sessions, authed: s.authed }),
    },
  ),
);

export function newArticleId() {
  return uid("kb");
}
