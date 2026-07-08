import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Scale, ShieldCheck } from "lucide-react";
import { useStore } from "../store/useStore";
import { Button, Field, inputCls } from "../components/ui";

export default function Login() {
  const login = useStore((s) => s.login);
  const nav = useNavigate();
  const [email, setEmail] = useState("t-tanaka@minato-law.example.jp");
  const [pw, setPw] = useState("demo-password");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login();
      nav("/");
    }, 650);
  };

  return (
    <div className="grid min-h-full lg:grid-cols-2">
      {/* 左:ブランドパネル */}
      <div className="relative hidden overflow-hidden bg-brand-900 lg:block">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(40rem 30rem at 20% 10%, oklch(48% 0.15 264 / 0.7), transparent 60%), radial-gradient(36rem 28rem at 90% 100%, oklch(40% 0.13 290 / 0.6), transparent 60%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15">
              <Scale size={22} />
            </div>
            <div>
              <div className="text-lg font-bold">LegalFlow</div>
              <div className="text-xs text-brand-200">
                弁護士業務効率化プラットフォーム
              </div>
            </div>
          </div>
          <div className="max-w-md">
            <h2 className="text-3xl leading-snug font-bold">
              案件・顧問先・請求を、
              <br />
              ひとつの画面で。
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-brand-100/90">
              案件管理、リアルタイムのやり取り、クレジットカード決済、
              メール通知までを一気通貫。事務作業を減らし、先生方が
              「本来の仕事」に集中できる環境をつくります。
            </p>
            <ul className="mt-6 space-y-2 text-sm text-brand-100/90">
              {["案件のステータスと期日を一元管理", "顧問先とテキストでリアルタイムに連絡", "請求書のカード決済・入金消込を自動化"].map(
                (t) => (
                  <li key={t} className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-gold-400" />
                    {t}
                  </li>
                ),
              )}
            </ul>
          </div>
          <div className="text-xs text-brand-300">
            © 2026 みなと総合法律事務所 — デモ環境
          </div>
        </div>
      </div>

      {/* 右:ログインフォーム */}
      <div className="flex items-center justify-center bg-ink-100 p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <Scale size={20} />
            </div>
            <div>
              <div className="font-bold text-ink-900">LegalFlow</div>
              <div className="text-xs text-ink-500">みなと総合法律事務所</div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-ink-900">ログイン</h1>
          <p className="mt-1.5 text-sm text-ink-500">
            デモ用アカウントを入力済みです。そのまま「ログイン」を押してください。
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="メールアドレス" required>
              <input
                type="email"
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="パスワード" required>
              <input
                type="password"
                className={inputCls}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-ink-600">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-ink-300 accent-brand-600"
              />
              ログイン状態を保持する
            </label>
            <Button type="submit" loading={loading} className="w-full">
              ログイン
            </Button>
          </form>

          <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-xs text-brand-700">
            これはデモ環境です。実際の認証は行われません。入力内容は保存されません。
          </div>
        </motion.div>
      </div>
    </div>
  );
}
