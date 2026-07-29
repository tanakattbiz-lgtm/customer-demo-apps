import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Gauge,
  Thermometer,
  Fuel,
  Wrench,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  Building2,
  Truck,
} from "lucide-react";
import { useStore } from "../../store";
import { APPROVAL_MESSAGE, type PartReplaced } from "../../data/seed";
import { ocrOdometer, ocrHygiene } from "../../lib/ocrSim";
import { sampleOdometerImage, sampleHygieneImage } from "../../lib/sampleImages";
import { fakeApi } from "../../lib/fakeApi";
import { fmtDateTime, fmtTime } from "../../lib/date";
import { PhotoUploadOCR } from "../../components/PhotoUploadOCR";
import { Button, Card, Field, Pill, inputCls } from "../../components/ui";

const PART_OPTIONS: { value: PartReplaced; label: string }[] = [
  { value: "oil", label: "オイル" },
  { value: "tire", label: "タイヤ" },
  { value: "battery", label: "バッテリー" },
  { value: "other", label: "その他" },
];

function isSameDay(iso: string, ref: Date) {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

export default function StaffHome() {
  const staffList = useStore((s) => s.staffList);
  const offices = useStore((s) => s.offices);
  const vehicles = useStore((s) => s.vehicles);
  const currentStaffId = useStore((s) => s.currentStaffId);
  const dailyReports = useStore((s) => s.dailyReports);
  const submitDailyReport = useStore((s) => s.submitDailyReport);

  const staff = staffList.find((s) => s.id === currentStaffId)!;
  const office = offices.find((o) => o.id === staff.officeId)!;
  const vehicle = vehicles.find((v) => v.id === staff.vehicleId)!;

  const today = new Date();
  const myReports = useMemo(
    () =>
      dailyReports
        .filter((r) => r.staffId === staff.id)
        .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt)),
    [dailyReports, staff.id],
  );
  const todaysReport = myReports.find((r) => isSameDay(r.reportedAt, today));

  if (todaysReport?.status === "approved") {
    return (
      <div className="space-y-5">
        <ApprovedCard report={todaysReport} />
        <HistoryList reports={myReports.slice(1, 6)} />
      </div>
    );
  }

  if (todaysReport?.status === "pending") {
    return (
      <div className="space-y-5">
        <PendingCard report={todaysReport} />
        <HistoryList reports={myReports.slice(1, 6)} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ReportForm
        staffName={staff.name}
        officeName={office.name}
        vehicleLabel={`${vehicle.model}(${vehicle.plateNumber})`}
        vehicleId={vehicle.id}
        officeId={office.id}
        staffId={staff.id}
        baseOdometer={vehicle.odometerKm}
        onSubmit={async (payload) => {
          await fakeApi(true, 500);
          submitDailyReport(payload);
          toast.success("報告を送信しました。管理者の確認をお待ちください。");
        }}
      />
      <HistoryList reports={myReports.slice(0, 5)} />
    </div>
  );
}

// ---------------- 提出フォーム ----------------
function ReportForm({
  staffName,
  officeName,
  vehicleLabel,
  vehicleId,
  officeId,
  staffId,
  baseOdometer,
  onSubmit,
}: {
  staffName: string;
  officeName: string;
  vehicleLabel: string;
  vehicleId: string;
  officeId: string;
  staffId: string;
  baseOdometer: number;
  onSubmit: (payload: {
    staffId: string;
    vehicleId: string;
    officeId: string;
    odometerPhoto: string;
    odometerKm: number;
    hygienePhoto: string;
    alcoholLevel: number;
    temperature: number;
    fuelLiters?: number;
    partsReplaced: PartReplaced[];
    conditionNote?: string;
  }) => Promise<void>;
}) {
  const [odometerKm, setOdometerKm] = useState<number | null>(null);
  const [odometerPhoto, setOdometerPhoto] = useState<string | null>(null);
  const [alcoholLevel, setAlcoholLevel] = useState<number | null>(null);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [hygienePhoto, setHygienePhoto] = useState<string | null>(null);

  const [fuelOn, setFuelOn] = useState(false);
  const [fuelLiters, setFuelLiters] = useState(20);
  const [parts, setParts] = useState<PartReplaced[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const ready = odometerKm !== null && alcoholLevel !== null && temperature !== null;

  function togglePart(v: PartReplaced) {
    setParts((prev) => (prev.includes(v) ? prev.filter((p) => p !== v) : [...prev, v]));
  }

  async function handleSubmit() {
    if (!ready) {
      toast.error("2枚の写真を送信し、自動入力を完了させてください。");
      return;
    }
    setSubmitting(true);
    await onSubmit({
      staffId,
      vehicleId,
      officeId,
      odometerPhoto: odometerPhoto ?? "sample:odometer",
      odometerKm: odometerKm!,
      hygienePhoto: hygienePhoto ?? "sample:hygiene",
      alcoholLevel: alcoholLevel!,
      temperature: temperature!,
      fuelLiters: fuelOn ? fuelLiters : undefined,
      partsReplaced: parts,
      conditionNote: note || undefined,
    });
    setSubmitting(false);
  }

  return (
    <>
      <Card className="p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <InfoRow icon={<Building2 size={14} />} label="事業所 / スタッフ" value={`${officeName}\n${staffName}`} />
          <InfoRow icon={<Truck size={14} />} label="車両情報" value={vehicleLabel} />
        </div>
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-500">
          <Clock size={13} />
          報告日時: {fmtDateTime(new Date().toISOString())}(自動反映)
        </div>
      </Card>

      <PhotoUploadOCR
        title="【写真1】車両メーター写真"
        description="オドメーター(走行距離計)が写るように撮影してください"
        sampleImage={sampleOdometerImage(baseOdometer)}
        onAnalyze={() => ocrOdometer(baseOdometer)}
        onPhotoReady={setOdometerPhoto}
        onResult={(r) => {
          setOdometerKm(r.odometerKm);
        }}
        resultSummary={() => (
          <Pill tone="green">
            <Sparkles size={11} /> 走行距離を自動入力しました
          </Pill>
        )}
      />
      <Field label="走行距離(km)" required hint="自動入力された数値に誤りがあれば修正してください">
        <div className="relative">
          <Gauge size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="number"
            className={inputCls + " pl-9 tnum"}
            placeholder="写真をアップロードすると自動入力されます"
            value={odometerKm ?? ""}
            onChange={(e) => setOdometerKm(e.target.value === "" ? null : Number(e.target.value))}
          />
        </div>
      </Field>

      <PhotoUploadOCR
        title="【写真2】衛生チェック写真"
        description="体温計とアルコールチェッカーを並べて撮影してください"
        sampleImage={sampleHygieneImage()}
        onAnalyze={() => ocrHygiene()}
        onPhotoReady={setHygienePhoto}
        onResult={(r) => {
          setAlcoholLevel(r.alcoholLevel);
          setTemperature(r.temperature);
        }}
        resultSummary={() => (
          <Pill tone="green">
            <Sparkles size={11} /> アルコール値・体温を自動入力しました
          </Pill>
        )}
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="アルコール測定値(mg/L)" required>
          <input
            type="number"
            step="0.01"
            className={inputCls + " tnum"}
            placeholder="—"
            value={alcoholLevel ?? ""}
            onChange={(e) => setAlcoholLevel(e.target.value === "" ? null : Number(e.target.value))}
          />
        </Field>
        <Field label="体温(℃)" required>
          <div className="relative">
            <Thermometer size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="number"
              step="0.1"
              className={inputCls + " pl-9 tnum"}
              placeholder="—"
              value={temperature ?? ""}
              onChange={(e) => setTemperature(e.target.value === "" ? null : Number(e.target.value))}
            />
          </div>
        </Field>
      </div>

      <Card className="space-y-4 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-ink-900">
            <Fuel size={16} /> 給油(必要な場合のみ)
          </div>
          <button
            type="button"
            onClick={() => setFuelOn((v) => !v)}
            className={
              "relative h-6 w-11 shrink-0 rounded-full transition " +
              (fuelOn ? "bg-brand-600" : "bg-ink-200")
            }
          >
            <span
              className={
                "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition " +
                (fuelOn ? "translate-x-5" : "translate-x-0")
              }
            />
          </button>
        </div>
        {fuelOn && (
          <Field label="給油量(L)">
            <input
              type="number"
              className={inputCls + " tnum"}
              value={fuelLiters}
              onChange={(e) => setFuelLiters(Number(e.target.value))}
            />
          </Field>
        )}

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-ink-900">
            <Wrench size={16} /> パーツ交換(該当する場合のみ)
          </div>
          <div className="flex flex-wrap gap-2">
            {PART_OPTIONS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => togglePart(p.value)}
                className={
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition " +
                  (parts.includes(p.value)
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-ink-200 bg-white text-ink-500 hover:bg-ink-50")
                }
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <Field label="車両状態(気になる点があれば入力)">
          <textarea
            className={inputCls + " min-h-20 resize-none"}
            placeholder="例: タイヤの空気圧が少し低い気がする"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
      </Card>

      <Button
        className="w-full"
        size="lg"
        loading={submitting}
        disabled={!ready}
        onClick={handleSubmit}
      >
        {ready ? "この内容で報告する" : "写真をアップロードしてください"}
      </Button>
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[11px] text-ink-400">
        {icon} {label}
      </div>
      <div className="mt-0.5 whitespace-pre-line text-sm font-semibold text-ink-900">{value}</div>
    </div>
  );
}

// ---------------- 確認待ち ----------------
function PendingCard({ report }: { report: { reportedAt: string; odometerKm: number; alcoholLevel: number; temperature: number } }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <div className="pulse-dot grid h-16 w-16 place-items-center rounded-full bg-amber-100 text-amber-600">
          <Clock size={28} />
        </div>
        <div className="text-lg font-bold text-ink-900">管理者の確認待ちです</div>
        <p className="max-w-xs text-sm text-ink-500">
          {fmtTime(report.reportedAt)} に本日分の点検を送信しました。管理者が確認すると、この画面にメッセージが表示されます。
        </p>
        <div className="mt-2 grid w-full grid-cols-3 gap-2 rounded-xl bg-ink-50 p-3 text-xs">
          <StatBox label="走行距離" value={`${report.odometerKm.toLocaleString()}km`} />
          <StatBox label="アルコール" value={`${report.alcoholLevel.toFixed(2)}mg/L`} />
          <StatBox label="体温" value={`${report.temperature}℃`} />
        </div>
      </div>
    </Card>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-ink-400">{label}</div>
      <div className="tnum mt-0.5 font-bold text-ink-800">{value}</div>
    </div>
  );
}

// ---------------- 承認済み ----------------
function ApprovedCard({ report }: { report: { odometerKm: number; alcoholLevel: number; temperature: number; approvedBy?: string; approvedAt?: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="overflow-hidden border-emerald-200">
      <div className="bg-gradient-to-br from-emerald-50 to-white px-6 py-10 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600"
        >
          <CheckCircle2 size={30} />
        </motion.div>
        <div className="mt-3 text-lg font-bold text-ink-900">本日の点検、確認完了しました</div>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-ink-600">
          {APPROVAL_MESSAGE}
        </p>
        {report.approvedBy && (
          <p className="mt-3 text-xs text-ink-400">
            確認者: {report.approvedBy}
            {report.approvedAt ? `(${fmtTime(report.approvedAt)})` : ""}
          </p>
        )}
      </div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-center gap-1 border-t border-ink-100 py-2.5 text-xs font-medium text-ink-500 hover:bg-ink-50"
      >
        点検内容を見る
        <ChevronDown size={14} className={"transition " + (open ? "rotate-180" : "")} />
      </button>
      {open && (
        <div className="grid grid-cols-3 gap-2 border-t border-ink-100 p-4 text-xs">
          <StatBox label="走行距離" value={`${report.odometerKm.toLocaleString()}km`} />
          <StatBox label="アルコール" value={`${report.alcoholLevel.toFixed(2)}mg/L`} />
          <StatBox label="体温" value={`${report.temperature}℃`} />
        </div>
      )}
    </Card>
  );
}

// ---------------- 履歴 ----------------
function HistoryList({
  reports,
}: {
  reports: { id: string; reportedAt: string; status: string; odometerKm: number }[];
}) {
  if (reports.length === 0) return null;
  return (
    <Card className="p-4">
      <div className="mb-2 text-xs font-bold text-ink-500">直近の提出履歴</div>
      <div className="divide-y divide-ink-100">
        {reports.map((r) => (
          <div key={r.id} className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-ink-600">{fmtDateTime(r.reportedAt)}</span>
            <div className="flex items-center gap-2">
              <span className="tnum text-ink-500">{r.odometerKm.toLocaleString()}km</span>
              <Pill tone={r.status === "approved" ? "green" : "amber"}>
                {r.status === "approved" ? "確認済み" : "確認待ち"}
              </Pill>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
