import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ClipboardCheck,
  Gauge,
  Thermometer,
  Wine,
  Fuel,
  Wrench,
  CheckCircle2,
  Search,
} from "lucide-react";
import { useStore } from "../../store";
import type { DailyReport, PartReplaced } from "../../data/seed";
import { fakeApi } from "../../lib/fakeApi";
import { fmtDateTime } from "../../lib/date";
import { sampleOdometerImage, sampleHygieneImage } from "../../lib/sampleImages";
import { useLoad } from "../../lib/useLoad";
import {
  Button,
  Card,
  EmptyState,
  Modal,
  Pill,
  Segmented,
  Skeleton,
  inputCls,
} from "../../components/ui";

const PART_LABEL: Record<PartReplaced, string> = {
  oil: "オイル",
  tire: "タイヤ",
  battery: "バッテリー",
  other: "その他",
};

function photoSrc(report: DailyReport, kind: "odometer" | "hygiene") {
  const raw = kind === "odometer" ? report.odometerPhoto : report.hygienePhoto;
  if (raw === "sample:odometer") return sampleOdometerImage(report.odometerKm);
  if (raw === "sample:hygiene") return sampleHygieneImage();
  return raw;
}

export default function DailyChecks() {
  const loading = useLoad();
  const dailyReports = useStore((s) => s.dailyReports);
  const staffList = useStore((s) => s.staffList);
  const offices = useStore((s) => s.offices);
  const vehicles = useStore((s) => s.vehicles);
  const admins = useStore((s) => s.admins);
  const currentAdminId = useStore((s) => s.currentAdminId);
  const approveReport = useStore((s) => s.approveReport);
  const adminName = admins.find((a) => a.id === currentAdminId)?.name ?? "管理者";

  const [tab, setTab] = useState<"pending" | "approved" | "all">("pending");
  const [officeFilter, setOfficeFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DailyReport | null>(null);

  const filtered = useMemo(() => {
    return dailyReports.filter((r) => {
      if (tab !== "all" && r.status !== tab) return false;
      if (officeFilter !== "all" && r.officeId !== officeFilter) return false;
      if (query) {
        const staff = staffList.find((s) => s.id === r.staffId);
        if (!staff?.name.includes(query)) return false;
      }
      return true;
    });
  }, [dailyReports, tab, officeFilter, query, staffList]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink-900">日次確認</h1>
        <p className="mt-1 text-sm text-ink-500">
          写真2枚を目視チェックし、[確認完了]を押すとスタッフへメッセージが届きます。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: "pending", label: "確認待ち" },
            { value: "approved", label: "確認済み" },
            { value: "all", label: "すべて" },
          ]}
        />
        <select
          className={inputCls + " w-auto"}
          value={officeFilter}
          onChange={(e) => setOfficeFilter(e.target.value)}
        >
          <option value="all">すべての事業所</option>
          {offices.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            className={inputCls + " w-48 pl-8"}
            placeholder="スタッフ名で検索"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ClipboardCheck size={22} />}
            title="該当する報告がありません"
            description="条件を変更するか、確認待ちが発生するまでお待ちください。"
          />
        </Card>
      ) : (
        <Card className="divide-y divide-ink-100">
          {filtered.map((r) => {
            const staff = staffList.find((s) => s.id === r.staffId);
            const office = offices.find((o) => o.id === r.officeId);
            const vehicle = vehicles.find((v) => v.id === r.vehicleId);
            return (
              <button
                key={r.id}
                onClick={() => setSelected(r)}
                className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3.5 text-left transition hover:bg-ink-50 sm:px-5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink-900">{staff?.name}</span>
                    <span className="text-xs text-ink-400">{office?.name}</span>
                  </div>
                  <div className="mt-0.5 truncate text-xs text-ink-500">
                    {vehicle?.model}({vehicle?.plateNumber}) ・ {fmtDateTime(r.reportedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tnum hidden text-xs text-ink-500 sm:inline">
                    {r.odometerKm.toLocaleString()}km / {r.alcoholLevel.toFixed(2)}mg/L / {r.temperature}℃
                  </span>
                  <Pill tone={r.status === "approved" ? "green" : "amber"}>
                    {r.status === "approved" ? "確認済み" : "確認待ち"}
                  </Pill>
                </div>
              </button>
            );
          })}
        </Card>
      )}

      <ReportModal
        report={selected}
        onClose={() => setSelected(null)}
        onApprove={async (id) => {
          await fakeApi(true, 500);
          approveReport(id, adminName);
          toast.success("確認しました。スタッフにメッセージを送信しました。");
          setSelected(null);
        }}
      />
    </div>
  );
}

function ReportModal({
  report,
  onClose,
  onApprove,
}: {
  report: DailyReport | null;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
}) {
  const staffList = useStore((s) => s.staffList);
  const offices = useStore((s) => s.offices);
  const vehicles = useStore((s) => s.vehicles);
  const [approving, setApproving] = useState(false);

  if (!report) return null;

  const staff = staffList.find((s) => s.id === report.staffId);
  const office = offices.find((o) => o.id === report.officeId);
  const vehicle = vehicles.find((v) => v.id === report.vehicleId);

  return (
    <Modal open={!!report} onClose={onClose} title="日次点検レポート" width={720}>
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-ink-50 p-3 text-sm sm:grid-cols-4">
        <InfoItem label="スタッフ" value={staff?.name ?? "-"} />
        <InfoItem label="事業所" value={office?.name ?? "-"} />
        <InfoItem label="車両" value={vehicle ? `${vehicle.model}(${vehicle.plateNumber})` : "-"} />
        <InfoItem label="報告日時" value={fmtDateTime(report.reportedAt)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 text-xs font-bold text-ink-500">【写真1】車両メーター</div>
          <img
            src={photoSrc(report, "odometer")}
            alt="車両メーター写真"
            className="aspect-[16/10] w-full rounded-xl border border-ink-200 object-cover"
          />
          <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-ink-800">
            <Gauge size={15} className="text-brand-600" />
            走行距離: <span className="tnum">{report.odometerKm.toLocaleString()} km</span>
          </div>
        </div>
        <div>
          <div className="mb-1.5 text-xs font-bold text-ink-500">【写真2】衛生チェック</div>
          <img
            src={photoSrc(report, "hygiene")}
            alt="衛生チェック写真"
            className="aspect-[16/10] w-full rounded-xl border border-ink-200 object-cover"
          />
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-ink-800">
            <span className="flex items-center gap-1.5">
              <Wine size={15} className="text-brand-600" />
              アルコール: <span className="tnum">{report.alcoholLevel.toFixed(2)} mg/L</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Thermometer size={15} className="text-brand-600" />
              体温: <span className="tnum">{report.temperature} ℃</span>
            </span>
          </div>
        </div>
      </div>

      {(report.fuelLiters || report.partsReplaced.length > 0 || report.conditionNote) && (
        <div className="mt-4 space-y-2 rounded-xl border border-ink-200 p-3 text-sm">
          {report.fuelLiters && (
            <div className="flex items-center gap-1.5 text-ink-700">
              <Fuel size={14} className="text-ink-400" /> 給油: {report.fuelLiters}L
            </div>
          )}
          {report.partsReplaced.length > 0 && (
            <div className="flex items-center gap-1.5 text-ink-700">
              <Wrench size={14} className="text-ink-400" /> パーツ交換:{" "}
              {report.partsReplaced.map((p) => PART_LABEL[p]).join(" / ")}
            </div>
          )}
          {report.conditionNote && (
            <div className="text-ink-700">車両状態メモ: {report.conditionNote}</div>
          )}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4">
        {report.status === "approved" ? (
          <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <CheckCircle2 size={16} />
            {report.approvedBy} が確認済み({report.approvedAt ? fmtDateTime(report.approvedAt) : ""})
          </div>
        ) : (
          <span className="text-xs text-ink-400">内容を確認のうえ、確認完了を押してください</span>
        )}
        {report.status === "pending" && (
          <Button
            loading={approving}
            onClick={async () => {
              setApproving(true);
              await onApprove(report.id);
              setApproving(false);
            }}
          >
            <CheckCircle2 size={16} /> 確認完了
          </Button>
        )}
      </div>
    </Modal>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-ink-400">{label}</div>
      <div className="mt-0.5 truncate font-semibold text-ink-900">{value}</div>
    </div>
  );
}
