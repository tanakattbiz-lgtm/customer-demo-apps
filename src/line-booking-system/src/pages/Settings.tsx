import { useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  RefreshCw,
  Send,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import type { CalendarProvider, NotifStatus } from "../data/seed";
import { useStore } from "../store";
import { fakeApi } from "../lib/fakeApi";
import { AdminShell } from "../components/AdminShell";
import { Button, Card, Pill, StatusDot, Toggle, tnum } from "../components/ui";

const PROVIDERS: { id: CalendarProvider; name: string; desc: string; icon: React.ReactNode }[] = [
  { id: "google", name: "Googleカレンダー", desc: "予約をGoogleカレンダーへ自動登録", icon: <Calendar size={18} /> },
  { id: "zoom", name: "ZOOM連携", desc: "オンライン相談のミーティングURLを自動発行", icon: <Video size={18} /> },
  { id: "timerex", name: "TimeRex", desc: "既存のTimeRexと同期(30分刻み対応)", icon: <Clock size={18} /> },
];

const TYPE_LABEL: Record<string, string> = {
  予約確定: "予約確定のお知らせ",
  リマインド: "前日/1時間前リマインド",
  新規友だち: "新規友だち登録",
  テスト送信: "テスト通知",
  キャンセル: "キャンセル通知",
};

export default function Settings() {
  const settings = useStore((s) => s.settings);
  const setSetting = useStore((s) => s.setSetting);
  const logs = useStore((s) => s.logs);
  const pushLog = useStore((s) => s.pushLog);
  const reset = useStore((s) => s.reset);

  const [testing, setTesting] = useState(false);

  const total = logs.length;
  const ok = logs.filter((l) => l.status === "成功").length;
  const rate = total ? Math.round((ok / total) * 100) : 100;
  const failed = total - ok;

  const sendTest = async () => {
    if (!settings.linePush) {
      toast.error("LINEプッシュ通知がオフです。オンにしてからお試しください");
      return;
    }
    setTesting(true);
    await fakeApi(null, 900);
    pushLog("テスト送信", "店長(管理者)", "成功", "テスト通知が正常に届きました");
    setTesting(false);
    toast.success("テスト通知を送信しました。スマホのLINEをご確認ください");
  };

  const doReset = () => {
    reset();
    toast.success("デモデータを初期状態に戻しました");
  };

  return (
    <AdminShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">通知・連携設定</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            プッシュ通知とカレンダー連携の設定です。「通知が届かない」状態を解消し、常に配信状況を確認できます。
          </p>
        </div>

        {/* 配信状況サマリ(困りごとの解消を可視化) */}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-4 p-5">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={26} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-500">現在のプッシュ通知 配信状況</div>
              <div className="flex items-baseline gap-2">
                <span className={"text-3xl font-bold text-slate-900 " + tnum}>{rate}%</span>
                <span className="text-sm text-slate-400">
                  成功 {ok} / {total} 件
                </span>
              </div>
            </div>
            {failed > 0 ? (
              <Pill tone="amber">
                <AlertTriangle size={12} /> 過去のエラー {failed}件(修正済み)
              </Pill>
            ) : (
              <Pill tone="green">
                <CheckCircle2 size={12} /> 正常稼働
              </Pill>
            )}
          </div>
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs leading-relaxed text-slate-500">
            外部連携ツール導入後に発生していた「新規登録・コメント時にプッシュ通知が届かない」不具合は、Webhookと
            アクセストークンの再設定により解消済みです。以降の配信はこの画面で常時モニタリングできます。
          </div>
        </Card>

        {/* 通知チャネル */}
        <Card>
          <SectionHead icon={<Bell size={16} />} title="通知チャネル" />
          <div className="divide-y divide-slate-50">
            <SettingRow
              icon={<Bell size={18} className="text-emerald-600" />}
              title="LINEプッシュ通知"
              desc="予約確定・リマインドをお客様のLINEへ配信します"
            >
              <Toggle checked={settings.linePush} onChange={(v) => setSetting("linePush", v)} />
            </SettingRow>
            <SettingRow
              icon={<Mail size={18} className="text-sky-600" />}
              title="メール通知(管理者控え)"
              desc="予約が入るたびに管理者へメールでも控えを送ります"
            >
              <Toggle checked={settings.emailNotify} onChange={(v) => setSetting("emailNotify", v)} />
            </SettingRow>
            <SettingRow
              icon={<Clock size={18} className="text-amber-600" />}
              title="前日リマインド"
              desc="予約前日の朝に自動でお知らせします"
            >
              <Toggle checked={settings.remindDayBefore} onChange={(v) => setSetting("remindDayBefore", v)} />
            </SettingRow>
            <SettingRow
              icon={<Clock size={18} className="text-amber-600" />}
              title="1時間前リマインド"
              desc="開始1時間前に再度お知らせします"
            >
              <Toggle checked={settings.remindHourBefore} onChange={(v) => setSetting("remindHourBefore", v)} />
            </SettingRow>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
            <div className="text-xs text-slate-500">設定した内容でテスト通知を送信できます</div>
            <Button variant="primary" loading={testing} onClick={sendTest}>
              <Send size={16} /> テスト通知を送信
            </Button>
          </div>
        </Card>

        {/* カレンダー連携 */}
        <Card>
          <SectionHead icon={<Calendar size={16} />} title="カレンダー連携" />
          <div className="p-4">
            <p className="mb-3 px-1 text-xs text-slate-500">予約を自動登録する連携先を選べます(いずれか1つ)。</p>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {PROVIDERS.map((p) => {
                const active = settings.calendarProvider === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSetting("calendarProvider", p.id);
                      toast.success(`${p.name} と連携しました`);
                    }}
                    className={
                      "flex flex-col gap-2 rounded-2xl border-2 p-4 text-left transition " +
                      (active ? "border-emerald-500 bg-emerald-50/60" : "border-slate-200 bg-white hover:border-slate-300")
                    }
                  >
                    <span
                      className={
                        "grid h-9 w-9 place-items-center rounded-xl " +
                        (active ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500")
                      }
                    >
                      {p.icon}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{p.name}</span>
                    <span className="text-xs text-slate-500">{p.desc}</span>
                    <span className="mt-1">
                      {active ? (
                        <Pill tone="green">
                          <StatusDot tone="green" /> 連携中
                        </Pill>
                      ) : (
                        <span className="text-xs text-slate-400">未連携</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* 配信ログ */}
        <Card>
          <SectionHead icon={<Send size={16} />} title="配信ログ" sub={`直近 ${Math.min(logs.length, 12)} 件`} />
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="px-5 py-2.5 font-medium">日時</th>
                  <th className="px-3 py-2.5 font-medium">種類</th>
                  <th className="px-3 py-2.5 font-medium">宛先</th>
                  <th className="px-3 py-2.5 font-medium">結果</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 12).map((l) => (
                  <tr key={l.id} className="border-b border-slate-50">
                    <td className={"px-5 py-2.5 whitespace-nowrap text-slate-500 " + tnum}>
                      {format(new Date(l.at), "M/d HH:mm", { locale: ja })}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-slate-700">{TYPE_LABEL[l.type] ?? l.type}</span>
                      <div className="text-[11px] text-slate-400">{l.channel}</div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">{l.to}</td>
                    <td className="px-3 py-2.5">
                      <ResultBadge status={l.status} detail={l.detail} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* リセット */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="text-sm text-slate-500">デモで作成した予約や設定を初期状態に戻します。</div>
          <Button variant="outline" onClick={doReset}>
            <RefreshCw size={16} /> デモデータをリセット
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}

function SectionHead({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
      <span className="text-emerald-600">{icon}</span>
      <h2 className="text-sm font-bold text-slate-800">{title}</h2>
      {sub && <span className="ml-auto text-xs text-slate-400">{sub}</span>}
    </div>
  );
}

function SettingRow({
  icon,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3.5 px-5 py-3.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-50">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-800">{title}</div>
        <div className="text-xs text-slate-400">{desc}</div>
      </div>
      {children}
    </div>
  );
}

function ResultBadge({ status, detail }: { status: NotifStatus; detail?: string }) {
  if (status === "成功") return <Pill tone="green">成功</Pill>;
  return (
    <span className="inline-flex items-center gap-1.5" title={detail}>
      <Pill tone="amber">要確認</Pill>
      {detail && <span className="hidden text-[11px] text-slate-400 lg:inline">{detail}</span>}
    </span>
  );
}
