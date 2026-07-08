import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Building2,
  User,
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
import { clientTone } from "../lib/status";
import type {
  Client,
  ClientPlan,
  ClientStatus,
  ClientType,
} from "../data/seed";

const PLANS: ClientPlan[] = [
  "スポット",
  "顧問(ライト)",
  "顧問(スタンダード)",
  "顧問(プレミアム)",
];
const STATUSES: ClientStatus[] = ["見込み", "契約中", "休眠"];

type Draft = Omit<Client, "id" | "createdAt">;

const emptyDraft = (ownerId: string): Draft => ({
  name: "",
  kana: "",
  type: "法人",
  plan: "スポット",
  status: "見込み",
  contact: "",
  email: "",
  phone: "",
  address: "",
  ownerId,
  note: "",
});

export default function Clients() {
  const loading = useLoad();
  const nav = useNavigate();
  const clients = useStore((s) => s.clients);
  const matters = useStore((s) => s.matters);
  const staff = useStore((s) => s.staff);
  const addClient = useStore((s) => s.addClient);
  const updateClient = useStore((s) => s.updateClient);
  const removeClient = useStore((s) => s.removeClient);
  const currentUserId = useStore((s) => s.currentUserId);

  const [q, setQ] = useState("");
  const [tab, setTab] = useState<ClientStatus | "すべて">("すべて");

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft(currentUserId));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { すべて: clients.length };
    STATUSES.forEach((s) => (c[s] = clients.filter((x) => x.status === s).length));
    return c;
  }, [clients]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return clients.filter((c) => {
      const hay = `${c.name} ${c.kana} ${c.contact} ${c.email}`.toLowerCase();
      return (tab === "すべて" || c.status === tab) && (!kw || hay.includes(kw));
    });
  }, [clients, q, tab]);

  function openNew() {
    setEditing(null);
    setDraft(emptyDraft(currentUserId));
    setErrors({});
    setModal(true);
  }
  function openEdit(c: Client) {
    setEditing(c);
    const { id: _id, createdAt: _ca, ...rest } = c;
    setDraft(rest);
    setErrors({});
    setModal(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!draft.name.trim()) e.name = "氏名・法人名を入力してください";
    if (!draft.email.trim()) e.email = "メールアドレスを入力してください";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email))
      e.email = "メールアドレスの形式が正しくありません";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);
    await fakeApi(true, 500);
    if (editing) {
      updateClient(editing.id, draft);
      toast.success("顧問先情報を更新しました");
    } else {
      addClient(draft);
      toast.success("顧問先を登録しました", { description: draft.name });
    }
    setSaving(false);
    setModal(false);
  }

  async function doDelete() {
    if (!confirm) return;
    setDeleting(true);
    await fakeApi(true, 450);
    removeClient(confirm.id);
    setDeleting(false);
    setConfirm(null);
    toast.success("顧問先を削除しました");
  }

  const matterCount = (id: string) =>
    matters.filter((m) => m.clientId === id).length;

  return (
    <div>
      <PageHeader
        title="顧問先・会員管理"
        subtitle={`全 ${clients.length} 件 ・ 契約中 ${counts["契約中"]} 件`}
        actions={
          <Button onClick={openNew}>
            <Plus size={16} />
            顧問先を追加
          </Button>
        }
      />

      {/* タブ + 検索 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl bg-ink-200/60 p-1">
          {(["すべて", ...STATUSES] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "rounded-lg px-3 py-1.5 text-sm font-medium transition " +
                (tab === t
                  ? "bg-white text-ink-900 shadow-sm"
                  : "text-ink-500 hover:text-ink-700")
              }
            >
              {t}
              <span className="ml-1.5 text-xs text-ink-400 tnum">{counts[t]}</span>
            </button>
          ))}
        </div>
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="名前・かな・担当者で検索"
            className={inputCls + " pl-9"}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users size={24} />}
            title={q || tab !== "すべて" ? "該当する顧問先がありません" : "まだ顧問先がありません"}
            description={
              q || tab !== "すべて"
                ? "検索条件を変えてお試しください。"
                : "最初の顧問先を登録しましょう。"
            }
            action={
              !q && tab === "すべて" ? (
                <Button onClick={openNew}>
                  <Plus size={16} />
                  顧問先を追加
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {filtered.map((c) => {
              const owner = staffById(staff, c.ownerId);
              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="flex h-full flex-col p-5">
                    <div className="flex items-start gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                        {c.type === "法人" ? <Building2 size={20} /> : <User size={20} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-semibold text-ink-900">{c.name}</h3>
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          <Pill tone={clientTone[c.status] as never}>{c.status}</Pill>
                          <Pill tone="blue">{c.plan}</Pill>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        <button
                          onClick={() => openEdit(c)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-ink-100 hover:text-brand-600"
                          aria-label="編集"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setConfirm(c)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-rose-50 hover:text-rose-600"
                          aria-label="削除"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-sm text-ink-600">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="shrink-0 text-ink-400" />
                        <span className="truncate">{c.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="shrink-0 text-ink-400" />
                        {c.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="shrink-0 text-ink-400" />
                        <span className="truncate">{c.address}</span>
                      </div>
                    </div>

                    {c.note && (
                      <p className="mt-3 line-clamp-2 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-500">
                        {c.note}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center gap-2 text-xs text-ink-500">
                        {owner && <Avatar name={owner.name} color={owner.color} size={22} />}
                        <span>主担当 {owner?.name}</span>
                        <span className="text-ink-300">·</span>
                        <span>案件 {matterCount(c.id)}件</span>
                      </div>
                      <button
                        onClick={() => nav("/chat?client=" + c.id)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-600 transition hover:bg-brand-50"
                      >
                        <MessageSquare size={13} />
                        連絡
                      </button>
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
        title={editing ? "顧問先を編集" : "顧問先の追加"}
        width={580}
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="氏名 / 法人名" required error={errors.name}>
              <input
                autoFocus
                className={inputCls}
                placeholder="例:株式会社〇〇"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </Field>
            <Field label="ふりがな">
              <input
                className={inputCls}
                value={draft.kana}
                onChange={(e) => setDraft({ ...draft, kana: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="区分">
              <select
                className={inputCls}
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value as ClientType })}
              >
                <option value="法人">法人</option>
                <option value="個人">個人</option>
              </select>
            </Field>
            <Field label="プラン">
              <select
                className={inputCls}
                value={draft.plan}
                onChange={(e) => setDraft({ ...draft, plan: e.target.value as ClientPlan })}
              >
                {PLANS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="ステータス">
              <select
                className={inputCls}
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as ClientStatus })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="担当者名">
              <input
                className={inputCls}
                placeholder="例:総務部 田中"
                value={draft.contact}
                onChange={(e) => setDraft({ ...draft, contact: e.target.value })}
              />
            </Field>
            <Field label="主担当弁護士">
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
            <Field label="メールアドレス" required error={errors.email}>
              <input
                className={inputCls}
                placeholder="mail@example.com"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </Field>
            <Field label="電話番号">
              <input
                className={inputCls}
                placeholder="03-0000-0000"
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              />
            </Field>
          </div>
          <Field label="住所">
            <input
              className={inputCls}
              value={draft.address}
              onChange={(e) => setDraft({ ...draft, address: e.target.value })}
            />
          </Field>
          <Field label="メモ">
            <textarea
              className={inputCls + " min-h-20 resize-y"}
              placeholder="対応方針や注意点など"
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
            />
          </Field>
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
        title="顧問先を削除しますか?"
        width={440}
      >
        <p className="text-sm text-ink-600">
          「<span className="font-semibold text-ink-900">{confirm?.name}</span>」を削除すると、
          関連する案件・メッセージも削除されます。この操作は取り消せません。
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
