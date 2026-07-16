import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Send, RotateCcw, Info, Wand2, Trash2, AlertTriangle } from "lucide-react";
import { useStore, requestFor, assignmentFor } from "../store";
import type { Member, Position } from "../data/seed";
import { useLoad } from "../lib/useLoad";
import {
  Card,
  Button,
  Pill,
  Modal,
  Field,
  Avatar,
  Skeleton,
  Segmented,
} from "../components/ui";
import { fmtMd, weekdayLabel, isSat, isSun } from "../lib/date";

const TIMES: string[] = Array.from({ length: 14 }, (_, i) => `${String(i + 10).padStart(2, "0")}:00`);

interface CellCtx {
  member: Member;
  date: string;
}

export default function ShiftBoard() {
  const loading = useLoad();
  const period = useStore((s) => s.period);
  const members = useStore((s) => s.members);
  const requests = useStore((s) => s.requests);
  const assignments = useStore((s) => s.assignments);
  const setPeriodStatus = useStore((s) => s.setPeriodStatus);

  const [mode, setMode] = useState<"view" | "assign">("view");
  const [cell, setCell] = useState<CellCtx | null>(null);
  const [publishing, setPublishing] = useState(false);

  const activeMembers = useMemo(() => members.filter((m) => m.active), [members]);

  const perDay = useMemo(
    () =>
      period.dates.map((date) => ({
        date,
        assigned: assignments.filter((a) => a.date === date).length,
      })),
    [period.dates, assignments],
  );
  const shortDays = perDay.filter((d) => d.assigned < period.targetPerDay).length;

  const publish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPeriodStatus("公開済");
      setPublishing(false);
      toast.success("シフトを公開しました", {
        description: "スタッフの画面に確定シフトが表示されます。",
      });
    }, 800);
  };

  const reopen = () => {
    setPeriodStatus("作成中");
    toast("公開を取り消しました。編集できます。");
  };

  if (loading) return <BoardSkeleton />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">シフト表</h1>
          <p className="mt-1 text-sm text-ink-500">
            集めた希望を見ながらシフトを組み、公開します（{fmtMd(period.start)}〜{fmtMd(period.end)}）
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Pill tone={period.status === "公開済" ? "green" : period.status === "作成中" ? "amber" : "blue"}>
            {period.status}
          </Pill>
          {period.status === "公開済" ? (
            <Button variant="outline" onClick={reopen}>
              <RotateCcw size={15} /> 公開を取り消す
            </Button>
          ) : (
            <Button onClick={publish} loading={publishing}>
              <Send size={15} /> シフトを公開
            </Button>
          )}
        </div>
      </div>

      {/* ツールバー */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: "view", label: "希望を見る" },
            { value: "assign", label: "シフトを組む" },
          ]}
        />
        <div className="flex items-center gap-3 text-xs text-ink-500">
          <Legend />
        </div>
      </div>

      {shortDays > 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>
            必要人数（1日 {period.targetPerDay}人）に満たない日が <b className="tnum">{shortDays}</b> 日あります。
            {mode === "view" && "「シフトを組む」から割り当ててください。"}
          </span>
        </div>
      )}

      {/* グリッド */}
      <Card className="overflow-hidden">
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 min-w-[8.5rem] border-b border-ink-200 bg-ink-50 px-3 py-2.5 text-left text-xs font-semibold text-ink-500">
                  スタッフ
                </th>
                {period.dates.map((d) => (
                  <th
                    key={d}
                    className={
                      "min-w-[3.2rem] border-b border-l border-ink-100 px-1 py-1.5 text-center " +
                      (isSun(d) ? "bg-rose-50" : isSat(d) ? "bg-brand-50" : "bg-ink-50")
                    }
                  >
                    <div className="tnum text-xs font-bold text-ink-800">{fmtMd(d)}</div>
                    <div
                      className={
                        "text-[10px] " +
                        (isSun(d) ? "text-rose-500" : isSat(d) ? "text-brand-600" : "text-ink-400")
                      }
                    >
                      {weekdayLabel(d)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeMembers.map((m) => {
                const submitted = useStore
                  .getState()
                  .submissions.find((s) => s.memberId === m.id)?.submittedAt;
                return (
                  <tr key={m.id} className="group">
                    <td className="sticky left-0 z-10 border-b border-ink-100 bg-white px-3 py-2 group-hover:bg-ink-50">
                      <div className="flex items-center gap-2">
                        <Avatar name={m.name} color={m.color} size={28} />
                        <div className="min-w-0 leading-tight">
                          <div className="truncate text-xs font-semibold text-ink-800">{m.name}</div>
                          <div className="text-[10px] text-ink-400">
                            {submitted ? m.positions.join("・") : "未提出"}
                          </div>
                        </div>
                      </div>
                    </td>
                    {period.dates.map((d) => (
                      <GridCell
                        key={d}
                        member={m}
                        date={d}
                        request={requestFor(requests, m.id, d)}
                        assignment={assignmentFor(assignments, m.id, d)}
                        mode={mode}
                        onClick={() => mode === "assign" && setCell({ member: m, date: d })}
                      />
                    ))}
                  </tr>
                );
              })}
              {/* 合計行 */}
              <tr>
                <td className="sticky left-0 z-10 border-t-2 border-ink-200 bg-ink-50 px-3 py-2 text-xs font-bold text-ink-600">
                  割当人数
                </td>
                {perDay.map((d) => (
                  <td
                    key={d.date}
                    className={
                      "border-l border-t-2 border-ink-200 px-1 py-2 text-center " +
                      (d.assigned < period.targetPerDay ? "bg-amber-50" : "bg-emerald-50")
                    }
                  >
                    <span
                      className={
                        "tnum text-xs font-bold " +
                        (d.assigned < period.targetPerDay ? "text-amber-700" : "text-emerald-700")
                      }
                    >
                      {d.assigned}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <p className="flex items-center gap-1.5 text-xs text-ink-400">
        <Info size={13} />
        {mode === "assign"
          ? "セルをタップすると、その日の割当を編集できます。"
          : "「シフトを組む」に切り替えると、希望を見ながら割り当てできます。"}
      </p>

      <AssignModal ctx={cell} onClose={() => setCell(null)} />
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="flex items-center gap-1">
        <Sym av="ok" /> 勤務可
      </span>
      <span className="flex items-center gap-1">
        <Sym av="limited" /> 時間限定
      </span>
      <span className="flex items-center gap-1">
        <Sym av="ng" /> 不可
      </span>
      <span className="flex items-center gap-1">
        <span className="grid h-5 w-5 place-items-center rounded-md bg-brand-600 text-[10px] font-bold text-white">
          割
        </span>{" "}
        割当済み
      </span>
    </div>
  );
}

function Sym({ av }: { av: "ok" | "limited" | "ng" }) {
  const map = {
    ok: { c: "bg-emerald-100 text-emerald-700", t: "○" },
    limited: { c: "bg-amber-100 text-amber-700", t: "△" },
    ng: { c: "bg-ink-100 text-ink-400", t: "×" },
  } as const;
  const s = map[av];
  return (
    <span className={"grid h-5 w-5 place-items-center rounded-md text-[11px] font-bold " + s.c}>
      {s.t}
    </span>
  );
}

function GridCell({
  member,
  date,
  request,
  assignment,
  mode,
  onClick,
}: {
  member: Member;
  date: string;
  request: ReturnType<typeof requestFor>;
  assignment: ReturnType<typeof assignmentFor>;
  mode: "view" | "assign";
  onClick: () => void;
}) {
  void member;
  void date;
  const clickable = mode === "assign";

  let bg = "bg-white";
  let content = <span className="text-ink-300">―</span>;
  if (request) {
    if (request.availability === "ok") {
      bg = "bg-emerald-50/70";
      content = <span className="text-sm font-bold text-emerald-600">○</span>;
    } else if (request.availability === "limited") {
      bg = "bg-amber-50/70";
      content = (
        <div className="leading-none">
          <div className="text-sm font-bold text-amber-600">△</div>
          <div className="tnum mt-0.5 text-[9px] text-amber-700">{request.from?.slice(0, 5)}〜</div>
        </div>
      );
    } else {
      content = <span className="text-sm font-bold text-ink-300">×</span>;
    }
  }

  return (
    <td className={"border-b border-l border-ink-100 p-0 " + bg}>
      <button
        onClick={onClick}
        disabled={!clickable}
        className={
          "relative flex h-14 w-full flex-col items-center justify-center transition " +
          (clickable ? "cursor-pointer hover:bg-brand-100/50" : "cursor-default")
        }
      >
        {assignment ? (
          <div className="flex flex-col items-center leading-none">
            <span className="grid h-5 w-5 place-items-center rounded-md bg-brand-600 text-[10px] font-bold text-white">
              割
            </span>
            <span className="tnum mt-0.5 text-[9px] font-semibold text-brand-700">
              {assignment.from.slice(0, 5)}
            </span>
          </div>
        ) : (
          content
        )}
      </button>
    </td>
  );
}

function AssignModal({ ctx, onClose }: { ctx: CellCtx | null; onClose: () => void }) {
  const requests = useStore((s) => s.requests);
  const assignments = useStore((s) => s.assignments);
  const upsert = useStore((s) => s.upsertAssignment);
  const remove = useStore((s) => s.removeAssignment);

  const open = !!ctx;
  const member = ctx?.member;
  const date = ctx?.date ?? "";
  const request = member ? requestFor(requests, member.id, date) : undefined;
  const existing = member ? assignmentFor(assignments, member.id, date) : undefined;

  const [from, setFrom] = useState("17:00");
  const [to, setTo] = useState("22:00");
  const [pos, setPos] = useState<Position>("ホール");

  // ctx が変わったら初期値を合わせる
  const key = ctx ? ctx.member.id + ctx.date : "";
  const [lastKey, setLastKey] = useState("");
  if (key && key !== lastKey) {
    setLastKey(key);
    setFrom(existing?.from ?? request?.from ?? "17:00");
    setTo(existing?.to ?? request?.to ?? "22:00");
    setPos(existing?.position ?? member?.positions[0] ?? "ホール");
  }

  if (!member) return <Modal open={open} onClose={onClose} title="割当" width={440}><div /></Modal>;

  const ngRequest = request?.availability === "ng";

  const save = (useRequestTime = false) => {
    const f = useRequestTime && request?.from ? request.from : from;
    const t = useRequestTime && request?.to ? request.to : to;
    if (f >= t) {
      toast.error("終了時刻は開始時刻より後にしてください");
      return;
    }
    upsert({ memberId: member.id, date, from: f, to: t, position: pos });
    toast.success(`${member.name} さんを割り当てました`);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={`${fmtMd(date)}（${weekdayLabel(date)}）の割当`} width={440}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl bg-ink-50 px-4 py-3">
          <Avatar name={member.name} color={member.color} size={38} />
          <div>
            <div className="text-sm font-bold text-ink-900">{member.name}</div>
            <div className="text-xs text-ink-500">{member.positions.join("・")}</div>
          </div>
        </div>

        {/* 本人の希望 */}
        <div className="rounded-xl border border-ink-200 px-4 py-3 text-sm">
          <div className="mb-1 text-xs font-semibold text-ink-500">この日の希望</div>
          {!request ? (
            <span className="text-ink-400">未提出</span>
          ) : request.availability === "ok" ? (
            <span className="font-semibold text-emerald-600">○ 終日勤務可</span>
          ) : request.availability === "limited" ? (
            <span className="font-semibold text-amber-600">
              △ {request.from}〜{request.to} なら可
            </span>
          ) : (
            <span className="font-semibold text-ink-400">× 勤務不可</span>
          )}
        </div>

        {ngRequest && (
          <div className="rounded-xl bg-rose-50 px-4 py-2.5 text-xs text-rose-600">
            本人は「勤務不可」と提出しています。割り当てる場合は事前に確認してください。
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="開始">
            <select className={selectCls} value={from} onChange={(e) => setFrom(e.target.value)}>
              {TIMES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="終了">
            <select className={selectCls} value={to} onChange={(e) => setTo(e.target.value)}>
              {TIMES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="担当ポジション">
          <select className={selectCls} value={pos} onChange={(e) => setPos(e.target.value as Position)}>
            {member.positions.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Field>

        {request && request.availability === "limited" && (
          <button
            onClick={() => save(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
          >
            <Wand2 size={15} /> 希望どおり（{request.from}〜{request.to}）で割当
          </button>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          {existing ? (
            <Button
              variant="ghost"
              onClick={() => {
                remove(member.id, date);
                toast("割当をはずしました");
                onClose();
              }}
              className="text-rose-600 hover:bg-rose-50"
            >
              <Trash2 size={15} /> はずす
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              キャンセル
            </Button>
            <Button onClick={() => save(false)}>
              <CheckCircle2 size={15} /> 割り当てる
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

const selectCls =
  "w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25";

function BoardSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-64 rounded-xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}
