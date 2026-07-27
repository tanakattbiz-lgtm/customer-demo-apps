import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  BookOpen,
  Headset,
  Star,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { useStore } from "../store";
import { retrieve, generateAnswer } from "../lib/rag";
import type { ChatMessage, Session } from "../data/seed";
import { uid } from "../lib/fakeApi";

/** ボットの返信待ち(生成)時間 */
const THINK_MS = 900;

const SUGGESTIONS = [
  "無料プランはありますか？",
  "支払い方法は何がありますか？",
  "解約したらデータは消えますか？",
  "二段階認証は使えますか？",
];

function nowIso() {
  return new Date().toISOString();
}

export function ChatWidget() {
  const kb = useStore((s) => s.kb);
  const addSession = useStore((s) => s.addSession);
  const appendMessage = useStore((s) => s.appendMessage);
  const setSessionStatus = useStore((s) => s.setSessionStatus);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [rated, setRated] = useState(false);
  const [lastResolved, setLastResolved] = useState<boolean | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自動スクロール
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking, open]);

  function ensureSession(firstMsg: ChatMessage): string {
    if (sessionIdRef.current) return sessionIdRef.current;
    const id = `sess_${uid()}`;
    sessionIdRef.current = id;
    const sess: Session = {
      id,
      visitor: `訪問者 #${uid().slice(-4).toUpperCase()}`,
      channel: "サービスLP",
      startedAt: nowIso(),
      status: "未解決",
      messages: [firstMsg],
      live: true,
    };
    addSession(sess);
    return id;
  }

  function pushUser(text: string) {
    const msg: ChatMessage = { id: uid("m"), role: "user", text, at: nowIso() };
    setMessages((m) => [...m, msg]);
    const sid = ensureSession(msg);
    // 2通目以降は append(1通目は ensureSession が保存済み)
    if (messages.length > 0) appendMessage(sid, msg);
    return sid;
  }

  async function send(text: string) {
    const q = text.trim();
    if (!q || thinking) return;
    setInput("");
    setRated(false);
    const sid = pushUser(q);

    setThinking(true);
    await new Promise((r) => setTimeout(r, THINK_MS + Math.random() * 500));

    const hits = retrieve(q, kb);
    const ans = generateAnswer(hits);
    const botMsg: ChatMessage = {
      id: uid("m"),
      role: "bot",
      text: ans.text,
      at: nowIso(),
      sourceIds: ans.sourceIds,
    };
    setThinking(false);
    setMessages((m) => [...m, botMsg]);
    appendMessage(sid, botMsg);
    setLastResolved(ans.resolved);
    setSessionStatus(sid, ans.resolved ? "解決済み" : "未解決");
  }

  function escalate() {
    const sid = sessionIdRef.current;
    if (!sid) return;
    const agentMsg: ChatMessage = {
      id: uid("m"),
      role: "agent",
      text: "オペレーターにおつなぎしました。担当者より順次ご案内いたします。しばらくお待ちください。",
      at: nowIso(),
    };
    setMessages((m) => [...m, agentMsg]);
    appendMessage(sid, agentMsg);
    setSessionStatus(sid, "有人対応");
    setEscalated(true);
    setLastResolved(null);
  }

  function rate(v: number) {
    setRated(true);
    const sid = sessionIdRef.current;
    if (sid) {
      useStore.setState((st) => ({
        sessions: st.sessions.map((s) =>
          s.id === sid ? { ...s, rating: v as Session["rating"] } : s,
        ),
      }));
    }
  }

  function resetConversation() {
    setMessages([]);
    setInput("");
    setThinking(false);
    setEscalated(false);
    setRated(false);
    setLastResolved(null);
    sessionIdRef.current = null;
  }

  const kbById = (id: string) => kb.find((a) => a.id === id);

  return (
    <>
      {/* 起動ボタン */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        className="fixed right-5 bottom-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700"
        whileTap={{ scale: 0.92 }}
        aria-label="チャットを開く"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <ChevronDown size={26} />
            </motion.span>
          ) : (
            <motion.span key="c" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle size={26} />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
        )}
      </motion.button>

      {/* チャットパネル */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed right-4 bottom-24 z-40 flex max-h-[calc(100vh-8rem)] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-2xl"
          >
            {/* ヘッダー */}
            <div className="flex items-center gap-3 bg-gradient-to-br from-brand-600 to-brand-800 px-4 py-3.5 text-white">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-white/15">
                <Sparkles size={20} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">AIサポートアシスタント</div>
                <div className="flex items-center gap-1.5 text-xs text-white/80">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  オンライン・数秒で回答します
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-white/80 transition hover:bg-white/15"
                aria-label="閉じる"
              >
                <X size={18} />
              </button>
            </div>

            {/* メッセージ一覧 */}
            <div ref={scrollRef} className="thin-scroll flex-1 space-y-3 overflow-y-auto bg-ink-50 px-4 py-4">
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <BotAvatar />
                    <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-sm leading-relaxed text-ink-800 shadow-sm">
                      こんにちは！サービスに関するご質問にAIがお答えします。
                      下のボタンから選ぶか、自由に入力してください。
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="px-1 text-xs font-medium text-ink-400">よくある質問</div>
                    {SUGGESTIONS.map((sug) => (
                      <button
                        key={sug}
                        onClick={() => send(sug)}
                        className="block w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-left text-sm text-ink-700 transition hover:border-brand-300 hover:bg-brand-50"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <MessageBubble key={m.id} m={m} kbById={kbById} />
              ))}

              {thinking && (
                <div className="flex gap-2">
                  <BotAvatar />
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
                    <Dot i={0} />
                    <Dot i={1} />
                    <Dot i={2} />
                  </div>
                </div>
              )}

              {/* 未解決 → 有人対応の導線 */}
              {!thinking && lastResolved === false && !escalated && (
                <div className="flex justify-center pt-1">
                  <button
                    onClick={escalate}
                    className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
                  >
                    <Headset size={14} /> 担当者につなぐ
                  </button>
                </div>
              )}

              {/* 解決 → 満足度評価 */}
              {!thinking && lastResolved === true && !escalated && (
                <div className="flex flex-col items-center gap-1.5 pt-1">
                  {rated ? (
                    <div className="text-xs text-ink-400">評価ありがとうございました</div>
                  ) : (
                    <>
                      <div className="text-xs text-ink-400">回答は役に立ちましたか？</div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            onClick={() => rate(v)}
                            className="text-ink-300 transition hover:scale-110 hover:text-amber-400"
                            aria-label={`${v}点`}
                          >
                            <Star size={18} />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 入力欄 */}
            <div className="border-t border-ink-100 bg-white px-3 py-2.5">
              {messages.length > 0 && (
                <button
                  onClick={resetConversation}
                  className="mb-2 inline-flex items-center gap-1 text-xs text-ink-400 transition hover:text-ink-600"
                >
                  <RotateCcw size={12} /> 会話をリセット
                </button>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-end gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="質問を入力…"
                  className="min-w-0 flex-1 rounded-xl border border-ink-200 bg-ink-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-400/20"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || thinking}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
                  aria-label="送信"
                >
                  <Send size={17} />
                </button>
              </form>
              <div className="mt-1.5 px-1 text-center text-[10px] text-ink-300">
                AIが生成した回答です。内容の正確性は保証されません。
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function BotAvatar() {
  return (
    <div className="grid h-8 w-8 shrink-0 place-items-center self-end rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white">
      <Sparkles size={15} />
    </div>
  );
}

function Dot({ i }: { i: number }) {
  return (
    <span
      className="typing-dot inline-block h-1.5 w-1.5 rounded-full bg-ink-400"
      style={{ animationDelay: `${i * 0.16}s` }}
    />
  );
}

function MessageBubble({
  m,
  kbById,
}: {
  m: ChatMessage;
  kbById: (id: string) => { question: string; category: string } | undefined;
}) {
  if (m.role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-600 px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-white shadow-sm">
          {m.text}
        </div>
      </motion.div>
    );
  }
  const isAgent = m.role === "agent";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
      {isAgent ? (
        <div className="grid h-8 w-8 shrink-0 place-items-center self-end rounded-full bg-emerald-500 text-white">
          <Headset size={15} />
        </div>
      ) : (
        <BotAvatar />
      )}
      <div className="max-w-[82%] space-y-1.5">
        <div className="rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-ink-800 shadow-sm">
          {m.text}
        </div>
        {m.sourceIds && m.sourceIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pl-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-ink-400">
              <BookOpen size={11} /> 参照
            </span>
            {m.sourceIds.map((id) => {
              const a = kbById(id);
              if (!a) return null;
              return (
                <span
                  key={id}
                  className="max-w-[11rem] truncate rounded-full bg-brand-50 px-2 py-0.5 text-[10px] text-brand-700"
                  title={`[${a.category}] ${a.question}`}
                >
                  {a.question}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
