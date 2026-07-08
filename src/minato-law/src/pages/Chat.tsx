import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  Send,
  Search,
  ArrowLeft,
  MessageSquare,
  Check,
  CheckCheck,
  Phone,
  Download,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { useStore, staffById } from "../store/useStore";
import { useLoad } from "../lib/useLoad";
import { Avatar, EmptyState, Skeleton } from "../components/ui";
import { chatTime } from "../lib/format";
import { exportChatText, exportChatCsv } from "../lib/exportChat";

const AUTO_REPLIES = [
  "ありがとうございます。確認いたします。",
  "承知しました。よろしくお願いいたします。",
  "助かります。追って書類をお送りします。",
  "かしこまりました。ご対応ありがとうございます。",
];

export default function Chat() {
  const loading = useLoad(500);
  const [params, setParams] = useSearchParams();
  const clients = useStore((s) => s.clients);
  const staff = useStore((s) => s.staff);
  const messages = useStore((s) => s.messages);
  const sendMessage = useStore((s) => s.sendMessage);
  const markThreadRead = useStore((s) => s.markThreadRead);
  const addIncomingMessage = useStore((s) => s.addIncomingMessage);

  const [active, setActive] = useState<string | null>(params.get("client"));
  const [q, setQ] = useState("");
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // スレッド一覧(最終メッセージ順)
  const threads = useMemo(() => {
    return clients
      .map((c) => {
        const msgs = messages.filter((m) => m.clientId === c.id);
        const last = msgs[msgs.length - 1];
        const unread = msgs.filter((m) => m.from === "client" && !m.read).length;
        return { client: c, last, unread, count: msgs.length };
      })
      .filter((t) => t.count > 0 || t.client.status === "契約中")
      .sort((a, b) => {
        const at = a.last?.at ?? "0";
        const bt = b.last?.at ?? "0";
        return bt.localeCompare(at);
      });
  }, [clients, messages]);

  const filteredThreads = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return threads;
    return threads.filter((t) => t.client.name.toLowerCase().includes(kw));
  }, [threads, q]);

  const activeClient = clients.find((c) => c.id === active);
  const thread = useMemo(
    () => messages.filter((m) => m.clientId === active),
    [messages, active],
  );

  // スレッドを開いたら既読化
  useEffect(() => {
    if (active) markThreadRead(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // 新着で最下部へスクロール
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [thread.length, typing, active]);

  function selectThread(id: string) {
    setActive(id);
    params.set("client", id);
    setParams(params, { replace: true });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t || !active) return;
    sendMessage(active, t);
    setText("");
    // 相手の自動返信(リアルタイム風)
    const clientId = active;
    setTimeout(() => setTyping(true), 900);
    setTimeout(() => {
      setTyping(false);
      addIncomingMessage(
        clientId,
        AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
      );
      // 開いているスレッドなら即既読
      setTimeout(() => markThreadRead(clientId), 200);
    }, 2600);
  }

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Skeleton className="hidden h-[70vh] lg:block" />
        <Skeleton className="h-[70vh]" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
      {/* スレッド一覧 */}
      <div
        className={
          "flex w-full flex-col border-r border-ink-100 sm:w-80 lg:w-96 " +
          (active ? "hidden sm:flex" : "flex")
        }
      >
        <div className="border-b border-ink-100 p-4">
          <h1 className="mb-3 text-lg font-bold text-ink-900">メッセージ</h1>
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="顧問先を検索"
              className="w-full rounded-xl border border-ink-200 bg-ink-50 py-2 pr-3 pl-9 text-sm outline-none focus:border-brand-400 focus:bg-white"
            />
          </div>
        </div>
        <div className="thin-scroll flex-1 overflow-y-auto">
          {filteredThreads.map((t) => {
            const owner = staffById(staff, t.client.ownerId);
            return (
              <button
                key={t.client.id}
                onClick={() => selectThread(t.client.id)}
                className={
                  "flex w-full items-center gap-3 border-b border-ink-50 px-4 py-3 text-left transition hover:bg-ink-50 " +
                  (active === t.client.id ? "bg-brand-50/70" : "")
                }
              >
                <Avatar name={t.client.name} color={owner?.color} size={42} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-ink-900">
                      {t.client.name}
                    </span>
                    {t.last && (
                      <span className="shrink-0 text-[11px] text-ink-400">
                        {chatTime(t.last.at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-ink-500">
                      {t.last
                        ? (t.last.from === "staff" ? "自分: " : "") + t.last.text
                        : "メッセージはまだありません"}
                    </span>
                    {t.unread > 0 && (
                      <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">
                        {t.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 会話 */}
      <div className={"flex min-w-0 flex-1 flex-col " + (active ? "flex" : "hidden sm:flex")}>
        {!activeClient ? (
          <div className="grid flex-1 place-items-center">
            <EmptyState
              icon={<MessageSquare size={24} />}
              title="スレッドを選択してください"
              description="左の一覧から顧問先を選ぶと、テキストでリアルタイムにやり取りできます。"
            />
          </div>
        ) : (
          <>
            {/* 会話ヘッダー */}
            <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3">
              <button
                onClick={() => {
                  setActive(null);
                  params.delete("client");
                  setParams(params, { replace: true });
                }}
                className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 sm:hidden"
                aria-label="戻る"
              >
                <ArrowLeft size={18} />
              </button>
              <Avatar
                name={activeClient.name}
                color={staffById(staff, activeClient.ownerId)?.color}
                size={40}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-ink-900">{activeClient.name}</div>
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    オンライン
                  </span>
                  <span className="text-ink-300">·</span>
                  <span>{activeClient.contact}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="hidden h-9 w-9 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700 sm:grid"
                  aria-label="電話"
                >
                  <Phone size={17} />
                </button>
                {/* チャット履歴の出力 */}
                <div className="relative">
                  <button
                    onClick={() => setExportOpen((v) => !v)}
                    disabled={thread.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-600 transition hover:bg-ink-50 disabled:opacity-40"
                    aria-label="履歴を出力"
                  >
                    <Download size={15} />
                    <span className="hidden sm:inline">履歴出力</span>
                  </button>
                  <AnimatePresence>
                    {exportOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setExportOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.97 }}
                          transition={{ duration: 0.14 }}
                          className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-ink-100 bg-white py-1 shadow-lg"
                        >
                          <div className="px-3 py-1.5 text-[11px] text-ink-400">
                            {activeClient.name} の全 {thread.length} 件
                          </div>
                          <button
                            onClick={() => {
                              exportChatText(activeClient, thread, staff);
                              setExportOpen(false);
                              toast.success("テキストで出力しました");
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink-700 transition hover:bg-ink-50"
                          >
                            <FileText size={16} className="text-ink-400" />
                            テキスト(.txt)
                          </button>
                          <button
                            onClick={() => {
                              exportChatCsv(activeClient, thread, staff);
                              setExportOpen(false);
                              toast.success("CSV で出力しました");
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink-700 transition hover:bg-ink-50"
                          >
                            <FileSpreadsheet size={16} className="text-ink-400" />
                            CSV(.csv / Excel対応)
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* メッセージ */}
            <div ref={scrollRef} className="thin-scroll flex-1 space-y-1 overflow-y-auto bg-ink-50/50 px-4 py-4">
              <div className="mx-auto mb-3 w-fit rounded-full bg-ink-200/70 px-3 py-1 text-[11px] text-ink-500">
                このやり取りはデモです。返信は自動生成されます。
              </div>
              <AnimatePresence initial={false}>
                {thread.map((m) => {
                  const author = staffById(staff, m.authorId);
                  const mine = m.from === "staff";
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                      className={"flex " + (mine ? "justify-end" : "justify-start")}
                    >
                      <div className={"flex max-w-[78%] items-end gap-2 " + (mine ? "flex-row-reverse" : "")}>
                        {!mine && (
                          <Avatar
                            name={activeClient.name}
                            color={staffById(staff, activeClient.ownerId)?.color}
                            size={28}
                          />
                        )}
                        <div>
                          <div
                            className={
                              "rounded-2xl px-3.5 py-2 text-sm leading-relaxed " +
                              (mine
                                ? "rounded-br-md bg-brand-600 text-white"
                                : "rounded-bl-md border border-ink-100 bg-white text-ink-800")
                            }
                          >
                            {m.text}
                          </div>
                          <div
                            className={
                              "mt-0.5 flex items-center gap-1 px-1 text-[10px] text-ink-400 " +
                              (mine ? "justify-end" : "")
                            }
                          >
                            {mine && author && <span>{author.name}</span>}
                            <span>{chatTime(m.at)}</span>
                            {mine &&
                              (m.read ? (
                                <CheckCheck size={13} className="text-brand-500" />
                              ) : (
                                <Check size={13} />
                              ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {typing && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-ink-100 bg-white px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-2 w-2 rounded-full bg-ink-300"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 入力 */}
            <form onSubmit={submit} className="flex items-end gap-2 border-t border-ink-100 p-3">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(e);
                  }
                }}
                rows={1}
                placeholder="メッセージを入力(Enterで送信)"
                className="thin-scroll max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 active:scale-95 disabled:opacity-40"
                aria-label="送信"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
