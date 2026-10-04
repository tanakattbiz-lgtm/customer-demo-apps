import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Building2, Plus, Search, SearchX } from "lucide-react";
import { useStore, staffName } from "../store";
import { ME_ID, OPEN_STAGES, type Customer, type CustomerStatus, type Rank } from "../data/seed";
import { useLoad } from "../lib/useLoad";
import { fakeApi } from "../lib/fakeApi";
import { contractState } from "../lib/domain";
import { daysFromToday, fmtDate, fmtDateTime, fmtMonth } from "../lib/format";
import { ActivityModal, CustomerFormModal, DealFormModal } from "../components/forms";
import {
  Button,
  Card,
  Confirm,
  DL,
  Drawer,
  EmptyState,
  PageHeader,
  Pagination,
  Segmented,
  SortTh,
  TableSkeleton,
  Tabs,
  inputCls,
  tableHeadCls,
  thCls,
} from "../components/ui";
import { ContractPill, CustomerStatusPill, RankPill, StagePill } from "../components/pills";

const PER = 15;
type Tab = "" | CustomerStatus;

export default function Customers() {
  const loading = useLoad();
  const [params, setParams] = useSearchParams();
  const customers = useStore((s) => s.customers);
  const deals = useStore((s) => s.deals);
  const activities = useStore((s) => s.activities);
  const [tab, setTab] = useState<Tab>("");
  const [q, setQ] = useState("");
  const [rank, setRank] = useState<"" | Rank>("");
  const [scope, setScope] = useState<"me" | "all">("me");
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: "last", dir: -1 });
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<{ open: boolean; customer?: Customer }>({ open: params.get("new") === "1" });
  const selected = customers.find((c) => c.id === params.get("id"));

  const lastAct = useMemo(() => {
    const m = new Map<string, string>();
    activities.forEach((a) => {
      if ((m.get(a.customerId) ?? "") < a.date) m.set(a.customerId, a.date);
    });
    return m;
  }, [activities]);
  const openDeals = useMemo(() => {
    const m = new Map<string, number>();
    deals.filter((d) => OPEN_STAGES.includes(d.stage)).forEach((d) => m.set(d.customerId, (m.get(d.customerId) ?? 0) + 1));
    return m;
  }, [deals]);

  const base = customers.filter((c) => scope === "all" || c.repId === ME_ID);
  const rows = useMemo(() => {
    const kw = q.trim();
    const list = base.filter(
      (c) =>
        (!tab || c.status === tab) &&
        (!rank || c.rank === rank) &&
        (!kw || c.company.includes(kw) || c.contact.includes(kw) || c.industry.includes(kw)),
    );
    const val = (c: Customer): string => (sort.key === "company" ? c.company : sort.key === "rank" ? c.rank : lastAct.get(c.id) ?? "");
    return list.sort((a, b) => val(a).localeCompare(val(b), "ja") * sort.dir);
  }, [base, tab, rank, q, sort, lastAct]);
  const onSort = (k: string) => setSort((s) => ({ key: k, dir: s.key === k ? ((-s.dir) as 1 | -1) : 1 }));
  const count = (s: CustomerStatus) => base.filter((c) => c.status === s).length;

  return (
    <>
      <PageHeader
        eyebrow="Customers"
        title="お客様"
        description="これから営業するお客様(見込み客)から、すでに広告を出しているお客様(広告主)までをまとめて確認できます。"
        guide={[
          "新しいお客様は、右上の「見込み客を登録」から入力します。",
          "行を押すと、そのお客様の商談・これまでの対応・契約が見られます。",
          "お客様と話したら「対応を記録」で内容を残しておきましょう。",
        ]}
        actions={
          <Button onClick={() => setForm({ open: true })}>
            <Plus size={15} />
            見込み客を登録
          </Button>
        }
      />
      <div className="mb-4 flex flex-col gap-1 border-b border-ink-200">
        <Tabs<Tab>
          value={tab}
          onChange={(v) => {
            setTab(v);
            setPage(1);
          }}
          items={[
            { value: "", label: "すべて", count: base.length },
            { value: "見込み", label: "見込み", count: count("見込み") },
            { value: "商談中", label: "商談中", count: count("商談中") },
            { value: "取引中", label: "取引中", count: count("取引中") },
            { value: "休眠", label: "休眠", count: count("休眠") },
          ]}
        />
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" />
            <input className={inputCls + " w-56! pl-8!"} placeholder="会社名・担当者・業種" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          </div>
          <select className={inputCls + " w-28!"} value={rank} onChange={(e) => { setRank(e.target.value as Rank); setPage(1); }}>
            <option value="">全ランク</option>
            <option value="A">ランクA</option>
            <option value="B">ランクB</option>
            <option value="C">ランクC</option>
          </select>
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
      </div>
      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          base.length === 0 ? (
            <EmptyState icon={<Building2 size={20} />} title="最初の見込み客を登録しましょう" action={<Button onClick={() => setForm({ open: true })}>見込み客を登録</Button>} />
          ) : (
            <EmptyState icon={<SearchX size={20} />} title="該当する顧客がありません" description="検索条件を変更してください。" />
          )
        ) : (
          <>
            <div className="thin-scroll overflow-x-auto">
              <table className="w-full min-w-[860px] text-[15px]">
                <thead className={tableHeadCls}>
                  <tr>
                    <SortTh label="ランク" k="rank" sort={sort} onSort={onSort} className="w-20" />
                    <SortTh label="会社名" k="company" sort={sort} onSort={onSort} />
                    <th className={thCls}>先方担当</th>
                    <th className={thCls}>状態</th>
                    <th className={thCls}>進行中の商談</th>
                    <SortTh label="最終活動" k="last" sort={sort} onSort={onSort} />
                    <th className={thCls}>担当</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice((page - 1) * PER, page * PER).map((c) => {
                    const last = lastAct.get(c.id);
                    return (
                      <tr key={c.id} onClick={() => setParams({ id: c.id })} className="cursor-pointer border-b border-ink-100 transition last:border-0 hover:bg-navy-50/50">
                        <td className="px-4 py-3">
                          <RankPill rank={c.rank} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-navy-900">{c.company}</div>
                          <div className="text-[12.5px] text-ink-500">
                            {c.industry} ・ {c.area}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-ink-700">
                          {c.contact}
                          <div className="text-[12.5px] text-ink-500">{c.contactTitle}</div>
                        </td>
                        <td className="px-4 py-3">
                          <CustomerStatusPill status={c.status} />
                        </td>
                        <td className="tnum px-4 py-3 text-ink-700">{openDeals.get(c.id) ? `${openDeals.get(c.id)}件` : <span className="text-ink-400">—</span>}</td>
                        <td className="tnum px-4 py-3 text-ink-600">
                          {last ? (
                            <>
                              {fmtDate(last.slice(0, 10))}
                              <span className="ml-1.5 text-[12px] text-ink-400">{-daysFromToday(last.slice(0, 10))}日前</span>
                            </>
                          ) : (
                            <span className="text-ink-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-ink-600">{staffName(c.repId)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} total={rows.length} per={PER} onChange={setPage} />
          </>
        )}
      </Card>
      <CustomerDrawer customer={selected} onClose={() => setParams({})} onEdit={(c) => setForm({ open: true, customer: c })} />
      <CustomerFormModal open={form.open} customer={form.customer} onClose={() => { setForm({ open: false }); if (params.get("new")) setParams({}); }} />
    </>
  );
}

function CustomerDrawer({ customer, onClose, onEdit }: { customer?: Customer; onClose: () => void; onEdit: (c: Customer) => void }) {
  const nav = useNavigate();
  const allDeals = useStore((s) => s.deals);
  const allActs = useStore((s) => s.activities);
  const allContracts = useStore((s) => s.contracts);
  const removeCustomer = useStore((s) => s.removeCustomer);
  const [dealOpen, setDealOpen] = useState(false);
  const [actOpen, setActOpen] = useState(false);
  const [del, setDel] = useState(false);
  const c = customer;
  const deals = c ? allDeals.filter((d) => d.customerId === c.id) : [];
  const acts = c ? allActs.filter((a) => a.customerId === c.id).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6) : [];
  const contracts = c ? allContracts.filter((k) => k.customerId === c.id).sort((a, b) => b.startMonth.localeCompare(a.startMonth)) : [];

  return (
    <>
      <Drawer
        open={!!c}
        onClose={onClose}
        title={c?.company}
        sub={c && `${c.industry} ・ ${c.area} ・ 獲得経路: ${c.source}`}
        footer={
          c && (
            <>
              <Button variant="danger" className="mr-auto" onClick={() => setDel(true)}>
                削除
              </Button>
              <Button variant="outline" onClick={() => onEdit(c)}>
                編集
              </Button>
              <Button onClick={() => setDealOpen(true)}>商談を作成</Button>
            </>
          )
        }
      >
        {c && (
          <div className="space-y-6 px-6 py-5">
            <div className="flex items-center gap-2">
              <RankPill rank={c.rank} />
              <CustomerStatusPill status={c.status} />
            </div>
            <DL
              items={[
                ["先方担当", `${c.contact}(${c.contactTitle})`],
                ["電話", <a href={`tel:${c.phone}`} className="tnum text-navy-700 hover:underline">{c.phone}</a>],
                ["メール", c.email || "—"],
                ["所在地", c.address || "—"],
                ["自社担当", staffName(c.repId)],
                ["登録日", <span className="tnum">{fmtDate(c.createdAt)}</span>],
                ...(c.memo ? ([["メモ", c.memo]] as [string, string][]) : []),
              ]}
            />
            <section>
              <div className="mb-2 text-[13px] font-medium text-ink-500">商談({deals.length})</div>
              {deals.length === 0 ? (
                <div className="rounded-md border border-dashed border-ink-300 px-4 py-4 text-center text-[14px] text-ink-500">商談はまだありません</div>
              ) : (
                <div className="overflow-hidden rounded-md border border-ink-200">
                  {deals.map((d) => (
                    <Link key={d.id} to={`/deals/${d.id}`} className="flex items-center justify-between gap-2 border-b border-ink-100 px-4 py-2.5 last:border-0 hover:bg-navy-50/50">
                      <span className="truncate text-[15px] text-ink-900">{d.title}</span>
                      <StagePill stage={d.stage} />
                    </Link>
                  ))}
                </div>
              )}
            </section>
            <section>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px] font-medium text-ink-500">最近の営業活動</span>
                <button onClick={() => setActOpen(true)} className="text-[13px] text-navy-700 hover:underline">
                  活動を記録
                </button>
              </div>
              {acts.length === 0 ? (
                <div className="text-[14px] text-ink-400">記録はありません</div>
              ) : (
                <ul className="space-y-3">
                  {acts.map((a) => (
                    <li key={a.id} className="border-l-2 border-navy-200 pl-3">
                      <div className="text-[12.5px] text-ink-500">
                        <span className="font-medium text-navy-900">{a.type}</span> ・ <span className="tnum">{fmtDateTime(a.date)}</span> ・ {staffName(a.repId)}
                      </div>
                      <div className="mt-0.5 text-[14px] leading-relaxed text-ink-800">{a.memo}</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            {contracts.length > 0 && (
              <section>
                <div className="mb-2 text-[13px] font-medium text-ink-500">広告契約({contracts.length})</div>
                <div className="overflow-hidden rounded-md border border-ink-200">
                  {contracts.slice(0, 6).map((k) => (
                    <Link key={k.id} to={`/contracts?id=${k.id}`} className="flex items-center justify-between gap-2 border-b border-ink-100 px-4 py-2.5 text-[14px] last:border-0 hover:bg-navy-50/50">
                      <span className="tnum text-ink-700">
                        {fmtMonth(k.startMonth)} 〜 {fmtMonth(k.cancelMonth ?? k.endMonth)}
                      </span>
                      <ContractPill state={contractState(k)} />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </Drawer>
      {c && <DealFormModal open={dealOpen} onClose={() => setDealOpen(false)} customerId={c.id} onSaved={(id) => nav(`/deals/${id}`)} />}
      {c && <ActivityModal open={actOpen} onClose={() => setActOpen(false)} customerId={c.id} title={c.company} />}
      <Confirm
        open={del}
        title="この顧客を削除しますか"
        message={
          contracts.length > 0
            ? "この顧客には広告契約があるため削除できません。状態を「休眠」に変更してください。"
            : "関連する商談・活動履歴・仮押さえもあわせて削除されます。この操作は取り消せません。"
        }
        confirmLabel={contracts.length > 0 ? "閉じる" : "削除する"}
        danger={contracts.length === 0}
        onClose={() => setDel(false)}
        onConfirm={async () => {
          if (contracts.length > 0 || !c) {
            setDel(false);
            return;
          }
          await fakeApi(null);
          removeCustomer(c.id);
          setDel(false);
          onClose();
          toast.success("顧客を削除しました");
        }}
      />
    </>
  );
}
