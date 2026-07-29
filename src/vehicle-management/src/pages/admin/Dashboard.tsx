import { Link } from "react-router-dom";
import {
  ClipboardCheck,
  AlertTriangle,
  ShieldAlert,
  Truck,
  ChevronRight,
} from "lucide-react";
import { useStore } from "../../store";
import { useLoad } from "../../lib/useLoad";
import { daysUntil, fmtDate, fmtDateTime } from "../../lib/date";
import { Card, Pill, Skeleton, StatTile, EmptyState } from "../../components/ui";

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function Dashboard() {
  const loading = useLoad();
  const vehicles = useStore((s) => s.vehicles);
  const staffList = useStore((s) => s.staffList);
  const dailyReports = useStore((s) => s.dailyReports);
  const accidentRecords = useStore((s) => s.accidentRecords);

  const pendingToday = dailyReports.filter((r) => r.status === "pending" && isToday(r.reportedAt));
  const inspectionAlerts = vehicles
    .map((v) => ({ vehicle: v, days: daysUntil(v.inspectionExpiry) }))
    .filter((x) => x.days <= 60)
    .sort((a, b) => a.days - b.days);
  const openAccidents = accidentRecords.filter((a) => a.status !== "完了");

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="本日の未確認"
          value={pendingToday.length}
          unit="件"
          icon={<ClipboardCheck size={16} />}
          tone={pendingToday.length > 0 ? "amber" : "brand"}
        />
        <StatTile
          label="車検アラート"
          value={inspectionAlerts.length}
          unit="台"
          icon={<AlertTriangle size={16} />}
          tone={inspectionAlerts.length > 0 ? "red" : "brand"}
        />
        <StatTile
          label="対応中の事故"
          value={openAccidents.length}
          unit="件"
          icon={<ShieldAlert size={16} />}
          tone={openAccidents.length > 0 ? "amber" : "brand"}
        />
        <StatTile label="車両台数" value={vehicles.length} unit="台" icon={<Truck size={16} />} />
      </div>

      {inspectionAlerts.length > 0 && (
        <Card className="border-rose-200 bg-rose-50/40 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-700">
            <AlertTriangle size={16} /> 車検期限が近づいています
          </div>
          <div className="mt-3 divide-y divide-rose-100">
            {inspectionAlerts.map(({ vehicle, days }) => (
              <div key={vehicle.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <div className="font-semibold text-ink-900">
                    {vehicle.model}({vehicle.plateNumber})
                  </div>
                  <div className="text-xs text-ink-500">
                    車検満了日: {fmtDate(vehicle.inspectionExpiry)}
                  </div>
                </div>
                <Pill tone={days <= 14 ? "red" : "amber"}>
                  {days < 0 ? "期限超過" : `残り${days}日`}
                </Pill>
              </div>
            ))}
          </div>
          <Link
            to="/vehicles"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:underline"
          >
            車両・車検管理を開く <ChevronRight size={13} />
          </Link>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-ink-900">本日の未確認レポート</div>
            <Link to="/daily-checks" className="text-xs font-semibold text-brand-600 hover:underline">
              すべて見る
            </Link>
          </div>
          {pendingToday.length === 0 ? (
            <EmptyState
              icon={<ClipboardCheck size={22} />}
              title="未確認のレポートはありません"
              description="本日提出された点検報告はすべて確認済みです。"
            />
          ) : (
            <div className="mt-3 divide-y divide-ink-100">
              {pendingToday.slice(0, 5).map((r) => {
                const staff = staffList.find((s) => s.id === r.staffId);
                return (
                  <div key={r.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <div className="font-semibold text-ink-900">{staff?.name}</div>
                      <div className="text-xs text-ink-500">{fmtDateTime(r.reportedAt)}</div>
                    </div>
                    <Pill tone="amber">確認待ち</Pill>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-ink-900">対応中の事故</div>
            <Link to="/insurance" className="text-xs font-semibold text-brand-600 hover:underline">
              すべて見る
            </Link>
          </div>
          {openAccidents.length === 0 ? (
            <EmptyState
              icon={<ShieldAlert size={22} />}
              title="対応中の事故はありません"
              description="現在、対応が必要な事故案件はありません。"
            />
          ) : (
            <div className="mt-3 divide-y divide-ink-100">
              {openAccidents.slice(0, 5).map((a) => {
                const vehicle = vehicles.find((v) => v.id === a.vehicleId);
                return (
                  <div key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <div className="font-semibold text-ink-900">
                        {vehicle?.model}({vehicle?.plateNumber})
                      </div>
                      <div className="text-xs text-ink-500">{fmtDate(a.occurredAt)}</div>
                    </div>
                    <Pill tone="amber">{a.status}</Pill>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
