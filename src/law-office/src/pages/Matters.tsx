import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Briefcase,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { useStore, staffById } from "../store/useStore";
import { fakeApi } from "../lib/fakeApi";
import { useLoad } from "../lib/useLoad";
import { PageHeader } from "../components/PageHeader";
import {
  Card,
  Pill,
  Button,
  Modal,
  Field,
  inputCls,
  EmptyState,
  Skeleton,
  Avatar,
} from "../components/ui";
import { yen, shortDate } from "../lib/format";
import { matterTone } from "../lib/status";
import type {
  Matter,
  MatterCategory,
  MatterStatus,
} from "../data/seed";

const STATUSES: MatterStatus[] = [
  "受任前",
  "進行中",
  "期日調整中",
  "和解交渉",
  "完了",
];
const CATEGORIES: MatterCategory[] = [
  "離婚・親権",
  "相続・遺言",
  "労働問題",
  "交通事故",
  "債務整理",
  "企業法務",
  "刑事弁護",
  "不動産",
  "顧問",
];

type Draft = {
  title: string;
  clientId: string;
  category: MatterCategory;
  status: MatterStatus;
  ownerId: string;
  fee: string;
  nextEvent: string;
};

const emptyDraft = (clientId: string, ownerId: string): Draft => ({
  title: "",
  clientId,
  category: "企業法務",
  status: "受任前",
  ownerId,
  fee: "",
  nextEvent: "",
});

export default function Matters() {
  const loading = useLoad();
  const [params, setParams] = useSearchParams();
  const clients = useStore((s) => s.clients);
  const staff = useStore((s) => s.staff);
  const matters = useStore((s) => s.matters);
  const addMatter = useStore((s) => s.addMatter);
  const updateMatter = useStore((s) => s.updateMatter);
  const removeMatter = useStore((s) => s.removeMatter);
  const currentUserId = useStore((s) => s.currentUserId);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<MatterStatus | "すべて">("すべて");
  const [sort, setSort] = useState<"updated" | "fee" | "opened">("updated");

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Matter | null>(null);
  const [draft, setDraft] = useState<Draft>(
    emptyDraft(clients[0]?.id ?? "", currentUserId),
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<Matter | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ヘッダーの「新規案件」からの遷移で自動オープン
  useEffect(() => {
    if (params.get("new") === "1") {
      openNew();
      params.delete("new");
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    let list = matters.filter((m) => {
      const client = clients.find((c) => c.id === m.clientId);
      const hay = `${m.title} ${m.code} ${m.category} ${client?.name ?? ""}`.toLowerCase();
      return (
        (status === "すべて" || m.status === status) &&
        (!kw || hay.includes(kw))
      );
    });
    list = [...list].sort((a, b) => {
      if (sort === "fee") return b.fee - a.fee;
      if (sort === "opened") return b.openedAt.localeCompare(a.openedAt);
      return b.updatedAt.localeCompare(a.updatedAt);
    });
    return list;
  }, [matters, clients, q, status, sort]);

  function openNew() {
    setEditing(null);
    setDraft(emptyDraft(clients[0]?.id ?? "", currentUserId));
    setErrors({});
    setModal(true);
  }
  function openEdit(m: Matter) {
    setEditing(m);
    setDraft({
      title: m.title,
      clientId: m.clientId,
      category: m.category,
      status: m.status,
      ownerId: m.ownerId,
      fee: String(m.fee),
      nextEvent: m.nextEvent ?? "",
    });
    setErrors({});
    setModal(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!draft.title.trim()) e.title = "案件名を入力してください";
    if (!draft.clientId) e.clientId = "依頼者を選択してください";
    if (draft.fee && !/^\d+$/.test(draft.fee))
      e.fee = "金額は半角数字で入力してください";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);
    await fakeApi(true, 500);
    const payload = {
      title: draft.title.trim(),
      clientId: draft.clientId,
      category: draft.category,
      status: draft.status,
      ownerId: draft.ownerId,
      fee: Number(draft.fee || 0),
      nextEvent: draft.nextEvent.trim() || undefined,
      nextEventAt: editing?.nextEventAt,
    };
    if (editing) {
      updateMatter(editing.id, payload);
      toast.success("案件を更新しました");
    } else {
      addMatter(payload);
      toast.success("案件を登録しました", {
        description: `${payload.title}`,
      });
    }
    setSaving(false);
    setModal(false);
  }

  async function doDelete() {
    if (!confirm) return;
    setDeleting(true);
    await fakeApi(true, 450);
    removeMatter(confirm.id);
    setDeleting(false);
    setConfirm(null);
    toast.success("案件を削除しました");
  }

  return (
    <div>
      <PageHeader
        title="案件管理"
        subtitle={`全 ${matters.length} 件 ・ 進行中 ${matters.filter((m) => m.status !== "完了").length} 件`}
        actions={
          <Button onClick={openNew}>
            <Plus size={16} />
            新規案件
          </Button>
        }
      />

      {/* フィルタバー */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="案件名・事件番号・依頼者で検索"
            className={inputCls + " pl-9"}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as never)}
              className="appearance-none rounded-xl border border-ink-200 bg-white py-2.5 pr-9 pl-3.5 text-sm text-ink-700 outline-none focus:border-brand-400"
            >
              <option value="すべて">すべてのステータス</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-400" />
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as never)}
              className="appearance-none rounded-xl border border-ink-200 bg-white py-2.5 pr-9 pl-3.5 text-sm text-ink-700 outline-none focus:border-brand-400"
            >
              <option value="updated">更新が新しい順</option>
              <option value="opened">受任日が新しい順</option>
              <option value="fee">金額が大きい順</option>
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-400" />
          </div>
        </div>
      </div>

      {/* 一覧 */}
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Briefcase size={24} />}
            title={q || status !== "すべて" ? "該当する案件がありません" : "まだ案件がありません"}
            description={
              q || status !== "すべて"
                ? "検索条件を変えてお試しください。"
                : "最初の案件を登録して、期日や請求をまとめて管理しましょう。"
            }
            action={
              !q && status === "すべて" ? (
                <Button onClick={openNew}>
                  <Plus size={16} />
                  案件を登録
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {filtered.map((m) => {
              const client = clients.find((c) => c.id === m.clientId);
              const owner = staffById(staff, m.ownerId);
              return (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="group p-4 transition hover:border-brand-200">
                    <div className="flex items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-ink-400">{m.code}</span>
                          <Pill tone={matterTone[m.status] as never}>{m.status}</Pill>
                          <Pill tone="gray">{m.category}</Pill>
                        </div>
                        <h3 className="mt-1.5 truncate font-semibold text-ink-900">{m.title}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                          <span>依頼者:{client?.name ?? "—"}</span>
                          <span>受任:{shortDate(m.openedAt)}</span>
                          {m.nextEvent && (
                            <span className="inline-flex items-center gap-1 text-brand-600">
                              <Calendar size={12} />
                              {m.nextEvent}
                              {m.nextEventAt && `(${shortDate(m.nextEventAt)})`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-bold text-ink-900 tnum">{yen(m.fee)}</span>
                        <div className="flex items-center gap-1">
                          {owner && <Avatar name={owner.name} color={owner.color} size={26} />}
                          <button
                            onClick={() => openEdit(m)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-ink-100 hover:text-brand-600"
                            aria-label="編集"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setConfirm(m)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-rose-50 hover:text-rose-600"
                            aria-label="削除"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* 追加・編集モーダル */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? "案件を編集" : "新規案件の登録"}
        width={560}
      >
        <div className="space-y-4">
          <Field label="案件名" required error={errors.title}>
            <input
              autoFocus
              className={inputCls}
              placeholder="例:売掛金回収請求事件"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="依頼者" required error={errors.clientId}>
              <select
                className={inputCls}
                value={draft.clientId}
                onChange={(e) => setDraft({ ...draft, clientId: e.target.value })}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="分野">
              <select
                className={inputCls}
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value as MatterCategory })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ステータス">
              <select
                className={inputCls}
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as MatterStatus })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="担当弁護士">
              <select
                className={inputCls}
                value={draft.ownerId}
                onChange={(e) => setDraft({ ...draft, ownerId: e.target.value })}
              >
                {staff
                  .filter((s) => s.role === "弁護士")
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="見込み金額(円)" error={errors.fee} hint="着手金+報酬の見込み">
              <input
                className={inputCls}
                inputMode="numeric"
                placeholder="500000"
                value={draft.fee}
                onChange={(e) => setDraft({ ...draft, fee: e.target.value })}
              />
            </Field>
            <Field label="次のタスク・期日">
              <input
                className={inputCls}
                placeholder="例:第2回口頭弁論"
                value={draft.nextEvent}
                onChange={(e) => setDraft({ ...draft, nextEvent: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModal(false)}>
              キャンセル
            </Button>
            <Button onClick={save} loading={saving}>
              {editing ? "更新する" : "登録する"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 削除確認 */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="案件を削除しますか?"
        width={420}
      >
        <p className="text-sm text-ink-600">
          「<span className="font-semibold text-ink-900">{confirm?.title}</span>
          」を削除します。この操作は取り消せません。
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirm(null)}>
            キャンセル
          </Button>
          <Button variant="danger" onClick={doDelete} loading={deleting}>
            <Trash2 size={15} />
            削除する
          </Button>
        </div>
      </Modal>
    </div>
  );
}
