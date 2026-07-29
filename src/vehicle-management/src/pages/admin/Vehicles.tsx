import { useState } from "react";
import { toast } from "sonner";
import { Truck, ScanLine, Plus, Sparkles, AlertTriangle } from "lucide-react";
import { useStore } from "../../store";
import { useLoad } from "../../lib/useLoad";
import { daysUntil, fmtDate } from "../../lib/date";
import { ocrVehicleRegistration } from "../../lib/ocrSim";
import { sampleRegistrationImage } from "../../lib/sampleImages";
import { fakeApi } from "../../lib/fakeApi";
import { PhotoUploadOCR } from "../../components/PhotoUploadOCR";
import {
  Button,
  Card,
  Field,
  Modal,
  Pill,
  Skeleton,
  inputCls,
} from "../../components/ui";

function alertTone(days: number): "red" | "amber" | "brand" {
  if (days <= 14) return "red";
  if (days <= 60) return "amber";
  return "brand";
}

export default function Vehicles() {
  const loading = useLoad();
  const vehicles = useStore((s) => s.vehicles);
  const offices = useStore((s) => s.offices);
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  const sorted = [...vehicles].sort(
    (a, b) => daysUntil(a.inspectionExpiry) - daysUntil(b.inspectionExpiry),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">車両・車検管理</h1>
          <p className="mt-1 text-sm text-ink-500">
            車検証を撮影するだけで登録情報・車検満了日を自動反映します。満了日の60日前から自動でアラートします。
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <ScanLine size={16} /> 車検証を登録
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((v) => {
          const days = daysUntil(v.inspectionExpiry);
          const office = offices.find((o) => o.id === v.officeId);
          const tone = alertTone(days);
          const borderCls =
            tone === "red" ? "border-rose-200" : tone === "amber" ? "border-amber-200" : "";
          return (
            <Card key={v.id} className={"p-4 " + borderCls}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    <Truck size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-ink-900">{v.model}</div>
                    <div className="tnum text-xs text-ink-500">{v.plateNumber}</div>
                  </div>
                </div>
                {tone !== "brand" && (
                  <Pill tone={tone}>
                    <AlertTriangle size={11} /> {days < 0 ? "期限超過" : `残${days}日`}
                  </Pill>
                )}
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-ink-500">
                <Row label="事業所" value={office?.name ?? "-"} />
                <Row label="車台番号" value={v.chassisNumber} />
                <Row label="走行距離" value={`${v.odometerKm.toLocaleString()} km`} />
                <Row label="車検満了日" value={fmtDate(v.inspectionExpiry)} />
                <Row label="車検証登録日" value={fmtDate(v.inspectionRegisteredAt)} />
              </div>
            </Card>
          );
        })}
      </div>

      <RegisterModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-400">{label}</span>
      <span className="tnum font-medium text-ink-700">{value}</span>
    </div>
  );
}

function RegisterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const vehicles = useStore((s) => s.vehicles);
  const offices = useStore((s) => s.offices);
  const upsertVehicleInspection = useStore((s) => s.upsertVehicleInspection);

  const [targetId, setTargetId] = useState("new");
  const [plateNumber, setPlateNumber] = useState("");
  const [model, setModel] = useState("");
  const [chassisNumber, setChassisNumber] = useState("");
  const [inspectionExpiry, setInspectionExpiry] = useState("");
  const [officeId, setOfficeId] = useState(offices[0]?.id ?? "");
  const [saving, setSaving] = useState(false);

  function resetAndClose() {
    setTargetId("new");
    setPlateNumber("");
    setModel("");
    setChassisNumber("");
    setInspectionExpiry("");
    onClose();
  }

  async function handleSave() {
    if (!plateNumber || !model || !chassisNumber || !inspectionExpiry) {
      toast.error("車検証を撮影して自動入力するか、項目を入力してください。");
      return;
    }
    setSaving(true);
    await fakeApi(true, 450);
    upsertVehicleInspection({
      vehicleId: targetId === "new" ? undefined : targetId,
      plateNumber,
      model,
      chassisNumber,
      inspectionExpiry,
      officeId,
    });
    setSaving(false);
    toast.success(targetId === "new" ? "新規車両を登録しました" : "車検情報を更新しました");
    resetAndClose();
  }

  return (
    <Modal open={open} onClose={resetAndClose} title="車検証の登録" width={640}>
      <div className="space-y-4">
        <Field label="登録先" hint="既存車両の車検更新か、新規車両登録かを選択">
          <select className={inputCls} value={targetId} onChange={(e) => setTargetId(e.target.value)}>
            <option value="new">新規車両として登録</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                更新: {v.model}({v.plateNumber})
              </option>
            ))}
          </select>
        </Field>

        <PhotoUploadOCR
          title="車検証(自動車検査証)"
          description="車検証の面、または電子車検証のQRコードを撮影してください"
          sampleImage={sampleRegistrationImage()}
          onAnalyze={() => ocrVehicleRegistration()}
          onResult={(r) => {
            setPlateNumber(r.plateNumber);
            setModel(r.model);
            setChassisNumber(r.chassisNumber);
            setInspectionExpiry(r.inspectionExpiry);
          }}
          resultSummary={() => (
            <Pill tone="green">
              <Sparkles size={11} /> 登録番号・車名型式・車台番号・車検満了日を自動入力しました
            </Pill>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <Field label="登録番号(車両ナンバー)" required>
            <input className={inputCls} value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} />
          </Field>
          <Field label="車名・型式" required>
            <input className={inputCls} value={model} onChange={(e) => setModel(e.target.value)} />
          </Field>
          <Field label="車台番号" required>
            <input className={inputCls} value={chassisNumber} onChange={(e) => setChassisNumber(e.target.value)} />
          </Field>
          <Field label="車検満了日" required>
            <input
              type="date"
              className={inputCls}
              value={inspectionExpiry}
              onChange={(e) => setInspectionExpiry(e.target.value)}
            />
          </Field>
          <Field label="事業所">
            <select className={inputCls} value={officeId} onChange={(e) => setOfficeId(e.target.value)}>
              {offices.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex justify-end gap-2 border-t border-ink-100 pt-4">
          <Button variant="outline" onClick={resetAndClose}>
            キャンセル
          </Button>
          <Button loading={saving} onClick={handleSave}>
            <Plus size={16} /> 保存
          </Button>
        </div>
      </div>
    </Modal>
  );
}
