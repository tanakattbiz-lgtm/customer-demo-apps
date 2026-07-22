import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Coffee, Heart, ArrowLeft, Check, ShieldCheck, Info } from "lucide-react";
import { useStore } from "../store";
import type { Staff, PayMethod } from "../data/seed";
import { PAY_METHODS, STORE_NAME, STORE_BRANCH } from "../data/seed";
import { Avatar, Button, Field, Modal, inputCls } from "../components/ui";
import { yen } from "../lib/format";
import { fakeApi } from "../lib/fakeApi";

const PRESETS = [100, 300, 500, 1000, 2000];

export default function Tip() {
  const { staffId } = useParams();
  const navigate = useNavigate();
  const staff = useStore((s) => s.staff);
  const active = useMemo(() => staff.filter((s) => s.active), [staff]);

  const selected = staffId ? staff.find((s) => s.id === staffId) ?? null : null;

  return (
    <div className="min-h-screen bg-ink-100">
      {/* 店舗ヘッダー */}
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
              <Coffee size={18} />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-ink-900">
                {STORE_NAME} <span className="text-ink-400">{STORE_BRANCH}</span>
              </div>
              <div className="text-[11px] text-ink-400">スタッフへチップを贈る</div>
            </div>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-500 transition hover:bg-ink-100"
          >
            <ArrowLeft size={14} /> 管理画面
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-8">
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-white/80">
            <Heart size={16} className="fill-white/90 text-white/90" /> Thank you tip
          </div>
          <h1 className="mt-2 text-xl font-bold leading-snug">
            今日の「ありがとう」を
            <br />
            スタッフへ届けましょう
          </h1>
          <p className="mt-2 text-sm text-white/80">
            気持ちの分だけ。100 円から贈れます。
          </p>
        </div>

        <h2 className="mb-3 text-sm font-bold text-ink-700">スタッフを選ぶ</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {active.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(`/tip/${s.id}`)}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-ink-200 bg-white p-4 text-center transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
            >
              <Avatar name={s.name} color={s.color} size={56} />
              <div className="leading-tight">
                <div className="text-sm font-semibold text-ink-900">{s.name}</div>
                <div className="text-[11px] text-ink-400">{s.role}</div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-medium text-brand-700 transition group-hover:bg-brand-100">
                <Heart size={10} className="fill-brand-500 text-brand-500" /> 贈る
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-start gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-xs text-ink-500">
          <Info size={15} className="mt-0.5 shrink-0 text-ink-400" />
          <span>
            これは提案用デモです。<b>実際の決済は行われません</b>。個人情報や実在の決済情報は入力しないでください。
          </span>
        </div>
      </main>

      <TipModal staff={selected} onClose={() => navigate("/tip")} />
    </div>
  );
}

type Step = "form" | "processing" | "done";

function TipModal({ staff, onClose }: { staff: Staff | null; onClose: () => void }) {
  const addTip = useStore((s) => s.addTip);
  const [step, setStep] = useState<Step>("form");
  const [amount, setAmount] = useState<number>(500);
  const [custom, setCustom] = useState("");
  const [message, setMessage] = useState("");
  const [from, setFrom] = useState("");
  const [method, setMethod] = useState<PayMethod>("PayPay");
  const [lastAmount, setLastAmount] = useState(0);

  const open = !!staff;

  useEffect(() => {
    if (open) {
      setStep("form");
      setAmount(500);
      setCustom("");
      setMessage("");
      setFrom("");
      setMethod("PayPay");
    }
  }, [open, staff?.id]);

  const effective = custom ? Math.max(0, parseInt(custom.replace(/[^0-9]/g, "") || "0", 10)) : amount;
  const valid = effective >= 100 && effective <= 50000;

  const send = async () => {
    if (!staff || !valid) return;
    setStep("processing");
    await fakeApi(true, 1100);
    addTip({ staffId: staff.id, amount: effective, message, from, method });
    setLastAmount(effective);
    setStep("done");
    toast.success(`${staff.name} さんへ ${yen(effective)} を贈りました`, {
      description: "受取が管理画面に反映されました",
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={step === "done" ? "" : "チップを贈る"} width={460}>
      {!staff ? null : step === "done" ? (
        <ThankYou staff={staff} amount={lastAmount} onClose={onClose} />
      ) : step === "processing" ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="relative">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" />
            <Heart size={20} className="absolute inset-0 m-auto fill-heart-500 text-heart-500" />
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-ink-800">決済を処理しています…</div>
            <div className="mt-1 text-xs text-ink-400">{method}で {yen(effective)} を送信中</div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* 相手 */}
          <div className="flex items-center gap-3 rounded-xl bg-ink-50 px-4 py-3">
            <Avatar name={staff.name} color={staff.color} size={44} />
            <div className="leading-tight">
              <div className="text-sm font-semibold text-ink-900">{staff.name}</div>
              <div className="text-xs text-ink-400">{staff.role}</div>
            </div>
            <Heart size={18} className="ml-auto fill-heart-500 text-heart-500" />
          </div>

          {/* 金額 */}
          <div>
            <div className="mb-1.5 text-sm font-medium text-ink-700">金額を選ぶ</div>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p) => {
                const on = !custom && amount === p;
                return (
                  <button
                    key={p}
                    onClick={() => {
                      setAmount(p);
                      setCustom("");
                    }}
                    className={
                      "tnum rounded-xl border px-2 py-2.5 text-sm font-semibold transition " +
                      (on
                        ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-400/25"
                        : "border-ink-200 text-ink-700 hover:border-brand-300 hover:bg-brand-50/40")
                    }
                  >
                    {yen(p)}
                  </button>
                );
              })}
              <div className="relative col-span-3 sm:col-span-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">
                  ¥
                </span>
                <input
                  inputMode="numeric"
                  className={inputCls + " pl-6 text-center"}
                  placeholder="自由"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                />
              </div>
            </div>
            {!valid && (custom || effective !== amount) && (
              <div className="mt-1.5 text-xs text-rose-600">100〜50,000 円の範囲で入力してください</div>
            )}
          </div>

          {/* メッセージ */}
          <Field label="メッセージ(任意)" hint="スタッフへ届く応援コメント">
            <textarea
              className={inputCls + " min-h-20 resize-none"}
              maxLength={80}
              placeholder="例:ラテアート最高でした!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Field>

          {/* ニックネーム */}
          <Field label="お名前(任意)" hint="未入力なら「匿名の応援」として届きます">
            <input
              className={inputCls}
              maxLength={20}
              placeholder="ニックネーム"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </Field>

          {/* 決済手段(擬似) */}
          <div>
            <div className="mb-1.5 text-sm font-medium text-ink-700">お支払い方法</div>
            <div className="grid grid-cols-3 gap-2">
              {PAY_METHODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={
                    "rounded-xl border px-2 py-2 text-xs font-medium transition " +
                    (method === m
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-ink-200 text-ink-600 hover:bg-ink-50")
                  }
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-ink-400">
            <ShieldCheck size={13} /> デモ環境のため実際の請求は発生しません
          </div>

          <Button variant="heart" className="w-full" disabled={!valid} onClick={send}>
            <Heart size={16} className="fill-white" />
            {valid ? `${yen(effective)} を贈る` : "金額を入力してください"}
          </Button>
        </div>
      )}
    </Modal>
  );
}

function ThankYou({ staff, amount, onClose }: { staff: Staff; amount: number; onClose: () => void }) {
  return (
    <div className="relative flex flex-col items-center py-6 text-center">
      {/* 浮かぶハート */}
      <div className="pointer-events-none absolute inset-x-0 top-8 h-24">
        <AnimatePresence>
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="heart-float absolute"
              style={{ left: `${20 + i * 15}%`, animationDelay: `${i * 0.18}s` }}
            >
              <Heart size={16 + (i % 3) * 6} className="fill-heart-500 text-heart-500" />
            </span>
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600"
      >
        <Check size={30} strokeWidth={3} />
      </motion.div>

      <h3 className="mt-4 text-lg font-bold text-ink-900">ありがとうございました!</h3>
      <p className="mt-1 text-sm text-ink-500">
        <b className="text-ink-800">{staff.name}</b> さんへ
        <b className="tnum text-brand-700"> {yen(amount)}</b> を贈りました
      </p>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-ink-50 px-4 py-2.5 text-xs text-ink-500">
        <Avatar name={staff.name} color={staff.color} size={26} />
        気持ちはスタッフと店舗にきちんと届きます
      </div>

      <div className="mt-6 flex w-full gap-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          スタッフ一覧へ
        </Button>
        <Button className="flex-1" onClick={onClose}>
          続けて贈る
        </Button>
      </div>
    </div>
  );
}
