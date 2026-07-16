import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import {
  Inbox,
  Clock,
  Sparkles,
  TrendingDown,
  Plus,
  Trash2,
  RotateCcw,
  FileText,
} from "lucide-react";
import { useStore } from "../store";
import { CATEGORIES, type Category, type Template } from "../data/seed";
import {
  Button,
  Card,
  Field,
  inputCls,
  Modal,
  Pill,
  StatusDot,
} from "../components/ui";
import { useLoad } from "../lib/useLoad";

const CAT_COLORS: Record<Category, string> = {
  見積もり依頼: "oklch(53% 0.19 275)",
  サービスの質問: "oklch(60% 0.13 230)",
  "予約・日程": "oklch(58% 0.16 300)",
  "要望・クレーム": "oklch(60% 0.17 20)",
  "手続き・書類": "oklch(70% 0.15 70)",
  その他: "oklch(72% 0.01 270)",
};

export default function Dashboard() {
  const inquiries = useStore((s) => s.inquiries);
  const templates = useStore((s) => s.templates);
  const settings = useStore((s) => s.settings);
  const setSetting = useStore((s) => s.setSetting);
  const addTemplate = useStore((s) => s.addTemplate);
  const deleteTemplate = useStore((s) => s.deleteTemplate);
  const reset = useStore((s) => s.reset);
  const loading = useLoad(500);

  const [tplOpen, setTplOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const stats = useMemo(() => {
    const total = inquiries.length;
    const pending = inquiries.filter((i) => i.status === "未対応").length;
    const replied = inquiries.filter((i) => i.status === "返信済み").length;
    const withDraft = inquiries.filter((i) => i.draft && i.draft.length > 0).length;
    const draftRate = total ? Math.round((withDraft / total) * 100) : 0;
    return { total, pending, replied, draftRate };
  }, [inquiries]);

  const byCategory = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        name: c,
        件数: inquiries.filter((i) => i.category === c).length,
      })),
    [inquiries],
  );

  const byStatus = useMemo(() => {
    const s = ["未対応", "対応中", "返信済み"] as const;
    const color: Record<string, string> = {
      未対応: "oklch(70% 0.15 70)",
      対応中: "oklch(53% 0.19 275)",
      返信済み: "oklch(62% 0.14 155)",
    };
    return s.map((name) => ({
      name,
      value: inquiries.filter((i) => i.status === name).length,
      color: color[name],
    }));
  }, [inquiries]);

  // 導入効果(モックの想定値):一次返信までの平均時間
  const timeSaving = [
    { name: "導入前", 分: 42, color: "oklch(75% 0.02 270)" },
    { name: "AI導入後", 分: 11, color: "oklch(53% 0.19 275)" },
  ];

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-24 animate-pulse bg-ink-100" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="h-72 animate-pulse bg-ink-100" />
          <Card className="h-72 animate-pulse bg-ink-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink-900">ダッシュボード</h1>
        <p className="mt-1 text-sm text-ink-500">
          問い合わせ状況と、AI導入による効率化の目安をひと目で確認できます。
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          icon={<Inbox size={18} />}
          label="問い合わせ総数"
          value={stats.total}
          unit="件"
          tone="blue"
        />
        <Kpi
          icon={<Clock size={18} />}
          label="未対応"
          value={stats.pending}
          unit="件"
          tone="amber"
        />
        <Kpi
          icon={<Sparkles size={18} />}
          label="AI下書き活用率"
          value={stats.draftRate}
          unit="%"
          tone="violet"
        />
        <Kpi
          icon={<TrendingDown size={18} />}
          label="一次対応 時間削減"
          value={74}
          unit="%"
          tone="green"
        />
      </div>

      {/* チャート */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <ChartTitle>カテゴリ別の問い合わせ件数</ChartTitle>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} margin={{ top: 8, right: 8, bottom: 8, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(93% 0.006 270)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "oklch(59% 0.014 270)" }}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  height={54}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "oklch(59% 0.014 270)" }} />
                <Tooltip
                  cursor={{ fill: "oklch(97% 0.004 270)" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid oklch(93% 0.006 270)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="件数" radius={[6, 6, 0, 0]}>
                  {byCategory.map((d) => (
                    <Cell key={d.name} fill={CAT_COLORS[d.name as Category]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <ChartTitle>対応状況の内訳</ChartTitle>
          <div className="mt-3 flex items-center gap-4">
            <div className="h-56 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byStatus}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={84}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {byStatus.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid oklch(93% 0.006 270)",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2">
              {byStatus.map((d) => (
                <li key={d.name} className="flex items-center gap-2 text-sm">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: d.color }}
                  />
                  <span className="text-ink-600">{d.name}</span>
                  <span className="tnum ml-auto font-semibold text-ink-900">{d.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <ChartTitle>
            一次返信までの平均時間 <span className="text-ink-400">(導入前後の比較・想定値)</span>
          </ChartTitle>
          <div className="mt-3 grid items-center gap-4 sm:grid-cols-[1.4fr_1fr]">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timeSaving}
                  layout="vertical"
                  margin={{ top: 4, right: 24, bottom: 4, left: 8 }}
                >
                  <XAxis type="number" tick={{ fontSize: 11, fill: "oklch(59% 0.014 270)" }} unit="分" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "oklch(39% 0.014 274)" }}
                    width={72}
                  />
                  <Tooltip
                    cursor={{ fill: "oklch(97% 0.004 270)" }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid oklch(93% 0.006 270)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="分" radius={[0, 8, 8, 0]} barSize={30}>
                    {timeSaving.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl bg-brand-50 p-5 text-center">
              <div className="text-xs font-medium text-brand-700">1件あたりの短縮</div>
              <div className="tnum mt-1 text-4xl font-bold text-brand-700">-31分</div>
              <p className="mt-2 text-xs leading-relaxed text-brand-800/80">
                要約・下書きの自動化により、一次対応の作業時間を約7割削減できる想定です。
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* テンプレート管理 */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-ink-500" />
            <h2 className="text-sm font-bold text-ink-900">定型文・資料テンプレート</h2>
            <Pill tone="gray">{templates.length}</Pill>
          </div>
          <Button variant="outline" onClick={() => setTplOpen(true)}>
            <Plus size={15} />
            追加
          </Button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {templates.map((t) => (
            <div
              key={t.id}
              className="group rounded-xl border border-ink-200 p-3 transition hover:border-brand-200"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <StatusDot tone={t.kind === "返信定型文" ? "blue" : "amber"} />
                  <span className="text-sm font-semibold text-ink-800">{t.title}</span>
                </div>
                <button
                  onClick={() => {
                    deleteTemplate(t.id);
                    toast.success("テンプレートを削除しました");
                  }}
                  className="text-ink-300 opacity-0 transition hover:text-rose-500 group-hover:opacity-100"
                  aria-label="削除"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <Pill tone={t.kind === "返信定型文" ? "blue" : "amber"}>{t.kind}</Pill>
                <span className="text-[11px] text-ink-400">{t.category}</span>
              </div>
              <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-xs text-ink-500">
                {t.body}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* 設定 & リセット */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-ink-900">設定</h2>
        <div className="mt-3 divide-y divide-ink-100">
          <Toggle
            label="受信時にAIで自動整理する"
            desc="新しい問い合わせを受信したら、要約・分類を自動で行います。"
            on={settings.autoOrganize}
            onChange={(v) => setSetting("autoOrganize", v)}
          />
          <Toggle
            label="緊急度「高」を通知する"
            desc="優先度の高い問い合わせを受信したときに通知します。"
            on={settings.notifyUrgent}
            onChange={(v) => setSetting("notifyUrgent", v)}
          />
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-ink-50 p-3">
          <div className="text-xs text-ink-500">
            デモのデータを初期状態に戻します。
          </div>
          <Button variant="outline" onClick={() => setResetOpen(true)}>
            <RotateCcw size={15} />
            デモをリセット
          </Button>
        </div>
      </Card>

      <TemplateModal
        open={tplOpen}
        onClose={() => setTplOpen(false)}
        onSave={(t) => {
          addTemplate(t);
          setTplOpen(false);
          toast.success("テンプレートを追加しました");
        }}
      />

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="デモをリセット" width={420}>
        <p className="text-sm text-ink-600">
          追加・変更した内容をすべて破棄し、初期のサンプルデータに戻します。よろしいですか?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setResetOpen(false)}>
            キャンセル
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              reset();
              setResetOpen(false);
              toast.success("初期状態に戻しました");
            }}
          >
            リセットする
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  unit,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  tone: "blue" | "amber" | "violet" | "green";
}) {
  const toneCls: Record<string, string> = {
    blue: "bg-brand-50 text-brand-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
    green: "bg-emerald-50 text-emerald-600",
  };
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-500">{label}</span>
        <span className={"grid h-8 w-8 place-items-center rounded-lg " + toneCls[tone]}>
          {icon}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="tnum text-3xl font-bold text-ink-900">{value}</span>
        <span className="text-sm text-ink-400">{unit}</span>
      </div>
    </Card>
  );
}

function ChartTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-ink-800">{children}</h2>;
}

function Toggle({
  label,
  desc,
  on,
  onChange,
}: {
  label: string;
  desc: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <div className="text-sm font-medium text-ink-800">{label}</div>
        <div className="text-xs text-ink-400">{desc}</div>
      </div>
      <button
        onClick={() => onChange(!on)}
        className={
          "relative h-6 w-11 shrink-0 rounded-full transition " +
          (on ? "bg-brand-600" : "bg-ink-300")
        }
        role="switch"
        aria-checked={on}
      >
        <span
          className={
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all " +
            (on ? "left-[22px]" : "left-0.5")
          }
        />
      </button>
    </div>
  );
}

function TemplateModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (t: Omit<Template, "id">) => void;
}) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<Template["kind"]>("返信定型文");
  const [category, setCategory] = useState<Template["category"]>("共通");
  const [body, setBody] = useState("");
  const [err, setErr] = useState<{ title?: string; body?: string }>({});

  const submit = () => {
    const e: typeof err = {};
    if (!title.trim()) e.title = "タイトルを入力してください";
    if (!body.trim()) e.body = "本文を入力してください";
    setErr(e);
    if (Object.keys(e).length) return;
    onSave({ title: title.trim(), kind, category, body: body.trim() });
    setTitle("");
    setBody("");
    setKind("返信定型文");
    setCategory("共通");
    setErr({});
  };

  return (
    <Modal open={open} onClose={onClose} title="テンプレートを追加">
      <div className="space-y-4">
        <Field label="タイトル" required error={err.title}>
          <input
            className={inputCls}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: お問い合わせ受付のご連絡"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="種類">
            <select
              className={inputCls}
              value={kind}
              onChange={(e) => setKind(e.target.value as Template["kind"])}
            >
              <option value="返信定型文">返信定型文</option>
              <option value="資料テンプレート">資料テンプレート</option>
            </select>
          </Field>
          <Field label="カテゴリ">
            <select
              className={inputCls}
              value={category}
              onChange={(e) => setCategory(e.target.value as Template["category"])}
            >
              <option value="共通">共通</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field
          label="本文"
          required
          error={err.body}
          hint="{{お客様名}} と書くと、挿入時にお客様名へ置き換わります。"
        >
          <textarea
            className={inputCls + " min-h-32 resize-y"}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={"{{お客様名}} 様\n\nお問い合わせありがとうございます。"}
          />
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={submit}>追加する</Button>
      </div>
    </Modal>
  );
}
