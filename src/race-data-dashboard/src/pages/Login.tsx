import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, ShieldCheck, Radio, Clock3, Table2 } from "lucide-react";
import { useStore } from "../store";
import { Button, Field, inputCls } from "../components/ui";
import { fakeApi } from "../lib/fakeApi";

export default function Login() {
  const login = useStore((s) => s.login);
  const navigate = useNavigate();
  const [uid, setUid] = useState("kanri01");
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
      {/* ---- 左:ブランドパネル(引き算・情緒は控えめ) ---- */}
      <div className="relative hidden overflow-hidden bg-brand-900 lg:block">
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            background:
              "radial-gradient(50rem 40rem at 20% 0%, oklch(51% 0.12 156 / 0.55), transparent 60%), radial-gradient(40rem 30rem at 90% 100%, oklch(43% 0.1 158 / 0.5), transparent 60%)",
          }}
        />
        <svg
          className="absolute bottom-0 left-0 w-full opacity-[0.12]"
          viewBox="0 0 800 200"
          fill="none"
          preserveAspectRatio="none"
        >
          <path d="M0 130 Q 200 90 400 130 T 800 130 V200 H0 Z" fill="white" />
          <path d="M0 160 Q 200 120 400 160 T 800 160 V200 H0 Z" fill="white" opacity="0.6" />
        </svg>
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
              <Trophy size={20} />
            </div>
            <div className="font-bold tracking-wide">○○競馬ポータル 運用管理</div>
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-snug">
              取得から掲載まで、
              <br />
              レース運用を全自動で。
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
              朝一の出走表取得・ページ生成から、レース確定後の結果掲載までを自動化。
              管理者は各レースの処理状況と実行ログを一画面で監視できます。
            </p>
            <div className="mt-8 space-y-2 text-sm text-white/75">
              <div className="flex items-center gap-2">
                <Clock3 size={16} className="text-white/60" /> 朝一のスケジュール・出走表を自動取得
              </div>
              <div className="flex items-center gap-2">
                <Table2 size={16} className="text-white/60" /> 確定後、結果テーブルを自動生成・公開
              </div>
              <div className="flex items-center gap-2">
                <Radio size={16} className="text-white/60" /> JRA-VAN / 競馬最強の法則WEB 連携
              </div>
            </div>
          </div>
          <div className="text-xs text-white/40">競馬データ取得・自動掲載 管理システム(デモ)</div>
        </div>
      </div>

      {/* ---- 右:ログインフォーム ---- */}
      <div className="flex items-center justify-center bg-ink-100 px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
                <Trophy size={20} />
              </div>
              <div className="font-bold text-ink-900">○○競馬ポータル 運用管理</div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-ink-900">ログイン</h2>
          <p className="mt-1 text-sm text-ink-500">運用管理ダッシュボードにサインインします。</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="ログインID">
              <input className={inputCls} value={uid} onChange={(e) => setUid(e.target.value)} autoComplete="username" />
            </Field>
            <Field label="パスワード">
              <input
                className={inputCls}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                type="password"
                autoComplete="current-password"
              />
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
