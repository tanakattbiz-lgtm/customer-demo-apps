import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Factory, Mail, FileSpreadsheet, ArrowRight } from "lucide-react";
import { useStore } from "../store";
import { Button, Field, inputCls, Spinner } from "../components/ui";
import { fakeApi } from "../lib/fakeApi";

export default function Login() {
  const login = useStore((s) => s.login);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setLoading(true);
    await fakeApi(true, 500);
    login();
    navigate("/");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* 左:ブランド面 */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-800 p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(oklch(80% 0.09 265 / 0.5) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
            <Factory size={20} />
          </div>
          <div className="leading-tight">
            <div className="font-bold">株式会社○○</div>
            <div className="text-xs text-brand-200">生産設備の設計・製造</div>
          </div>
        </div>
        <div className="relative">
          <h1 className="text-3xl leading-snug font-bold">
            見積依頼を、
            <br />
            ワンクリックで一括送信。
          </h1>
          <p className="mt-4 max-w-md text-sm text-brand-100">
            部品ごとの依頼先選定・図面の自動添付・個別メールの作成・送信履歴の記録までを、Excel と Outlook の操作から解放します。
          </p>
          <ul className="mt-6 space-y-2 text-sm text-brand-100">
            <li className="flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-brand-300" /> 部品・依頼先の入力シート
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-brand-300" /> 3社への個別メールを自動生成
            </li>
          </ul>
        </div>
        <div className="relative text-xs text-brand-300">提案用デモ環境 — 実データは含まれません</div>
      </div>

      {/* 右:ログインフォーム */}
      <div className="flex items-center justify-center bg-ink-100 p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="mb-2 grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white">
              <Factory size={20} />
            </div>
            <div className="text-lg font-bold text-ink-900">見積依頼 自動送信ツール</div>
          </div>
          <h2 className="text-xl font-bold text-ink-900">ログイン</h2>
          <p className="mt-1 text-sm text-ink-500">デモ用アカウントを入力済みです。そのままログインできます。</p>

          <div className="mt-6 space-y-4">
            <Field label="ユーザーID">
              <input className={inputCls} defaultValue="mori.h" readOnly />
            </Field>
            <Field label="パスワード">
              <input className={inputCls} type="password" defaultValue="demo-pass" readOnly />
            </Field>
            <Button className="w-full" onClick={onLogin} loading={loading}>
              {!loading && <ArrowRight size={16} />}
              {loading ? "接続中…" : "ログイン"}
            </Button>
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-ink-400">
            {loading && <Spinner size={12} />}
            本人確認は行いません(デモのため)
          </p>
        </div>
      </div>
    </div>
  );
}
