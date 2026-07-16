import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Sparkles,
  Wand2,
  Send,
  Save,
  FileText,
  ClipboardList,
  ListChecks,
  UserRound,
  CheckCircle2,
} from "lucide-react";
import { useStore } from "../store";
import { STATUSES, type Status, type Template } from "../data/seed";
import {
  Avatar,
  Button,
  Card,
  Pill,
  StatusDot,
} from "../components/ui";
import {
  categoryTone,
  priorityTone,
  sentimentTone,
  statusTone,
  fmtDateTime,
  channelLabel,
} from "../lib/meta";
import { draftReply, type Tone as DraftTone } from "../lib/ai";
import { fakeApi } from "../lib/fakeApi";

const TONES: DraftTone[] = ["ていねい", "簡潔", "やわらかい"];

export default function InquiryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const inq = useStore((s) => s.inquiries.find((q) => q.id === id));
  const staff = useStore((s) => s.staff);
  const organize = useStore((s) => s.organize);
  const setStatus = useStore((s) => s.setStatus);
  const assign = useStore((s) => s.assign);
  const saveDraft = useStore((s) => s.saveDraft);
  const sendReply = useStore((s) => s.sendReply);
  const templates = useStore((s) => s.templates);

  const [tone, setTone] = useState<DraftTone>("ていねい");
  const [text, setText] = useState(inq?.draft ?? "");
  const [generating, setGenerating] = useState(false);
  const [organizing, setOrganizing] = useState(false);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const revealTimer = useRef<number | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setText(inq?.draft ?? "");
  }, [inq?.id, inq?.draft]);

  useEffect(() => {
    return () => {
      if (revealTimer.current) clearInterval(revealTimer.current);
    };
  }, []);

  if (!inq) {
    return (
      <div className="grid h-[50vh] place-items-center text-center">
        <div>
          <p className="text-ink-500">この問い合わせは見つかりませんでした。</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
            受信箱へ戻る
          </Button>
        </div>
      </div>
    );
  }

  const assignee = staff.find((s) => s.id === inq.assigneeId);

  const onOrganize = async () => {
    setOrganizing(true);
    await fakeApi(true, 1100);
    organize(inq.id);
    setOrganizing(false);
    toast.success("AIが内容を整理しました");
  };

  // 返信下書きを AI 生成(タイプライター演出)
  const onGenerate = async () => {
    if (!inq.organized) {
      toast.error("先に内容の整理を行ってください");
      return;
    }
    setGenerating(true);
    setText("");
    const full = await fakeApi(draftReply(inq, tone), 900);
    let i = 0;
    if (revealTimer.current) clearInterval(revealTimer.current);
    revealTimer.current = window.setInterval(() => {
      i += 3;
      setText(full.slice(0, i));
      if (i >= full.length) {
        if (revealTimer.current) clearInterval(revealTimer.current);
        setText(full);
        setGenerating(false);
        toast.success("返信の下書きを作成しました", {
          description: "内容を確認・調整して送信できます。",
        });
      }
    }, 16);
  };

  const insertTemplate = (t: Template) => {
    const filled = t.body.split("{{お客様名}}").join(inq.customerName);
    setText((prev) => (prev.trim() ? prev + "\n\n" + filled : filled));
    toast(`「${t.title}」を挿入しました`, { icon: "📎" });
    setTimeout(() => taRef.current?.focus(), 0);
  };

  const onSave = async () => {
    setSaving(true);
    await fakeApi(true, 450);
    saveDraft(inq.id, text);
    if (inq.status === "未対応") setStatus(inq.id, "対応中");
    setSaving(false);
    toast.success("下書きを保存しました");
  };

  const onSend = async () => {
    if (!text.trim()) {
      toast.error("返信内容が空です");
      return;
    }
    setSending(true);
    await fakeApi(true, 700);
    sendReply(inq.id, text);
    setSending(false);
    toast.success("返信を送信しました", {
      description: `${inq.customerName} 様へ返信を記録しました。`,
    });
  };

  const replyTemplates = templates.filter((t) => t.kind === "返信定型文");
  const docTemplates = templates.filter((t) => t.kind === "資料テンプレート");

  return (
    <div className="space-y-5">
      {/* ヘッダー */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition hover:text-ink-800"
        >
          <ArrowLeft size={16} />
          受信箱へ戻る
        </button>
        <div className="flex items-center gap-2">
          <span className="tnum text-xs text-ink-400">{inq.code}</span>
          <Pill tone={statusTone[inq.status]}>{inq.status}</Pill>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        {/* 左:問い合わせ内容 + AI 整理 */}
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-bold text-ink-900">
                  {inq.customerName}
                  <span className="ml-1.5 text-sm font-normal text-ink-400">様</span>
                </div>
                {inq.company && (
                  <div className="text-xs text-ink-500">{inq.company}</div>
                )}
              </div>
              <div className="text-right text-[11px] text-ink-400">
                <div>{channelLabel[inq.channel]}で受信</div>
                <div className="tnum mt-0.5">{fmtDateTime(inq.receivedAt)}</div>
              </div>
            </div>

            <div className="mt-4 text-sm font-semibold text-ink-800">
              {inq.subject}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-600">
              {inq.body}
            </p>
          </Card>

          {/* AI 整理パネル */}
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-ink-100 bg-brand-50/60 px-5 py-3">
              <Sparkles size={16} className="text-brand-600" />
              <span className="text-sm font-bold text-brand-800">AIによる自動整理</span>
            </div>

            {organizing ? (
              <div className="flex items-center gap-2 px-5 py-8 text-sm font-medium text-brand-600">
                <Wand2 size={16} className="animate-pulse" />
                <span className="ai-pulse">内容を解析しています…</span>
              </div>
            ) : !inq.organized ? (
              <div className="flex flex-col items-start gap-3 px-5 py-6">
                <p className="text-sm text-ink-500">
                  この問い合わせはまだ整理されていません。AIで要約・分類しましょう。
                </p>
                <Button onClick={onOrganize}>
                  <Sparkles size={16} />
                  AIで整理する
                </Button>
              </div>
            ) : (
              <div className="space-y-4 px-5 py-4">
                <div>
                  <Label icon={<ClipboardList size={13} />}>要約</Label>
                  <p className="mt-1 text-sm leading-relaxed text-ink-700">
                    {inq.summary}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {inq.category && (
                    <Pill tone={categoryTone[inq.category]}>{inq.category}</Pill>
                  )}
                  {inq.priority && (
                    <Pill tone={priorityTone[inq.priority]}>優先度 {inq.priority}</Pill>
                  )}
                  {inq.sentiment && (
                    <Pill tone={sentimentTone[inq.sentiment]}>
                      温度感: {inq.sentiment}
                    </Pill>
                  )}
                </div>

                {inq.fields && inq.fields.length > 0 && (
                  <div>
                    <Label icon={<ListChecks size={13} />}>抽出された要点</Label>
                    <dl className="mt-1.5 divide-y divide-ink-100 rounded-xl border border-ink-100">
                      {inq.fields.map((f, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 px-3 py-2 text-sm"
                        >
                          <dt className="w-24 shrink-0 text-ink-400">{f.label}</dt>
                          <dd className="flex-1 font-medium text-ink-800">{f.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* 対応状況コントロール */}
          <Card className="space-y-3 p-5">
            <Label icon={<UserRound size={13} />}>対応の管理</Label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs text-ink-400">状況</span>
                <select
                  value={inq.status}
                  onChange={(e) => {
                    setStatus(inq.id, e.target.value as Status);
                    toast.success(`状況を「${e.target.value}」に更新`);
                  }}
                  className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-ink-400">担当者</span>
                <select
                  value={inq.assigneeId ?? ""}
                  onChange={(e) => {
                    assign(inq.id, e.target.value);
                    toast.success("担当者を割り当てました");
                  }}
                  className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
                >
                  <option value="">未割当</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {assignee && (
              <div className="flex items-center gap-2 text-xs text-ink-500">
                <Avatar name={assignee.name} color={assignee.color} size={22} />
                {assignee.name}（{assignee.role}）が担当
              </div>
            )}
          </Card>
        </div>

        {/* 右:返信作成 */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
                  <Wand2 size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-ink-900">AI返信アシスト</div>
                  <div className="text-[11px] text-ink-400">
                    下書きを生成 → 確認・調整して送信
                  </div>
                </div>
              </div>
              {inq.status === "返信済み" && (
                <Pill tone="green">
                  <CheckCircle2 size={12} />
                  返信済み
                </Pill>
              )}
            </div>

            {/* トーン選択 + 生成 */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-ink-400">文体</span>
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={
                    "rounded-full px-3 py-1 text-xs font-medium transition " +
                    (tone === t
                      ? "bg-brand-600 text-white"
                      : "bg-ink-100 text-ink-600 hover:bg-ink-200")
                  }
                >
                  {t}
                </button>
              ))}
              <Button
                onClick={onGenerate}
                loading={generating}
                className="ml-auto"
              >
                <Sparkles size={15} />
                {text.trim() ? "作り直す" : "AIで下書きを生成"}
              </Button>
            </div>

            {/* テキストエリア */}
            <div className="relative mt-3">
              <textarea
                ref={taRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="「AIで下書きを生成」を押すと、この欄に返信文の下書きが入ります。テンプレートの挿入や手直しも自由に行えます。"
                rows={12}
                className="thin-scroll w-full resize-y rounded-xl border border-ink-200 bg-white px-3.5 py-3 text-sm leading-relaxed text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25"
              />
              {generating && (
                <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                  <Sparkles size={10} />
                  生成中
                </span>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="tnum text-[11px] text-ink-400">{text.length} 文字</span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onSave} loading={saving}>
                  <Save size={15} />
                  下書き保存
                </Button>
                <Button onClick={onSend} loading={sending}>
                  <Send size={15} />
                  送信する
                </Button>
              </div>
            </div>
          </Card>

          {/* テンプレート挿入 */}
          <Card className="p-5">
            <Label icon={<FileText size={13} />}>テンプレートを挿入</Label>
            <div className="mt-3 space-y-3">
              <TemplateGroup
                title="返信定型文"
                items={replyTemplates}
                onPick={insertTemplate}
              />
              <TemplateGroup
                title="資料テンプレート"
                items={docTemplates}
                onPick={insertTemplate}
              />
            </div>
            <p className="mt-3 text-[11px] text-ink-400">
              挿入時に <code className="rounded bg-ink-100 px-1">{"{{お客様名}}"}</code>{" "}
              は自動で置き換わります。
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Label({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-ink-500">
      {icon}
      {children}
    </div>
  );
}

function TemplateGroup({
  title,
  items,
  onPick,
}: {
  title: string;
  items: Template[];
  onPick: (t: Template) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-ink-400">
        <StatusDot tone={title === "返信定型文" ? "blue" : "amber"} />
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((t) => (
          <motion.button
            key={t.id}
            whileTap={{ scale: 0.96 }}
            onClick={() => onPick(t)}
            className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            <ClipboardList size={12} />
            {t.title}
          </motion.button>
        ))}
        {items.length === 0 && (
          <span className="text-xs text-ink-400">テンプレートがありません</span>
        )}
      </div>
    </div>
  );
}
