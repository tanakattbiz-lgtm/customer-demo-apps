import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, UserCog, Smartphone } from "lucide-react";
import { useStore } from "../store";
import { Button, Field, inputCls } from "../components/ui";

export default function Login() {
  const navigate = useNavigate();
  const loginStaff = useStore((s) => s.loginStaff);
  const loginAdmin = useStore((s) => s.loginAdmin);
  const staffList = useStore((s) => s.staffList);
  const admins = useStore((s) => s.admins);
  const offices = useStore((s) => s.offices);
  const vehicles = useStore((s) => s.vehicles);

  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [staffId, setStaffId] = useState(staffList[0]?.id ?? "");
  const [adminId, setAdminId] = useState(admins[0]?.id ?? "");
  const [loading, setLoading] = useState(false);

  const staff = staffList.find((s) => s.id === staffId);
  const office = offices.find((o) => o.id === staff?.officeId);
  const vehicle = vehicles.find((v) => v.id === staff?.vehicleId);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (role === "admin") {
        loginAdmin(adminId);
        navigate("/");
      } else {
        loginStaff(staffId);
        navigate("/staff");
      }
    }, 650);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* 左:ブランド面 */}
      <div className="relative hidden overflow-hidden bg-brand-700 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(45%_0.14_254),transparent_55%),radial-gradient(circle_at_80%_80%,oklch(35%_0.1_262),transparent_50%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
              <Car size={20} />
            </div>
            <span className="text-lg font-bold">社会福祉法人○○会 車両管理</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-snug">
              送迎・訪問車両の日常点検から
              <br />
              車検・保険まで、ひとつに。
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
              写真2枚を送るだけでアルコール・体温・走行距離を自動入力。管理者は確認するだけ。
              車検アラートや事故対応の記録もこの画面から一元管理できます。
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/85">
              <li>・ メーター/衛生チェック写真からAIが自動入力</li>
              <li>・ 確認者ログを自動保持し、監査にそのまま使える</li>
              <li>・ 車検満了日の60日前から自動アラート</li>
            </ul>
          </div>
          <p className="text-xs text-white/50">
            ※ これは提案用のデモ画面です。実在の企業・個人とは関係ありません。
          </p>
        </div>
      </div>

      {/* 右:ログインフォーム */}
      <div className="flex items-center justify-center bg-ink-100 px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
                <Car size={20} />
              </div>
              <span className="text-lg font-bold text-ink-900">社会福祉法人○○会 車両管理</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-ink-900">ログイン</h2>
          <p className="mt-1 text-sm text-ink-500">利用する画面を選んでください。</p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <RoleTab
              active={role === "staff"}
              onClick={() => setRole("staff")}
              icon={<Smartphone size={18} />}
              title="現場スタッフ"
              sub="日常点検の報告"
            />
            <RoleTab
              active={role === "admin"}
              onClick={() => setRole("admin")}
              icon={<UserCog size={18} />}
              title="管理者"
              sub="確認・監査・台帳"
            />
          </div>

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            {role === "staff" ? (
              <>
                <Field label="スタッフを選択(デモ用)">
                  <select
                    className={inputCls}
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                  >
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-xs text-ink-500">
                  <div>事業所: {office?.name}</div>
                  <div className="mt-0.5">
                    担当車両: {vehicle?.model}({vehicle?.plateNumber})
                  </div>
                </div>
                <Field label="パスワード">
                  <input className={inputCls} type="password" value="demo1234" readOnly />
                </Field>
              </>
            ) : (
              <>
                <Field label="管理者アカウントを選択(デモ用)">
                  <select
                    className={inputCls}
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                  >
                    {admins.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="パスワード">
                  <input className={inputCls} type="password" value="demo1234" readOnly />
                </Field>
              </>
            )}
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
