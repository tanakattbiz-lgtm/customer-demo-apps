import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, ShieldCheck, BarChart3, ClipboardList, Users } from "lucide-react";
import { useStore } from "../store";
import { Button, Field, inputCls } from "../components/ui";
import { fakeApi } from "../lib/fakeApi";

export default function Login() {
  const login = useStore((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState("kanri@sales-board.example.jp");
  const [pw, setPw] = useState("demo-pass-2609");
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
      {/* ---- 左:ブランドパネル ---- */}
      <div className="relative hidden overflow-hidden bg-brand-900 lg:block">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(48rem 38rem at 15% 0%, oklch(54% 0.19 270 / 0.55), transparent 60%), radial-gradient(40rem 30rem at 95% 100%, oklch(47% 0.18 270 / 0.5), transparent 60%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
              <TrendingUp size={20} />
            </div>
            <div className="font-bold tracking-wide">SalesBoard</div>
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-snug">
              営業の数字を、
              <br />
              チームで一つの画面に。
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
              日報の入力から売上・KPI の可視化までを 1 システムに集約。
              権限に応じて全社ビューと個人ビューを出し分け、営業の進捗を止めずに管理します。
            </p>
            <div className="mt-8 grid max-w-md gap-3 text-sm text-white/80">
              <span className="flex items-center gap-2.5">
                <ClipboardList size={17} className="text-brand-200" /> 日報・営業KPIの入力
              </span>
              <span className="flex items-center gap-2.5">
                <BarChart3 size={17} className="text-brand-200" /> 売上・KPI ダッシュボード
              </span>
              <span className="flex items-center gap-2.5">
                <Users size={17} className="text-brand-200" /> 権限管理(管理者・社員)/ CSV 入出力
              </span>
            </div>
          </div>
          <div className="text-xs text-white/40">
            営業管理システム 提案用デモ ／ 発注元:株式会社○○ 様
          </div>
        </div>
      </div>

      {/* ---- 右:ログインフォーム ---- */}
      <div className="flex items-center justify-center bg-ink-100 px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
                <TrendingUp size={20} />
              </div>
              <div className="font-bold text-ink-900">SalesBoard</div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-ink-900">ログイン</h2>
          <p className="mt-1 text-sm text-ink-500">営業管理システムにサインインします。</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="メールアドレス">
              <input
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </Field>
            <Field label="パスワード">
              <input
                className={inputCls}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                type="password"
              />
            </Field>
            <Button type="submit" loading={loading} className="w-full">
              ログイン
            </Button>
          </form>

          <div className="mt-5 flex items-start gap-2 rounded-xl bg-brand-50 px-3.5 py-3 text-xs text-brand-700">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            <span>
              デモ用アカウントを入力済みです。<b>そのまま「ログイン」</b>
              を押すとダッシュボードに入れます。(本デモに実際の認証は実装していません)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
