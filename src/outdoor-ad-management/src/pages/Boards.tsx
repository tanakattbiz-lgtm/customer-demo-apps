import { Fragment, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Lightbulb, Plus, Search, SearchX, X } from "lucide-react";
import { useStore, staffName } from "../store";
import { AREAS, BOARD_TYPES, type Board, type Face, type Hold } from "../data/seed";
import { useLoad } from "../lib/useLoad";
import { buildIndex, cellAt, handoverOf, isFree, type Cell, type FaceIndex } from "../lib/domain";
import { addMonthKey, fmtDate, fmtMonth, fmtPeriod, monthRange, num, thisMonth, yen } from "../lib/format";
import { HoldModal } from "../components/forms";
import { Button, Card, DL, EmptyState, Field, Help, Modal, PageHeader, Skeleton, Tabs, inputCls } from "../components/ui";

const COLS = 12;

type Seg = { cell: Cell; start: number; span: number; key: string };

export default function Boards() {
  const loading = useLoad(550);
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const dealId = params.get("deal") ?? undefined;
  const boards = useStore((s) => s.boards);
  const contracts = useStore((s) => s.contracts);
  const holds = useStore((s) => s.holds);
  const deals = useStore((s) => s.deals);
  const customers = useStore((s) => s.customers);
  const handovers = useStore((s) => s.handovers);
  const idx = useMemo(() => buildIndex(contracts, holds), [contracts, holds]);
  const cur = thisMonth();

  const [offset, setOffset] = useState(0);
  const [q, setQ] = useState("");
  const [area, setArea] = useState("");
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [onlyFree, setOnlyFree] = useState(false);
  const [holdTarget, setHoldTarget] = useState<{ board: Board; face: Face; month: string; end?: string } | null>(null);
  const [mode, setMode] = useState<"find" | "calendar">("find");
  const [holdInfo, setHoldInfo] = useState<Hold | null>(null);

  const deal = deals.find((d) => d.id === dealId);
  const cname = (id: string) => customers.find((c) => c.id === id)?.company ?? "";
  const months = monthRange(addMonthKey(cur, offset), COLS);
  const periodValid = !!from && !!to && from <= to;

  const filtered = useMemo(() => {
    const kw = q.trim();
    return boards
      .map((b) => ({
        board: b,
        faces: b.faces.filter((f) => !onlyFree || !periodValid || isFree(idx, b, f, from, to)),
      }))
      .filter(
        ({ board: b, faces }) =>
          faces.length > 0 &&
          (!area || b.area === area) &&
          (!type || b.type === type) &&
          (!kw || b.name.includes(kw) || b.address.includes(kw) || b.code.includes(kw)),
      );
  }, [boards, q, area, type, onlyFree, periodValid, from, to, idx]);

  const summary = useMemo(() => {
    const s = { total: 0, contract: 0, hold: 0, free: 0 };
    filtered.forEach(({ board, faces }) =>
      faces.forEach((f) => {
        s.total++;
        const c = cellAt(idx, board, f, cur);
        if (c.kind === "contract") s.contract++;
        else if (c.kind === "hold") s.hold++;
        else if (c.kind === "free") s.free++;
      }),
    );
    return s;
  }, [filtered, idx, cur]);

  const segments = (b: Board, f: Face): Seg[] => {
    const out: Seg[] = [];
    months.forEach((m, i) => {
      const cell = cellAt(idx, b, f, m);
      const key =
        cell.kind === "contract" ? cell.contract.id : cell.kind === "hold" ? cell.hold.id : cell.kind === "pre" ? "pre" : `free-${m}`;
      const last = out.at(-1);
      if (last && last.key === key) last.span++;
      else out.push({ cell, start: i, span: 1, key });
    });
    return out;
  };

  const inPeriod = (m: string) => periodValid && m >= from && m <= to;
  const gridCols = `minmax(170px, 240px) repeat(${COLS}, minmax(62px, 1fr))`;

  return (
    <>
      <PageHeader
        eyebrow="Availability"
        title="看板の空きを探す"
        description="お客様が希望する時期に空いている看板(広告面)を探して、仮押さえ(一時的な確保)ができます。"
        guide={[
          "「エリア」「掲載を始めたい月」「掲載する期間」を選びます。",
          "条件に合う空き面が一覧で表示されます。料金も確認できます。",
          "「この面を仮押さえする」を押し、商談を選ぶと、他の担当者に取られないよう確保されます。",
        ]}
      />

      {deal && (
        <div className="mb-5 flex flex-col gap-3 rounded-lg border border-navy-200 bg-navy-50 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[15px] text-navy-900">
            <span className="mr-2 text-[12px] tracking-[0.15em] text-navy-500">仮押さえ先を選択中</span>
            <span className="font-semibold">{cname(deal.customerId)}</span> / {deal.title}
            <span className="ml-2 text-ink-500">(希望 {deal.months}ヶ月・月額 {yen(deal.monthlyBudget)})</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => nav(`/deals/${deal.id}`)}>
              商談に戻る
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setParams({})} aria-label="選択を解除">
              <X size={13} />
            </Button>
          </div>
        </div>
      )}

      <div className="mb-5 border-b border-ink-200">
        <Tabs<"find" | "calendar">
          value={mode}
          onChange={setMode}
          items={[
            { value: "find", label: "条件を選んで探す" },
            { value: "calendar", label: "カレンダーで見る" },
          ]}
        />
      </div>

      {mode === "find" ? (
        <FindVacancy
          idx={idx}
          boards={boards}
          defaultMonths={deal?.months}
          onHold={(board, face, month, end) => setHoldTarget({ board, face, month, end })}
        />
      ) : (
      <>
      {/* 検索 */}
      <Card className="mb-5 p-4">
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto]">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" />
            <input className={inputCls + " pl-8!"} placeholder="設置場所・住所・看板コード" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className={inputCls} value={area} onChange={(e) => setArea(e.target.value)}>
            <option value="">全エリア</option>
            {AREAS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
          <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">全種別</option>
            {BOARD_TYPES.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
          <div className="hidden md:block" />
        </div>
        <div className="mt-3 flex flex-col gap-3 border-t border-ink-100 pt-3 md:flex-row md:items-center">
          <span className="text-[13px] font-medium text-ink-600">掲載希望期間</span>
          <div className="flex items-center gap-2">
            <select className={inputCls + " w-36!"} value={from} onChange={(e) => setFrom(e.target.value)}>
              <option value="">開始月</option>
              {monthRange(cur, 24).map((m) => (
                <option key={m} value={m}>
                  {fmtMonth(m)}
                </option>
              ))}
            </select>
            <span className="text-ink-400">〜</span>
            <select className={inputCls + " w-36!"} value={to} onChange={(e) => setTo(e.target.value)}>
              <option value="">終了月</option>
              {monthRange(cur, 36).map((m) => (
                <option key={m} value={m}>
                  {fmtMonth(m)}
                </option>
              ))}
            </select>
          </div>
          <label className={"flex items-center gap-2 text-[14px] " + (periodValid ? "text-navy-900" : "text-ink-400")}>
            <input
              type="checkbox"
              disabled={!periodValid}
              className="h-4 w-4 accent-[oklch(29.5%_0.047_262)]"
              checked={onlyFree && periodValid}
              onChange={(e) => setOnlyFree(e.target.checked)}
            />
            期間中すべて空いている面のみ表示
          </label>
          {(q || area || type || from || to) && (
            <button
              className="text-[13px] text-ink-500 underline-offset-2 hover:text-navy-900 hover:underline md:ml-auto"
              onClick={() => {
                setQ("");
                setArea("");
                setType("");
                setFrom("");
                setTo("");
                setOnlyFree(false);
              }}
            >
              条件をクリア
            </button>
          )}
        </div>
      </Card>

      {/* サマリー + 凡例 */}
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[14px] text-ink-500">
          <span>
            表示 <b className="tnum text-[17px] font-semibold text-navy-900">{num(summary.total)}</b> 面
          </span>
          <span>
            今月 掲載中 <b className="tnum font-semibold text-navy-900">{summary.contract}</b>
          </span>
          <span>
            仮押さえ <b className="tnum font-semibold text-warn-700">{summary.hold}</b>
          </span>
          <span>
            空き <b className="tnum font-semibold text-navy-900">{summary.free}</b>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[12.5px] text-ink-500">
          <Legend className="bg-navy-900" label="契約済" />
          <Legend className="bg-navy-400" label="契約済(管理部確認中)" />
          <Legend className="hatch-hold border border-warn-300" label="仮押さえ" />
          <Legend className="border border-ink-300 bg-white" label="空き" />
          <Legend className="hatch-pre border border-ink-200" label="設置前" />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-200 px-4 py-2.5">
          <Button variant="ghost" size="sm" disabled={offset <= -6} onClick={() => setOffset((o) => o - 3)}>
            <ChevronLeft size={14} />
            前へ
          </Button>
          <div className="tnum text-[14px] font-medium text-navy-900">
            {fmtMonth(months[0])} 〜 {fmtMonth(months.at(-1)!)}
          </div>
          <Button variant="ghost" size="sm" disabled={offset >= 18} onClick={() => setOffset((o) => o + 3)}>
            次へ
            <ChevronRight size={14} />
          </Button>
        </div>
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-9" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<SearchX size={20} />} title="該当する広告面がありません" description="エリア・種別・期間の条件を変更してください。" />
        ) : (
          <div className="thin-scroll max-h-[68vh] overflow-auto">
            <div className="grid min-w-[980px]" style={{ gridTemplateColumns: gridCols }}>
              {/* ヘッダー */}
              <div className="sticky top-0 left-0 z-30 border-r border-b border-ink-200 bg-ink-50 px-4 py-2 text-[12.5px] text-ink-500">
                看板 / 広告面
              </div>
              {months.map((m) => (
                <div
                  key={m}
                  className={
                    "sticky top-0 z-20 border-b border-l border-ink-200 px-1 py-2 text-center text-[12.5px] " +
                    (inPeriod(m) ? "bg-navy-100 font-semibold text-navy-900" : m === cur ? "bg-ink-50 font-semibold text-navy-900" : "bg-ink-50 text-ink-500")
                  }
                >
                  {m.endsWith("-01") || m === months[0] ? <span className="block text-[11.5px] text-ink-400">{m.slice(0, 4)}</span> : <span className="block text-[11.5px] text-transparent">.</span>}
                  {Number(m.slice(5))}月
                </div>
              ))}

              {filtered.map(({ board: b, faces }) => (
                <Fragment key={b.id}>
                  {/* 看板行 */}
                  <div className="sticky left-0 z-10 border-r border-b border-ink-200 bg-white px-4 pt-3 pb-1.5" style={{ gridColumn: "1 / 2" }}>
                    <Link to={`/boards/${b.id}`} className="block truncate text-[14px] font-semibold text-navy-900 hover:underline">
                      {b.name}
                    </Link>
                    <div className="flex items-center gap-1.5 truncate text-[12px] text-ink-400">
                      <span className="tnum">{b.code}</span>・{b.area}・{b.type}
                      {b.lighting && <Lightbulb size={10} className="shrink-0" />}
                    </div>
                  </div>
                  <div className="border-b border-ink-200 bg-white" style={{ gridColumn: `2 / span ${COLS}` }} />
                  {faces.map((f) => (
                    <Fragment key={f.id}>
                      <div className="sticky left-0 z-10 flex items-center justify-between gap-2 border-r border-b border-ink-100 bg-white py-1.5 pr-3 pl-6">
                        <div className="min-w-0">
                          <div className="text-[13px] text-ink-800">
                            {f.label} <span className="text-[12px] text-ink-400">{f.direction}</span>
                          </div>
                        </div>
                        <span className="tnum shrink-0 text-[12px] text-ink-400">{(f.price / 10000).toFixed(1)}万</span>
                      </div>
                      <div className="relative grid border-b border-ink-100" style={{ gridColumn: `2 / span ${COLS}`, gridTemplateColumns: "subgrid" }}>
                        {months.map((m, i) => (
                          <div key={m} className={"border-l border-ink-100 " + (inPeriod(m) ? "bg-navy-50" : "")} style={{ gridColumn: i + 1, gridRow: 1 }} />
                        ))}
                        {segments(b, f).map((s) => (
                          <SegView
                            key={s.key + s.start}
                            seg={s}
                            months={months}
                            label={
                              s.cell.kind === "contract"
                                ? cname(s.cell.contract.customerId)
                                : s.cell.kind === "hold"
                                  ? `仮 ${cname(deals.find((d) => d.id === (s.cell as { hold: Hold }).hold.dealId)?.customerId ?? "")}`
                                  : ""
                            }
                            pending={s.cell.kind === "contract" && (handoverOf(handovers, s.cell.contract.id)?.status ?? "受領済") !== "受領済"}
                            onFree={(m) => setHoldTarget({ board: b, face: f, month: m })}
                            onContract={(id) => nav(`/contracts?id=${id}`)}
                            onHold={setHoldInfo}
                          />
                        ))}
                      </div>
                    </Fragment>
                  ))}
                </Fragment>
              ))}
            </div>
          </div>
        )}
      </Card>
      </>
      )}

      <HoldModal
        open={!!holdTarget}
        onClose={() => setHoldTarget(null)}
        board={holdTarget?.board}
        face={holdTarget?.face}
        startMonth={holdTarget?.month}
        endMonth={holdTarget?.end}
        dealId={dealId}
      />
      <HoldInfoModal hold={holdInfo} onClose={() => setHoldInfo(null)} />
    </>
  );
}

function SegView({
  seg,
  months,
  label,
  pending,
  onFree,
  onContract,
  onHold,
}: {
  seg: Seg;
  months: string[];
  label: string;
  pending: boolean;
  onFree: (m: string) => void;
  onContract: (id: string) => void;
  onHold: (h: Hold) => void;
}) {
  const style = { gridColumn: `${seg.start + 1} / span ${seg.span}`, gridRow: 1 };
  const c = seg.cell;
  if (c.kind === "free") {
    const m = months[seg.start];
    return (
      <button
        style={style}
        onClick={() => onFree(m)}
        title={`${fmtMonth(m)} 空き — クリックで仮押さえ`}
        className="group relative z-[1] m-[3px] flex h-8 items-center justify-center rounded-[4px] border border-dashed border-transparent text-[12px] text-transparent transition hover:border-navy-400 hover:bg-white hover:text-navy-700"
      >
        <Plus size={12} />
      </button>
    );
  }
  if (c.kind === "pre") {
    return <div style={style} className="hatch-pre z-[1] m-[3px] h-8 rounded-[4px] border border-ink-200" title="看板設置前" />;
  }
  if (c.kind === "hold") {
    return (
      <button
        style={style}
        onClick={() => onHold(c.hold)}
        title={`仮押さえ: ${label.replace(/^仮 /, "")}(期限 ${fmtDate(c.hold.expiresAt)})`}
        className="hatch-hold z-[1] m-[3px] h-8 truncate rounded-[4px] border border-warn-300 px-2 text-left text-[12px] font-medium text-warn-700 transition hover:border-warn-500"
      >
        {label}
      </button>
    );
  }
  return (
    <button
      style={style}
      onClick={() => onContract(c.contract.id)}
      title={`${label} ${fmtPeriod(c.contract.startMonth, c.contract.endMonth)}${pending ? "(管理部確認中)" : ""}`}
      className={
        "z-[1] m-[3px] h-8 truncate rounded-[4px] px-2 text-left text-[12px] text-white transition hover:brightness-110 " +
        (pending ? "bg-navy-400" : "bg-navy-900")
      }
    >
      {label}
    </button>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={"inline-block h-3 w-5 rounded-[3px] " + className} />
      {label}
    </span>
  );
}

function HoldInfoModal({ hold, onClose }: { hold: Hold | null; onClose: () => void }) {
  const deal = useStore((s) => s.deals.find((d) => d.id === hold?.dealId));
  const customer = useStore((s) => s.customers.find((c) => c.id === deal?.customerId));
  const nav = useNavigate();
  return (
    <Modal
      open={!!hold}
      onClose={onClose}
      title="仮押さえ中の枠"
      width={440}
      footer={
        deal && (
          <Button
            onClick={() => {
              onClose();
              nav(`/deals/${deal.id}`);
            }}
          >
            商談を開く
          </Button>
        )
      }
    >
      {hold && (
        <DL
          items={[
            ["顧客", customer?.company ?? "—"],
            ["商談", deal?.title ?? "—"],
            ["担当", staffName(hold.repId)],
            ["期間", fmtPeriod(hold.startMonth, hold.endMonth)],
            ["期限", <span className="tnum">{fmtDate(hold.expiresAt)}</span>],
          ]}
        />
      )}
    </Modal>
  );
}

// ---------------- 条件を選んで探す(かんたん検索) ----------------
function FindVacancy({
  idx,
  boards,
  defaultMonths,
  onHold,
}: {
  idx: FaceIndex;
  boards: Board[];
  defaultMonths?: number;
  onHold: (b: Board, f: Face, start: string, end: string) => void;
}) {
  const cur = thisMonth();
  const [area, setArea] = useState("");
  const [type, setType] = useState("");
  const [start, setStart] = useState(addMonthKey(cur, 1));
  const [months, setMonths] = useState(String(defaultMonths && [3, 6, 12, 24].includes(defaultMonths) ? defaultMonths : 12));
  const [order, setOrder] = useState<"price" | "traffic">("price");
  const [shown, setShown] = useState(10);
  const end = addMonthKey(start, Number(months) - 1);

  const results = useMemo(() => {
    const list: { board: Board; face: Face }[] = [];
    boards.forEach((b) => {
      if ((area && b.area !== area) || (type && b.type !== type)) return;
      b.faces.forEach((f) => {
        if (isFree(idx, b, f, start, end)) list.push({ board: b, face: f });
      });
    });
    return list.sort((a, b) => (order === "price" ? a.face.price - b.face.price : b.board.traffic - a.board.traffic));
  }, [boards, idx, area, type, start, end, order]);

  // 0件のとき、開始月をずらせば空きがあるかを提案する
  const suggestion = useMemo(() => {
    if (results.length > 0) return null;
    for (let i = 1; i <= 12; i++) {
      const s2 = addMonthKey(start, i);
      const e2 = addMonthKey(s2, Number(months) - 1);
      const n = boards.reduce(
        (sum, b) =>
          (area && b.area !== area) || (type && b.type !== type) ? sum : sum + b.faces.filter((f) => isFree(idx, b, f, s2, e2)).length,
        0,
      );
      if (n > 0) return { start: s2, count: n };
    }
    return null;
  }, [results.length, boards, idx, area, type, start, months]);

  return (
    <>
      <Card className="mb-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="1. エリア">
            <select className={inputCls} value={area} onChange={(e) => { setArea(e.target.value); setShown(10); }}>
              <option value="">指定しない(すべて)</option>
              {AREAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>
          <Field label="2. 看板の種類">
            <select className={inputCls} value={type} onChange={(e) => { setType(e.target.value); setShown(10); }}>
              <option value="">指定しない(すべて)</option>
              {BOARD_TYPES.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>
          <Field label="3. 掲載を始めたい月">
            <select className={inputCls} value={start} onChange={(e) => { setStart(e.target.value); setShown(10); }}>
              {monthRange(cur, 24).map((m) => (
                <option key={m} value={m}>
                  {fmtMonth(m)}から
                </option>
              ))}
            </select>
          </Field>
          <Field label="4. 掲載する期間">
            <select className={inputCls} value={months} onChange={(e) => { setMonths(e.target.value); setShown(10); }}>
              {[3, 6, 12, 24].map((m) => (
                <option key={m} value={m}>
                  {m}ヶ月間
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[15px] text-ink-700">
          <span className="tnum">{fmtPeriod(start, end)}</span> に空いている面:{" "}
          <b className="tnum text-[20px] font-semibold text-navy-900">{results.length}</b> 面
        </div>
        <label className="flex items-center gap-2 text-[14px] whitespace-nowrap text-ink-600">
          並び順
          <select className={inputCls + " w-44!"} value={order} onChange={(e) => setOrder(e.target.value as "price" | "traffic")}>
            <option value="price">料金の安い順</option>
            <option value="traffic">交通量の多い順</option>
          </select>
        </label>
      </div>

      {results.length === 0 ? (
        <Card>
          <EmptyState
            icon={<SearchX size={20} />}
            title="条件に合う空き面がありません"
            description={
              suggestion
                ? `${fmtMonth(suggestion.start)}から始めれば、${suggestion.count}面の空きがあります。`
                : "エリアを「指定しない」にするか、掲載する期間を短くしてみてください。"
            }
            action={
              suggestion && (
                <Button onClick={() => setStart(suggestion.start)}>{fmtMonth(suggestion.start)}からで探す</Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {results.slice(0, shown).map(({ board: b, face: f }) => (
            <Card key={f.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-ok-50 px-2 py-0.5 text-[13px] font-medium text-ok-700 ring-1 ring-ok-600/25 ring-inset">空いています</span>
                  <Link to={`/boards/${b.id}`} className="text-[17px] font-semibold text-navy-900 hover:underline">
                    {b.name} {f.label}
                  </Link>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-ink-500">
                  <span>{b.area}</span>
                  <span>{b.type}</span>
                  <span>{f.direction}</span>
                  <span>{b.size}</span>
                  <span className="tnum">交通量 {num(b.traffic)}/日</span>
                  {b.lighting && (
                    <span className="inline-flex items-center gap-1">
                      <Lightbulb size={13} />
                      夜間照明あり
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0 md:text-right">
                <div className="tnum text-[17px] font-semibold text-navy-900">{yen(f.price)}<span className="text-[13px] font-normal text-ink-500"> /月</span></div>
                <div className="tnum text-[13px] text-ink-500">
                  {months}ヶ月の合計 {yen(f.price * Number(months))}
                  <Help label="定価" text="値引き前の料金です。契約金額は成約登録のときに入力できます。" />
                </div>
              </div>
              <Button className="shrink-0" onClick={() => onHold(b, f, start, end)}>
                この面を仮押さえする
              </Button>
            </Card>
          ))}
          {results.length > shown && (
            <div className="pt-2 text-center">
              <Button variant="outline" onClick={() => setShown((n) => n + 10)}>
                さらに表示する(残り {results.length - shown} 面)
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
