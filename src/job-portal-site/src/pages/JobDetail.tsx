import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  Wallet,
  Clock,
  CalendarDays,
  Heart,
  CheckCircle2,
  Sparkles,
  Building2,
  Eye,
} from "lucide-react";
import { useStore } from "../store";
import { isNew, type Era } from "../data/seed";
import { wageText, fromNow } from "../lib/format";
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

const ERAS: Era[] = ["20代", "30代", "40代以上", "指定なし"];

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const job = useStore((s) => s.jobs.find((j) => j.id === id));
  const saved = useStore((s) => (id ? s.savedIds.includes(id) : false));
  const applied = useStore((s) => (id ? s.appliedIds.includes(id) : false));
  const toggleSave = useStore((s) => s.toggleSave);
  const addApplication = useStore((s) => s.addApplication);

  const loading = useLoad(420, [id]);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    kana: "",
    era: "" as Era | "",
    desiredArea: "",
    experience: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const openApply = () => {
    setForm({
      name: "",
      kana: "",
      era: "",
      desiredArea: job ? `${job.prefecture} ${job.city}` : "",
      experience: "",
      message: "",
    });
    setErrors({});
    setOpen(true);
  };

  const recommend = useMemo(() => {
    if (!job) return [];
    const base = ["まずは正社員をめざしたい方", "コツコツ続けるのが得意な方"];
    if (job.tags.includes("寮・社宅あり")) base.push("新しい土地で生活を始めたい方");
    if (job.tags.includes("資格取得支援")) base.push("手に職をつけたい方");
    if (job.tags.includes("土日祝休み")) base.push("プライベートも大切にしたい方");
    return base.slice(0, 4);
  }, [job]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="mb-4 h-4 w-24" />
        <Skeleton className="mb-3 h-8 w-3/4" />
        <Skeleton className="mb-6 h-5 w-1/2" />
        <Skeleton className="mb-3 h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={<Building2 size={30} />}
          title="お仕事が見つかりませんでした"
          description="掲載が終了したか、URL が正しくない可能性があります。"
          action={
            <Button variant="soft" onClick={() => navigate("/")}>
              お仕事をさがす
            </Button>
          }
        />
      </div>
    );
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "お名前を入力してください";
    if (!form.kana.trim()) e.kana = "フリガナを入力してください";
    else if (!/^[ァ-ヶー\s]+$/.test(form.kana.trim()))
      e.kana = "カタカナで入力してください";
    if (!form.era) e.era = "年代を選択してください";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    addApplication({
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      name: form.name.trim(),
      kana: form.kana.trim(),
      era: form.era as Era,
      desiredArea: form.desiredArea.trim(),
      experience: form.experience.trim() || "（未記入）",
      message: form.message.trim() || "（未記入）",
    });
    // 疑似的な送信待ち
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setOpen(false);
    toast.success("応募が完了しました！", {
      description: "採用担当からの連絡をお待ちください。",
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-28 sm:pb-8">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-500 transition hover:text-brand-600"
      >
        <ArrowLeft size={16} /> お仕事一覧にもどる
      </Link>

      {/* ヘッダー */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-500">
            <CategoryIcon category={job.category} size={18} />
          </span>
          <span className="text-sm font-medium text-ink-500">{job.category}</span>
          {isNew(job.postedAt) && (
            <Tag tone="brand">
              <Sparkles size={12} /> 新着
            </Tag>
          )}
          {applied && (
            <Tag tone="mint">
              <CheckCircle2 size={12} /> 応募済み
            </Tag>
          )}
        </div>
        <h1 className="text-2xl leading-snug font-bold text-ink-900 sm:text-[1.8rem]">
          {job.title}
        </h1>
        <p className="mt-2 rounded-xl bg-mint-50 px-4 py-3 text-mint-700">
          {job.catch}
        </p>
      </motion.div>

      {/* 概要カード */}
      <Card className="mt-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Info icon={<Building2 size={16} />} label="募集企業" value={job.company} />
          <Info
            icon={<MapPin size={16} />}
            label="勤務地"
            value={`${job.prefecture} ${job.city}`}
          />
          <Info
            icon={<Wallet size={16} />}
            label="給与"
            value={wageText(job.wage)}
            strong
          />
          <Info icon={<Clock size={16} />} label="勤務時間" value={job.hours} />
          <Info icon={<CalendarDays size={16} />} label="休日" value={job.holiday} />
          <Info
            icon={<Eye size={16} />}
            label="雇用形態 / 閲覧"
            value={`${job.employment} ・ ${job.views}回閲覧`}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {job.tags.map((t) => (
            <Tag key={t} tone="mint">
              {t}
            </Tag>
          ))}
        </div>
      </Card>

      {/* 仕事内容 */}
      <Card className="mt-4 p-5">
        <h2 className="mb-2 text-base font-bold text-ink-900">お仕事の内容</h2>
        <p className="leading-relaxed text-ink-700">{job.body}</p>
      </Card>

      {/* こんな方におすすめ */}
      <Card className="mt-4 p-5">
        <h2 className="mb-3 text-base font-bold text-ink-900">こんな方におすすめ</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {recommend.map((r) => (
            <li key={r} className="flex items-start gap-2 text-sm text-ink-700">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-mint-500" />
              {r}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-ink-400">
          ※本サイトはデモ用のサンプルです。掲載企業・募集内容は架空のものです。
        </p>
      </Card>

      {/* PC 用アクション */}
      <div className="mt-6 hidden items-center gap-3 sm:flex">
        <ApplyButton applied={applied} onApply={openApply} />
        <SaveButton saved={saved} onToggle={() => id && toggleSave(id)} />
      </div>

      {/* モバイル固定バー */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-200 bg-white/90 px-4 py-3 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <SaveButton saved={saved} onToggle={() => id && toggleSave(id)} compact />
          <div className="flex-1">
            <ApplyButton applied={applied} onApply={openApply} full />
          </div>
        </div>
      </div>

      {/* 応募モーダル */}
      <Modal open={open} onClose={() => !submitting && setOpen(false)} title="このお仕事に応募する">
        <p className="mb-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
          <span className="font-bold">かんたん3ステップ</span>で応募完了。
          むずかしい項目はありません。分かる範囲でご記入ください。
        </p>
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-ink-100 p-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-500">
            <CategoryIcon category={job.category} size={18} />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-ink-900">{job.title}</div>
            <div className="truncate text-xs text-ink-400">
              {job.company} ・ {job.prefecture} {job.city}
            </div>
          </div>
        </div>

        <div className="grid gap-3.5">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="お名前" required error={errors.name}>
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="山田 太郎"
              />
            </Field>
            <Field label="フリガナ" required error={errors.kana}>
              <input
                className={inputCls}
                value={form.kana}
                onChange={(e) => set("kana", e.target.value)}
                placeholder="ヤマダ タロウ"
              />
            </Field>
          </div>

          <Field label="年代" required error={errors.era}>
            <div className="flex flex-wrap gap-2">
              {ERAS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => set("era", e)}
                  className={
                    "rounded-full border px-4 py-2 text-sm font-semibold transition " +
                    (form.era === e
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-ink-200 bg-white text-ink-600 hover:border-brand-300")
                  }
                >
                  {e}
                </button>
              ))}
            </div>
          </Field>

          <Field label="希望勤務地" hint="お住まいや通える範囲を教えてください">
            <input
              className={inputCls}
              value={form.desiredArea}
              onChange={(e) => set("desiredArea", e.target.value)}
              placeholder="例) 埼玉県 川口市"
            />
          </Field>

          <Field label="これまでのお仕事の経験" hint="アルバイト・派遣なども大丈夫です(任意)">
            <textarea
              className={inputCls + " min-h-20 resize-none"}
              value={form.experience}
              onChange={(e) => set("experience", e.target.value)}
              placeholder="例) 飲食店でのアルバイトを2年ほど"
            />
          </Field>

          <Field label="ひとことメッセージ" hint="意気込みや質問など(任意)">
            <textarea
              className={inputCls + " min-h-16 resize-none"}
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder="例) 未経験ですが、長く働きたいです！"
            />
          </Field>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
            もどる
          </Button>
          <Button onClick={submit} loading={submitting} size="lg">
            {submitting ? "送信中…" : "この内容で応募する"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
  strong,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-ink-400">{icon}</span>
      <div>
        <div className="text-xs text-ink-400">{label}</div>
        <div
          className={
            "text-sm " + (strong ? "font-bold text-brand-700" : "font-medium text-ink-800")
          }
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function ApplyButton({
  applied,
  onApply,
  full,
}: {
  applied: boolean;
  onApply: () => void;
  full?: boolean;
}) {
  if (applied) {
    return (
      <Button
        variant="soft"
        size="lg"
        disabled
        className={full ? "w-full" : ""}
      >
        <CheckCircle2 size={18} /> 応募済みです
      </Button>
    );
  }
  return (
    <Button size="lg" onClick={onApply} className={full ? "w-full" : ""}>
      このお仕事に応募する
    </Button>
  );
}

function SaveButton({
  saved,
  onToggle,
  compact,
}: {
  saved: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      className={
        "inline-flex items-center justify-center gap-2 rounded-full border font-bold transition " +
        (compact ? "h-12 w-12 shrink-0 " : "px-5 py-3.5 text-sm ") +
        (saved
          ? "border-brand-200 bg-brand-50 text-brand-600"
          : "border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-600")
      }
      aria-label="気になる"
    >
      <Heart size={18} fill={saved ? "currentColor" : "none"} />
      {!compact && (saved ? "気になる済み" : "気になる")}
    </button>
  );
}
