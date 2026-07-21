import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildSeed,
  generateResult,
  DEMO_USER,
  type AppData,
  type LogEntry,
  type LogLevel,
} from "./data/seed";

interface Settings {
  autoRun: boolean; // 自動処理(確定検知→取得→掲載)の稼働
  autoPublish: boolean; // 結果取得後の自動公開
  morningSchedule: boolean; // 朝一のスケジュール自動取得
}

interface State extends AppData {
  authed: boolean;
  settings: Settings;

  login: () => void;
  logout: () => void;

  publishCard: (raceId: string) => void;
  confirmRace: (raceId: string) => void; // 発走前 → 確定(結果生成)
  publishResult: (raceId: string) => void; // 確定 → 掲載済

  pushLog: (level: LogLevel, job: string, message: string, raceId?: string) => void;
  clearLogs: () => void;
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  reset: () => void;
}

let seq = 0;
const genId = () => `log_${(seq++).toString(36)}_${(seq * 37) % 9973}`;

const label = (track: string, no: number) => `${track} ${no}R`;

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...buildSeed(),
      authed: false,
      settings: { autoRun: true, autoPublish: true, morningSchedule: true },

      login: () => set({ authed: true }),
      logout: () => set({ authed: false }),

      pushLog: (level, job, message, raceId) =>
        set((s) => {
          const race = raceId ? s.races.find((r) => r.id === raceId) : undefined;
          const entry: LogEntry = {
            id: genId(),
            at: new Date().toISOString(),
            level,
            job,
            raceId,
            raceLabel: race ? label(race.track, race.no) : undefined,
            message,
          };
          return { logs: [entry, ...s.logs] };
        }),

      publishCard: (raceId) => {
        const race = get().races.find((r) => r.id === raceId);
        if (!race) return;
        set((s) => ({
          races: s.races.map((r) =>
            r.id === raceId ? { ...r, cardStatus: "公開済", cardPublishedAt: new Date().toISOString() } : r,
          ),
        }));
        get().pushLog("success", "ページ生成", "出走表テーブルを生成し、レースページを自動公開しました。", raceId);
      },

      confirmRace: (raceId) => {
        const race = get().races.find((r) => r.id === raceId);
        if (!race || race.resultStatus !== "発走前") return;
        const built = generateResult(race);
        set((s) => ({
          races: s.races.map((r) =>
            r.id === raceId
              ? { ...r, resultStatus: "確定", result: built.rows, payouts: built.payouts, winTime: built.winTime }
              : r,
          ),
        }));
        get().pushLog("info", "結果取得", "レース確定を検知。確定データ(着順・オッズ・払戻・タイム)を取得しました。", raceId);
      },

      publishResult: (raceId) => {
        const race = get().races.find((r) => r.id === raceId);
        if (!race) return;
        // 確定していなければ先に結果を生成
        const built = race.result ? null : generateResult(race);
        set((s) => ({
          races: s.races.map((r) =>
            r.id === raceId
              ? {
                  ...r,
                  resultStatus: "掲載済",
                  resultPublishedAt: new Date().toISOString(),
                  result: r.result ?? built!.rows,
                  payouts: r.payouts ?? built!.payouts,
                  winTime: r.winTime ?? built!.winTime,
                }
              : r,
          ),
        }));
        get().pushLog("success", "結果掲載", "結果テーブル(枠番カラー付き)を生成し、ページを自動更新・公開しました。", raceId);
      },

      clearLogs: () => set({ logs: [] }),
      setSetting: (k, v) => set((s) => ({ settings: { ...s.settings, [k]: v } })),

      reset: () =>
        set({
          ...buildSeed(),
          settings: { autoRun: true, autoPublish: true, morningSchedule: true },
        }),
    }),
    {
      name: "race-data-dashboard-store",
      version: 1,
      partialize: (s) => ({
        races: s.races,
        logs: s.logs,
        meetings: s.meetings,
        settings: s.settings,
        authed: s.authed,
      }),
    },
  ),
);

export { DEMO_USER };
