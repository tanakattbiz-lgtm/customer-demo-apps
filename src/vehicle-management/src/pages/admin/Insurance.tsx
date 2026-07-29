import { useState } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  ShieldAlert,
  Plus,
  Phone,
  Edit3,
} from "lucide-react";
import { useStore } from "../../store";
import type { AccidentStatus, InsurancePolicy } from "../../data/seed";
import { useLoad } from "../../lib/useLoad";
import { fmtDate, fmtDateTime } from "../../lib/date";
import { fakeApi } from "../../lib/fakeApi";
import {
  Button,
  Card,
  Field,
  Modal,
  Pill,
  Segmented,
  Skeleton,
  inputCls,
} from "../../components/ui";

const STATUS_OPTIONS: AccidentStatus[] = ["受付", "交渉中", "修理中", "完了"];
const STATUS_TONE: Record<AccidentStatus, "amber" | "blue" | "violet" | "green"> = {
  受付: "amber",
  交渉中: "blue",
  修理中: "violet",
  完了: "green",
};

export default function Insurance() {
  const loading = useLoad();
  const [tab, setTab] = useState<"policy" | "accident">("policy");
  const [policyModal, setPolicyModal] = useState<string | null>(null); // vehicleId
  const [accidentModalOpen, setAccidentModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">保険・事故管理</h1>
          <p className="mt-1 text-sm text-ink-500">
            車両ごとの保険契約と、事故発生時の対応・支払い状況を一元管理します。
          </p>
        </div>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: "policy", label: "保険情報" },
            { value: "accident", label: "事故記録" },
          ]}
        />
      </div>

      {tab === "policy" ? (
        <PolicyTab onEdit={setPolicyModal} />
      ) : (
        <AccidentTab onAdd={() => setAccidentModalOpen(true)} />
      )}

      <PolicyModal vehicleId={policyModal} onClose={() => setPolicyModal(null)} />
      <AccidentModal open={accidentModalOpen} onClose={() => setAccidentModalOpen(false)} />
    </div>
  );
}

// ---------------- 保険情報タブ ----------------
function PolicyTab({ onEdit }: { onEdit: (vehicleId: string) => void }) {
  const vehicles = useStore((s) => s.vehicles);
  const insurancePolicies = useStore((s) => s.insurancePolicies);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {vehicles.map((v) => {
        const policy = insurancePolicies.find((p) => p.vehicleId === v.id);
        return (
          <Card key={v.id} className="p-4 sm:p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-bold text-ink-900">{v.model}</div>
                <div className="tnum text-xs text-ink-500">{v.plateNumber}</div>
              </div>
              <button
                onClick={() => onEdit(v.id)}
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700"
              >
                <Edit3 size={15} />
              </button>
            </div>
            {policy ? (
              <div className="mt-3 space-y-1.5 text-xs text-ink-500">
                <Row label="保険会社" value={policy.companyName} />
                <Row label="代理店" value={policy.agentName} />
                <Row label="緊急連絡先" value={policy.emergencyContact} />
                <Row label="証券番号" value={policy.policyNumber} />
                <Row label="保険期間" value={`${fmtDate(policy.startDate)} 〜 ${fmtDate(policy.endDate)}`} />
                <Row
                  label="補償内容"
                  value={
                    (policy.liabilityUnlimited ? "対人・対物無制限" : "対人・対物 有限") +
                    " / " +
                    (policy.hasVehicleCoverage
                      ? `車両保険あり(免責${policy.deductible.toLocaleString()}円)`
                      : "車両保険なし")
                  }
                />
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                <ShieldAlert size={13} /> 保険情報が未登録です
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-ink-400">{label}</span>
      <span className="text-right font-medium text-ink-700">{value}</span>
    </div>
  );
}

function PolicyModal({ vehicleId, onClose }: { vehicleId: string | null; onClose: () => void }) {
  const vehicles = useStore((s) => s.vehicles);
  const insurancePolicies = useStore((s) => s.insurancePolicies);
  const upsertInsurancePolicy = useStore((s) => s.upsertInsurancePolicy);
  const [saving, setSaving] = useState(false);

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const existing = insurancePolicies.find((p) => p.vehicleId === vehicleId);

  const [form, setForm] = useState<InsurancePolicy | null>(null);

  if (vehicleId && !form) {
    setForm(
      existing ?? {
        vehicleId,
        companyName: "",
        agentName: "",
        emergencyContact: "",
        policyNumber: "",
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        liabilityUnlimited: true,
        hasVehicleCoverage: true,
        deductible: 0,
      },
    );
  }

  function close() {
    setForm(null);
    onClose();
  }

  async function handleSave() {
    if (!form) return;
    if (!form.companyName || !form.policyNumber) {
      toast.error("保険会社名と証券番号を入力してください。");
      return;
    }
    setSaving(true);
    await fakeApi(true, 450);
    upsertInsurancePolicy(form);
    setSaving(false);
    toast.success("保険情報を保存しました");
    close();
  }

  return (
    <Modal open={!!vehicleId} onClose={close} title={`保険情報: ${vehicle?.model ?? ""}`} width={560}>
      {form && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="保険会社名" required>
              <input
                className={inputCls}
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
            </Field>
            <Field label="代理店名">
              <input
                className={inputCls}
                value={form.agentName}
                onChange={(e) => setForm({ ...form, agentName: e.target.value })}
              />
            </Field>
            <Field label="緊急連絡先">
              <input
                className={inputCls}
                value={form.emergencyContact}
                onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
              />
            </Field>
            <Field label="証券番号" required>
              <input
                className={inputCls}
                value={form.policyNumber}
                onChange={(e) => setForm({ ...form, policyNumber: e.target.value })}
              />
            </Field>
            <Field label="保険期間(開始)">
              <input
                type="date"
                className={inputCls}
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </Field>
            <Field label="保険期間(終了)">
              <input
                type="date"
                className={inputCls}
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-xl bg-ink-50 px-4 py-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.liabilityUnlimited}
                onChange={(e) => setForm({ ...form, liabilityUnlimited: e.target.checked })}
              />
              対人・対物 無制限
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.hasVehicleCoverage}
                onChange={(e) => setForm({ ...form, hasVehicleCoverage: e.target.checked })}
              />
              車両保険あり
            </label>
          </div>

          {form.hasVehicleCoverage && (
            <Field label="免責金額(円)">
              <input
                type="number"
                className={inputCls + " tnum"}
                value={form.deductible}
                onChange={(e) => setForm({ ...form, deductible: Number(e.target.value) })}
              />
            </Field>
          )}

          <div className="flex justify-end gap-2 border-t border-ink-100 pt-4">
            <Button variant="outline" onClick={close}>
              キャンセル
            </Button>
            <Button loading={saving} onClick={handleSave}>
              保存
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ---------------- 事故記録タブ ----------------
function AccidentTab({ onAdd }: { onAdd: () => void }) {
  const accidentRecords = useStore((s) => s.accidentRecords);
  const vehicles = useStore((s) => s.vehicles);
  const staffList = useStore((s) => s.staffList);
  const updateAccidentStatus = useStore((s) => s.updateAccidentStatus);
  const [openContacts, setOpenContacts] = useState(false);

  const sorted = [...accidentRecords].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          onClick={() => setOpenContacts(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3.5 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
        >
          <Phone size={15} /> 事故受付・レッカー連絡先
        </button>
        <Button onClick={onAdd}>
          <Plus size={16} /> 事故を登録
        </Button>
      </div>

      {sorted.length === 0 && (
        <Card className="p-10 text-center text-sm text-ink-400">事故記録はまだありません</Card>
      )}

      <div className="space-y-3">
        {sorted.map((a) => {
          const vehicle = vehicles.find((v) => v.id === a.vehicleId);
          const staff = staffList.find((s) => s.id === a.staffId);
          const selfPay = Math.max(0, a.repairCost - a.insurancePayout);
          return (
            <Card key={a.id} className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-ink-900">
                    <ShieldAlert size={15} className="text-rose-500" />
                    {vehicle?.model}({vehicle?.plateNumber})
                  </div>
                  <div className="mt-0.5 text-xs text-ink-500">
                    {fmtDateTime(a.occurredAt)} ・ {a.location} ・ 担当: {staff?.name}
                  </div>
                </div>
                <select
                  className={inputCls + " w-auto"}
                  value={a.status}
                  onChange={(e) => updateAccidentStatus(a.id, e.target.value as AccidentStatus)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <p className="mt-3 text-sm text-ink-700">{a.summary}</p>
              <p className="mt-1 text-xs text-ink-500">{a.counterpartyInfo}</p>

              <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-ink-50 p-3 text-xs sm:grid-cols-5">
                <Stat label="過失割合" value={`自社${a.faultRatioSelf}% : 相手${a.faultRatioOther}%`} />
                <Stat label="修理費用総額" value={`¥${a.repairCost.toLocaleString()}`} />
                <Stat label="保険適用額" value={`¥${a.insurancePayout.toLocaleString()}`} />
                <Stat label="自己負担額" value={`¥${selfPay.toLocaleString()}`} />
                <div className="flex items-center">
                  <Pill tone={STATUS_TONE[a.status]}>{a.status}</Pill>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={openContacts} onClose={() => setOpenContacts(false)} title="事故受付・緊急連絡先">
        <div className="space-y-2 text-sm">
          {[
            { label: "任意保険 事故受付窓口", tel: "0120-000-111" },
            { label: "レッカー・ロードサービス", tel: "0120-000-222" },
          ].map((c) => (
            <a
              key={c.label}
              href={`tel:${c.tel.replace(/-/g, "")}`}
              className="flex items-center justify-between rounded-xl border border-ink-200 px-4 py-3 hover:bg-ink-50"
            >
              <span className="font-medium text-ink-800">{c.label}</span>
              <span className="tnum text-ink-500">{c.tel}</span>
            </a>
          ))}
        </div>
      </Modal>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-ink-400">{label}</div>
      <div className="tnum mt-0.5 font-bold text-ink-800">{value}</div>
    </div>
  );
}

function AccidentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const vehicles = useStore((s) => s.vehicles);
  const staffList = useStore((s) => s.staffList);
  const addAccidentRecord = useStore((s) => s.addAccidentRecord);

  const blank = {
    vehicleId: vehicles[0]?.id ?? "",
    staffId: staffList[0]?.id ?? "",
    occurredAt: new Date().toISOString().slice(0, 16),
    location: "",
    summary: "",
    counterpartyInfo: "",
    faultRatioSelf: 0,
    repairCost: 0,
    insurancePayout: 0,
  };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  function close() {
    setForm(blank);
    onClose();
  }

  async function handleSave() {
    if (!form.location || !form.summary) {
      toast.error("事故の場所と概要を入力してください。");
      return;
    }
    setSaving(true);
    await fakeApi(true, 450);
    addAccidentRecord({
      vehicleId: form.vehicleId,
      staffId: form.staffId,
      occurredAt: new Date(form.occurredAt).toISOString(),
      location: form.location,
      summary: form.summary,
      counterpartyInfo: form.counterpartyInfo,
      faultRatioSelf: form.faultRatioSelf,
      faultRatioOther: 100 - form.faultRatioSelf,
      repairCost: form.repairCost,
      insurancePayout: form.insurancePayout,
      status: "受付",
    });
    setSaving(false);
    toast.success("事故記録を登録しました");
    close();
  }

  const selfPay = Math.max(0, form.repairCost - form.insurancePayout);

  return (
    <Modal open={open} onClose={close} title="事故・保険支払い記録の登録" width={640}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="対象車両">
            <select
              className={inputCls}
              value={form.vehicleId}
              onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.model}({v.plateNumber})
                </option>
              ))}
            </select>
          </Field>
          <Field label="当事者スタッフ">
            <select
              className={inputCls}
              value={form.staffId}
              onChange={(e) => setForm({ ...form, staffId: e.target.value })}
            >
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="事故発生日時">
            <input
              type="datetime-local"
              className={inputCls}
              value={form.occurredAt}
              onChange={(e) => setForm({ ...form, occurredAt: e.target.value })}
            />
          </Field>
          <Field label="事故発生場所" required>
            <input
              className={inputCls}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </Field>
        </div>

        <Field label="事故概要・状況" required>
          <textarea
            className={inputCls + " min-h-20 resize-none"}
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
          />
        </Field>

        <Field label="相手方情報" hint="氏名、連絡先、車種・ナンバー、相手側保険会社など">
          <textarea
            className={inputCls + " min-h-16 resize-none"}
            value={form.counterpartyInfo}
            onChange={(e) => setForm({ ...form, counterpartyInfo: e.target.value })}
          />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="過失割合(自社 %)">
            <input
              type="number"
              min={0}
              max={100}
              className={inputCls + " tnum"}
              value={form.faultRatioSelf}
              onChange={(e) => setForm({ ...form, faultRatioSelf: Number(e.target.value) })}
            />
          </Field>
          <Field label="修理費用総額(円)">
            <input
              type="number"
              className={inputCls + " tnum"}
              value={form.repairCost}
              onChange={(e) => setForm({ ...form, repairCost: Number(e.target.value) })}
            />
          </Field>
          <Field label="保険適用額(円)">
            <input
              type="number"
              className={inputCls + " tnum"}
              value={form.insurancePayout}
              onChange={(e) => setForm({ ...form, insurancePayout: Number(e.target.value) })}
            />
          </Field>
        </div>

        <div className="rounded-xl bg-ink-50 px-4 py-3 text-sm">
          自己負担額(自動計算): <span className="tnum font-bold text-ink-900">¥{selfPay.toLocaleString()}</span>
        </div>

        <div className="flex justify-end gap-2 border-t border-ink-100 pt-4">
          <Button variant="outline" onClick={close}>
            キャンセル
          </Button>
          <Button loading={saving} onClick={handleSave}>
            <ShieldCheck size={16} /> 登録
          </Button>
        </div>
      </div>
    </Modal>
  );
}
