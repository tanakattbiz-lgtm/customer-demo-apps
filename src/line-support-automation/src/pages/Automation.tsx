import { useState } from "react";
import { toast } from "sonner";
import {
  Workflow,
  MessageSquareText,
  SlidersHorizontal,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Send,
  MessageCircleQuestion,
  RotateCcw,
  TrendingDown,
} from "lucide-react";
import { useStore, type Settings } from "../store";
import {
  Card,
  Pill,
  Button,
  Modal,
  Field,
  inputCls,
  Toggle,
  EmptyState,
} from "../components/ui";
import PageHeader from "../components/PageHeader";
import { useLoad } from "../lib/useLoad";
import { fakeApi } from "../lib/fakeApi";
import {
  STAGE_ORDER,
  STAGE_LABEL,
  STAGE_TONE,
  type Stage,
  type ScenarioStep,
  type Faq,
  type FaqCategory,
} from "../data/seed";

type Tab = "scenarios" | "faq" | "settings";

const TABS: { key: Tab; label: string; icon: typeof Workflow }[] = [
  { key: "scenarios", label: "ステップ配信シナリオ", icon: Send },
  { key: "faq", label: "FAQ自動返信", icon: MessageSquareText },
  { key: "settings", label: "システム設定", icon: SlidersHorizontal },
];

export default function Automation() {
  const loading = useLoad(360);
  const [tab, setTab] = useState<Tab>("scenarios");

  return (
    <>
      <PageHeader
        title="自動化設定"
        subtitle="ステップ配信シナリオとFAQ自動返信を管理し、サポートを自動化します。"
      />

      {/* タブ */}
      <div className="mb-5 flex gap-1 rounded-xl border border-ink-200 bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm " +
              (tab === t.key ? "bg-brand-600 text-white shadow-sm" : "text-ink-500 hover:bg-ink-100")
            }
          >
            <t.icon size={15} />
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.label.replace("配信", "").replace("自動", "")}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-white" />
      ) : tab === "scenarios" ? (
        <ScenariosTab />
      ) : tab === "faq" ? (
        <FaqTab />
      ) : (
        <SettingsTab />
      )}
    </>
  );
}

// ==================== ステップ配信シナリオ ====================
function ScenariosTab() {
  const scenarios = useStore((s) => s.scenarios);
  const members = useStore((s) => s.members);
  const deleteStep = useStore((s) => s.deleteStep);
  const [editing, setEditing] = useState<{ stage: Stage; step: ScenarioStep | null } | null>(null);

  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm text-ink-500">
        各ステージのユーザーに、設定したステップメッセージが順番に自動配信されます。ステージを完了すると自動的に次のステージへ移行します。
      </p>

      {STAGE_ORDER.filter((st) => st !== "done").map((stage) => {
        const sc = scenarios.find((s) => s.stage === stage);
        const memberCount = members.filter((m) => m.stage === stage).length;
        return (
          <Card key={stage}>
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <Pill tone={STAGE_TONE[stage] as never}>{STAGE_LABEL[stage]}</Pill>
                <span className="text-xs text-ink-400">対象 {memberCount} 人・{sc?.steps.length ?? 0} ステップ</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => setEditing({ stage, step: null })}>
                <Plus size={14} />
                ステップ追加
              </Button>
            </div>
            <div className="divide-y divide-ink-100">
              {sc?.steps.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm text-ink-400">
                  ステップがまだありません。「ステップ追加」から作成してください。
                </div>
              ) : (
                sc?.steps.map((step, i) => (
                  <div key={step.id} className="flex items-start gap-3 px-5 py-3.5">
                    <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-ink-800">{step.title}</span>
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] text-ink-500">
                          <Clock size={10} /> {step.timing}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-500">{step.body}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <IconBtn label="編集" onClick={() => setEditing({ stage, step })}>
                        <Pencil size={14} />
                      </IconBtn>
                      <IconBtn
                        label="削除"
                        danger
                        onClick={() => {
                          deleteStep(stage, step.id);
                          toast("ステップを削除しました");
                        }}
                      >
                        <Trash2 size={14} />
                      </IconBtn>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        );
      })}

      {editing && (
        <StepEditor
          stage={editing.stage}
          step={editing.step}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function StepEditor({ stage, step, onClose }: { stage: Stage; step: ScenarioStep | null; onClose: () => void }) {
  const addStep = useStore((s) => s.addStep);
  const updateStep = useStore((s) => s.updateStep);
  const [title, setTitle] = useState(step?.title ?? "");
  const [timing, setTiming] = useState(step?.timing ?? "");
  const [body, setBody] = useState(step?.body ?? "");
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const titleErr = touched && !title.trim() ? "タイトルを入力してください" : "";
  const bodyErr = touched && !body.trim() ? "本文を入力してください" : "";

  const onSave = async () => {
    setTouched(true);
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    await fakeApi(true, 550);
    if (step) {
      updateStep(stage, step.id, { title: title.trim(), timing: timing.trim() || "任意", body: body.trim() });
      toast.success("ステップを更新しました");
    } else {
      addStep(stage, { title: title.trim(), timing: timing.trim() || "任意", body: body.trim() });
      toast.success("ステップを追加しました");
    }
    setSaving(false);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={step ? "ステップを編集" : "ステップを追加"} width={540}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-ink-500">
          配信先ステージ:
          <Pill tone={STAGE_TONE[stage] as never}>{STAGE_LABEL[stage]}</Pill>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
          <Field label="ステップ名" required error={titleErr}>
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例: 口座開設マニュアル配信" />
          </Field>
          <Field label="配信タイミング" hint="例: 登録直後 / 翌日">
            <input className={inputCls} value={timing} onChange={(e) => setTiming(e.target.value)} placeholder="翌日 10:00" />
          </Field>
        </div>
        <Field label="配信メッセージ本文" required error={bodyErr}>
          <textarea
            className={inputCls + " min-h-[120px] resize-y"}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="ユーザーに送信するメッセージを入力します。"
          />
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2 border-t border-ink-100 pt-4">
        <Button variant="ghost" onClick={onClose}>キャンセル</Button>
        <Button onClick={onSave} loading={saving}>{step ? "更新する" : "追加する"}</Button>
      </div>
    </Modal>
  );
}

// ==================== FAQ自動返信 ====================
const FAQ_CATS: FaqCategory[] = ["口座開設", "取引", "報酬", "その他"];
const CAT_TONE: Record<FaqCategory, string> = {
  口座開設: "violet",
  取引: "amber",
  報酬: "green",
  その他: "gray",
};

function FaqTab() {
  const faqs = useStore((s) => s.faqs);
  const toggleFaq = useStore((s) => s.toggleFaq);
  const deleteFaq = useStore((s) => s.deleteFaq);
  const [cat, setCat] = useState<FaqCategory | "all">("all");
  const [editing, setEditing] = useState<{ faq: Faq | null } | null>(null);

  const list = faqs.filter((f) => cat === "all" || f.category === cat);
  const enabledCount = faqs.filter((f) => f.enabled).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="thin-scroll flex gap-2 overflow-x-auto">
          <CatChip active={cat === "all"} onClick={() => setCat("all")}>すべて（{faqs.length}）</CatChip>
          {FAQ_CATS.map((c) => (
            <CatChip key={c} active={cat === c} onClick={() => setCat(c)}>
              {c}（{faqs.filter((f) => f.category === c).length}）
            </CatChip>
          ))}
        </div>
        <Button size="sm" onClick={() => setEditing({ faq: null })}>
          <Plus size={14} />
          FAQを追加
        </Button>
      </div>

      <p className="rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm text-ink-500">
        有効なFAQ <span className="font-semibold text-ink-800">{enabledCount}</span> 件が稼働中です。ユーザーのメッセージにキーワードが含まれると、対応する回答を自動返信します。
      </p>

      {list.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MessageCircleQuestion size={22} />}
            title="FAQがありません"
            description="「FAQを追加」から自動返信のパターンを登録しましょう。"
            action={<Button onClick={() => setEditing({ faq: null })}><Plus size={15} />FAQを追加</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-3">
          {list.map((f) => (
            <Card key={f.id} className={"p-4 " + (f.enabled ? "" : "opacity-70")}>
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={CAT_TONE[f.category] as never}>{f.category}</Pill>
                    <span className="inline-flex items-center gap-1 text-[11px] text-ink-400">
                      <MessageSquareText size={11} /> 今月 {f.hits} 件対応
                    </span>
                    {!f.enabled && <span className="text-[11px] font-semibold text-ink-400">停止中</span>}
                  </div>
                  <h3 className="mt-2 flex items-start gap-1.5 text-sm font-semibold text-ink-900">
                    <MessageCircleQuestion size={15} className="mt-0.5 shrink-0 text-brand-500" />
                    {f.question}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{f.answer}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {f.keywords.map((k) => (
                      <span key={k} className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[10px] text-ink-500">#{k}</span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Toggle checked={f.enabled} onChange={() => toggleFaq(f.id)} label="有効/無効" />
                  <div className="flex gap-1">
                    <IconBtn label="編集" onClick={() => setEditing({ faq: f })}>
                      <Pencil size={14} />
                    </IconBtn>
                    <IconBtn
                      label="削除"
                      danger
                      onClick={() => {
                        deleteFaq(f.id);
                        toast("FAQを削除しました");
                      }}
                    >
                      <Trash2 size={14} />
                    </IconBtn>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && <FaqEditor faq={editing.faq} onClose={() => setEditing(null)} />}
    </div>
  );
}

function FaqEditor({ faq, onClose }: { faq: Faq | null; onClose: () => void }) {
  const addFaq = useStore((s) => s.addFaq);
  const updateFaq = useStore((s) => s.updateFaq);
  const [category, setCategory] = useState<FaqCategory>(faq?.category ?? "口座開設");
  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer, setAnswer] = useState(faq?.answer ?? "");
  const [keywords, setKeywords] = useState((faq?.keywords ?? []).join(" "));
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const qErr = touched && !question.trim() ? "質問を入力してください" : "";
  const aErr = touched && !answer.trim() ? "回答を入力してください" : "";

  const onSave = async () => {
    setTouched(true);
    if (!question.trim() || !answer.trim()) return;
    setSaving(true);
    await fakeApi(true, 550);
    const kw = keywords.split(/[\s,、]+/).map((s) => s.trim()).filter(Boolean);
    if (faq) {
      updateFaq(faq.id, { category, question: question.trim(), answer: answer.trim(), keywords: kw });
      toast.success("FAQを更新しました");
    } else {
      addFaq({ category, question: question.trim(), answer: answer.trim(), keywords: kw, enabled: true });
      toast.success("FAQを追加しました");
    }
    setSaving(false);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={faq ? "FAQを編集" : "FAQを追加"} width={560}>
      <div className="space-y-4">
        <Field label="カテゴリ">
          <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as FaqCategory)}>
            {FAQ_CATS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="想定される質問" required error={qErr}>
          <input className={inputCls} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="例: 口座開設にはどれくらい時間がかかりますか？" />
        </Field>
        <Field label="反応キーワード" hint="スペース区切り。いずれかを含むメッセージに自動返信します">
          <input className={inputCls} value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="口座開設 時間 審査" />
        </Field>
        <Field label="自動返信の回答" required error={aErr}>
          <textarea
            className={inputCls + " min-h-[110px] resize-y"}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="ユーザーに自動返信する回答を入力します。"
          />
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2 border-t border-ink-100 pt-4">
        <Button variant="ghost" onClick={onClose}>キャンセル</Button>
        <Button onClick={onSave} loading={saving}>{faq ? "更新する" : "追加する"}</Button>
      </div>
    </Modal>
  );
}

// ==================== システム設定 ====================
function SettingsTab() {
  const settings = useStore((s) => s.settings);
  const setSetting = useStore((s) => s.setSetting);
  const reset = useStore((s) => s.reset);
  const [resetOpen, setResetOpen] = useState(false);

  const ITEMS: { key: keyof Settings; label: string; desc: string }[] = [
    { key: "autoDelivery", label: "ステップ自動配信", desc: "進捗ステージに応じてステップメッセージを自動配信します。" },
    { key: "autoFaqReply", label: "FAQ自動返信", desc: "登録キーワードを含むメッセージに、自動で回答を返します。" },
    { key: "notifyStalled", label: "停滞ユーザーの通知", desc: `${4}日以上更新のないユーザーを「要フォロー」として通知します。` },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <div className="border-b border-ink-100 px-5 py-3.5">
          <h2 className="text-sm font-bold text-ink-800">自動化の稼働設定</h2>
        </div>
        <div className="divide-y divide-ink-100">
          {ITEMS.map((it) => (
            <div key={it.key} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink-800">{it.label}</div>
                <div className="mt-0.5 text-xs text-ink-500">{it.desc}</div>
              </div>
              <Toggle
                checked={settings[it.key]}
                onChange={(v) => {
                  setSetting(it.key, v);
                  toast(v ? `${it.label}を有効にしました` : `${it.label}を停止しました`);
                }}
                label={it.label}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
            <TrendingDown size={17} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-ink-800">デモデータをリセット</h3>
            <p className="mt-0.5 text-xs text-ink-500">
              追加・編集したユーザーやFAQ、配信の進捗を破棄し、初期状態に戻します。
            </p>
          </div>
          <Button variant="outline" onClick={() => setResetOpen(true)}>
            <RotateCcw size={15} />
            リセット
          </Button>
        </div>
      </Card>

      <p className="px-1 text-[11px] text-ink-400">
        ※ 本画面は提案用のデモです。実際のLINE Messaging API・スプレッドシート連携・AIチャットボットは本開発フェーズで実装します。
      </p>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="デモデータをリセットしますか？" width={440}>
        <p className="text-sm text-ink-600">
          追加・編集した内容はすべて破棄され、初期のサンプルデータに戻ります。この操作は取り消せません。
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setResetOpen(false)}>キャンセル</Button>
          <Button
            variant="danger"
            onClick={() => {
              reset();
              setResetOpen(false);
              toast.success("デモデータを初期化しました");
            }}
          >
            リセットする
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// ==================== 共通 ====================
function IconBtn({
  children,
  onClick,
  label,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={
        "grid h-8 w-8 place-items-center rounded-lg transition " +
        (danger ? "text-ink-400 hover:bg-rose-50 hover:text-rose-600" : "text-ink-400 hover:bg-ink-100 hover:text-ink-700")
      }
    >
      {children}
    </button>
  );
}

function CatChip({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-xs font-medium transition " +
        (active ? "border-brand-500 bg-brand-500 text-white" : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50")
      }
    >
      {children}
    </button>
  );
}
