import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildSeed,
  scenarioForStage,
  STAGE_ORDER,
  STAGE_LABEL,
  type AppData,
  type Member,
  type Stage,
  type Faq,
  type ScenarioStep,
  type Activity,
} from "./data/seed";

export interface Settings {
  autoDelivery: boolean; // ステップ自動配信
  autoFaqReply: boolean; // FAQ自動返信
  notifyStalled: boolean; // 停滞ユーザーの通知
}

interface State extends AppData {
  settings: Settings;

  // ステップ配信
  sendNextStep: (
    memberId: string,
  ) => { ok: boolean; advanced: boolean; stageLabel?: string; stepTitle?: string };

  // ユーザー操作
  addMember: (input: { name: string; lineName: string; broker: string; reward: number; assigneeId: string }) => Member;
  setStage: (memberId: string, stage: Stage) => void;
  updateNote: (memberId: string, note: string) => void;

  // FAQ
  addFaq: (input: Omit<Faq, "id" | "hits">) => void;
  updateFaq: (id: string, patch: Partial<Faq>) => void;
  toggleFaq: (id: string) => void;
  deleteFaq: (id: string) => void;

  // シナリオ(ステップ)
  addStep: (stage: Stage, step: Omit<ScenarioStep, "id">) => void;
  updateStep: (stage: Stage, stepId: string, patch: Partial<ScenarioStep>) => void;
  deleteStep: (stage: Stage, stepId: string) => void;

  // アクティビティ
  pushActivity: (a: Omit<Activity, "id" | "at"> & { at?: string }) => void;

  // 設定 / システム
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  reset: () => void;
}

let idc = 0;
const genId = (p: string) => `${p}_${Date.now().toString(36)}_${(idc++).toString(36)}`;

const DEFAULT_SETTINGS: Settings = {
  autoDelivery: true,
  autoFaqReply: true,
  notifyStalled: true,
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...buildSeed(),
      settings: DEFAULT_SETTINGS,

      sendNextStep: (memberId) => {
        const st = get();
        const m = st.members.find((x) => x.id === memberId);
        if (!m || m.stage === "done" || m.stage === "churn")
          return { ok: false, advanced: false };
        const sc = scenarioForStage(st.scenarios, m.stage);
        if (!sc) return { ok: false, advanced: false };

        const step = sc.steps[m.stepIndex];
        if (!step) return { ok: false, advanced: false };

        const nextIndex = m.stepIndex + 1;
        const finishedStage = nextIndex >= sc.steps.length;
        const nowIso = new Date().toISOString();

        let advancedStage: Stage | null = null;
        if (finishedStage) {
          const pos = STAGE_ORDER.indexOf(m.stage);
          advancedStage = STAGE_ORDER[pos + 1] ?? null;
        }

        set((s) => ({
          members: s.members.map((x) => {
            if (x.id !== memberId) return x;
            if (advancedStage) {
              return { ...x, stage: advancedStage, stepIndex: 0, lastActiveAt: nowIso };
            }
            return { ...x, stepIndex: nextIndex, lastActiveAt: nowIso };
          }),
        }));

        get().pushActivity({
          type: "step",
          memberId: m.id,
          memberName: m.name,
          text: `${STAGE_LABEL[m.stage]} ステップ${m.stepIndex + 1}「${step.title}」を配信しました。`,
        });

        if (advancedStage) {
          get().pushActivity({
            type: "stage",
            memberId: m.id,
            memberName: m.name,
            text: `が${STAGE_LABEL[advancedStage]}へ進みました。`,
          });
        }

        return {
          ok: true,
          advanced: !!advancedStage,
          stageLabel: advancedStage ? STAGE_LABEL[advancedStage] : undefined,
          stepTitle: step.title,
        };
      },

      addMember: (input) => {
        const nowIso = new Date().toISOString();
        const m: Member = {
          id: genId("mb"),
          name: input.name,
          lineName: input.lineName,
          color: "oklch(60% 0.14 151)",
          stage: "friend",
          stepIndex: 0,
          joinedAt: nowIso,
          lastActiveAt: nowIso,
          broker: input.broker,
          reward: input.reward,
          assigneeId: input.assigneeId,
        };
        set((s) => ({ members: [m, ...s.members] }));
        get().pushActivity({
          type: "join",
          memberId: m.id,
          memberName: m.name,
          text: "が友だち追加しました。ウェルカムメッセージを自動配信。",
        });
        return m;
      },

      setStage: (memberId, stage) =>
        set((s) => ({
          members: s.members.map((x) =>
            x.id === memberId
              ? { ...x, stage, stepIndex: 0, lastActiveAt: new Date().toISOString() }
              : x,
          ),
        })),

      updateNote: (memberId, note) =>
        set((s) => ({
          members: s.members.map((x) => (x.id === memberId ? { ...x, note } : x)),
        })),

      addFaq: (input) =>
        set((s) => ({
          faqs: [{ ...input, id: genId("faq"), hits: 0 }, ...s.faqs],
        })),

      updateFaq: (id, patch) =>
        set((s) => ({
          faqs: s.faqs.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        })),

      toggleFaq: (id) =>
        set((s) => ({
          faqs: s.faqs.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)),
        })),

      deleteFaq: (id) => set((s) => ({ faqs: s.faqs.filter((f) => f.id !== id) })),

      addStep: (stage, step) =>
        set((s) => ({
          scenarios: s.scenarios.map((sc) =>
            sc.stage === stage
              ? { ...sc, steps: [...sc.steps, { ...step, id: genId("st") }] }
              : sc,
          ),
        })),

      updateStep: (stage, stepId, patch) =>
        set((s) => ({
          scenarios: s.scenarios.map((sc) =>
            sc.stage === stage
              ? { ...sc, steps: sc.steps.map((x) => (x.id === stepId ? { ...x, ...patch } : x)) }
              : sc,
          ),
        })),

      deleteStep: (stage, stepId) =>
        set((s) => ({
          scenarios: s.scenarios.map((sc) =>
            sc.stage === stage
              ? { ...sc, steps: sc.steps.filter((x) => x.id !== stepId) }
              : sc,
          ),
        })),

      pushActivity: (a) =>
        set((s) => ({
          activities: [
            { ...a, id: genId("ac"), at: a.at ?? new Date().toISOString() },
            ...s.activities,
          ].slice(0, 60),
        })),

      setSetting: (k, v) => set((s) => ({ settings: { ...s.settings, [k]: v } })),

      reset: () => set({ ...buildSeed(), settings: DEFAULT_SETTINGS }),
    }),
    {
      name: "line-support-store",
      version: 1,
      partialize: (s) => ({
        members: s.members,
        scenarios: s.scenarios,
        faqs: s.faqs,
        activities: s.activities,
        staff: s.staff,
        settings: s.settings,
      }),
    },
  ),
);
