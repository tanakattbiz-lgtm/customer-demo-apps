import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BellRing, Check, Play, ChevronDown, Inbox } from "lucide-react";
import { useStore } from "../store";
import { useLoad } from "../lib/useLoad";
import { SEVERITY_TONE, ALERT_STATUS_TONE } from "../lib/domain";
import type { AlertStatus, Severity } from "../data/seed";
import { fmtDateTime, ago } from "../lib/format";
import { Avatar, Button, Card, EmptyState, Pill, Skeleton, StatusDot } from "../components/ui";

const STATUS_TABS: (AlertStatus | "すべて")[] = ["すべて", "未対応", "対応中", "対応済"];
const SEV: (Severity | "全")[] = ["全", "高", "中", "低"];

export default function Alerts() {
  const alerts = useStore((s) => s.alerts);
  const users = useStore((s) => s.users);
  const setAlertStatus = useStore((s) => s.setAlertStatus);
  const loading = useLoad();

  const [tab, setTab] = useState<AlertStatus | "すべて">("すべて");
  const [sev, setSev] = useState<Severity | "全">("全");

  const colorOf = (userId: string) => users.find((u) => u.id === userId)?.color ?? "#0d9488";

  const rows = useMemo(
    () =>
      alerts.filter((a) => {
        if (tab !== "すべて" && a.status !== tab) return false;
        if (sev !== "全" && a.severity !== sev) return false;
        return true;
      }),
    [alerts, tab, sev],
  );

  const counts = useMemo(() => {
    const c = { 未対応: 0, 対応中: 0, 対応済: 0 } as Record<AlertStatus, number>;
    alerts.forEach((a) => (c[a.status] += 1));
    return c;
  }, [alerts]);

  const advance = (id: string, next: AlertStatus) => {
    setAlertStatus(id, next);
    toast.success(next === "対応中" ? "対応を開始しました" : "対応済にしました");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">アラート履歴</h1>
        <p className="mt-1 text-sm text-slate-500">
          検知イベントの通知履歴です。対応状況を更新すると、利用者の状態にも反映されます。
        </p>
      </div>

      {/* サマリ */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryTile tone="red" label="未対応" value={counts.未対応} />
        <SummaryTile tone="amber" label="対応中" value={counts.対応中} />
        <SummaryTile tone="green" label="対応済" value={counts.対応済} />
      </div>

      {/* フィルタ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "rounded-lg px-3 py-1.5 text-sm font-medium transition " +
                (tab === t ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50")
              }
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-slate-400">重要度</span>
          {SEV.map((s) => (
            <button
              key={s}
              onClick={() => setSev(s)}
              className={
                "rounded-lg px-2.5 py-1.5 font-medium transition " +
                (sev === s ? "bg-teal-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50")
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Inbox size={26} />}
            title="該当するアラートはありません"
            description="フィルタ条件を変更するか、検証シミュレータでイベントを発報してください。"
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {rows.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <Avatar name={a.userName} color={colorOf(a.userId)} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={SEVERITY_TONE[a.severity]}>重要度 {a.severity}</Pill>
                      <span className="text-sm font-bold text-slate-800">{a.kind}</span>
                      <span className="text-xs text-slate-400">{a.userName} 様</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{a.message}</p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{fmtDateTime(a.at)}</span>
                      <span>・</span>
                      <span>{ago(a.at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    <StatusDot tone={ALERT_STATUS_TONE[a.status]} pulse={a.status === "未対応"} />
                    {a.status}
                  </span>
                  <div className="flex gap-2">
                    {a.status === "未対応" && (
                      <Button variant="outline" className="!px-3 !py-1.5" onClick={() => advance(a.id, "対応中")}>
                        <Play size={14} /> 対応開始
                      </Button>
                    )}
                    {a.status === "対応中" && (
                      <Button className="!px-3 !py-1.5" onClick={() => advance(a.id, "対応済")}>
                        <Check size={14} /> 対応済にする
                      </Button>
                    )}
                    {a.status === "対応済" && (
                      <button
                        onClick={() => { setAlertStatus(a.id, "対応中"); toast("対応中に戻しました"); }}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      >
                        <ChevronDown size={13} /> 差し戻す
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryTile({ tone, label, value }: { tone: "red" | "amber" | "green"; label: string; value: number }) {
  const ring: Record<string, string> = {
    red: "text-rose-600",
    amber: "text-amber-600",
    green: "text-emerald-600",
  };
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className={"grid h-9 w-9 place-items-center rounded-lg bg-slate-50 " + ring[tone]}>
        <BellRing size={17} />
      </span>
      <div>
        <div className="tabular-nums text-xl font-bold text-slate-900">{value}</div>
        <div className="text-xs text-slate-400">{label}</div>
      </div>
    </Card>
  );
}
