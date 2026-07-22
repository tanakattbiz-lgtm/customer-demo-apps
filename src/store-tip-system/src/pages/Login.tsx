import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Coffee, Heart, QrCode } from "lucide-react";
import { useStore } from "../store";
import { STORE_NAME, STORE_BRANCH } from "../data/seed";
import { Button, Field, inputCls } from "../components/ui";

export default function Login() {
  const navigate = useNavigate();
  const login = useStore((s) => s.login);
  const [email, setEmail] = useState("tencho@demo-store.example");
  const [pw, setPw] = useState("demo1234");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login();
      navigate("/");
    }, 650);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* 左:ブランド面 */}
      <div className="relative hidden overflow-hidden bg-brand-700 lg:block">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(120% 100% at 0% 0%, oklch(68% 0.17 37) 0%, oklch(52% 0.15 34) 55%, oklch(40% 0.11 33) 100%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <Coffee size={20} />
            </div>
            <div className="text-lg font-bold">
              Tip<span className="text-brand-100">Jar</span>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-snug">
              「ありがとう」を、
              <br />
              スタッフへ届ける。
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80">
              テーブルの QR からお客様がスタッフへチップを贈り、店舗はその受取・集計・精算を
              まとめて管理できます。
            </p>
            <div className="mt-8 flex items-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <QrCode size={18} /> QR で受付
              </div>
              <div className="flex items-center gap-2">
                <Heart size={18} className="fill-white/80" /> スタッフ応援
              </div>
            </div>
          </div>
          <div className="text-xs text-white/60">提案用デモ · 実在の店舗・個人とは関係ありません</div>
        </div>
      </div>

      {/* 右:ログインフォーム */}
      <div className="flex items-center justify-center bg-white px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2 text-lg font-bold text-ink-900">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
                <Coffee size={18} />
              </div>
              TipJar
            </div>
          </div>
          <h2 className="text-xl font-bold text-ink-900">店舗管理コンソール</h2>
          <p className="mt-1 text-sm text-ink-500">
            {STORE_NAME} {STORE_BRANCH}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <Field label="メールアドレス" required>
              <input
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </Field>
            <Field label="パスワード" required>
              <input
                className={inputCls}
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete="current-password"
              />
            </Field>
            <Button type="submit" loading={loading} className="w-full">
              {loading ? "サインイン中…" : "ログイン"}
            </Button>
          </form>

          <div className="mt-4 rounded-xl border border-dashed border-brand-200 bg-brand-50 px-4 py-3 text-xs text-brand-800">
            デモ用アカウントを入力済みです。<b>そのまま「ログイン」</b>を押すとダッシュボードに入れます。
          </div>
        </motion.div>
      </div>
    </div>
  );
}
