import { useState } from "react";
import { toast } from "sonner";
import { RotateCcw, Send, FileEdit, ShieldAlert, FolderSearch, Info } from "lucide-react";
import { useStore } from "../store";
import type { SendMode } from "../data/seed";
import { fakeApi } from "../lib/fakeApi";
import { Card, Button, Toggle, Modal } from "../components/ui";

export default function Settings() {
  const settings = useStore((s) => s.settings);
  const setSetting = useStore((s) => s.setSetting);
  const reset = useStore((s) => s.reset);
  const folder = useStore((s) => s.drawingFolder);

  const [confirm, setConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fileCount = Object.values(folder).reduce((n, arr) => n + arr.length, 0);

  const onReset = async () => {
    setResetting(true);
    await fakeApi(true, 500);
    reset();
    setResetting(false);
    setConfirm(false);
    toast.success("初期データに戻しました");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink-900">設定</h1>
        <p className="mt-1 text-sm text-ink-500">送信の既定動作や図面フォルダの状態を確認できます。</p>
      </div>

      {/* 送信設定 */}
      <Card className="divide-y divide-ink-100">
        <SectionHead title="送信の既定動作" />
        <Row title="既定の送信モード" desc="「見積依頼を送信」時に最初に選ばれるモードです。">
          <div className="inline-flex rounded-xl border border-ink-200 bg-ink-50 p-0.5">
            {(["送信", "下書き"] as SendMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setSetting("defaultMode", m)}
                className={
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition " +
                  (settings.defaultMode === m ? "bg-white text-brand-700 shadow-sm" : "text-ink-500 hover:text-ink-700")
                }
              >
                {m === "送信" ? <Send size={13} /> : <FileEdit size={13} />}
                {m === "送信" ? "Outlookで送信" : "下書き保存"}
              </button>
            ))}
          </div>
        </Row>
        <Row title="図面未検出時は送信を止める" desc="図面が1件も見つからない依頼先がある場合、送信ボタンを無効にします。">
          <Toggle checked={settings.blockOnMissing} onChange={(v) => setSetting("blockOnMissing", v)} />
        </Row>
        <Row title="送信控えを自分宛にも残す" desc="送信メールの控えを自分宛にも保存します(Bcc相当)。">
          <Toggle checked={settings.keepCopy} onChange={(v) => setSetting("keepCopy", v)} />
        </Row>
      </Card>

      {/* 図面フォルダ */}
      <Card className="divide-y divide-ink-100">
        <SectionHead title="図面フォルダ連携" />
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <FolderSearch size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-ink-800">
              <span className="tnum">\\file-server\図面\2026</span>
            </div>
            <div className="text-xs text-ink-500">
              図番をキーに PDF / DXF を自動検索します・
              <span className="tnum">{Object.keys(folder).length}</span> 図番 /{" "}
              <span className="tnum">{fileCount}</span> ファイル
            </div>
          </div>
          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">接続中</span>
        </div>
      </Card>

      {/* デモ運用 */}
      <Card className="divide-y divide-ink-100">
        <SectionHead title="デモ運用" />
        <Row
          title="データを初期状態に戻す"
          desc="追加・編集・送信した内容をすべて破棄し、サンプルデータを復元します。"
        >
          <Button variant="outline" onClick={() => setConfirm(true)}>
            <RotateCcw size={15} /> リセット
          </Button>
        </Row>
        <div className="flex items-start gap-2.5 px-5 py-4 text-xs text-ink-500">
          <Info size={15} className="mt-0.5 shrink-0 text-ink-400" />
          <p>
            本画面は提案用のデモです。メールアドレス・電話番号などの連絡先や実データは含まれません。入力内容はこのブラウザ内(localStorage)にのみ保存されます。
          </p>
        </div>
      </Card>

      {/* リセット確認 */}
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="初期データに戻しますか?"
        width={420}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirm(false)}>
              キャンセル
            </Button>
            <Button variant="danger" onClick={onReset} loading={resetting}>
              リセットする
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-500">
            <ShieldAlert size={20} />
          </div>
          <p className="text-sm text-ink-600">
            追加した部品・依頼先の設定・送信履歴がすべて破棄され、サンプルデータに戻ります。
          </p>
        </div>
      </Modal>
    </div>
  );
}

function SectionHead({ title }: { title: string }) {
  return (
    <div className="px-5 py-3.5">
      <h2 className="text-sm font-bold text-ink-800">{title}</h2>
    </div>
  );
}

function Row({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <div className="text-sm font-medium text-ink-800">{title}</div>
        <div className="mt-0.5 text-xs text-ink-500">{desc}</div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
