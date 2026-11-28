import { useEffect, useMemo, useState } from "react";
import { useStageText } from "../lib/stages";
import { addDays, format } from "date-fns";
import { toast } from "sonner";
import { useStore, uid } from "../store";
import {
  ACTIVITY_TYPES,
  AREAS,
  CHANNELS,
  CHANNEL_GROUPS,
  INDUSTRY_GROUPS,
  industryLabel,
  industryMajor,
  CONTRACT_KINDS,
  MIKOMI_DEF,
  AGENCY_NOTE,
  channelGroup,
  channelNeedsNote,
  channelNoteLabel,
  type ContractKind,
  FACE_COUNT_LABEL,
  HEIGHT_CLASSES,
  LAND_TYPES,
  ME_ID,
  OPEN_STAGES,
  SIGN_TYPES,
  STAFF,
  STAGE_NO,
  type Channel,
  type HeightClass,
  type LandType,
  type SignType,
  type ActivityType,
  type Area,
  type Board,
  type Customer,
  type CustomerStatus,
  type Deal,
  type Face,
  type Rank,
  type Stage,
} from "../data/seed";
import { fakeApi } from "../lib/fakeApi";
import { addMonthKey, fmtMonth, fmtPeriod, monthRange, thisMonth, todayISO, yen } from "../lib/format";
import { buildIndex, isFree } from "../lib/domain";
import { Button, Field, Modal, Segmented, errCls, inputCls, textareaCls } from "./ui";
import { QTag } from "./tags";

const inDays = (n: number) => format(addDays(new Date(), n), "yyyy-MM-dd");

// =============== 活動記録(+ 次回対応の更新) ===============
export function ActivityModal({
  open,
  onClose,
  customerId,
  dealId,
  title,
}: {
  open: boolean;
  onClose: () => void;
  customerId: string;
  dealId?: string;
  title?: string;
}) {
  const addActivity = useStore((s) => s.addActivity);
  const deal = useStore((s) => s.deals.find((d) => d.id === dealId));
  const [type, setType] = useState<ActivityType>("訪問");
  const [date, setDate] = useState("");
  const [memo, setMemo] = useState("");
  const [nextOn, setNextOn] = useState(true);
  const [nextDate, setNextDate] = useState("");
  const [nextContent, setNextContent] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setType("訪問");
    setDate(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    setMemo("");
    setNextOn(!!dealId);
    setNextDate(inDays(7));
    setNextContent("");
    setTouched(false);
  }, [open, dealId]);

  const errs = {
    memo: memo.trim().length < 4 ? "対応内容を4文字以上で入力してください" : "",
    nextDate: nextOn && !nextDate ? "日付を選択してください" : nextOn && nextDate < todayISO() ? "今日以降の日付を選択してください" : "",
    nextContent: nextOn && !nextContent.trim() ? "次回の対応内容を入力してください" : "",
  };
  const invalid = Object.values(errs).some(Boolean);

  const submit = async () => {
    setTouched(true);
    if (invalid) return;
    setBusy(true);
    await fakeApi(null);
    addActivity(
      { id: uid("a"), customerId, dealId, type, date: date + ":00", memo: memo.trim(), repId: ME_ID },
      dealId ? (nextOn ? { date: nextDate, content: nextContent.trim() } : null) : undefined,
    );
    setBusy(false);
    toast.success("営業活動を記録しました", {
      description: nextOn && dealId ? `次回対応: ${nextDate.replaceAll("-", "/")} ${nextContent}` : undefined,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="営業活動を記録"
      sub={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button data-tour="act-submit" onClick={submit} loading={busy}>
            記録する
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {deal?.nextAction && (
          <div className="rounded-md border border-navy-100 bg-navy-50 px-3.5 py-2.5 text-[14px] text-navy-800">
            予定していた対応: {deal.nextAction.content}
          </div>
        )}
        <div>
          <div className="mb-1.5 text-[13px] font-medium text-ink-600">種別</div>
          <Segmented value={type} onChange={setType} items={ACTIVITY_TYPES.map((t) => ({ value: t, label: t }))} />
        </div>
        <Field label="日時" required>
          <input type="datetime-local" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="対応内容" required error={touched ? errs.memo : ""}>
          <textarea
            data-tour="act-memo"
            className={textareaCls + (touched && errs.memo ? errCls : "")}
            placeholder="例: 決裁者同席で提案。予算は月額20万円前後で調整可能とのこと。"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </Field>
        {dealId && (
          <div className="rounded-md border border-ink-200 p-4">
            <label className="flex items-center gap-2 text-[15px] font-medium text-navy-900">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[oklch(29.5%_0.047_262)]"
                checked={nextOn}
                onChange={(e) => setNextOn(e.target.checked)}
              />
              次回対応を設定する
            </label>
            {nextOn && (
              <div className="mt-3 grid gap-3 sm:grid-cols-[160px_1fr]">
                <Field label="予定日" required error={touched ? errs.nextDate : ""}>
                  <input
                    type="date"
                    className={inputCls + (touched && errs.nextDate ? errCls : "")}
                    value={nextDate}
                    onChange={(e) => setNextDate(e.target.value)}
                  />
                </Field>
                <Field label="内容" required error={touched ? errs.nextContent : ""}>
                  <input
                    data-tour="act-next"
                    className={inputCls + (touched && errs.nextContent ? errCls : "")}
                    placeholder="例: 見積書の回答確認"
                    value={nextContent}
                    onChange={(e) => setNextContent(e.target.value)}
                  />
                </Field>
                <div className="flex flex-wrap gap-1.5 sm:col-span-2">
                  {[
                    ["明日", 1],
                    ["3日後", 3],
                    ["1週間後", 7],
                    ["2週間後", 14],
                  ].map(([l, n]) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setNextDate(inDays(n as number))}
                      className="rounded border border-ink-200 px-2 py-1 text-[12.5px] text-ink-600 transition hover:border-navy-300 hover:text-navy-900"
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

// =============== 次回対応の変更 ===============
export function NextActionModal({ open, onClose, deal }: { open: boolean; onClose: () => void; deal?: Deal }) {
  const setNextAction = useStore((s) => s.setNextAction);
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (!open || !deal) return;
    setDate(deal.nextAction?.date ?? inDays(3));
    setContent(deal.nextAction?.content ?? "");
    setTouched(false);
  }, [open, deal]);
  const err = { date: !date ? "日付を選択してください" : "", content: !content.trim() ? "内容を入力してください" : "" };
  const submit = async () => {
    setTouched(true);
    if (err.date || err.content || !deal) return;
    setBusy(true);
    await fakeApi(null, 300);
    setNextAction(deal.id, { date, content: content.trim() });
    setBusy(false);
    toast.success("次回対応を更新しました");
    onClose();
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="次回対応を設定"
      width={460}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={submit} loading={busy}>
            保存する
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="予定日" required error={touched ? err.date : ""}>
          <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="内容" required error={touched ? err.content : ""}>
          <input className={inputCls + (touched && err.content ? errCls : "")} value={content} onChange={(e) => setContent(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

// =============== 見込案件(商談) 作成・編集 ===============
const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));
const strOf = (v: number | null | undefined) => (v === null || v === undefined ? "" : String(v));

/** クライアントの検索選択(項目定義 I01: 既存顧客は検索選択。同じ名前だけで統合しない) */
export function CustomerPicker({
  value,
  onChange,
  disabled,
  error,
}: {
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  const customers = useStore((s) => s.customers);
  const saveCustomer = useStore((s) => s.saveCustomer);
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [nc, setNc] = useState({ company: "", industry: "", contact: "", phone: "", address: "" });
  const [ncTouched, setNcTouched] = useState(false);
  const selected = customers.find((c) => c.id === value);
  const startAdd = () => {
    setNc({ company: q.trim(), industry: "", contact: "", phone: "", address: "" });
    setNcTouched(false);
    setAdding(true);
  };
  // 似た名前のクライアント(重複登録の注意)
  const similar = nc.company.trim().length >= 2 ? customers.filter((c) => c.company.includes(nc.company.trim().replace(/^(株式会社|有限会社|医療法人)\s*/, ""))).slice(0, 3) : [];
  const addNow = () => {
    setNcTouched(true);
    if (!nc.company.trim()) return;
    const id = uid("c");
    saveCustomer({
      id,
      createdAt: todayISO(),
      company: nc.company.trim(),
      industry: nc.industry,
      contact: nc.contact.trim(),
      contactTitle: "",
      phone: nc.phone.trim(),
      email: "",
      address: nc.address.trim(),
      area: "大阪",
      rank: "B",
      status: "商談中",
      source: "",
      repId: ME_ID,
      memo: "",
    } as Customer);
    toast.success("クライアントを登録しました", { description: "残りの情報は、あとからクライアントの画面で足せます。" });
    setAdding(false);
    setQ("");
    onChange(id);
  };
  const list = useMemo(() => {
    const kw = q.trim();
    return [...customers]
      .filter((c) => !kw || c.company.includes(kw) || c.contact.includes(kw) || c.phone.includes(kw))
      .sort((a, b) => Number(b.repId === ME_ID) - Number(a.repId === ME_ID) || a.company.localeCompare(b.company, "ja"))
      .slice(0, 8);
  }, [customers, q]);
  if (selected)
    return (
      <div className={"flex min-h-11 items-center justify-between gap-2 rounded-md border px-3 py-2 " + (disabled ? "border-ink-200 bg-ink-50" : "border-navy-200 bg-navy-50/50")}>
        <div className="min-w-0">
          <div className="truncate text-[15px] font-medium text-navy-900">{selected.company}</div>
          <div className="truncate text-[12.5px] text-ink-500">
            {industryLabel(selected.industry)} ・ {selected.address} ・ 担当 {STAFF.find((x) => x.id === selected.repId)?.name}
          </div>
        </div>
        {!disabled && (
          <button type="button" onClick={() => onChange("")} className="shrink-0 rounded px-2 py-1 text-[13px] text-navy-700 hover:bg-white">
            変更
          </button>
        )}
      </div>
    );
  if (adding)
    return (
      <div className="rounded-md border border-navy-200 bg-navy-50/40 p-3.5">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[14px] font-semibold text-navy-900">新しいクライアントを登録</span>
          <button type="button" onClick={() => setAdding(false)} className="rounded px-2 py-1 text-[13px] text-navy-700 hover:bg-white">
            検索に戻る
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="会社名・屋号" required error={ncTouched && !nc.company.trim() ? "会社名・屋号を入力してください" : ""} className="sm:col-span-2">
            <input className={inputCls} autoFocus placeholder="例: 株式会社なにわ住建" value={nc.company} onChange={(e) => setNc({ ...nc, company: e.target.value })} />
          </Field>
          <Field label="業種">
            <IndustrySelect value={nc.industry} onChange={(v) => setNc({ ...nc, industry: v })} />
          </Field>
          <Field label="先方担当者">
            <input className={inputCls} placeholder="分かれば" value={nc.contact} onChange={(e) => setNc({ ...nc, contact: e.target.value })} />
          </Field>
          <Field label="電話番号">
            <input className={inputCls + " tnum"} placeholder="分かれば" value={nc.phone} onChange={(e) => setNc({ ...nc, phone: e.target.value })} />
          </Field>
          <Field label="所在地・店舗">
            <input className={inputCls} placeholder="分かれば" value={nc.address} onChange={(e) => setNc({ ...nc, address: e.target.value })} />
          </Field>
        </div>
        {similar.length > 0 && (
          <div className="mt-2.5 rounded-md border border-warn-300 bg-warn-50 px-3 py-2 text-[13px] text-warn-700">
            似た名前のクライアントがあります。同じ会社なら、こちらを選んでください：
            {similar.map((c) => (
              <button key={c.id} type="button" onClick={() => { setAdding(false); onChange(c.id); }} className="ml-1.5 font-medium underline">
                {c.company}
              </button>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[12px] text-ink-500">会社名だけで登録できます。残りはあとから足せます。</span>
          <Button size="sm" onClick={addNow}>
            登録してこの見込案件に使う
          </Button>
        </div>
      </div>
    );
  return (
    <div>
      <input
        className={inputCls + (error ? errCls : "")}
        placeholder="会社名・担当者名・電話番号で検索"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="thin-scroll mt-1.5 max-h-52 overflow-y-auto rounded-md border border-ink-200">
        {list.length === 0 ? (
          <div className="px-3 py-3 text-[13.5px] text-ink-500">該当するクライアントがいません。</div>
        ) : (
          list.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => onChange(c.id)}
              className="flex min-h-11 w-full items-center justify-between gap-2 border-b border-ink-100 px-3 py-2 text-left last:border-0 hover:bg-navy-50"
            >
              <span className="min-w-0">
                <span className="block truncate text-[14.5px] text-ink-900">{c.company}</span>
                <span className="block truncate text-[12px] text-ink-500">
                  {c.contact} ・ {c.phone}
                </span>
              </span>
              <span className="shrink-0 text-[12px] text-ink-400">{c.status}</span>
            </button>
          ))
        )}
      </div>
      <button
        type="button"
        onClick={startAdd}
        className="mt-1.5 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-navy-300 text-[14px] font-medium text-navy-700 hover:bg-navy-50"
      >
        ＋ {q.trim() ? `「${q.trim()}」を新しいクライアントとして登録` : "新しいクライアントを登録"}
      </button>
    </div>
  );
}

/** 業種の選択(中部門を1つ選ぶと、大部門は自動。空欄は「未確認」) */
export function IndustrySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">未確認(あとで入れる)</option>
        {INDUSTRY_GROUPS.map((g) => (
          <optgroup key={g.major} label={g.major}>
            {g.items.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <div className="mt-1 text-[12px] text-ink-400">大部門: {value ? industryMajor(value) : "—"}(自動) ・ 広告を掲載する店舗・施設の主な事業内容で選びます</div>
    </div>
  );
}

/** 押しやすい選択ボタン(iPadで指で選ぶ前提) */
export function ChoiceButtons<T extends string | number>({
  value,
  onChange,
  items,
  allowEmpty,
}: {
  value: T | null;
  onChange: (v: T | null) => void;
  items: { value: T; label: string; sub?: string }[];
  allowEmpty?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => {
        const on = value === it.value;
        return (
          <button
            type="button"
            key={String(it.value)}
            onClick={() => onChange(on && allowEmpty ? null : it.value)}
            className={
              "min-h-11 rounded-md border px-3.5 py-2 text-left text-[14.5px] transition " +
              (on ? "border-navy-900 bg-navy-900 text-white" : "border-ink-300 bg-white text-ink-700 hover:border-navy-300")
            }
          >
            <span className="block leading-tight">{it.label}</span>
            {it.sub && <span className={"mt-0.5 block text-[12px] leading-snug " + (on ? "text-white/75" : "text-ink-400")}>{it.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}

function MoneyInput({ value, onChange, placeholder, invalid }: { value: string; onChange: (v: string) => void; placeholder?: string; invalid?: boolean }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[14px] text-ink-400">¥</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        step={1000}
        className={inputCls + " tnum pl-7!" + (invalid ? errCls : "")}
        placeholder={placeholder ?? "未入力"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** フォームの区切り(描画のたびに作り直さないよう、コンポーネントの外に置く) */
export function Sec({ title, q, children }: { title: string; q?: string[]; children: React.ReactNode }) {
  return (
    <section className="border-t border-ink-100 pt-4 first:border-0 first:pt-0">
      <div className="mb-3 flex flex-wrap items-center gap-1.5 text-[14.5px] font-semibold text-navy-900">
        {title}
        {q?.map((x) => <QTag key={x} id={x} />)}
      </div>
      {children}
    </section>
  );
}

export function DealFormModal({
  open,
  onClose,
  deal,
  customerId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  deal?: Deal;
  customerId?: string;
  onSaved?: (id: string) => void;
}) {
  const { label: stageLabel, def: stageDef } = useStageText();
  const customers = useStore((s) => s.customers);
  const deals = useStore((s) => s.deals);
  const saveDeal = useStore((s) => s.saveDeal);
  const blank = {
    customerId: "",
    title: "",
    stage: "商談初期" as Stage,
    monthlyBudget: "",
    makeupFee: "",
    landRent: "",
    months: "12",
    expectedClose: "",
    noClose: false,
    repId: ME_ID,
    nextDate: "",
    nextContent: "",
    widthMm: "",
    heightMm: "",
    faceCount: null as number | null,
    heightClass: null as HeightClass | null,
    signType: null as SignType | null,
    landType: null as LandType | null,
    channel: "飛び込み訪問" as Channel | null,
    channelNote: "",
    contractKind: "新規" as ContractKind | null,
    investment: false,
    notes: "",
  };
  const [f, setF] = useState(blank);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open) return;
    setTouched(false);
    setF(
      deal
        ? {
            ...blank,
            customerId: deal.customerId,
            title: deal.title,
            stage: deal.stage,
            monthlyBudget: strOf(deal.monthlyBudget),
            makeupFee: strOf(deal.makeupFee),
            landRent: strOf(deal.landRent),
            months: String(deal.months),
            expectedClose: deal.expectedClose,
            noClose: !deal.expectedClose,
            repId: deal.repId,
            widthMm: strOf(deal.widthMm),
            heightMm: strOf(deal.heightMm),
            faceCount: deal.faceCount,
            heightClass: deal.heightClass,
            signType: deal.signType,
            landType: deal.landType,
            channel: deal.channel,
            channelNote: deal.channelNote ?? "",
            contractKind: deal.contractKind ?? "新規",
            investment: deal.investment,
            notes: deal.notes,
          }
        : { ...blank, customerId: customerId ?? "", nextDate: inDays(3) },
    );
  }, [open, deal, customerId]);
  const set = <K extends keyof typeof f>(k: K) => (v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const ev = (k: "title" | "expectedClose" | "nextDate" | "nextContent" | "widthMm" | "heightMm" | "months" | "repId" | "notes") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  const ad = numOrNull(f.monthlyBudget);
  const makeup = numOrNull(f.makeupFee);
  const rent = numOrNull(f.landRent);
  const neg = (v: number | null) => v !== null && !(v >= 0);
  const errs = {
    customerId: !f.customerId ? "クライアントを選択してください" : "",
    title: !f.title.trim() ? "案件名を入力してください" : "",
    monthlyBudget: neg(ad) ? "0以上の金額を入力してください" : "",
    makeupFee: neg(makeup) ? "0以上の金額を入力してください" : "",
    landRent: neg(rent) ? "0以上の金額を入力してください" : "",
    channelNote: channelNeedsNote(f.channel) && !f.channelNote.trim() ? `${channelNoteLabel(f.channel)}を入力してください` : "",
    size: (f.widthMm && !(Number(f.widthMm) > 0)) || (f.heightMm && !(Number(f.heightMm) > 0)) ? "寸法は正の数(mm)で入力してください" : "",
  };
  const invalid = Object.values(errs).some(Boolean);
  const ratio = ad && rent !== null ? rent / (ad * 12) : null;
  const customer = customers.find((c) => c.id === f.customerId);
  // 重複訪問の防止: 同じクライアントの進行中の見込案件を、ほかの担当者が持っていないか
  const others = deals.filter(
    (d) => d.customerId === f.customerId && d.id !== deal?.id && OPEN_STAGES.includes(d.stage) && d.repId !== f.repId,
  );
  const rep = STAFF.find((x) => x.id === f.repId);

  const submit = async () => {
    setTouched(true);
    if (invalid) return;
    setBusy(true);
    await fakeApi(null);
    const id = deal?.id ?? uid("d");
    saveDeal({
      ...(deal ?? { createdAt: todayISO(), nextAction: null }),
      id,
      customerId: f.customerId,
      title: f.title.trim(),
      stage: f.stage,
      monthlyBudget: ad,
      makeupFee: makeup,
      landRent: rent,
      months: Number(f.months),
      expectedClose: f.expectedClose,
      repId: f.repId,
      widthMm: numOrNull(f.widthMm),
      heightMm: numOrNull(f.heightMm),
      faceCount: f.faceCount,
      heightClass: f.heightClass,
      signType: f.signType,
      landType: f.landType,
      channel: f.channel,
      channelNote: channelNeedsNote(f.channel) ? f.channelNote.trim() : "",
      contractKind: f.contractKind,
      investment: f.investment,
      notes: f.notes.trim(),
      nextAction: deal ? deal.nextAction : f.nextDate && f.nextContent.trim() ? { date: f.nextDate, content: f.nextContent.trim() } : null,
      updatedAt: todayISO(),
    } as Deal);
    setBusy(false);
    toast.success(deal ? "見込案件を更新しました" : "見込案件を登録しました");
    onClose();
    onSaved?.(id);
  };
  const err = (k: keyof typeof errs) => (touched ? errs[k] : "");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={deal ? "見込案件を編集" : "見込案件を登録"}
      sub="一度登録した内容は、契約締結・設置・解約まで引き継がれます。分からない項目は空欄のままで登録できます。"
      width={720}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button data-tour="deal-submit" onClick={submit} loading={busy}>
            {deal ? "保存する" : "登録する"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Sec title="クライアントと案件">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-ink-600">
                クライアント <span className="text-[11.5px] font-normal text-bad-500">必須</span>
              </div>
              <CustomerPicker value={f.customerId} onChange={set("customerId")} disabled={!!deal} error={!!err("customerId")} />
              {err("customerId") && <div className="mt-1 text-[12.5px] text-bad-600">{err("customerId")}</div>}
              {others.length > 0 && (
                <div className="mt-2 rounded-md border border-warn-300 bg-warn-50 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-warn-700">
                  このクライアントには、ほかの担当者の見込案件があります(重複訪問に注意):
                  {others.map((o) => (
                    <span key={o.id} className="ml-1 font-medium">
                      {STAFF.find((x) => x.id === o.repId)?.name}({STAFF.find((x) => x.id === o.repId)?.branch}・{STAGE_NO[o.stage]}{o.stage})
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Field label="案件名" required error={err("title")}>
              <input className={inputCls + (err("title") ? errCls : "")} placeholder="例: 新店オープン告知" value={f.title} onChange={ev("title")} />
            </Field>
            <Field label="業種" hint="クライアントの情報から自動で入ります(業種マスター)">
              <input className={inputCls + " bg-ink-50"} value={customer ? industryLabel(customer.industry) : ""} placeholder="クライアントを選ぶと入ります" readOnly />
            </Field>
            <Field label="営業担当者" hint={rep ? `所属: ${rep.area} / ${rep.branch}(自動)` : undefined}>
              <select className={inputCls} value={f.repId} onChange={ev("repId")}>
                {STAFF.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}({s.branch})
                  </option>
                ))}
              </select>
            </Field>
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-ink-600">
                商談のきっかけ
                <span className="text-[12px] font-normal text-ink-400">大分類: {channelGroup(f.channel)}(自動)</span>
              </div>
              <select className={inputCls} value={f.channel ?? ""} onChange={(e) => set("channel")((e.target.value || null) as Channel | null)}>
                {CHANNEL_GROUPS.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.items.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-400">今回の商談につながった、最初のきっかけを選びます。LPの問い合わせのあとコールセンターが対応した場合は「LPからの問い合わせ」です。</p>
              {channelNeedsNote(f.channel) && (
                <input
                  className={inputCls + " mt-2" + (err("channelNote") ? errCls : "")}
                  placeholder={channelNoteLabel(f.channel)}
                  value={f.channelNote}
                  onChange={(e) => set("channelNote")(e.target.value)}
                />
              )}
              {err("channelNote") && <div className="mt-1 text-[12.5px] text-bad-600">{err("channelNote")}</div>}
            </div>
            <div>
              <div className="mb-1.5 text-[13px] font-medium text-ink-600">契約区分・案件の種類</div>
              <Segmented value={f.contractKind ?? "新規"} onChange={(v) => set("contractKind")(v as ContractKind)} items={CONTRACT_KINDS.map((k) => ({ value: k, label: k }))} />
              <p className="mt-1 text-[12px] leading-relaxed text-ink-400">追加注文は「追加」にします(きっかけとは別)。</p>
              <label className="mt-2 flex items-center gap-2 text-[14px] text-ink-700">
                <input type="checkbox" className="h-5 w-5 accent-[oklch(29.5%_0.047_262)]" checked={f.investment} onChange={(e) => set("investment")(e.target.checked)} />
                投資看板の案件
              </label>
            </div>
          </div>
        </Sec>

        <Sec title="見込案件の段階" q={["Q02"]}>
          <div className="mb-3 rounded-md border border-navy-100 bg-navy-50/60 px-3.5 py-2.5 text-[13px] leading-relaxed text-navy-800">
            <span className="font-semibold">見込案件とは：</span>
            {MIKOMI_DEF}
            <details className="mt-1">
              <summary className="cursor-pointer text-[12.5px] text-navy-600">広告代理店経由の案件の場合</summary>
              <div className="mt-1 text-[12.5px]">{AGENCY_NOTE}</div>
            </details>
          </div>
          <ChoiceButtons
            value={f.stage}
            onChange={(v) => v && set("stage")(v)}
            items={OPEN_STAGES.map((s) => ({ value: s, label: `${STAGE_NO[s]} ${stageLabel(s)}`, sub: stageDef(s) }))}
          />
          <div className="mt-3 grid gap-3 sm:grid-cols-[220px_1fr] sm:items-start">
            <Field label="契約締結予定日">
              <input type="date" className={inputCls} value={f.expectedClose} onChange={ev("expectedClose")} />
            </Field>
            <div className="rounded-md bg-ink-50 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink-600">
              {f.stage === "商談初期"
                ? "商談初期：任意。分からなければ空欄で構いません。"
                : f.stage === "具体提案中"
                  ? "具体提案中：見通しが立った時点で入れます。"
                  : "契約最終調整：入力・見直しが原則です。先方の回答待ちなどで分からなければ空欄も可。"}
              <span className="mt-0.5 block text-ink-500">見通しであり確約ではありません。空欄の案件は「締結時期未定」として表示します。月ごとの集計は、この日付から自動で行います。</span>
              {f.expectedClose && (
                <button type="button" onClick={() => set("expectedClose")("")} className="mt-1 text-[12.5px] text-navy-700 underline">
                  空欄に戻す
                </button>
              )}
            </div>
          </div>
        </Sec>

        <Sec title="金額(税抜)" q={["Q05"]}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="広告料(月額)" error={err("monthlyBudget")} hint="年払いは12で割った月額を入れます。折半の案件は、クライアント担当者が全額を入れます">
              <MoneyInput value={f.monthlyBudget} onChange={set("monthlyBudget")} invalid={!!err("monthlyBudget")} />
            </Field>
            <Field label="化粧料" error={err("makeupFee")}>
              <MoneyInput value={f.makeupFee} onChange={set("makeupFee")} invalid={!!err("makeupFee")} />
            </Field>
            <Field label="地代(年額・税換算なし)" error={err("landRent")}>
              <MoneyInput value={f.landRent} onChange={set("landRent")} invalid={!!err("landRent")} />
            </Field>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-md bg-ink-50 px-3.5 py-2.5 text-[13.5px] text-ink-600">
            <span>空欄は「未入力」、0円のときは 0 を入力します(集計で区別します)。</span>
            <span>
              地代比率 <span className="tnum font-semibold text-navy-900">{ratio === null ? "計算不可" : (ratio * 100).toFixed(1) + "%"}</span>
              <span className="ml-1 text-[12px] text-ink-400">= 地代 ÷(広告料 × 12)</span>
            </span>
          </div>
        </Sec>

        <Sec title="看板" q={["Q03"]}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="看板の区分">
              <select className={inputCls} value={f.signType ?? ""} onChange={(e) => set("signType")((e.target.value || null) as SignType | null)}>
                <option value="">未選択</option>
                {SIGN_TYPES.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="土地の区分">
              <select className={inputCls} value={f.landType ?? ""} onChange={(e) => set("landType")((e.target.value || null) as LandType | null)}>
                <option value="">未選択</option>
                {LAND_TYPES.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="横幅(mm)" error={err("size")}>
              <input type="number" inputMode="numeric" className={inputCls + " tnum"} placeholder="例: 6000" value={f.widthMm} onChange={ev("widthMm")} />
            </Field>
            <Field label="縦幅(mm)">
              <input type="number" inputMode="numeric" className={inputCls + " tnum"} placeholder="例: 3000" value={f.heightMm} onChange={ev("heightMm")} />
            </Field>
            <div>
              <div className="mb-1.5 text-[13px] font-medium text-ink-600">面数</div>
              <ChoiceButtons allowEmpty value={f.faceCount} onChange={set("faceCount")} items={[1, 2, 3, 4].map((n) => ({ value: n, label: FACE_COUNT_LABEL[n] }))} />
            </div>
            <div>
              <div className="mb-1.5 text-[13px] font-medium text-ink-600">高さ区分</div>
              <ChoiceButtons allowEmpty value={f.heightClass} onChange={set("heightClass")} items={HEIGHT_CLASSES.map((h) => ({ value: h, label: h }))} />
            </div>
          </div>
        </Sec>

        <Sec title="その他">
          <div className="grid gap-4 sm:grid-cols-2">
            {!deal && (
              <>
                <Field label="次回対応日">
                  <input type="date" className={inputCls} value={f.nextDate} onChange={ev("nextDate")} />
                </Field>
                <Field label="次回対応の内容">
                  <input className={inputCls} placeholder="例: 責任者と初回面談" value={f.nextContent} onChange={ev("nextContent")} />
                </Field>
              </>
            )}
            <Field label="掲載期間の希望" hint="看板の空き検索(確認中の機能)で使います">
              <select className={inputCls} value={f.months} onChange={ev("months")}>
                {[3, 6, 12, 24, 36].map((m) => (
                  <option key={m} value={m}>
                    {m}ヶ月
                  </option>
                ))}
              </select>
            </Field>
            <Field label="案件の備考・注意事項" className="sm:col-span-2">
              <textarea className={textareaCls} placeholder="例: 決裁は本社。設置工事は土日不可。" value={f.notes} onChange={ev("notes")} />
            </Field>
          </div>
        </Sec>
      </div>
    </Modal>
  );
}

// =============== 顧客 作成・編集 ===============
export function CustomerFormModal({
  open,
  onClose,
  customer,
}: {
  open: boolean;
  onClose: () => void;
  customer?: Customer;
}) {
  const saveCustomer = useStore((s) => s.saveCustomer);
  const blank = {
    company: "",
    industry: "",
    contact: "",
    contactTitle: "",
    phone: "",
    email: "",
    address: "",
    area: "大阪" as Area,
    rank: "B" as Rank,
    status: "契約前" as CustomerStatus,
    source: "飛び込み",
    repId: ME_ID,
    memo: "",
  };
  const [f, setF] = useState(blank);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open) return;
    setTouched(false);
    setF(customer ? { ...customer } : blank);
  }, [open, customer]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));
  const errs = {
    company: !f.company.trim() ? "会社名を入力してください" : "",
    contact: "",
    phone: f.phone.trim() && !/^0\d{1,4}-?\d{1,4}-?\d{3,4}$/.test(f.phone.trim()) ? "電話番号の形式が正しくありません" : "",
    email: f.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email) ? "メールアドレスの形式が正しくありません" : "",
  };
  const err = (k: keyof typeof errs) => (touched ? errs[k] : "");
  const submit = async () => {
    setTouched(true);
    if (Object.values(errs).some(Boolean)) return;
    setBusy(true);
    await fakeApi(null);
    saveCustomer({
      ...(customer ?? { id: uid("c"), createdAt: todayISO() }),
      ...f,
      company: f.company.trim(),
    } as Customer);
    setBusy(false);
    toast.success(customer ? "クライアント情報を更新しました" : "クライアントを登録しました");
    onClose();
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={customer ? "クライアント情報を編集" : "クライアントを登録"}
      width={640}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={submit} loading={busy}>
            {customer ? "保存する" : "登録する"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="会社名・屋号" required error={err("company")} className="sm:col-span-2">
          <input className={inputCls + (err("company") ? errCls : "")} placeholder="例: 株式会社なにわ住建" value={f.company} onChange={set("company")} />
        </Field>
        <Field label="業種">
          <IndustrySelect value={f.industry} onChange={(v) => setF((p) => ({ ...p, industry: v }))} />
        </Field>
        <Field label="エリア">
          <select className={inputCls} value={f.area} onChange={set("area")}>
            {AREAS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </Field>
        <Field label="先方担当者" error={err("contact")}>
          <input className={inputCls + (err("contact") ? errCls : "")} placeholder="例: 田中 浩二" value={f.contact} onChange={set("contact")} />
        </Field>
        <Field label="役職">
          <input className={inputCls} placeholder="例: 販促部 部長" value={f.contactTitle} onChange={set("contactTitle")} />
        </Field>
        <Field label="電話番号" error={err("phone")}>
          <input className={inputCls + " tnum" + (err("phone") ? errCls : "")} placeholder="06-1234-5678" value={f.phone} onChange={set("phone")} />
        </Field>
        <Field label="メールアドレス" error={err("email")}>
          <input className={inputCls + (err("email") ? errCls : "")} placeholder="info@example.jp" value={f.email} onChange={set("email")} />
        </Field>
        <Field label="所在地" className="sm:col-span-2">
          <input className={inputCls} value={f.address} onChange={set("address")} />
        </Field>
        <Field label="状態">
          <select className={inputCls} value={f.status} onChange={set("status")}>
            {["契約前", "商談中", "取引中", "休眠"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>
        <Field label="商談のきっかけ">
          <select className={inputCls} value={f.source} onChange={set("source")}>
            {CHANNELS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>
        <Field label="担当">
          <select className={inputCls} value={f.repId} onChange={set("repId")}>
            {STAFF.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}({s.branch})
              </option>
            ))}
          </select>
        </Field>
        <Field label="メモ" className="sm:col-span-2">
          <textarea className={textareaCls} value={f.memo} onChange={set("memo")} />
        </Field>
      </div>
    </Modal>
  );
}

// =============== 仮押さえ ===============
export function HoldModal({
  open,
  onClose,
  board,
  face,
  startMonth,
  endMonth,
  dealId,
}: {
  open: boolean;
  onClose: () => void;
  board?: Board;
  face?: Face;
  startMonth?: string;
  endMonth?: string;
  dealId?: string;
}) {
  const deals = useStore((s) => s.deals);
  const customers = useStore((s) => s.customers);
  const contracts = useStore((s) => s.contracts);
  const holds = useStore((s) => s.holds);
  const addHold = useStore((s) => s.addHold);
  const idx = useMemo(() => buildIndex(contracts, holds), [contracts, holds]);
  const cur = thisMonth();
  const months = monthRange(cur, 30);
  const [f, setF] = useState({ dealId: "", start: cur, end: cur, expires: inDays(14) });
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  const openDeals = useMemo(
    () =>
      deals
        .filter((d) => OPEN_STAGES.includes(d.stage))
        .sort((a, b) => Number(b.repId === ME_ID) - Number(a.repId === ME_ID)),
    [deals],
  );
  useEffect(() => {
    if (!open) return;
    const s = startMonth ?? cur;
    const d = deals.find((x) => x.id === dealId);
    const len = Math.min(d?.months ?? 12, 12);
    setF({ dealId: dealId ?? "", start: s, end: endMonth ?? addMonthKey(s, len - 1), expires: inDays(14) });
    setTouched(false);
  }, [open, startMonth, endMonth, dealId]);

  const conflict = board && face && f.start <= f.end && !isFree(idx, board, face, f.start, f.end);
  const errs = {
    dealId: !f.dealId ? "仮押さえする商談を選択してください" : "",
    period: f.end < f.start ? "終了月は開始月以降を選択してください" : conflict ? "指定期間に掲載中または他の仮押さえが含まれています" : "",
    expires: f.expires < todayISO() ? "今日以降の日付を選択してください" : f.expires > inDays(30) ? "仮押さえ期限は最長30日です" : "",
  };
  const submit = async () => {
    setTouched(true);
    if (Object.values(errs).some(Boolean) || !face) return;
    setBusy(true);
    await fakeApi(null);
    addHold({ faceId: face.id, dealId: f.dealId, startMonth: f.start, endMonth: f.end, expiresAt: f.expires });
    setBusy(false);
    toast.success("仮押さえしました", { description: `${board?.name} ${face.label} / ${fmtPeriod(f.start, f.end)}` });
    onClose();
  };
  const custName = (id: string) => customers.find((c) => c.id === id)?.company ?? "";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="この面を仮押さえする"
      sub={board && face ? `${board.code}  ${board.name} ${face.label}(${face.direction})` : undefined}
      width={540}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button data-tour="hold-submit" onClick={submit} loading={busy}>
            仮押さえする
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {face && (
          <div className="flex items-center justify-between rounded-md bg-ink-50 px-4 py-3 text-[14px]">
            <span className="text-ink-500">月額定価</span>
            <span className="tnum font-semibold text-navy-900">{yen(face.price)}</span>
          </div>
        )}
        <p className="text-[14px] leading-relaxed text-ink-600">
          仮押さえをすると、期限までの間、他の担当者がこの面を押さえられなくなります。クライアントの返事を待つ間の「一時的な確保」です。
        </p>
        <Field label="どの商談のための仮押さえですか" required error={touched ? errs.dealId : ""}>
          <select data-tour="hold-deal" className={inputCls + (touched && errs.dealId ? errCls : "")} value={f.dealId} onChange={(e) => setF({ ...f, dealId: e.target.value })}>
            <option value="">選択してください</option>
            {openDeals.map((d) => (
              <option key={d.id} value={d.id}>
                {custName(d.customerId)} / {d.title}({d.stage})
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="掲載開始月" required>
            <select className={inputCls} value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })}>
              {months.map((m) => (
                <option key={m} value={m}>
                  {fmtMonth(m)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="掲載終了月" required>
            <select className={inputCls} value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })}>
              {months.map((m) => (
                <option key={m} value={m}>
                  {fmtMonth(m)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {errs.period && <div className="-mt-2 text-[12.5px] text-bad-600">{errs.period}</div>}
        <Field label="いつまで確保しますか(仮押さえ期限)" required error={touched ? errs.expires : ""} hint="期限を過ぎると自動的に解除され、他の担当者が押さえられるようになります(最長30日)">
          <input type="date" className={inputCls} value={f.expires} max={inDays(30)} onChange={(e) => setF({ ...f, expires: e.target.value })} />
        </Field>
      </div>
    </Modal>
  );
}
