import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Home,
  CalendarPlus,
  CalendarCheck,
  Megaphone,
  CalendarClock,
  ChevronRight,
  CheckCircle2,
  Clock,
  Send,
  Pin,
  UserCog,
  Info,
} from "lucide-react";
import { useStore, requestFor, memberById } from "../store";
import type { Availability } from "../data/seed";
import { useLoad } from "../lib/useLoad";
import { Avatar, Button, Pill, Card, EmptyState, Skeleton } from "../components/ui";
import { fmtMd, weekdayLabel, isSat, isSun, daysUntil, fromNow } from "../lib/date";
import { positionColor } from "../data/seed";

type Tab = "home" | "request" | "shift" | "news";

const TIMES: string[] = Array.from({ length: 14 }, (_, i) => `${String(i + 10).padStart(2, "0")}:00`);

export default function StaffApp() {
  const loading = useLoad(420);
  const navigate = useNavigate();
  const members = useStore((s) => s.members);
  const currentStaffId = useStore((s) => s.currentStaffId);
  const setCurrentStaff = useStore((s) => s.setCurrentStaff);
  const period = useStore((s) => s.period);
  const [tab, setTab] = useState<Tab>("home");

  const activeMembers = useMemo(() => members.filter((m) => m.active), [members]);
  const me = memberById(members, currentStaffId) ?? activeMembers[0];

  return (
    <div className="min-h-screen bg-ink-100">
      {/* ヘッダ */}
      <header className="sticky top-0 z-20 border-b border-ink-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
              <CalendarClock size={16} />
            </div>
            <div className="leading-tight">
              <div className="text-xs font-bold text-ink-900">○○ダイニング</div>
              <div className="text-[10px] text-ink-400">スタッフアプリ</div>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1 rounded-lg border border-ink-200 px-2.5 py-1.5 text-[11px] font-semibold text-ink-500 transition hover:bg-ink-50"
          >
            <UserCog size={13} /> 管理者画面
          </button>
        </div>
        {/* あなた(スタッフ切替) */}
        <div className="mx-auto flex max-w-md items-center gap-2 border-t border-ink-100 px-4 py-2">
          <span className="text-[11px] text-ink-400">あなた:</span>
          <Avatar name={me?.name ?? "?"} color={me?.color} size={22} />
          <select
            className="flex-1 rounded-lg border border-ink-200 bg-white px-2 py-1 text-xs font-medium text-ink-800 outline-none"
            value={currentStaffId}
            onChange={(e) => setCurrentStaff(e.target.value)}
          >
            {activeMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}（{m.role}）
              </option>
            ))}
          </select>
          <span className="text-[10px] text-ink-300">切替可</span>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pb-24 pt-4">
        {loading ? (
          <StaffSkeleton />
        ) : !me ? (
          <Card className="p-6 text-center text-sm text-ink-500">スタッフが登録されていません。</Card>
        ) : (
          <>
            {tab === "home" && <HomeTab onGo={setTab} />}
            {tab === "request" && <RequestTab />}
            {tab === "shift" && <ShiftTab />}
            {tab === "news" && <NewsTab />}
          </>
        )}
      </main>

      {/* ボトムナビ */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto grid max-w-md grid-cols-4">
          <TabBtn active={tab === "home"} onClick={() => setTab("home")} icon={<Home size={19} />} label="ホーム" />
          <TabBtn active={tab === "request"} onClick={() => setTab("request")} icon={<CalendarPlus size={19} />} label="希望提出" />
          <TabBtn active={tab === "shift"} onClick={() => setTab("shift")} icon={<CalendarCheck size={19} />} label="シフト" />
          <TabBtn active={tab === "news"} onClick={() => setTab("news")} icon={<Megaphone size={19} />} label="お知らせ" />
        </div>
      </nav>

      <p className="pb-3 text-center text-[10px] text-ink-300">
        {period.label} ・ 提案用デモ画面
      </p>
    </div>
  );
}

// ---------------- ホーム ----------------
function HomeTab({ onGo }: { onGo: (t: Tab) => void }) {
  const members = useStore((s) => s.members);
  const currentStaffId = useStore((s) => s.currentStaffId);
  const period = useStore((s) => s.period);
  const submissions = useStore((s) => s.submissions);
  const assignments = useStore((s) => s.assignments);
  const announcements = useStore((s) => s.announcements);
  const me = memberById(members, currentStaffId)!;

  const submitted = !!submissions.find((s) => s.memberId === me.id)?.submittedAt;
  const remain = Math.max(0, daysUntil(period.deadline));
  const myShifts = assignments.filter((a) => a.memberId === me.id);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-ink-500">こんにちは</div>
        <div className="text-lg font-bold text-ink-900">{me.name} さん</div>
      </div>

      {/* 希望提出の状態 */}
      <Card className="overflow-hidden">
        <div className="bg-brand-600 px-5 py-4 text-white">
          <div className="text-xs text-white/70">{period.label} のシフト希望</div>
          <div className="mt-1 flex items-center justify-between">
            <div className="text-lg font-bold">
              {submitted ? "提出済み" : "未提出です"}
            </div>
            {submitted ? (
              <CheckCircle2 size={22} className="text-white/90" />
            ) : (
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">
                締切まで あと{remain}日
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => onGo("request")}
          className="flex w-full items-center justify-between px-5 py-3.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          {submitted ? "提出した希望を確認・修正する" : "いますぐ希望を提出する"}
          <ChevronRight size={16} />
        </button>
      </Card>

      {/* 確定シフト */}
      <Card className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink-900">あなたの確定シフト</h2>
          <button onClick={() => onGo("shift")} className="text-xs font-semibold text-brand-600">
            すべて見る
          </button>
        </div>
        {period.status !== "公開済" ? (
          <p className="rounded-xl bg-ink-50 px-4 py-3 text-xs text-ink-500">
            シフトはまだ公開されていません。公開されるとここに表示されます。
          </p>
        ) : myShifts.length === 0 ? (
          <p className="rounded-xl bg-ink-50 px-4 py-3 text-xs text-ink-500">
            この期間の割当はありません。
          </p>
        ) : (
          <ul className="space-y-1.5">
            {myShifts.slice(0, 3).map((a) => (
              <li key={a.id} className="flex items-center gap-3 rounded-xl bg-ink-50 px-3 py-2">
                <DateChip date={a.date} />
                <span className="tnum text-sm font-semibold text-ink-800">
                  {a.from}〜{a.to}
                </span>
                <span
                  className="ml-auto rounded-md px-2 py-0.5 text-[11px] font-semibold text-white"
                  style={{ background: positionColor(a.position) }}
                >
                  {a.position}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* 最新のお知らせ */}
      <Card className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-ink-900">
            <Megaphone size={15} className="text-brand-500" /> お知らせ
          </h2>
          <button onClick={() => onGo("news")} className="text-xs font-semibold text-brand-600">
            すべて見る
          </button>
        </div>
        <ul className="space-y-2">
          {announcements.slice(0, 2).map((a) => (
            <li key={a.id} className="rounded-xl bg-ink-50 px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                {a.pinned && <Pin size={11} className="text-brand-500" />}
                <span className="truncate text-xs font-semibold text-ink-800">{a.title}</span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-ink-500">{a.body}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

// ---------------- シフト希望提出 ----------------
function RequestTab() {
  const members = useStore((s) => s.members);
  const currentStaffId = useStore((s) => s.currentStaffId);
  const period = useStore((s) => s.period);
  const requests = useStore((s) => s.requests);
  const submissions = useStore((s) => s.submissions);
  const setRequest = useStore((s) => s.setRequest);
  const submit = useStore((s) => s.submitRequests);
  const me = memberById(members, currentStaffId)!;

  const [saving, setSaving] = useState(false);
  const submitted = !!submissions.find((s) => s.memberId === me.id)?.submittedAt;

  const filled = period.dates.filter((d) => requestFor(requests, me.id, d)).length;

  const onSubmit = () => {
    setSaving(true);
    setTimeout(() => {
      submit(me.id);
      setSaving(false);
      toast.success("シフト希望を提出しました", {
        description: "バイトリーダーに通知されます。",
      });
    }, 750);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-ink-900">シフト希望の提出</h1>
          <p className="text-xs text-ink-500">{period.label}（{fmtMd(period.start)}〜{fmtMd(period.end)}）</p>
        </div>
        {submitted ? (
          <Pill tone="green">
            <CheckCircle2 size={12} /> 提出済み
          </Pill>
        ) : (
          <Pill tone="amber">
            <Clock size={12} /> 未提出
          </Pill>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-brand-50 px-3.5 py-2.5 text-[11px] leading-relaxed text-brand-700">
        <Info size={14} className="mt-0.5 shrink-0" />
        各日の希望を選んでください。「時間限定」は勤務できる時間帯を選べます。あとから修正して再提出もできます。
      </div>

      <div className="space-y-2">
        {period.dates.map((date) => (
          <RequestRow
            key={date}
            date={date}
            request={requestFor(requests, me.id, date)}
            onSet={(av, time) => setRequest(me.id, date, av, time)}
          />
        ))}
      </div>

      {/* 送信バー */}
      <div className="fixed inset-x-0 bottom-[57px] z-10 border-t border-ink-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-2.5">
          <div className="text-xs text-ink-500">
            入力済み <b className="tnum text-ink-800">{filled}</b>/{period.dates.length}日
          </div>
          <Button className="flex-1" onClick={onSubmit} loading={saving} disabled={filled === 0}>
            <Send size={15} /> {submitted ? "修正して再提出" : "希望を提出する"}
          </Button>
        </div>
      </div>
      <div className="h-10" />
    </div>
  );
}

function RequestRow({
  date,
  request,
  onSet,
}: {
  date: string;
  request: ReturnType<typeof requestFor>;
  onSet: (av: Availability, time?: { from?: string; to?: string }) => void;
}) {
  const av = request?.availability;
  const opts: { v: Availability; label: string; cls: string }[] = [
    { v: "ok", label: "○ 可", cls: "border-emerald-400 bg-emerald-50 text-emerald-700" },
    { v: "limited", label: "△ 時間限定", cls: "border-amber-400 bg-amber-50 text-amber-700" },
    { v: "ng", label: "× 不可", cls: "border-ink-300 bg-ink-100 text-ink-500" },
  ];

  return (
    <Card className="p-3">
      <div className="flex items-center gap-3">
        <DateChip date={date} />
        <div className="flex flex-1 flex-wrap gap-1.5">
          {opts.map((o) => (
            <button
              key={o.v}
              onClick={() => onSet(o.v, o.v === "limited" ? { from: request?.from, to: request?.to } : undefined)}
              className={
                "rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition " +
                (av === o.v ? o.cls : "border-ink-200 text-ink-400 hover:bg-ink-50")
              }
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      {av === "limited" && (
        <div className="mt-2.5 flex items-center gap-2 border-t border-ink-100 pt-2.5">
          <span className="text-[11px] text-ink-400">勤務できる時間:</span>
          <select
            className="rounded-lg border border-ink-200 px-2 py-1 text-xs"
            value={request?.from ?? "17:00"}
            onChange={(e) => onSet("limited", { from: e.target.value, to: request?.to })}
          >
            {TIMES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <span className="text-xs text-ink-400">〜</span>
          <select
            className="rounded-lg border border-ink-200 px-2 py-1 text-xs"
            value={request?.to ?? "22:00"}
            onChange={(e) => onSet("limited", { from: request?.from, to: e.target.value })}
          >
            {TIMES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      )}
    </Card>
  );
}

// ---------------- 確定シフト ----------------
function ShiftTab() {
  const members = useStore((s) => s.members);
  const currentStaffId = useStore((s) => s.currentStaffId);
  const period = useStore((s) => s.period);
  const assignments = useStore((s) => s.assignments);
  const me = memberById(members, currentStaffId)!;

  const myShifts = assignments
    .filter((a) => a.memberId === me.id)
    .sort((a, b) => a.date.localeCompare(b.date));
  const totalHours = myShifts.reduce(
    (acc, a) => acc + (Number(a.to.slice(0, 2)) - Number(a.from.slice(0, 2))),
    0,
  );

  if (period.status !== "公開済") {
    return (
      <Card>
        <EmptyState
          icon={<CalendarCheck size={24} />}
          title="シフトはまだ公開されていません"
          description="バイトリーダーがシフトを公開すると、あなたの確定シフトがここに表示されます。"
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-ink-900">あなたの確定シフト</h1>
        <Pill tone="green">公開済み</Pill>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="text-xs text-ink-500">出勤日数</div>
          <div className="tnum mt-1 text-2xl font-bold text-ink-900">{myShifts.length}<span className="text-sm text-ink-400">日</span></div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-ink-500">合計時間(目安)</div>
          <div className="tnum mt-1 text-2xl font-bold text-ink-900">{totalHours}<span className="text-sm text-ink-400">時間</span></div>
        </Card>
      </div>

      {myShifts.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarCheck size={24} />}
            title="この期間の割当はありません"
            description="次回のシフト希望の提出をお待ちしています。"
          />
        </Card>
      ) : (
        <Card className="divide-y divide-ink-100">
          {myShifts.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3">
              <DateChip date={a.date} big />
              <div className="flex-1">
                <div className="tnum text-sm font-bold text-ink-900">
                  {a.from} 〜 {a.to}
                </div>
                <div className="text-[11px] text-ink-400">
                  {Number(a.to.slice(0, 2)) - Number(a.from.slice(0, 2))}時間
                </div>
              </div>
              <span
                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-white"
                style={{ background: positionColor(a.position) }}
              >
                {a.position}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ---------------- お知らせ ----------------
function NewsTab() {
  const announcements = useStore((s) => s.announcements);
  return (
    <div className="space-y-4">
      <h1 className="text-base font-bold text-ink-900">お知らせ</h1>
      {announcements.length === 0 ? (
        <Card>
          <EmptyState icon={<Megaphone size={24} />} title="お知らせはありません" />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {announcements.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex items-center gap-1.5">
                {a.pinned && <Pin size={13} className="text-brand-500" />}
                <span className="text-sm font-bold text-ink-900">{a.title}</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-600">{a.body}</p>
              <div className="mt-2 text-[11px] text-ink-400">{fromNow(a.at)}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------- 小物 ----------------
function DateChip({ date, big }: { date: string; big?: boolean }) {
  const sun = isSun(date);
  const sat = isSat(date);
  return (
    <div
      className={
        "grid shrink-0 place-items-center rounded-xl " +
        (big ? "h-12 w-12" : "h-10 w-10") +
        " " +
        (sun ? "bg-rose-50" : sat ? "bg-brand-50" : "bg-ink-100")
      }
    >
      <div className={"tnum font-bold leading-none " + (big ? "text-base" : "text-sm") + " text-ink-800"}>
        {fmtMd(date).split("/")[1]}
      </div>
      <div className={"text-[9px] " + (sun ? "text-rose-500" : sat ? "text-brand-600" : "text-ink-400")}>
        {weekdayLabel(date)}
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition " +
        (active ? "text-brand-600" : "text-ink-400")
      }
    >
      {icon}
      {label}
    </button>
  );
}

function StaffSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  );
}
