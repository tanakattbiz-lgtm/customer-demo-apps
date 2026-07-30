import { useState } from "react";
import { toast } from "sonner";
import { Users, Plus, Truck } from "lucide-react";
import { useStore } from "../../store";
import { useLoad } from "../../lib/useLoad";
import { fakeApi } from "../../lib/fakeApi";
import { Avatar, Button, Card, Field, Modal, Skeleton, inputCls } from "../../components/ui";

export default function StaffManagement() {
  const loading = useLoad();
  const staffList = useStore((s) => s.staffList);
  const offices = useStore((s) => s.offices);
  const vehicles = useStore((s) => s.vehicles);
  const updateStaffAssignment = useStore((s) => s.updateStaffAssignment);
  const [addOpen, setAddOpen] = useState(false);

  async function handleOfficeChange(staffId: string, officeId: string) {
    await fakeApi(true, 350);
    updateStaffAssignment(staffId, { officeId });
    toast.success("事業所を変更しました");
  }

  async function handleVehicleChange(staffId: string, vehicleId: string) {
    await fakeApi(true, 350);
    updateStaffAssignment(staffId, { vehicleId });
    toast.success("担当車両を変更しました");
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">スタッフ管理</h1>
          <p className="mt-1 text-sm text-ink-500">
            スタッフの所属事業所と担当車両をここで割り当てます。変更は即時にスタッフ画面へ反映されます。
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus size={16} /> スタッフを追加
        </Button>
      </div>

      <Card className="divide-y divide-ink-100">
        <div className="hidden grid-cols-[1fr_220px_260px] gap-3 px-5 py-3 text-xs font-medium text-ink-400 sm:grid">
          <span>スタッフ</span>
          <span>事業所</span>
          <span>担当車両</span>
        </div>
        {staffList.map((st) => {
          const vehicle = vehicles.find((v) => v.id === st.vehicleId);
          const vehiclesInOffice = vehicles.filter((v) => v.officeId === st.officeId);
          const vehicleOptions = vehiclesInOffice.some((v) => v.id === st.vehicleId)
            ? vehiclesInOffice
            : [...(vehicle ? [vehicle] : []), ...vehiclesInOffice];
          return (
            <div
              key={st.id}
              className="grid grid-cols-1 gap-3 px-5 py-3.5 sm:grid-cols-[1fr_220px_260px] sm:items-center"
            >
              <div className="flex items-center gap-3">
                <Avatar name={st.name} size={32} />
                <div>
                  <div className="text-sm font-semibold text-ink-900">{st.name}</div>
                  <div className="text-xs text-ink-400">{st.username}</div>
                </div>
              </div>
              <select
                className={inputCls}
                value={st.officeId}
                onChange={(e) => handleOfficeChange(st.id, e.target.value)}
              >
                {offices.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              <select
                className={inputCls}
                value={st.vehicleId}
                onChange={(e) => handleVehicleChange(st.id, e.target.value)}
              >
                {vehicleOptions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.model}({v.plateNumber})
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </Card>

      <AddStaffModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function AddStaffModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const offices = useStore((s) => s.offices);
  const vehicles = useStore((s) => s.vehicles);
  const addStaff = useStore((s) => s.addStaff);

  const blank = { name: "", officeId: offices[0]?.id ?? "", vehicleId: "" };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const vehiclesInOffice = vehicles.filter((v) => v.officeId === form.officeId);

  function close() {
    setForm(blank);
    onClose();
  }

  async function handleSave() {
    if (!form.name || !form.vehicleId) {
      toast.error("氏名と担当車両を入力してください。");
      return;
    }
    setSaving(true);
    await fakeApi(true, 450);
    addStaff(form);
    setSaving(false);
    toast.success("スタッフを追加しました");
    close();
  }

  return (
    <Modal open={open} onClose={close} title="スタッフを追加" width={480}>
      <div className="space-y-4">
        <Field label="氏名" required>
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="例: 高橋 美咲"
          />
        </Field>
        <Field label="事業所">
          <select
            className={inputCls}
            value={form.officeId}
            onChange={(e) =>
              setForm({
                ...form,
                officeId: e.target.value,
                vehicleId: vehicles.find((v) => v.officeId === e.target.value)?.id ?? "",
              })
            }
          >
            {offices.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="担当車両" required hint="選択した事業所に配属されている車両から選びます">
          <div className="relative">
            <Truck size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <select
              className={inputCls + " pl-9"}
              value={form.vehicleId}
              onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
            >
              <option value="">選択してください</option>
              {vehiclesInOffice.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.model}({v.plateNumber})
                </option>
              ))}
            </select>
          </div>
        </Field>

        <div className="flex justify-end gap-2 border-t border-ink-100 pt-4">
          <Button variant="outline" onClick={close}>
            キャンセル
          </Button>
          <Button loading={saving} onClick={handleSave}>
            <Users size={16} /> 追加
          </Button>
        </div>
      </div>
    </Modal>
  );
}
