import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { addDays, format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { BRANCHES, MACHINES, OPTIONS } from "../data/seed";
import { MachineArt } from "../components/MachineArt";
import { Badge, Button, EmptyState } from "../components/ui";
import { discountLabel, yen } from "../lib/format";
import { fakeApi } from "../lib/fakeApi";
import { cartTotal, itemTotal, useStore, type Order } from "../store";

type Errors = Partial<Record<"company" | "person" | "tel" | "email" | "site", string>>;

const TAX = 0.1;

export default function Cart() {
  const cart = useStore((s) => s.cart);
  const updateCartItem = useStore((s) => s.updateCartItem);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const placeOrder = useStore((s) => s.placeOrder);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    company: "",
    person: "",
    tel: "",
    email: "",
    site: "",
    note: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Order | null>(null);

  const subtotal = cartTotal(cart);
  const tax = Math.round(subtotal * TAX);

  const validate = (f = form): Errors => {
    const e: Errors = {};
    if (!f.company.trim()) e.company = "会社名を入力してください";
    if (!f.person.trim()) e.person = "ご担当者名を入力してください";
    if (!f.tel.trim()) e.tel = "電話番号を入力してください";
    else if (!/^[0-9()+\-\s]{10,}$/.test(f.tel.trim()))
      e.tel = "電話番号の形式が正しくありません";
    if (!f.email.trim()) e.email = "メールアドレスを入力してください";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))
      e.email = "メールアドレスの形式が正しくありません";
    if (!f.site.trim()) e.site = "現場名または現場所在地を入力してください";
    return e;
  };

  const setField = (k: keyof typeof form, v: string) => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (errors[k as keyof Errors]) setErrors(validate(next));
  };

  const submit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("入力内容をご確認ください", { description: "未入力の必須項目があります" });
      return;
    }
    setSubmitting(true);
    await fakeApi(true, 900);
    const order = placeOrder(form);
    setSubmitting(false);
    setDone(order);
    toast.success("レンタルのお申し込みを受け付けました", {
      description: `受付番号 ${order.id} / 担当より 1 営業日以内にご連絡します`,
    });
  };

  /* ---------------- 完了画面 ---------------- */
  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-ink-200 bg-white p-8 text-center shadow-[var(--shadow-lift)] sm:p-12"
        >
          <motion.div
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
            className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-ok-100 text-ok-700"
          >
            <CheckCircle2 size={32} />
          </motion.div>
          <h1 className="text-2xl font-black tracking-tight text-ink-900">
            お申し込みを受け付けました
          </h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-500">
            担当者が在庫と輸送日程を確認し、1 営業日以内に正式なお見積りをご連絡します。
          </p>

          <div className="mx-auto mt-7 max-w-sm rounded-2xl bg-ink-50 p-5 text-left">
            <dl className="space-y-2.5 text-[12.5px]">
              <div className="flex justify-between">
                <dt className="text-ink-500">受付番号</dt>
                <dd className="tnum font-black text-ink-900">{done.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">申込機械</dt>
                <dd className="font-bold text-ink-900">{done.items.length} 件</dd>
              </div>
              <div className="flex justify-between border-t border-ink-200 pt-2.5">
                <dt className="text-ink-500">概算合計(税別)</dt>
                <dd className="tnum text-lg font-black text-sun-800">{yen(done.total)}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Button variant="secondary" size="lg" onClick={() => navigate("/mypage")}>
              <ClipboardList size={16} /> 申込履歴を見る
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/rental")}>
              続けて機械を探す
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ---------------- 空カート ---------------- */
  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-black tracking-tight text-ink-900">見積カート</h1>
        <EmptyState
          icon={<ShoppingCart size={28} />}
          title="カートに機械がありません"
          desc="レンタルしたい機械を選ぶと、期間・オプションを含めた概算料金をここでまとめて確認できます。"
          action={
            <Link to="/rental">
              <Button variant="secondary" size="lg">
                機械を探しに行く <ArrowRight size={16} />
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  /* ---------------- カート本体 ---------------- */
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <h1 className="text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">見積カート</h1>
      <p className="mt-2.5 text-[13.5px] text-ink-500">
        内容を確認して、そのままレンタルのお申し込みまで進めます。
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
        {/* 明細 */}
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {cart.map((item) => {
              const m = MACHINES.find((x) => x.id === item.machineId);
              if (!m) return null;
              const start = new Date(item.startDate);
              const disc = discountLabel(item.days);
              return (
                <motion.article
                  key={item.uid}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden rounded-2xl border border-ink-200 bg-white"
                >
                  <div className="flex gap-4 p-4 sm:p-5">
                    <Link
                      to={`/rental/${m.id}`}
                      className="hidden shrink-0 overflow-hidden rounded-xl bg-sun-50 sm:block"
                    >
                      <MachineArt
                        kind={m.art}
                        idKey={`cart-${item.uid}`}
                        className="h-24 w-36"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            to={`/rental/${m.id}`}
                            className="text-[14.5px] font-bold text-ink-900 hover:text-sun-800"
                          >
                            {m.name}
                          </Link>
                          <p className="tnum mt-0.5 text-[11px] font-bold text-ink-400">
                            {m.model} / {m.classLabel}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            removeFromCart(item.uid);
                            toast.success("カートから削除しました");
                          }}
                          className="shrink-0 rounded-full p-2 text-ink-400 transition-colors hover:bg-ng-100 hover:text-ng-700"
                          aria-label="カートから削除"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* 編集フィールド */}
                      <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                        <label className="block">
                          <span className="mb-1 block text-[10px] font-black tracking-wider text-ink-400">
                            受取り営業所
                          </span>
                          <select
                            value={item.branchId}
                            onChange={(e) =>
                              updateCartItem(item.uid, { branchId: e.target.value })
                            }
                            className="w-full rounded-lg border border-ink-300 bg-white px-2.5 py-2 text-[12px] font-bold text-ink-800 outline-none focus:border-sea-500"
                          >
                            {BRANCHES.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-[10px] font-black tracking-wider text-ink-400">
                            日数
                          </span>
                          <input
                            type="number"
                            min={1}
                            max={180}
                            value={item.days}
                            onChange={(e) =>
                              updateCartItem(item.uid, {
                                days: Math.max(1, Math.min(180, Number(e.target.value) || 1)),
                              })
                            }
                            className="tnum w-full rounded-lg border border-ink-300 bg-white px-2.5 py-2 text-[12px] font-bold text-ink-800 outline-none focus:border-sea-500"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-[10px] font-black tracking-wider text-ink-400">
                            台数
                          </span>
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={item.qty}
                            onChange={(e) =>
                              updateCartItem(item.uid, {
                                qty: Math.max(1, Math.min(5, Number(e.target.value) || 1)),
                              })
                            }
                            className="tnum w-full rounded-lg border border-ink-300 bg-white px-2.5 py-2 text-[12px] font-bold text-ink-800 outline-none focus:border-sea-500"
                          />
                        </label>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <Badge tone="neutral">
                          {format(start, "M/d(E)", { locale: ja })} 〜{" "}
                          {format(addDays(start, item.days), "M/d(E)", { locale: ja })}
                        </Badge>
                        {disc && <Badge tone="ok">{disc}</Badge>}
                        {item.optionIds.map((oid) => (
                          <Badge key={oid} tone="sun">
                            {OPTIONS.find((o) => o.id === oid)?.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between border-t border-ink-200 bg-ink-50 px-5 py-3">
                    <span className="text-[11.5px] font-bold text-ink-500">小計(税別)</span>
                    <span className="tnum text-lg font-black text-ink-900">
                      {yen(itemTotal(item))}
                    </span>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>

          <Link
            to="/rental"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-ink-500 hover:text-ink-900"
          >
            ← 機械を追加する
          </Link>
        </div>

        {/* 申込フォーム */}
        <div>
          <div className="lg:sticky lg:top-24">
            <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-lift)]">
              <dl className="space-y-2 border-b border-ink-200 pb-5 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-ink-500">小計({cart.length} 件)</dt>
                  <dd className="tnum font-bold text-ink-900">{yen(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-500">消費税(10%)</dt>
                  <dd className="tnum font-bold text-ink-900">{yen(tax)}</dd>
                </div>
                <div className="flex items-baseline justify-between pt-2">
                  <dt className="text-[14px] font-black text-ink-900">概算合計</dt>
                  <dd className="tnum text-2xl font-black text-sun-800">{yen(subtotal + tax)}</dd>
                </div>
              </dl>

              <p className="mt-5 text-[11px] font-black tracking-wider text-ink-900">
                お客様情報
              </p>

              <div className="mt-3 space-y-3">
                {(
                  [
                    { k: "company", label: "会社名", ph: "株式会社○○建設", req: true },
                    { k: "person", label: "ご担当者名", ph: "山陰 太郎", req: true },
                    { k: "tel", label: "電話番号", ph: "0859-00-0000", req: true },
                    { k: "email", label: "メールアドレス", ph: "example@example.co.jp", req: true },
                    { k: "site", label: "現場名 / 所在地", ph: "県道○○号 拡幅工事", req: true },
                  ] as const
                ).map((f) => (
                  <label key={f.k} className="block">
                    <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-ink-600">
                      {f.label}
                      {f.req && (
                        <span className="rounded bg-ng-100 px-1.5 py-px text-[9.5px] font-black text-ng-700">
                          必須
                        </span>
                      )}
                    </span>
                    <input
                      value={form[f.k]}
                      onChange={(e) => setField(f.k, e.target.value)}
                      onBlur={() => setErrors(validate())}
                      placeholder={f.ph}
                      className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-[13px] outline-none transition-colors placeholder:text-ink-300 ${
                        errors[f.k as keyof Errors]
                          ? "border-ng-500 bg-ng-100/40"
                          : "border-ink-300 focus:border-sea-500"
                      }`}
                    />
                    {errors[f.k as keyof Errors] && (
                      <span className="mt-1 block text-[11px] font-bold text-ng-700">
                        {errors[f.k as keyof Errors]}
                      </span>
                    )}
                  </label>
                ))}

                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-ink-600">
                    ご要望・備考
                  </span>
                  <textarea
                    value={form.note}
                    onChange={(e) => setField("note", e.target.value)}
                    rows={3}
                    placeholder="搬入経路が狭い、朝一の納品希望 など"
                    className="w-full resize-none rounded-xl border border-ink-300 bg-white px-3.5 py-2.5 text-[13px] outline-none transition-colors placeholder:text-ink-300 focus:border-sea-500"
                  />
                </label>
              </div>

              <Button
                variant="secondary"
                size="lg"
                className="mt-5 w-full"
                loading={submitting}
                onClick={submit}
              >
                この内容で申し込む <ArrowRight size={16} />
              </Button>
              <p className="mt-3 text-center text-[10.5px] leading-relaxed text-ink-400">
                送信内容はこのブラウザ内にのみ保存されます(デモのため外部送信は行いません)。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
