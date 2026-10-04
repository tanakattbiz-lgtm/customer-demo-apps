import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Columns3, Handshake, List, Plus, Search, SearchX } from "lucide-react";
import { useStore, staffName } from "../store";
import { ME_ID, OPEN_STAGES, STAGE_PROB, STAGES, type Deal, type Stage } from "../data/seed";
import { useLoad } from "../lib/useLoad";
import { daysFromToday, fmtDate, man, yen } from "../lib/format";
import { DealFormModal } from "../components/forms";
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Help,
  PageHeader,
  Pagination,
  Segmented,
  Skeleton,
  SortTh,
  TableSkeleton,
  inputCls,
  tableHeadCls,
  thCls,
} from "../components/ui";
import { StagePill } from "../components/pills";

const PER = 15;

export default function Deals() {
  const loading = useLoad();
  const nav = useNavigate();
  const deals = useStore((s) => s.deals);
  const customers = useStore((s) => s.customers);
  const [view, setView] = useState<"board" | "list">("board");
  const [scope, setScope] = useState<"me" | "all">("me");
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<"" | Stage>("");
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: "next", dir: 1 });
  const [page, setPage] = useState(1);
  const [params, setParams] = useSearchParams();
  const [creating, setCreating] = useState(params.get("new") === "1");

  const cmap = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return deals.filter(
      (d) =>
        (scope === "all" || d.repId === ME_ID) &&
        (!stage || d.stage === stage) &&
        (!kw || (cmap.get(d.customerId)?.company ?? "").toLowerCase().includes(kw) || d.title.toLowerCase().includes(kw)),
    );
  }, [deals, scope, q, stage, cmap]);

  const sorted = useMemo(() => {
    const val = (d: Deal): string | number => {
      switch (sort.key) {
        case "company":
          return cmap.get(d.customerId)?.company ?? "";
        case "stage":
          return STAGES.indexOf(d.stage);
        case "amount":
          return d.monthlyBudget * d.months;
        case "close":
          return d.expectedClose;
        default:
          return d.nextAction?.date ?? "9999";
      }
    };
    return [...filtered].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      return (typeof x === "number" ? x - (y as number) : String(x).localeCompare(String(y), "ja")) * sort.dir;
    });
  }, [filtered, sort, cmap]);

  const onSort = (k: string) => setSort((s) => ({ key: k, dir: s.key === k ? ((-s.dir) as 1 | -1) : 1 }));
  const open = filtered.filter((d) => OPEN_STAGES.includes(d.stage));
  const weighted = open.reduce((s, d) => s + (d.monthlyBudget * d.months * STAGE_PROB[d.stage]) / 100, 0);

  return (
    <>
      <PageHeader
        eyebrow="Deals"
        title="商談"
        description="お客様との商談を、進み具合ごとに並べています。カードを押すと、商談の詳しい画面が開きます。"
        guide={[
          "新しい商談は、右上の「商談を登録」から始めます。",
          "カードを押して商談を開き、話した内容を「対応を記録」で残します。",
          "看板が決まったら仮押さえし、契約がまとまったら「成約を登録する」を押します。",
        ]}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus size={15} />
            商談を登録
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" />
            <input
              className={inputCls + " w-60! pl-8!"}
              placeholder="顧客名・案件名で検索"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </div>
          {view === "list" && (
            <select
              className={inputCls + " w-36!"}
              value={stage}
              onChange={(e) => {
                setStage(e.target.value as Stage);
                setPage(1);
              }}
            >
              <option value="">全ステージ</option>
              {STAGES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          )}
          <Segmented
            value={scope}
            onChange={(v) => {
              setScope(v);
              setPage(1);
            }}
            items={[
              { value: "me", label: "自分の担当" },
              { value: "all", label: "全担当" },
            ]}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[13px] text-ink-500">
            進行中 <span className="tnum font-semibold text-navy-900">{open.length}</span>件 / 受注見込み額{" "}
            <span className="tnum font-semibold text-navy-900">{man(weighted)}</span>
            <Help label="受注見込み額" text="進行中の商談の金額に、それぞれの確度(契約になる見込みの%)を掛けて合計した金額です。" />
          </div>
          <Segmented
            value={view}
            onChange={setView}
            items={[
              { value: "board", label: "段階ごと", icon: <Columns3 size={13} /> },
              { value: "list", label: "表で見る", icon: <List size={13} /> },
            ]}
          />
        </div>
      </div>

      {view === "board" ? (
        <div className="thin-scroll -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          <div className="grid min-w-[900px] grid-cols-5 gap-3">
            {OPEN_STAGES.map((st) => {
              const items = filtered
                .filter((d) => d.stage === st)
                .sort((a, b) => (a.nextAction?.date ?? "9").localeCompare(b.nextAction?.date ?? "9"));
              const sum = items.reduce((s, d) => s + d.monthlyBudget * d.months, 0);
              return (
                <div key={st} className="flex flex-col rounded-lg border border-ink-200 bg-ink-100/60">
                  <div className="border-b border-ink-200 px-3.5 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-semibold text-navy-900">{st}</span>
                      <span className="tnum text-[12px] text-ink-400">確度 {STAGE_PROB[st]}%</span>
                    </div>
                    <div className="tnum mt-1 text-[12.5px] text-ink-500">
                      {items.length}件 ・ {man(sum)}
                    </div>
                  </div>
                  <div className="flex min-h-40 flex-col gap-2 p-2">
                    {loading
                      ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 bg-white" />)
                      : items.map((d) => {
                          const c = cmap.get(d.customerId);
                          const n = d.nextAction ? daysFromToday(d.nextAction.date) : null;
                          return (
                            <motion.button
                              layout
                              key={d.id}
                              onClick={() => nav(`/deals/${d.id}`)}
                              className="rounded-md border border-ink-200 bg-white p-3 text-left shadow-[0_1px_2px_oklch(25%_0.04_262/0.04)] transition duration-200 hover:-translate-y-px hover:border-navy-300 hover:shadow-[0_6px_16px_-8px_oklch(25%_0.04_262/0.25)]"
                            >
                              <div className="truncate text-[14px] font-semibold text-navy-900">{c?.company}</div>
                              <div className="mt-0.5 truncate text-[13px] text-ink-600">{d.title}</div>
                              <div className="tnum mt-2 text-[15px] font-semibold text-ink-900">{man(d.monthlyBudget * d.months)}</div>
                              <div className="mt-2 flex items-center justify-between border-t border-ink-100 pt-2">
                                <span
                                  className={
                                    "tnum text-[12px] " +
                                    (n === null ? "text-warn-700" : n < 0 ? "font-medium text-bad-600" : n === 0 ? "font-medium text-navy-900" : "text-ink-500")
                                  }
                                >
                                  {d.nextAction ? `次回 ${d.nextAction.date.slice(5).replace("-", "/")}` : "次回対応 未設定"}
                                </span>
                                <Avatar name={staffName(d.repId)} size={20} tone="light" />
                              </div>
                            </motion.button>
                          );
                        })}
                    {!loading && items.length === 0 && (
                      <div className="grid flex-1 place-items-center py-6 text-[12.5px] text-ink-400">該当なし</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="overflow-hidden">
          {loading ? (
            <TableSkeleton />
          ) : sorted.length === 0 ? (
            deals.length === 0 ? (
              <EmptyState
                icon={<Handshake size={20} />}
                title="最初の商談を登録しましょう"
                action={<Button onClick={() => setCreating(true)}>商談を登録</Button>}
              />
            ) : (
              <EmptyState icon={<SearchX size={20} />} title="該当する商談がありません" description="検索条件を変更してください。" />
            )
          ) : (
            <>
              <div className="thin-scroll overflow-x-auto">
                <table className="w-full min-w-[860px] text-[15px]">
                  <thead className={tableHeadCls}>
                    <tr>
                      <SortTh label="顧客 / 案件" k="company" sort={sort} onSort={onSort} />
                      <SortTh label="ステージ" k="stage" sort={sort} onSort={onSort} />
                      <SortTh label="見込金額" k="amount" sort={sort} onSort={onSort} className="text-right" />
                      <SortTh label="受注予定" k="close" sort={sort} onSort={onSort} />
                      <SortTh label="次回対応" k="next" sort={sort} onSort={onSort} />
                      <th className={thCls}>担当</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.slice((page - 1) * PER, page * PER).map((d) => (
                      <tr
                        key={d.id}
                        onClick={() => nav(`/deals/${d.id}`)}
                        className="cursor-pointer border-b border-ink-100 transition last:border-0 hover:bg-navy-50/50"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-navy-900">{cmap.get(d.customerId)?.company}</div>
                          <div className="text-[13px] text-ink-500">{d.title}</div>
                        </td>
                        <td className="px-4 py-3">
                          <StagePill stage={d.stage} />
                        </td>
                        <td className="tnum px-4 py-3 text-right">{yen(d.monthlyBudget * d.months)}</td>
                        <td className="tnum px-4 py-3 text-ink-600">{fmtDate(d.expectedClose)}</td>
                        <td className="px-4 py-3">
                          {d.nextAction ? (
                            <>
                              <div className={"tnum text-[14px] " + (daysFromToday(d.nextAction.date) < 0 ? "text-bad-600" : "text-ink-800")}>
                                {fmtDate(d.nextAction.date)}
                              </div>
                              <div className="max-w-56 truncate text-[12.5px] text-ink-500">{d.nextAction.content}</div>
                            </>
                          ) : (
                            <span className="text-ink-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-ink-600">{staffName(d.repId)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} total={sorted.length} per={PER} onChange={setPage} />
            </>
          )}
        </Card>
      )}

      <DealFormModal open={creating} onClose={() => { setCreating(false); if (params.get("new")) setParams({}); }} onSaved={(id) => nav(`/deals/${id}`)} />
    </>
  );
}
