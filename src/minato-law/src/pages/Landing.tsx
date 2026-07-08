import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Scale,
  Users,
  Briefcase,
  Car,
  Coins,
  Building2,
  Shield,
  Home,
  Scroll,
  Check,
  ArrowRight,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { fakeApi } from "../lib/fakeApi";
import { Field, inputCls } from "../components/ui";

const NAV = [
  { id: "areas", label: "取扱分野" },
  { id: "attorneys", label: "弁護士紹介" },
  { id: "flow", label: "相談の流れ" },
  { id: "faq", label: "よくある質問" },
  { id: "contact", label: "お問い合わせ" },
];

const AREAS = [
  { icon: Users, title: "離婚・親権", desc: "協議・調停・裁判、親権や養育費、財産分与まで丁寧に対応します。" },
  { icon: Scroll, title: "相続・遺言", desc: "遺産分割・遺言作成・相続放棄。争いを避ける生前対策もご相談ください。" },
  { icon: Briefcase, title: "労働問題", desc: "未払残業代・不当解雇・ハラスメント。労使双方のご相談に応じます。" },
  { icon: Car, title: "交通事故", desc: "後遺障害等級、示談交渉、損害賠償請求まで被害者側を支援します。" },
  { icon: Coins, title: "債務整理", desc: "任意整理・個人再生・自己破産。生活再建に向けた最適な方法を提案します。" },
  { icon: Building2, title: "企業法務", desc: "契約書レビュー、顧問契約、規約整備、債権回収など事業を支えます。" },
  { icon: Shield, title: "刑事弁護", desc: "身柄解放、示談交渉、起訴・不起訴の見通しまで迅速に対応します。" },
  { icon: Home, title: "不動産", desc: "明渡し・原状回復、賃料トラブル、境界紛争などを解決します。" },
];

const REASONS = [
  ["初回相談は無料", "まずはお話をお聞かせください。ご相談は初回無料。費用の見通しも明確にお伝えします。"],
  ["明朗な費用体系", "着手金・報酬をあらかじめ提示。ご依頼前に総額の目安をご確認いただけます。"],
  ["迅速な初動", "お問い合わせから原則2営業日以内にご連絡。緊急のご相談にも対応します。"],
  ["6名体制で専門対応", "分野に応じた担当が連携。個人のお悩みから企業法務まで幅広く支援します。"],
];

const ATTORNEYS = [
  { name: "湊 隆一", title: "代表弁護士", initial: "湊", color: "oklch(40% 0.13 265)", areas: "企業法務・債務整理", word: "依頼者の立場で、最善の解決を最後まで追求します。" },
  { name: "白石 真希", title: "パートナー弁護士", initial: "白", color: "oklch(48% 0.13 210)", areas: "離婚・相続・不動産", word: "ご家族の問題は、丁寧に寄り添いながら進めます。" },
  { name: "藤原 拓也", title: "弁護士", initial: "藤", color: "oklch(46% 0.13 155)", areas: "労働・交通事故", word: "証拠を尽くし、正当な権利の実現を支援します。" },
  { name: "神谷 美咲", title: "弁護士", initial: "神", color: "oklch(48% 0.13 320)", areas: "刑事・相続", word: "不安な時ほど、迅速で分かりやすい対応を心がけます。" },
];

const FLOW = [
  ["お問い合わせ", "フォームまたはお電話でご連絡ください。相談内容を簡単にお伝えください。"],
  ["初回相談(無料)", "担当弁護士がお話を伺い、見通しと費用の目安をご説明します。"],
  ["ご依頼・受任", "方針にご納得いただけましたら、委任契約を締結し対応を開始します。"],
  ["解決へ", "進捗はチャットで随時共有。解決まで伴走します。"],
];

const FAQ = [
  { q: "相談だけでも可能ですか?", a: "はい。初回のご相談は無料です。依頼を前提とせず、方針や費用の見通しだけを聞きに来ていただいて構いません。" },
  { q: "費用はどのくらいかかりますか?", a: "分野や難易度により異なりますが、着手金・報酬を事前に明示します。ご依頼前に総額の目安をお伝えしますのでご安心ください。" },
  { q: "土日や夜間でも相談できますか?", a: "事前予約により、平日夜間・土曜のご相談にも可能な範囲で対応しています。まずはお問い合わせください。" },
  { q: "オンラインでの相談は可能ですか?", a: "可能です。ご来所が難しい場合は、オンラインや電話でのご相談にも対応しています。" },
];

const AREA_OPTIONS = AREAS.map((a) => a.title).concat("その他");

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div
      className={
        "flex items-center gap-2.5 text-xs font-medium tracking-[0.2em] uppercase " +
        (dark ? "text-gold-400" : "text-brand-700")
      }
    >
      <span className="h-px w-6 bg-gold-500" />
      {children}
    </div>
  );
}

export default function Landing() {
  const nav = useNavigate();
  const addClient = useStore((s) => s.addClient);
  const pushNotification = useStore((s) => s.pushNotification);

  const [menu, setMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // 無料相談フォーム(送信すると業務システム側に見込み客+通知として登録される)
  const [form, setForm] = useState({ name: "", email: "", phone: "", area: AREA_OPTIONS[0], body: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const scrollTo = (id: string) => {
    setMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "お名前を入力してください";
    if (!form.email.trim()) e.email = "メールアドレスを入力してください";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "メールアドレスの形式が正しくありません";
    if (!form.body.trim()) e.body = "ご相談内容を入力してください";
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    await fakeApi(true, 700);

    // 業務システムへ「見込み客」として登録
    addClient({
      name: form.name.trim(),
      kana: "",
      type: "個人",
      plan: "スポット",
      status: "見込み",
      contact: "本人",
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: "",
      ownerId: "s1",
      note: `【Webからの無料相談】分野:${form.area} / ${form.body.trim()}`,
    });
    // メール通知(自動返信)
    pushNotification({
      channel: "メール",
      event: "面談予約確定",
      to: form.email.trim(),
      subject: "【みなと総合法律事務所】無料相談のお申し込みを受け付けました",
      status: "送信済",
    });

    setSending(false);
    setSent(true);
    toast.success("お問い合わせを送信しました", { description: "担当者より折り返しご連絡します" });
  }

  return (
    <div className="min-h-full overflow-x-hidden bg-white text-ink-900">
      {/* ===== ヘッダー ===== */}
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <button onClick={() => scrollTo("top")} className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-brand-800 text-white">
              <Scale size={17} />
            </div>
            <div className="text-left leading-tight">
              <div className="font-serif text-[15px] font-semibold text-ink-900">みなと総合法律事務所</div>
              <div className="text-[10px] tracking-wide text-ink-400">MINATO LAW OFFICE</div>
            </div>
          </button>

          <nav className="hidden items-center gap-6 lg:flex">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => scrollTo(n.id)} className="text-sm font-medium text-ink-600 transition hover:text-ink-900">
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href="tel:0312345678" className="hidden items-center gap-1.5 text-sm font-semibold text-brand-800 md:flex">
              <Phone size={15} />
              03-1234-5678
            </a>
            <button
              onClick={() => scrollTo("contact")}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
            >
              無料相談
            </button>
            <button onClick={() => setMenu((v) => !v)} className="grid h-9 w-9 place-items-center rounded-md text-ink-600 hover:bg-ink-100 lg:hidden" aria-label="メニュー">
              {menu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {menu && (
          <div className="border-t border-ink-200 bg-white px-4 py-2 lg:hidden">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => scrollTo(n.id)} className="block w-full px-2 py-2.5 text-left text-sm font-medium text-ink-700 hover:text-ink-900">
                {n.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ===== ヒーロー ===== */}
      <section id="top" className="border-b border-ink-200 bg-ink-50/40">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <Eyebrow>港区の法律事務所</Eyebrow>
            <h1 className="mt-6 font-serif text-4xl leading-[1.32] font-semibold tracking-tight text-ink-900 sm:text-[2.9rem]">
              法律のお悩みを、
              <br />
              確かな解決へ導きます。
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-[1.9] text-ink-600">
              相続・離婚・労働・企業法務まで、幅広い分野に対応。初回のご相談は無料です。
              ひとりで抱え込まず、まずはお気軽にお聞かせください。経験豊富な弁護士が、
              最善の解決までしっかりと伴走します。
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button onClick={() => scrollTo("contact")} className="inline-flex items-center gap-2 rounded-md bg-brand-800 px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-900">
                無料相談を申し込む
                <ArrowRight size={16} />
              </button>
              <a href="tel:0312345678" className="inline-flex items-center gap-2 rounded-md border border-ink-300 bg-white px-6 py-3 text-sm font-medium text-ink-700 transition hover:border-ink-400">
                <Phone size={16} />
                電話で相談する
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-ink-200 pt-6 text-sm text-ink-500">
              <span className="inline-flex items-center gap-2"><Check size={15} className="text-brand-600" />初回相談無料</span>
              <span className="inline-flex items-center gap-2"><Check size={15} className="text-brand-600" />明朗会計</span>
              <span className="inline-flex items-center gap-2"><Check size={15} className="text-brand-600" />2営業日以内に連絡</span>
            </div>
          </div>

          {/* ヒーロー脇:相談窓口カード */}
          <div className="rounded-lg border border-ink-200 bg-white p-7 shadow-[0_1px_2px_oklch(0%_0_0_/_0.04)]">
            <div className="font-serif text-lg font-semibold text-ink-900">ご相談の受付</div>
            <p className="mt-1 text-sm text-ink-500">お電話・フォームで承ります。</p>
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-ink-200 text-brand-700"><Phone size={18} /></div>
                <div>
                  <div className="text-xs text-ink-500">電話受付</div>
                  <a href="tel:0312345678" className="font-serif text-xl font-semibold text-ink-900">03-1234-5678</a>
                  <div className="text-xs text-ink-400">平日 9:00–18:00</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-ink-200 text-brand-700"><Clock size={18} /></div>
                <div>
                  <div className="text-xs text-ink-500">夜間・土曜</div>
                  <div className="text-sm font-medium text-ink-800">事前予約で対応可能</div>
                </div>
              </div>
            </div>
            <button onClick={() => scrollTo("contact")} className="mt-6 w-full rounded-md bg-brand-800 py-3 text-sm font-medium text-white transition hover:bg-brand-900">
              フォームで無料相談を申し込む
            </button>
          </div>
        </div>
      </section>

      {/* ===== 選ばれる理由 ===== */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(([t, d], i) => (
            <div key={t} className="border-t border-ink-900/10 pt-5">
              <div className="font-mono text-xs text-ink-400">0{i + 1}</div>
              <div className="mt-2 font-serif text-lg font-semibold text-ink-900">{t}</div>
              <p className="mt-2 text-sm leading-[1.8] text-ink-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 取扱分野 ===== */}
      <section id="areas" className="scroll-mt-16 border-y border-ink-200 bg-ink-50/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <Eyebrow>取扱分野</Eyebrow>
            <h2 className="mt-5 font-serif text-3xl font-semibold tracking-tight text-ink-900">幅広い分野に対応します</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
              個人のお悩みから企業法務まで。どの分野もまずは無料相談から承ります。
            </p>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-4">
            {AREAS.map((a) => (
              <div key={a.title} className="bg-white p-6">
                <div className="grid h-11 w-11 place-items-center rounded-md border border-ink-200 text-brand-700">
                  <a.icon size={20} />
                </div>
                <h3 className="mt-4 font-serif text-base font-semibold text-ink-900">{a.title}</h3>
                <p className="mt-1.5 text-sm leading-[1.75] text-ink-600">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 弁護士紹介 ===== */}
      <section id="attorneys" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <Eyebrow>弁護士紹介</Eyebrow>
          <h2 className="mt-5 font-serif text-3xl font-semibold tracking-tight text-ink-900">担当する弁護士</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
            経験豊富な弁護士が、それぞれの専門分野でお力になります。
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ATTORNEYS.map((a) => (
            <div key={a.name} className="rounded-lg border border-ink-200 bg-white p-6">
              <div className="grid h-16 w-16 place-items-center rounded-full font-serif text-2xl font-semibold text-white" style={{ background: a.color }}>
                {a.initial}
              </div>
              <div className="mt-4 font-serif text-lg font-semibold text-ink-900">{a.name}</div>
              <div className="text-xs text-brand-700">{a.title}</div>
              <div className="mt-3 border-t border-ink-100 pt-3">
                <div className="text-[11px] tracking-wide text-ink-400">主な取扱分野</div>
                <div className="text-sm text-ink-700">{a.areas}</div>
              </div>
              <p className="mt-3 text-sm leading-[1.7] text-ink-500">「{a.word}」</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 相談の流れ ===== */}
      <section id="flow" className="scroll-mt-16 bg-brand-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Eyebrow dark>相談の流れ</Eyebrow>
          <h2 className="mt-5 font-serif text-3xl font-semibold tracking-tight">ご相談から解決まで</h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map(([t, d], i) => (
              <div key={t} className="bg-brand-900 p-6">
                <div className="font-serif text-3xl font-semibold text-gold-400">0{i + 1}</div>
                <div className="mt-3 font-serif text-lg font-semibold">{t}</div>
                <p className="mt-2 text-sm leading-[1.8] text-brand-100/80">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-brand-200">
            ご依頼後は、進捗を専用チャットで随時共有。ご不明点はいつでもご連絡いただけます。
          </p>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-16 px-4 py-20 sm:px-6">
        <Eyebrow>よくある質問</Eyebrow>
        <h2 className="mt-5 font-serif text-3xl font-semibold tracking-tight text-ink-900">よくある質問</h2>
        <div className="mt-10 divide-y divide-ink-200 border-y border-ink-200">
          {FAQ.map((f, i) => (
            <div key={f.q}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left">
                <span className="font-medium text-ink-900">{f.q}</span>
                <ChevronDown size={18} className={"shrink-0 text-ink-400 transition " + (openFaq === i ? "rotate-180" : "")} />
              </button>
              {openFaq === i && <div className="pb-5 text-sm leading-[1.9] text-ink-600">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ===== 無料相談フォーム ===== */}
      <section id="contact" className="scroll-mt-16 border-y border-ink-200 bg-ink-50/40">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <Eyebrow>お問い合わせ</Eyebrow>
            <h2 className="mt-5 font-serif text-3xl font-semibold tracking-tight text-ink-900">無料相談のお申し込み</h2>
            <p className="mt-4 text-[15px] leading-[1.9] text-ink-600">
              下記フォームまたはお電話にてご連絡ください。担当者より原則2営業日以内に折り返しご連絡いたします。
              いただいた内容は秘密厳守で取り扱います。
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-ink-200 text-brand-700"><Phone size={17} /></div>
                <div>
                  <div className="text-xs text-ink-500">電話</div>
                  <a href="tel:0312345678" className="font-serif text-lg font-semibold text-ink-900">03-1234-5678</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-ink-200 text-brand-700"><MapPin size={17} /></div>
                <div>
                  <div className="text-xs text-ink-500">所在地</div>
                  <div className="text-sm font-medium text-ink-800">東京都港区海岸2-4-8 みなとビル9F</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-ink-200 text-brand-700"><Clock size={17} /></div>
                <div>
                  <div className="text-xs text-ink-500">受付時間</div>
                  <div className="text-sm font-medium text-ink-800">平日 9:00–18:00(夜間・土曜は予約制)</div>
                </div>
              </div>
            </div>
          </div>

          {/* フォーム */}
          <div className="rounded-lg border border-ink-200 bg-white p-7">
            {sent ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={34} />
                </div>
                <div className="mt-4 font-serif text-lg font-semibold text-ink-900">送信が完了しました</div>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-500">
                  お申し込みありがとうございます。担当者より折り返しご連絡いたします。確認メールをお送りしました。
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", phone: "", area: AREA_OPTIONS[0], body: "" });
                  }}
                  className="mt-6 text-sm font-medium text-brand-700 hover:text-brand-800"
                >
                  続けて入力する
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="お名前" required error={errs.name}>
                    <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="山田 太郎" />
                  </Field>
                  <Field label="電話番号">
                    <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="090-0000-0000" />
                  </Field>
                </div>
                <Field label="メールアドレス" required error={errs.email}>
                  <input className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="mail@example.com" />
                </Field>
                <Field label="ご相談分野">
                  <select className={inputCls} value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}>
                    {AREA_OPTIONS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </Field>
                <Field label="ご相談内容" required error={errs.body}>
                  <textarea className={inputCls + " min-h-28 resize-y"} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="差し支えない範囲で、ご相談の概要をお書きください。" />
                </Field>
                <button type="submit" disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-800 py-3 text-sm font-medium text-white transition hover:bg-brand-900 disabled:opacity-60">
                  {sending ? "送信中…" : "この内容で送信する"}
                </button>
                <p className="flex items-center gap-1.5 text-[11px] text-ink-400">
                  <Mail size={12} />
                  送信内容は秘密厳守で取り扱います(デモのため実送信は行われません)。
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ===== フッター ===== */}
      <footer className="bg-brand-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col justify-between gap-8 sm:flex-row">
            <div className="max-w-sm">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-md bg-white/10 text-white"><Scale size={17} /></div>
                <div>
                  <div className="font-serif font-semibold">みなと総合法律事務所</div>
                  <div className="text-[10px] tracking-wide text-brand-300">MINATO LAW OFFICE</div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-brand-200">
                東京都港区海岸2-4-8 みなとビル9F<br />
                TEL 03-1234-5678(平日 9:00–18:00)
              </p>
            </div>
            <div className="flex flex-wrap gap-x-12 gap-y-2 text-sm">
              <div className="space-y-2">
                {NAV.slice(0, 3).map((n) => (
                  <button key={n.id} onClick={() => scrollTo(n.id)} className="block text-brand-200 hover:text-white">{n.label}</button>
                ))}
              </div>
              <div className="space-y-2">
                {NAV.slice(3).map((n) => (
                  <button key={n.id} onClick={() => scrollTo(n.id)} className="block text-brand-200 hover:text-white">{n.label}</button>
                ))}
                <button onClick={() => nav("/login")} className="block text-brand-300 hover:text-white">関係者ログイン</button>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-white/10 pt-6 text-xs text-brand-300">
            © 2026 みなと総合法律事務所 — 本サイトは提案用のデモ(モック)です。
          </div>
        </div>
      </footer>
    </div>
  );
}
