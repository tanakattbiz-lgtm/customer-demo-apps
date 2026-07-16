import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildSeed,
  CURRENT_USER_ID,
  type AppData,
  type Post,
  type User,
} from "./data/seed";

interface State extends AppData {
  currentUserId: string;
  authed: boolean;

  // 認証(デモ用)
  login: () => void;
  logout: () => void;
  register: (input: {
    name: string;
    handle: string;
    bio: string;
    location: string;
    interests: string[];
  }) => void;

  // 投稿・いいね・コメント
  addPost: (body: string, topic: string) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, body: string) => void;
  deletePost: (postId: string) => void;

  // フォロー
  toggleFollow: (userId: string) => void;

  // プロフィール
  updateProfile: (input: Partial<Pick<User, "name" | "bio" | "location" | "interests">>) => void;

  reset: () => void;
}

let idc = 0;
const genId = (prefix: string) => `${prefix}_${Date.now().toString(36)}${(idc++).toString(36)}`;

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...buildSeed(),
      currentUserId: CURRENT_USER_ID,
      authed: false,

      login: () => set({ authed: true }),
      logout: () => set({ authed: false }),

      register: ({ name, handle, bio, location, interests }) => {
        // デモでは既存のデモユーザー(u_me)のプロフィールを上書きしてログイン
        set((s) => ({
          authed: true,
          users: s.users.map((u) =>
            u.id === CURRENT_USER_ID
              ? { ...u, name, handle, bio, location, interests }
              : u,
          ),
        }));
      },

      addPost: (body, topic) =>
        set((s) => {
          const post: Post = {
            id: genId("p"),
            authorId: s.currentUserId,
            body: body.trim(),
            topic: topic.trim() || "つぶやき",
            createdAt: new Date().toISOString(),
            likedBy: [],
            comments: [],
          };
          return { posts: [post, ...s.posts] };
        }),

      toggleLike: (postId) =>
        set((s) => ({
          posts: s.posts.map((p) => {
            if (p.id !== postId) return p;
            const me = s.currentUserId;
            const liked = p.likedBy.includes(me);
            return {
              ...p,
              likedBy: liked ? p.likedBy.filter((id) => id !== me) : [...p.likedBy, me],
            };
          }),
        })),

      addComment: (postId, body) =>
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id !== postId
              ? p
              : {
                  ...p,
                  comments: [
                    ...p.comments,
                    {
                      id: genId("c"),
                      authorId: s.currentUserId,
                      body: body.trim(),
                      createdAt: new Date().toISOString(),
                    },
                  ],
                },
          ),
        })),

      deletePost: (postId) =>
        set((s) => ({ posts: s.posts.filter((p) => p.id !== postId) })),

      toggleFollow: (userId) =>
        set((s) => ({
          users: s.users.map((u) => {
            if (u.id !== s.currentUserId) return u;
            const following = u.followingIds.includes(userId);
            return {
              ...u,
              followingIds: following
                ? u.followingIds.filter((id) => id !== userId)
                : [...u.followingIds, userId],
            };
          }),
        })),

      updateProfile: (input) =>
        set((s) => ({
          users: s.users.map((u) =>
            u.id === s.currentUserId ? { ...u, ...input } : u,
          ),
        })),

      reset: () => set({ ...buildSeed(), authed: false }),
    }),
    {
      name: "community-site-store",
      version: 1,
      partialize: (s) => ({
        users: s.users,
        posts: s.posts,
        authed: s.authed,
      }),
    },
  ),
);

// ---- セレクタ的なヘルパ ----
export function useCurrentUser(): User {
  return useStore((s) => s.users.find((u) => u.id === s.currentUserId)!);
}

export function followerCount(users: User[], userId: string): number {
  return users.filter((u) => u.followingIds.includes(userId)).length;
}
