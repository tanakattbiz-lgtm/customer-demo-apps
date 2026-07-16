import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, UserCog, Smartphone } from "lucide-react";
import { useStore } from "../store";
import { Button, Field, inputCls } from "../components/ui";

export default function Login() {
  const navigate = useNavigate();
  const login = useStore((s) => s.login);
  const [role, setRole] = useState<"admin" | "staff">("admin");
  const [loading, setLoading] = useState(false);

  const account =
    role === "admin"
      ? { id: "leader@demo", pw: "demo1234" }
      : { id: "staff@demo", pw: "demo1234" };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login();
      navigate(role === "admin" ? "/" : "/staff");
    }, 650);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* 左:ブランド面 */}
      <div className="relative hidden overflow-hidden bg-brand-700 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(55%_0.16_265),transparent_55%),radial-gradient(circle_at_80%_80%,oklch(45%_0.14_285),transparent_50%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
              <CalendarClock size={20} />
            </div>
            <span className="text-lg font-bold">○○ダイニング シフト管理</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-snug">
              シフト希望の回収から
              <br />
              作成・公開までを、ひとつに。
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
              LINE・紙・Excel でバラバラだったシフト業務を、スマホひとつで完結。
              提出状況の確認も、希望の集計も、公開もこの画面から。
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/85">
              <li>・ スタッフはプルダウンで希望を提出するだけ</li>
              <li>・ 提出状況・未提出者がひと目でわかる</li>
              <li>・ 集めた希望を見ながらシフトを作成・公開</li>
            </ul>
          </div>
          <p className="text-xs text-white/50">
            ※ これは提案用のデモ画面です。実在の店舗・個人とは関係ありません。
          </p>
        </div>
      </div>

      {/* 右:ログインフォーム */}
      <div className="flex items-center justify-center bg-ink-100 px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
                <CalendarClock size={20} />
              </div>
              <span className="text-lg font-bold text-ink-900">○○ダイニング シフト管理</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-ink-900">ログイン</h2>
          <p className="mt-1 text-sm text-ink-500">利用する画面を選んでください。</p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <RoleTab
              active={role === "admin"}
              onClick={() => setRole("admin")}
              icon={<UserCog size={18} />}
              title="管理者"
              sub="バイトリーダー"
            />
            <RoleTab
              active={role === "staff"}
              onClick={() => setRole("staff")}
              icon={<Smartphone size={18} />}
              title="スタッフ"
              sub="アルバイト"
            />
          </div>

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <Field label="ログインID">
              <input className={inputCls} value={account.id} readOnly />
            </Field>
            <Field label="パスワード">
              <input className={inputCls} type="password" value={account.pw} readOnly />
            </Field>
            <Button type="submit" loading={loading} className="w-full">
              {role === "admin" ? "管理者としてログイン" : "スタッフとしてログイン"}
            </Button>
          </form>

          <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-xs leading-relaxed text-brand-700">
            デモ用アカウントを入力済みです。ボタンを押すとそのまま入れます。
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleTab({
  active,
  onClick,
  icon,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition " +
        (active
          ? "border-brand-400 bg-brand-50 ring-2 ring-brand-400/25"
          : "border-ink-200 bg-white hover:bg-ink-50")
      }
    >
      <span className={active ? "text-brand-600" : "text-ink-400"}>{icon}</span>
      <span className="text-sm font-bold text-ink-900">{title}</span>
      <span className="text-[11px] text-ink-400">{sub}</span>
    </button>
  );
}
