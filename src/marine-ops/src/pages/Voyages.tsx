import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Ship, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useStore } from "../store/useStore";
import { Card, Pill, Progress, Skeleton, StatusDot, EmptyState, inputCls } from "../components/ui";
import PageHeader from "../components/PageHeader";
import { useLoad } from "../lib/useLoad";
import {
  voyageStatus,
  progressPct,
  currentItem,
  STATUS_TONE,
  type VoyageStatus,
} from "../lib/voyage";
import { ymd } from "../lib/format";
import { shipperById, staffById, vesselName } from "../data/seed";

const FILTERS: (VoyageStatus | "すべて" | "要対応")[] = ["すべて", "要対応", "順調", "要注意", "遅延", "不備", "完了"];
const CARGO: string[] = ["すべて", "鋼材", "石油製品", "セメント", "一般貨物"];
type SortKey = "受注日" | "期日" | "進捗" | "運賃";

export default function Voyages() {
  const loading = useLoad();
  const voyages = useStore((s) => s.voyages);
  const shippers = useStore((s) => s.shippers);
  const staff = useStore((s) => s.staff);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("すべて");
  const [cargo, setCargo] = useState("すべて");
  const [sort, setSort] = useState<SortKey>("受注日");

  const rows = useMemo(() => {
    const now = new Date();
    let list = voyages.map((v) => ({ v, s: voyageStatus(v, now), pct: progressPct(v) }));
    if (filter === "要対応") list = list.filter((r) => r.s === "不備" || r.s === "遅延" || r.s === "要注意");
    else if (filter !== "すべて") list = list.filter((r) => r.s === filter);
    if (cargo !== "すべて") list = list.filter((r) => r.v.cargo === cargo);
    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter((r) => {
        const sh = shipperById(shippers, r.v.shipperId)?.name ?? "";
        const st = staffById(staff, r.v.assigneeId)?.name ?? "";
        return [r.v.code, sh, st, r.v.cargo, r.v.cargoDetail, r.v.loadPort, r.v.dischargePort, vesselName(r.v.vesselId)]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
    }
    list.sort((a, b) => {
      switch (sort) {
        case "期日":
          return a.v.eta.localeCompare(b.v.eta);
        case "進捗":
          return b.pct - a.pct;
        case "運賃":
          return b.v.freight - a.v.freight;
        default:
          return b.v.receivedAt.localeCompare(a.v.receivedAt);
      }
    });
    return list;
  }, [voyages, shippers, staff, q, filter, cargo, sort]);

  const counts = useMemo(() => {
    const now = new Date();
    const c: Record<string, number> = {};
    for (const v of voyages) {
      const s = voyageStatus(v, now);
      c[s] = (c[s] ?? 0) + 1;
    }
    return c;
  }, [voyages]);

  return (
    <>
      <PageHeader
        title="配船案件"
        subtitle={`受注 ${voyages.length} 件の確認事項の進捗を一覧で管理します。`}
      />

      {/* フィルタバー */}
      <Card className="mb-4 p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                className={inputCls + " pl-9"}
                placeholder="荷主・担当者・航路・本船・案件番号で検索…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={15} className="text-ink-400" />
              <select className={inputCls + " w-auto py-2"} value={cargo} onChange={(e) => setCargo(e.target.value)}>
                {CARGO.map((c) => (
                  <option key={c}>{c === "すべて" ? "貨物: すべて" : c}</option>
                ))}
              </select>
              <select className={inputCls + " w-auto py-2"} value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                {(["受注日", "期日", "進捗", "運賃"] as SortKey[]).map((s) => (
                  <option key={s} value={s}>
                    並び: {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => {
              const n = f === "すべて" ? voyages.length : f === "要対応" ? (counts["不備"] ?? 0) + (counts["遅延"] ?? 0) + (counts["要注意"] ?? 0) : counts[f] ?? 0;
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={
                    "rounded-full px-3 py-1.5 text-xs font-medium transition " +
                    (active ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-600 hover:bg-ink-200")
                  }
                >
                  {f} <span className="tnum opacity-70">{n}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* テーブル / カード */}
      {loading ? (
        <Card className="divide-y divide-ink-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState icon={<Ship size={26} />} title="該当する案件がありません" description="検索条件やフィルタを変更してください。" />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {/* ヘッダ(デスクトップ) */}
          <div className="hidden grid-cols-[7rem_1fr_9rem_10rem_5rem] gap-3 border-b border-ink-100 bg-ink-50 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400 lg:grid">
            <span>状態 / 番号</span>
            <span>荷主・貨物・航路</span>
            <span>担当 / 本船</span>
            <span>進捗・現在の確認事項</span>
            <span className="text-right">期日</span>
          </div>
          <div className="divide-y divide-ink-100">
            {rows.map(({ v, s, pct }) => {
              const sh = shipperById(shippers, v.shipperId);
              const st = staffById(staff, v.assigneeId);
              const cur = currentItem(v);
              return (
                <Link
                  key={v.id}
                  to={`/voyages/${v.id}`}
                  className="grid grid-cols-1 gap-2 px-5 py-4 transition hover:bg-ink-50 lg:grid-cols-[7rem_1fr_9rem_10rem_5rem] lg:items-center lg:gap-3"
                >
                  {/* 状態 / 番号 */}
                  <div className="flex items-center gap-2 lg:block lg:space-y-1.5">
                    <Pill tone={STATUS_TONE[s] as never}>
                      <StatusDot tone={STATUS_TONE[s] as never} />
                      {s}
                    </Pill>
                    <span className="tnum text-xs text-ink-400 lg:block">{v.code}</span>
                    {v.priority === "高" && s !== "完了" && (
                      <span className="text-[10px] font-bold text-rose-500 lg:block">優先度 高</span>
                    )}
                  </div>
                  {/* 荷主・貨物・航路 */}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-ink-800">{sh?.name}</div>
                    <div className="truncate text-xs text-ink-500">
                      {v.cargo}・{v.cargoDetail}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-ink-400">
                      {v.loadPort} → {v.dischargePort}
                    </div>
                  </div>
                  {/* 担当 / 本船 */}
                  <div className="min-w-0 text-xs">
                    <div className="truncate text-ink-700">{st?.name}</div>
                    <div className="truncate text-ink-400">{vesselName(v.vesselId)}</div>
                  </div>
                  {/* 進捗 */}
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center justify-between text-[11px] text-ink-400">
                      <span className="tnum">{pct}%</span>
                      <span className="truncate pl-2">{cur ? cur.label : "完了"}</span>
                    </div>
                    <Progress
                      pct={pct}
                      tone={s === "遅延" || s === "不備" ? "red" : s === "要注意" ? "amber" : s === "完了" ? "green" : "brand"}
                    />
                  </div>
                  {/* 期日 */}
                  <div className="flex items-center justify-between lg:justify-end lg:gap-1">
                    <span className="tnum text-xs text-ink-500">{ymd(v.eta)} 着</span>
                    <ChevronRight size={16} className="hidden shrink-0 text-ink-300 lg:block" />
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </>
  );
}
