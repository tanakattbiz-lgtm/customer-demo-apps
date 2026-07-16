import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Users, Heart, MessageCircle, UserPlus, Check } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../store";
import { Button } from "../components/ui";

const INTEREST_OPTIONS = [
  "カメラ", "コーヒー", "読書", "料理", "キャンプ", "ランニング",
  "ガーデニング", "音楽", "旅行", "猫", "DIY", "映画",
];

export default function Login() {
  const nav = useNavigate();
  const login = useStore((s) => s.login);
  const register = useStore((s) => s.register);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);

  // 新規登録フォーム
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  const nameErr = name.length > 0 && name.trim().length < 2 ? "2文字以上で入力してください" : "";
  const handleErr =
    handle.length > 0 && !/^[a-zA-Z0-9_]{3,}$/.test(handle)
      ? "半角英数字とアンダースコア3文字以上"
      : "";
  const canSubmit =
    name.trim().length >= 2 &&
    /^[a-zA-Z0-9_]{3,}$/.test(handle) &&
    interests.length >= 1;

  const doDemoLogin = () => {
    setBusy(true);
    setTimeout(() => {
      login();
      toast.success("ようこそ! wag+ へ");
      nav("/");
    }, 700);
  };

  const doSignup = () => {
    if (!canSubmit) return;
    setBusy(true);
    setTimeout(() => {
      register({
        name: name.trim(),
        handle: handle.trim(),
        bio: bio.trim() || "はじめまして!よろしくお願いします😊",
        location: location.trim() || "日本",
        interests,
      });
      toast.success("会員登録が完了しました🎉");
      nav("/");
    }, 900);
  };

  const toggleInterest = (t: string) =>
    setInterests((cur) =>
      cur.includes(t) ? cur.filter((x) => x !== t) : cur.length < 5 ? [...cur, t] : cur,
    );

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* 左: ブランドパネル */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 p-12 lg:flex lg:flex-col">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, oklch(80% 0.15 60 / 0.6), transparent 45%), radial-gradient(circle at 80% 70%, oklch(70% 0.16 20 / 0.5), transparent 45%)",
          }}
        />
        <div className="relative flex items-center gap-2.5 text-white">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/20 backdrop-blur">
            <Users size={22} strokeWidth={2.4} />
          </div>
          <span className="text-2xl font-bold tracking-tight">wag+</span>
        </div>

        <div className="relative mt-auto">
          <h1 className="text-3xl font-bold leading-snug text-white">
            好きなことで、
            <br />
            ゆるくつながる。
          </h1>
          <p className="mt-4 max-w-sm leading-relaxed text-white/85">
            趣味や日々の暮らしを投稿して、同じ興味を持つ仲間と出会える。
            シンプルで、使う人にやさしいコミュニティ。
          </p>
          <div className="mt-8 flex gap-6 text-white/90">
            <Feature icon={<Heart size={18} />} label="いいね" />
            <Feature icon={<MessageCircle size={18} />} label="コメント" />
            <Feature icon={<UserPlus size={18} />} label="フォロー" />
          </div>
        </div>
      </div>

      {/* 右: フォーム */}
      <div className="flex items-center justify-center bg-ink-100 p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-md rounded-3xl border border-ink-200 bg-white p-8 shadow-sm"
        >
          {/* モバイル用ロゴ */}
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <Users size={18} strokeWidth={2.4} />
            </div>
            <span className="text-xl font-bold text-ink-900">wag+</span>
          </div>

          {/* タブ */}
          <div className="mb-6 flex rounded-full bg-ink-100 p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                  mode === m ? "bg-white text-ink-900 shadow-sm" : "text-ink-500"
                }`}
              >
                {m === "login" ? "ログイン" : "新規登録"}
              </button>
            ))}
          </div>

          {mode === "login" ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  ユーザーID または メール
                </label>
                <input
                  defaultValue="yui_aoki"
                  className="w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  パスワード
                </label>
                <input
                  type="password"
                  defaultValue="demopass"
                  className="w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div className="rounded-xl bg-brand-50 px-4 py-3 text-xs leading-relaxed text-brand-800">
                デモ用アカウントを入力済みです。そのまま「ログイン」を押してお試しください。
              </div>
              <Button onClick={doDemoLogin} loading={busy} className="w-full">
                ログイン
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="表示名" required error={nameErr}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例)青木 結衣"
                  className={inputCls(!!nameErr)}
                />
              </Field>
              <Field label="ユーザーID (@)" required error={handleErr}>
                <div className="flex items-center rounded-xl border border-ink-200 bg-ink-50 pl-3 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
                  <span className="text-sm text-ink-400">@</span>
                  <input
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="yui_aoki"
                    className="w-full bg-transparent px-1.5 py-2.5 text-sm outline-none"
                  />
                </div>
              </Field>
              <Field label="お住まい">
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="例)東京都 世田谷区"
                  className={inputCls(false)}
                />
              </Field>
              <Field label="自己紹介">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  placeholder="趣味や好きなことを書いてみましょう"
                  className={`${inputCls(false)} resize-none`}
                />
              </Field>
              <Field label="興味・関心" required hint={`1〜5個選択(${interests.length}/5)`}>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((t) => {
                    const on = interests.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleInterest(t)}
                        className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          on
                            ? "bg-brand-600 text-white"
                            : "bg-ink-100 text-ink-600 hover:bg-ink-200"
                        }`}
                      >
                        {on && <Check size={12} />}
                        {t}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Button onClick={doSignup} loading={busy} disabled={!canSubmit} className="w-full">
                同意して登録する
              </Button>
              <p className="text-center text-xs text-ink-400">
                ※ デモのため実際の登録・通信は行われません
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15">{icon}</span>
      {label}
    </div>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <label className="text-sm font-medium text-ink-700">{label}</label>
        {required && <span className="text-xs text-brand-600">必須</span>}
        {hint && <span className="ml-auto text-xs text-ink-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

const inputCls = (err: boolean) =>
  `w-full rounded-xl border bg-ink-50 px-4 py-2.5 text-sm outline-none focus:ring-2 ${
    err
      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
      : "border-ink-200 focus:border-brand-400 focus:ring-brand-100"
  }`;
