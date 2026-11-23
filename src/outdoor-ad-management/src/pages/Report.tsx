import { useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { ChevronRight, CircleAlert, Clock, Link2 } from "lucide-react";
import { useStore, staffName } from "../store";
import { ME_ID, OPEN_STAGES, ORG, STAFF, STAGE_LABEL, STAGE_NO, type Stage } from "../data/seed";
import { useLoad } from "../lib/useLoad";
import { addMonthKey, fmtDate, fmtDateTime, fmtMonth, thisMonth, todayISO, yen } from "../lib/format";
import {
  DEFAULT_PLAN,
  baseDateOf,
  childrenOf,
  liveCancels,
  parentOf,
  parseScope,
  ratioPct,
  repsIn,
  scopeKey,
  scopeLabel,
  signedYen,
  snapshot,
  threeMonths,
  type Agg,
  type Line,
  type MonthCol,
  type PlanOptions,
  type Scope,
} from "../lib/report";
import { Card, CardHeader, Drawer, Help, PageHeader, Pill, Segmented, Skeleton, inputCls, tableHeadCls, thCls } from "../components/ui";
import { QTag } from "../components/tags";

type Role = "rep" | "office" | "area" | "all";
const ROLE_ITEMS: { value: Role; label: string }[] = [
  { value: "rep", label: "営業担当者" },
  { value: "office", label: "営業所長" },
  { value: "area", label: "エリア長" },
  { value: "all", label: "部長・社長" },
];
const me = STAFF.find((s) => s.id === ME_ID)!;
const defaultScope = (r: Role): Scope =>
  r === "rep" ? { kind: "rep", id: ME_ID } : r === "office" ? { kind: "office", name: me.branch } : r === "area" ? { kind: "area", name: me.area } : { kind: "all" };

type Drill = { title: string; sub?: string; items: Line["items"] } | { title: string; sub?: string; orders: string[] } | { title: string; sub?: string; deals: string[] };

export default function Report() {
  const loading = useLoad(550);
  const nav = useNavigate();
  const orders = useStore((s) => s.orders);
  const deals = useStore((s) => s.deals);
  const customers = useStore((s) => s.customers);
  const [params, setParams] = useSearchParams();
  const scope: Scope = parseScope(params.get("scope")) ?? defaultScope("rep");
  const role: Role = scope.kind;
  const month = params.get("month") ?? thisMonth();
  const isCurrent = month === thisMonth();
  const [opt, setOpt] = useState<PlanOptions>(DEFAULT_PLAN);
  const [drill, setDrill] = useState<Drill | null>(null);
  const setScope = (s: Scope) => setParams((p) => ({ ...Object.fromEntries(p), scope: scopeKey(s) }));
  const cname = (id: string) => customers.find((c) => c.id === id)?.company ?? "";

  const base = baseDateOf(month);
  const snap = useMemo(() => snapshot(orders, deals, scope, month), [orders, deals, scope, month]);
  const cols = useMemo(() => threeMonths(orders, deals, scope, opt, base), [orders, deals, scope, opt, base]);
  const reps = useMemo(() => new Set(repsIn(scope)), [scope]);
  const waiting = orders.filter((o) => reps.has(o.repId) && !o.kikakuNo);
  const lastSync = orders.reduce((m, o) => (o.syncedAt && o.syncedAt > m ? o.syncedAt : m), "");
  const overdueDeals = deals.filter((d) => reps.has(d.repId) && OPEN_STAGES.includes(d.stage) && d.expectedClose && d.expectedClose < todayISO());
  const children = childrenOf(scope);
  const parent = parentOf(scope);
  const st = scope.kind === "rep" ? STAFF.find((x) => x.id === scope.id) : null;

  // 解約明細(R10): 3ヶ月の範囲の予定・実績
  const cancelRows = useMemo(() => {
    const rows: { orderId: string; customer: string; fee: number; planned: string | null; actual: string | null; partial: boolean; rep: string }[] = [];
    const from = month;
    const to = addMonthKey(month, 2);
    orders
      .filter((o) => reps.has(o.repId))
      .forEach((o) =>
        liveCancels(o).forEach((c) => {
          const d = (c.actualDate && c.actualDate <= base ? c.actualDate : c.plannedDate) ?? "";
          if (d.slice(0, 7) >= from && d.slice(0, 7) <= to)
            rows.push({ orderId: o.id, customer: cname(o.customerId), fee: c.fee, planned: c.plannedDate, actual: c.actualDate && c.actualDate <= base ? c.actualDate : null, partial: c.partial, rep: o.repId });
        }),
      );
    return rows.sort((a, b) => (a.actual ?? a.planned ?? "").localeCompare(b.actual ?? b.planned ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, reps, month, base, customers]);

  const pastMonths = Array.from({ length: 13 }, (_, i) => addMonthKey(thisMonth(), -i));

  return (
    <>
      <PageHeader
        eyebrow="Report"
        title="営業報告"
        description="見込み・受注・設置・解約を、同じ元データから自動で集計します。報告のために数字を書き写す必要はありません。"
        guide={[
          "上の「表示する人」を切り替えると、担当者・営業所・エリア・営業部全体の数字に変わります(本番はログインした人の役職で自動)。",
          "表の数字を押すと、その数字のもとになった案件の一覧が出ます。",
          "「対象月」で過去の月を選ぶと、その月末の状態で受注残などを再現します。",
        ]}
      />

      {/* 表示範囲 */}
      <Card data-tour="report-scope" className="mb-4 px-4 py-3.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex items-center gap-2 text-[13px] font-medium text-ink-600">
            表示する人
            <Help label="表示する人" text="デモ用の切り替えです。本番では、ログインした人の役職と所属で、見られる範囲が自動で決まります。" />
            <QTag id="Q07" />
          </div>
          <Segmented value={role} onChange={(r) => setScope(defaultScope(r))} items={ROLE_ITEMS} />
          {role === "rep" && (
            <select className={inputCls + " w-60!"} value={scope.kind === "rep" ? scope.id : ""} onChange={(e) => setScope({ kind: "rep", id: e.target.value })}>
              {ORG.map((a) =>
                a.offices.map((o) => (
                  <optgroup key={o} label={`${a.area} / ${o}`}>
                    {STAFF.filter((s) => s.branch === o).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </optgroup>
                )),
              )}
            </select>
          )}
          {role === "office" && (
            <select className={inputCls + " w-60!"} value={scope.kind === "office" ? scope.name : ""} onChange={(e) => setScope({ kind: "office", name: e.target.value })}>
              {ORG.map((a) => (
                <optgroup key={a.area} label={a.area}>
                  {a.offices.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}
          {role === "area" && (
            <select className={inputCls + " w-60!"} value={scope.kind === "area" ? scope.name : ""} onChange={(e) => setScope({ kind: "area", name: e.target.value })}>
              {ORG.map((a) => (
                <option key={a.area}>{a.area}</option>
              ))}
            </select>
          )}
          <div className="flex items-center gap-2 lg:ml-auto">
            <span className="text-[13px] font-medium text-ink-600">対象月</span>
            <select className={inputCls + " w-40!"} value={month} onChange={(e) => setParams((p) => ({ ...Object.fromEntries(p), month: e.target.value }))}>
              {pastMonths.map((m) => (
                <option key={m} value={m}>
                  {fmtMonth(m)}
                  {m === thisMonth() ? "(今月)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* 見出しと集計の時点 */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {parent && (
            <button onClick={() => setScope(parent)} className="mb-1 inline-flex items-center gap-1 text-[13px] text-navy-600 hover:underline">
              {scopeLabel(parent)} に戻る
            </button>
          )}
          <h2 className="font-serif text-[22px] font-semibold text-navy-900">{scopeLabel(scope)}</h2>
          <div className="mt-0.5 text-[13.5px] text-ink-500">
            {st ? `${st.area} / ${st.branch} ・ 入社 ${format(new Date(st.hireDate), "yyyy年M月")}` : `${repsIn(scope).length}名`}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-ink-500">
          <span className="inline-flex items-center gap-1">
            <Clock size={12} />
            集計基準 <span className="tnum text-ink-800">{isCurrent ? format(new Date(), "yyyy/MM/dd HH:mm") + "(今)" : fmtDate(base) + "(月末)"}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Link2 size={12} />
            工事指示システム 最終連携 <span className="tnum text-ink-800">{lastSync ? fmtDateTime(lastSync) : "—"}</span>
          </span>
          {waiting.length > 0 && (
            <Link to="/orders?tab=waiting" className="inline-flex items-center gap-1 text-warn-700 hover:underline">
              <CircleAlert size={12} />
              企画と連携待ち {waiting.length}件(集計には含めています)
            </Link>
          )}
        </div>
      </div>

      {/* 3ヶ月 */}
      {isCurrent ? (
        <Card data-tour="report-3m" className="mb-6 overflow-hidden">
          <CardHeader title="今月・来月・再来月の予定と実績(広告料・月額・税抜)" sub="純増減 = 設置広告料 − 解約広告料。予定は予定同士、実績は実績同士で比べます" right={<QTag id="Q14" />} />
          <PlanOptionsBar opt={opt} onChange={setOpt} />
          {loading ? <Skeleton className="m-5 h-64" /> : <ThreeMonthTable cols={cols} onDrill={setDrill} />}
          {!opt.prospectInstall && (
            <div className="border-t border-ink-100 px-5 py-2.5 text-[12.5px] leading-relaxed text-ink-500">
              来月以降の設置予定には、まだ受注していない分は入っていません(受注済みの設置予定だけ)。そのため純増減の予定が小さく出ます。
              見込みも含めた見通しは「設置予定に未受注の見込みも含める」で確認できます。
            </div>
          )}
          {overdueDeals.length > 0 && (
            <div className="border-t border-ink-100 px-5 py-2.5 text-[12.5px] text-warn-700">
              受注予定日を過ぎた見込みが {overdueDeals.length}件あります(受注予定には含めていません)。
              <button className="ml-1 underline" onClick={() => setDrill({ title: "受注予定日を過ぎた見込み", deals: overdueDeals.map((d) => d.id) })}>
                一覧を見る
              </button>
            </div>
          )}
        </Card>
      ) : (
        <Card className="mb-6 px-5 py-4 text-[14px] text-ink-600">
          過去の月を表示しています。今月・来月・再来月の予定と実績は「今月」を選ぶと表示されます。過去の月の予定は、月末の状態を残す仕組みが必要です。 <QTag id="Q09" />
        </Card>
      )}

      {/* 件数・金額 */}
      <Card data-tour="report-snap" className="mb-6 overflow-hidden">
        <CardHeader title={`${fmtMonth(month)}の状況(件数・金額・税抜)`} sub="未入力の金額は0円として足さず、件数を表示します" right={<QTag id="Q05" />} />
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[760px] text-[14.5px]">
            <thead className={tableHeadCls}>
              <tr>
                <th className={thCls}>区分</th>
                <th className={thCls + " text-right"}>件数</th>
                <th className={thCls + " text-right"}>広告料(月額)</th>
                <th className={thCls + " text-right"}>化粧料</th>
                <th className={thCls + " text-right"}>地代(年額)</th>
                <th className={thCls + " text-right"}>
                  地代比率 <Help label="地代比率" text="地代合計 ÷(広告料合計 × 12)。1件ずつの比率の平均ではありません。" />
                </th>
              </tr>
            </thead>
            <tbody>
              {snap.prospects ? (
                <SnapRow label="見込み(進行中)" sub="受注前" a={snap.prospects.agg} onClick={() => setDrill({ title: "見込み(進行中)", deals: snap.prospects!.deals.map((d) => d.id) })} />
              ) : (
                <tr className="border-b border-ink-100">
                  <td className="px-4 py-3 text-ink-900">見込み(進行中)</td>
                  <td colSpan={5} className="px-4 py-3 text-[13px] text-ink-500">
                    過去の月の見込みは、月末の状態を保存して表示します(デモでは省略) <QTag id="Q09" />
                  </td>
                </tr>
              )}
              <SnapRow label="今月受注" sub="受注日がこの月" a={snap.ordered.agg} onClick={() => setDrill({ title: `${fmtMonth(month)}の受注`, orders: snap.ordered.orders.map((o) => o.id) })} />
              <SnapRow label="受注残" sub="受注済で、月末時点で未設置" a={snap.backlog.agg} onClick={() => setDrill({ title: `受注残(${fmtDate(base)}時点)`, orders: snap.backlog.orders.map((o) => o.id) })} />
              <SnapRow label="今月設置" sub="設置日(実績)がこの月" a={snap.installed.agg} onClick={() => setDrill({ title: `${fmtMonth(month)}の設置`, orders: snap.installed.orders.map((o) => o.id) })} />
            </tbody>
          </table>
        </div>
        <div className="border-t border-ink-100 px-5 py-2.5 text-[12.5px] text-ink-500">同じ月に受注して設置した案件は「今月受注」と「今月設置」の両方に出ます。区分同士の合計は足しません。</div>
      </Card>

      {/* 内訳 */}
      {children.length > 0 && (
        <Card data-tour="report-breakdown" className="mb-6 overflow-hidden">
          <CardHeader
            title={scope.kind === "office" ? "担当者別の内訳" : scope.kind === "area" ? "営業所別の内訳" : "エリア別の内訳"}
            sub={isCurrent ? "今月の数字。行を押すと、さらに細かい内訳に進みます" : "行を押すと、さらに細かい内訳に進みます"}
          />
          <Breakdown scopes={children} month={month} opt={opt} onOpen={setScope} />
        </Card>
      )}

      {/* 解約明細 */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader title="解約の明細" sub={`${fmtMonth(month)}〜${fmtMonth(addMonthKey(month, 2))}の解約予定・解約実績`} right={<QTag id="Q13" />} />
        {cancelRows.length === 0 ? (
          <div className="px-5 py-6 text-center text-[14px] text-ink-500">この期間の解約はありません。</div>
        ) : (
          <div className="thin-scroll overflow-x-auto">
            <table className="w-full min-w-[640px] text-[14.5px]">
              <thead className={tableHeadCls}>
                <tr>
                  <th className={thCls}>クライアント名</th>
                  <th className={thCls + " text-right"}>解約広告料(月額)</th>
                  <th className={thCls}>解約予定日</th>
                  <th className={thCls}>解約日(実績)</th>
                  {scope.kind !== "rep" && <th className={thCls}>担当</th>}
                </tr>
              </thead>
              <tbody>
                {cancelRows.map((r, i) => (
                  <tr key={r.orderId + i} onClick={() => nav(`/orders/${r.orderId}`)} className="cursor-pointer border-b border-ink-100 last:border-0 hover:bg-navy-50/50">
                    <td className="px-4 py-2.5 text-navy-900">
                      {r.customer}
                      {r.partial && <Pill tone="warn" className="ml-2">一部解約</Pill>}
                    </td>
                    <td className="tnum px-4 py-2.5 text-right text-bad-700">−{yen(r.fee)}</td>
                    <td className="tnum px-4 py-2.5 text-ink-600">{r.planned ? fmtDate(r.planned) : "—"}</td>
                    <td className="tnum px-4 py-2.5">{r.actual ? fmtDate(r.actual) : <span className="text-ink-400">未到来</span>}</td>
                    {scope.kind !== "rep" && <td className="px-4 py-2.5 text-ink-600">{staffName(r.rep)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className="text-[12px] leading-relaxed text-ink-400">
        金額はすべて税抜。広告料は月額、地代は年額として扱っています(確認中)。順位・累計・12ヶ月の推移、月次の報告事項・気付きは、次の段階で検討します(Q10)。
      </p>

      <DrillDrawer drill={drill} onClose={() => setDrill(null)} />
    </>
  );
}

// ---------------- 予定の数え方(Q12) ----------------
function PlanOptionsBar({ opt, onChange }: { opt: PlanOptions; onChange: (o: PlanOptions) => void }) {
  const toggle = (s: Stage) => onChange({ ...opt, stages: opt.stages.includes(s) ? opt.stages.filter((x) => x !== s) : [...opt.stages, s] });
  return (
    <div className="flex flex-col gap-2.5 border-b border-ink-100 bg-ink-50/60 px-5 py-3 text-[13px] text-ink-600 xl:flex-row xl:items-center xl:gap-5">
      <div className="flex flex-wrap items-center gap-2">
        予定の数え方 <QTag id="Q12" />
        <Segmented
          value={opt.mode}
          onChange={(mode) => onChange({ ...opt, mode })}
          items={[
            { value: "whole", label: "月全体の見通し(実績+残り)" },
            { value: "remaining", label: "残りの予定だけ" },
          ]}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        受注予定に含める段階
        {OPEN_STAGES.map((s) => (
          <label key={s} className="inline-flex min-h-9 items-center gap-1.5 rounded border border-ink-200 bg-white px-2 py-1">
            <input type="checkbox" className="h-4 w-4 accent-[oklch(29.5%_0.047_262)]" checked={opt.stages.includes(s)} onChange={() => toggle(s)} />
            <span title={STAGE_LABEL[s]}>
              {STAGE_NO[s]} {s}
            </span>
          </label>
        ))}
      </div>
      <label className="inline-flex items-center gap-1.5">
        <input type="checkbox" className="h-4 w-4 accent-[oklch(29.5%_0.047_262)]" checked={opt.prospectInstall} onChange={(e) => onChange({ ...opt, prospectInstall: e.target.checked })} />
        設置予定に未受注の見込みも含める
      </label>
    </div>
  );
}

// ---------------- 3ヶ月の表(3ヶ月比較の表示仕様シート) ----------------
function ThreeMonthTable({ cols, onDrill }: { cols: MonthCol[]; onDrill: (d: Drill) => void }) {
  const label = (m: string, i: number) => `${["今月", "来月", "再来月"][i]}(${Number(m.slice(5))}月)`;
  const cell = (l: Line, title: string, neg = false): ReactNode =>
    l.amount === null ? (
      <span className="text-ink-400">未到来</span>
    ) : (
      <button onClick={() => onDrill({ title, items: l.items })} className="group text-right">
        <span className={"tnum block text-[15px] group-hover:underline " + (neg && l.amount > 0 ? "text-bad-700" : "text-ink-900")}>
          {neg && l.amount > 0 ? "−" : ""}
          {yen(l.amount)}
        </span>
        <span className="tnum block text-[12px] text-ink-400">{l.count}件</span>
      </button>
    );
  const net = (v: number | null) =>
    v === null ? <span className="text-ink-400">未到来</span> : <span className={"tnum text-[16px] font-semibold " + (v > 0 ? "text-ok-700" : v < 0 ? "text-bad-700" : "text-ink-700")}>{signedYen(v)}</span>;
  const rows: { k: string; label: string; sub: string; render: (c: MonthCol, i: number) => ReactNode; strong?: boolean; group?: boolean }[] = [
    { k: "op", label: "受注予定", sub: "見込みの受注予定日", render: (c, i) => cell(c.orderPlan, `${label(c.month, i)} 受注予定`) },
    { k: "oa", label: "受注実績", sub: "受注日", render: (c, i) => cell(c.orderActual, `${label(c.month, i)} 受注実績`) },
    { k: "ip", label: "設置予定", sub: "設置予定日", render: (c, i) => cell(c.installPlan, `${label(c.month, i)} 設置予定`), group: true },
    { k: "ia", label: "設置実績", sub: "設置日(実績)", render: (c, i) => cell(c.installActual, `${label(c.month, i)} 設置実績`) },
    { k: "cp", label: "解約予定", sub: "解約予定日", render: (c, i) => cell(c.cancelPlan, `${label(c.month, i)} 解約予定`, true), group: true },
    { k: "ca", label: "解約実績", sub: "解約日(実績)", render: (c, i) => cell(c.cancelActual, `${label(c.month, i)} 解約実績`, true) },
    { k: "np", label: "純増減 予定", sub: "設置予定 − 解約予定", render: (c) => net(c.netPlan), strong: true, group: true },
    { k: "na", label: "純増減 実績", sub: "設置実績 − 解約実績", render: (c) => net(c.netActual), strong: true },
  ];
  return (
    <div className="thin-scroll overflow-x-auto">
      <table className="w-full min-w-[640px] text-[14.5px]">
        <thead className={tableHeadCls}>
          <tr>
            <th className={thCls}>指標</th>
            {cols.map((c, i) => (
              <th key={c.month} className={thCls + " text-right"}>
                {label(c.month, i)}
                {i === 0 && <span className="block text-[11px] font-normal text-ink-400">実績は今日までの途中</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.k} className={(r.group ? "border-t border-ink-200 " : "border-t border-ink-100 ") + (r.strong ? "bg-navy-50/40" : "")}>
              <td className="px-4 py-2.5">
                <div className={r.strong ? "font-semibold text-navy-900" : "text-ink-900"}>{r.label}</div>
                <div className="text-[12px] text-ink-400">{r.sub}</div>
              </td>
              {cols.map((c, i) => (
                <td key={c.month} className="px-4 py-2.5 text-right">
                  {r.render(c, i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SnapRow({ label, sub, a, onClick }: { label: string; sub: string; a: Agg; onClick: () => void }) {
  const mny = (v: number, miss: number) => (
    <>
      <span className="tnum">{yen(v)}</span>
      {miss > 0 && <span className="block text-[11.5px] text-warn-700">未入力 {miss}件</span>}
    </>
  );
  return (
    <tr onClick={onClick} className="cursor-pointer border-b border-ink-100 transition last:border-0 hover:bg-navy-50/50">
      <td className="px-4 py-3">
        <div className="text-ink-900">{label}</div>
        <div className="text-[12px] text-ink-400">{sub}</div>
      </td>
      <td className="tnum px-4 py-3 text-right font-semibold text-navy-900">{a.count}件</td>
      <td className="px-4 py-3 text-right">{mny(a.ad, a.adMissing)}</td>
      <td className="px-4 py-3 text-right text-ink-700">{mny(a.makeup, a.makeupMissing)}</td>
      <td className="px-4 py-3 text-right text-ink-700">{mny(a.rent, a.rentMissing)}</td>
      <td className="tnum px-4 py-3 text-right">{ratioPct(a.ratio)}</td>
    </tr>
  );
}

// ---------------- 内訳(R11) ----------------
function Breakdown({ scopes, month, opt, onOpen }: { scopes: Scope[]; month: string; opt: PlanOptions; onOpen: (s: Scope) => void }) {
  const orders = useStore((s) => s.orders);
  const deals = useStore((s) => s.deals);
  const base = baseDateOf(month);
  const rows = scopes.map((s) => {
    const sn = snapshot(orders, deals, s, month);
    const c = threeMonths(orders, deals, s, opt, base);
    return { s, sn, c };
  });
  const total = (f: (r: (typeof rows)[number]) => number) => rows.reduce((t, r) => t + f(r), 0);
  const nv = (v: number) => <span className={"tnum font-semibold " + (v > 0 ? "text-ok-700" : v < 0 ? "text-bad-700" : "text-ink-700")}>{signedYen(v)}</span>;
  return (
    <div className="thin-scroll overflow-x-auto">
      <table className="w-full min-w-[860px] text-[14.5px]">
        <thead className={tableHeadCls}>
          <tr>
            <th className={thCls}>{scopes[0].kind === "rep" ? "担当者" : scopes[0].kind === "office" ? "営業所" : "エリア"}</th>
            <th className={thCls + " text-right"}>見込み</th>
            <th className={thCls + " text-right"}>受注</th>
            <th className={thCls + " text-right"}>受注残</th>
            <th className={thCls + " text-right"}>設置実績</th>
            <th className={thCls + " text-right"}>解約実績</th>
            <th className={thCls + " text-right"}>純増減 実績</th>
            <th className={thCls + " text-right"}>純増減 予定</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {rows.map(({ s, sn, c }) => (
            <tr key={scopeKey(s)} onClick={() => onOpen(s)} className="cursor-pointer border-b border-ink-100 transition hover:bg-navy-50/50">
              <td className="px-4 py-2.5 font-medium text-navy-900">
                {scopeLabel(s)}
                {s.kind !== "rep" && <span className="ml-1.5 text-[12px] font-normal text-ink-400">{repsIn(s).length}名</span>}
              </td>
              <td className="tnum px-4 py-2.5 text-right text-ink-700">{sn.prospects ? `${sn.prospects.agg.count}件` : "—"}</td>
              <td className="tnum px-4 py-2.5 text-right">
                {sn.ordered.agg.count}件<span className="block text-[12px] text-ink-500">{yen(sn.ordered.agg.ad)}</span>
              </td>
              <td className="tnum px-4 py-2.5 text-right text-ink-700">{sn.backlog.agg.count}件</td>
              <td className="tnum px-4 py-2.5 text-right">{yen(c[0].installActual.amount ?? 0)}</td>
              <td className="tnum px-4 py-2.5 text-right text-bad-700">{(c[0].cancelActual.amount ?? 0) > 0 ? "−" : ""}{yen(c[0].cancelActual.amount ?? 0)}</td>
              <td className="px-4 py-2.5 text-right">{nv(c[0].netActual ?? 0)}</td>
              <td className="px-4 py-2.5 text-right">{nv(c[0].netPlan)}</td>
              <td className="pr-3 text-ink-300">
                <ChevronRight size={16} />
              </td>
            </tr>
          ))}
          <tr className="bg-ink-50">
            <td className="px-4 py-2.5 font-semibold text-navy-900">合計</td>
            <td className="tnum px-4 py-2.5 text-right font-semibold">{rows[0]?.sn.prospects ? `${total((r) => r.sn.prospects!.agg.count)}件` : "—"}</td>
            <td className="tnum px-4 py-2.5 text-right font-semibold">
              {total((r) => r.sn.ordered.agg.count)}件<span className="block text-[12px] font-normal text-ink-500">{yen(total((r) => r.sn.ordered.agg.ad))}</span>
            </td>
            <td className="tnum px-4 py-2.5 text-right font-semibold">{total((r) => r.sn.backlog.agg.count)}件</td>
            <td className="tnum px-4 py-2.5 text-right font-semibold">{yen(total((r) => r.c[0].installActual.amount ?? 0))}</td>
            <td className="tnum px-4 py-2.5 text-right font-semibold text-bad-700">−{yen(total((r) => r.c[0].cancelActual.amount ?? 0))}</td>
            <td className="px-4 py-2.5 text-right">{nv(total((r) => r.c[0].netActual ?? 0))}</td>
            <td className="px-4 py-2.5 text-right">{nv(total((r) => r.c[0].netPlan))}</td>
            <td />
          </tr>
        </tbody>
      </table>
      <div className="px-5 py-2.5 text-[12.5px] text-ink-500">合計は上の「{"今月・来月・再来月"}」の今月の数字と一致します(同じ元データを集計しているため)。</div>
    </div>
  );
}

// ---------------- 明細(数字の元になった案件) ----------------
function DrillDrawer({ drill, onClose }: { drill: Drill | null; onClose: () => void }) {
  const nav = useNavigate();
  const orders = useStore((s) => s.orders);
  const deals = useStore((s) => s.deals);
  const customers = useStore((s) => s.customers);
  const cname = (id: string) => customers.find((c) => c.id === id)?.company ?? "";
  type R = { key: string; to: string; name: string; sub: string; date: string; amount: number | null; note?: string };
  let rows: R[] = [];
  if (drill && "items" in drill)
    rows = drill.items.map((it, i) => {
      const o = it.kind === "order" ? orders.find((x) => x.id === it.id) : undefined;
      const d = it.kind === "deal" ? deals.find((x) => x.id === it.id) : undefined;
      return {
        key: it.id + i,
        to: o ? `/orders/${o.id}` : `/deals/${d?.id}`,
        name: cname((o ?? d)!.customerId),
        sub: `${staffName((o ?? d)!.repId)}${o ? " ・ " + (o.kikakuNo ?? "連携待ち") : " ・ 見込み"}`,
        date: it.date,
        amount: it.amount,
        note: it.note,
      };
    });
  if (drill && "orders" in drill)
    rows = drill.orders.map((id) => {
      const o = orders.find((x) => x.id === id)!;
      return { key: id, to: `/orders/${id}`, name: cname(o.customerId), sub: `${staffName(o.repId)} ・ ${o.kikakuNo ?? "連携待ち"}`, date: o.actualInstallDate ?? o.orderDate, amount: o.adFee };
    });
  if (drill && "deals" in drill)
    rows = drill.deals.map((id) => {
      const d = deals.find((x) => x.id === id)!;
      return { key: id, to: `/deals/${id}`, name: cname(d.customerId), sub: `${staffName(d.repId)} ・ ${STAGE_NO[d.stage]}${d.stage}`, date: d.expectedClose, amount: d.monthlyBudget };
    });
  const known = rows.filter((r) => r.amount !== null);
  const sum = known.reduce((s, r) => s + (r.amount ?? 0), 0);
  return (
    <Drawer open={!!drill} onClose={onClose} title={drill?.title ?? ""} sub={`${rows.length}件 ・ 広告料 ${yen(sum)}/月${rows.length - known.length ? `(未入力 ${rows.length - known.length}件)` : ""}`}>
      {rows.length === 0 ? (
        <div className="px-2 py-10 text-center text-[14px] text-ink-500">該当する案件はありません。</div>
      ) : (
        <div className="divide-y divide-ink-100">
          {rows.map((r) => (
            <button
              key={r.key}
              onClick={() => {
                onClose();
                nav(r.to);
              }}
              className="flex w-full items-center gap-3 px-1 py-3 text-left hover:bg-navy-50/50"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-medium text-navy-900">{r.name}</div>
                <div className="truncate text-[12.5px] text-ink-500">
                  {r.sub}
                  {r.note && <span className="ml-1.5 text-warn-700">{r.note}</span>}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="tnum text-[14.5px] text-ink-900">{r.amount === null ? <span className="text-warn-700">未入力</span> : yen(r.amount)}</div>
                <div className="tnum text-[12px] text-ink-400">{r.date ? fmtDate(r.date) : "日付未定"}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </Drawer>
  );
}

