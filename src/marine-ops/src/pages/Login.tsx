import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Anchor, ShieldCheck } from "lucide-react";
import { useStore } from "../store/useStore";
import { Button, Field, inputCls } from "../components/ui";
import { fakeApi } from "../lib/fakeApi";

export default function Login() {
  const login = useStore((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState("kanri@marine-ops.example.jp");
  const [pw, setPw] = useState("demo-pass-2607");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fakeApi(true, 650);
    login();
    navigate("/");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* ---- 左:ブランドパネル(引き算のデザイン・情緒は控えめ) ---- */}
      <div className="relative hidden overflow-hidden bg-brand-900 lg:block">
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            background:
              "radial-gradient(50rem 40rem at 20% 0%, oklch(50% 0.13 224 / 0.5), transparent 60%), radial-gradient(40rem 30rem at 90% 100%, oklch(42% 0.11 226 / 0.5), transparent 60%)",
          }}
        />
        {/* うっすらとした海のライン */}
        <svg className="absolute bottom-0 left-0 w-full opacity-[0.14]" viewBox="0 0 800 200" fill="none" preserveAspectRatio="none">
          <path d="M0 120 Q 200 80 400 120 T 800 120 V200 H0 Z" fill="white" />
          <path d="M0 150 Q 200 110 400 150 T 800 150 V200 H0 Z" fill="white" opacity="0.6" />
        </svg>
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
              <Anchor size={20} />
            </div>
            <div className="font-bold tracking-wide">○○汽船株式会社</div>
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-snug">
              配船から入金まで、
              <br />
              進捗をリアルタイムで。
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
              受注した配船案件の確認事項を遠隔で監視し、期日超過や書類の不備を検出すると
              管理者へ自動で通知します。現場に行かずとも、進捗の停滞を見逃しません。
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
              <span>・確認事項の進捗管理</span>
              <span>・不備の自動アラート</span>
              <span>・担当者別の稼働状況</span>
            </div>
          </div>
          <div className="text-xs text-white/40">内航海運 配船・運航進捗モニタリングシステム(デモ)</div>
        </div>
      </div>

      {/* ---- 右:ログインフォーム ---- */}
      <div className="flex items-center justify-center bg-ink-100 px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
                <Anchor size={20} />
              </div>
              <div className="font-bold text-ink-900">○○汽船株式会社</div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-ink-900">ログイン</h2>
          <p className="mt-1 text-sm text-ink-500">運航管理システムにサインインします。</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="メールアドレス">
              <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </Field>
            <Field label="パスワード">
              <input className={inputCls} value={pw} onChange={(e) => setPw(e.target.value)} type="password" />
            </Field>
            <Button type="submit" loading={loading} className="w-full">
              ログイン
            </Button>
          </form>

          <div className="mt-5 flex items-start gap-2 rounded-xl bg-brand-50 px-3.5 py-3 text-xs text-brand-700">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            <span>
              デモ用アカウントを入力済みです。<b>そのまま「ログイン」</b>を押すとダッシュボードに入れます。
              (本デモに実際の認証は実装していません)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
