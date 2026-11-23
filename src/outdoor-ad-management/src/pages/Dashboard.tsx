import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChevronRight, Clock } from "lucide-react";
import { useStore } from "../store";
import { ORG, STAFF } from "../data/seed";
import { useLoad } from "../lib/useLoad";
import { fmtDateTime, thisMonth, yen } from "../lib/format";
import { DEFAULT_PLAN, forecast12, repsIn, scopeKey, signedYen, snapshot, threeMonths, type Scope } from "../lib/report";
import { Card, CardHeader, Help, PageHeader, Skeleton, tableHeadCls, thCls } from "../components/ui";
import { QTag } from "../components/tags";

const C_NAVY = "#22314A";
const C_MID = "#6F7F9C";
const C_LIGHT = "#B7C1D3";
const C_OK = "#3E7A63";
const C_BAD = "#B5615A";
const GRID = "#E6E8EC";
const AXIS = "#8A90A0";
const manY = (v: number) => `${(v / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 1 })}万`;
const ALL: Scope = { kind: "all" };

export default function Dashboard() {
  const loading = useLoad(650);
  const nav = useNavigate();
  const orders = useStore((s) => s.orders);
  const deals = useStore((s) => s.deals);
  const cur = thisMonth();

  const d = useMemo(() => {
    const snap = snapshot(orders, deals, ALL, cur);
    const cols = threeMonths(orders, deals, ALL, DEFAULT_PLAN);
    const areas = ORG.map((a) => {
      const s: Scope = { kind: "area", name: a.area };
      return { s, name: a.area, snap: snapshot(orders, deals, s, cur), cols: threeMonths(orders, deals, s, DEFAULT_PLAN) };
    });
    const fc = forecast12(orders, deals, ALL).map((r) => ({ ...r, label: `${Number(r.month.slice(5))}月` }));
    return { snap, cols, areas, fc };
  }, [orders, deals, cur]);
  const lastSync = orders.reduce((m, o) => (o.syncedAt && o.syncedAt > m ? o.syncedAt : m), "");
  const c0 = d.cols[0];
  const areaChart = d.areas.map((a) => ({
    name: a.name.replace("エリア", ""),
    m0: a.cols[0].netPlan,
    m1: a.cols[1].netPlan,
    m2: a.cols[2].netPlan,
  }));
  const monthName = (i: number) => `${Number(d.cols[i].month.slice(5))}月`;
  const COLORS = [C_NAVY, C_MID, C_LIGHT];

  return (
    <>
      <PageHeader
        eyebrow="Management"
        title="経営ダッシュボード"
        description="部長・社長向けに、営業部全体とエリアごとの新規獲得・設置・解約・純増減を一覧します。数字は営業の入力と工事指示システムの企画から自動で集計します。"
      />
      <div className="mb-5 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-ink-500">
        <span className="inline-flex items-center gap-1">
          <Clock size={12} />
          集計基準 <span className="tnum text-ink-800">{format(new Date(), "yyyy/MM/dd HH:mm")}</span>
        </span>
        <span>
          工事指示システム 最終連携 <span className="tnum text-ink-800">{lastSync ? fmtDateTime(lastSync) : "—"}</span>
        </span>
        <span>
          対象: {ORG.length}エリア・{ORG.flatMap((a) => a.offices).length}営業所・{STAFF.length}名(デモのサンプル)
        </span>
      </div>

      {/* KPI */}
      <div data-tour="kpi" className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-ink-200 bg-ink-200 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi loading={loading} label="今月の新規受注" help="今月、受注日が入った案件の件数と、広告料(月額・税抜)の合計です。" value={`${d.snap.ordered.agg.count}`} unit="件" sub={`広告料 ${yen(d.snap.ordered.agg.ad)}/月`} />
        <Kpi loading={loading} label="設置 実績" help="今月、設置日(実績)が入った案件の広告料です。純増減の増える側です。" value={manY(c0.installActual.amount ?? 0)} unit="円" sub={`${c0.installActual.count}件`} />
        <Kpi loading={loading} label="解約 実績" help="今月、解約日(実績)が入った解約の広告料です。純増減の減る側です。" value={manY(c0.cancelActual.amount ?? 0)} unit="円" sub={`${c0.cancelActual.count}件`} />
        <Kpi loading={loading} label="純増減 実績" help="設置実績 − 解約実績。今日までの途中の数字です。" value={manSigned(c0.netActual ?? 0)} unit="円" sub="今月(今日まで)" tone={(c0.netActual ?? 0) >= 0 ? "ok" : "bad"} />
        <Kpi loading={loading} label="純増減 予定" help="設置予定 − 解約予定。今月の実績に、月末までの残りの予定を足した見通しです。" value={manSigned(c0.netPlan)} unit="円" sub="今月の月全体の見通し" tone={c0.netPlan >= 0 ? "ok" : "bad"} />
        <Kpi loading={loading} label="受注残" help="受注済みで、まだ設置していない案件です。これから設置広告料になります。" value={`${d.snap.backlog.agg.count}`} unit="件" sub={`広告料 ${yen(d.snap.backlog.agg.ad)}/月`} />
      </div>

      {/* エリア別 */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader title="エリア別の状況(今月・広告料は月額・税抜)" sub="行を押すと、営業所別 → 担当者別の内訳に進みます" right={<QTag id="Q07" />} />
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[900px] text-[14.5px]">
            <thead className={tableHeadCls}>
              <tr>
                <th className={thCls}>エリア</th>
                <th className={thCls + " text-right"}>新規受注</th>
                <th className={thCls + " text-right"}>設置 実績</th>
                <th className={thCls + " text-right"}>解約 実績</th>
                <th className={thCls + " text-right"}>純増減 実績</th>
                <th className={thCls + " text-right"}>純増減 予定 {monthName(0)}</th>
                <th className={thCls + " text-right"}>{monthName(1)}</th>
                <th className={thCls + " text-right"}>{monthName(2)}</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {d.areas.map((a) => (
                <tr key={a.name} onClick={() => nav(`/report?scope=${encodeURIComponent(scopeKey(a.s))}`)} className="cursor-pointer border-b border-ink-100 transition hover:bg-navy-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-navy-900">{a.name}</div>
                    <div className="text-[12px] text-ink-400">
                      {ORG.find((o) => o.area === a.name)!.offices.join("・")} ・ {repsIn(a.s).length}名
                    </div>
                  </td>
                  <td className="tnum px-4 py-3 text-right">
                    {a.snap.ordered.agg.count}件<span className="block text-[12px] text-ink-500">{yen(a.snap.ordered.agg.ad)}</span>
                  </td>
                  <td className="tnum px-4 py-3 text-right">{yen(a.cols[0].installActual.amount ?? 0)}</td>
                  <td className="tnum px-4 py-3 text-right text-bad-700">−{yen(a.cols[0].cancelActual.amount ?? 0)}</td>
                  <td className="px-4 py-3 text-right">
                    <Net v={a.cols[0].netActual ?? 0} />
                  </td>
                  {a.cols.map((c) => (
                    <td key={c.month} className="px-4 py-3 text-right">
                      <Net v={c.netPlan} />
                    </td>
                  ))}
                  <td className="pr-3 text-ink-300">
                    <ChevronRight size={16} />
                  </td>
                </tr>
              ))}
              <tr className="bg-ink-50">
                <td className="px-4 py-3 font-semibold text-navy-900">営業部 合計</td>
                <td className="tnum px-4 py-3 text-right font-semibold">
                  {d.snap.ordered.agg.count}件<span className="block text-[12px] font-normal text-ink-500">{yen(d.snap.ordered.agg.ad)}</span>
                </td>
                <td className="tnum px-4 py-3 text-right font-semibold">{yen(c0.installActual.amount ?? 0)}</td>
                <td className="tnum px-4 py-3 text-right font-semibold text-bad-700">−{yen(c0.cancelActual.amount ?? 0)}</td>
                <td className="px-4 py-3 text-right">
                  <Net v={c0.netActual ?? 0} />
                </td>
                {d.cols.map((c) => (
                  <td key={c.month} className="px-4 py-3 text-right">
                    <Net v={c.netPlan} />
                  </td>
                ))}
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Card>
          <CardHeader title="エリア別 純増減の予定" sub={`${monthName(0)}・${monthName(1)}・${monthName(2)}(設置予定 − 解約予定)`} />
          <div className="h-[280px] px-2 pt-4 pb-2">
            {loading ? (
              <Skeleton className="mx-4 h-[250px]" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={areaChart} barGap={3} barCategoryGap="24%">
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: AXIS }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false} width={48} tickFormatter={manY} />
                  <ReferenceLine y={0} stroke="#C9CED8" />
                  <Tooltip content={<Tip names={{ m0: monthName(0), m1: monthName(1), m2: monthName(2) }} signed />} cursor={{ fill: "rgba(34,49,74,0.05)" }} />
                  {(["m0", "m1", "m2"] as const).map((k, i) => (
                    <Bar key={k} dataKey={k} fill={COLORS[i]} radius={[3, 3, 0, 0]} animationDuration={500}>
                      {areaChart.map((r) => (
                        <Cell key={r.name} fill={r[k] < 0 ? C_BAD : COLORS[i]} />
                      ))}
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex flex-wrap gap-4 px-5 pb-4 text-[12.5px] text-ink-500">
            {[0, 1, 2].map((i) => (
              <Legend key={i} color={COLORS[i]} label={monthName(i)} />
            ))}
            <Legend color={C_BAD} label="純減" />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="約1年先までの広告料の見通し(月額)"
            sub="確定(設置済・受注残)と見込みを分けて表示"
            right={
              <span className="flex items-center gap-1.5">
                <Help label="1年先の見通し" text="「1年先の契約広告料」が、今後受注する広告料・設置予定の広告料・契約継続中の広告料のどれを指すかは、まだ決まっていません。ここでは3つを分けて積み上げています。" />
                <QTag id="Q14" />
              </span>
            }
          />
          <div className="h-[280px] px-2 pt-4 pb-2">
            {loading ? (
              <Skeleton className="mx-4 h-[250px]" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d.fc} barCategoryGap="22%">
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false} width={52} tickFormatter={manY} />
                  <Tooltip content={<Tip names={{ running: "契約継続中(設置済)", backlog: "受注残の設置予定", prospect: "見込み(未受注)" }} total />} cursor={{ fill: "rgba(34,49,74,0.05)" }} />
                  <Bar dataKey="running" stackId="a" fill={C_NAVY} animationDuration={500} />
                  <Bar dataKey="backlog" stackId="a" fill={C_OK} animationDuration={500} />
                  <Bar dataKey="prospect" stackId="a" fill={C_LIGHT} radius={[3, 3, 0, 0]} animationDuration={500} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex flex-wrap gap-4 px-5 pb-4 text-[12.5px] text-ink-500">
            <Legend color={C_NAVY} label="契約継続中(設置済・解約予定を差し引き)" />
            <Legend color={C_OK} label="受注残の設置予定(確定)" />
            <Legend color={C_LIGHT} label="見込み(受注予定日の翌月に設置と仮定)" />
          </div>
        </Card>
      </div>
      <p className="text-[12px] leading-relaxed text-ink-400">
        KGI・KPIの定義・目標値・計上時点は別途決めます。順位・累計・12ヶ月の推移は次の段階で検討します(Q10)。旧デモの「稼働率・売上見込み」は、今回のご要望に出てこないため外しました。
      </p>
    </>
  );
}

const manSigned = (v: number) => (v > 0 ? "+" : v < 0 ? "−" : "±") + manY(Math.abs(v));

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ background: color }} />
      {label}
    </span>
  );
}

function Net({ v }: { v: number }) {
  return <span className={"tnum font-semibold " + (v > 0 ? "text-ok-700" : v < 0 ? "text-bad-700" : "text-ink-700")}>{signedYen(v)}</span>;
}

function Kpi({ label, help, value, unit, sub, loading, tone }: { label: string; help?: string; value: string; unit: string; sub: string; loading: boolean; tone?: "ok" | "bad" }) {
  return (
    <div className="bg-white px-5 py-4">
      <div className="flex items-center gap-1 text-[13px] text-ink-600">
        {label}
        {help && <Help label={label} text={help} />}
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-20" />
      ) : (
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className={"tnum font-serif text-[26px] leading-none font-semibold " + (tone === "ok" ? "text-ok-700" : tone === "bad" ? "text-bad-700" : "text-navy-900")}>{value}</span>
          <span className="text-[13px] text-ink-500">{unit}</span>
        </div>
      )}
      <div className="tnum mt-2 text-[12px] text-ink-500">{sub}</div>
    </div>
  );
}

type TipProps = { active?: boolean; label?: string; payload?: { dataKey: string; value: number; color?: string; fill?: string }[]; names: Record<string, string>; total?: boolean; signed?: boolean };
function Tip({ active, label, payload, names, total, signed }: TipProps) {
  if (!active || !payload?.length) return null;
  const sum = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div className="rounded-md border border-ink-200 bg-white px-3 py-2 text-[13px] shadow-[0_8px_24px_-8px_rgba(34,49,74,0.25)]">
      <div className="mb-1 font-medium text-navy-900">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-6">
          <span className="inline-flex items-center gap-1.5 text-ink-600">
            <span className="inline-block h-2 w-2 rounded-[2px]" style={{ background: p.fill ?? p.color }} />
            {names[p.dataKey] ?? p.dataKey}
          </span>
          <span className="tnum text-ink-900">{signed ? signedYen(p.value) : yen(p.value)}</span>
        </div>
      ))}
      {total && (
        <div className="mt-1 flex justify-between gap-6 border-t border-ink-100 pt-1">
          <span className="text-ink-600">合計</span>
          <span className="tnum font-medium text-navy-900">{yen(sum)}</span>
        </div>
      )}
    </div>
  );
}
