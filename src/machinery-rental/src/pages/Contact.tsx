import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle2, Clock, Mail, MessageSquare, Phone, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { BRANCHES } from "../data/seed";
import { Button, Reveal } from "../components/ui";
import { fakeApi } from "../lib/fakeApi";
import { useStore } from "../store";

const CATEGORIES = [
  "レンタルの見積り・空き状況",
  "ICT 建機の導入相談",
  "機械の故障・トラブル",
  "請求・契約について",
  "採用について",
  "その他",
];

type Errors = Partial<Record<"name" | "company" | "email" | "body", string>>;

export default function Contact() {
  const addInquiry = useStore((s) => s.addInquiry);

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    category: CATEGORIES[0],
    body: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = (f = form): Errors => {
    const e: Errors = {};
    if (!f.name.trim()) e.name = "お名前を入力してください";
    if (!f.company.trim()) e.company = "会社名を入力してください(個人の場合は「個人」)";
    if (!f.email.trim()) e.email = "メールアドレスを入力してください";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))
      e.email = "メールアドレスの形式が正しくありません";
    if (!f.body.trim()) e.body = "お問い合わせ内容を入力してください";
    else if (f.body.trim().length < 10) e.body = "10 文字以上でご入力ください";
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
      toast.error("入力内容をご確認ください");
      return;
    }
    setSending(true);
    await fakeApi(true, 900);
    addInquiry(form);
    setSending(false);
    setSent(true);
    toast.success("お問い合わせを送信しました", {
      description: "1 営業日以内に担当よりご連絡いたします",
    });
  };

  return (
    <>
      <div className="mesh-soft border-b border-ink-200">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <p className="text-[11px] font-black tracking-[0.18em] text-sun-800">CONTACT</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">
            お問い合わせ
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-600">
            機種が決まっていなくても構いません。「この工事に何が要るか」からご相談ください。
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
          {/* フォーム */}
          <div>
            {sent ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-ink-200 bg-white p-8 text-center shadow-[var(--shadow-lift)] sm:p-12"
              >
                <motion.div
                  initial={{ scale: 0.75 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-ok-100 text-ok-700"
                >
                  <CheckCircle2 size={32} />
                </motion.div>
                <h2 className="text-xl font-black text-ink-900">送信しました</h2>
                <p className="mt-3 text-[13.5px] leading-relaxed text-ink-500">
                  お問い合わせありがとうございます。担当より 1 営業日以内にご連絡いたします。
                  <br />
                  お急ぎの場合は、最寄りの営業所へお電話ください。
                </p>
                <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                  <Link to="/mypage">
                    <Button variant="secondary">送信内容を確認する</Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSent(false);
                      setForm({
                        name: "",
                        company: "",
                        email: "",
                        category: CATEGORIES[0],
                        body: "",
                      });
                    }}
                  >
                    続けて問い合わせる
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="rounded-3xl border border-ink-200 bg-white p-6 sm:p-8">
                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    {(
                      [
                        { k: "company", label: "会社名", ph: "株式会社○○建設" },
                        { k: "name", label: "お名前", ph: "山陰 太郎" },
                      ] as const
                    ).map((f) => (
                      <label key={f.k} className="block">
                        <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold text-ink-700">
                          {f.label}
                          <span className="rounded bg-ng-100 px-1.5 py-px text-[9.5px] font-black text-ng-700">
                            必須
                          </span>
                        </span>
                        <input
                          value={form[f.k]}
                          onChange={(e) => setField(f.k, e.target.value)}
                          onBlur={() => setErrors(validate())}
                          placeholder={f.ph}
                          className={`w-full rounded-xl border bg-white px-4 py-3 text-[13.5px] outline-none transition-colors placeholder:text-ink-300 ${
                            errors[f.k as keyof Errors]
                              ? "border-ng-500 bg-ng-100/40"
                              : "border-ink-300 focus:border-sea-500"
                          }`}
                        />
                        {errors[f.k as keyof Errors] && (
                          <span className="mt-1 block text-[11.5px] font-bold text-ng-700">
                            {errors[f.k as keyof Errors]}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>

                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold text-ink-700">
                      メールアドレス
                      <span className="rounded bg-ng-100 px-1.5 py-px text-[9.5px] font-black text-ng-700">
                        必須
                      </span>
                    </span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      onBlur={() => setErrors(validate())}
                      placeholder="example@example.co.jp"
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-[13.5px] outline-none transition-colors placeholder:text-ink-300 ${
                        errors.email ? "border-ng-500 bg-ng-100/40" : "border-ink-300 focus:border-sea-500"
                      }`}
                    />
                    {errors.email && (
                      <span className="mt-1 block text-[11.5px] font-bold text-ng-700">
                        {errors.email}
                      </span>
                    )}
                  </label>

                  <div>
                    <span className="mb-2 block text-[12px] font-bold text-ink-700">
                      お問い合わせ種別
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c}
                          onClick={() => setField("category", c)}
                          className={`rounded-full px-3.5 py-2 text-[12px] font-bold transition-colors ${
                            form.category === c
                              ? "bg-ink-900 text-white"
                              : "border border-ink-200 bg-white text-ink-600 hover:bg-ink-100"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold text-ink-700">
                      お問い合わせ内容
                      <span className="rounded bg-ng-100 px-1.5 py-px text-[9.5px] font-black text-ng-700">
                        必須
                      </span>
                      <span className="tnum ml-auto font-normal text-ink-400">
                        {form.body.length} 文字
                      </span>
                    </span>
                    <textarea
                      value={form.body}
                      onChange={(e) => setField("body", e.target.value)}
                      onBlur={() => setErrors(validate())}
                      rows={6}
                      placeholder={
                        "例) 来月から始まる県道の拡幅工事で、掘削と敷均しに使う機械を探しています。工期は約 2 か月、現場は山間部で搬入路が狭いです。"
                      }
                      className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-[13.5px] leading-relaxed outline-none transition-colors placeholder:text-ink-300 ${
                        errors.body ? "border-ng-500 bg-ng-100/40" : "border-ink-300 focus:border-sea-500"
                      }`}
                    />
                    {errors.body && (
                      <span className="mt-1 block text-[11.5px] font-bold text-ng-700">
                        {errors.body}
                      </span>
                    )}
                  </label>

                  <div className="flex gap-2.5 rounded-xl bg-ink-50 p-4">
                    <ShieldAlert size={16} className="mt-0.5 shrink-0 text-ink-400" />
                    <p className="text-[11.5px] leading-relaxed text-ink-500">
                      これは提案用のデモサイトです。送信された内容は外部に送信されず、
                      このブラウザ内にのみ保存されます。実在の個人情報は入力しないでください。
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    loading={sending}
                    onClick={submit}
                  >
                    <MessageSquare size={16} /> この内容で送信する
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 連絡先 */}
          <div className="space-y-4">
            <Reveal>
              <div className="rounded-3xl border border-ink-200 bg-gradient-to-br from-sun-50 to-white p-6">
                <p className="flex items-center gap-2 text-[13px] font-black text-ink-900">
                  <Phone size={16} className="text-sun-700" /> お電話でのご相談
                </p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink-500">
                  お急ぎの場合は、最寄りの営業所へ直接ご連絡ください。
                </p>
                <div className="mt-4 space-y-1.5">
                  {BRANCHES.map((b) => (
                    <button
                      key={b.id}
                      onClick={() =>
                        toast.info("このデモでは発信は行いません", {
                          description: `実際のサイトでは ${b.name} に発信されます`,
                        })
                      }
                      className="flex w-full items-center justify-between rounded-xl border border-ink-200 bg-white px-4 py-3 text-left transition-colors hover:border-sun-400"
                    >
                      <span>
                        <span className="block text-[12.5px] font-bold text-ink-900">{b.name}</span>
                        <span className="block text-[10.5px] text-ink-400">{b.area}</span>
                      </span>
                      <span className="tnum text-[13px] font-black text-ink-800">{b.tel}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="rounded-3xl border border-ink-200 bg-white p-6">
                <p className="flex items-center gap-2 text-[13px] font-black text-ink-900">
                  <Clock size={16} className="text-sea-600" /> 受付時間
                </p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink-600">
                  8:00 - 17:30(日曜・祝日休)
                  <br />
                  <span className="font-bold text-ink-900">
                    レンタル中の故障・トラブルは 24 時間受付
                  </span>
                  しています。
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="rounded-3xl border border-ink-200 bg-white p-6">
                <p className="flex items-center gap-2 text-[13px] font-black text-ink-900">
                  <Mail size={16} className="text-ink-500" /> よくあるご質問
                </p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink-500">
                  料金の決まり方、資格の要否、故障時の対応などをまとめています。
                </p>
                <Link to="/company#faq" className="mt-4 inline-block">
                  <Button variant="outline" size="sm">
                    FAQ を見る
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  );
}
