import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "sonner";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { ArrowLeft, Check, ChevronRight, Clock, Save, Trash2 } from "lucide-react";
import { useStore } from "../store";
import {
  CATEGORIES,
  DEPARTMENTS,
  PRIORITY_LABEL,
  STAFF,
  STATUS_FLOW,
  STATUS_LABEL,
  STATUS_TONE,
  type Category,
  type Department,
  type Priority,
  type Status,
} from "../data/seed";
import { fakeApi } from "../lib/fakeApi";
import { Avatar, Button, Card, Field, Modal, Pill, StatusDot, inputCls } from "../components/ui";

type FormState = {
  title: string;
  category: Category;
  requester: string;
  requesterDept: Department;
  assigneeId: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  estimateHours: string;
  amount: string;
  note: string;
};

const emptyForm = (): FormState => ({
  title: "",
  category: CATEGORIES[0],
  requester: "",
  requesterDept: DEPARTMENTS[0],
  assigneeId: "",
  priority: "normal",
  status: "todo",
  dueDate: "",
  estimateHours: "",
  amount: "",
  note: "",
});

type Errors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.title.trim()) e.title = "件名を入力してください";
  else if (f.title.trim().length < 4) e.title = "件名は4文字以上で入力してください";
  if (!f.requester.trim()) e.requester = "依頼者名を入力してください";
  if (!f.dueDate) e.dueDate = "対応期限を選択してください";
  if (!f.estimateHours.trim()) e.estimateHours = "見積工数を入力してください";
  else if (!/^\d+(\.\d)?$/.test(f.estimateHours.trim()) || Number(f.estimateHours) <= 0)
    e.estimateHours = "0より大きい数値で入力してください（例: 3.5）";
  if (f.amount.trim() && !/^\d+$/.test(f.amount.trim()))
    e.amount = "金額は半角数字のみで入力してください";
  return e;
}

export default function JobDetail() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { jobs, addJob, updateJob, removeJob, setStatus, assign } = useStore();
  const job = useMemo(() => jobs.find((j) => j.id === id), [jobs, id]);

  const [form, setForm] = useState<FormState>(() =>
    job
      ? {
          title: job.title,
          category: job.category,
          requester: job.requester,
          requesterDept: job.requesterDept,
          assigneeId: job.assigneeId ?? "",
          priority: job.priority,
          status: job.status,
          dueDate: job.dueDate,
          estimateHours: String(job.estimateHours),
          amount: job.amount ? String(job.amount) : "",
          note: job.note,
        }
      : emptyForm(),
  );
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [saving, setSaving] = useState(false);
  const [busyStatus, setBusyStatus] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const errors = validate(form);
  const show = (k: keyof FormState) => (touched[k] ? errors[k] : undefined);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const blur = (k: keyof FormState) => setTouched((t) => ({ ...t, [k]: true }));

  if (!isNew && !job) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="p-10 text-center">
          <p className="text-sm text-ink-600">案件が見つかりませんでした。</p>
          <Link to="/" className="mt-4 inline-block text-sm font-semibold text-brand-600">
            案件一覧へ戻る
          </Link>
        </Card>
      </div>
    );
  }

  const save = async () => {
    setTouched({
      title: true,
      requester: true,
      dueDate: true,
      estimateHours: true,
      amount: true,
    });
    if (Object.keys(errors).length) {
      toast.error("入力内容にエラーがあります");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      category: form.category,
      requester: form.requester.trim(),
      requesterDept: form.requesterDept,
      assigneeId: form.assigneeId || null,
      priority: form.priority,
      status: form.status,
      dueDate: form.dueDate,
      estimateHours: Number(form.estimateHours),
      amount: form.amount ? Number(form.amount) : 0,
      note: form.note.trim(),
    };
    await fakeApi(null, 600);

    if (isNew) {
      const created = addJob(payload);
      setSaving(false);
      toast.success(`案件 ${created.code} を登録しました`);
      navigate(`/jobs/${created.id}`, { replace: true });
    } else {
      updateJob(job!.id, payload);
      setSaving(false);
      toast.success("変更を保存しました");
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    await fakeApi(null, 500);
    removeJob(job!.id);
    setDeleting(false);
    setConfirmDelete(false);
    toast.success("案件を削除しました");
    navigate("/");
  };

  // 次のステータスへ進める（業務フローの1クリック進行）
  const stepIdx = job ? STATUS_FLOW.indexOf(job.status) : -1;
  const next = stepIdx >= 0 && stepIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[stepIdx + 1] : null;

  const advance = async (to: Status) => {
    setBusyStatus(true);
    await fakeApi(null, 450);
    setStatus(job!.id, to);
    setForm((f) => ({ ...f, status: to }));
    setBusyStatus(false);
    toast.success(`ステータスを「${STATUS_LABEL[to]}」に更新しました`);
  };

  const onAssign = async (staffId: string) => {
    set("assigneeId", staffId);
    if (isNew) return;
    await fakeApi(null, 350);
    assign(job!.id, staffId || null);
    const name = STAFF.find((s) => s.id === staffId)?.name;
    toast.success(name ? `${name} さんに割り当てました` : "担当者の割り当てを解除しました");
  };

  return (
    <motion.div
      className="mx-auto max-w-5xl"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <button
        onClick={() => navigate("/")}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 transition hover:text-ink-800"
      >
        <ArrowLeft size={14} />
        案件一覧へ戻る
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            {job && <span className="tnum text-xs font-medium text-ink-400">{job.code}</span>}
            {job && (
              <Pill tone={STATUS_TONE[job.status]}>
                <StatusDot tone={STATUS_TONE[job.status]} />
                {STATUS_LABEL[job.status]}
              </Pill>
            )}
          </div>
          <h1 className="mt-1.5 text-xl font-bold text-ink-900">
            {isNew ? "案件を新規登録" : job!.title}
          </h1>
          {job && (
            <p className="mt-1 text-xs text-ink-400">
              登録：{format(parseISO(job.createdAt), "yyyy年M月d日 HH:mm")}（
              {formatDistanceToNow(parseISO(job.createdAt), { locale: ja, addSuffix: true })}）
            </p>
          )}
        </div>
        {job && (
          <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={15} />
            削除
          </Button>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        {/* フォーム */}
        <Card className="p-6">
          <div className="grid gap-5">
            <Field label="件名" required error={show("title")}>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                onBlur={() => blur("title")}
                placeholder="例：北関東エリア 定期補充品の見積書作成"
                className={inputCls}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="分類" required>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value as Category)}
                  className={inputCls}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="優先度" required>
                <select
                  value={form.priority}
                  onChange={(e) => set("priority", e.target.value as Priority)}
                  className={inputCls}
                >
                  {(["high", "normal", "low"] as const).map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABEL[p]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="依頼者" required error={show("requester")}>
                <input
                  value={form.requester}
                  onChange={(e) => set("requester", e.target.value)}
                  onBlur={() => blur("requester")}
                  placeholder="例：小野寺 健吾"
                  className={inputCls}
                />
              </Field>
              <Field label="依頼部署" required>
                <select
                  value={form.requesterDept}
                  onChange={(e) => set("requesterDept", e.target.value as Department)}
                  className={inputCls}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="対応期限" required error={show("dueDate")}>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => set("dueDate", e.target.value)}
                  onBlur={() => blur("dueDate")}
                  className={inputCls}
                />
              </Field>
              <Field label="見積工数" required error={show("estimateHours")} hint="単位：時間">
                <input
                  value={form.estimateHours}
                  onChange={(e) => set("estimateHours", e.target.value)}
                  onBlur={() => blur("estimateHours")}
                  inputMode="decimal"
                  placeholder="3.5"
                  className={inputCls + " tnum"}
                />
              </Field>
              <Field label="金額" error={show("amount")} hint="任意・税抜">
                <input
                  value={form.amount}
                  onChange={(e) => set("amount", e.target.value)}
                  onBlur={() => blur("amount")}
                  inputMode="numeric"
                  placeholder="480000"
                  className={inputCls + " tnum"}
                />
              </Field>
            </div>

            <Field label="備考" hint="対応方針や引き継ぎ事項を記録します">
              <textarea
                value={form.note}
                onChange={(e) => set("note", e.target.value)}
                rows={3}
                placeholder="例：先方の希望納期がタイトなため、前倒しで着手予定。"
                className={inputCls + " resize-y"}
              />
            </Field>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-ink-100 pt-5">
            <Button variant="outline" onClick={() => navigate("/")}>
              キャンセル
            </Button>
            <Button loading={saving} onClick={save}>
              {!saving && <Save size={15} />}
              {isNew ? "登録する" : "変更を保存"}
            </Button>
          </div>
        </Card>

        {/* サイド：担当者・ステータス・履歴 */}
        <div className="grid gap-5 content-start">
          <Card className="p-5">
            <h2 className="mb-3 text-xs font-semibold tracking-wide text-ink-500">担当者の割り当て</h2>
            <select
              value={form.assigneeId}
              onChange={(e) => onAssign(e.target.value)}
              className={inputCls}
            >
              <option value="">未割当</option>
              {STAFF.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}（{s.dept}）
                </option>
              ))}
            </select>
            {form.assigneeId && (
              <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-ink-50 px-3 py-2.5">
                {(() => {
                  const s = STAFF.find((x) => x.id === form.assigneeId)!;
                  const load = jobs.filter(
                    (j) => j.assigneeId === s.id && j.status !== "done" && j.status !== "hold",
                  ).length;
                  return (
                    <>
                      <Avatar name={s.name} color={s.color} size={32} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-ink-800">{s.name}</div>
                        <div className="tnum text-[11px] text-ink-500">
                          {s.dept}・進行中 {load} 件
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </Card>

          {job && (
            <Card className="p-5">
              <h2 className="mb-3 text-xs font-semibold tracking-wide text-ink-500">ステータス</h2>
              {/* 進行ステップ */}
              <div className="mb-4 flex items-center gap-1">
                {STATUS_FLOW.map((s, i) => {
                  const done = stepIdx >= i && job.status !== "hold";
                  return (
                    <div key={s} className="flex flex-1 flex-col items-center gap-1.5">
                      <div className="flex w-full items-center">
                        <div
                          className={
                            "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold transition duration-300 " +
                            (done ? "bg-brand-600 text-white" : "bg-ink-200 text-ink-500")
                          }
                        >
                          {done ? <Check size={12} /> : i + 1}
                        </div>
                        {i < STATUS_FLOW.length - 1 && (
                          <div
                            className={
                              "h-0.5 flex-1 transition duration-300 " +
                              (stepIdx > i && job.status !== "hold" ? "bg-brand-600" : "bg-ink-200")
                            }
                          />
                        )}
                      </div>
                      <span
                        className={
                          "text-[10px] " + (done ? "font-semibold text-ink-800" : "text-ink-400")
                        }
                      >
                        {STATUS_LABEL[s]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {next && job.status !== "hold" ? (
                <Button className="w-full" loading={busyStatus} onClick={() => advance(next)}>
                  {!busyStatus && <ChevronRight size={15} />}「{STATUS_LABEL[next]}」に進める
                </Button>
              ) : job.status === "hold" ? (
                <Button className="w-full" loading={busyStatus} onClick={() => advance("doing")}>
                  保留を解除して再開
                </Button>
              ) : (
                <div className="rounded-lg bg-emerald-50 px-3 py-2.5 text-center text-xs font-medium text-emerald-700">
                  この案件は完了しています
                </div>
              )}

              <div className="mt-2 flex gap-2">
                {job.status !== "hold" && job.status !== "done" && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={busyStatus}
                    onClick={() => advance("hold")}
                  >
                    保留にする
                  </Button>
                )}
                {job.status === "done" && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={busyStatus}
                    onClick={() => advance("doing")}
                  >
                    対応中に戻す
                  </Button>
                )}
              </div>
            </Card>
          )}

          {job && (
            <Card className="p-5">
              <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-ink-500">
                <Clock size={13} />
                対応履歴
              </h2>
              <ol className="relative ml-1 border-l border-ink-200 pl-4">
                {[...job.history].reverse().map((h, i) => (
                  <li key={i} className="relative pb-3.5 last:pb-0">
                    <span className="absolute -left-[21px] top-1.5 h-1.5 w-1.5 rounded-full bg-ink-300" />
                    <div className="text-xs text-ink-700">{h.text}</div>
                    <div className="tnum mt-0.5 text-[10px] text-ink-400">
                      {format(parseISO(h.at), "M/d HH:mm")}・{h.who}
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </div>
      </div>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="案件を削除">
        <p className="text-sm leading-relaxed text-ink-600">
          「{job?.title}」を削除します。この操作は取り消せません。
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmDelete(false)}>
            キャンセル
          </Button>
          <Button variant="danger" loading={deleting} onClick={doDelete}>
            削除する
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
