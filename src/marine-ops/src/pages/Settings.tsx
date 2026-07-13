import { useState } from "react";
import { toast } from "sonner";
import { RotateCcw, Radio, AlertTriangle, CalendarClock, Info } from "lucide-react";
import { useStore } from "../store/useStore";
import { Card, Button, Modal } from "../components/ui";
import PageHeader from "../components/PageHeader";

export default function Settings() {
  const settings = useStore((s) => s.settings);
  const setSetting = useStore((s) => s.setSetting);
  const reset = useStore((s) => s.reset);
  const [confirm, setConfirm] = useState(false);

  const doReset = () => {
    reset();
    setConfirm(false);
    toast.success("デモデータを初期状態に戻しました");
  };

  return (
    <>
      <PageHeader title="設定" subtitle="監視ルールと通知の設定、デモデータの初期化を行います。" />

      <div className="space-y-4">
        <Card className="p-5">
          <h2 className="mb-1 text-sm font-bold text-ink-800">遠隔モニタリング</h2>
          <p className="mb-4 text-xs text-ink-400">案件の進捗を自動で監視し、異常を検出したら通知します。</p>
          <div className="divide-y divide-ink-100">
            <Toggle
              icon={<Radio size={17} className="text-emerald-500" />}
              title="ライブ監視"
              desc="一定間隔で全案件を巡回し、停滞や期日リスクを検出してアラートを生成します。"
              on={settings.liveMonitoring}
              onChange={(v) => setSetting("liveMonitoring", v)}
            />
            <Toggle
              icon={<AlertTriangle size={17} className="text-rose-500" />}
              title="不備の即時通知"
              desc="担当者が不備を報告した際、管理者へアラートを通知します。"
              on={settings.notifyOnDefect}
              onChange={(v) => setSetting("notifyOnDefect", v)}
            />
            <Toggle
              icon={<CalendarClock size={17} className="text-amber-500" />}
              title="期日接近の通知"
              desc="確認事項の期日が24時間以内に迫った案件を通知対象にします。"
              on={settings.notifyOnDue}
              onChange={(v) => setSetting("notifyOnDue", v)}
            />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-2.5 rounded-xl bg-brand-50 px-3.5 py-3 text-xs text-brand-700">
            <Info size={16} className="mt-0.5 shrink-0" />
            <span>
              これは提案用のデモ環境です。入力したデータはお使いのブラウザ内(localStorage)にのみ保存され、
              リロードしても保持されます。動作確認で状態が乱れた場合は、下の「初期化」で元に戻せます。
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-1 text-sm font-bold text-ink-800">デモデータの初期化</h2>
          <p className="mb-4 text-xs text-ink-400">
            案件・確認事項・アラートをすべて初期状態に戻します。この操作は取り消せません。
          </p>
          <Button variant="outline" onClick={() => setConfirm(true)} className="!text-rose-600 hover:!bg-rose-50">
            <RotateCcw size={15} /> 初期状態に戻す
          </Button>
        </Card>
      </div>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="デモデータを初期化しますか?" width={420}>
        <p className="text-sm text-ink-600">
          現在の案件・確認事項・アラートの状態がすべて破棄され、初期のサンプルデータに戻ります。
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirm(false)}>
            キャンセル
          </Button>
          <Button variant="danger" onClick={doReset}>
            初期化する
          </Button>
        </div>
      </Modal>
    </>
  );
}

function Toggle({
  icon,
  title,
  desc,
  on,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 py-3.5">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-ink-800">{title}</div>
        <div className="text-xs text-ink-400">{desc}</div>
      </div>
      <button
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={
          "relative h-6 w-11 shrink-0 rounded-full transition " + (on ? "bg-brand-600" : "bg-ink-300")
        }
      >
        <span
          className={
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left] " + (on ? "left-[22px]" : "left-0.5")
          }
        />
      </button>
    </div>
  );
}
