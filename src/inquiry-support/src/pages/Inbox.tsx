import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  Search,
  Sparkles,
  Mail,
  MessageSquare,
  FileText,
  Phone,
  Inbox as InboxIcon,
  Plus,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useStore } from "../store";
import { CATEGORIES, STATUSES, type Inquiry, type Channel } from "../data/seed";
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Pill,
  Skeleton,
  StatusDot,
} from "../components/ui";
import {
  categoryTone,
  priorityTone,
  statusTone,
  relTime,
} from "../lib/meta";
import { useLoad } from "../lib/useLoad";
import { fakeApi } from "../lib/fakeApi";

const channelIcon: Record<Channel, typeof Mail> = {
  メール: Mail,
  Webフォーム: FileText,
  チャット: MessageSquare,
  電話メモ: Phone,
};

export default function Inbox() {
  const navigate = useNavigate();
  const inquiries = useStore((s) => s.inquiries);
  const staff = useStore((s) => s.staff);
  const addSample = useStore((s) => s.addSampleInquiry);
  const organize = useStore((s) => s.organize);
  const settings = useStore((s) => s.settings);
  const loading = useLoad();

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("すべて");
  const [status, setStatus] = useState<string>("すべて");
  const [receiving, setReceiving] = useState(false);
  const [organizingId, setOrganizingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return inquiries.filter((i) => {
      if (cat !== "すべて" && i.category !== cat) return false;
      if (status !== "すべて" && i.status !== status) return false;
      if (kw) {
        const hay = (
          i.customerName +
          i.company +
          i.subject +
          i.body +
          (i.summary ?? "") +
          i.code
        ).toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }, [inquiries, q, cat, status]);

  const counts = useMemo(() => {
    return {
      未対応: inquiries.filter((i) => i.status === "未対応").length,
      対応中: inquiries.filter((i) => i.status === "対応中").length,
      返信済み: inquiries.filter((i) => i.status === "返信済み").length,
    };
  }, [inquiries]);

  const nameOf = (id?: string) => staff.find((s) => s.id === id);

  // 「新規受信をシミュレート」→ AI 自動整理を体感させる
  const onReceive = async () => {
    setReceiving(true);
    const id = addSample();
    toast("新しい問い合わせを受信しました", { icon: "📨" });
    await fakeApi(true, 300);
    setReceiving(false);
    if (settings.autoOrganize) {
      setOrganizingId(id);
      await fakeApi(true, 1100);
      organize(id);
      setOrganizingId(null);
      toast.success("AIが内容を自動整理しました", {
        description: "要約・分類・優先度・抽出項目を作成しました。",
      });
    }
  };

  const onManualOrganize = async (id: string) => {
    setOrganizingId(id);
    await fakeApi(true, 1100);
    organize(id);
    setOrganizingId(null);
    toast.success("AIが内容を整理しました");
  };

  return (
    <div className="space-y-5">
      {/* ヘッダー */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">受信箱</h1>
          <p className="mt-1 text-sm text-ink-500">
            届いた問い合わせを AI が自動で要約・分類します。件名をクリックで詳細へ。
          </p>
        </div>
        <Button onClick={onReceive} loading={receiving}>
          <Plus size={16} />
          新規受信をシミュレート
        </Button>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-3 gap-3">
        {(
          [
            ["未対応", counts.未対応, "amber"],
            ["対応中", counts.対応中, "blue"],
            ["返信済み", counts.返信済み, "green"],
          ] as const
        ).map(([label, n, tone]) => (
          <Card key={label} className="px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-medium text-ink-500">
              <StatusDot tone={tone} />
              {label}
            </div>
            <div className="tnum mt-1 text-2xl font-bold text-ink-900">{n}</div>
          </Card>
        ))}
      </div>

      {/* 検索 & フィルタ */}
      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="お客様名・会社名・キーワードで検索"
              className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip active={cat === "すべて"} onClick={() => setCat("すべて")}>
              すべて
            </FilterChip>
            {CATEGORIES.map((c) => (
              <FilterChip key={c} active={cat === c} onClick={() => setCat(c)}>
                {c}
              </FilterChip>
            ))}
            <span className="mx-1 h-4 w-px bg-ink-200" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-medium text-ink-700 outline-none focus:border-brand-400"
            >
              <option value="すべて">状況: すべて</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  状況: {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* リスト */}
      <Card className="overflow-hidden">
        {loading ? (
          <ListSkeleton />
        ) : filtered.length === 0 ? (
          inquiries.length === 0 ? (
            <EmptyState
              icon={<InboxIcon size={26} />}
              title="問い合わせがありません"
              description="「新規受信をシミュレート」で問い合わせを受信できます。"
            />
          ) : (
            <EmptyState
              icon={<Search size={24} />}
              title="該当する結果がありません"
              description="検索キーワードや絞り込み条件を変えてみてください。"
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQ("");
                    setCat("すべて");
                    setStatus("すべて");
                  }}
                >
                  条件をクリア
                </Button>
              }
            />
          )
        ) : (
          <ul className="divide-y divide-ink-100">
            <AnimatePresence initial={false}>
              {filtered.map((i) => (
                <InquiryRow
                  key={i.id}
                  inq={i}
                  assignee={nameOf(i.assigneeId)}
                  organizing={organizingId === i.id}
                  onOpen={() => navigate(`/inquiry/${i.id}`)}
                  onOrganize={() => onManualOrganize(i.id)}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </Card>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full px-3 py-1.5 text-xs font-medium transition " +
        (active
          ? "bg-brand-600 text-white"
          : "bg-ink-100 text-ink-600 hover:bg-ink-200")
      }
    >
      {children}
    </button>
  );
}

function InquiryRow({
  inq,
  assignee,
  organizing,
  onOpen,
  onOrganize,
}: {
  inq: Inquiry;
  assignee?: { name: string; color: string } | undefined;
  organizing: boolean;
  onOpen: () => void;
  onOrganize: () => void;
}) {
  const Ch = channelIcon[inq.channel];
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="group cursor-pointer px-4 py-3.5 transition hover:bg-ink-50 sm:px-5"
      onClick={onOpen}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-500">
          <Ch size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="tnum text-[11px] font-medium text-ink-400">{inq.code}</span>
            <span className="text-sm font-semibold text-ink-900">
              {inq.customerName}
              {inq.company && (
                <span className="ml-1 font-normal text-ink-400">/ {inq.company}</span>
              )}
            </span>
            <span className="text-[11px] text-ink-400">{inq.channel}</span>
          </div>

          <div className="mt-0.5 truncate text-sm text-ink-700">{inq.subject}</div>

          {/* AI 整理の結果 */}
          {organizing ? (
            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-brand-600">
              <Loader2 size={14} className="animate-spin" />
              <span className="ai-pulse">AI が内容を整理しています…</span>
            </div>
          ) : inq.organized ? (
            <>
              <p className="mt-1.5 line-clamp-1 text-xs text-ink-500">
                <Sparkles size={11} className="mr-1 inline text-brand-500" />
                {inq.summary}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {inq.category && (
                  <Pill tone={categoryTone[inq.category]}>{inq.category}</Pill>
                )}
                {inq.priority && (
                  <Pill tone={priorityTone[inq.priority]}>優先度 {inq.priority}</Pill>
                )}
                <Pill tone={statusTone[inq.status]}>{inq.status}</Pill>
              </div>
            </>
          ) : (
            <div className="mt-2 flex items-center gap-2">
              <Pill tone="gray">未整理</Pill>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOrganize();
                }}
                className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
              >
                <Sparkles size={12} />
                AIで整理
              </button>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="whitespace-nowrap text-[11px] text-ink-400">
            {relTime(inq.receivedAt)}
          </span>
          {assignee ? (
            <Avatar name={assignee.name} color={assignee.color} size={26} />
          ) : (
            <span className="text-[11px] text-ink-300">未割当</span>
          )}
          <ChevronRight
            size={16}
            className="text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-ink-500"
          />
        </div>
      </div>
    </motion.li>
  );
}

function ListSkeleton() {
  return (
    <ul className="divide-y divide-ink-100">
      {Array.from({ length: 7 }).map((_, i) => (
        <li key={i} className="flex items-start gap-3 px-5 py-4">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-6 w-6 rounded-full" />
        </li>
      ))}
    </ul>
  );
}
