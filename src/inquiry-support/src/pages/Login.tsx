import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Inbox, Sparkles, ShieldCheck } from "lucide-react";
import { useStore } from "../store";
import { Button, Field, inputCls } from "../components/ui";
import { fakeApi } from "../lib/fakeApi";

export default function Login() {
  const navigate = useNavigate();
  const login = useStore((s) => s.login);
  const [id, setId] = useState("hashimoto");
  const [pw, setPw] = useState("demo1234");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fakeApi(true, 500);
    login();
    navigate("/");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* 左:ブランドパネル */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-700 p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(60% 50% at 15% 10%, oklch(60% 0.17 275 / 0.7), transparent), radial-gradient(50% 60% at 90% 90%, oklch(46% 0.17 230 / 0.6), transparent)",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
            <Inbox size={20} />
          </div>
          <div className="leading-tight">
            <div className="font-bold">問い合わせデスク</div>
            <div className="text-xs text-white/70">株式会社○○</div>
          </div>
        </div>
        <div className="relative space-y-5">
          <h1 className="text-3xl font-bold leading-snug">
            問い合わせ対応を、
            <br />
            AIでもっと軽く。
          </h1>
          <ul className="space-y-3 text-sm text-white/85">
            <li className="flex items-center gap-2.5">
              <Sparkles size={16} className="shrink-0" />
              届いた相談を AI が自動で要約・分類・優先度付け
            </li>
            <li className="flex items-center gap-2.5">
              <Sparkles size={16} className="shrink-0" />
              返信文の下書きをワンクリックで作成
            </li>
            <li className="flex items-center gap-2.5">
              <Sparkles size={16} className="shrink-0" />
              定型文・資料テンプレートで毎回の手間をゼロに
            </li>
          </ul>
        </div>
        <div className="relative text-xs text-white/60">
          ※ これは提案用のデモ画面です。データはすべてサンプルです。
        </div>
      </div>

      {/* 右:ログインフォーム */}
      <div className="flex items-center justify-center bg-ink-100 p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:hidden">
            <div className="mb-2 grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white">
              <Inbox size={20} />
            </div>
            <div className="text-lg font-bold text-ink-900">問い合わせデスク</div>
            <div className="text-xs text-ink-400">株式会社○○</div>
          </div>
          <h2 className="text-xl font-bold text-ink-900">ログイン</h2>
          <p className="mt-1 text-sm text-ink-500">
            デモ用アカウントを入力済みです。そのまま「ログイン」を押してください。
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="ユーザーID">
              <input className={inputCls} value={id} onChange={(e) => setId(e.target.value)} />
            </Field>
            <Field label="パスワード">
              <input
                type="password"
                className={inputCls}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
            </Field>
            <Button type="submit" loading={loading} className="w-full">
              ログイン
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-2 rounded-xl bg-white p-3 text-xs text-ink-500 ring-1 ring-ink-200">
            <ShieldCheck size={16} className="shrink-0 text-emerald-500" />
            本物の認証は行いません。入力内容は保存されません。
          </div>
        </div>
      </div>
    </div>
  );
}
