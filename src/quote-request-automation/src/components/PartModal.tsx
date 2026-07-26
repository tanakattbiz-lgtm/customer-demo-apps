import { useState } from "react";
import { toast } from "sonner";
import type { Part } from "../data/seed";
import { MATERIALS, UNITS } from "../data/seed";
import { useStore } from "../store";
import { Modal, Button, Field, inputCls } from "./ui";
import { fakeApi } from "../lib/fakeApi";
import { format } from "date-fns";

interface Form {
  name: string;
  material: string;
  qty: string;
  unit: string;
  drawingNo: string;
  dueDate: string;
}

const toDateInput = (iso: string) => format(new Date(iso), "yyyy-MM-dd");

export default function PartModal({
  open,
  onClose,
  projectId,
  edit,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  edit?: Part;
}) {
  const addPart = useStore((s) => s.addPart);
  const updatePart = useStore((s) => s.updatePart);
  const drawingFolder = useStore((s) => s.drawingFolder);

  const [f, setF] = useState<Form>(() => ({
    name: edit?.name ?? "",
    material: edit?.material ?? MATERIALS[0],
    qty: edit ? String(edit.qty) : "1",
    unit: edit?.unit ?? UNITS[0],
    drawingNo: edit?.drawingNo ?? "",
    dueDate: toDateInput(edit?.dueDate ?? new Date().toISOString()),
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((cur) => ({ ...cur, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!f.name.trim()) e.name = "部品名を入力してください";
    if (!f.drawingNo.trim()) e.drawingNo = "図番を入力してください";
    const qtyNum = Number(f.qty);
    if (!f.qty.trim() || Number.isNaN(qtyNum) || qtyNum <= 0) e.qty = "1以上の数量を入力してください";
    if (!f.dueDate) e.dueDate = "希望納期を選択してください";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: f.name.trim(),
      material: f.material,
      qty: Number(f.qty),
      unit: f.unit,
      drawingNo: f.drawingNo.trim().toUpperCase(),
      dueDate: new Date(f.dueDate).toISOString(),
    };
    await fakeApi(true, 380);
    if (edit) {
      updatePart(edit.id, payload);
      toast.success("部品を更新しました");
    } else {
      addPart({ ...payload, projectId, supplierIds: [] });
      toast.success("部品を追加しました");
    }
    setSaving(false);
    onClose();
  };

  const drawingFound = f.drawingNo.trim() && (drawingFolder[f.drawingNo.trim().toUpperCase()]?.length ?? 0) > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={edit ? "部品を編集" : "部品を追加"}
      subtitle="見積依頼シートの1行を登録します"
      width={560}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={onSubmit} loading={saving}>
            {edit ? "更新する" : "追加する"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="部品名" required error={errors.name}>
          <input
            className={inputCls}
            placeholder="例: メインフレーム"
            value={f.name}
            onChange={(e) => set("name", e.target.value)}
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="材質" required>
            <select className={inputCls} value={f.material} onChange={(e) => set("material", e.target.value)}>
              {MATERIALS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-[1fr_88px] gap-2">
            <Field label="数量" required error={errors.qty}>
              <input
                className={inputCls}
                inputMode="numeric"
                value={f.qty}
                onChange={(e) => set("qty", e.target.value.replace(/[^0-9]/g, ""))}
              />
            </Field>
            <Field label="単位">
              <select className={inputCls} value={f.unit} onChange={(e) => set("unit", e.target.value)}>
                {UNITS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="図番"
            required
            error={errors.drawingNo}
            hint={
              f.drawingNo.trim()
                ? drawingFound
                  ? "✓ 図面フォルダに一致するファイルあり"
                  : "図面フォルダに該当ファイルが見つかりません"
                : "図面フォルダ検索のキーになります"
            }
          >
            <input
              className={inputCls + " tnum uppercase"}
              placeholder="例: AP-2041"
              value={f.drawingNo}
              onChange={(e) => set("drawingNo", e.target.value)}
            />
          </Field>
          <Field label="希望納期" required error={errors.dueDate}>
            <input
              className={inputCls}
              type="date"
              value={f.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
            />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
