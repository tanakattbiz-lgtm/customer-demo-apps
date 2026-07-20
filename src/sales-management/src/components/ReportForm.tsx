import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useStore, repOf, type NewReport } from "../store";
import { Button, Field, inputCls } from "./ui";
import { fakeApi } from "../lib/fakeApi";
import type { Report } from "../data/seed";

type FormState = {
  repId: string;
  date: string;
  visits: string;
  meetings: string;
  proposals: string;
  deals: string;
  amount: string;
  client: string;
  note: string;
};

function toForm(r: Report | null, defaultRepId: string): FormState {
  if (!r)
    return {
      repId: defaultRepId,
      date: format(new Date(), "yyyy-MM-dd"),
      visits: "",
      meetings: "",
      proposals: "",
      deals: "",
      amount: "",
      client: "",
      note: "",
    };
  return {
    repId: r.repId,
    date: r.date,
    visits: String(r.visits),
    meetings: String(r.meetings),
    proposals: String(r.proposals),
    deals: String(r.deals),
    amount: r.amount ? String(r.amount) : "",
    client: r.client,
    note: r.note,
  };
}

export default function ReportForm({
  editing,
  onDone,
}: {
  editing: Report | null;
  onDone: () => void;
}) {
  const reps = useStore((s) => s.reps);
  const currentUserId = useStore((s) => s.currentUserId);
  const me = repOf(reps, currentUserId);
  const isAdmin = me?.role === "管理者";
  const addReport = useStore((s) => s.addReport);
  const updateReport = useStore((s) => s.updateReport);

  // 社員は自分名義のみ。管理者は代理入力で担当者を選べる。
  const defaultRepId = isAdmin ? editing?.repId ?? reps.find((r) => r.role === "社員")!.id : currentUserId;
  const [f, setF] = useState<FormState>(() => toForm(editing, defaultRepId));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (k: keyof FormState, v: string) => setF((s) => ({ ...s, [k]: v }));

  const num = (v: string) => (v.trim() === "" ? 0 : Math.max(0, Math.floor(Number(v))));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!f.date) e.date = "日付を入力してください。";
    const visits = num(f.visits);
    const meetings = num(f.meetings);
    const proposals = num(f.proposals);
    const deals = num(f.deals);
    if ([f.visits, f.meetings, f.proposals, f.deals].some((v) => v !== "" && Number.isNaN(Number(v))))
      e.kpi = "KPI は数値で入力してください。";
    if (meetings > visits) e.meetings = "商談件数は訪問件数を超えられません。";
    if (proposals > meetings) e.proposals = "提案件数は商談件数を超えられません。";
    if (deals > proposals) e.deals = "受注件数は提案件数を超えられません。";
    if (deals > 0 && num(f.amount) <= 0) e.amount = "受注がある場合は金額を入力してください。";
    if (!f.note.trim()) e.note = "所感・活動内容を入力してください。";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error("入力内容を確認してください。");
      return;
    }
    setSaving(true);
    const payload: NewReport = {
      repId: isAdmin ? f.repId : currentUserId,
      date: f.date,
      visits: num(f.visits),
      meetings: num(f.meetings),
      proposals: num(f.proposals),
      deals: num(f.deals),
      amount: num(f.deals) > 0 ? num(f.amount) : 0,
      client: f.client.trim() || "―",
      note: f.note.trim(),
    };
    await fakeApi(true, 620);
    if (editing) {
      updateReport(editing.id, payload);
      toast.success("日報を更新しました");
    } else {
      addReport(payload);
      toast.success("日報を登録しました");
    }
    setSaving(false);
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="日付" required error={errors.date}>
          <input type="date" className={inputCls} value={f.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
        <Field label="担当者" required hint={isAdmin ? "管理者は代理で登録できます" : undefined}>
          {isAdmin ? (
            <select className={inputCls} value={f.repId} onChange={(e) => set("repId", e.target.value)}>
              {reps
                .filter((r) => r.role === "社員")
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}（{r.team}）
                  </option>
                ))}
            </select>
          ) : (
            <input className={inputCls + " bg-ink-50 text-ink-500"} value={me?.name ?? ""} disabled />
          )}
        </Field>
      </div>

      <div>
        <div className="mb-1.5 text-sm font-medium text-ink-700">営業KPI</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <NumField label="訪問" value={f.visits} onChange={(v) => set("visits", v)} />
          <NumField label="商談" value={f.meetings} onChange={(v) => set("meetings", v)} error={errors.meetings} />
          <NumField label="提案" value={f.proposals} onChange={(v) => set("proposals", v)} error={errors.proposals} />
          <NumField label="受注" value={f.deals} onChange={(v) => set("deals", v)} error={errors.deals} />
        </div>
        {errors.kpi && <p className="mt-1 text-xs text-rose-600">{errors.kpi}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="受注金額（円）" error={errors.amount} hint="受注件数が1以上のとき必須">
          <input
            type="number"
            inputMode="numeric"
            className={inputCls}
            placeholder="例）1200000"
            value={f.amount}
            onChange={(e) => set("amount", e.target.value)}
          />
        </Field>
        <Field label="主要商談先">
          <input
            className={inputCls}
            placeholder="例）みらいフーズ株式会社"
            value={f.client}
            onChange={(e) => set("client", e.target.value)}
          />
        </Field>
      </div>

      <Field label="所感・活動内容" required error={errors.note}>
        <textarea
          className={inputCls + " min-h-24 resize-y"}
          placeholder="本日の活動内容・所感・次のアクションを記入します。"
          value={f.note}
          onChange={(e) => set("note", e.target.value)}
        />
      </Field>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onDone}>
          キャンセル
        </Button>
        <Button type="submit" loading={saving}>
          {editing ? "更新する" : "登録する"}
        </Button>
      </div>
    </form>
  );
}

function NumField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink-500">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        className={
          "tnum w-full rounded-xl border bg-white px-3 py-2 text-center text-sm outline-none transition focus:ring-2 focus:ring-brand-400/25 " +
          (error ? "border-rose-300 focus:border-rose-400" : "border-ink-200 focus:border-brand-400")
        }
        placeholder="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
