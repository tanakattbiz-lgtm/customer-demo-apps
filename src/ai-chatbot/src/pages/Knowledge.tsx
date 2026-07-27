import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  BookOpen,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useStore, newArticleId } from "../store";
import {
  KB_CATEGORIES,
  type KBArticle,
  type KBCategory,
} from "../data/seed";
import {
  Card,
  Pill,
  Button,
  Modal,
  Field,
  inputCls,
  EmptyState,
  Skeleton,
  ConfirmDialog,
} from "../components/ui";
import { relTime } from "../lib/format";
import { fakeApi } from "../lib/fakeApi";
import { useLoad } from "../lib/useLoad";

type Draft = {
  id?: string;
  category: KBCategory;
  question: string;
  keywords: string;
  answer: string;
  published: boolean;
};

const emptyDraft = (): Draft => ({
  category: "料金・プラン",
  question: "",
  keywords: "",
  answer: "",
  published: true,
});

export function Knowledge() {
  const kb = useStore((s) => s.kb);
  const saveArticle = useStore((s) => s.saveArticle);
  const deleteArticle = useStore((s) => s.deleteArticle);
  const loading = useLoad([]);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<KBCategory | "すべて">("すべて");
  const [editing, setEditing] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<KBArticle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return kb
      .filter((a) => (cat === "すべて" ? true : a.category === cat))
      .filter((a) =>
        !kw
          ? true
          : a.question.toLowerCase().includes(kw) ||
            a.answer.toLowerCase().includes(kw) ||
            a.keywords.some((k) => k.toLowerCase().includes(kw)),
      )
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [kb, q, cat]);

  function openNew() {
    setErrors({});
    setEditing(emptyDraft());
  }

  function openEdit(a: KBArticle) {
    setErrors({});
    setEditing({
      id: a.id,
      category: a.category,
      question: a.question,
      keywords: a.keywords.join("、"),
      answer: a.answer,
      published: a.published,
    });
  }

  function validate(d: Draft) {
    const e: Record<string, string> = {};
    if (!d.question.trim()) e.question = "質問を入力してください";
    else if (d.question.trim().length < 4) e.question = "4文字以上で入力してください";
    if (!d.answer.trim()) e.answer = "回答を入力してください";
    else if (d.answer.trim().length < 10) e.answer = "10文字以上で入力してください";
    return e;
  }

  async function submit() {
    if (!editing) return;
    const e = validate(editing);
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    const article: KBArticle = {
      id: editing.id ?? newArticleId(),
      category: editing.category,
      question: editing.question.trim(),
      keywords: editing.keywords
        .split(/[、,\s]+/)
        .map((k) => k.trim())
        .filter(Boolean),
      answer: editing.answer.trim(),
      updatedAt: new Date().toISOString(),
      published: editing.published,
    };
    await fakeApi(article, 500);
    saveArticle(article);
    setSaving(false);
    setEditing(null);
    toast.success(editing.id ? "ナレッジを更新しました" : "ナレッジを追加しました");
  }

  function togglePublish(a: KBArticle) {
    saveArticle({ ...a, published: !a.published, updatedAt: new Date().toISOString() });
    toast.success(a.published ? "非公開にしました" : "公開しました");
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    await fakeApi(true, 400);
    deleteArticle(toDelete.id);
    setDeleting(false);
    setToDelete(null);
    toast.success("ナレッジを削除しました");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 lg:p-8">
      {/* 説明バナー */}
      <div className="flex items-start gap-3 rounded-2xl border border-ink-200 bg-white px-5 py-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Sparkles size={18} />
        </div>
        <p className="text-sm leading-relaxed text-ink-600">
          ここに登録した知識をAIが検索(RAG)し、回答の根拠として引用します。
          記事を追加・編集すると、チャットボットの回答内容にすぐ反映されます。
          <span className="text-ink-400">（右下のチャットで試せます）</span>
        </p>
      </div>

      {/* ツールバー */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="質問・回答・キーワードで検索…"
            className={inputCls + " pl-9"}
          />
        </div>
        <Button onClick={openNew} className="shrink-0">
          <Plus size={17} /> 新規ナレッジ
        </Button>
      </div>

      {/* カテゴリタブ */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(["すべて", ...KB_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition " +
              (cat === c
                ? "bg-brand-600 text-white"
                : "border border-ink-200 bg-white text-ink-600 hover:bg-ink-50")
            }
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BookOpen size={26} />}
            title={q || cat !== "すべて" ? "該当するナレッジがありません" : "ナレッジがありません"}
            description={
              q || cat !== "すべて"
                ? "検索条件を変えるか、新しいナレッジを追加してください。"
                : "最初のナレッジを追加して、AIが回答できる知識を増やしましょう。"
            }
            action={
              <Button onClick={openNew}>
                <Plus size={17} /> 新規ナレッジ
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone="brand">{a.category}</Pill>
                    {a.published ? (
                      <Pill tone="green">公開中</Pill>
                    ) : (
                      <Pill tone="gray">下書き</Pill>
                    )}
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-ink-900">{a.question}</h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-500">
                    {a.answer}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {a.keywords.slice(0, 5).map((k) => (
                      <span
                        key={k}
                        className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[11px] text-ink-500"
                      >
                        {k}
                      </span>
                    ))}
                    <span className="ml-auto text-[11px] text-ink-400">
                      更新 {relTime(a.updatedAt)}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <IconBtn label={a.published ? "非公開にする" : "公開する"} onClick={() => togglePublish(a)}>
                    {a.published ? <Eye size={16} /> : <EyeOff size={16} />}
                  </IconBtn>
                  <IconBtn label="編集" onClick={() => openEdit(a)}>
                    <Pencil size={16} />
                  </IconBtn>
                  <IconBtn label="削除" danger onClick={() => setToDelete(a)}>
                    <Trash2 size={16} />
                  </IconBtn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 追加・編集モーダル */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "ナレッジを編集" : "新規ナレッジ"}
        width={620}
      >
        {editing && (
          <div className="space-y-4">
            <Field label="カテゴリ" required>
              <select
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value as KBCategory })}
                className={inputCls}
              >
                {KB_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="想定される質問" required error={errors.question} hint="ユーザーが尋ねそうな質問文">
              <input
                value={editing.question}
                onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                placeholder="例: 無料プランはありますか？"
                className={inputCls}
              />
            </Field>

            <Field
              label="キーワード"
              hint="読点(、)やスペース区切り。検索ヒット率が上がります"
            >
              <input
                value={editing.keywords}
                onChange={(e) => setEditing({ ...editing, keywords: e.target.value })}
                placeholder="例: 無料、料金、価格、費用"
                className={inputCls}
              />
            </Field>

            <Field label="AIが返す回答" required error={errors.answer}>
              <textarea
                value={editing.answer}
                onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                rows={5}
                placeholder="この記事が引用されたときにAIが返す回答文を入力"
                className={inputCls + " resize-none leading-relaxed"}
              />
            </Field>

            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-ink-200 px-3.5 py-3">
              <input
                type="checkbox"
                checked={editing.published}
                onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                className="h-4 w-4 accent-brand-600"
              />
              <span className="text-sm text-ink-700">
                このナレッジを公開する（AIの回答に利用する）
              </span>
            </label>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setEditing(null)}>
                キャンセル
              </Button>
              <Button loading={saving} onClick={submit}>
                {editing.id ? "更新する" : "追加する"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="ナレッジを削除しますか？"
        message={`「${toDelete?.question ?? ""}」を削除します。この操作は取り消せません。`}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={
        "grid h-8 w-8 place-items-center rounded-lg transition " +
        (danger
          ? "text-ink-400 hover:bg-rose-50 hover:text-rose-600"
          : "text-ink-400 hover:bg-ink-100 hover:text-ink-700")
      }
    >
      {children}
    </button>
  );
}
