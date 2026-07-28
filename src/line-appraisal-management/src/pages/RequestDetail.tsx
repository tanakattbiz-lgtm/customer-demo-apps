import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  PlayCircle,
  MessageSquare,
  Package,
  Route as RouteIcon,
  Star,
  UserCog,
} from "lucide-react";
import { useStore } from "../store";
import { fakeApi } from "../lib/fakeApi";
import { yen, fmtDateTime, fmtTime } from "../lib/format";
import { TAG_POOL, type Rank } from "../data/seed";
import { Card, Button, StatusBadge, Avatar, PhotoTile, Field, inputCls, EmptyState } from "../components/ui";

const RANK_DESC: Record<Rank, string> = {
  S: "新品・未使用同等",
  A: "使用感少なめの美品",
  B: "使用感あり",
  C: "難あり・要確認",
};

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const req = useStore((s) => s.requests.find((r) => r.id === id));
  const staff = useStore((s) => s.staff);
  const setStatus = useStore((s) => s.setStatus);
  const setQuote = useStore((s) => s.setQuote);
  const reply = useStore((s) => s.reply);
  const assign = useStore((s) => s.assign);
  const toggleTag = useStore((s) => s.toggleTag);

  const [busy, setBusy] = useState<string | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteVal, setQuoteVal] = useState("");
  const [msg, setMsg] = useState("");

  const assignee = useMemo(() => staff.find((s) => s.id === req?.assigneeId), [staff, req]);

  if (!req) {
    return (
      <Card>
        <EmptyState
          icon={<Package size={26} />}
          title="依頼が見つかりません"
          description="削除されたか、URL が正しくない可能性があります。"
          action={<Button onClick={() => navigate("/")}>一覧へ戻る</Button>}
        />
      </Card>
    );
  }

  const start = async () => {
    setBusy("start");
    await fakeApi(true, 500);
    setStatus(req.id, "査定中");
    setBusy(null);
    toast.success("査定を開始しました", { description: req.code });
  };

  const submitQuote = async () => {
    const n = Number(quoteVal.replace(/[,\s]/g, ""));
    if (!n || n <= 0) {
      toast.error("有効な査定額を入力してください");
      return;
    }
    setBusy("quote");
    await fakeApi(true, 650);
    setQuote(req.id, n);
    setBusy(null);
    setQuoteOpen(false);
    setQuoteVal("");
    toast.success("査定額を回答しました", { description: yen(n) });
  };

  const send = async () => {
    if (!msg.trim()) return;
    setBusy("msg");
    await fakeApi(true, 400);
    reply(req.id, msg.trim());
    setMsg("");
    setBusy(null);
  };

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition hover:text-ink-800"
      >
        <ArrowLeft size={16} />
        一覧へ戻る
      </button>

      {/* --- ヘッダ --- */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="tnum text-xs font-medium text-ink-400">{req.code}</span>
            <StatusBadge status={req.status} />
          </div>
          <h1 className="mt-1 text-xl font-bold text-ink-900">
            {req.brand} <span className="font-normal text-ink-600">/ {req.itemName}</span>
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {req.customerName} 様（LINE: {req.lineName}）· 受付 {fmtDateTime(req.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {req.status === "未対応" && (
            <Button onClick={start} loading={busy === "start"}>
              <PlayCircle size={16} />
              査定を開始
            </Button>
          )}
          {req.status !== "回答済" && (
            <Button variant={req.status === "未対応" ? "outline" : "primary"} onClick={() => setQuoteOpen((v) => !v)}>
              <CheckCircle2 size={16} />
              査定額を回答
            </Button>
          )}
          {req.status === "回答済" && (
            <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-right">
              <div className="text-[11px] text-brand-600">回答済み査定額</div>
              <div className="tnum text-lg font-bold text-brand-700">{yen(req.quote)}</div>
            </div>
          )}
        </div>
      </div>

      {/* --- 査定額入力(トグル) --- */}
      {quoteOpen && req.status !== "回答済" && (
        <Card className="border-brand-200 bg-brand-50/50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field label="査定額を入力" required hint="担当者が写真と状態を確認して金額を決定します（自動算出はしません）。">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500">¥</span>
                  <input
                    value={quoteVal}
                    onChange={(e) => setQuoteVal(e.target.value)}
                    inputMode="numeric"
                    placeholder="例: 185000"
                    className={inputCls + " pl-8 tnum"}
                    autoFocus
                  />
                </div>
              </Field>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setQuoteOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={submitQuote} loading={busy === "quote"}>
                <Send size={15} />
                この金額で回答
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* --- 左:受付内容 --- */}
        <div className="space-y-5 lg:col-span-2">
          {/* 受付画像 */}
          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-800">
              <Package size={16} className="text-brand-500" />
              受付内容
            </h2>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {Array.from({ length: req.photos }).map((_, i) => (
                <PhotoTile key={i} i={i} label={`#${i + 1}`} className="aspect-square" />
              ))}
            </div>
            <p className="mt-2 text-[11px] text-ink-400">
              ※ LINE 査定フォームで受け付けた商品画像（{req.photos} 枚）
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              <Info label="カテゴリ" value={req.category} />
              <Info label="ブランド" value={req.brand} />
              <Info
                label="コンディション"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-brand-100 text-xs font-bold text-brand-700">
                      {req.rank}
                    </span>
                    <span className="text-xs text-ink-500">{RANK_DESC[req.rank]}</span>
                  </span>
                }
              />
              <Info label="査定方法" value={req.method} />
              <Info label="流入経路" value={<span className="inline-flex items-center gap-1"><RouteIcon size={13} className="text-ink-400" />{req.channel}</span>} />
              <Info label="受付日時" value={fmtDateTime(req.createdAt)} />
            </dl>

            <div className="mt-4 rounded-xl bg-ink-50 p-3.5">
              <div className="mb-1 text-[11px] font-medium text-ink-500">お客様からの申告・状態メモ</div>
              <p className="text-sm leading-relaxed text-ink-700">{req.conditionNote}</p>
            </div>
          </Card>

          {/* LINE 会話 */}
          <Card className="flex flex-col p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-800">
              <MessageSquare size={16} className="text-brand-500" />
              LINE トーク
            </h2>
            <div className="thin-scroll max-h-80 space-y-3 overflow-y-auto pr-1">
              {req.messages.map((m) => (
                <ChatBubble key={m.id} from={m.from} text={m.text} at={m.at} />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-ink-100 pt-3">
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && send()}
                placeholder="お客様へメッセージを送信…"
                className={inputCls}
              />
              <Button onClick={send} loading={busy === "msg"} className="shrink-0">
                <Send size={15} />
                <span className="hidden sm:inline">送信</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* --- 右:対応管理 --- */}
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-800">
              <UserCog size={16} className="text-brand-500" />
              対応管理
            </h2>

            <Field label="担当者">
              <select
                value={req.assigneeId}
                onChange={(e) => {
                  assign(req.id, e.target.value);
                  toast.success("担当者を変更しました");
                }}
                className={inputCls}
              >
                <option value="">未割当</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}（{s.role}）
                  </option>
                ))}
              </select>
            </Field>

            {assignee && (
              <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-ink-50 p-2.5">
                <Avatar name={assignee.name} color={assignee.color} size={34} />
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-ink-800">{assignee.name}</div>
                  <div className="text-[11px] text-ink-400">{assignee.role}</div>
                </div>
              </div>
            )}

            <div className="mt-5">
              <div className="mb-1.5 flex items-center gap-1 text-sm font-medium text-ink-700">
                <Star size={13} className="text-ink-400" />
                タグ（Lステップ連携）
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TAG_POOL.map((t) => {
                  const on = req.tags.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleTag(req.id, t)}
                      className={
                        "rounded-full px-2.5 py-1 text-xs font-medium transition " +
                        (on
                          ? "bg-brand-600 text-white"
                          : "border border-ink-200 bg-white text-ink-500 hover:bg-ink-50")
                      }
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-ink-400">
                タグはシナリオ配信・セグメント抽出の条件として活用します。
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-bold text-ink-800">タイムライン</h2>
            <ol className="space-y-3">
              <TimelineItem done label="LINE 査定依頼を受付" at={req.createdAt} />
              <TimelineItem
                done={req.status !== "未対応"}
                label="査定を開始"
                at={req.status !== "未対応" ? req.updatedAt : undefined}
              />
              <TimelineItem
                done={req.status === "回答済"}
                label="査定額を回答"
                at={req.status === "回答済" ? req.updatedAt : undefined}
                last
              />
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-medium text-ink-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-ink-800">{value}</dd>
    </div>
  );
}

function ChatBubble({ from, text, at }: { from: "customer" | "staff" | "system"; text: string; at: string }) {
  if (from === "system") {
    return (
      <div className="flex justify-center">
        <span className="rounded-full bg-ink-100 px-3 py-1 text-[11px] text-ink-500">{text}</span>
      </div>
    );
  }
  const mine = from === "staff";
  return (
    <div className={"flex items-end gap-2 " + (mine ? "flex-row-reverse" : "")}>
      <div
        className={
          "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed " +
          (mine ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-800")
        }
      >
        {text}
      </div>
      <span className="mb-0.5 text-[10px] text-ink-400">{fmtTime(at)}</span>
    </div>
  );
}

function TimelineItem({
  done,
  label,
  at,
  last,
}: {
  done?: boolean;
  label: string;
  at?: string;
  last?: boolean;
}) {
  return (
    <li className="relative flex gap-3 pl-1">
      {!last && (
        <span
          className={"absolute left-[9px] top-5 h-[calc(100%+4px)] w-px " + (done ? "bg-brand-200" : "bg-ink-200")}
        />
      )}
      <span
        className={
          "z-10 mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full " +
          (done ? "bg-brand-500 text-white" : "border-2 border-ink-200 bg-white")
        }
      >
        {done && <CheckCircle2 size={12} />}
      </span>
      <div className="leading-tight">
        <div className={"text-sm " + (done ? "font-medium text-ink-800" : "text-ink-400")}>{label}</div>
        {at && <div className="text-[11px] text-ink-400">{fmtDateTime(at)}</div>}
      </div>
    </li>
  );
}
