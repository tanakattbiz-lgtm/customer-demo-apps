import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Store,
  Check,
  Sparkles,
  TrendingUp,
  Camera,
  MessageSquare,
  ClipboardList,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../store";
import { REGIONS, ALL_TAGS, type MenuTag, type RegionKey } from "../data/seed";
import { Card, Pill, Button, Field, inputCls } from "../components/ui";
import { dateLabel } from "../lib/format";

const PLANS: { key: "free" | "standard" | "premium"; name: string; price: string; features: string[]; hot?: boolean }[] = [
  {
    key: "free",
    name: "無料掲載",
    price: "¥0 / 月",
    features: ["基本情報の掲載", "口コミの受付", "施工事例 3件まで"],
  },
  {
    key: "standard",
    name: "スタンダード",
    price: "掲載相談",
    features: ["施工事例 無制限", "検索上位への表示", "写真ギャラリー強化"],
    hot: true,
  },
  {
    key: "premium",
    name: "プレミアム",
    price: "掲載相談",
    features: ["ランキング優先枠", "PRバッジ表示", "アクセス分析レポート"],
  },
];

const BENEFITS = [
  { icon: TrendingUp, title: "探しているユーザーに届く", desc: "エリア・施工内容で絞り込む来店意欲の高い層にリーチできます。" },
  { icon: Camera, title: "施工事例で魅せる", desc: "写真ギャラリーで技術力を視覚的にアピールできます。" },
  { icon: MessageSquare, title: "口コミが集客資産に", desc: "利用者の声がそのまま次の来店につながります。" },
];

export default function Apply() {
  const addApplication = useStore((s) => s.addApplication);
  const applications = useStore((s) => s.applications);

  const [shopName, setShopName] = useState("");
  const [region, setRegion] = useState<RegionKey | "">("");
  const [pref, setPref] = useState("");
  const [contact, setContact] = useState("");
  const [menus, setMenus] = useState<MenuTag[]>([]);
  const [plan, setPlan] = useState<"free" | "standard" | "premium">("standard");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const toggleMenu = (t: MenuTag) =>
    setMenus((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  const err = {
    shopName: !shopName.trim() ? "店舗名を入力してください" : "",
    region: !region ? "エリアを選択してください" : "",
    pref: !pref.trim() ? "都道府県・市区町村を入力してください" : "",
    contact: !contact.trim() ? "ご担当者名を入力してください" : "",
    menus: menus.length === 0 ? "対応メニューを1つ以上選択してください" : "",
  };
  const valid = Object.values(err).every((e) => !e);

  const submit = async () => {
    setTouched(true);
    if (!valid) {
      toast.error("未入力の項目があります。ご確認ください。");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    addApplication({
      shopName: shopName.trim(),
      region: region as RegionKey,
      pref: pref.trim(),
      contact: contact.trim(),
      menus,
      plan,
      message: message.trim(),
    });
    setSaving(false);
    setDone(true);
    toast.success("掲載申し込みを受け付けました");
  };

  const resetForm = () => {
    setShopName("");
    setRegion("");
    setPref("");
    setContact("");
    setMenus([]);
    setPlan("standard");
    setMessage("");
    setTouched(false);
    setDone(false);
  };

  return (
    <div className="space-y-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
        <ArrowLeft size={16} /> トップへ戻る
      </Link>

      {/* ヒーロー */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 px-6 py-10 text-white sm:px-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-aqua-400/25 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <Store size={13} /> 掲載をご検討の店舗様へ
          </span>
          <h1 className="mt-3 text-2xl font-extrabold leading-snug sm:text-3xl">
            あなたの技術を、
            <br className="hidden sm:block" />
            探しているお客様に届けませんか。
          </h1>
          <p className="mt-2 text-sm text-white/80">
            まずは無料掲載から。お申し込み後、運営で内容を確認のうえ掲載準備を進めます。
          </p>
        </div>
      </section>

      {/* メリット */}
      <section className="grid gap-4 sm:grid-cols-3">
        {BENEFITS.map((b) => {
          const Icon = b.icon;
          return (
            <Card key={b.title} className="p-5">
              <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Icon size={20} />
              </div>
              <div className="text-sm font-bold text-ink-900">{b.title}</div>
              <p className="mt-1 text-xs leading-relaxed text-ink-500">{b.desc}</p>
            </Card>
          );
        })}
      </section>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="p-8 text-center">
              <motion.div
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600"
              >
                <CheckCircle2 size={34} />
              </motion.div>
              <h2 className="text-xl font-extrabold text-ink-900">お申し込みを受け付けました</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
                「{shopName}」の掲載申し込みを受け付けました。運営で内容を確認のうえ、掲載準備を進めます。
                現在のステータスは <Pill tone="amber">審査中</Pill> です。
              </p>
              <div className="mt-6 flex justify-center gap-2">
                <Button variant="outline" onClick={resetForm}>
                  続けて別の店舗を申し込む
                </Button>
                <Button onClick={() => (window.location.hash = "#/")}>トップへ戻る</Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.section
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-6 lg:grid-cols-3"
          >
            {/* フォーム */}
            <Card className="p-6 lg:col-span-2">
              <div className="mb-5 flex items-center gap-2">
                <ClipboardList size={18} className="text-brand-500" />
                <h2 className="text-lg font-bold text-ink-900">掲載申し込みフォーム</h2>
              </div>
              <div className="space-y-4">
                <Field label="店舗名" required error={touched ? err.shopName : ""}>
                  <input
                    className={inputCls}
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="例：グロスファクトリー 横浜"
                  />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="エリア" required error={touched ? err.region : ""}>
                    <select
                      className={inputCls}
                      value={region}
                      onChange={(e) => setRegion(e.target.value as RegionKey | "")}
                    >
                      <option value="">選択してください</option>
                      {REGIONS.map((r) => (
                        <option key={r.key} value={r.key}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="都道府県・市区町村" required error={touched ? err.pref : ""}>
                    <input
                      className={inputCls}
                      value={pref}
                      onChange={(e) => setPref(e.target.value)}
                      placeholder="例：神奈川県 横浜市港北区"
                    />
                  </Field>
                </div>
                <Field
                  label="ご担当者名"
                  required
                  error={touched ? err.contact : ""}
                  hint="※ このデモでは連絡先の入力は不要です（担当者名のみ）"
                >
                  <input
                    className={inputCls}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="例：山田 太郎"
                  />
                </Field>

                <Field
                  label="対応できる施工メニュー"
                  required
                  error={touched ? err.menus : ""}
                  hint="お店で対応しているメニューを選択してください（複数可）"
                >
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ALL_TAGS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleMenu(t)}
                        className={
                          "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition " +
                          (menus.includes(t)
                            ? "border-brand-500 bg-brand-500 text-white"
                            : "border-ink-200 bg-white text-ink-600 hover:border-brand-300")
                        }
                      >
                        {menus.includes(t) && <Check size={12} />}
                        {t}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="お店のPR・ご要望（任意）">
                  <textarea
                    className={inputCls + " min-h-24 resize-none"}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="お店の強みや、掲載にあたってのご要望があればご記入ください。"
                  />
                </Field>

                <div className="flex items-center justify-between border-t border-ink-100 pt-4">
                  <span className="text-xs text-ink-400">
                    選択中のプラン：<span className="font-semibold text-ink-700">{PLANS.find((p) => p.key === plan)?.name}</span>
                  </span>
                  <Button onClick={submit} loading={saving}>
                    {saving ? "送信中…" : "この内容で申し込む"}
                  </Button>
                </div>
              </div>
            </Card>

            {/* プラン選択 */}
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink-800">
                <Sparkles size={16} className="text-brand-500" /> 掲載プランを選ぶ
              </h2>
              {PLANS.map((p) => {
                const active = plan === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPlan(p.key)}
                    className={
                      "block w-full rounded-2xl border p-4 text-left transition " +
                      (active
                        ? "border-brand-500 bg-brand-50 ring-2 ring-brand-400/25"
                        : "border-ink-200 bg-white hover:border-brand-300")
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-ink-900">{p.name}</span>
                        {p.hot && <Pill tone="aqua">人気</Pill>}
                      </div>
                      <span
                        className={
                          "grid h-5 w-5 place-items-center rounded-full border transition " +
                          (active ? "border-brand-500 bg-brand-500 text-white" : "border-ink-300 text-transparent")
                        }
                      >
                        <Check size={12} />
                      </span>
                    </div>
                    <div className="tnum mt-0.5 text-xs font-semibold text-brand-600">{p.price}</div>
                    <ul className="mt-2 space-y-1">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-center gap-1.5 text-xs text-ink-500">
                          <Check size={13} className="shrink-0 text-emerald-500" /> {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
              <p className="px-1 text-[11px] leading-relaxed text-ink-400">
                ※ 有料プランの料金・お支払いはこのデモには含まれていません。掲載可否は運営の審査後にご案内します。
              </p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 申し込み履歴(このデモで送信したもの) */}
      {applications.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold text-ink-800">
            このデモで送信した申し込み（{applications.length}件）
          </h2>
          <Card className="divide-y divide-ink-100">
            {applications.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink-800">{a.shopName}</span>
                    <Pill tone="amber">{a.status}</Pill>
                  </div>
                  <div className="mt-0.5 text-xs text-ink-400">
                    {a.pref}・{REGIONS.find((r) => r.key === a.region)?.label}・
                    {PLANS.find((p) => p.key === a.plan)?.name}・{dateLabel(a.createdAt)}
                  </div>
                </div>
                <span className="hidden shrink-0 gap-1 sm:flex">
                  {a.menus.slice(0, 2).map((m) => (
                    <Pill key={m} tone="blue">
                      {m}
                    </Pill>
                  ))}
                  {a.menus.length > 2 && <Pill tone="gray">+{a.menus.length - 2}</Pill>}
                </span>
              </div>
            ))}
          </Card>
        </section>
      )}
    </div>
  );
}
