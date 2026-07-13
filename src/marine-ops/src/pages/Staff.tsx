import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useStore } from "../store/useStore";
import { Card, Pill, Progress, Skeleton, Avatar, StatusDot } from "../components/ui";
import PageHeader from "../components/PageHeader";
import { useLoad } from "../lib/useLoad";
import { voyageStatus, progressPct, needsAttention, currentItem, STATUS_TONE } from "../lib/voyage";

export default function Staff() {
  const loading = useLoad();
  const voyages = useStore((s) => s.voyages);
  const staff = useStore((s) => s.staff);

  const rows = useMemo(() => {
    return staff
      .filter((s) => s.team !== "管理部")
      .map((s) => {
        const mine = voyages.filter((v) => v.assigneeId === s.id);
        const active = mine.filter((v) => voyageStatus(v) !== "完了");
        const attention = active.filter((v) => needsAttention(v));
        const onTrack = active.length - attention.length;
        const rate = active.length === 0 ? 100 : Math.round((onTrack / active.length) * 100);
        return { s, mine, active, attention, rate };
      });
  }, [voyages, staff]);

  return (
    <>
      <PageHeader
        title="担当者"
        subtitle="運航担当ごとの案件と進捗を遠隔で把握します。要対応が多い担当者を早期に発見できます。"
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="mt-4 h-24 w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map(({ s, mine, active, attention, rate }) => (
            <Card key={s.id} className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <Avatar name={s.name} color={s.color} size={40} />
                  <div>
                    <div className="text-sm font-bold text-ink-900">{s.name}</div>
                    <div className="text-xs text-ink-400">
                      {s.team}・{s.role}
                    </div>
                  </div>
                </div>
                {attention.length > 0 ? (
                  <Pill tone="red">要対応 {attention.length}</Pill>
                ) : (
                  <Pill tone="green">順調</Pill>
                )}
              </div>

              <div className="grid grid-cols-3 divide-x divide-ink-100 border-b border-ink-100 text-center">
                <Metric label="進行中" value={active.length} />
                <Metric label="要対応" value={attention.length} tone={attention.length ? "red" : undefined} />
                <Metric label="完了" value={mine.length - active.length} />
              </div>

              <div className="px-5 py-3">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-ink-500">順調に進行している割合</span>
                  <span className="tnum font-semibold text-ink-800">{rate}%</span>
                </div>
                <Progress pct={rate} tone={rate >= 80 ? "green" : rate >= 50 ? "amber" : "red"} />
              </div>

              {/* 担当案件(要対応を上に) */}
              <div className="divide-y divide-ink-100">
                {[...active]
                  .sort((a, b) => Number(needsAttention(b)) - Number(needsAttention(a)))
                  .slice(0, 4)
                  .map((v) => {
                    const st = voyageStatus(v);
                    const cur = currentItem(v);
                    return (
                      <Link key={v.id} to={`/voyages/${v.id}`} className="flex items-center gap-3 px-5 py-2.5 transition hover:bg-ink-50">
                        <StatusDot tone={STATUS_TONE[st] as never} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-medium text-ink-700">
                            <span className="tnum text-ink-400">{v.code}</span>・{v.cargo}
                          </div>
                          <div className="truncate text-[11px] text-ink-400">現在: {cur?.label ?? "完了"}</div>
                        </div>
                        <span className="tnum text-xs text-ink-500">{progressPct(v)}%</span>
                        <ChevronRight size={14} className="text-ink-300" />
                      </Link>
                    );
                  })}
                {active.length === 0 && (
                  <div className="px-5 py-4 text-center text-xs text-ink-400">進行中の案件はありません。</div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: "red" }) {
  return (
    <div className="px-3 py-3">
      <div className={"tnum text-xl font-bold " + (tone === "red" && value > 0 ? "text-rose-600" : "text-ink-900")}>{value}</div>
      <div className="text-[11px] text-ink-400">{label}</div>
    </div>
  );
}
