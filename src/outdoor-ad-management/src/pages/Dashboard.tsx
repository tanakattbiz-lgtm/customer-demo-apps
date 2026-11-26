import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useStore } from "../store";
import { CHANNELS, ORG, STAFF } from "../data/seed";
import { useLoad } from "../lib/useLoad";
import { addMonthKey, fmtDate, fmtDateTime, fmtMonth, thisMonth, yen } from "../lib/format";
import { baseDateOf, byChannel, forecast12, monthCols, repsIn, scopeKey, signedYen, snapshot, type Scope } from "../lib/report";
import { Button, Card, CardHeader, Help, PageHeader, Skeleton, inputCls, tableHeadCls, thCls } from "../components/ui";
import { QTag } from "../components/tags";
import { DrillDrawer, ThreeMonthTable, type Drill } from "./Report";

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
  const [drill, setDrill] = useState<Drill | null>(null);
  const [month, setMonth] = useState(cur);
  const months = Array.from({ length: 13 }, (_, i) => addMonthKey(cur, -i));
  const isCur = month === cur;

  const d = useMemo(() => {
    const snap = snapshot(orders, deals, ALL, month);
    const cols = monthCols(orders, deals, ALL, month);
    const areas = ORG.map((a) => {
      const s: Scope = { kind: "area", name: a.area };
      return { s, name: a.area, snap: snapshot(orders, deals, s, month), cols: monthCols(orders, deals, s, month) };
    });
    const fc = forecast12(orders, deals, ALL).map((r) => ({ ...r, label: `${Number(r.month.slice(5))}月` }));
    const ch = byChannel(orders, deals, ALL, CHANNELS, month);
    return { snap, cols, areas, fc, ch };
  }, [orders, deals, month]);
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
      <Card className="mb-4 flex flex-wrap items-center gap-3 px-4 py-3">
        <span className="text-[13px] font-medium text-ink-600">表示する月</span>
        <Button variant="outline" size="sm" onClick={() => setMonth(addMonthKey(month, -1))} disabled={month <= months[months.length - 1]} aria-label="前の月">
          <ChevronLeft size={14} />
        </Button>
        <select className={inputCls + " w-44!"} value={month} onChange={(e) => setMonth(e.target.value)}>
          {months.map((m) => (
            <option key={m} value={m}>
              {fmtMonth(m)}
              {m === cur ? "(今月)" : ""}
            </option>
          ))}
        </select>
        <Button variant="outline" size="sm" onClick={() => setMonth(addMonthKey(month, 1))} disabled={isCur} aria-label="次の月">
          <ChevronRight size={14} />
        </Button>
        {!isCur && (
          <Button variant="ghost" size="sm" onClick={() => setMonth(cur)}>
            今月に戻る
          </Button>
        )}
        <span className="text-[12.5px] text-ink-500">選んだ月から3か月分を並べます。過去の月は月末で締めた数字です</span>
      </Card>
      <div className="mb-5 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-ink-500">
        <span className="inline-flex items-center gap-1">
          <Clock size={12} />
          集計基準 <span className="tnum text-ink-800">{isCur ? format(new Date(), "yyyy/MM/dd HH:mm") : fmtDate(baseDateOf(month)) + "(月末)"}</span>
        </span>
        <span>
          工事指示システム 最終連携 <span className="tnum text-ink-800">{lastSync ? fmtDateTime(lastSync) : "—"}</span>
        </span>
        <span>
          対象: {ORG.length}エリア・{ORG.flatMap((a) => a.offices).length}営業所・{STAFF.length}名(デモのサンプル)
        </span>
      </div>

      {/* 営業部全体:今月・来月・再来月(横に月を並べる) */}
      <Card data-tour="kpi" className="mb-6 overflow-hidden">
        <CardHeader
          title={`営業部全体 ${fmtMonth(month)}から3か月(広告料・月額・税抜)`}
          sub={`新規契約 ${d.snap.ordered.agg.count}件(${Number(month.slice(5))}月)・未設置案件 ${d.snap.backlog.agg.count}件 ${yen(d.snap.backlog.agg.ad)}/月(${isCur ? "今日" : "月末"}時点)。数字を押すと、もとになった案件が出ます`}
          right={<QTag id="Q14" />}
        />
        {loading ? <Skeleton className="m-5 h-64" /> : <ThreeMonthTable cols={d.cols} onDrill={setDrill} monthLabels />}
      </Card>

      {/* エリア別 */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader title={`エリア別の状況(${fmtMonth(month)}・広告料は月額・税抜)`} sub="行を押すと、営業所別 → 担当者別の内訳に進みます" right={<QTag id="Q07" />} />
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[900px] text-[14.5px]">
            <thead className={tableHeadCls}>
              <tr>
                <th className={thCls}>エリア</th>
                <th className={thCls + " text-right"}>新規契約</th>
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

      {/* 獲得経路ごと */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader title={`獲得経路ごとの集計(営業部全体・${fmtMonth(month)})`} sub="LP・問い合わせ・コールセンターなど、見込案件の登録時に選んだ獲得経路で分けています" right={<QTag id="Q04" />} />
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[640px] text-[14.5px]">
            <thead className={tableHeadCls}>
              <tr>
                <th className={thCls}>獲得経路</th>
                <th className={thCls + " text-right"}>見込案件(今日時点で進行中)</th>
                <th className={thCls + " text-right"}>広告料(月額)</th>
                <th className={thCls + " text-right"}>契約締結({Number(month.slice(5))}月)</th>
                <th className={thCls + " text-right"}>広告料(月額)</th>
              </tr>
            </thead>
            <tbody>
              {d.ch.map((r) => (
                <tr key={r.channel} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-2.5 text-ink-900">{r.channel}</td>
                  <td className="tnum px-4 py-2.5 text-right">{r.prospectCount}件</td>
                  <td className="tnum px-4 py-2.5 text-right text-ink-700">{yen(r.prospectAd)}</td>
                  <td className="tnum px-4 py-2.5 text-right font-medium text-navy-900">{r.orderedCount}件</td>
                  <td className="tnum px-4 py-2.5 text-right">{yen(r.orderedAd)}</td>
                </tr>
              ))}
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
            sub="確定(設置済・未設置案件)と見込案件を分けて表示"
            right={
              <span className="flex items-center gap-1.5">
                <Help label="1年先の見通し" text="「1年先の契約広告料」が、今後契約締結する広告料・設置予定の広告料・契約継続中の広告料のどれを指すかは、まだ決まっていません。ここでは3つを分けて積み上げています。" />
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
                  <Tooltip content={<Tip names={{ running: "契約継続中(設置済)", backlog: "未設置案件の設置予定", prospect: "見込案件(未契約)" }} total />} cursor={{ fill: "rgba(34,49,74,0.05)" }} />
                  <Bar dataKey="running" stackId="a" fill={C_NAVY} animationDuration={500} />
                  <Bar dataKey="backlog" stackId="a" fill={C_OK} animationDuration={500} />
                  <Bar dataKey="prospect" stackId="a" fill={C_LIGHT} radius={[3, 3, 0, 0]} animationDuration={500} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex flex-wrap gap-4 px-5 pb-4 text-[12.5px] text-ink-500">
            <Legend color={C_NAVY} label="契約継続中(設置済・解約予定を差し引き)" />
            <Legend color={C_OK} label="未設置案件の設置予定(確定)" />
            <Legend color={C_LIGHT} label="見込案件(契約締結予定日の翌月に設置と仮定)" />
          </div>
        </Card>
      </div>
      <DrillDrawer drill={drill} onClose={() => setDrill(null)} />
      <p className="text-[12px] leading-relaxed text-ink-400">
        累計広告料・目標と達成率・獲得経路ごとの集計は「営業報告」で見られます。KGI・KPIの定義・目標値・計上時点は別途決めます。順位・12ヶ月の推移は次の段階で検討します(Q10)。旧デモの「稼働率・売上見込み」は、今回のご要望に出てこないため外しました。
      </p>
    </>
  );
}


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
