import { useMemo, useState } from "react";
import { Check, Search, Sparkle, Building2 } from "lucide-react";
import type { Part, Supplier } from "../data/seed";
import { useStore } from "../store";
import { Modal, Button, Pill, inputCls } from "./ui";

const MAX = 3;

/** 材質から、その材質を得意とする加工会社かどうかを判定(サジェスト用) */
function matches(supplier: Supplier, material: string): boolean {
  const m = material.toLowerCase();
  return supplier.specialties.some((sp) => {
    const s = sp.toLowerCase();
    if (m.includes("sus") || material.includes("ステンレス")) return s.includes("ステンレス");
    if (material.includes("アルミ")) return s.includes("アルミ");
    if (material.includes("樹脂")) return s.includes("樹脂");
    if (material.includes("鋳物") || m.includes("fc")) return s.includes("鋳物");
    if (m.includes("ss") || m.includes("s45c")) return s.includes("鉄");
    return false;
  });
}

export default function SupplierPicker({
  part,
  open,
  onClose,
}: {
  part: Part;
  open: boolean;
  onClose: () => void;
}) {
  const suppliers = useStore((s) => s.suppliers);
  const setPartSuppliers = useStore((s) => s.setPartSuppliers);
  const [sel, setSel] = useState<string[]>(part.supplierIds);
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const query = q.trim();
    const filtered = suppliers.filter(
      (s) => !query || s.name.includes(query) || s.specialties.some((sp) => sp.includes(query)),
    );
    // サジェスト(材質一致)を上に
    return [...filtered].sort((a, b) => Number(matches(b, part.material)) - Number(matches(a, part.material)));
  }, [suppliers, q, part.material]);

  const toggle = (id: string) => {
    setSel((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= MAX) return cur;
      return [...cur, id];
    });
  };

  const onSave = () => {
    setPartSuppliers(part.id, sel);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="見積依頼先を選定"
      subtitle={`${part.name}（${part.material}） — 最大${MAX}社`}
      width={560}
      footer={
        <>
          <span className="mr-auto text-xs text-ink-400">
            選択中 <span className="tnum font-semibold text-ink-700">{sel.length}</span> / {MAX} 社
          </span>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={onSave}>この{sel.length}社で確定</Button>
        </>
      }
    >
      <div className="relative mb-3">
        <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" />
        <input
          className={inputCls + " pl-9"}
          placeholder="会社名・加工分野で検索"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {list.map((s) => {
          const active = sel.includes(s.id);
          const suggested = matches(s, part.material);
          const full = !active && sel.length >= MAX;
          return (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              disabled={full}
              className={
                "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition " +
                (active
                  ? "border-brand-300 bg-brand-50"
                  : full
                    ? "cursor-not-allowed border-ink-100 bg-ink-50 opacity-55"
                    : "border-ink-200 bg-white hover:border-brand-200 hover:bg-brand-50/40")
              }
            >
              <span
                className={
                  "grid h-9 w-9 shrink-0 place-items-center rounded-lg " +
                  (active ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-500")
                }
              >
                {active ? <Check size={18} /> : <Building2 size={17} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-ink-900">{s.name}</span>
                  {suggested && (
                    <Pill tone="green" className="shrink-0">
                      <Sparkle size={11} /> 材質適合
                    </Pill>
                  )}
                </span>
                <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
                  <span>{s.specialties.join("・")}</span>
                  <span className="text-ink-300">|</span>
                  <span className="tnum">回答目安 {s.leadDays}営業日</span>
                  <span className="text-ink-300">|</span>
                  <span className="tnum">実績 {s.orders}件</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
