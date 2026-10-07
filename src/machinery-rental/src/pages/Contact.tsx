import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Check, Phone, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { BRANCHES } from "../data/seed";
import { Button, PageHead, Reveal } from "../components/ui";
import { fakeApi } from "../lib/fakeApi";
import { useStore, type Inquiry } from "../store";
import { ymdhm } from "../lib/format";

const CATEGORIES = [
  "レンタルの見積り・空き状況",
  "ICT 建機の導入相談",
  "カタログの請求",
  "機械の故障・トラブル",
  "請求・契約について",
  "採用について",
  "その他",
];

type Errors = Partial<Record<"company" | "name" | "tel" | "email" | "body", string>>;

export default function Contact() {
  const [params] = useSearchParams();
  const subject = params.get("subject") ?? "";

  const addInquiry = useStore((s) => s.addInquiry);
  const inquiries = useStore((s) => s.inquiries);

  const [form, setForm] = useState({
    category: CATEGORIES[0],
    company: "",
    name: "",
    tel: "",
    email: "",
    body: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Inquiry | null>(null);

  /* 機種ページなどから引き継いだ件名を初期値に反映 */
  useEffect(() => {
    if (!subject) return;
    const guessed = subject.includes("採用")
      ? "採用について"
      : subject.includes("カタログ")
        ? "カタログの請求"
        : subject.includes("ICT") || subject.includes("レトロフィット")
          ? "ICT 建機の導入相談"
          : CATEGORIES[0];
    setForm((f) => ({
      ...f,
      category: guessed,
      body: f.body || `【お問い合わせ対象】${subject}\n\n`,
    }));
  }, [subject]);

  const validate = (f = form): Errors => {
    const e: Errors = {};
    if (!f.company.trim()) e.company = "会社名を入力してください(個人の場合は「個人」)";
    if (!f.name.trim()) e.name = "ご担当者名を入力してください";
    if (!f.tel.trim()) e.tel = "電話番号を入力してください";
    else if (!/^[0-9()+\-\s]{10,}$/.test(f.tel.trim())) e.tel = "電話番号の形式が正しくありません";
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
      toast.error("入力内容をご確認ください", { description: "未入力の必須項目があります" });
      return;
    }
    setSending(true);
    await fakeApi(true, 900);
    const record = addInquiry({ ...form, subject });
    setSending(false);
    setDone(record);
    toast.success("お問い合わせを送信しました", {
      description: `受付番号 ${record.id} / 1 営業日以内にご連絡します`,
    });
  };

  const field =
    "w-full border bg-white px-4 py-3.5 text-[13.5px] outline-none transition-colors placeholder:text-ink-300";

  return (
    <>
      <PageHead
        en="Contact"
        ja="お問い合わせ"
        lead="機種が決まっていなくても構いません。「この工事に何が要るか」からご相談ください。1 営業日以内に担当よりご連絡いたします。"
        breadcrumb={[{ label: "ホーム", to: "/" }, { label: "お問い合わせ" }]}
      />

      <div className="mx-auto max-w-[1200px] px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          {/* フォーム */}
          <div>
            {done ? (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-ink-200 p-10 text-center lg:p-16"
              >
                <div className="mx-auto grid h-14 w-14 place-items-center border border-navy-700 text-navy-700">
                  <Check size={24} strokeWidth={1.6} />
                </div>
                <h2 className="serif mt-8 text-[22px] leading-[1.6] text-ink-900">
                  お問い合わせを受け付けました
                </h2>
                <p className="mt-5 text-[13px] leading-[2.1] text-ink-600">
                  内容を確認のうえ、1 営業日以内に担当よりご連絡いたします。
                  <br />
                  お急ぎの場合は、最寄りの営業所へお電話ください。
                </p>

                <dl className="mx-auto mt-10 max-w-sm border-t border-ink-200 text-left">
                  <div className="flex justify-between border-b border-ink-200 py-3.5 text-[12.5px]">
                    <dt className="text-ink-500">受付番号</dt>
                    <dd className="tnum text-ink-900">{done.id}</dd>
                  </div>
                  <div className="flex justify-between border-b border-ink-200 py-3.5 text-[12.5px]">
                    <dt className="text-ink-500">受付日時</dt>
                    <dd className="tnum text-ink-900">{ymdhm(done.createdAt)}</dd>
                  </div>
                  <div className="flex justify-between border-b border-ink-200 py-3.5 text-[12.5px]">
                    <dt className="text-ink-500">種別</dt>
                    <dd className="text-ink-900">{done.category}</dd>
                  </div>
                </dl>

                <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link to="/">
                    <Button>トップページへ</Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDone(null);
                      setForm({
                        category: CATEGORIES[0],
                        company: "",
                        name: "",
                        tel: "",
                        email: "",
                        body: "",
                      });
                    }}
                  >
                    続けて問い合わせる
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div>
                {subject && (
                  <div className="mb-10 border-l-2 border-amber-500 bg-ink-25 px-6 py-5">
                    <p className="label-en text-ink-400">お問い合わせ対象</p>
                    <p className="serif mt-2.5 text-[15px] text-ink-900">{subject}</p>
                  </div>
                )}

                <div className="space-y-8">
                  {/* 種別 */}
                  <div>
                    <p className="mb-4 flex items-center gap-2.5 text-[12px] text-ink-700">
                      お問い合わせ種別
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c}
                          onClick={() => setField("category", c)}
                          className={`border px-4 py-2.5 text-[12px] transition-colors ${
                            form.category === c
                              ? "border-navy-800 bg-navy-800 text-white"
                              : "border-ink-200 text-ink-600 hover:border-ink-400"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2">
                    {(
                      [
                        { k: "company", label: "会社名", ph: "株式会社○○建設" },
                        { k: "name", label: "ご担当者名", ph: "山陰 太郎" },
                        { k: "tel", label: "電話番号", ph: "0859-00-0000" },
                        { k: "email", label: "メールアドレス", ph: "example@example.co.jp" },
                      ] as const
                    ).map((f) => (
                      <label key={f.k} className="block">
                        <span className="mb-3 flex items-center gap-2.5 text-[12px] text-ink-700">
                          {f.label}
                          <span className="bg-amber-100 px-1.5 py-0.5 text-[9.5px] tracking-wide text-amber-700">
                            必須
                          </span>
                        </span>
                        <input
                          value={form[f.k]}
                          onChange={(e) => setField(f.k, e.target.value)}
                          onBlur={() => setErrors(validate())}
                          placeholder={f.ph}
                          className={`${field} ${
                            errors[f.k as keyof Errors]
                              ? "border-alert-600"
                              : "border-ink-300 focus:border-navy-600"
                          }`}
                        />
                        {errors[f.k as keyof Errors] && (
                          <span className="mt-2 block text-[11.5px] text-alert-600">
                            {errors[f.k as keyof Errors]}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>

                  <label className="block">
                    <span className="mb-3 flex items-center gap-2.5 text-[12px] text-ink-700">
                      お問い合わせ内容
                      <span className="bg-amber-100 px-1.5 py-0.5 text-[9.5px] tracking-wide text-amber-700">
                        必須
                      </span>
                      <span className="tnum ml-auto text-[11px] text-ink-400">
                        {form.body.length} 文字
                      </span>
                    </span>
                    <textarea
                      value={form.body}
                      onChange={(e) => setField("body", e.target.value)}
                      onBlur={() => setErrors(validate())}
                      rows={8}
                      placeholder={
                        "例) 来月から始まる県道の拡幅工事で、掘削と敷均しに使う機械を探しています。工期は約 2 か月、現場は山間部で搬入路が狭いです。"
                      }
                      className={`${field} resize-none leading-[2] ${
                        errors.body ? "border-alert-600" : "border-ink-300 focus:border-navy-600"
                      }`}
                    />
                    {errors.body && (
                      <span className="mt-2 block text-[11.5px] text-alert-600">{errors.body}</span>
                    )}
                  </label>

                  <div className="flex gap-3 border border-ink-200 bg-ink-25 p-5">
                    <ShieldAlert size={15} className="mt-0.5 shrink-0 text-ink-400" />
                    <p className="text-[11.5px] leading-[2] text-ink-500">
                      これは提案用のデモサイトです。送信された内容は外部に送信されず、
                      このブラウザ内にのみ保存されます。実在の個人情報は入力しないでください。
                    </p>
                  </div>

                  <Button size="lg" className="w-full" loading={sending} onClick={submit}>
                    この内容で送信する
                  </Button>
                </div>
              </div>
            )}

            {/* 送信履歴(デモ) */}
            {inquiries.length > 0 && (
              <div className="mt-16 border-t border-ink-200 pt-10">
                <p className="label-en mb-6 text-ink-400">送信履歴(このブラウザ内)</p>
                <div className="border-t border-ink-200">
                  {inquiries.slice(0, 5).map((q) => (
                    <div key={q.id} className="border-b border-ink-200 py-4">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="tnum text-[11px] text-ink-400">{ymdhm(q.createdAt)}</span>
                        <span className="border border-ink-200 px-2 py-0.5 text-[10.5px] text-ink-500">
                          {q.category}
                        </span>
                        <span className="tnum text-[11px] text-ink-400">{q.id}</span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-[12.5px] leading-[1.9] text-ink-600">
                        {q.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 連絡先 */}
          <div className="space-y-6">
            <Reveal>
              <div className="border border-ink-200 p-8">
                <p className="label-en text-ink-400">お電話でのお問い合わせ</p>
                <a
                  href="tel:0859000000"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("このデモでは発信を行いません");
                  }}
                  className="tnum mt-5 flex items-center gap-3 text-[26px] leading-none tracking-wide text-ink-900"
                >
                  <Phone size={18} className="text-amber-600" />
                  0859-00-0000
                </a>
                <p className="mt-4 text-[11.5px] leading-[1.9] text-ink-500">
                  本社・米子営業所
                  <br />
                  受付 8:00 - 17:30(土日祝休)
                </p>
                <p className="mt-5 border-t border-ink-200 pt-5 text-[11.5px] leading-[1.9] text-ink-600">
                  レンタル中の機械の故障・トラブルは、休業日を含め
                  <span className="text-ink-900">24 時間受け付けています。</span>
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="border border-ink-200 p-8">
                <p className="label-en text-ink-400">最寄りの営業所</p>
                <div className="mt-5 border-t border-ink-200">
                  {BRANCHES.map((b) => (
                    <button
                      key={b.id}
                      onClick={() =>
                        toast.info("このデモでは発信を行いません", {
                          description: `実際のサイトでは ${b.name} へ発信されます`,
                        })
                      }
                      className="flex w-full items-center justify-between gap-3 border-b border-ink-200 py-3 text-left transition-colors hover:text-navy-700"
                    >
                      <span className="text-[12.5px] text-ink-700">{b.name}</span>
                      <span className="tnum text-[11.5px] text-ink-500">{b.tel}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="border border-ink-200 bg-ink-25 p-8">
                <p className="serif text-[15px] text-ink-900">よくあるご質問</p>
                <p className="mt-3 text-[12px] leading-[2] text-ink-600">
                  料金の決まり方、資格の要否、故障時の対応などをまとめています。
                </p>
                <Link to="/overview#faq" className="mt-6 inline-block">
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
