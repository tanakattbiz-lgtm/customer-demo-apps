import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ChevronLeft, MapPin, Video, CalendarCheck, BadgeCheck, Send,
} from "lucide-react";
import { addDays, format } from "date-fns";
import { EXPERTS } from "../data/experts";
import { Button, Modal, TextField, Stars } from "../components/ui";
import { fakeApi } from "../lib/fakeApi";
import { useStore, uid } from "../store/useStore";

const REVIEW_SNIPPETS = [
  { name: "50代・会社員", text: "初回相談で概算と進め方を丁寧に説明してもらえ、不安が解消しました。費用も事前に明確でした。" },
  { name: "40代・自営業", text: "レスポンスが早く、オンラインだけで完結できたのが助かりました。専門用語をかみ砕いて説明してくれます。" },
  { name: "60代・主婦", text: "こちらの事情を親身に聞いたうえで、無理のない対策を提案してくれました。家族も安心しています。" },
];

export function ExpertDetail() {
  const { id } = useParams();
  const expert = EXPERTS.find((e) => e.id === id);
  if (!expert) return <Navigate to="/experts" replace />;
  return <Detail key={id} expertId={expert.id} />;
}

function Detail({ expertId }: { expertId: string }) {
  const e = EXPERTS.find((x) => x.id === expertId)!;
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const addRequest = useStore((s) => s.addRequest);
  const alreadyRequested = useStore((s) =>
    s.requests.some((r) => r.expertId === e.id)
  );

  // フォーム(デモ用に入力済み)
  const [name, setName] = useState("山田 太郎");
  const [email, setEmail] = useState("demo@example.com");
  const [topic, setTopic] = useState("");
  const [method, setMethod] = useState(e.online ? "オンライン" : "対面");
  const [preferred, setPreferred] = useState(format(addDays(new Date(), 3), "yyyy-MM-dd"));
  const [message, setMessage] = useState("シミュレーション結果をもとに、具体的な対策を相談したいです。");
  const [touched, setTouched] = useState(false);

  const errors = useMemo(() => {
    const er: Record<string, string> = {};
    if (!name.trim()) er.name = "お名前を入力してください";
    if (!email.trim()) er.email = "メールアドレスを入力してください";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) er.email = "メールアドレスの形式が正しくありません";
    if (!topic) er.topic = "相談したい内容を選択してください";
    if (!preferred) er.preferred = "希望日を選択してください";
    return er;
  }, [name, email, topic, preferred]);

  const submit = async () => {
    setTouched(true);
    if (Object.keys(errors).length) {
      toast.error("入力内容をご確認ください");
      return;
    }
    setSending(true);
    await fakeApi(null, 700);
    addRequest({
      id: uid(),
      expertId: e.id,
      expertName: e.name,
      qualification: e.qualification,
      date: new Date().toISOString(),
      preferredDate: preferred,
      method,
      topic,
      message,
      name,
      email,
      status: "受付中",
    });
    setSending(false);
    setOpen(false);
    toast.success(`${e.name}${e.qualification === "FP" ? "さん" : "先生"}に相談を申し込みました`, {
      description: "マイページから申込状況を確認できます",
    });
    navigate("/mypage");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        to="/experts"
        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition-colors hover:text-primary-600"
      >
        <ChevronLeft size={15} />
        専門家一覧へ戻る
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
      >
        {/* 本体 */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-start gap-4 sm:gap-5">
              <span
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white sm:h-20 sm:w-20"
                style={{ background: e.color }}
              >
                {e.name[0]}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-primary-600 px-2 py-0.5 text-[11px] font-bold text-white">
                    {e.qualification}
                  </span>
                  <span className="flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
                    <BadgeCheck size={12} /> 本人確認済み
                  </span>
                </div>
                <h1 className="mt-2 text-xl font-extrabold sm:text-2xl">{e.name}</h1>
                <p className="text-xs text-slate-400">{e.kana}</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">{e.office}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin size={12} /> {e.area}・{e.station}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 py-4 text-center">
              {[
                [String(e.years) + "年", "経験年数"],
                [e.cases.toLocaleString() + "件", "対応実績"],
                [String(e.rating), `評価(${e.reviews}件)`],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="font-en text-lg font-extrabold text-ink">{v}</p>
                  <p className="text-[10px] text-slate-400">{l}</p>
                </div>
              ))}
            </div>

            <p className="mt-5 rounded-xl border border-primary-100 bg-primary-50/60 p-4 text-sm font-semibold leading-7 text-primary-900">
              「{e.message}」
            </p>

            <h2 className="mt-6 text-sm font-bold text-slate-600">プロフィール</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">{e.bio}</p>

            <h2 className="mt-6 text-sm font-bold text-slate-600">得意分野</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {e.specialties.map((s) => (
                <span key={s} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* 口コミ */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-600">利用者の声</h2>
            <div className="mt-3 space-y-4">
              {REVIEW_SNIPPETS.map((rv) => (
                <div key={rv.name} className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <Stars rating={5} />
                    <span className="text-[11px] font-semibold text-slate-400">{rv.name}</span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-6 text-slate-600">{rv.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* サイド: 指名パネル */}
        <div className="h-fit space-y-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">初回相談料</p>
            <p className="mt-1 text-2xl font-extrabold text-primary-700">{e.fee}</p>
            <div className="mt-3 space-y-1.5 text-xs text-slate-500">
              <p className="flex items-center gap-1.5">
                <Video size={13} className={e.online ? "text-primary-600" : "text-slate-300"} />
                オンライン相談 {e.online ? "対応" : "非対応"}
              </p>
              <p className="flex items-center gap-1.5">
                <CalendarCheck size={13} className={e.weekend ? "text-primary-600" : "text-slate-300"} />
                土日相談 {e.weekend ? "対応" : "非対応"}
              </p>
            </div>
            <div className="mt-4">
              <Button full onClick={() => setOpen(true)}>
                <Send size={14} />
                この専門家を指名して相談する
              </Button>
            </div>
            {alreadyRequested && (
              <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-center text-[11px] font-bold text-emerald-600">
                この専門家に相談申込済みです
              </p>
            )}
            <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
              申込内容はこの専門家にのみ届きます。他の事務所から連絡が来ることはありません。
            </p>
          </div>
        </div>
      </motion.div>

      {/* 指名フォーム */}
      <Modal open={open} onClose={() => !sending && setOpen(false)} title={`${e.name} に相談を申し込む`}>
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            submit();
          }}
          className="space-y-4"
        >
          <TextField label="お名前" value={name} onChange={setName} required error={touched ? errors.name : undefined} />
          <TextField label="メールアドレス" value={email} onChange={setEmail} type="email" required error={touched ? errors.email : undefined} />
          <div>
            <label className="mb-1.5 flex items-baseline gap-2 text-sm font-semibold text-ink">
              相談したい内容
              <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">必須</span>
            </label>
            <select
              value={topic}
              onChange={(ev) => setTopic(ev.target.value)}
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-shadow focus:ring-4 ${
                touched && errors.topic ? "border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-primary-400 focus:ring-primary-100"
              }`}
            >
              <option value="">選択してください</option>
              {["不動産売却の税金について", "相続税・生前対策について", "贈与税について", "家賃収入の確定申告について", "その他"].map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            {touched && errors.topic && <p className="mt-1 text-xs font-medium text-red-600">{errors.topic}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">相談方法</label>
              <select
                value={method}
                onChange={(ev) => setMethod(ev.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-shadow focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
              >
                {e.online && <option value="オンライン">オンライン</option>}
                <option value="対面">対面(事務所)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">希望日</label>
              <input
                type="date"
                value={preferred}
                min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
                onChange={(ev) => setPreferred(ev.target.value)}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-shadow focus:ring-4 ${
                  touched && errors.preferred ? "border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-primary-400 focus:ring-primary-100"
                }`}
              />
            </div>
          </div>
          <TextField label="相談内容の詳細" value={message} onChange={setMessage} textarea placeholder="現在の状況やご質問を自由にご記入ください" />
          <Button type="submit" loading={sending} full>
            {sending ? "送信中…" : "この内容で申し込む(無料)"}
          </Button>
          <p className="text-center text-[11px] text-slate-400">
            ※デモのため実際の送信は行われません
          </p>
        </form>
      </Modal>
    </div>
  );
}
