import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Plus,
  Briefcase,
  Users,
  Eye,
  Sparkles,
  ExternalLink,
  Search,
  Inbox,
  CheckCircle2,
} from "lucide-react";
import { useStore } from "../store";
import {
  PREFECTURES,
  REGIONS,
  CATEGORIES,
  isNew,
  type Category,
  type Employment,
  type Application,
} from "../data/seed";
import { wageText, fromNow, ymd } from "../lib/format";
import { useLoad } from "../lib/useLoad";
import { CategoryIcon } from "../components/CategoryIcon";
import {
  Button,
  Tag,
  Card,
  Modal,
  Field,
  inputCls,
  Skeleton,
  EmptyState,
} from "../components/ui";

const EMPLOYMENTS: Employment[] = ["正社員", "契約社員", "紹介予定派遣", "派遣"];
const TAG_CHOICES = [
  "未経験歓迎",
  "学歴不問",
  "20代活躍中",
  "30代活躍中",
  "週休2日",
  "土日祝休み",
  "交通費支給",
  "寮・社宅あり",
  "研修制度あり",
  "資格取得支援",
  "服装自由",
  "ブランクOK",
  "前職不問",
];
const APP_STATUS: Application["status"][] = ["新規応募", "書類確認中", "面接調整中"];

export default function Admin() {
  const loading = useLoad(480, []);
  const jobs = useStore((s) => s.jobs);
  const applications = useStore((s) => s.applications);
  const [tab, setTab] = useState<"jobs" | "apps">("jobs");
  const [addOpen, setAddOpen] = useState(false);

  const kpi = useMemo(() => {
    const published = jobs.filter((j) => j.published).length;
    const views = jobs.reduce((a, j) => a + j.views, 0);
    const todayApps = applications.filter(
      (a) => Date.now() - +new Date(a.appliedAt) < 1000 * 60 * 60 * 24,
    ).length;
    return { published, views, apps: applications.length, todayApps };
  }, [jobs, applications]);

  return (
    <div className="min-h-full bg-ink-100">
      {/* 管理ヘッダー(業務系・引き算) */}
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-900 text-xs font-bold text-white">
              管理
            </span>
            <div>
              <div className="text-sm font-bold text-ink-900">求人管理コンソール</div>
              <div className="text-xs text-ink-400">株式会社○○ 採用管理</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-500 transition hover:bg-ink-100 hover:text-ink-800"
            >
              <ExternalLink size={15} /> 公開サイトを見る
            </Link>
            <div className="hidden h-8 w-8 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 sm:grid">
              山
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* KPI */}
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi icon={<Briefcase size={16} />} label="掲載中の求人" value={kpi.published} unit="件" loading={loading} />
          <Kpi icon={<Users size={16} />} label="累計応募数" value={kpi.apps} unit="件" loading={loading} accent />
          <Kpi icon={<Inbox size={16} />} label="本日の新規応募" value={kpi.todayApps} unit="件" loading={loading} />
          <Kpi icon={<Eye size={16} />} label="求人の閲覧数" value={kpi.views} unit="回" loading={loading} />
        </div>

        {/* タブ + 追加ボタン */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl border border-ink-200 bg-white p-1">
            <TabBtn active={tab === "jobs"} onClick={() => setTab("jobs")}>
              求人一覧
              <span className="ml-1.5 tnum text-xs text-ink-400">{jobs.length}</span>
            </TabBtn>
            <TabBtn active={tab === "apps"} onClick={() => setTab("apps")}>
              応募者
              <span className="ml-1.5 tnum text-xs text-ink-400">{applications.length}</span>
            </TabBtn>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus size={16} /> 求人を追加
          </Button>
        </div>

        {loading ? (
          <Card className="divide-y divide-ink-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="mb-2 h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </Card>
        ) : tab === "jobs" ? (
          <JobsTable onAdd={() => setAddOpen(true)} />
        ) : (
          <AppsTable />
        )}

        {/* フッター: リセット */}
        <div className="mt-8 flex items-center justify-between border-t border-ink-200 pt-4 text-xs text-ink-400">
          <span>※ これはデモ環境です。入力データはこのブラウザにのみ保存されます。</span>
          <ResetButton />
        </div>
      </main>

      <AddJobModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

// ---------------- KPI ----------------
function Kpi({
  icon,
  label,
  value,
  unit,
  loading,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  loading: boolean;
  accent?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center gap-1.5 text-ink-400">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="h-7 w-16" />
      ) : (
        <div className={"text-2xl font-bold tnum " + (accent ? "text-brand-600" : "text-ink-900")}>
          {value.toLocaleString()}
          <span className="ml-0.5 text-sm font-medium text-ink-400">{unit}</span>
        </div>
      )}
    </Card>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-lg px-4 py-2 text-sm font-semibold transition " +
        (active ? "bg-ink-900 text-white" : "text-ink-500 hover:text-ink-800")
      }
    >
      {children}
    </button>
  );
}

// ---------------- 求人一覧 ----------------
function JobsTable({ onAdd }: { onAdd: () => void }) {
  const jobs = useStore((s) => s.jobs);
  const applications = useStore((s) => s.applications);
  const togglePublish = useStore((s) => s.togglePublish);
  const [q, setQ] = useState("");

  const filtered = jobs.filter(
    (j) => !q.trim() || `${j.title}${j.company}${j.prefecture}${j.city}`.includes(q.trim()),
  );

  const appCount = (jobId: string) =>
    applications.filter((a) => a.jobId === jobId).length;

  return (
    <Card>
      <div className="border-b border-ink-100 p-3">
        <div className="relative max-w-xs">
          <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="求人を検索"
            className="w-full rounded-lg border border-ink-200 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={28} />}
          title="求人がありません"
          description="最初の求人を登録して、公開サイトに掲載しましょう。"
          action={
            <Button variant="soft" onClick={onAdd}>
              <Plus size={16} /> 求人を追加
            </Button>
          }
        />
      ) : (
        <div className="divide-y divide-ink-100">
          {/* 見出し(PC) */}
          <div className="hidden grid-cols-[1fr_120px_130px_90px_90px] gap-3 px-4 py-2.5 text-xs font-semibold text-ink-400 sm:grid">
            <span>求人</span>
            <span>勤務地</span>
            <span>給与</span>
            <span className="text-center">応募</span>
            <span className="text-right">公開</span>
          </div>
          {filtered.map((j) => (
            <div
              key={j.id}
              className="grid grid-cols-1 gap-2 px-4 py-3 transition hover:bg-ink-50 sm:grid-cols-[1fr_120px_130px_90px_90px] sm:items-center sm:gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-500">
                  <CategoryIcon category={j.category} size={16} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-ink-900">{j.title}</span>
                    {isNew(j.postedAt) && (
                      <Tag tone="brand" className="shrink-0">
                        <Sparkles size={10} /> 新着
                      </Tag>
                    )}
                  </div>
                  <div className="truncate text-xs text-ink-400">
                    {j.company} ・ {j.employment} ・ {fromNow(j.postedAt)}
                  </div>
                </div>
              </div>
              <div className="text-sm text-ink-600">
                {j.prefecture}
                <span className="text-ink-400"> {j.city}</span>
              </div>
              <div className="text-sm font-medium text-ink-800">{wageText(j.wage)}</div>
              <div className="text-sm sm:text-center">
                <span className="tnum font-bold text-brand-600">{appCount(j.id)}</span>
                <span className="text-xs text-ink-400"> 件</span>
              </div>
              <div className="sm:text-right">
                <Toggle on={j.published} onChange={() => togglePublish(j.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={
        "relative inline-flex h-6 w-11 items-center rounded-full transition " +
        (on ? "bg-mint-500" : "bg-ink-300")
      }
      aria-pressed={on}
      title={on ? "公開中" : "非公開"}
    >
      <span
        className={
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition " +
          (on ? "translate-x-5" : "translate-x-0.5")
        }
      />
    </button>
  );
}

// ---------------- 応募者 ----------------
function AppsTable() {
  const applications = useStore((s) => s.applications);
  const setAppStatus = useStore((s) => s.setAppStatus);

  if (applications.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Inbox size={28} />}
          title="まだ応募はありません"
          description="求人が公開されると、応募が入り次第ここに一覧表示されます。"
        />
      </Card>
    );
  }

  const toneOf = (s: Application["status"]) =>
    s === "新規応募" ? "brand" : s === "面接調整中" ? "mint" : "amber";

  return (
    <div className="grid gap-3">
      {applications.map((a) => (
        <Card key={a.id} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 font-bold text-brand-700">
                {a.name.trim().slice(0, 1)}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-ink-900">{a.name}</span>
                  <span className="text-xs text-ink-400">{a.kana}</span>
                  <Tag tone="gray">{a.era}</Tag>
                </div>
                <div className="mt-0.5 text-xs text-ink-400">
                  {ymd(a.appliedAt)} 応募 ・ 希望勤務地: {a.desiredArea || "未記入"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tag tone={toneOf(a.status)}>
                {a.status === "面接調整中" && <CheckCircle2 size={12} />}
                {a.status}
              </Tag>
              <select
                value={a.status}
                onChange={(e) => {
                  setAppStatus(a.id, e.target.value as Application["status"]);
                  toast.success(`ステータスを「${e.target.value}」に更新しました`);
                }}
                className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-medium text-ink-700 outline-none focus:border-brand-400"
              >
                {APP_STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 rounded-xl bg-ink-50 p-3 text-sm text-ink-700">
            <div className="mb-1 text-xs font-semibold text-ink-400">応募先: {a.jobTitle}</div>
            <div>
              <span className="text-ink-400">経験: </span>
              {a.experience}
            </div>
            <div className="mt-1">
              <span className="text-ink-400">メッセージ: </span>
              {a.message}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ---------------- リセット ----------------
function ResetButton() {
  const reset = useStore((s) => s.reset);
  return (
    <button
      onClick={() => {
        if (confirm("すべてのデータを初期状態に戻します。よろしいですか?")) {
          reset();
          toast.success("初期データに戻しました");
        }
      }}
      className="font-medium text-ink-400 underline decoration-ink-300 underline-offset-2 transition hover:text-rose-600"
    >
      デモデータをリセット
    </button>
  );
}

// ---------------- 求人追加モーダル ----------------
function AddJobModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addJob = useStore((s) => s.addJob);
  const [saving, setSaving] = useState(false);

  const empty = {
    title: "",
    company: "株式会社○○",
    category: "" as Category | "",
    prefecture: "",
    city: "",
    employment: "正社員" as Employment,
    wageType: "月給" as "月給" | "時給",
    wageMin: "",
    wageMax: "",
    catch: "",
    body: "",
    hours: "9:00〜18:00(実働8h)",
    holiday: "週休2日制(シフト制)",
    tags: [] as string[],
  };
  const [f, setF] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k as string]: "" }));
  };

  const toggleTag = (t: string) =>
    setF((p) => ({
      ...p,
      tags: p.tags.includes(t) ? p.tags.filter((x) => x !== t) : [...p.tags, t],
    }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!f.title.trim()) e.title = "求人タイトルを入力してください";
    if (!f.category) e.category = "職種を選んでください";
    if (!f.prefecture) e.prefecture = "都道府県を選んでください";
    if (!f.city) e.city = "市区町村を選んでください";
    const min = Number(f.wageMin);
    const max = Number(f.wageMax);
    if (!f.wageMin || !f.wageMax) e.wageMin = "給与の下限・上限を入力してください";
    else if (min <= 0 || max <= 0) e.wageMin = "0より大きい数値を入力してください";
    else if (min > max) e.wageMin = "上限は下限以上にしてください";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) {
      toast.error("入力内容をご確認ください");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 850));
    addJob({
      title: f.title.trim(),
      company: f.company.trim() || "株式会社○○",
      category: f.category as Category,
      prefecture: f.prefecture,
      city: f.city,
      employment: f.employment,
      wage: { type: f.wageType, min: Number(f.wageMin), max: Number(f.wageMax) },
      tags: f.tags.length ? f.tags : ["未経験歓迎"],
      catch: f.catch.trim() || "未経験からはじめられるお仕事です。",
      body: f.body.trim() || "詳細はお問い合わせください。（デモ用サンプル）",
      hours: f.hours,
      holiday: f.holiday,
    });
    setSaving(false);
    setF(empty);
    onClose();
    toast.success("求人を公開しました！", {
      description: "公開サイトの一覧にすぐ反映されます。",
    });
  };

  const cities = f.prefecture ? REGIONS[f.prefecture] : [];

  return (
    <Modal open={open} onClose={() => !saving && onClose()} title="求人を追加" width={640}>
      <p className="mb-4 rounded-xl bg-mint-50 px-4 py-3 text-sm text-mint-700">
        <span className="font-bold">はじめての方も安心。</span>{" "}
        必須項目（<span className="text-brand-600">*</span>）だけ埋めれば公開できます。
        あとから編集も可能です。
      </p>

      <div className="grid gap-4">
        <Field label="求人タイトル" required error={errors.title} hint="求職者が最初に目にする一文です">
          <input
            className={inputCls}
            value={f.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="例) 未経験OK！倉庫内のかんたんピッキング"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="募集企業名">
            <input
              className={inputCls}
              value={f.company}
              onChange={(e) => set("company", e.target.value)}
            />
          </Field>
          <Field label="職種" required error={errors.category}>
            <div className="relative">
              <select
                value={f.category}
                onChange={(e) => set("category", e.target.value as Category)}
                className={inputCls + " appearance-none pr-9"}
              >
                <option value="">選択してください</option>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.key}
                  </option>
                ))}
              </select>
            </div>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="都道府県" required error={errors.prefecture}>
            <select
              value={f.prefecture}
              onChange={(e) => {
                set("prefecture", e.target.value);
                set("city", "");
              }}
              className={inputCls + " appearance-none pr-9"}
            >
              <option value="">選択してください</option>
              {PREFECTURES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
          <Field label="市区町村" required error={errors.city}>
            <select
              value={f.city}
              disabled={!f.prefecture}
              onChange={(e) => set("city", e.target.value)}
              className={inputCls + " appearance-none pr-9 disabled:bg-ink-50 disabled:text-ink-400"}
            >
              <option value="">{f.prefecture ? "選択してください" : "先に都道府県を選択"}</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
          <Field label="雇用形態">
            <select
              value={f.employment}
              onChange={(e) => set("employment", e.target.value as Employment)}
              className={inputCls + " appearance-none pr-9"}
            >
              {EMPLOYMENTS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="給与"
            required
            error={errors.wageMin}
            hint={f.wageType === "月給" ? "単位: 万円(例 22 〜 28)" : "単位: 円(例 1200 〜 1400)"}
          >
            <div className="flex items-center gap-2">
              <select
                value={f.wageType}
                onChange={(e) => set("wageType", e.target.value as "月給" | "時給")}
                className={inputCls + " w-24 appearance-none pr-7"}
              >
                <option value="月給">月給</option>
                <option value="時給">時給</option>
              </select>
              <input
                className={inputCls}
                inputMode="numeric"
                value={f.wageMin}
                onChange={(e) => set("wageMin", e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="下限"
              />
              <span className="text-ink-400">〜</span>
              <input
                className={inputCls}
                inputMode="numeric"
                value={f.wageMax}
                onChange={(e) => set("wageMax", e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="上限"
              />
            </div>
          </Field>
        </div>

        <Field label="キャッチコピー" hint="応援メッセージを一言(任意)">
          <input
            className={inputCls}
            value={f.catch}
            onChange={(e) => set("catch", e.target.value)}
            placeholder="例) 特別なスキルはいりません。"
          />
        </Field>

        <Field label="お仕事の内容" hint="どんな作業か、やさしい言葉で(任意)">
          <textarea
            className={inputCls + " min-h-24 resize-none"}
            value={f.body}
            onChange={(e) => set("body", e.target.value)}
            placeholder="例) ネット通販の商品を集めて仕分けするお仕事です。先輩がしっかり教えます。"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="勤務時間">
            <input
              className={inputCls}
              value={f.hours}
              onChange={(e) => set("hours", e.target.value)}
            />
          </Field>
          <Field label="休日">
            <input
              className={inputCls}
              value={f.holiday}
              onChange={(e) => set("holiday", e.target.value)}
            />
          </Field>
        </div>

        <Field label="こだわり条件" hint="クリックで選択。求職者の絞り込みに使われます">
          <div className="flex flex-wrap gap-2">
            {TAG_CHOICES.map((t) => {
              const on = f.tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition " +
                    (on
                      ? "border-mint-500 bg-mint-50 text-mint-700"
                      : "border-ink-200 bg-white text-ink-500 hover:border-mint-400")
                  }
                >
                  {on ? "✓ " : "＋ "}
                  {t}
                </button>
              );
            })}
          </div>
        </Field>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2 border-t border-ink-100 pt-4">
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          キャンセル
        </Button>
        <Button onClick={save} loading={saving} size="lg">
          {saving ? "公開中…" : "この内容で公開する"}
        </Button>
      </div>
    </Modal>
  );
}
