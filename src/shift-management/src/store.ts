import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildSeed,
  LEADER_ID,
  DEFAULT_STAFF_ID,
  type AppData,
  type Availability,
  type ShiftRequest,
  type Assignment,
  type Announcement,
  type Member,
  type Position,
  type PeriodStatus,
} from "./data/seed";

interface State extends AppData {
  authed: boolean;
  currentStaffId: string; // スタッフ画面で「あなた」として選択中のメンバー

  login: () => void;
  logout: () => void;
  setCurrentStaff: (id: string) => void;

  // シフト希望(スタッフ)
  setRequest: (
    memberId: string,
    date: string,
    availability: Availability,
    time?: { from?: string; to?: string },
  ) => void;
  submitRequests: (memberId: string) => void;

  // 割当(管理者)
  upsertAssignment: (a: Omit<Assignment, "id"> & { id?: string }) => void;
  removeAssignment: (memberId: string, date: string) => void;
  clearDayAssignments: (date: string) => void;
  setPeriodStatus: (status: PeriodStatus) => void;

  // お知らせ
  addAnnouncement: (a: { title: string; body: string }) => void;
  removeAnnouncement: (id: string) => void;

  // スタッフ管理
  addMember: (m: Omit<Member, "id" | "color" | "active" | "hiredAt">) => void;
  updateMember: (id: string, patch: Partial<Member>) => void;
  removeMember: (id: string) => void;

  reset: () => void;
}

let idc = 0;
const genId = (p: string) => `${p}_${Date.now().toString(36)}_${(idc++).toString(36)}`;

const AVATAR_COLORS = [
  "oklch(55% 0.16 264)",
  "oklch(56% 0.15 40)",
  "oklch(55% 0.14 155)",
  "oklch(56% 0.15 300)",
];

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...buildSeed(),
      authed: false,
      currentStaffId: DEFAULT_STAFF_ID,

      login: () => set({ authed: true }),
      logout: () => set({ authed: false }),
      setCurrentStaff: (id) => set({ currentStaffId: id }),

      setRequest: (memberId, date, availability, time) =>
        set((s) => {
          const others = s.requests.filter(
            (r) => !(r.memberId === memberId && r.date === date),
          );
          const req: ShiftRequest = { memberId, date, availability };
          if (availability === "limited") {
            req.from = time?.from ?? "17:00";
            req.to = time?.to ?? "22:00";
          }
          return { requests: [...others, req] };
        }),

      submitRequests: (memberId) =>
        set((s) => ({
          submissions: s.submissions.map((sub) =>
            sub.memberId === memberId
              ? { ...sub, submittedAt: new Date().toISOString() }
              : sub,
          ),
        })),

      upsertAssignment: (a) =>
        set((s) => {
          const others = s.assignments.filter(
            (x) => !(x.memberId === a.memberId && x.date === a.date),
          );
          return {
            assignments: [
              ...others,
              { ...a, id: a.id ?? genId("as") } as Assignment,
            ],
          };
        }),

      removeAssignment: (memberId, date) =>
        set((s) => ({
          assignments: s.assignments.filter(
            (x) => !(x.memberId === memberId && x.date === date),
          ),
        })),

      clearDayAssignments: (date) =>
        set((s) => ({
          assignments: s.assignments.filter((x) => x.date !== date),
        })),

      setPeriodStatus: (status) =>
        set((s) => ({ period: { ...s.period, status } })),

      addAnnouncement: ({ title, body }) =>
        set((s) => ({
          announcements: [
            { id: genId("an"), title, body, at: new Date().toISOString() },
            ...s.announcements,
          ],
        })),

      removeAnnouncement: (id) =>
        set((s) => ({
          announcements: s.announcements.filter((a) => a.id !== id),
        })),

      addMember: (m) =>
        set((s) => {
          const id = genId("m");
          const newMember: Member = {
            ...m,
            id,
            color: AVATAR_COLORS[s.members.length % AVATAR_COLORS.length],
            active: true,
            hiredAt: new Date().toISOString().slice(0, 10),
          };
          return {
            members: [...s.members, newMember],
            submissions: [...s.submissions, { memberId: id, submittedAt: undefined }],
          };
        }),

      updateMember: (id, patch) =>
        set((s) => ({
          members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),

      removeMember: (id) =>
        set((s) => ({
          members: s.members.filter((m) => m.id !== id),
          submissions: s.submissions.filter((sub) => sub.memberId !== id),
          requests: s.requests.filter((r) => r.memberId !== id),
          assignments: s.assignments.filter((a) => a.memberId !== id),
        })),

      reset: () =>
        set({ ...buildSeed(), currentStaffId: DEFAULT_STAFF_ID }),
    }),
    {
      name: "shift-management-store",
      version: 1,
      partialize: (s) => ({
        period: s.period,
        members: s.members,
        requests: s.requests,
        submissions: s.submissions,
        assignments: s.assignments,
        announcements: s.announcements,
        authed: s.authed,
        currentStaffId: s.currentStaffId,
      }),
    },
  ),
);

export { LEADER_ID, DEFAULT_STAFF_ID };

// ---------------- 派生セレクタ(ヘルパ) ----------------
export function memberById(members: Member[], id: string): Member | undefined {
  return members.find((m) => m.id === id);
}

export function requestFor(
  requests: ShiftRequest[],
  memberId: string,
  date: string,
): ShiftRequest | undefined {
  return requests.find((r) => r.memberId === memberId && r.date === date);
}

export function assignmentFor(
  assignments: Assignment[],
  memberId: string,
  date: string,
): Assignment | undefined {
  return assignments.find((a) => a.memberId === memberId && a.date === date);
}

export type { Position };
