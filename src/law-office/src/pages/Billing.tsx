import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Lock,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { useLoad } from "../lib/useLoad";
import { PageHeader } from "../components/PageHeader";
import {
  Card,
  Pill,
  Button,
  Modal,
  inputCls,
  EmptyState,
  Skeleton,
} from "../components/ui";
import { yen, shortDate } from "../lib/format";
import { invoiceTone } from "../lib/status";
import { tokenizeCard, createPayment, cardBrand } from "../lib/fakeSquare";
import type { Invoice, InvoiceStatus } from "../data/seed";

const TABS: Array<InvoiceStatus | "すべて"> = [
  "すべて",
  "送付済",
  "延滞",
  "支払済",
  "未請求",
];

/** Square ブランドマーク */
function SquareMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
      />
      <rect x="8.5" y="8.5" width="7" height="7" rx="1.6" fill="currentColor" />
    </svg>
  );
}

export default function Billing() {
  const loading = useLoad();
  const invoices = useStore((s) => s.invoices);
  const clients = useStore((s) => s.clients);
  const payInvoice = useStore((s) => s.payInvoice);

  const [tab, setTab] = useState<InvoiceStatus | "すべて">("すべて");
  const [q, setQ] = useState("");
  const [pay, setPay] = useState<Invoice | null>(null);

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? "—";

  const stats = useMemo(() => {
    const paid = invoices
      .filter((i) => i.status === "支払済")
      .reduce((a, b) => a + b.amount, 0);
    const sent = invoices
      .filter((i) => i.status === "送付済")
      .reduce((a, b) => a + b.amount, 0);
    const overdue = invoices
      .filter((i) => i.status === "延滞")
      .reduce((a, b) => a + b.amount, 0);
    return { paid, sent, overdue };
  }, [invoices]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return invoices
      .filter((iv) => {
        const hay = `${iv.no} ${iv.subject} ${clientName(iv.clientId)}`.toLowerCase();
        return (tab === "すべて" || iv.status === tab) && (!kw || hay.includes(kw));
      })
      .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoices, tab, q]);

  return (
    <div>
      <PageHeader
        title="請求・決済"
        subtitle="請求書の発行と、Square によるクレジットカード決済を管理"
        actions={
          <span className="hidden items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-500 sm:inline-flex">
            <SquareMark size={14} />
            Square 連携
          </span>
        }
      />

      {/* サマリ */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loading ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <SummaryCard icon={<CheckCircle2 size={18} />} label="入金済み" value={yen(stats.paid)} tone="oklch(60% 0.15 150)" />
            <SummaryCard icon={<Clock size={18} />} label="送付済(未入金)" value={yen(stats.sent)} tone="oklch(58% 0.15 240)" />
            <SummaryCard icon={<AlertTriangle size={18} />} label="延滞" value={yen(stats.overdue)} tone="oklch(60% 0.18 25)" />
          </>
        )}
      </div>

      {/* タブ + 検索 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl bg-ink-200/60 p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "rounded-lg px-3 py-1.5 text-sm font-medium transition " +
                (tab === t ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-700")
              }
            >
              {t}
            </button>
          ))}
        </div>
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="請求番号・件名・顧問先で検索"
            className={inputCls + " pl-9"}
          />
        </div>
      </div>

      {/* テーブル */}
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileText size={24} />}
            title="該当する請求書がありません"
            description="タブや検索条件を変えてお試しください。"
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {/* デスクトップ:テーブル */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs text-ink-500">
                  <th className="px-5 py-3 font-medium">請求番号 / 件名</th>
                  <th className="px-5 py-3 font-medium">顧問先</th>
                  <th className="px-5 py-3 font-medium">発行 / 期限</th>
                  <th className="px-5 py-3 text-right font-medium">金額</th>
                  <th className="px-5 py-3 font-medium">状態</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((iv) => (
                  <tr key={iv.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                    <td className="px-5 py-3">
                      <div className="font-mono text-xs text-ink-400">{iv.no}</div>
                      <div className="font-medium text-ink-800">{iv.subject}</div>
                    </td>
                    <td className="px-5 py-3 text-ink-600">{clientName(iv.clientId)}</td>
                    <td className="px-5 py-3 text-xs text-ink-500">
                      <div>{shortDate(iv.issuedAt)} 発行</div>
                      <div className={iv.status === "延滞" ? "text-rose-600" : ""}>
                        {shortDate(iv.dueAt)} 期限
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-ink-900 tnum">{yen(iv.amount)}</td>
                    <td className="px-5 py-3">
                      <Pill tone={invoiceTone[iv.status] as never}>{iv.status}</Pill>
                      {iv.status === "支払済" && iv.cardLast4 && (
                        <div className="mt-1 text-[11px] text-ink-400">
                          {iv.cardBrand} •••• {iv.cardLast4}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {iv.status === "送付済" || iv.status === "延滞" ? (
                        <Button variant="outline" onClick={() => setPay(iv)} className="!px-3 !py-1.5 !text-xs">
                          <CreditCard size={14} />
                          Square で決済
                        </Button>
                      ) : iv.status === "支払済" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle2 size={14} />
                          {iv.paidAt && shortDate(iv.paidAt)}入金
                        </span>
                      ) : (
                        <span className="text-xs text-ink-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* モバイル:カード */}
          <div className="divide-y divide-ink-50 md:hidden">
            {filtered.map((iv) => (
              <div key={iv.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-[11px] text-ink-400">{iv.no}</div>
                    <div className="truncate font-medium text-ink-800">{iv.subject}</div>
                    <div className="text-xs text-ink-500">{clientName(iv.clientId)}</div>
                  </div>
                  <Pill tone={invoiceTone[iv.status] as never}>{iv.status}</Pill>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-ink-500">
                    期限 <span className={iv.status === "延滞" ? "text-rose-600" : ""}>{shortDate(iv.dueAt)}</span>
                  </div>
                  <div className="font-bold text-ink-900 tnum">{yen(iv.amount)}</div>
                </div>
                {(iv.status === "送付済" || iv.status === "延滞") && (
                  <Button variant="outline" onClick={() => setPay(iv)} className="mt-3 w-full !py-2 !text-sm">
                    <CreditCard size={15} />
                    Square で決済
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <PaymentModal invoice={pay} onClose={() => setPay(null)} onPaid={payInvoice} clientName={clientName} />
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: tone + "1f", color: tone }}>
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold text-ink-900 tnum">{value}</div>
        <div className="text-sm text-ink-500">{label}</div>
      </div>
    </Card>
  );
}

function PaymentModal({
  invoice,
  onClose,
  onPaid,
  clientName,
}: {
  invoice: Invoice | null;
  onClose: () => void;
  onPaid: (id: string, card: { brand: string; last4: string }) => void;
  clientName: (id: string) => string;
}) {
  const [number, setNumber] = useState("4111 1111 1111 1111");
  const [exp, setExp] = useState("12/28");
  const [cvc, setCvc] = useState("123");
  const [focused, setFocused] = useState(false);
  const [step, setStep] = useState<"form" | "processing" | "done">("form");
  const [statusLabel, setStatusLabel] = useState("");
  const [receipt, setReceipt] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});

  // モーダルを開くたびに state リセット
  const key = invoice?.id;
  useMemo(() => {
    setStep("form");
    setErr({});
    setReceipt("");
  }, [key]);

  if (!invoice) return null;

  const brand = cardBrand(number);

  function fmtNumber(v: string) {
    return v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim();
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (number.replace(/\s/g, "").length < 14) e.number = "カード番号が正しくありません";
    if (!/^\d{2}\/\d{2}$/.test(exp)) e.exp = "MM/YY 形式で入力してください";
    if (!/^\d{3,4}$/.test(cvc)) e.cvc = "3〜4桁で入力してください";
    setErr(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !invoice) return;
    setStep("processing");

    // 1) card.tokenize() 相当:カードを nonce 化
    setStatusLabel("カード情報を安全に処理しています…");
    const tk = await tokenizeCard({ number, exp, cvc });
    if (tk.status !== "OK" || !tk.token || !tk.details) {
      setStep("form");
      const msg = tk.errors?.[0]?.message ?? "カード情報の処理に失敗しました";
      setErr({ number: msg });
      toast.error(msg);
      return;
    }

    // 2) Payments API の CreatePayment 相当
    setStatusLabel("Square で決済を確定しています…");
    const { card } = tk.details;
    const res = await createPayment(tk.token, invoice.amount, card.brand, card.last4);
    if (!res.payment) {
      setStep("form");
      const msg = res.errors?.[0]?.detail ?? "決済に失敗しました";
      toast.error(msg);
      return;
    }

    // 成功
    onPaid(invoice.id, { brand: card.brand, last4: card.last4 });
    setReceipt(res.payment.receiptNumber);
    setStep("done");
    toast.success("決済が完了しました", {
      description: `${invoice.no} / ${yen(invoice.amount)} を Square で受領しました`,
    });
    setTimeout(onClose, 1800);
  }

  return (
    <Modal open={!!invoice} onClose={onClose} title="Square でお支払い" width={470}>
      {step === "done" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-8 text-center"
        >
          <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={34} />
          </div>
          <div className="mt-4 text-lg font-bold text-ink-900">決済が完了しました</div>
          <div className="mt-1 text-sm text-ink-500">
            {invoice.no} / {yen(invoice.amount)}
          </div>
          <div className="mt-3 rounded-lg bg-ink-50 px-3 py-2 font-mono text-xs text-ink-500">
            Square レシート番号: {receipt}
          </div>
          <div className="mt-2 text-xs text-ink-400">入金確認メールを送信しました</div>
        </motion.div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {/* 請求サマリ */}
          <div className="rounded-xl bg-ink-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500">{clientName(invoice.clientId)}</span>
              <span className="font-mono text-xs text-ink-400">{invoice.no}</span>
            </div>
            <div className="mt-1 flex items-end justify-between">
              <span className="text-ink-700">{invoice.subject}</span>
              <span className="text-2xl font-bold text-ink-900 tnum">{yen(invoice.amount)}</span>
            </div>
          </div>

          {/* Square Web Payments SDK 風の埋め込みカードフォーム */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-medium text-ink-700">カード情報</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-ink-900 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                <SquareMark size={11} />
                SANDBOX
              </span>
            </div>

            <div
              className={
                "rounded-xl border bg-white p-3 transition " +
                (focused
                  ? "border-brand-400 ring-2 ring-brand-400/25"
                  : Object.keys(err).length
                    ? "border-rose-300"
                    : "border-ink-200")
              }
            >
              {/* カード番号行 */}
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="shrink-0 text-ink-400" />
                <input
                  className="w-full bg-transparent font-mono text-sm tracking-wider text-ink-900 outline-none placeholder:text-ink-300"
                  inputMode="numeric"
                  value={number}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onChange={(e) => setNumber(fmtNumber(e.target.value))}
                  placeholder="4111 1111 1111 1111"
                  aria-label="カード番号"
                />
                <span className="shrink-0 text-[11px] font-semibold text-ink-400">{brand}</span>
              </div>
              <div className="my-2.5 h-px bg-ink-100" />
              {/* 有効期限 / CVC 行 */}
              <div className="flex items-center gap-3">
                <input
                  className="w-20 bg-transparent font-mono text-sm text-ink-900 outline-none placeholder:text-ink-300"
                  value={exp}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                    if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                    setExp(v);
                  }}
                  placeholder="MM/YY"
                  aria-label="有効期限"
                />
                <div className="h-4 w-px bg-ink-100" />
                <div className="flex items-center gap-1.5">
                  <Lock size={13} className="text-ink-400" />
                  <input
                    className="w-16 bg-transparent font-mono text-sm text-ink-900 outline-none placeholder:text-ink-300"
                    inputMode="numeric"
                    value={cvc}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="CVC"
                    aria-label="セキュリティコード"
                  />
                </div>
              </div>
            </div>
            {(err.number || err.exp || err.cvc) && (
              <p className="mt-1.5 text-xs text-rose-600">
                {err.number || err.exp || err.cvc}
              </p>
            )}
            <p className="mt-1.5 text-[11px] text-ink-400">
              テストカード:4111 1111 1111 1111(成功) / 末尾 0002(拒否)
            </p>
          </div>

          <Button type="submit" loading={step === "processing"} className="w-full">
            {step === "processing" ? (
              statusLabel || "処理中…"
            ) : (
              <>
                <Lock size={15} />
                {yen(invoice.amount)} を支払う
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-ink-400">
            <span>決済は</span>
            <span className="inline-flex items-center gap-1 font-semibold text-ink-600">
              <SquareMark size={13} />
              Square
            </span>
            <span>で安全に処理されます(デモのため実際の課金は行われません)</span>
          </div>
        </form>
      )}
    </Modal>
  );
}
