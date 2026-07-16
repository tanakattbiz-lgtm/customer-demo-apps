import { useMemo, useState } from "react";
import { toast } from "sonner";
import { UserPlus, Search, Pencil, Trash2, Users, CheckCircle2, Clock } from "lucide-react";
import { useStore } from "../store";
import { POSITION_LIST, type Member, type Position } from "../data/seed";
import { useLoad } from "../lib/useLoad";
import {
  Card,
  Button,
  Avatar,
  Pill,
  Modal,
  Field,
  inputCls,
  EmptyState,
  Skeleton,
} from "../components/ui";

export default function Members() {
  const loading = useLoad();
  const members = useStore((s) => s.members);
  const submissions = useStore((s) => s.submissions);
  const removeMember = useStore((s) => s.removeMember);

  const [q, setQ] = useState("");
  const [posFilter, setPosFilter] = useState<"all" | Position>("all");
  const [edit, setEdit] = useState<Member | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDel, setConfirmDel] = useState<Member | null>(null);

  const submittedIds = useMemo(
    () => new Set(submissions.filter((s) => s.submittedAt).map((s) => s.memberId)),
    [submissions],
  );

  const filtered = useMemo(
    () =>
      members.filter((m) => {
        if (posFilter !== "all" && !m.positions.includes(posFilter)) return false;
        if (q.trim()) {
          const s = (m.name + m.kana).replace(/\s/g, "");
          if (!s.includes(q.trim())) return false;
        }
        return true;
      }),
    [members, q, posFilter],
  );

  if (loading) return <MembersSkeleton />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">スタッフ管理</h1>
          <p className="mt-1 text-sm text-ink-500">アルバイトスタッフの登録・編集を行います（{members.length}人）</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <UserPlus size={16} /> スタッフを追加
        </Button>
      </div>

      {/* フィルタ */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            className={inputCls + " pl-9"}
            placeholder="名前・ふりがなで検索"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={posFilter === "all"} onClick={() => setPosFilter("all")}>
            すべて
          </FilterChip>
          {POSITION_LIST.map((p) => (
            <FilterChip key={p} active={posFilter === p} onClick={() => setPosFilter(p)}>
              {p}
            </FilterChip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users size={24} />}
            title="該当するスタッフがいません"
            description="検索条件を変えてお試しください。"
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {/* PC:テーブル */}
          <table className="hidden w-full text-sm sm:table">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs font-semibold text-ink-500">
                <th className="px-5 py-3">スタッフ</th>
                <th className="px-3 py-3">役割</th>
                <th className="px-3 py-3">ポジション</th>
                <th className="px-3 py-3">今期の提出</th>
                <th className="px-3 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filtered.map((m) => (
                <tr key={m.id} className="transition hover:bg-ink-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} color={m.color} size={36} />
                      <div>
                        <div className="text-sm font-semibold text-ink-800">{m.name}</div>
                        <div className="text-[11px] text-ink-400">{m.kana}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Pill tone={m.role === "リーダー" ? "violet" : "gray"}>{m.role}</Pill>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {m.positions.map((p) => (
                        <span key={p} className="rounded-md bg-ink-100 px-2 py-0.5 text-[11px] text-ink-600">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {submittedIds.has(m.id) ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <CheckCircle2 size={14} /> 提出済み
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                        <Clock size={14} /> 未提出
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-1">
                      <IconBtn onClick={() => setEdit(m)} label="編集">
                        <Pencil size={15} />
                      </IconBtn>
                      <IconBtn onClick={() => setConfirmDel(m)} label="削除" danger>
                        <Trash2 size={15} />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* モバイル:カード */}
          <ul className="divide-y divide-ink-100 sm:hidden">
            {filtered.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={m.name} color={m.color} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-ink-800">{m.name}</span>
                    {m.role === "リーダー" && <Pill tone="violet">{m.role}</Pill>}
                  </div>
                  <div className="mt-0.5 text-[11px] text-ink-400">{m.positions.join("・")}</div>
                  <div className="mt-1">
                    {submittedIds.has(m.id) ? (
                      <span className="text-[11px] font-medium text-emerald-600">● 提出済み</span>
                    ) : (
                      <span className="text-[11px] font-medium text-amber-600">● 未提出</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <IconBtn onClick={() => setEdit(m)} label="編集">
                    <Pencil size={15} />
                  </IconBtn>
                  <IconBtn onClick={() => setConfirmDel(m)} label="削除" danger>
                    <Trash2 size={15} />
                  </IconBtn>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {(creating || edit) && (
        <MemberModal
          member={edit}
          onClose={() => {
            setCreating(false);
            setEdit(null);
          }}
        />
      )}

      {/* 削除確認 */}
      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="スタッフを削除" width={400}>
        {confirmDel && (
          <div className="space-y-4">
            <p className="text-sm text-ink-600">
              <b className="text-ink-900">{confirmDel.name}</b> さんを削除します。
              提出済みの希望・割当も削除されます。よろしいですか?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmDel(null)}>
                キャンセル
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  removeMember(confirmDel.id);
                  toast.success(`${confirmDel.name} さんを削除しました`);
                  setConfirmDel(null);
                }}
              >
                <Trash2 size={15} /> 削除する
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function MemberModal({ member, onClose }: { member: Member | null; onClose: () => void }) {
  const add = useStore((s) => s.addMember);
  const update = useStore((s) => s.updateMember);
  const editing = !!member;

  const [name, setName] = useState(member?.name ?? "");
  const [kana, setKana] = useState(member?.kana ?? "");
  const [role, setRole] = useState<Member["role"]>(member?.role ?? "スタッフ");
  const [positions, setPositions] = useState<Position[]>(member?.positions ?? ["ホール"]);
  const [err, setErr] = useState<{ name?: string; pos?: string }>({});
  const [loading, setLoading] = useState(false);

  const togglePos = (p: Position) =>
    setPositions((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const submit = () => {
    const e: typeof err = {};
    if (!name.trim()) e.name = "氏名を入力してください";
    if (positions.length === 0) e.pos = "ポジションを1つ以上選んでください";
    setErr(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => {
      if (editing && member) {
        update(member.id, { name: name.trim(), kana: kana.trim(), role, positions });
        toast.success("スタッフ情報を更新しました");
      } else {
        add({ name: name.trim(), kana: kana.trim(), role, positions });
        toast.success("スタッフを追加しました");
      }
      setLoading(false);
      onClose();
    }, 500);
  };

  return (
    <Modal open onClose={onClose} title={editing ? "スタッフを編集" : "スタッフを追加"}>
      <div className="space-y-4">
        <Field label="氏名" required error={err.name}>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例:山田 花子"
          />
        </Field>
        <Field label="ふりがな">
          <input
            className={inputCls}
            value={kana}
            onChange={(e) => setKana(e.target.value)}
            placeholder="やまだ はなこ"
          />
        </Field>
        <Field label="役割">
          <div className="flex gap-2">
            {(["スタッフ", "リーダー"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={
                  "flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition " +
                  (role === r
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : "border-ink-200 text-ink-600 hover:bg-ink-50")
                }
              >
                {r}
              </button>
            ))}
          </div>
        </Field>
        <Field label="ポジション" required error={err.pos}>
          <div className="flex flex-wrap gap-2">
            {POSITION_LIST.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => togglePos(p)}
                className={
                  "rounded-xl border px-3.5 py-1.5 text-sm font-medium transition " +
                  (positions.includes(p)
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : "border-ink-200 text-ink-600 hover:bg-ink-50")
                }
              >
                {p}
              </button>
            ))}
          </div>
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={submit} loading={loading}>
            {editing ? "更新する" : "追加する"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function FilterChip({
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
        "rounded-full px-3 py-1.5 text-xs font-medium transition " +
        (active ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-600 hover:bg-ink-200")
      }
    >
      {children}
    </button>
  );
}

function IconBtn({
  onClick,
  label,
  danger,
  children,
}: {
  onClick: () => void;
  label: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
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

function MembersSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full max-w-md rounded-xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}
