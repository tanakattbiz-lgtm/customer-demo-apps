import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MACHINES, OPTIONS } from "./data/seed";
import { calcBaseFee } from "./lib/format";

export type CartItem = {
  uid: string;
  machineId: string;
  branchId: string;
  startDate: string; // yyyy-MM-dd
  days: number;
  qty: number;
  optionIds: string[];
};

export type OrderStatus = "受付中" | "手配済み" | "貸出中" | "返却済み" | "キャンセル";

export type Order = {
  id: string;
  createdAt: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  customer: {
    company: string;
    person: string;
    tel: string;
    email: string;
    site: string;
    note: string;
  };
};

export type Inquiry = {
  id: string;
  createdAt: string;
  name: string;
  company: string;
  email: string;
  category: string;
  body: string;
};

type State = {
  cart: CartItem[];
  orders: Order[];
  favorites: string[];
  inquiries: Inquiry[];
  addToCart: (item: Omit<CartItem, "uid">) => void;
  updateCartItem: (uid: string, patch: Partial<CartItem>) => void;
  removeFromCart: (uid: string) => void;
  clearCart: () => void;
  placeOrder: (customer: Order["customer"]) => Order;
  cancelOrder: (id: string) => void;
  toggleFavorite: (machineId: string) => void;
  addInquiry: (i: Omit<Inquiry, "id" | "createdAt">) => void;
  resetAll: () => void;
};

/** 明細 1 行の金額を計算する */
export function itemTotal(item: CartItem): number {
  const m = MACHINES.find((x) => x.id === item.machineId);
  if (!m) return 0;
  const base = calcBaseFee(m.dayRate, m.monthRate, item.days) * item.qty;
  const opts = item.optionIds.reduce((sum, id) => {
    const o = OPTIONS.find((x) => x.id === id);
    if (!o) return sum;
    if (o.unit === "1日") return sum + o.price * item.days * item.qty;
    if (o.unit === "1回") return sum + o.price;
    return sum + o.price * item.qty;
  }, 0);
  return base + opts;
}

export const cartTotal = (items: CartItem[]) => items.reduce((s, i) => s + itemTotal(i), 0);

let seq = 0;
const uid = () => `${Date.now().toString(36)}-${(seq++).toString(36)}`;

const orderNo = () => {
  const now = new Date();
  const y = now.getFullYear();
  const n = Math.floor(now.getTime() / 1000) % 100000;
  return `R${y}-${String(n).padStart(5, "0")}`;
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      cart: [],
      orders: [],
      favorites: [],
      inquiries: [],

      addToCart: (item) =>
        set((s) => ({ cart: [...s.cart, { ...item, uid: uid() }] })),

      updateCartItem: (uidKey, patch) =>
        set((s) => ({
          cart: s.cart.map((c) => (c.uid === uidKey ? { ...c, ...patch } : c)),
        })),

      removeFromCart: (uidKey) =>
        set((s) => ({ cart: s.cart.filter((c) => c.uid !== uidKey) })),

      clearCart: () => set({ cart: [] }),

      placeOrder: (customer) => {
        const items = get().cart;
        const order: Order = {
          id: orderNo(),
          createdAt: new Date().toISOString(),
          items,
          total: cartTotal(items),
          status: "受付中",
          customer,
        };
        set((s) => ({ orders: [order, ...s.orders], cart: [] }));
        return order;
      },

      cancelOrder: (id) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status: "キャンセル" } : o)),
        })),

      toggleFavorite: (machineId) =>
        set((s) => ({
          favorites: s.favorites.includes(machineId)
            ? s.favorites.filter((f) => f !== machineId)
            : [...s.favorites, machineId],
        })),

      addInquiry: (i) =>
        set((s) => ({
          inquiries: [
            { ...i, id: uid(), createdAt: new Date().toISOString() },
            ...s.inquiries,
          ],
        })),

      resetAll: () => set({ cart: [], orders: [], favorites: [], inquiries: [] }),
    }),
    { name: "machinery-rental-demo" },
  ),
);
