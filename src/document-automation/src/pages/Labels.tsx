import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Download, Layers, MapPin, Tags, AlertTriangle } from "lucide-react";
import { useStore } from "../store";
import { findAddress } from "../data/seed";
import { fakeApi } from "../lib/fakeApi";
import { Button, Card, EmptyState, Stat } from "../components/ui";

interface Label {
  company: string;
  count: number; // 集約された書類件数
  postal?: string;
  address?: string;
  contact?: string;
  matched: boolean;
}

export default function Labels() {
  const rows = useStore((s) => s.rows);
  const imported = useStore((s) => s.imported);
  const [onlyMatched, setOnlyMatched] = useState(false);
  const [exporting, setExporting] = useState(false);

  const labels = useMemo<Label[]>(() => {
    const map = new Map<string, Label>();
    for (const r of rows) {
      const cur = map.get(r.company);
      if (cur) {
        cur.count += 1;
      } else {
        const addr = findAddress(r.company);
        map.set(r.company, {
          company: r.company,
          count: 1,
          postal: addr?.postal,
          address: addr?.address,
          contact: addr?.contact.split(" ").slice(-2).join(" "),
          matched: !!addr,
        });
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [rows]);

  if (!imported) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={<Tags size={22} />}
          title="まずリストを取り込んでください"
          desc="「取り込み・振り分け」画面でリスト.xlsx を読み込むと、F列の宛先から宛名ラベルを作成します。"
        />
      </div>
    );
  }

  const totalRows = rows.length;
  const unmatched = labels.filter((l) => !l.matched).length;
  const shown = onlyMatched ? labels.filter((l) => l.matched) : labels;

  const onExport = async () => {
    setExporting(true);
    await fakeApi(null, 800);
    setExporting(false);
    toast.success(`宛名ラベルを ${labels.length} 枚出力しました`, {
      description: "A4・44面 ラベル用紙レイアウト",
    });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">宛名ラベル</h1>
          <p className="mt-1 text-sm text-ink-500">
            F列の宛先をもとに作成。宛先が重複する行は
            <span className="font-medium text-ink-700">1枚に集約</span>
            し、住所録から住所を補完します。
          </p>
        </div>
        <Button icon={<Download size={16} />} loading={exporting} onClick={onExport}>
          ラベルPDF出力
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="ラベル枚数（集約後）" value={labels.length} tone="brand" />
        <Stat label="対象行数（集約前）" value={totalRows} sub={`−${totalRows - labels.length} 枚を集約`} />
        <Stat label="住所補完済み" value={labels.length - unmatched} tone="teal" />
        <Stat label="住所未照合" value={unmatched} tone={unmatched ? "amber" : "ink"} />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-ink-600">
          <Layers size={15} className="text-ink-400" />
          重複宛先を自動集約中
        </div>
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={onlyMatched}
            onChange={(e) => setOnlyMatched(e.target.checked)}
            className="size-4 accent-brand-600"
          />
          住所照合済みのみ表示
        </label>
      </div>

      {unmatched > 0 && !onlyMatched && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <p>
            {unmatched} 件の宛先が住所録に未登録です。住所欄が空欄のまま出力されます。住所録エクセルに追加すると自動で補完されます。
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((l, i) => (
          <motion.div
            key={l.company}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 12) * 0.02 }}
          >
            <Card className="relative h-full p-4">
              {l.count > 1 && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-600/20">
                  <Layers size={11} />
                  {l.count}件を集約
                </span>
              )}
              <div className="text-xs text-ink-400">
                {l.matched ? `〒${l.postal}` : "〒 — "}
              </div>
              <div className="mt-0.5 min-h-[36px] text-sm leading-snug text-ink-600">
                {l.matched ? (
                  l.address
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700">
                    <MapPin size={12} />
                    住所未照合（要・住所録追加）
                  </span>
                )}
              </div>
              <p className="mt-3 text-lg font-medium text-ink-900">
                {l.company}　<span className="text-sm text-ink-500">御中</span>
              </p>
              {l.matched && l.contact && (
                <p className="mt-0.5 text-xs text-ink-500">{l.contact} 様</p>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
