import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  RotateCcw,
  LogOut,
  Users,
  Building2,
  Info,
  Shield,
} from "lucide-react";
import { useStore, staffById } from "../store/useStore";
import { fakeApi } from "../lib/fakeApi";
import { PageHeader } from "../components/PageHeader";
import { Card, Button, Modal, Avatar, Pill } from "../components/ui";

export default function Settings() {
  const nav = useNavigate();
  const staff = useStore((s) => s.staff);
  const me = staffById(staff, useStore((s) => s.currentUserId));
  const reset = useStore((s) => s.reset);
  const logout = useStore((s) => s.logout);
  const clients = useStore((s) => s.clients);
  const matters = useStore((s) => s.matters);

  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function doReset() {
    setResetting(true);
    await fakeApi(true, 700);
    reset();
    setResetting(false);
    setConfirmReset(false);
    toast.success("デモデータを初期状態に戻しました");
    nav("/");
  }

  return (
    <div>
      <PageHeader title="設定" subtitle="プロフィール・チーム・デモデータの管理" />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* プロフィール */}
        <Card className="p-6">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-ink-900">
            <Shield size={17} className="text-brand-600" />
            プロフィール
          </h2>
          {me && (
            <div className="flex items-center gap-4">
              <Avatar name={me.name} color={me.color} size={56} />
              <div>
                <div className="text-lg font-bold text-ink-900">{me.name}</div>
                <div className="text-sm text-ink-500">{me.title}</div>
                <div className="mt-1 text-xs text-ink-400">
                  t-tanaka@minato-law.example.jp
                </div>
              </div>
            </div>
          )}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-ink-50 p-4">
              <div className="text-2xl font-bold text-ink-900 tnum">{matters.length}</div>
              <div className="text-xs text-ink-500">担当・関与案件</div>
            </div>
            <div className="rounded-xl bg-ink-50 p-4">
              <div className="text-2xl font-bold text-ink-900 tnum">{clients.length}</div>
              <div className="text-xs text-ink-500">顧問先・会員</div>
            </div>
          </div>
        </Card>

        {/* 事務所情報 */}
        <Card className="p-6">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-ink-900">
            <Building2 size={17} className="text-brand-600" />
            事務所情報
          </h2>
          <dl className="space-y-3 text-sm">
            {[
              ["事務所名", "みなと総合法律事務所"],
              ["所在地", "東京都港区海岸2-4-8 みなとビル9F"],
              ["利用プラン", "スタンダード(50名まで)"],
              ["対応プラットフォーム", "Web / Windows デスクトップ"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4 border-b border-ink-50 pb-3 last:border-0">
                <dt className="shrink-0 text-ink-500">{k}</dt>
                <dd className="text-right font-medium text-ink-800">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        {/* チーム */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-ink-900">
            <Users size={17} className="text-brand-600" />
            チームメンバー
            <span className="text-sm font-normal text-ink-400">({staff.length}名)</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
                <Avatar name={s.name} color={s.color} size={40} />
                <div className="min-w-0">
                  <div className="truncate font-medium text-ink-900">{s.name}</div>
                  <div className="truncate text-xs text-ink-500">{s.title}</div>
                </div>
                <Pill tone={s.role === "弁護士" ? "blue" : "gray"}>{s.role}</Pill>
              </div>
            ))}
          </div>
        </Card>

        {/* デモ操作 */}
        <Card className="border-amber-200 bg-amber-50/40 p-6 lg:col-span-2">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-600">
              <Info size={18} />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-ink-900">デモデータの管理</h2>
              <p className="mt-1 text-sm text-ink-600">
                このデモで追加・編集・削除したデータはブラウザに保存されます。
                動作確認で変更した内容を初期状態に戻したい場合は、下のボタンからリセットしてください。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setConfirmReset(true)}>
                  <RotateCcw size={15} />
                  デモデータを初期化
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    logout();
                    nav("/login");
                  }}
                >
                  <LogOut size={15} />
                  ログアウト
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="デモデータを初期化しますか?"
        width={420}
      >
        <p className="text-sm text-ink-600">
          追加・編集・削除したすべての内容が破棄され、初期のサンプルデータに戻ります。
          この操作は取り消せません。
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmReset(false)}>
            キャンセル
          </Button>
          <Button variant="danger" onClick={doReset} loading={resetting}>
            <RotateCcw size={15} />
            初期化する
          </Button>
        </div>
      </Modal>
    </div>
  );
}
