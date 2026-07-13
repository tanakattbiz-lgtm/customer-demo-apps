import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { BellRing, Check, ChevronRight, Eye } from "lucide-react";
import { useStore } from "../store/useStore";
import { Card, Pill, Skeleton, StatusDot, EmptyState, Button } from "../components/ui";
import PageHeader from "../components/PageHeader";
import { useLoad } from "../lib/useLoad";
import { fromNow, md_hm } from "../lib/format";
import { staffById, type AlertStatus } from "../data/seed";

const SEV_TONE: Record<string, string> = { 高: "red", 中: "amber", 低: "gray" };
const STATUS_TABS: (AlertStatus | "すべて")[] = ["すべて", "未確認", "確認済", "対応済"];

export default function Alerts() {
  const loading = useLoad();
  const alerts = useStore((s) => s.alerts);
  const staff = useStore((s) => s.staff);
  const setAlertStatus = useStore((s) => s.setAlertStatus);
  const [tab, setTab] = useState<(typeof STATUS_TABS)[number]>("すべて");

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const a of alerts) c[a.status] = (c[a.status] ?? 0) + 1;
    return c;
  }, [alerts]);

  const list = useMemo(
    () => (tab === "すべて" ? alerts : alerts.filter((a) => a.status === tab)),
    [alerts, tab],
  );

  const ack = (id: string) => {
    setAlertStatus(id, "確認済");
    toast.message("アラートを確認済みにしました");
  };
  const resolve = (id: string) => {
    setAlertStatus(id, "対応済");
    toast.success("アラートを対応済みにしました");
  };
  const ackAll = () => {
    let n = 0;
    for (const a of alerts) if (a.status === "未確認") { setAlertStatus(a.id, "確認済"); n++; }
    if (n) toast.success(`${n} 件を確認済みにしました`);
  };

  return (
    <>
      <PageHeader
        title="アラート"
        subtitle="期日超過・不備・停滞を検出すると、ここに管理者宛の通知が届きます。"
        actions={
          <Button variant="outline" onClick={ackAll} disabled={(counts["未確認"] ?? 0) === 0}>
            <Eye size={15} /> すべて確認済みに
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {STATUS_TABS.map((t) => {
          const n = t === "すべて" ? alerts.length : counts[t] ?? 0;
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition " +
                (active ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-600 hover:bg-ink-200")
              }
            >
              {t} <span className="tnum opacity-70">{n}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <Card className="divide-y divide-ink-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-4">
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </Card>
      ) : list.length === 0 ? (
        <Card>
          <EmptyState icon={<BellRing size={26} />} title="アラートはありません" description="この条件に該当する通知はありません。" />
        </Card>
      ) : (
        <Card className="divide-y divide-ink-100">
          {list.map((a) => {
            const st = staffById(staff, a.assigneeId);
            return (
              <div key={a.id} className="flex items-start gap-3 px-5 py-4">
                <span className="mt-1.5">
                  <StatusDot tone={SEV_TONE[a.severity] as never} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={SEV_TONE[a.severity] as never}>{a.kind}</Pill>
                    <Pill tone="gray">重要度 {a.severity}</Pill>
                    <Link to={`/voyages/${a.voyageId}`} className="tnum text-xs font-medium text-brand-600 hover:underline">
                      {a.voyageCode}
                    </Link>
                    {a.status === "未確認" && <span className="text-[10px] font-bold text-rose-500">● 未確認</span>}
                    {a.status === "対応済" && <span className="text-[10px] font-bold text-emerald-600">✓ 対応済</span>}
                  </div>
                  <p className="mt-1.5 text-sm text-ink-700">{a.message}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 text-[11px] text-ink-400">
                    <span>担当 {st?.name}</span>
                    <span title={md_hm(a.at)}>{fromNow(a.at)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {a.status === "未確認" && (
                    <button onClick={() => ack(a.id)} className="rounded-lg px-2.5 py-1 text-xs font-medium text-ink-600 hover:bg-ink-100">
                      確認
                    </button>
                  )}
                  {a.status !== "対応済" && (
                    <button onClick={() => resolve(a.id)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
                      <Check size={13} /> 対応済み
                    </button>
                  )}
                  <Link to={`/voyages/${a.voyageId}`} className="inline-flex items-center gap-0.5 text-xs text-ink-400 hover:text-brand-600">
                    案件へ <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </>
  );
}
