import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Search, ChevronRight, Image as ImageIcon, Tag } from "lucide-react";
import { useStore } from "../store";
import { STATUSES, CATEGORIES, type Status, type Category, type AppraisalRequest } from "../data/seed";
import { yen, relTime } from "../lib/format";
import { useLoad } from "../lib/useLoad";
import { Card, Pill, StatusBadge, Skeleton, EmptyState, Avatar, PhotoTile, inputCls } from "../components/ui";

type Tab = "すべて" | Status;
const TABS: Tab[] = ["すべて", ...STATUSES];

export default function Requests() {
  const navigate = useNavigate();
  const requests = useStore((s) => s.requests);
  const staff = useStore((s) => s.staff);
  const loading = useLoad();

  const [tab, setTab] = useState<Tab>("すべて");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "すべて">("すべて");

  const counts = useMemo(() => {
    const c: Record<string, number> = { すべて: requests.length };
    for (const s of STATUSES) c[s] = requests.filter((r) => r.status === s).length;
    return c;
  }, [requests]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return requests.filter((r) => {
      if (tab !== "すべて" && r.status !== tab) return false;
      if (cat !== "すべて" && r.category !== cat) return false;
      if (!kw) return true;
      return (
        r.code.toLowerCase().includes(kw) ||
        r.customerName.toLowerCase().includes(kw) ||
        r.lineName.toLowerCase().includes(kw) ||
        r.brand.toLowerCase().includes(kw) ||
        r.itemName.toLowerCase().includes(kw) ||
        r.tags.some((t) => t.toLowerCase().includes(kw))
      );
    });
  }, [requests, tab, cat, q]);

  const staffName = (id: string) => staff.find((s) => s.id === id);

  return (
    <div className="space-y-5">
      {/* --- ヘッダ --- */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">査定依頼</h1>
          <p className="mt-1 text-sm text-ink-500">
            LINE から届いたオンライン査定依頼を一覧・検索し、対応状況を管理します。
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <span className="tnum font-semibold text-ink-800">{requests.length}</span> 件の依頼
        </div>
      </div>

      {/* --- ステータスタブ --- */}
      <div className="thin-scroll -mx-1 flex gap-1 overflow-x-auto px-1">
        {TABS.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition " +
                (active ? "bg-brand-600 text-white shadow-sm" : "bg-white text-ink-600 hover:bg-ink-100 border border-ink-200")
              }
            >
              {t}
              <span
                className={
                  "tnum rounded-full px-1.5 text-[11px] " +
                  (active ? "bg-white/20" : "bg-ink-100 text-ink-500")
                }
              >
                {counts[t] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* --- 検索・絞り込み --- */}
      <Card className="p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={17} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="査定番号・お客様名・ブランド・商品名・タグで検索"
              className={inputCls + " pl-9"}
            />
          </div>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value as Category | "すべて")}
            className={inputCls + " sm:w-52"}
          >
            <option value="すべて">すべてのカテゴリ</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* --- 一覧 --- */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-16 w-16 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Search size={26} />}
            title="該当する依頼がありません"
            description="検索条件・ステータス・カテゴリを変更してお試しください。"
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <RequestRow key={r.id} r={r} i={i} staff={staffName(r.assigneeId)} onClick={() => navigate(`/requests/${r.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestRow({
  r,
  i,
  staff,
  onClick,
}: {
  r: AppraisalRequest;
  i: number;
  staff?: { name: string; color: string };
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(i * 0.025, 0.3) }}
      onClick={onClick}
      className="group block w-full text-left"
    >
      <Card className="flex items-center gap-4 p-3 transition hover:border-brand-300 hover:shadow-md sm:p-4">
        <div className="relative shrink-0">
          <PhotoTile i={i} className="h-16 w-16" />
          <span className="absolute -bottom-1.5 -right-1.5 flex items-center gap-0.5 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-medium text-ink-500 shadow-sm ring-1 ring-ink-200">
            <ImageIcon size={10} />
            {r.photos}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="tnum text-[11px] font-medium text-ink-400">{r.code}</span>
            <Pill tone="gray" className="!py-0">
              {r.category}
            </Pill>
            <span className="text-[11px] text-ink-400">経路: {r.channel}</span>
          </div>
          <div className="mt-1 truncate text-sm font-semibold text-ink-900">
            {r.brand} <span className="font-normal text-ink-600">/ {r.itemName}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-500">
            <span className="flex items-center gap-1">
              <Avatar name={r.lineName} size={16} color="oklch(70% 0.02 150)" />
              {r.customerName}
            </span>
            <span>·</span>
            <span>{r.method}</span>
            <span>·</span>
            <span>{relTime(r.createdAt)}</span>
          </div>
          {r.tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {r.tags.slice(0, 3).map((t) => (
                <span key={t} className="inline-flex items-center gap-0.5 rounded bg-ink-100 px-1.5 py-0.5 text-[10px] text-ink-500">
                  <Tag size={9} />
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="hidden w-28 shrink-0 flex-col items-end gap-1 sm:flex">
          <StatusBadge status={r.status} />
          {r.status === "回答済" ? (
            <span className="tnum text-sm font-bold text-brand-700">{yen(r.quote)}</span>
          ) : staff ? (
            <span className="text-[11px] text-ink-400">{staff.name}</span>
          ) : (
            <span className="text-[11px] text-amber-600">未割当</span>
          )}
        </div>

        <ChevronRight className="shrink-0 text-ink-300 transition group-hover:text-brand-500" size={18} />
      </Card>
    </motion.button>
  );
}
