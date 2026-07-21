import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildSeed,
  type AppData,
  type Review,
  type Application,
} from "./data/seed";

interface State extends AppData {
  addReview: (shopId: string, r: Omit<Review, "id" | "createdAt" | "helpful">) => void;
  markHelpful: (shopId: string, reviewId: string) => void;
  toggleBookmark: (shopId: string) => void;
  addApplication: (a: Omit<Application, "id" | "createdAt" | "status">) => void;
  reset: () => void;
}

let idc = 0;
const genId = (p: string) => `${p}_${Date.now().toString(36)}_${(idc++).toString(36)}`;

export const useStore = create<State>()(
  persist(
    (set) => ({
      ...buildSeed(),

      addReview: (shopId, r) =>
        set((s) => ({
          shops: s.shops.map((shop) => {
            if (shop.id !== shopId) return shop;
            const review: Review = {
              ...r,
              id: genId("rv"),
              createdAt: new Date().toISOString(),
              helpful: 0,
            };
            const nextCount = shop.reviewCount + 1;
            // 総合評価を新しい口コミで少しだけ動かす(現実的な平均の挙動)
            const nextRating =
              Math.round(
                ((shop.rating * shop.reviewCount + r.rating) / nextCount) * 10,
              ) / 10;
            return {
              ...shop,
              reviews: [review, ...shop.reviews],
              reviewCount: nextCount,
              rating: nextRating,
            };
          }),
        })),

      markHelpful: (shopId, reviewId) =>
        set((s) => ({
          shops: s.shops.map((shop) =>
            shop.id !== shopId
              ? shop
              : {
                  ...shop,
                  reviews: shop.reviews.map((rv) =>
                    rv.id === reviewId ? { ...rv, helpful: rv.helpful + 1 } : rv,
                  ),
                },
          ),
        })),

      toggleBookmark: (shopId) =>
        set((s) => ({
          bookmarks: s.bookmarks.includes(shopId)
            ? s.bookmarks.filter((id) => id !== shopId)
            : [shopId, ...s.bookmarks],
        })),

      addApplication: (a) =>
        set((s) => ({
          applications: [
            {
              ...a,
              id: genId("app"),
              createdAt: new Date().toISOString(),
              status: "審査中" as const,
            },
            ...s.applications,
          ],
        })),

      reset: () => set({ ...buildSeed() }),
    }),
    {
      name: "car-coating-portal",
      version: 1,
      partialize: (s) => ({
        shops: s.shops,
        applications: s.applications,
        bookmarks: s.bookmarks,
      }),
    },
  ),
);
