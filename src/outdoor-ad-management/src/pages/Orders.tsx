import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ClipboardList, Link2, Search, SearchX } from "lucide-react";
import { useStore, staffName } from "../store";
import { ME_ID, type Order } from "../data/seed";
import { useLoad } from "../lib/useLoad";
import { fmtDate, fmtDateTime, yen } from "../lib/format";
import { installOverdue, pendingCancel, phaseOf } from "../lib/report";
import { Card, EmptyState, PageHeader, Pagination, Pill, Segmented, SortTh, TableSkeleton, Tabs, inputCls, tableHeadCls } from "../components/ui";
import { PhasePill } from "../components/pills";
import { QTag, SourceTag } from "../components/tags";

type Tab = "backlog" | "installed" | "cancelPlan" | "cancelled" | "waiting" | "all";
const PER = 20;

export default function Orders() {
  const loading = useLoad();
  const nav = useNavigate();
  const orders = useStore((s) => s.orders);
  const customers = useStore((s) => s.customers);
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as Tab) || "backlog";
  const [scope, setScope] = useState<"me" | "all">("me");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: "order", dir: -1 });
  const cmap = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);

  const scoped = useMemo(() => orders.filter((o) => scope === "all" || o.repId === ME_ID), [orders, scope]);
  const is = (o: Order, t: Tab) => {
    const ph = phaseOf(o);
    if (t === "backlog") return ph === "受注済・未設置";
    if (t === "installed") return ph === "設置済";
    if (t === "cancelPlan") return ph === "設置済" && !!pendingCancel(o);
    if (t === "cancelled") return ph === "解約済";
    if (t === "waiting") return !o.kikakuNo;
    return true;
  };
  const counts = (t: Tab) => scoped.filter((o) => is(o, t)).length;
  const filtered = useMemo(() => {
    const kw = q.trim();
    return scoped.filter(
      (o) =>
        is(o, tab) &&
        (!kw || (o.kikakuNo ?? "").includes(kw) || (cmap.get(o.customerId)?.company ?? "").includes(kw) || o.boardName.includes(kw)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoped, tab, q, cmap]);
  const sorted = useMemo(() => {
    const v = (o: Order): string | number => {
      switch (sort.key) {
        case "no":
          return o.kikakuNo ?? "";
        case "install":
          return o.actualInstallDate ?? o.plannedInstallDate ?? "";
        case "fee":
          return o.adFee ?? -1;
        default:
          return o.orderDate;
      }
    };
    return [...filtered].sort((a, b) => {
      const x = v(a);
      const y = v(b);
      return (typeof x === "number" ? x - (y as number) : String(x).localeCompare(String(y))) * sort.dir;
    });
  }, [filtered, sort]);
  const onSort = (k: string) => setSort((s) => ({ key: k, dir: s.key === k ? ((-s.dir) as 1 | -1) : -1 }));
  const lastSync = orders.reduce((m, o) => (o.syncedAt && o.syncedAt > m ? o.syncedAt : m), "");

  return (
    <>
      <PageHeader
        eyebrow="Orders"
        title="受注・設置・解約"
        description="受注した案件を、設置・解約まで1件ずつ追いかけます。企画番号・設置日・解約日は、工事指示システムの「企画」から自動で入る想定です。"
        guide={[
          "見込みで「受注にする」を押すと、ここに「受注済・未設置」として並びます。",
          "工事指示システムで企画が登録されると企画番号が紐づき、製造部の施工完了で「設置済」になります。",
          "解約の連絡を受けたら、案件を開いて「解約予定を登録」を押します。一部の面だけの解約もできます。",
        ]}
      />

      <div className="mb-4 flex flex-col gap-2 rounded-lg border border-navy-100 bg-navy-50/60 px-4 py-3 text-[13.5px] text-navy-800 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-2">
          <Link2 size={15} />
          工事指示システム(企画)との最終連携: <span className="tnum font-semibold">{lastSync ? fmtDateTime(lastSync) : "—"}</span>
          <QTag id="Q06" />
        </span>
        <span className="flex flex-wrap items-center gap-2 text-[12.5px]">
          <SourceTag kind="link" /> 既存システムから自動 <SourceTag kind="input" /> この画面で入力
        </span>
      </div>

      <div className="mb-1">
        <Tabs
          value={tab}
          onChange={(t) => {
            setParams({ tab: t });
            setPage(1);
          }}
          items={[
            { value: "backlog", label: "受注済・未設置(受注残)", count: counts("backlog") },
            { value: "installed", label: "設置済", count: counts("installed") },
            { value: "cancelPlan", label: "解約予定あり", count: counts("cancelPlan") },
            { value: "cancelled", label: "解約済", count: counts("cancelled") },
            { value: "waiting", label: "連携待ち", count: counts("waiting") },
            { value: "all", label: "すべて", count: scoped.length },
          ]}
        />
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2 border-t border-ink-200 pt-4">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" />
          <input
            className={inputCls + " w-72! pl-8!"}
            placeholder="企画番号・クライアント名・設置場所で検索"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>
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

      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : sorted.length === 0 ? (
          q ? (
            <EmptyState icon={<SearchX size={20} />} title="該当する案件がありません" description="検索条件を変更してください。" />
          ) : (
            <EmptyState icon={<ClipboardList size={20} />} title="この区分の案件はありません" />
          )
        ) : (
          <>
            {/* PC・iPad横向き: 表 */}
            <div className="thin-scroll hidden overflow-x-auto md:block">
              <table className="w-full min-w-[960px] text-[14.5px]">
                <thead className={tableHeadCls}>
                  <tr>
                    <SortTh label="企画番号" k="no" sort={sort} onSort={onSort} />
                    <th className="px-4 py-2.5 font-medium">クライアント / 設置場所</th>
                    <SortTh label="受注日" k="order" sort={sort} onSort={onSort} />
                    <SortTh label="設置(予定)" k="install" sort={sort} onSort={onSort} />
                    <SortTh label="広告料/月" k="fee" sort={sort} onSort={onSort} className="text-right" />
                    <th className="px-4 py-2.5 text-right font-medium">化粧料</th>
                    <th className="px-4 py-2.5 text-right font-medium">地代/年</th>
                    <th className="px-4 py-2.5 font-medium">状態</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.slice((page - 1) * PER, page * PER).map((o) => (
                    <tr key={o.id} onClick={() => nav(`/orders/${o.id}`)} className="cursor-pointer border-b border-ink-100 transition last:border-0 hover:bg-navy-50/50">
                      <td className="px-4 py-3">{o.kikakuNo ? <span className="tnum text-ink-800">{o.kikakuNo}</span> : <Pill tone="warn">連携待ち</Pill>}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-navy-900">{cmap.get(o.customerId)?.company}</div>
                        <div className="text-[12.5px] text-ink-500">
                          {o.boardName}
                          {scope === "all" && ` ・ ${staffName(o.repId)}`}
                        </div>
                      </td>
                      <td className="tnum px-4 py-3 text-ink-700">{fmtDate(o.orderDate)}</td>
                      <td className="tnum px-4 py-3">
                        <InstallCell o={o} />
                      </td>
                      <td className="tnum px-4 py-3 text-right">{o.adFee === null ? <span className="text-warn-700">未入力</span> : yen(o.adFee)}</td>
                      <td className="tnum px-4 py-3 text-right text-ink-600">{o.makeupFee === null ? <span className="text-warn-700">未入力</span> : yen(o.makeupFee)}</td>
                      <td className="tnum px-4 py-3 text-right text-ink-600">{o.landRent === null ? <span className="text-warn-700">未入力</span> : yen(o.landRent)}</td>
                      <td className="px-4 py-3">
                        <StateCell o={o} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* スマホ・iPad縦向き: カード(横に長い表をそのまま出さない) */}
            <div className="divide-y divide-ink-100 md:hidden">
              {sorted.slice((page - 1) * PER, page * PER).map((o) => (
                <button key={o.id} onClick={() => nav(`/orders/${o.id}`)} className="block w-full px-4 py-3.5 text-left active:bg-navy-50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-[15.5px] font-medium text-navy-900">{cmap.get(o.customerId)?.company}</div>
                      <div className="truncate text-[12.5px] text-ink-500">{o.boardName}</div>
                    </div>
                    <StateCell o={o} />
                  </div>
                  <div className="tnum mt-2 grid grid-cols-3 gap-2 text-[12.5px] text-ink-500">
                    <span>
                      受注
                      <span className="block text-[14px] text-ink-800">{fmtDate(o.orderDate).slice(5)}</span>
                    </span>
                    <span>
                      設置
                      <span className="block text-[14px] text-ink-800">
                        <InstallCell o={o} short />
                      </span>
                    </span>
                    <span className="text-right">
                      広告料/月
                      <span className="block text-[14px] font-semibold text-navy-900">{o.adFee === null ? "未入力" : yen(o.adFee)}</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <Pagination page={page} total={sorted.length} per={PER} onChange={setPage} />
          </>
        )}
      </Card>
    </>
  );
}

function InstallCell({ o, short }: { o: Order; short?: boolean }) {
  const f = (d: string) => (short ? fmtDate(d).slice(5) : fmtDate(d));
  if (o.actualInstallDate) return <span className="text-ink-800">{f(o.actualInstallDate)}</span>;
  if (!o.plannedInstallDate) return <span className="text-ink-400">—</span>;
  return (
    <span className={installOverdue(o) ? "text-bad-600" : "text-ink-500"}>
      予定 {f(o.plannedInstallDate)}
      {installOverdue(o) && !short && <span className="ml-1 text-[12px]">(予定日超過)</span>}
    </span>
  );
}

function StateCell({ o }: { o: Order }) {
  const ph = phaseOf(o);
  const pc = pendingCancel(o);
  return (
    <span className="flex flex-wrap gap-1">
      {ph && <PhasePill phase={ph} />}
      {ph === "設置済" && pc && <Pill tone="bad">{pc.partial ? "一部解約予定" : "解約予定"}</Pill>}
    </span>
  );
}
