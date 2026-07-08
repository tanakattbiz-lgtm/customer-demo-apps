import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Mail,
  MailOpen,
  Search,
  Bell,
  Send,
  FileText,
  CalendarClock,
  Wallet,
  MessageSquare,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { useLoad } from "../lib/useLoad";
import { PageHeader } from "../components/PageHeader";
import { Card, Pill, Button, Skeleton, EmptyState } from "../components/ui";
import { relative, dateTime } from "../lib/format";

const EVENT_ICON: Record<string, React.ReactNode> = {
  請求書送付: <FileText size={16} />,
  入金確認: <Wallet size={16} />,
  期日リマインド: <CalendarClock size={16} />,
  支払期限リマインド: <Wallet size={16} />,
  新規メッセージ: <MessageSquare size={16} />,
  面談予約確定: <CalendarClock size={16} />,
  書面共有: <FileText size={16} />,
};

const SETTINGS = [
  { key: "invoice", label: "請求書の送付・入金確認", desc: "請求書発行時と入金確認時に自動送信", icon: <Wallet size={16} /> },
  { key: "deadline", label: "期日・支払期限リマインド", desc: "期日3日前・支払期限当日に自動送信", icon: <CalendarClock size={16} /> },
  { key: "message", label: "新着メッセージ通知", desc: "担当者からの新規メッセージを顧問先に通知", icon: <MessageSquare size={16} /> },
  { key: "appointment", label: "面談・相談予約の確定", desc: "予約確定時に確認メールを送信", icon: <CalendarClock size={16} /> },
];

export default function Notifications() {
  const loading = useLoad();
  const notifications = useStore((s) => s.notifications);
  const clients = useStore((s) => s.clients);
  const pushNotification = useStore((s) => s.pushNotification);

  const [q, setQ] = useState("");
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    invoice: true,
    deadline: true,
    message: true,
    appointment: false,
  });
  const [sending, setSending] = useState(false);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return notifications.filter(
      (n) => !kw || `${n.event} ${n.to} ${n.subject}`.toLowerCase().includes(kw),
    );
  }, [notifications, q]);

  function sendTest() {
    setSending(true);
    const c = clients[Math.floor(Math.random() * clients.length)];
    setTimeout(() => {
      pushNotification({
        channel: "メール",
        event: "期日リマインド",
        to: c.email,
        subject: `【リマインド】${c.name} 様 期日のご案内`,
        status: "送信済",
      });
      setSending(false);
      toast.success("テスト通知を送信しました", { description: c.email });
    }, 800);
  }

  return (
    <div>
      <PageHeader
        title="メール通知"
        subtitle="自動送信ルールの設定と、送信済みメールの履歴"
        actions={
          <Button variant="outline" onClick={sendTest} loading={sending}>
            <Send size={15} />
            テスト送信
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        {/* 通知設定 */}
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="mb-1 flex items-center gap-2 font-bold text-ink-900">
              <Bell size={17} className="text-brand-600" />
              自動送信ルール
            </h2>
            <p className="mb-4 text-xs text-ink-500">
              オンにすると、該当イベント発生時に自動でメールが送信されます。
            </p>
            <div className="space-y-1">
              {SETTINGS.map((s) => (
                <div
                  key={s.key}
                  className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition hover:bg-ink-50"
                >
                  <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    {s.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-ink-800">{s.label}</div>
                    <div className="text-xs text-ink-500">{s.desc}</div>
                  </div>
                  <button
                    role="switch"
                    aria-checked={toggles[s.key]}
                    onClick={() => {
                      setToggles((t) => ({ ...t, [s.key]: !t[s.key] }));
                      toast(`${s.label}を${!toggles[s.key] ? "オン" : "オフ"}にしました`);
                    }}
                    className={
                      "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition " +
                      (toggles[s.key] ? "bg-brand-600" : "bg-ink-300")
                    }
                  >
                    <motion.span
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 32 }}
                      className={
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow " +
                        (toggles[s.key] ? "right-0.5" : "left-0.5")
                      }
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                <MailOpen size={18} />
              </div>
              <div>
                <div className="text-lg font-bold text-ink-900 tnum">
                  {Math.round(
                    (notifications.filter((n) => n.status === "開封").length /
                      Math.max(notifications.length, 1)) *
                      100,
                  )}
                  %
                </div>
                <div className="text-sm text-ink-500">開封率(直近)</div>
              </div>
            </div>
          </Card>
        </div>

        {/* 送信ログ */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-ink-100 p-4">
            <h2 className="font-bold text-ink-900">送信履歴</h2>
            <div className="relative w-full max-w-xs">
              <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="件名・宛先で検索"
                className="w-full rounded-xl border border-ink-200 bg-ink-50 py-2 pr-3 pl-9 text-sm outline-none focus:border-brand-400 focus:bg-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Mail size={24} />}
              title="送信履歴がありません"
              description="検索条件を変えるか、テスト送信をお試しください。"
            />
          ) : (
            <div className="thin-scroll max-h-[62vh] divide-y divide-ink-50 overflow-y-auto">
              {filtered.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  className="flex items-start gap-3 px-4 py-3 transition hover:bg-ink-50/60"
                >
                  <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    {EVENT_ICON[n.event] ?? <Mail size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-ink-800">{n.subject}</span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-500">
                      <Pill tone="gray">{n.event}</Pill>
                      <span className="inline-flex items-center gap-1">
                        <Mail size={11} />
                        {n.to}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[11px] text-ink-400">{relative(n.at)}</span>
                    {n.status === "開封" ? (
                      <Pill tone="green">開封済</Pill>
                    ) : (
                      <Pill tone="blue">送信済</Pill>
                    )}
                    <span className="text-[10px] text-ink-300">{dateTime(n.at)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
