import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  Activity,
  Cpu,
  Fuel,
  GraduationCap,
  Layers,
  Radio,
  Ruler,
  Satellite,
  Wrench,
} from "lucide-react";
import {
  FLEET_MIX,
  ICT_EFFECT,
  ICT_UTILIZATION,
  LIVE_UNITS,
  MACHINES,
} from "../data/seed";
import { MachineCard } from "../components/MachineCard";
import { Badge, Button, CountUp, Reveal, SectionHeading } from "../components/ui";

const PIE_COLORS = [
  "oklch(82% 0.18 82)",
  "oklch(64% 0.15 236)",
  "oklch(66% 0.15 152)",
  "oklch(74% 0.17 74)",
  "oklch(80% 0.09 232)",
];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid oklch(93% 0.006 90)",
  boxShadow: "0 14px 34px oklch(20% 0.01 100 / 0.1)",
  fontSize: 12,
  fontFamily: "var(--font-sans)",
};

/* ---------- 稼働モニタ(擬似テレマティクス) ---------- */
function LiveMonitor() {
  const [units, setUnits] = useState(LIVE_UNITS);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setUnits((prev) =>
        prev.map((u) =>
          u.status === "待機"
            ? u
            : {
                ...u,
                hours: Math.round((u.hours + 0.1) * 10) / 10,
                fuel: Math.max(4, Math.round(u.fuel - Math.random() * 1.2)),
              },
        ),
      );
      setTick((t) => t + 1);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const working = units.filter((u) => u.status === "稼働中").length;

  return (
    <div className="overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-[var(--shadow-lift)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-ink-200 bg-gradient-to-r from-sea-50 to-white px-6 py-4">
        <span className="relative inline-block h-2.5 w-2.5 text-ok-500">
          <span className="absolute inset-0 rounded-full bg-current" />
          <span className="ping-soft absolute inset-0" />
        </span>
        <p className="text-[13px] font-black text-ink-900">稼働モニタ(リアルタイム)</p>
        <span className="tnum text-[11px] font-bold text-ink-400">
          {working} / {units.length} 台 稼働中
        </span>
        <span className="tnum ml-auto text-[10.5px] font-bold text-ink-300">
          更新 {tick} 回 ・ 3 秒ごと
        </span>
      </div>

      <div className="thin-scroll overflow-x-auto">
        <table className="w-full min-w-[620px] text-left">
          <thead>
            <tr className="border-b border-ink-200 text-[10.5px] font-black tracking-wider text-ink-400">
              <th className="px-6 py-2.5">車両 ID</th>
              <th className="px-3 py-2.5">型式</th>
              <th className="px-3 py-2.5">現場</th>
              <th className="px-3 py-2.5 text-right">本日稼働</th>
              <th className="px-3 py-2.5">燃料</th>
              <th className="px-6 py-2.5 text-right">状態</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {units.map((u) => (
              <tr key={u.id} className="text-[12.5px] transition-colors hover:bg-ink-50">
                <td className="tnum px-6 py-3 font-black text-ink-900">{u.id}</td>
                <td className="tnum px-3 py-3 font-bold text-ink-600">{u.model}</td>
                <td className="px-3 py-3 text-ink-500">{u.site}</td>
                <td className="tnum px-3 py-3 text-right font-bold text-ink-900">
                  {u.hours.toFixed(1)} h
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-200">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          u.fuel < 35 ? "bg-ng-500" : u.fuel < 60 ? "bg-warn-500" : "bg-ok-500"
                        }`}
                        style={{ width: `${u.fuel}%` }}
                      />
                    </div>
                    <span className="tnum text-[11px] font-bold text-ink-500">{u.fuel}%</span>
                  </div>
                </td>
                <td className="px-6 py-3 text-right">
                  <Badge
                    tone={u.status === "稼働中" ? "ok" : u.status === "要給油" ? "warn" : "neutral"}
                  >
                    {u.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="border-t border-ink-200 bg-ink-50 px-6 py-3 text-[10.5px] leading-relaxed text-ink-400">
        ※ 表示はデモ用のサンプルデータです。実際のサービスでは、貸出中の機械の稼働時間・燃料残量・
        位置情報をお客様の管理画面からご確認いただけます。
      </p>
    </div>
  );
}

export default function Ict() {
  const ictMachines = MACHINES.filter((m) => m.ict);

  return (
    <>
      {/* ヒーロー */}
      <section className="relative overflow-hidden border-b border-ink-200 bg-gradient-to-br from-sea-50 via-white to-sun-50">
        <div className="grid-paper absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <Reveal>
            <Badge tone="sea" className="mb-5">
              <Satellite size={12} /> ICT CONSTRUCTION
            </Badge>
            <h1 className="max-w-3xl text-[2.4rem] font-black leading-[1.12] tracking-tight text-ink-900 sm:text-5xl lg:text-[3.6rem]">
              設計データを入れるだけ。
              <br />
              あとは、機械が守ります。
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.9] text-ink-600">
              ICT 建機は、3D 設計データに沿ってバケットや排土板を自動で制御します。丁張りも、
              目視の当たりも要りません。私たちは機械を貸すだけでなく、初期設定・キャリブレーション・
              オペレータ講習まで現場で行います。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/rental?ict=1">
                <Button size="lg" variant="secondary">
                  ICT 対応機の在庫を見る <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline">
                  導入について相談する
                </Button>
              </Link>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Ruler, v: 82, unit: "%", label: "丁張り工数の削減", d: 0 },
              { icon: Activity, v: 214, unit: "現場", label: "ICT 施工の支援実績", d: 0 },
              { icon: Cpu, v: 38, unit: "台", label: "ICT 建機の保有台数", d: 0 },
              { icon: GraduationCap, v: 7, unit: "割", label: "が初めての ICT 施工", d: 0 },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 0.07}>
                <div className="h-full rounded-2xl border border-ink-200 bg-white/85 p-5 backdrop-blur">
                  <s.icon size={20} className="text-sea-600" />
                  <p className="mt-4 text-3xl font-black leading-none tracking-tight text-ink-900">
                    <CountUp to={s.v} decimals={s.d} />
                    <span className="ml-1 text-sm font-bold text-sea-600">{s.unit}</span>
                  </p>
                  <p className="mt-2 text-[11.5px] font-bold text-ink-500">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 効果のグラフ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="Effect"
            title="数字で見る、ICT 施工の効果"
            desc="当社が支援した現場の平均値です(デモ用のサンプルデータ)。従来施工を 100 としています。"
          />
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-ink-200 bg-white p-6">
              <p className="text-[13px] font-black text-ink-900">従来施工との比較</p>
              <p className="mt-1 text-[11.5px] text-ink-400">数値が小さいほど効率的です</p>
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ICT_EFFECT} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(93% 0.006 90)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "oklch(50% 0.011 94)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "oklch(72% 0.009 90)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(97% 0.005 90)" }} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Bar dataKey="従来" fill="oklch(87% 0.007 90)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="ICT施工" fill="oklch(64% 0.15 236)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="h-full rounded-2xl border border-ink-200 bg-white p-6">
              <p className="text-[13px] font-black text-ink-900">保有機械の稼働率推移</p>
              <p className="mt-1 text-[11.5px] text-ink-400">
                ICT 機は通年で高い稼働率を維持しています
              </p>
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ICT_UTILIZATION}>
                    <defs>
                      <linearGradient id="gradAll" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(82% 0.18 82)" stopOpacity={0.55} />
                        <stop offset="100%" stopColor="oklch(82% 0.18 82)" stopOpacity={0.04} />
                      </linearGradient>
                      <linearGradient id="gradIct" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(64% 0.15 236)" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="oklch(64% 0.15 236)" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(93% 0.006 90)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "oklch(50% 0.011 94)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[40, 100]}
                      tick={{ fontSize: 11, fill: "oklch(72% 0.009 90)" }}
                      axisLine={false}
                      tickLine={false}
                      unit="%"
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Area
                      type="monotone"
                      dataKey="稼働率"
                      stroke="oklch(74% 0.17 74)"
                      strokeWidth={2.5}
                      fill="url(#gradAll)"
                    />
                    <Area
                      type="monotone"
                      dataKey="ICT機"
                      stroke="oklch(56% 0.15 240)"
                      strokeWidth={2.5}
                      fill="url(#gradIct)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.4fr]">
            <div className="rounded-2xl border border-ink-200 bg-white p-6">
              <p className="text-[13px] font-black text-ink-900">保有機械の構成</p>
              <p className="mt-1 text-[11.5px] text-ink-400">全 482 台の内訳</p>
              <div className="mt-2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={FLEET_MIX}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={82}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {FLEET_MIX.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v} 台`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <LiveMonitor />
          </div>
        </Reveal>
      </section>

      {/* サポート */}
      <section className="border-y border-ink-200 bg-ink-50 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Support"
              align="center"
              title="「使えない」を、残しません。"
              desc="ICT 建機は導入がすべてです。設定から運用の定着まで、当社スタッフが現場に入ります。"
            />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Layers,
                title: "設計データの受け渡し",
                body: "LandXML / TIN など、お手持ちの 3D データを機械に投入できる形式に整えます。データが無い場合の作成支援も可能です。",
              },
              {
                icon: Wrench,
                title: "現地キャリブレーション",
                body: "納品時に現場で基準点合わせと精度確認を実施。「入れたけれど精度が出ない」を起こさせません。",
              },
              {
                icon: GraduationCap,
                title: "オペレータ講習",
                body: "実機を使った半日の講習を現場で実施。ベテランから若手まで、その日から使える状態にしてお渡しします。",
              },
            ].map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-ink-200 bg-white p-7">
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-sea-50 text-sea-600">
                    <s.icon size={22} />
                  </div>
                  <h3 className="text-[15px] font-bold text-ink-900">{s.title}</h3>
                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-500">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* レトロフィット */}
          <Reveal delay={0.1}>
            <div className="mt-10 grid gap-8 overflow-hidden rounded-3xl border border-sun-200 bg-gradient-to-br from-sun-50 to-white p-8 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <Badge tone="sun" className="mb-4">
                  <Radio size={12} /> レトロフィット
                </Badge>
                <h3 className="text-2xl font-black leading-tight tracking-tight text-ink-900">
                  今ある機械に、後付けで。
                </h3>
                <p className="mt-4 max-w-xl text-[14px] leading-[1.9] text-ink-600">
                  自社保有の油圧ショベルにキットを装着し、3D マシンガイダンスを追加できます。
                  新車の ICT 建機を導入する前に、まず 1 台から試したいお客様に選ばれています。
                  キットのみのレンタルにも対応します。
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["既存機に後付け", "1 台から", "月単位レンタル可", "取付・撤去も当社"].map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[11.5px] font-bold text-ink-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-ink-200 bg-white p-6">
                <p className="text-[11px] font-black tracking-wider text-ink-400">
                  導入コストの比較(サンプル)
                </p>
                <div className="mt-5 space-y-4">
                  {[
                    { label: "ICT 建機を購入", w: 100, color: "bg-ink-300", note: "初期投資 大" },
                    { label: "ICT 建機をレンタル", w: 34, color: "bg-sun-500", note: "工期分のみ" },
                    { label: "レトロフィット", w: 21, color: "bg-sea-500", note: "既存機を活用" },
                  ].map((r) => (
                    <div key={r.label}>
                      <div className="mb-1.5 flex items-baseline justify-between">
                        <span className="text-[12px] font-bold text-ink-700">{r.label}</span>
                        <span className="text-[10.5px] font-bold text-ink-400">{r.note}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-ink-100">
                        <div
                          className={`h-full rounded-full ${r.color}`}
                          style={{ width: `${r.w}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-5 flex items-start gap-1.5 border-t border-ink-200 pt-4 text-[10.5px] leading-relaxed text-ink-400">
                  <Fuel size={12} className="mt-0.5 shrink-0" />
                  比率はデモ用の目安です。実際の費用は工期・機種・現場条件により異なります。
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ICT 対応機 */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Lineup"
              title={`ICT 対応機(${ictMachines.length} 機種)`}
              desc="いずれも初期設定・講習込みでお貸出しできます。空き状況は各機種のページからご確認ください。"
            />
            <Link to="/rental?ict=1" className="shrink-0">
              <Button variant="outline">
                在庫を確認する <ArrowRight size={15} />
              </Button>
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ictMachines.map((m, i) => (
            <MachineCard key={m.id} m={m} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
