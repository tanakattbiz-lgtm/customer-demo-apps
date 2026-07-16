import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  UserPlus,
  Send,
  ChevronRight,
  AlertTriangle,
  Check,
  Clock,
  UserX,
  RotateCcw,
} from "lucide-react";
import { useStore } from "../store";
import {
  Card,
  Pill,
  Progress,
  Skeleton,
  Avatar,
  StatusDot,
  Button,
  Modal,
  Field,
  inputCls,
  EmptyState,
} from "../components/ui";
import PageHeader from "../components/PageHeader";
import { useLoad } from "../lib/useLoad";
import { fakeApi } from "../lib/fakeApi";
import { isStalled, overallProgress, stageStepsDone } from "../lib/pipeline";
import { fromNow, fmtDate, yen } from "../lib/format";
import {
  STAGE_ORDER,
  STAGE_LABEL,
  STAGE_SHORT,
  STAGE_TONE,
  scenarioForStage,
  staffById,
  type Member,
  type Stage,
} from "../data/seed";

type FilterKey = Stage | "all" | "stalled";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "friend", label: "友だち追加" },
  { key: "account", label: "口座開設" },
  { key: "trade", label: "取引" },
  { key: "done", label: "完了" },
  { key: "churn", label: "離脱" },
  { key: "stalled", label: "要フォロー" },
];

const PER_PAGE = 8;
const BROKERS = ["A社 FX口座", "B社 FX口座", "C社 証券口座", "D社 FX口座"];
const REWARDS = [15000, 20000, 25000, 30000];

export default function Members() {
  const loading = useLoad();
  const members = useStore((s) => s.members);
  const scenarios = useStore((s) => s.scenarios);
  const staff = useStore((s) => s.staff);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return members.filter((m) => {
      if (filter === "stalled" && !isStalled(m)) return false;
      if (filter !== "all" && filter !== "stalled" && m.stage !== filter) return false;
      if (kw) {
        const hay = `${m.name} ${m.lineName} ${m.broker}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }, [members, q, filter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const paged = filtered.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);

  const selected = members.find((m) => m.id === selectedId) ?? null;

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: members.length, stalled: 0 };
    for (const st of STAGE_ORDER) c[st] = 0;
    c.churn = 0;
    for (const m of members) {
      c[m.stage] = (c[m.stage] ?? 0) + 1;
      if (isStalled(m)) c.stalled += 1;
    }
    return c;
  }, [members]);

  const onFilter = (k: FilterKey) => {
    setFilter(k);
    setPage(0);
  };

  return (
    <>
      <PageHeader
        title="ユーザー進捗一覧"
        subtitle="LINE登録ユーザーの進捗状況を一覧・検索し、ステップ配信を管理します。"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus size={16} />
            ユーザーを追加
          </Button>
        }
      />

      {/* 検索・フィルタ */}
      <Card className="mb-4 p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
              placeholder="氏名・LINE名・口座で検索"
              className={inputCls + " pl-10"}
            />
          </div>
          <div className="thin-scroll flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => onFilter(f.key)}
                className={
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition " +
                  (filter === f.key
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50")
                }
              >
                {f.key === "stalled" && <AlertTriangle size={12} />}
                {f.label}
                <span className={"tnum " + (filter === f.key ? "text-white/80" : "text-ink-400")}>
                  {counts[f.key] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* 一覧 */}
      <Card>
        {/* テーブルヘッダー(PC) */}
        <div className="hidden grid-cols-[1fr_130px_120px_100px_110px] items-center gap-3 border-b border-ink-100 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-400 lg:grid">
          <div>ユーザー</div>
          <div>ステージ</div>
          <div>進捗</div>
          <div>担当</div>
          <div className="text-right">最終アクティブ</div>
        </div>

        {loading ? (
          <div className="divide-y divide-ink-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-2/5" />
                  <Skeleton className="h-2.5 w-1/4" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : paged.length === 0 ? (
          <EmptyState
            icon={<Search size={22} />}
            title="該当するユーザーがいません"
            description="検索条件やフィルタを変更してお試しください。"
            action={
              <Button variant="outline" onClick={() => { setQ(""); onFilter("all"); }}>
                条件をリセット
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-ink-100">
            {paged.map((m) => (
              <MemberRow key={m.id} m={m} scenarios={scenarios} staff={staff} onOpen={() => setSelectedId(m.id)} />
            ))}
          </div>
        )}

        {/* ページネーション */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3 text-sm">
            <span className="text-xs text-ink-400">
              全 {filtered.length} 件中 {safePage * PER_PAGE + 1}–{Math.min(filtered.length, (safePage + 1) * PER_PAGE)} 件
            </span>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
                前へ
              </Button>
              <span className="tnum px-2 text-xs text-ink-500">
                {safePage + 1} / {pageCount}
              </span>
              <Button size="sm" variant="outline" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}>
                次へ
              </Button>
            </div>
          </div>
        )}
      </Card>

      <MemberDetail member={selected} onClose={() => setSelectedId(null)} />
      <AddMemberModal open={addOpen} onClose={() => setAddOpen(false)} onAdded={(id) => setSelectedId(id)} />
    </>
  );
}

function MemberRow({
  m,
  scenarios,
  staff,
  onOpen,
}: {
  m: Member;
  scenarios: ReturnType<typeof useStore.getState>["scenarios"];
  staff: ReturnType<typeof useStore.getState>["staff"];
  onOpen: () => void;
}) {
  const pct = overallProgress(m, scenarios);
  const st = staffById(staff, m.assigneeId);
  const stalled = isStalled(m);
  return (
    <button
      onClick={onOpen}
      className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-5 py-3.5 text-left transition hover:bg-ink-50 lg:grid-cols-[1fr_130px_120px_100px_110px]"
    >
      {/* ユーザー */}
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={m.name} color={m.color} size={40} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-ink-900">{m.name}</span>
            {stalled && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                <AlertTriangle size={10} /> 要フォロー
              </span>
            )}
          </div>
          <div className="truncate text-xs text-ink-400">@{m.lineName}・{m.broker}</div>
          {/* モバイル用の補足 */}
          <div className="mt-1 flex items-center gap-2 lg:hidden">
            <Pill tone={STAGE_TONE[m.stage] as never}>{STAGE_SHORT[m.stage]}</Pill>
            <span className="text-[11px] text-ink-400">{fromNow(m.lastActiveAt)}</span>
          </div>
        </div>
      </div>

      {/* ステージ */}
      <div className="hidden lg:block">
        <Pill tone={STAGE_TONE[m.stage] as never}>
          <StatusDot tone={STAGE_TONE[m.stage] as never} />
          {STAGE_SHORT[m.stage]}
        </Pill>
      </div>

      {/* 進捗 */}
      <div className="hidden lg:block">
        <div className="mb-1 flex justify-between text-[11px] text-ink-400">
          <span>進捗</span>
          <span className="tnum">{pct}%</span>
        </div>
        <Progress pct={pct} tone={m.stage === "done" ? "green" : m.stage === "churn" ? "red" : "brand"} />
      </div>

      {/* 担当 */}
      <div className="hidden items-center gap-1.5 lg:flex">
        <Avatar name={st?.name ?? "―"} color={st?.color} size={24} />
        <span className="truncate text-xs text-ink-500">{st?.name}</span>
      </div>

      {/* 最終アクティブ */}
      <div className="hidden items-center justify-end gap-1.5 text-right lg:flex">
        <span className={"text-xs " + (stalled ? "text-amber-600" : "text-ink-400")}>{fromNow(m.lastActiveAt)}</span>
      </div>

      <ChevronRight size={16} className="shrink-0 text-ink-300 lg:hidden" />
    </button>
  );
}

// ---------------- 詳細モーダル(ステップ配信) ----------------
function MemberDetail({ member, onClose }: { member: Member | null; onClose: () => void }) {
  const scenarios = useStore((s) => s.scenarios);
  const staff = useStore((s) => s.staff);
  const sendNextStep = useStore((s) => s.sendNextStep);
  const setStage = useStore((s) => s.setStage);
  const [sending, setSending] = useState(false);

  // member が null になってもモーダルの閉じアニメ用に前回値を保持
  const m = member;
  if (!m) return <Modal open={false} onClose={onClose} title=""><div /></Modal>;

  const sc = scenarioForStage(scenarios, m.stage);
  const st = staffById(staff, m.assigneeId);
  const pct = overallProgress(m, scenarios);
  const done = stageStepsDone(m, scenarios);
  const terminal = m.stage === "done" || m.stage === "churn";

  const onSend = async () => {
    setSending(true);
    await fakeApi(true, 650);
    const r = sendNextStep(m.id);
    setSending(false);
    if (!r.ok) return;
    if (r.advanced) {
      toast.success(`${r.stageLabel} へ進みました`, {
        description: `${m.name} さんのステップ配信が完了しました。`,
      });
    } else {
      toast.success("ステップを配信しました", { description: r.stepTitle });
    }
  };

  const onChurn = () => {
    setStage(m.id, "churn");
    toast("離脱として記録しました", { description: `${m.name} さんを要再アプローチに分類しました。` });
  };
  const onReactivate = () => {
    setStage(m.id, "friend");
    toast.success("再アプローチを開始しました", { description: `${m.name} さんを友だち追加ステージに戻しました。` });
  };

  return (
    <Modal
      open={!!member}
      onClose={onClose}
      width={600}
      title={
        <span className="flex items-center gap-2">
          <Avatar name={m.name} color={m.color} size={28} />
          {m.name}
        </span>
      }
    >
      {/* 基本情報 */}
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone={STAGE_TONE[m.stage] as never}>
          <StatusDot tone={STAGE_TONE[m.stage] as never} />
          {STAGE_LABEL[m.stage]}
        </Pill>
        {isStalled(m) && (
          <Pill tone="amber">
            <AlertTriangle size={11} /> 要フォロー
          </Pill>
        )}
        <span className="text-xs text-ink-400">@{m.lineName}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-ink-100 bg-ink-50 p-4 text-sm sm:grid-cols-4">
        <Info label="案内中の口座" value={m.broker} />
        <Info label="想定報酬" value={yen(m.reward)} />
        <Info label="担当" value={st?.name ?? "―"} />
        <Info label="登録日" value={fmtDate(m.joinedAt)} />
      </div>

      {/* 進捗バー */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs text-ink-500">
          <span>全体の進捗</span>
          <span className="tnum font-semibold text-ink-700">{pct}%</span>
        </div>
        <Progress pct={pct} tone={m.stage === "done" ? "green" : m.stage === "churn" ? "red" : "brand"} />
      </div>

      {/* ステップ配信 */}
      <div className="mt-5">
        <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-ink-800">
          <Send size={15} className="text-brand-500" />
          {terminal ? "配信履歴" : `ステップ配信(${STAGE_LABEL[m.stage]})`}
        </h4>

        {terminal ? (
          <div className="rounded-xl border border-ink-100 bg-ink-50 px-4 py-6 text-center text-sm text-ink-500">
            {m.stage === "done"
              ? "このユーザーは取引完了まで到達しました。全ステップの配信が完了しています。"
              : "このユーザーは離脱として記録されています。再アプローチを開始できます。"}
          </div>
        ) : (
          <div className="space-y-2">
            {sc?.steps.map((step, i) => {
              const delivered = i < m.stepIndex;
              const isNext = i === m.stepIndex;
              return (
                <div
                  key={step.id}
                  className={
                    "flex gap-3 rounded-xl border px-3.5 py-3 " +
                    (delivered
                      ? "border-emerald-100 bg-emerald-50/50"
                      : isNext
                        ? "border-brand-200 bg-brand-50/50"
                        : "border-ink-100 bg-white")
                  }
                >
                  <div
                    className={
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold " +
                      (delivered
                        ? "bg-emerald-500 text-white"
                        : isNext
                          ? "bg-brand-500 text-white"
                          : "bg-ink-200 text-ink-500")
                    }
                  >
                    {delivered ? <Check size={13} /> : i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink-800">{step.title}</span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-ink-400">
                        <Clock size={10} /> {step.timing}
                      </span>
                      {delivered && <span className="text-[10px] font-bold text-emerald-600">配信済み</span>}
                      {isNext && <span className="text-[10px] font-bold text-brand-600">次に配信</span>}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-500">{step.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* アクション */}
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-4">
        {!terminal && (
          <Button onClick={onSend} loading={sending} disabled={done}>
            <Send size={15} />
            {done ? "全ステップ配信済み" : "次のステップを配信"}
          </Button>
        )}
        {m.stage === "churn" ? (
          <Button variant="outline" onClick={onReactivate}>
            <RotateCcw size={15} />
            再アプローチを開始
          </Button>
        ) : m.stage !== "done" ? (
          <Button variant="ghost" onClick={onChurn}>
            <UserX size={15} />
            離脱として記録
          </Button>
        ) : null}
      </div>
    </Modal>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] text-ink-400">{label}</div>
      <div className="truncate text-sm font-medium text-ink-800">{value}</div>
    </div>
  );
}

// ---------------- ユーザー追加モーダル ----------------
function AddMemberModal({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: (id: string) => void;
}) {
  const addMember = useStore((s) => s.addMember);
  const staff = useStore((s) => s.staff);
  const [name, setName] = useState("");
  const [lineName, setLineName] = useState("");
  const [broker, setBroker] = useState(BROKERS[0]);
  const [reward, setReward] = useState(REWARDS[1]);
  const [assigneeId, setAssigneeId] = useState(staff[0]?.id ?? "");
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const nameErr = touched && !name.trim() ? "氏名を入力してください" : "";
  const lineErr = touched && !lineName.trim() ? "LINE名を入力してください" : "";

  const reset = () => {
    setName("");
    setLineName("");
    setBroker(BROKERS[0]);
    setReward(REWARDS[1]);
    setAssigneeId(staff[0]?.id ?? "");
    setTouched(false);
  };

  const onSubmit = async () => {
    setTouched(true);
    if (!name.trim() || !lineName.trim()) return;
    setSaving(true);
    await fakeApi(true, 600);
    const m = addMember({ name: name.trim(), lineName: lineName.trim(), broker, reward, assigneeId });
    setSaving(false);
    toast.success("ユーザーを追加しました", {
      description: `${m.name} さんにウェルカムメッセージを自動配信しました。`,
    });
    reset();
    onClose();
    onAdded(m.id);
  };

  return (
    <Modal open={open} onClose={onClose} title="ユーザーを追加" width={520}>
      <div className="space-y-4">
        <p className="rounded-xl bg-brand-50 px-4 py-3 text-xs text-brand-700">
          追加したユーザーは「友だち追加」ステージから開始し、ウェルカムメッセージが自動配信されます。
        </p>
        <Field label="氏名" required error={nameErr}>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 山田 太郎" />
        </Field>
        <Field label="LINE表示名" required error={lineErr}>
          <input className={inputCls} value={lineName} onChange={(e) => setLineName(e.target.value)} placeholder="例: taro_y" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="案内する口座">
            <select className={inputCls} value={broker} onChange={(e) => setBroker(e.target.value)}>
              {BROKERS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field label="想定報酬">
            <select className={inputCls} value={reward} onChange={(e) => setReward(Number(e.target.value))}>
              {REWARDS.map((r) => (
                <option key={r} value={r}>{yen(r)}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="担当者">
          <select className={inputCls} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>{s.name}（{s.role}）</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2 border-t border-ink-100 pt-4">
        <Button variant="ghost" onClick={onClose}>キャンセル</Button>
        <Button onClick={onSubmit} loading={saving}>
          <UserPlus size={15} />
          追加する
        </Button>
      </div>
    </Modal>
  );
}
