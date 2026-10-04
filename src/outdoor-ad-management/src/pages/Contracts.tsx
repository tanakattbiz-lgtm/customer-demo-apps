import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { addYears, format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Landmark, Plus, Search, SearchX } from "lucide-react";
import { useStore, staffName, uid } from "../store";
import { AREAS, BOARD_TYPES, ME_ID, STAFF, type AdContract, type Area, type Board, type BoardType, type LandContract } from "../data/seed";
import { useLoad } from "../lib/useLoad";
import { fakeApi } from "../lib/fakeApi";
import { contractState, faceLookup, handoverOf, type ContractState } from "../lib/domain";
import {
  addMonthKey,
  daysFromToday,
  fmtDate,
  fmtDateTime,
  fmtMonth,
  fmtPeriod,
  monthRange,
  monthsBetween,
  thisMonth,
  todayISO,
  yen,
} from "../lib/format";
import {
  Button,
  Card,
  Confirm,
  DL,
  Drawer,
  EmptyState,
  Field,
  Modal,
  PageHeader,
  Pagination,
  Pill,
  Segmented,
  SortTh,
  TableSkeleton,
  Tabs,
  errCls,
  inputCls,
  tableHeadCls,
  thCls,
} from "../components/ui";
import { ContractPill, HandoverPill } from "../components/pills";

const PER = 15;
type Tab = "ad" | "land";

export default function Contracts() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get("tab") === "land" ? "land" : "ad";
  const contracts = useStore((s) => s.contracts);
  const lands = useStore((s) => s.lands);
  const cur = thisMonth();
  const adCount = contracts.filter((c) => {
    const st = contractState(c, cur);
    return st !== "満了" && st !== "解約済";
  }).length;
  return (
    <>
      <PageHeader
        eyebrow="Contracts"
        title="契約の一覧"
        description="広告主との「広告契約」と、看板を置く土地の持ち主との「土地契約」を確認できます。どちらも看板にひもづいています。"
        guide={[
          "上のタブで「広告契約」と「土地契約」を切り替えます。",
          "行を押すと、契約の詳しい内容と、どの看板の契約かが表示されます。",
          "解約の連絡を受けたら、契約を開いて「解約を登録」を押します。",
        ]}
      />
      <div className="mb-4 border-b border-ink-200">
        <Tabs<Tab>
          value={tab}
          onChange={(v) => setParams(v === "land" ? { tab: "land" } : {})}
          items={[
            { value: "ad", label: "広告契約", count: adCount },
            { value: "land", label: "土地契約", count: lands.filter((l) => !l.terminated).length },
          ]}
        />
      </div>
      {tab === "ad" ? <AdTab /> : <LandTab />}
    </>
  );
}

// ======================= 広告契約 =======================
function AdTab() {
  const loading = useLoad();
  const [params, setParams] = useSearchParams();
  const contracts = useStore((s) => s.contracts);
  const customers = useStore((s) => s.customers);
  const boards = useStore((s) => s.boards);
  const handovers = useStore((s) => s.handovers);
  const lookup = useMemo(() => faceLookup(boards), [boards]);
  const cmap = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);
  const [q, setQ] = useState("");
  const [state, setState] = useState<"active" | ContractState | "">("active");
  const [scope, setScope] = useState<"me" | "all">("all");
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: "start", dir: -1 });
  const [page, setPage] = useState(1);
  const selected = contracts.find((c) => c.id === params.get("id"));
  const cur = thisMonth();

  const rows = useMemo(() => {
    const kw = q.trim();
    const list = contracts.filter((c) => {
      const st = contractState(c, cur);
      if (state === "active" && (st === "満了" || st === "解約済")) return false;
      if (state && state !== "active" && st !== state) return false;
      if (scope === "me" && c.repId !== ME_ID) return false;
      if (!kw) return true;
      const faces = c.faceIds.map((f) => lookup.get(f)?.board.name ?? "").join(" ");
      return c.no.includes(kw) || (cmap.get(c.customerId)?.company ?? "").includes(kw) || faces.includes(kw);
    });
    const val = (c: AdContract): string | number =>
      sort.key === "fee" ? c.monthlyFee : sort.key === "end" ? (c.cancelMonth ?? c.endMonth) : sort.key === "customer" ? (cmap.get(c.customerId)?.company ?? "") : c.startMonth;
    return list.sort((a, b) => {
      const x = val(a);
      const y = val(b);
      return (typeof x === "number" ? x - (y as number) : String(x).localeCompare(String(y), "ja")) * sort.dir;
    });
  }, [contracts, q, state, scope, sort, cur, lookup, cmap]);

  const onSort = (k: string) => setSort((s) => ({ key: k, dir: s.key === k ? ((-s.dir) as 1 | -1) : 1 }));
  const reset = () => setPage(1);

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" />
          <input
            className={inputCls + " w-full! pl-8! md:w-64!"}
            placeholder="契約番号・広告主・看板名"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              reset();
            }}
          />
        </div>
        <select
          className={inputCls + " md:w-44!"}
          value={state}
          onChange={(e) => {
            setState(e.target.value as ContractState);
            reset();
          }}
        >
          <option value="active">有効な契約のみ</option>
          <option value="">すべて</option>
          {(["掲載予定", "掲載中", "満了間近", "解約予定", "満了", "解約済"] as ContractState[]).map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <Segmented
          value={scope}
          onChange={(v) => {
            setScope(v);
            reset();
          }}
          items={[
            { value: "all", label: "全担当" },
            { value: "me", label: "自分の担当" },
          ]}
        />
      </div>
      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState icon={<SearchX size={20} />} title="該当する契約がありません" description="検索条件を変更してください。" />
        ) : (
          <>
            <div className="thin-scroll overflow-x-auto">
              <table className="w-full min-w-[980px] text-[15px] [&_td]:whitespace-nowrap">
                <thead className={tableHeadCls}>
                  <tr>
                    <th className={thCls}>契約番号</th>
                    <SortTh label="広告主" k="customer" sort={sort} onSort={onSort} />
                    <th className={thCls}>看板・広告面</th>
                    <SortTh label="掲載期間" k="start" sort={sort} onSort={onSort} />
                    <SortTh label="月額" k="fee" sort={sort} onSort={onSort} className="text-right" />
                    <th className={thCls}>状態</th>
                    <th className={thCls}>担当</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice((page - 1) * PER, page * PER).map((c) => {
                    const f0 = lookup.get(c.faceIds[0]);
                    const ho = handoverOf(handovers, c.id);
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setParams({ id: c.id })}
                        className="cursor-pointer border-b border-ink-100 transition last:border-0 hover:bg-navy-50/50"
                      >
                        <td className="tnum px-4 py-3 text-ink-600">{c.no}</td>
                        <td className="px-4 py-3 font-medium text-navy-900">{cmap.get(c.customerId)?.company}</td>
                        <td className="px-4 py-3">
                          <div className="text-ink-900">{f0?.board.name}</div>
                          <div className="text-[12.5px] text-ink-500">
                            {c.faceIds.map((f) => lookup.get(f)?.face.label).join("・")}
                            {c.faceIds.length > 1 && ` (${c.faceIds.length}面)`}
                          </div>
                        </td>
                        <td className="tnum px-4 py-3 text-ink-600">
                          {c.startMonth.replace("-", "/")} 〜 {(c.cancelMonth ?? c.endMonth).replace("-", "/")}
                        </td>
                        <td className="tnum px-4 py-3 text-right">{yen(c.monthlyFee)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <ContractPill state={contractState(c, cur)} />
                            {ho && ho.status !== "受領済" && <HandoverPill status={ho.status} />}
                          </div>
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
      <AdDrawer contract={selected} onClose={() => setParams({})} />
    </>
  );
}

function AdDrawer({ contract, onClose }: { contract?: AdContract; onClose: () => void }) {
  const customers = useStore((s) => s.customers);
  const boards = useStore((s) => s.boards);
  const handovers = useStore((s) => s.handovers);
  const cancelContract = useStore((s) => s.cancelContract);
  const lookup = useMemo(() => faceLookup(boards), [boards]);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [last, setLast] = useState("");
  const [reason, setReason] = useState("販促予算の見直し");
  const [busy, setBusy] = useState(false);
  const cur = thisMonth();
  const c = contract;
  const st = c ? contractState(c, cur) : undefined;
  const ho = c ? handoverOf(handovers, c.id) : undefined;
  const cancellable = st === "掲載中" || st === "満了間近" || st === "掲載予定";
  const lastOptions = c ? monthRange(c.startMonth > cur ? addMonthKey(c.startMonth, -1) : cur, 40).filter((m) => m < c.endMonth) : [];

  useEffect(() => {
    if (cancelOpen && lastOptions.length) setLast(lastOptions[0]);
  }, [cancelOpen]);

  return (
    <>
      <Drawer
        open={!!c}
        onClose={onClose}
        title={c ? customers.find((x) => x.id === c.customerId)?.company : ""}
        sub={c && <span className="tnum">{c.no}</span>}
        footer={
          c &&
          cancellable && (
            <Button variant="danger" onClick={() => setCancelOpen(true)}>
              解約を登録
            </Button>
          )
        }
      >
        {c && (
          <div className="space-y-6 px-6 py-5">
            <div className="flex flex-wrap gap-1.5">
              <ContractPill state={st!} />
              {ho ? <HandoverPill status={ho.status} /> : <Pill tone="ok">管理部 受領済</Pill>}
            </div>
            <DL
              items={[
                ["掲載期間", fmtPeriod(c.startMonth, c.endMonth)],
                ["月額", <span className="tnum font-semibold">{yen(c.monthlyFee)}</span>],
                ["契約総額", <span className="tnum">{yen(c.monthlyFee * monthsBetween(c.startMonth, c.cancelMonth ?? c.endMonth))}</span>],
                ["担当", staffName(c.repId)],
                ["登録日", <span className="tnum">{fmtDate(c.createdAt)}</span>],
              ]}
            />
            {c.cancelMonth && (
              <div className="rounded-md border border-bad-100 bg-bad-50 px-4 py-3 text-[14px] text-bad-700">
                解約: {fmtMonth(c.cancelMonth)}末で掲載終了(理由: {c.cancelReason}/登録 {c.cancelledAt && fmtDate(c.cancelledAt)})
              </div>
            )}
            <div>
              <div className="mb-2 text-[13px] font-medium text-ink-500">掲載する看板・広告面</div>
              <div className="overflow-hidden rounded-md border border-ink-200">
                {c.faceIds.map((f) => {
                  const l = lookup.get(f);
                  if (!l) return null;
                  return (
                    <Link
                      key={f}
                      to={`/boards/${l.board.id}`}
                      className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-3 transition last:border-0 hover:bg-navy-50/50"
                    >
                      <div className="min-w-0">
                        <div className="text-[15px] font-medium text-navy-900">
                          {l.board.name} {l.face.label}
                        </div>
                        <div className="text-[12.5px] text-ink-500">
                          {l.board.code} ・ {l.board.area} ・ {l.board.type}
                        </div>
                      </div>
                      <span className="text-[12.5px] text-navy-600">看板を見る</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            {ho && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-ink-500">管理部への引継ぎ</span>
                  <Link to={`/handover?id=${ho.id}`} className="text-[13px] text-navy-700 hover:underline">
                    引継ぎを開く
                  </Link>
                </div>
                <div className="rounded-md border border-ink-200 px-4 py-3 text-[14px] text-ink-700">
                  <span className="tnum">{ho.no}</span>・最終更新 <span className="tnum">{fmtDateTime(ho.updatedAt)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="解約を登録"
        width={460}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>
              キャンセル
            </Button>
            <Button
              variant="danger"
              loading={busy}
              onClick={async () => {
                if (!c) return;
                setBusy(true);
                await fakeApi(null);
                cancelContract(c.id, last, reason);
                setBusy(false);
                setCancelOpen(false);
                toast.success("解約を登録しました", { description: `${fmtMonth(last)}末で掲載終了。翌月以降は空き枠として販売できます。` });
              }}
            >
              解約を登録する
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="最終掲載月" required hint="翌月から広告面が「空き」になり、仮押さえ・販売が可能になります">
            <select className={inputCls} value={last} onChange={(e) => setLast(e.target.value)}>
              {lastOptions.map((m) => (
                <option key={m} value={m}>
                  {fmtMonth(m)}末
                </option>
              ))}
            </select>
          </Field>
          <Field label="解約理由">
            <select className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)}>
              {["販促予算の見直し", "店舗閉鎖・移転", "他媒体への切替", "掲出効果への不満", "その他"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
        </div>
      </Modal>
    </>
  );
}

// ======================= 土地契約 =======================
type LandState = "契約中" | "更新期限間近" | "解約済";
const landState = (l: LandContract): LandState =>
  l.terminated ? "解約済" : daysFromToday(l.endDate) <= 90 ? "更新期限間近" : "契約中";

function LandTab() {
  const loading = useLoad();
  const [params, setParams] = useSearchParams();
  const lands = useStore((s) => s.lands);
  const boards = useStore((s) => s.boards);
  const bmap = useMemo(() => new Map(boards.map((b) => [b.id, b])), [boards]);
  const [q, setQ] = useState("");
  const [area, setArea] = useState("");
  const [st, setSt] = useState<LandState | "">("");
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: "end", dir: 1 });
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<{ open: boolean; land?: LandContract }>({ open: false });
  const selected = lands.find((l) => l.id === params.get("id"));

  const rows = useMemo(() => {
    const kw = q.trim();
    const list = lands.filter((l) => {
      const b = bmap.get(l.boardId);
      if (area && b?.area !== area) return false;
      if (st && landState(l) !== st) return false;
      return !kw || l.no.includes(kw) || l.ownerName.includes(kw) || (b?.name ?? "").includes(kw);
    });
    const val = (l: LandContract): string | number =>
      sort.key === "rent" ? l.rent : sort.key === "owner" ? l.ownerName : sort.key === "start" ? l.startDate : l.endDate;
    return list.sort((a, b) => {
      const x = val(a);
      const y = val(b);
      return (typeof x === "number" ? x - (y as number) : String(x).localeCompare(String(y), "ja")) * sort.dir;
    });
  }, [lands, q, area, st, sort, bmap]);
  const onSort = (k: string) => setSort((s) => ({ key: k, dir: s.key === k ? ((-s.dir) as 1 | -1) : 1 }));
  const soon = lands.filter((l) => landState(l) === "更新期限間近").length;
  const newThisMonth = lands.filter((l) => l.createdAt.slice(0, 7) === thisMonth()).length;

  return (
    <>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card className="px-5 py-4">
          <div className="text-[13px] text-ink-500">有効な土地契約</div>
          <div className="tnum mt-1 text-[24px] font-semibold text-navy-900">{lands.filter((l) => !l.terminated).length}<span className="ml-1 text-[13px] font-normal text-ink-500">件</span></div>
        </Card>
        <Card className="px-5 py-4">
          <div className="text-[13px] text-ink-500">更新期限90日以内</div>
          <div className={"tnum mt-1 text-[24px] font-semibold " + (soon ? "text-warn-700" : "text-navy-900")}>{soon}<span className="ml-1 text-[13px] font-normal text-ink-500">件</span></div>
        </Card>
        <Card className="px-5 py-4">
          <div className="text-[13px] text-ink-500">今月の新規締結</div>
          <div className="tnum mt-1 text-[24px] font-semibold text-navy-900">{newThisMonth}<span className="ml-1 text-[13px] font-normal text-ink-500">件</span></div>
        </Card>
      </div>
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" />
          <input className={inputCls + " w-full! pl-8! md:w-64!"} placeholder="契約番号・地権者・看板名" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <select className={inputCls + " md:w-32!"} value={area} onChange={(e) => { setArea(e.target.value); setPage(1); }}>
          <option value="">全エリア</option>
          {AREAS.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <select className={inputCls + " md:w-40!"} value={st} onChange={(e) => { setSt(e.target.value as LandState); setPage(1); }}>
          <option value="">全状態</option>
          {["契約中", "更新期限間近", "解約済"].map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <div className="md:ml-auto">
          <Button onClick={() => setForm({ open: true })}>
            <Plus size={15} />
            土地契約を登録
          </Button>
        </div>
      </div>
      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          lands.length === 0 ? (
            <EmptyState icon={<Landmark size={20} />} title="最初の土地契約を登録しましょう" action={<Button onClick={() => setForm({ open: true })}>土地契約を登録</Button>} />
          ) : (
            <EmptyState icon={<SearchX size={20} />} title="該当する土地契約がありません" description="検索条件を変更してください。" />
          )
        ) : (
          <>
            <div className="thin-scroll overflow-x-auto">
              <table className="w-full min-w-[1040px] text-[15px] [&_td]:whitespace-nowrap">
                <thead className={tableHeadCls}>
                  <tr>
                    <th className={thCls}>契約番号</th>
                    <th className={thCls}>看板(設置場所)</th>
                    <SortTh label="地権者" k="owner" sort={sort} onSort={onSort} />
                    <SortTh label="賃料(月額)" k="rent" sort={sort} onSort={onSort} className="text-right" />
                    <SortTh label="契約開始" k="start" sort={sort} onSort={onSort} />
                    <SortTh label="満了日" k="end" sort={sort} onSort={onSort} />
                    <th className={thCls}>状態</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice((page - 1) * PER, page * PER).map((l) => {
                    const b = bmap.get(l.boardId);
                    const s = landState(l);
                    return (
                      <tr key={l.id} onClick={() => setParams({ tab: "land", id: l.id })} className="cursor-pointer border-b border-ink-100 transition last:border-0 hover:bg-navy-50/50">
                        <td className="tnum px-4 py-3 text-ink-600">{l.no}</td>
                        <td className="px-4 py-3">
                          <div className="text-ink-900">{b?.name}</div>
                          <div className="text-[12.5px] text-ink-500">
                            {b?.code} ・ {b?.area}
                            {b && b.installMonth > thisMonth() && " ・ 設置予定"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-navy-900">{l.ownerName}</div>
                          <div className="text-[12.5px] text-ink-500">{l.ownerKind}</div>
                        </td>
                        <td className="tnum px-4 py-3 text-right">{yen(l.rent)}</td>
                        <td className="tnum px-4 py-3 text-ink-600">{fmtDate(l.startDate)}</td>
                        <td className="tnum px-4 py-3 text-ink-600">{fmtDate(l.endDate)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <Pill tone={s === "契約中" ? "ok" : s === "更新期限間近" ? "warn" : "gray"}>
                              {s === "更新期限間近" ? `更新期限 ${daysFromToday(l.endDate)}日前` : s}
                            </Pill>
                            {l.autoRenew && !l.terminated && <Pill tone="gray">自動更新</Pill>}
                          </div>
                        </td>
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
      <LandDrawer land={selected} onClose={() => setParams({ tab: "land" })} onEdit={(l) => setForm({ open: true, land: l })} />
      <LandFormModal open={form.open} land={form.land} onClose={() => setForm({ open: false })} />
    </>
  );
}

function LandDrawer({ land, onClose, onEdit }: { land?: LandContract; onClose: () => void; onEdit: (l: LandContract) => void }) {
  const board = useStore((s) => s.boards.find((b) => b.id === land?.boardId));
  const contracts = useStore((s) => s.contracts);
  const customers = useStore((s) => s.customers);
  const terminateLand = useStore((s) => s.terminateLand);
  const [confirm, setConfirm] = useState(false);
  const cur = thisMonth();
  const active = board
    ? contracts.filter((c) => c.faceIds.some((f) => board.faces.some((x) => x.id === f)) && ["掲載中", "満了間近", "掲載予定", "解約予定"].includes(contractState(c, cur)))
    : [];
  return (
    <>
      <Drawer
        open={!!land}
        onClose={onClose}
        title={land ? `${land.ownerName}` : ""}
        sub={land && <span className="tnum">{land.no}</span>}
        footer={
          land &&
          !land.terminated && (
            <>
              <Button variant="danger" onClick={() => setConfirm(true)}>
                解約を登録
              </Button>
              <Button variant="outline" onClick={() => onEdit(land)}>
                編集
              </Button>
            </>
          )
        }
      >
        {land && (
          <div className="space-y-6 px-6 py-5">
            <DL
              items={[
                ["地権者", `${land.ownerName}(${land.ownerKind})`],
                ["連絡先", <span className="tnum">{land.ownerPhone}</span>],
                ["住所", land.ownerAddress],
                ["賃料", <span className="tnum font-semibold">{yen(land.rent)} / 月</span>],
                ["契約期間", <span className="tnum">{fmtDate(land.startDate)} 〜 {fmtDate(land.endDate)}</span>],
                ["自動更新", land.autoRenew ? "あり" : "なし"],
                ["担当", staffName(land.repId)],
              ]}
            />
            {land.terminated && <div className="rounded-md bg-ink-100 px-4 py-3 text-[14px] text-ink-600">この土地契約は解約済みです。</div>}
            {board && (
              <div>
                <div className="mb-2 text-[13px] font-medium text-ink-500">この土地に設置している看板</div>
                <Link to={`/boards/${board.id}`} className="block rounded-md border border-ink-200 px-4 py-3 transition hover:bg-navy-50/50">
                  <div className="text-[15px] font-medium text-navy-900">{board.name}</div>
                  <div className="text-[12.5px] text-ink-500">
                    {board.code} ・ {board.type} ・ {board.faces.length}面
                    {board.installMonth > cur && ` ・ ${fmtMonth(board.installMonth)}設置予定`}
                  </div>
                </Link>
              </div>
            )}
            <div>
              <div className="mb-2 text-[13px] font-medium text-ink-500">この看板の有効な広告契約({active.length}件)</div>
              {active.length === 0 ? (
                <div className="text-[14px] text-ink-400">なし</div>
              ) : (
                <div className="overflow-hidden rounded-md border border-ink-200">
                  {active.map((c) => (
                    <Link key={c.id} to={`/contracts?id=${c.id}`} className="flex items-center justify-between gap-2 border-b border-ink-100 px-4 py-2.5 text-[14px] last:border-0 hover:bg-navy-50/50">
                      <span className="truncate text-ink-900">{customers.find((x) => x.id === c.customerId)?.company}</span>
                      <ContractPill state={contractState(c, cur)} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
      <Confirm
        open={confirm}
        title="土地契約の解約を登録しますか"
        message="解約後は看板の撤去手配が必要です。有効な広告契約がある場合は、掲載終了時期を事前に調整してください。"
        confirmLabel="解約を登録する"
        danger
        onClose={() => setConfirm(false)}
        onConfirm={async () => {
          await fakeApi(null);
          terminateLand(land!.id);
          setConfirm(false);
          toast.success("土地契約の解約を登録しました");
        }}
      />
    </>
  );
}

function LandFormModal({ open, onClose, land }: { open: boolean; onClose: () => void; land?: LandContract }) {
  const boards = useStore((s) => s.boards);
  const lands = useStore((s) => s.lands);
  const saveLand = useStore((s) => s.saveLand);
  const cur = thisMonth();
  const [mode, setMode] = useState<"existing" | "new">("new");
  const [f, setF] = useState({
    boardId: "",
    siteName: "",
    siteAddress: "",
    area: "大阪" as Area,
    type: "ロードサイド" as BoardType,
    faces: "1",
    install: addMonthKey(cur, 3),
    ownerName: "",
    ownerKind: "個人" as "個人" | "法人",
    ownerPhone: "",
    ownerAddress: "",
    rent: "",
    startDate: todayISO(),
    years: "5",
    autoRenew: true,
    repId: ME_ID,
  });
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open) return;
    setTouched(false);
    setMode(land ? "existing" : "new");
    setF((p) => ({
      ...p,
      boardId: land?.boardId ?? "",
      siteName: "",
      siteAddress: "",
      ownerName: land?.ownerName ?? "",
      ownerKind: land?.ownerKind ?? "個人",
      ownerPhone: land?.ownerPhone ?? "",
      ownerAddress: land?.ownerAddress ?? "",
      rent: land ? String(land.rent) : "",
      startDate: land?.startDate ?? todayISO(),
      years: land ? String(Math.max(1, Math.round((parseISO(land.endDate).getTime() - parseISO(land.startDate).getTime()) / (365 * 86400000)))) : "5",
      autoRenew: land?.autoRenew ?? true,
      repId: land?.repId ?? ME_ID,
    }));
  }, [open, land]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const errs = {
    boardId: mode === "existing" && !f.boardId ? "看板を選択してください" : "",
    siteName: mode === "new" && !f.siteName.trim() ? "設置場所名を入力してください" : "",
    siteAddress: mode === "new" && !f.siteAddress.trim() ? "所在地を入力してください" : "",
    ownerName: !f.ownerName.trim() ? "地権者名を入力してください" : "",
    ownerPhone: !f.ownerPhone.trim() ? "連絡先を入力してください" : !/^0\d{1,4}-?\d{1,4}-?\d{3,4}$/.test(f.ownerPhone.trim()) ? "電話番号の形式が正しくありません" : "",
    rent: !(Number(f.rent) > 0) ? "賃料を入力してください" : "",
  };
  const err = (k: keyof typeof errs) => (touched ? errs[k] : "");
  const submit = async () => {
    setTouched(true);
    if (Object.values(errs).some(Boolean)) return;
    setBusy(true);
    await fakeApi(null);
    let boardId = f.boardId;
    let newBoard: Board | undefined;
    if (mode === "new" && !land) {
      boardId = uid("b");
      const n = Number(f.faces);
      newBoard = {
        id: boardId,
        code: `KB-${String(12000 + boards.length * 7).padStart(5, "0")}`,
        name: f.siteName.trim(),
        address: f.siteAddress.trim(),
        area: f.area,
        type: f.type,
        size: "W6.0m × H3.0m",
        lighting: true,
        traffic: 30000,
        installMonth: f.install,
        faces: Array.from({ length: n }, (_, i) => ({
          id: `${boardId}-${"AB"[i]}`,
          label: `${"AB"[i]}面`,
          direction: n === 1 ? "交差点正面" : ["上り車線向き", "下り車線向き"][i],
          price: 50000,
        })),
      };
    }
    const start = parseISO(f.startDate);
    const l: LandContract = {
      ...(land ?? { id: uid("l"), createdAt: todayISO(), no: `LD-${format(start, "yyMM")}-${String(lands.length + 101).padStart(4, "0")}` }),
      boardId,
      ownerName: f.ownerName.trim(),
      ownerKind: f.ownerKind,
      ownerPhone: f.ownerPhone.trim(),
      ownerAddress: f.ownerAddress.trim(),
      rent: Number(f.rent),
      startDate: f.startDate,
      endDate: format(addYears(start, Number(f.years)), "yyyy-MM-dd"),
      autoRenew: f.autoRenew,
      repId: f.repId,
    } as LandContract;
    saveLand(l, newBoard);
    setBusy(false);
    toast.success(land ? "土地契約を更新しました" : "土地契約を登録しました", {
      description: newBoard ? `看板「${newBoard.name}」を設置予定として登録しました(${fmtMonth(newBoard.installMonth)}販売開始)` : undefined,
    });
    onClose();
  };
  const boardOptions = useMemo(() => [...boards].sort((a, b) => a.area.localeCompare(b.area) || a.name.localeCompare(b.name, "ja")), [boards]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={land ? "土地契約を編集" : "土地契約を登録"}
      width={640}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={submit} loading={busy}>
            {land ? "保存する" : "登録する"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {!land && (
          <Segmented
            value={mode}
            onChange={setMode}
            items={[
              { value: "new", label: "新しい設置場所" },
              { value: "existing", label: "既存の看板" },
            ]}
          />
        )}
        {mode === "existing" ? (
          <Field label="看板" required error={err("boardId")}>
            <select className={inputCls + (err("boardId") ? errCls : "")} value={f.boardId} onChange={set("boardId")} disabled={!!land}>
              <option value="">選択してください</option>
              {boardOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  [{b.area}] {b.name}({b.code})
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <div className="grid gap-4 rounded-md border border-ink-200 p-4 sm:grid-cols-2">
            <div className="text-[13px] text-ink-500 sm:col-span-2">土地契約と同時に、看板を「設置予定」として登録します。</div>
            <Field label="設置場所名" required error={err("siteName")}>
              <input className={inputCls + (err("siteName") ? errCls : "")} placeholder="例: 国道2号 須磨 板宿" value={f.siteName} onChange={set("siteName")} />
            </Field>
            <Field label="所在地" required error={err("siteAddress")}>
              <input className={inputCls + (err("siteAddress") ? errCls : "")} placeholder="例: 兵庫県神戸市須磨区…" value={f.siteAddress} onChange={set("siteAddress")} />
            </Field>
            <Field label="エリア">
              <select className={inputCls} value={f.area} onChange={set("area")}>
                {AREAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
            <Field label="看板種別">
              <select className={inputCls} value={f.type} onChange={set("type")}>
                {BOARD_TYPES.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
            <Field label="面数">
              <select className={inputCls} value={f.faces} onChange={set("faces")}>
                <option value="1">1面</option>
                <option value="2">2面</option>
              </select>
            </Field>
            <Field label="設置予定月(販売開始)">
              <select className={inputCls} value={f.install} onChange={set("install")}>
                {monthRange(addMonthKey(cur, 1), 12).map((m) => (
                  <option key={m} value={m}>
                    {fmtMonth(m)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="地権者名" required error={err("ownerName")}>
            <input className={inputCls + (err("ownerName") ? errCls : "")} placeholder="例: 今井 正男" value={f.ownerName} onChange={set("ownerName")} />
          </Field>
          <Field label="区分">
            <select className={inputCls} value={f.ownerKind} onChange={set("ownerKind")}>
              <option>個人</option>
              <option>法人</option>
            </select>
          </Field>
          <Field label="連絡先" required error={err("ownerPhone")}>
            <input className={inputCls + " tnum" + (err("ownerPhone") ? errCls : "")} placeholder="078-123-4567" value={f.ownerPhone} onChange={set("ownerPhone")} />
          </Field>
          <Field label="地権者住所">
            <input className={inputCls} value={f.ownerAddress} onChange={set("ownerAddress")} />
          </Field>
          <Field label="賃料(月額・円)" required error={err("rent")}>
            <input type="number" className={inputCls + " tnum" + (err("rent") ? errCls : "")} placeholder="15000" value={f.rent} onChange={set("rent")} step={1000} />
          </Field>
          <Field label="契約開始日">
            <input type="date" className={inputCls} value={f.startDate} onChange={set("startDate")} />
          </Field>
          <Field label="契約期間">
            <select className={inputCls} value={f.years} onChange={set("years")}>
              {[1, 3, 5, 10].map((y) => (
                <option key={y} value={y}>
                  {y}年
                </option>
              ))}
            </select>
          </Field>
          <Field label="担当">
            <select className={inputCls} value={f.repId} onChange={set("repId")}>
              {STAFF.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}({s.branch})
                </option>
              ))}
            </select>
          </Field>
          <label className="flex items-center gap-2 text-[15px] text-ink-800 sm:col-span-2">
            <input type="checkbox" className="h-4 w-4 accent-[oklch(29.5%_0.047_262)]" checked={f.autoRenew} onChange={(e) => setF({ ...f, autoRenew: e.target.checked })} />
            満了時に自動更新する
          </label>
        </div>
      </div>
    </Modal>
  );
}
