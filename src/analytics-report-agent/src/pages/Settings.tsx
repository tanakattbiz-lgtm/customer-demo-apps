import { useState } from "react";
import { toast } from "sonner";
import {
  Database,
  MessageSquare,
  CalendarClock,
  Target,
  RotateCcw,
  CheckCircle2,
  Send,
} from "lucide-react";
import { useStore } from "../store";
import { WEEKDAYS } from "../data/seed";
import { fakeApi } from "../lib/fakeApi";
import { Card, Button, Field, inputCls, Toggle, Pill } from "../components/ui";
import { num } from "../lib/format";

export default function Settings() {
  const settings = useStore((s) => s.settings);
  const kpis = useStore((s) => s.kpis);
  const setSetting = useStore((s) => s.setSetting);
  const updateKpiTarget = useStore((s) => s.updateKpiTarget);
  const reset = useStore((s) => s.reset);

  const [testing, setTesting] = useState(false);

  const sendTest = async () => {
    setTesting(true);
    await fakeApi(true, 850);
    setTesting(false);
    toast.success("テスト通知を送信しました", {
      description: `${settings.spaceName} に接続確認メッセージを送りました。`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">設定</h1>
        <p className="mt-0.5 text-sm text-ink-500">
          データ連携・通知先・スケジュール・KPI 目標を管理します
        </p>
      </div>

      {/* GA4 連携 */}
      <Card className="p-5">
        <SectionHead
          icon={<Database size={16} />}
          title="GA4 データ連携"
          desc="Google Analytics Data API から日次で自動取得します"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="プロパティ名">
            <input className={inputCls} value={settings.propertyName} readOnly />
          </Field>
          <Field label="プロパティ ID">
            <input className={inputCls + " tnum"} value={settings.propertyId} readOnly />
          </Field>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <CheckCircle2 size={16} />
          連携済み・最終取得 今日 07:00
        </div>
      </Card>

      {/* Google Chat 通知先 */}
      <Card className="p-5">
        <SectionHead
          icon={<MessageSquare size={16} />}
          title="Google Chat 通知先"
          desc="整形済みレポートを指定スペースへ Webhook で送信します"
        />
        <div className="space-y-4">
          <Field label="スペース名">
            <input
              className={inputCls}
              value={settings.spaceName}
              onChange={(e) => setSetting("spaceName", e.target.value)}
            />
          </Field>
          <Field label="Incoming Webhook URL" hint="実際の連携時に発行された URL を設定します(表示はマスクされます)">
            <input className={inputCls + " tnum"} value={settings.webhookMasked} readOnly />
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <Pill tone={settings.webhookConnected ? "green" : "red"}>
              {settings.webhookConnected ? "接続済み" : "未接続"}
            </Pill>
            <Button variant="outline" onClick={sendTest} loading={testing}>
              {!testing && <Send size={15} />}
              テスト通知を送信
            </Button>
          </div>
        </div>
      </Card>

      {/* 通知スケジュール */}
      <Card className="p-5">
        <SectionHead
          icon={<CalendarClock size={16} />}
          title="自動通知スケジュール"
          desc="設定した頻度・時刻に Google Chat へ自動送信します"
        />
        <div className="space-y-4">
          <label className="flex items-center justify-between rounded-xl border border-ink-100 px-4 py-3">
            <div>
              <div className="text-sm font-medium text-ink-700">自動通知を有効にする</div>
              <div className="text-xs text-ink-400">オフにすると手動送信のみになります</div>
            </div>
            <Toggle
              checked={settings.autoSend}
              onChange={(v) => {
                setSetting("autoSend", v);
                toast(v ? "自動通知を有効にしました" : "自動通知を停止しました");
              }}
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="頻度">
              <div className="inline-flex w-full rounded-xl border border-ink-200 p-0.5 text-sm font-medium">
                {(["weekly", "monthly"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setSetting("freq", f)}
                    className={
                      "flex-1 rounded-lg px-3 py-2 transition " +
                      (settings.freq === f
                        ? "bg-brand-600 text-white shadow-sm"
                        : "text-ink-500 hover:text-ink-800")
                    }
                  >
                    {f === "weekly" ? "週次" : "月次"}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={settings.freq === "weekly" ? "曜日" : "送信日"}>
              {settings.freq === "weekly" ? (
                <select
                  className={inputCls}
                  value={settings.weekday}
                  onChange={(e) => setSetting("weekday", Number(e.target.value))}
                >
                  {WEEKDAYS.map((w, i) => (
                    <option key={i} value={i}>
                      {w}曜日
                    </option>
                  ))}
                </select>
              ) : (
                <input className={inputCls} value="毎月 1 日" readOnly />
              )}
            </Field>

            <Field label="送信時刻">
              <select
                className={inputCls}
                value={settings.hour}
                onChange={(e) => setSetting("hour", Number(e.target.value))}
              >
                {Array.from({ length: 24 }).map((_, h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <label className="flex items-center justify-between rounded-xl border border-ink-100 px-4 py-3">
            <div>
              <div className="text-sm font-medium text-ink-700">改善提案を本文に含める</div>
              <div className="text-xs text-ink-400">AI が生成した優先度上位の提案を掲載します</div>
            </div>
            <Toggle
              checked={settings.includeProposals}
              onChange={(v) => setSetting("includeProposals", v)}
            />
          </label>
        </div>
      </Card>

      {/* KPI 目標 */}
      <Card className="p-5">
        <SectionHead
          icon={<Target size={16} />}
          title="KPI 目標(月次)"
          desc="ダッシュボードとレポートの達成率評価に反映されます"
        />
        <div className="space-y-3">
          {kpis.map((k) => (
            <div key={k.id} className="flex items-center gap-3">
              <span className="min-w-0 flex-1 text-sm font-medium text-ink-700">{k.label}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className={inputCls + " tnum w-32 text-right"}
                  value={k.target}
                  step={k.metric === "cvr" || k.metric === "organicRatio" ? 0.1 : 100}
                  onChange={(e) => updateKpiTarget(k.id, Number(e.target.value))}
                />
                <span className="w-6 text-sm text-ink-400">{k.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* リセット */}
      <Card className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-bold text-ink-900">デモデータをリセット</div>
          <div className="text-xs text-ink-500">
            設定・KPI 目標・通知履歴・採用した提案を初期状態に戻します
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            reset();
            toast.success("初期データに戻しました");
          }}
        >
          <RotateCcw size={15} />
          リセット
        </Button>
      </Card>

      <p className="pb-4 text-center text-xs text-ink-400">
        現在の集計対象:直近 90 日 / 総ユーザー数 {num(useStore.getState().metrics.reduce((a, m) => a + m.users, 0))} 人(デモ用サンプルデータ)
      </p>
    </div>
  );
}

function SectionHead({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </span>
      <div>
        <h2 className="text-sm font-bold text-ink-900">{title}</h2>
        <p className="text-xs text-ink-400">{desc}</p>
      </div>
    </div>
  );
}
