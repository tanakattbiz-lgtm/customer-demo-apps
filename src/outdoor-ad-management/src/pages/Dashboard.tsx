import { useMemo } from "react";
import { getDate, getDaysInMonth } from "date-fns";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useStore } from "../store";
import { BRANCHES, COMPANY, OPEN_STAGES, STAGE_PROB, companySeries } from "../data/seed";
import { useLoad } from "../lib/useLoad";
import { addMonthKey, num, oku, pct, thisMonth } from "../lib/format";
import { Card, CardHeader, PageHeader, Skeleton, tableHeadCls, thCls } from "../components/ui";

const C_NAVY = "#22314A";
const C_NAVY_LIGHT = "#A9B5CA";
const C_ROSE = "#B9776F";
const GRID = "#E6E8EC";
const AXIS = "#8A90A0";

// 全社の進行中パイプライン(ベース値)
const PIPE_BASE: Record<string, { n: number; amount: number }> = {
  初回接触: { n: 1240, amount: 9.8e8 },
  ヒアリング: { n: 860, amount: 7.1e8 },
  提案: { n: 520, amount: 4.9e8 },
  見積提出: { n: 310, amount: 3.2e8 },
  交渉: { n: 140, amount: 1.6e8 },
};
// 将来月の商談由来の見込み(加重・ベース値)
const FORECAST_BASE = [0.05e8, 0.13e8, 0.2e8, 0.25e8, 0.29e8, 0.31e8];

export default function Dashboard() {
  const loading = useLoad(650);
  const live = useStore((s) => s.live);
  const deals = useStore((s) => s.deals);
  const contracts = useStore((s) => s.contracts);
  const cur = thisMonth();
  const today = new Date();
  const progress = getDate(today) / getDaysInMonth(today);

  const d = useMemo(() => {
    const series = companySeries();
    const L = live.month === cur ? live : { newAd: 0, newAdFaces: 0, cancelAd: 0, cancelFaces: 0, newLand: 0 };
    const now = series[series.length - 1];
    const prev = series[series.length - 2];
    const toDate = (v: number) => Math.round(v * progress);

    // 稼働率
    const occupied = Math.round((COMPANY.totalFaces * now.occupancy) / 100) + L.newAdFaces - L.cancelFaces;
    const occupancy = (occupied / COMPANY.totalFaces) * 100;

    // デモ内で新たに登録した契約(シードのIDは k0001 形式)
    const userContracts = contracts.filter((c) => !/^k\d{4}$/.test(c.id));
    const openDeals = deals.filter((x) => OPEN_STAGES.includes(x.stage));

    const forecast = Array.from({ length: 6 }, (_, i) => {
      const m = addMonthKey(cur, i);
      const confirmedBase = now.revenue * (1 - 0.017 * i);
      const extra = userContracts
        .filter((c) => c.startMonth <= m && (c.cancelMonth ?? c.endMonth) >= m)
        .reduce((s, c) => s + c.monthlyFee, 0);
      const pipe = openDeals
        .filter((x) => x.expectedClose.slice(0, 7) < m)
        .reduce((s, x) => s + (x.monthlyBudget * STAGE_PROB[x.stage]) / 100, 0);
      return {
        month: m,
        label: `${Number(m.slice(5))}月`,
        confirmed: confirmedBase + extra,
        expected: FORECAST_BASE[i] + pipe,
      };
    });

    const trend = series.map((s, i) => {
      const isNow = i === series.length - 1;
      return {
        label: `${Number(s.month.slice(5))}月${isNow ? "(見込)" : ""}`,
        newAd: s.newAd + (isNow ? L.newAd : 0),
        cancelAd: s.cancelAd + (isNow ? L.cancelAd : 0),
        occupancy: Number((isNow ? occupancy : s.occupancy).toFixed(1)),
      };
    });

    const pipeline = OPEN_STAGES.map((st) => {
      const ds = openDeals.filter((x) => x.stage === st);
      const n = PIPE_BASE[st].n + ds.length;
      const amount = PIPE_BASE[st].amount + ds.reduce((s, x) => s + x.monthlyBudget * x.months, 0);
      return { stage: st, n, amount, weighted: (amount * STAGE_PROB[st]) / 100 };
    });

    return {
      newAd: { toDate: toDate(now.newAd) + L.newAd, landing: now.newAd + L.newAd, prev: prev.newAd },
      cancelAd: { toDate: toDate(now.cancelAd) + L.cancelAd, landing: now.cancelAd + L.cancelAd, prev: prev.cancelAd },
      newLand: { toDate: toDate(now.newLand) + L.newLand, landing: now.newLand + L.newLand, prev: prev.newLand },
      occupancy,
      occupied,
      prevOcc: prev.occupancy,
      forecast,
      trend,
      pipeline,
    };
  }, [live, deals, contracts, cur, progress]);

  const net = d.newAd.landing - d.cancelAd.landing;
  const prevNet = d.newAd.prev - d.cancelAd.prev;
  const f6 = d.forecast.reduce((s, x) => s + x.confirmed + x.expected, 0);

  return (
    <>
      <PageHeader
        eyebrow="Management"
        title="経営ダッシュボード"
        description={`全社(営業担当 ${COMPANY.salesReps}名・広告面 約${num(COMPANY.totalFaces)}面)の新規・解約・売上見込み・稼働率を集計しています。当月は本日時点の累計と月末の着地見込みを表示します。`}
      />

      {/* KPI */}
      <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-ink-200 bg-ink-200 lg:grid-cols-6">
        <Kpi loading={loading} label="広告主 新規契約" value={`${d.newAd.toDate}`} unit="件" sub={`着地見込み ${d.newAd.landing}件`} delta={d.newAd.landing - d.newAd.prev} prevLabel="前月比" />
        <Kpi loading={loading} label="広告主 解約" value={`${d.cancelAd.toDate}`} unit="件" sub={`着地見込み ${d.cancelAd.landing}件`} delta={d.cancelAd.landing - d.cancelAd.prev} prevLabel="前月比" inverse />
        <Kpi loading={loading} label="純増(新規 − 解約)" value={`+${net}`} unit="件" sub="当月着地見込み" delta={net - prevNet} prevLabel="前月比" />
        <Kpi loading={loading} label="土地 新規契約" value={`${d.newLand.toDate}`} unit="件" sub={`着地見込み ${d.newLand.landing}件`} delta={d.newLand.landing - d.newLand.prev} prevLabel="前月比" />
        <Kpi loading={loading} label="稼働率" value={d.occupancy.toFixed(1)} unit="%" sub={`${num(d.occupied)} / ${num(COMPANY.totalFaces)}面`} delta={Number((d.occupancy - d.prevOcc).toFixed(1))} prevLabel="前月比" deltaUnit="pt" />
        <Kpi loading={loading} label="売上見込み(今後6ヶ月)" value={(f6 / 1e8).toFixed(1)} unit="億円" sub={`当月 ${oku(d.forecast[0].confirmed + d.forecast[0].expected)}`} />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader
            title="新規契約・解約の推移"
            sub="広告主契約 / 月次件数(直近12ヶ月)"
            right={
              <div className="flex gap-4 text-[11.5px] text-ink-500">
                <LegendDot color={C_NAVY} label="新規" />
                <LegendDot color={C_ROSE} label="解約" />
              </div>
            }
          />
          <div className="h-[280px] px-2 pt-4 pb-2">
            {loading ? (
              <Skeleton className="mx-4 h-[250px]" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d.trend} barGap={2} barCategoryGap="22%">
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false} interval={0} angle={0} height={24} tickFormatter={(v: string) => v.replace("(見込)", "*")} />
                  <YAxis tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip content={<ChartTip unit="件" names={{ newAd: "新規", cancelAd: "解約" }} />} cursor={{ fill: "rgba(34,49,74,0.05)" }} />
                  <Bar animationDuration={500} dataKey="newAd" fill={C_NAVY} radius={[3, 3, 0, 0]} />
                  <Bar animationDuration={500} dataKey="cancelAd" fill={C_ROSE} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="px-5 pb-3 text-[11px] text-ink-400">* 当月は着地見込み</div>
        </Card>

        <Card>
          <CardHeader title="稼働率の推移" sub="全広告面のうち掲載中の割合" />
          <div className="h-[280px] px-2 pt-4 pb-2">
            {loading ? (
              <Skeleton className="mx-4 h-[250px]" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={d.trend}>
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: AXIS }} axisLine={false} tickLine={false} interval={0} tickFormatter={(v: string) => v.replace("(見込)", "")} />
                  <YAxis domain={[80, 88]} tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false} width={36} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<ChartTip unit="%" names={{ occupancy: "稼働率" }} />} cursor={{ stroke: GRID }} />
                  <Line animationDuration={500} type="monotone" dataKey="occupancy" stroke={C_NAVY} strokeWidth={2} dot={{ r: 3, fill: C_NAVY, strokeWidth: 0 }} activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader
            title="売上見込み(今後6ヶ月)"
            sub="契約済の売上 + 進行中商談の加重見込み"
            right={
              <div className="flex gap-4 text-[11.5px] text-ink-500">
                <LegendDot color={C_NAVY} label="契約済" />
                <LegendDot color={C_NAVY_LIGHT} label="商談見込み" />
              </div>
            }
          />
          <div className="h-[260px] px-2 pt-4 pb-3">
            {loading ? (
              <Skeleton className="mx-4 h-[230px]" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d.forecast} barCategoryGap="30%">
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => `${(v / 1e8).toFixed(1)}億`} />
                  <Tooltip content={<ChartTip money names={{ confirmed: "契約済", expected: "商談見込み" }} />} cursor={{ fill: "rgba(34,49,74,0.05)" }} />
                  <Bar animationDuration={500} dataKey="confirmed" stackId="a" fill={C_NAVY} stroke="#fff" strokeWidth={1} />
                  <Bar animationDuration={500} dataKey="expected" stackId="a" fill={C_NAVY_LIGHT} radius={[3, 3, 0, 0]} stroke="#fff" strokeWidth={1} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader title="商談パイプライン" sub="全社・進行中の商談" />
          <table className="w-full text-[12.5px]">
            <thead className={tableHeadCls}>
              <tr>
                <th className={thCls}>ステージ</th>
                <th className={thCls + " text-right"}>件数</th>
                <th className={thCls + " text-right"}>見込金額</th>
                <th className={thCls + " text-right"}>加重</th>
              </tr>
            </thead>
            <tbody>
              {d.pipeline.map((p) => (
                <tr key={p.stage} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-2.5">
                    <div className="text-ink-900">{p.stage}</div>
                    <div className="text-[10.5px] text-ink-400">確度 {STAGE_PROB[p.stage]}%</div>
                  </td>
                  <td className="tnum px-4 py-2.5 text-right">{num(p.n)}</td>
                  <td className="tnum px-4 py-2.5 text-right">{oku(p.amount)}</td>
                  <td className="tnum px-4 py-2.5 text-right font-medium text-navy-900">{oku(p.weighted)}</td>
                </tr>
              ))}
              <tr className="bg-ink-50">
                <td className="px-4 py-2.5 font-semibold text-navy-900">合計</td>
                <td className="tnum px-4 py-2.5 text-right font-semibold">{num(d.pipeline.reduce((s, p) => s + p.n, 0))}</td>
                <td className="tnum px-4 py-2.5 text-right font-semibold">{oku(d.pipeline.reduce((s, p) => s + p.amount, 0))}</td>
                <td className="tnum px-4 py-2.5 text-right font-semibold text-navy-900">{oku(d.pipeline.reduce((s, p) => s + p.weighted, 0))}</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>

      <div>
        <Card className="overflow-hidden">
          <CardHeader title="支店別の状況" sub="新規・解約・土地は当月着地見込み" />
          <div className="thin-scroll overflow-x-auto">
            <table className="w-full min-w-[700px] text-[12.5px]">
              <thead className={tableHeadCls}>
                <tr>
                  <th className={thCls}>支店</th>
                  <th className={thCls + " text-right"}>営業</th>
                  <th className={thCls + " text-right"}>広告面</th>
                  <th className={thCls + " w-44"}>稼働率</th>
                  <th className={thCls + " text-right"}>新規</th>
                  <th className={thCls + " text-right"}>解約</th>
                  <th className={thCls + " text-right"}>純増</th>
                  <th className={thCls + " text-right"}>土地新規</th>
                </tr>
              </thead>
              <tbody>
                {BRANCHES.map((b) => (
                  <tr key={b.branch} className="border-b border-ink-100 last:border-0">
                    <td className="px-4 py-2.5 font-medium text-navy-900">{b.branch}</td>
                    <td className="tnum px-4 py-2.5 text-right text-ink-600">{b.reps}名</td>
                    <td className="tnum px-4 py-2.5 text-right text-ink-600">{num(b.faces)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                          <div className="h-full rounded-full bg-navy-900" style={{ width: `${b.occupancy}%` }} />
                        </div>
                        <span className="tnum w-11 text-right text-ink-800">{pct(b.occupancy)}</span>
                      </div>
                    </td>
                    <td className="tnum px-4 py-2.5 text-right">{b.newAd}</td>
                    <td className="tnum px-4 py-2.5 text-right text-ink-600">{b.cancelAd}</td>
                    <td className="tnum px-4 py-2.5 text-right font-medium text-navy-900">+{b.newAd - b.cancelAd}</td>
                    <td className="tnum px-4 py-2.5 text-right">{b.newLand}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <p className="mt-6 text-[11px] text-ink-400">
        集計期間: {cur.replace("-", "年")}月(本日時点)。このデモで登録した成約・解約・土地契約は当月の数値に反映されます。
      </p>
    </>
  );
}

function Kpi({
  label,
  value,
  unit,
  sub,
  delta,
  prevLabel,
  inverse,
  deltaUnit = "",
  loading,
}: {
  label: string;
  value: string;
  unit: string;
  sub: string;
  delta?: number;
  prevLabel?: string;
  inverse?: boolean;
  deltaUnit?: string;
  loading: boolean;
}) {
  const good = delta === undefined ? null : inverse ? delta <= 0 : delta >= 0;
  return (
    <div className="bg-white px-5 py-4">
      <div className="text-[11.5px] text-ink-500">{label}</div>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-20" />
      ) : (
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="tnum font-serif text-[28px] leading-none font-semibold text-navy-900">{value}</span>
          <span className="text-[12px] text-ink-500">{unit}</span>
        </div>
      )}
      <div className="tnum mt-2 text-[11px] text-ink-500">{sub}</div>
      {delta !== undefined && (
        <div className={"tnum mt-0.5 text-[11px] " + (good ? "text-ok-700" : "text-bad-600")}>
          {prevLabel} {delta >= 0 ? "+" : ""}
          {delta}
          {deltaUnit || unit.replace("億円", "")}
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ background: color }} />
      {label}
    </span>
  );
}

type TipProps = {
  active?: boolean;
  label?: string;
  payload?: { dataKey: string; value: number; color: string; fill?: string; stroke?: string }[];
  unit?: string;
  money?: boolean;
  names: Record<string, string>;
};
function ChartTip({ active, label, payload, unit = "", money, names }: TipProps) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div className="rounded-md border border-ink-200 bg-white px-3 py-2 text-[12px] shadow-[0_8px_24px_-8px_rgba(34,49,74,0.25)]">
      <div className="mb-1 font-medium text-navy-900">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-6">
          <span className="inline-flex items-center gap-1.5 text-ink-600">
            <span className="inline-block h-2 w-2 rounded-[2px]" style={{ background: p.fill ?? p.stroke ?? p.color }} />
            {names[p.dataKey] ?? p.dataKey}
          </span>
          <span className="tnum text-ink-900">{money ? oku(p.value) : `${p.value}${unit}`}</span>
        </div>
      ))}
      {money && payload.length > 1 && (
        <div className="mt-1 flex justify-between gap-6 border-t border-ink-100 pt-1">
          <span className="text-ink-600">合計</span>
          <span className="tnum font-medium text-navy-900">{oku(total)}</span>
        </div>
      )}
    </div>
  );
}
