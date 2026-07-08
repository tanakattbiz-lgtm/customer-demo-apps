import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildSeed,
  CURRENT_USER_ID,
  type AppData,
  type Client,
  type Matter,
  type Message,
  type Invoice,
  type Notification,
} from "../data/seed";

interface State extends AppData {
  currentUserId: string;
  authed: boolean;
  // auth
  login: () => void;
  logout: () => void;
  // clients
  addClient: (c: Omit<Client, "id" | "createdAt">) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  removeClient: (id: string) => void;
  // matters
  addMatter: (m: Omit<Matter, "id" | "code" | "openedAt" | "updatedAt">) => Matter;
  updateMatter: (id: string, patch: Partial<Matter>) => void;
  removeMatter: (id: string) => void;
  // messages
  sendMessage: (clientId: string, text: string) => void;
  markThreadRead: (clientId: string) => void;
  addIncomingMessage: (clientId: string, text: string) => void;
  // invoices
  payInvoice: (id: string, card: { brand: string; last4: string }) => void;
  addInvoice: (iv: Omit<Invoice, "id">) => void;
  // notifications
  pushNotification: (n: Omit<Notification, "id" | "at">) => void;
  // system
  reset: () => void;
}

let idc = Date.now();
const genId = (prefix: string) => `${prefix}_${(idc++).toString(36)}`;

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...buildSeed(),
      currentUserId: CURRENT_USER_ID,
      authed: false,

      login: () => set({ authed: true }),
      logout: () => set({ authed: false }),

      addClient: (c) => {
        const client: Client = {
          ...c,
          id: genId("c"),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ clients: [client, ...s.clients] }));
        return client;
      },
      updateClient: (id, patch) =>
        set((s) => ({
          clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeClient: (id) =>
        set((s) => ({
          clients: s.clients.filter((c) => c.id !== id),
          matters: s.matters.filter((m) => m.clientId !== id),
          messages: s.messages.filter((m) => m.clientId !== id),
        })),

      addMatter: (m) => {
        const seq = get().matters.length + 118;
        const matter: Matter = {
          ...m,
          id: genId("m"),
          code: `2026-${String(seq).padStart(3, "0")}`,
          openedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ matters: [matter, ...s.matters] }));
        return matter;
      },
      updateMatter: (id, patch) =>
        set((s) => ({
          matters: s.matters.map((m) =>
            m.id === id ? { ...m, ...patch, updatedAt: new Date().toISOString() } : m,
          ),
        })),
      removeMatter: (id) =>
        set((s) => ({ matters: s.matters.filter((m) => m.id !== id) })),

      sendMessage: (clientId, text) => {
        const msg: Message = {
          id: genId("msg"),
          clientId,
          from: "staff",
          authorId: get().currentUserId,
          text,
          at: new Date().toISOString(),
          read: true,
        };
        set((s) => ({ messages: [...s.messages, msg] }));
        const client = get().clients.find((c) => c.id === clientId);
        if (client) {
          get().pushNotification({
            channel: "メール",
            event: "新規メッセージ",
            to: client.email,
            subject: "担当弁護士から新しいメッセージが届いています",
            status: "送信済",
          });
        }
      },
      markThreadRead: (clientId) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.clientId === clientId ? { ...m, read: true } : m,
          ),
        })),
      addIncomingMessage: (clientId, text) => {
        const msg: Message = {
          id: genId("msg"),
          clientId,
          from: "client",
          text,
          at: new Date().toISOString(),
          read: false,
        };
        set((s) => ({ messages: [...s.messages, msg] }));
      },

      payInvoice: (id, card) => {
        set((s) => ({
          invoices: s.invoices.map((iv) =>
            iv.id === id
              ? {
                  ...iv,
                  status: "支払済",
                  paidAt: new Date().toISOString(),
                  method: "クレジットカード",
                  cardBrand: card.brand,
                  cardLast4: card.last4,
                }
              : iv,
          ),
        }));
        const iv = get().invoices.find((x) => x.id === id);
        const client = iv && get().clients.find((c) => c.id === iv.clientId);
        if (iv && client) {
          get().pushNotification({
            channel: "メール",
            event: "入金確認",
            to: client.email,
            subject: `ご入金を確認いたしました(${iv.no})`,
            status: "送信済",
          });
        }
      },
      addInvoice: (iv) =>
        set((s) => ({ invoices: [{ ...iv, id: genId("iv") }, ...s.invoices] })),

      pushNotification: (n) =>
        set((s) => ({
          notifications: [
            { ...n, id: genId("n"), at: new Date().toISOString() },
            ...s.notifications,
          ],
        })),

      reset: () => {
        const seed = buildSeed();
        set({ ...seed, authed: true, currentUserId: CURRENT_USER_ID });
      },
    }),
    {
      name: "law-office-app-v1",
      partialize: (s) => {
        // authed は永続化しない(リロードでログイン画面に戻す)
        const { authed: _authed, ...rest } = s;
        return rest as State;
      },
    },
  ),
);

// --- 便利セレクタ ---
export const staffById = (staff: State["staff"], id?: string) =>
  staff.find((s) => s.id === id);
