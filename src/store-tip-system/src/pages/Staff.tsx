import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  UserPlus,
  QrCode,
  Wallet,
  Pencil,
  Users,
  ExternalLink,
  Download,
} from "lucide-react";
import { useStore } from "../store";
import type { Staff } from "../data/seed";
import { STORE_NAME, STORE_BRANCH } from "../data/seed";
import { Avatar, Button, Card, EmptyState, Field, FakeQR, Modal, Pill, Skeleton, inputCls } from "../components/ui";
import { useLoad } from "../lib/useLoad";
import { yen } from "../lib/format";
import { monthTips, byStaff, pendingPayout } from "../lib/calc";

export default function StaffPage() {
  const staff = useStore((s) => s.staff);
  const tips = useStore((s) => s.tips);
  const addStaff = useStore((s) => s.addStaff);
  const updateStaff = useStore((s) => s.updateStaff);
  const toggleActive = useStore((s) => s.toggleActive);
  const settleStaff = useStore((s) => s.settleStaff);
  const loading = useLoad();

  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [creating, setCreating] = useState(false);
  const [qrFor, setQrFor] = useState<Staff | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const monthly = monthTips(tips);
    const totals = new Map(byStaff(monthly, staff).map((r) => [r.staff.id, r]));
    const pend = new Map(
      staff.map((s) => [s.id, pendingPayout(tips.filter((t) => t.staffId === s.id))]),
    );
    let list = staff.map((s) => ({
      staff: s,
      monthTotal: totals.get(s.id)?.total ?? 0,
      monthCount: totals.get(s.id)?.count ?? 0,
      pending: pend.get(s.id) ?? 0,
    }));
    if (onlyActive) list = list.filter((r) => r.staff.active);
    const kw = q.trim();
    if (kw) list = list.filter((r) => r.staff.name.includes(kw) || r.staff.role.includes(kw));
    return list.sort((a, b) => b.monthTotal - a.monthTotal);
  }, [staff, tips, q, onlyActive]);

  const onSettle = async (s: Staff) => {
    setBusyId(s.id);
    await new Promise((r) => setTimeout(r, 600));
    const n = settleStaff(s.id);
    setBusyId(null);
    if (n > 0) toast.success(`${s.name} さんへ ${n} 件を精算しました`);
    else toast(`${s.name} さんに精算待ちはありません`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">スタッフ管理</h1>
          <p className="mt-1 text-sm text-ink-500">
            {STORE_NAME} {STORE_BRANCH} の受付スタッフとチップ受取・精算
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <UserPlus size={16} /> スタッフを追加
        </Button>
      </div>

      {/* ツールバー */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            className={inputCls + " pl-9"}
            placeholder="名前・役職で検索"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={onlyActive}
            onChange={(e) => setOnlyActive(e.target.checked)}
            className="h-4 w-4 rounded border-ink-300 accent-brand-600"
          />
          稼働中のみ
        </label>
        <div className="ml-auto text-sm text-ink-400">{rows.length} 名</div>
      </div>

      <Card className="overflow-hidden">
        {/* ヘッダ行(PC) */}
        <div className="hidden grid-cols-[1.6fr_1fr_1fr_auto] gap-4 border-b border-ink-100 px-5 py-3 text-xs font-semibold text-ink-400 lg:grid">
          <div>スタッフ</div>
          <div className="text-right">今月の受取</div>
          <div className="text-right">精算待ち</div>
          <div className="text-right">操作</div>
        </div>

        {loading ? (
          <div className="divide-y divide-ink-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Users size={22} />}
            title="該当するスタッフがいません"
            description={q ? "検索条件を変えてお試しください。" : "最初のスタッフを追加しましょう。"}
            action={
              !q && (
                <Button onClick={() => setCreating(true)}>
                  <UserPlus size={16} /> スタッフを追加
                </Button>
              )
            }
          />
        ) : (
          <div className="divide-y divide-ink-100">
            <AnimatePresence initial={false}>
              {rows.map((r) => (
                <motion.div
                  key={r.staff.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 gap-3 px-5 py-4 lg:grid-cols-[1.6fr_1fr_1fr_auto] lg:items-center lg:gap-4"
                >
                  {/* スタッフ */}
                  <div className="flex items-center gap-3">
                    <Avatar name={r.staff.name} color={r.staff.color} size={42} />
                    <div className="min-w-0 leading-tight">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-semibold text-ink-900">{r.staff.name}</span>
                        {r.staff.active ? (
                          <Pill tone="green">稼働中</Pill>
                        ) : (
                          <Pill tone="gray">休止中</Pill>
                        )}
                      </div>
                      <div className="text-xs text-ink-400">
                        {r.staff.role} · {r.monthCount} 件 / 今月
                      </div>
                    </div>
                  </div>

                  {/* 今月受取 */}
                  <div className="flex items-center justify-between lg:block lg:text-right">
                    <span className="text-xs text-ink-400 lg:hidden">今月の受取</span>
                    <span className="tnum font-bold text-ink-900">{yen(r.monthTotal)}</span>
                  </div>

                  {/* 精算待ち */}
                  <div className="flex items-center justify-between lg:block lg:text-right">
                    <span className="text-xs text-ink-400 lg:hidden">精算待ち</span>
                    <span
                      className={
                        "tnum font-semibold " + (r.pending > 0 ? "text-amber-600" : "text-ink-300")
                      }
                    >
                      {r.pending > 0 ? yen(r.pending) : "—"}
                    </span>
                  </div>

                  {/* 操作 */}
                  <div className="flex items-center gap-1.5 lg:justify-end">
                    <IconBtn title="精算する" onClick={() => onSettle(r.staff)} disabled={busyId === r.staff.id}>
                      <Wallet size={16} />
                    </IconBtn>
                    <IconBtn title="QR コード" onClick={() => setQrFor(r.staff)}>
                      <QrCode size={16} />
                    </IconBtn>
                    <IconBtn title="編集" onClick={() => setEditing(r.staff)}>
                      <Pencil size={16} />
                    </IconBtn>
                    <Link
                      to={`/tip/${r.staff.id}`}
                      title="チップ画面を開く"
                      className="grid h-9 w-9 place-items-center rounded-lg text-brand-600 transition hover:bg-brand-50"
                    >
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Card>

      {/* 追加 / 編集モーダル */}
      <StaffForm
        open={creating || !!editing}
        staff={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onCreate={(v) => {
          addStaff(v);
          toast.success(`${v.name} さんを追加しました`);
        }}
        onSave={(id, v) => {
          updateStaff(id, v);
          toast.success("スタッフ情報を更新しました");
        }}
        onToggle={(s) => {
          toggleActive(s.id);
          toast(s.active ? "休止に変更しました" : "稼働中に戻しました");
        }}
      />

      {/* QR モーダル */}
      <Modal open={!!qrFor} onClose={() => setQrFor(null)} title="チップ受付 QR コード">
        {qrFor && (
          <div className="flex flex-col items-center text-center">
            <div className="rounded-2xl border border-ink-200 p-4">
              <FakeQR seed={qrFor.handle + qrFor.id} size={168} />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Avatar name={qrFor.name} color={qrFor.color} size={30} />
              <div className="text-left leading-tight">
                <div className="text-sm font-semibold text-ink-900">{qrFor.name}</div>
                <div className="text-xs text-ink-400">{qrFor.role}</div>
              </div>
            </div>
            <p className="mt-3 max-w-xs text-xs text-ink-500">
              テーブルやレシートにこの QR を掲示すると、お客様がスマホでスキャンして
              このスタッフへチップを贈れます。
            </p>
            <div className="mt-4 flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => toast("このデモでは画像の書き出しは省略しています")}
              >
                <Download size={15} /> 画像を保存
              </Button>
              <Link to={`/tip/${qrFor.id}`} className="flex-1">
                <Button className="w-full">
                  <ExternalLink size={15} /> 画面を確認
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function IconBtn({
  children,
  title,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100 hover:text-ink-800 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function StaffForm({
  open,
  staff,
  onClose,
  onCreate,
  onSave,
  onToggle,
}: {
  open: boolean;
  staff: Staff | null;
  onClose: () => void;
  onCreate: (v: { name: string; role: string }) => void;
  onSave: (id: string, v: { name: string; role: string }) => void;
  onToggle: (s: Staff) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [touched, setTouched] = useState(false);

  // モーダルを開くたびに初期化
  useEffect(() => {
    if (open) {
      setName(staff?.name ?? "");
      setRole(staff?.role ?? "");
      setTouched(false);
    }
  }, [open, staff]);

  const nameErr = touched && !name.trim() ? "氏名を入力してください" : undefined;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!name.trim()) return;
    if (staff) onSave(staff.id, { name, role });
    else onCreate({ name, role });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={staff ? "スタッフを編集" : "スタッフを追加"}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="氏名" required error={nameErr}>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="例:佐藤 美咲"
            autoFocus
          />
        </Field>
        <Field label="役職" hint="ホールスタッフ / バリスタ / キッチン など">
          <input
            className={inputCls}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="例:バリスタ"
          />
        </Field>

        {staff && (
          <div className="flex items-center justify-between rounded-xl border border-ink-200 px-4 py-3">
            <div className="text-sm">
              <div className="font-medium text-ink-800">稼働状態</div>
              <div className="text-xs text-ink-400">休止中はチップ画面に表示されません</div>
            </div>
            <button
              type="button"
              onClick={() => onToggle(staff)}
              className={
                "relative h-6 w-11 rounded-full transition " +
                (staff.active ? "bg-brand-500" : "bg-ink-300")
              }
            >
              <span
                className={
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all " +
                  (staff.active ? "left-[22px]" : "left-0.5")
                }
              />
            </button>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            キャンセル
          </Button>
          <Button type="submit" className="flex-1">
            {staff ? "保存する" : "追加する"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
