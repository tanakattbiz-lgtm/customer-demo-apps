import { useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { toast } from "sonner";
import { useStore, uid } from "../store";
import {
  ACTIVITY_TYPES,
  AREAS,
  ME_ID,
  OPEN_STAGES,
  STAFF,
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

// =============== 商談 作成・編集 ===============
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
  const customers = useStore((s) => s.customers);
  const saveDeal = useStore((s) => s.saveDeal);
  const [f, setF] = useState({
    customerId: "",
    title: "",
    stage: "初回接触" as Stage,
    monthlyBudget: "",
    months: "12",
    expectedClose: "",
    repId: ME_ID,
    nextDate: "",
    nextContent: "",
  });
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open) return;
    setTouched(false);
    setF(
      deal
        ? {
            customerId: deal.customerId,
            title: deal.title,
            stage: deal.stage,
            monthlyBudget: String(deal.monthlyBudget),
            months: String(deal.months),
            expectedClose: deal.expectedClose,
            repId: deal.repId,
            nextDate: "",
            nextContent: "",
          }
        : {
            customerId: customerId ?? "",
            title: "",
            stage: "初回接触",
            monthlyBudget: "",
            months: "12",
            expectedClose: inDays(45),
            repId: ME_ID,
            nextDate: inDays(3),
            nextContent: "",
          },
    );
  }, [open, deal, customerId]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));
  const budget = Number(f.monthlyBudget);
  const errs = {
    customerId: !f.customerId ? "顧客を選択してください" : "",
    title: !f.title.trim() ? "案件名を入力してください" : "",
    monthlyBudget: !f.monthlyBudget ? "月額予算を入力してください" : !(budget > 0) ? "正しい金額を入力してください" : "",
    expectedClose: !f.expectedClose ? "受注予定日を選択してください" : "",
  };
  const invalid = Object.values(errs).some(Boolean);
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
      monthlyBudget: budget,
      months: Number(f.months),
      expectedClose: f.expectedClose,
      repId: f.repId,
      nextAction: deal ? deal.nextAction : f.nextDate && f.nextContent.trim() ? { date: f.nextDate, content: f.nextContent.trim() } : null,
      updatedAt: todayISO(),
    } as Deal);
    setBusy(false);
    toast.success(deal ? "商談を更新しました" : "商談を登録しました");
    onClose();
    onSaved?.(id);
  };
  const err = (k: keyof typeof errs) => (touched ? errs[k] : "");
  const sortedCustomers = useMemo(
    () => [...customers].sort((a, b) => Number(b.repId === ME_ID) - Number(a.repId === ME_ID) || a.company.localeCompare(b.company, "ja")),
    [customers],
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={deal ? "商談を編集" : "商談を登録"}
      width={600}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={submit} loading={busy}>
            {deal ? "保存する" : "登録する"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="顧客" required error={err("customerId")} className="sm:col-span-2">
          <select className={inputCls + (err("customerId") ? errCls : "")} value={f.customerId} onChange={set("customerId")} disabled={!!deal}>
            <option value="">選択してください</option>
            {sortedCustomers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company}
              </option>
            ))}
          </select>
        </Field>
        <Field label="案件名" required error={err("title")} className="sm:col-span-2">
          <input className={inputCls + (err("title") ? errCls : "")} placeholder="例: 新店オープン告知" value={f.title} onChange={set("title")} />
        </Field>
        <Field label="ステージ">
          <select className={inputCls} value={f.stage} onChange={set("stage")}>
            {OPEN_STAGES.map((s) => (
              <option key={s}>{s}</option>
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
        <Field label="月額予算(円)" required error={err("monthlyBudget")}>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={10000}
            className={inputCls + " tnum" + (err("monthlyBudget") ? errCls : "")}
            placeholder="150000"
            value={f.monthlyBudget}
            onChange={set("monthlyBudget")}
          />
        </Field>
        <Field label="掲載期間">
          <select className={inputCls} value={f.months} onChange={set("months")}>
            {[3, 6, 12, 24, 36].map((m) => (
              <option key={m} value={m}>
                {m}ヶ月
              </option>
            ))}
          </select>
        </Field>
        <Field label="受注予定日" required error={err("expectedClose")}>
          <input type="date" className={inputCls} value={f.expectedClose} onChange={set("expectedClose")} />
        </Field>
        <div className="flex items-end pb-2 text-[14px] text-ink-500">
          見込金額 <span className="tnum ml-2 text-[16px] font-semibold text-navy-900">{yen((budget || 0) * Number(f.months))}</span>
        </div>
        {!deal && (
          <>
            <Field label="次回対応日">
              <input type="date" className={inputCls} value={f.nextDate} onChange={set("nextDate")} />
            </Field>
            <Field label="次回対応内容">
              <input className={inputCls} placeholder="例: 初回訪問" value={f.nextContent} onChange={set("nextContent")} />
            </Field>
          </>
        )}
      </div>
    </Modal>
  );
}

// =============== 顧客 作成・編集 ===============
const INDUSTRIES = ["住宅・不動産", "医療", "自動車販売", "教育", "冠婚葬祭", "外食", "小売", "メーカー", "観光・宿泊", "士業", "介護・福祉", "サービス", "物流", "金融・保険"];
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
    industry: "住宅・不動産",
    contact: "",
    contactTitle: "",
    phone: "",
    email: "",
    address: "",
    area: "大阪" as Area,
    rank: "B" as Rank,
    status: "見込み" as CustomerStatus,
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
    contact: !f.contact.trim() ? "担当者名を入力してください" : "",
    phone: !f.phone.trim() ? "電話番号を入力してください" : !/^0\d{1,4}-?\d{1,4}-?\d{3,4}$/.test(f.phone.trim()) ? "電話番号の形式が正しくありません" : "",
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
    toast.success(customer ? "顧客情報を更新しました" : "見込み客を登録しました");
    onClose();
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={customer ? "顧客情報を編集" : "見込み客を登録"}
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
          <select className={inputCls} value={f.industry} onChange={set("industry")}>
            {INDUSTRIES.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </Field>
        <Field label="エリア">
          <select className={inputCls} value={f.area} onChange={set("area")}>
            {AREAS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </Field>
        <Field label="先方担当者" required error={err("contact")}>
          <input className={inputCls + (err("contact") ? errCls : "")} placeholder="例: 田中 浩二" value={f.contact} onChange={set("contact")} />
        </Field>
        <Field label="役職">
          <input className={inputCls} placeholder="例: 販促部 部長" value={f.contactTitle} onChange={set("contactTitle")} />
        </Field>
        <Field label="電話番号" required error={err("phone")}>
          <input className={inputCls + " tnum" + (err("phone") ? errCls : "")} placeholder="06-1234-5678" value={f.phone} onChange={set("phone")} />
        </Field>
        <Field label="メールアドレス" error={err("email")}>
          <input className={inputCls + (err("email") ? errCls : "")} placeholder="info@example.jp" value={f.email} onChange={set("email")} />
        </Field>
        <Field label="所在地" className="sm:col-span-2">
          <input className={inputCls} value={f.address} onChange={set("address")} />
        </Field>
        <Field label="ランク" hint="A: 受注確度・規模ともに高い">
          <select className={inputCls} value={f.rank} onChange={set("rank")}>
            {["A", "B", "C"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>
        <Field label="状態">
          <select className={inputCls} value={f.status} onChange={set("status")}>
            {["見込み", "商談中", "取引中", "休眠"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>
        <Field label="獲得経路">
          <select className={inputCls} value={f.source} onChange={set("source")}>
            {["飛び込み", "紹介", "問い合わせ", "既存深耕", "展示会"].map((r) => (
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
          仮押さえをすると、期限までの間、他の担当者がこの面を押さえられなくなります。お客様の返事を待つ間の「一時的な確保」です。
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
