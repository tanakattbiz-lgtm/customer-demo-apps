import { useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Calculator } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { simMeta, type SimType } from "../data/simulators";
import { SIM_ICONS } from "./Simulators";
import {
  calcSale, calcInheritance, calcGift, calcRental,
  yen, man,
  type SaleResult, type InheritanceResult, type GiftResult, type RentalResult,
} from "../lib/tax";
import { saleAdvice, inheritanceAdvice, giftAdvice, rentalAdvice } from "../lib/advice";
import { fakeApi } from "../lib/fakeApi";
import { AiAdvice } from "../components/AiAdvice";
import { Button, MoneyField, NumField, Toggle, Disclaimer, SkeletonBlock, Stars } from "../components/ui";
import { useStore, uid } from "../store/useStore";
import { EXPERTS } from "../data/experts";

const COLORS = {
  tax1: "oklch(48% 0.17 258)",
  tax2: "oklch(66% 0.13 255)",
  net: "oklch(78% 0.04 255)",
  accent: "oklch(75% 0.12 85)",
};

/* 万円入力 → 円 */
const toYen = (v: string) => (Number(v) || 0) * 10000;

interface ResultData {
  headline: string;
  headlineValue: number;
  sub: string;
  rows: Array<{ label: string; value: string; strong?: boolean; note?: string }>;
  chart:
    | { kind: "pie"; data: Array<{ name: string; value: number; color: string }> }
    | { kind: "bar"; data: Array<{ name: string; 税額: number }> };
  advice: string;
  summary: string;
}

/* ================================================================ */

export function SimulatorPage() {
  const { type } = useParams();
  if (!type || !["sale", "inheritance", "gift", "rental"].includes(type)) {
    return <Navigate to="/simulators" replace />;
  }
  const t = type as SimType;
  return <SimulatorInner key={t} type={t} />;
}

function SimulatorInner({ type }: { type: SimType }) {
  const meta = simMeta(type);
  const Icon = SIM_ICONS[type];
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const addHistory = useStore((s) => s.addHistory);
  const resultRef = useRef<HTMLDivElement>(null);

  const run = async (build: () => ResultData | string) => {
    const r = build();
    if (typeof r === "string") {
      toast.error(r);
      return;
    }
    setLoading(true);
    setResult(null);
    await fakeApi(null, 600);
    setLoading(false);
    setResult(r);
    addHistory({
      id: uid(),
      type,
      date: new Date().toISOString(),
      summary: r.summary,
      totalTax: r.headlineValue,
      headline: r.headline,
    });
    toast.success("試算が完了しました", { description: "AIアドバイスも生成しました" });
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        to="/simulators"
        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition-colors hover:text-primary-600"
      >
        <ChevronLeft size={15} />
        シミュレーション一覧
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm shadow-primary-600/25">
          <Icon size={22} />
        </span>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            {meta.title}シミュレーション
          </h1>
          <p className="text-xs text-slate-500">{meta.tag} / 入力{meta.time} / 概算</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* 入力フォーム */}
        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          {type === "sale" && <SaleForm onRun={run} loading={loading} />}
          {type === "inheritance" && <InheritanceForm onRun={run} loading={loading} />}
          {type === "gift" && <GiftForm onRun={run} loading={loading} />}
          {type === "rental" && <RentalForm onRun={run} loading={loading} />}
        </div>

        {/* 結果 */}
        <div ref={resultRef} className="scroll-mt-24">
          {loading && <ResultSkeleton />}
          {!loading && !result && <ResultEmpty title={meta.title} />}
          {!loading && result && <ResultView r={result} type={type} />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- 各フォーム ---------------- */

function FormShell({
  children, onSubmit, loading,
}: {
  children: React.ReactNode;
  onSubmit: () => void;
  loading: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-5"
    >
      {children}
      <Button type="submit" loading={loading} full>
        <Calculator size={15} />
        {loading ? "計算中…" : "税額を試算する"}
      </Button>
      <Disclaimer />
    </form>
  );
}

function SaleForm({ onRun, loading }: { onRun: (b: () => ResultData | string) => void; loading: boolean }) {
  const [salePrice, setSalePrice] = useState("7800");
  const [purchasePrice, setPurchasePrice] = useState("2600");
  const [saleCost, setSaleCost] = useState("250");
  const [years, setYears] = useState("12");
  const [residence, setResidence] = useState(true);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!salePrice || Number(salePrice) <= 0) e.salePrice = "売却価格を入力してください";
    if (Number(salePrice) > 1_000_000) e.salePrice = "金額が大きすぎます(100億円以下)";
    if (years === "" || Number(years) < 0) e.years = "所有期間を入力してください";
    return e;
  }, [salePrice, years]);

  const build = (): ResultData | string => {
    if (Object.keys(errors).length) return Object.values(errors)[0];
    const input = {
      salePrice: toYen(salePrice),
      purchasePrice: toYen(purchasePrice),
      saleCost: toYen(saleCost),
      holdingYears: Number(years),
      isResidence: residence,
    };
    const r: SaleResult = calcSale(input);
    return {
      headline: "納税額(概算)",
      headlineValue: r.totalTax,
      sub: `手取り額 約${man(r.netProceeds)}`,
      summary: `売却${man(input.salePrice)} / 所有${input.holdingYears}年`,
      rows: [
        { label: "譲渡所得(特別控除前)", value: yen(r.grossGain) },
        ...(r.specialDeduction > 0
          ? [{ label: "3,000万円特別控除", value: "−" + yen(r.specialDeduction) }]
          : []),
        { label: "課税譲渡所得", value: yen(r.taxableGain), strong: true },
        {
          label: "適用区分",
          value: r.lightRateApplied
            ? "長期(10年超・軽減税率)"
            : r.isLongTerm
              ? "長期譲渡(20.315%)"
              : "短期譲渡(39.63%)",
        },
        { label: "所得税・復興特別所得税", value: yen(r.incomeTaxAmt) },
        { label: "住民税", value: yen(r.residentTaxAmt) },
        { label: "納税額合計", value: yen(r.totalTax), strong: true },
        { label: "売却手取り額", value: yen(r.netProceeds), strong: true, note: "売却価格 − 譲渡費用 − 税金" },
      ],
      chart: {
        kind: "pie",
        data: [
          { name: "手取り額", value: r.netProceeds, color: COLORS.net },
          { name: "税金", value: r.totalTax, color: COLORS.tax1 },
          { name: "譲渡費用", value: toYen(saleCost), color: COLORS.tax2 },
        ].filter((d) => d.value > 0),
      },
      advice: saleAdvice(input, r),
    };
  };

  return (
    <FormShell onSubmit={() => onRun(build)} loading={loading}>
      <MoneyField label="売却価格(予定)" value={salePrice} onChange={setSalePrice} required error={errors.salePrice} />
      <MoneyField
        label="購入時の価格(取得費)" value={purchasePrice} onChange={setPurchasePrice}
        hint="不明な場合は 0 のまま(売却価格の5%で概算します)"
      />
      <MoneyField
        label="譲渡費用" value={saleCost} onChange={setSaleCost}
        hint="仲介手数料・印紙代・測量費など"
      />
      <NumField label="所有期間" value={years} onChange={setYears} unit="年" error={errors.years} hint="譲渡した年の1月1日時点" max={99} />
      <Toggle
        label="マイホーム(居住用財産)の売却"
        desc="3,000万円特別控除・10年超の軽減税率を適用"
        checked={residence} onChange={setResidence}
      />
    </FormShell>
  );
}

function InheritanceForm({ onRun, loading }: { onRun: (b: () => ResultData | string) => void; loading: boolean }) {
  const [assets, setAssets] = useState("9000");
  const [debts, setDebts] = useState("300");
  const [spouse, setSpouse] = useState(true);
  const [children, setChildren] = useState("2");

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!assets || Number(assets) <= 0) e.assets = "遺産総額を入力してください";
    if (children === "" || Number(children) < 0 || !Number.isInteger(Number(children)))
      e.children = "子の人数を入力してください";
    if (!spouse && Number(children) === 0)
      e.children = "このデモでは配偶者または子がいるケースに対応しています";
    return e;
  }, [assets, children, spouse]);

  const build = (): ResultData | string => {
    if (Object.keys(errors).length) return Object.values(errors)[0];
    const input = {
      totalAssets: toYen(assets),
      debts: toYen(debts),
      hasSpouse: spouse,
      numChildren: Number(children),
    };
    const r: InheritanceResult = calcInheritance(input);
    return {
      headline: "相続税の総額(概算)",
      headlineValue: r.totalTax,
      sub: r.taxableEstate === 0 ? "基礎控除の範囲内です" : `実効税率 ${(r.effectiveRate * 100).toFixed(1)}%`,
      summary: `遺産${man(input.totalAssets)} / 相続人${r.numHeirs}名`,
      rows: [
        { label: "正味遺産額", value: yen(r.netAssets) },
        { label: `基礎控除(3,000万+600万×${r.numHeirs}名)`, value: "−" + yen(r.basicDeduction) },
        { label: "課税遺産総額", value: yen(r.taxableEstate), strong: true },
        { label: "相続税の総額(軽減前)", value: yen(r.totalTaxBeforeRelief) },
        ...(r.spouseRelief > 0
          ? [{ label: "配偶者の税額軽減", value: "−" + yen(r.spouseRelief) }]
          : []),
        { label: "納税額合計(概算)", value: yen(r.totalTax), strong: true },
      ],
      chart: {
        kind: "bar",
        data: r.perHeir.map((h) => ({ name: h.label, 税額: Math.round(h.tax) })),
      },
      advice: inheritanceAdvice(input, r),
    };
  };

  return (
    <FormShell onSubmit={() => onRun(build)} loading={loading}>
      <MoneyField
        label="遺産総額" value={assets} onChange={setAssets} required error={errors.assets}
        hint="預貯金・不動産(評価額)・有価証券・保険金などの合計"
      />
      <MoneyField label="債務・葬式費用" value={debts} onChange={setDebts} hint="借入金・未払金・葬儀費用など" />
      <Toggle label="配偶者がいる" desc="配偶者の税額軽減を自動適用します" checked={spouse} onChange={setSpouse} />
      <NumField label="子の人数" value={children} onChange={setChildren} unit="人" error={errors.children} max={10} />
    </FormShell>
  );
}

function GiftForm({ onRun, loading }: { onRun: (b: () => ResultData | string) => void; loading: boolean }) {
  const [amount, setAmount] = useState("500");
  const [special, setSpecial] = useState(true);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!amount || Number(amount) <= 0) e.amount = "贈与額を入力してください";
    return e;
  }, [amount]);

  const build = (): ResultData | string => {
    if (Object.keys(errors).length) return Object.values(errors)[0];
    const input = { amount: toYen(amount), isSpecial: special };
    const r: GiftResult = calcGift(input);
    return {
      headline: "贈与税額(概算)",
      headlineValue: r.totalTax,
      sub: r.totalTax === 0 ? "基礎控除の範囲内です" : `手取り 約${man(r.netReceived)}`,
      summary: `贈与${man(input.amount)} / ${special ? "特例" : "一般"}税率`,
      rows: [
        { label: "年間の贈与額", value: yen(input.amount) },
        { label: "基礎控除", value: "−" + yen(r.basicDeduction) },
        { label: "課税価格", value: yen(r.taxable), strong: true },
        { label: "適用税率", value: `${Math.round(r.rate * 100)}%(${special ? "特例税率" : "一般税率"})` },
        { label: "贈与税額", value: yen(r.totalTax), strong: true },
        { label: "受贈者の手取り", value: yen(r.netReceived), strong: true },
      ],
      chart: {
        kind: "pie",
        data: [
          { name: "手取り", value: r.netReceived, color: COLORS.net },
          { name: "贈与税", value: r.totalTax, color: COLORS.tax1 },
        ].filter((d) => d.value > 0),
      },
      advice: giftAdvice(input, r),
    };
  };

  return (
    <FormShell onSubmit={() => onRun(build)} loading={loading}>
      <MoneyField
        label="1年間に受けた贈与額" value={amount} onChange={setAmount} required error={errors.amount}
        hint="1月1日〜12月31日に受けた贈与の合計"
      />
      <Toggle
        label="父母・祖父母からの贈与(特例税率)"
        desc="18歳以上の子・孫が直系尊属から受ける贈与"
        checked={special} onChange={setSpecial}
      />
    </FormShell>
  );
}

function RentalForm({ onRun, loading }: { onRun: (b: () => ResultData | string) => void; loading: boolean }) {
  const [salary, setSalary] = useState("700");
  const [rent, setRent] = useState("240");
  const [expenses, setExpenses] = useState("80");
  const [blue, setBlue] = useState(false);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (salary === "" || Number(salary) < 0) e.salary = "給与収入を入力してください";
    if (!rent || Number(rent) <= 0) e.rent = "家賃収入を入力してください";
    if (Number(expenses) > Number(rent)) e.expenses = "このデモでは経費は家賃収入以下で入力してください";
    return e;
  }, [salary, rent, expenses]);

  const build = (): ResultData | string => {
    if (Object.keys(errors).length) return Object.values(errors)[0];
    const input = {
      salaryIncome: toYen(salary),
      rentIncome: toYen(rent),
      expenses: toYen(expenses),
      socialInsurance: 0,
      blueDeduction: blue,
    };
    const r: RentalResult = calcRental(input);
    return {
      headline: "年間税額(所得税+住民税)",
      headlineValue: r.totalTax,
      sub: `うち家賃収入による増加分 約${man(r.additionalTax)}`,
      summary: `給与${man(input.salaryIncome)}+家賃${man(input.rentIncome)}`,
      rows: [
        { label: "不動産所得", value: yen(r.rentalProfit), note: blue ? "青色申告特別控除65万円を適用" : undefined },
        { label: "給与所得(控除後)", value: yen(r.salaryAfterDeduction) },
        { label: "社会保険料控除(概算)", value: "−" + yen(r.socialInsuranceUsed) },
        { label: "課税所得", value: yen(r.taxableIncome), strong: true },
        { label: "所得税・復興特別所得税", value: yen(r.incomeTaxAmt + r.reconstructionTax) },
        { label: "住民税(10%)", value: yen(r.residentTaxAmt) },
        { label: "年間税額合計", value: yen(r.totalTax), strong: true },
        { label: "家賃収入がない場合の税額", value: yen(r.taxOnSalaryOnly), note: "比較用" },
      ],
      chart: {
        kind: "bar",
        data: [
          { name: "給与のみ", 税額: Math.round(r.taxOnSalaryOnly) },
          { name: "給与+家賃収入", 税額: Math.round(r.totalTax) },
        ],
      },
      advice: rentalAdvice(input, r),
    };
  };

  return (
    <FormShell onSubmit={() => onRun(build)} loading={loading}>
      <MoneyField label="給与収入(年収・額面)" value={salary} onChange={setSalary} required error={errors.salary} />
      <MoneyField label="年間の家賃収入" value={rent} onChange={setRent} required error={errors.rent} />
      <MoneyField
        label="年間の経費" value={expenses} onChange={setExpenses} error={errors.expenses}
        hint="管理費・修繕費・固定資産税・減価償却費・借入利息など"
      />
      <Toggle
        label="青色申告(65万円控除)"
        desc="事業的規模+複式簿記+e-Tax申告の場合"
        checked={blue} onChange={setBlue}
      />
    </FormShell>
  );
}

/* ---------------- 結果表示 ---------------- */

function ResultEmpty({ title }: { title: string }) {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-400">
        <Calculator size={24} />
      </span>
      <p className="mt-4 text-base font-bold text-slate-600">
        {title}を試算してみましょう
      </p>
      <p className="mt-1.5 max-w-xs text-[13px] leading-6 text-slate-400">
        左のフォームに入力して「税額を試算する」を押すと、結果とAIアドバイスがここに表示されます。
      </p>
    </div>
  );
}

function ResultSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonBlock className="h-36 w-full rounded-2xl" />
      <SkeletonBlock className="h-64 w-full rounded-2xl" />
      <SkeletonBlock className="h-40 w-full rounded-2xl" />
    </div>
  );
}

function ResultView({ r, type }: { r: ResultData; type: SimType }) {
  const recommended = EXPERTS.filter((e) => e.simTypes.includes(type)).slice(0, 3);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* ヘッドライン */}
      <div className="rounded-2xl bg-navy p-6 text-white shadow-lg sm:p-8">
        <p className="text-xs font-semibold text-slate-300">{r.headline}</p>
        <p className="font-en mt-1 text-4xl font-extrabold tabular-nums tracking-tight sm:text-5xl">
          {yen(r.headlineValue)}
        </p>
        <p className="mt-2 text-sm text-primary-200">{r.sub}</p>
      </div>

      {/* 内訳 + チャート */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-bold text-slate-600">計算の内訳</h3>
          <dl className="divide-y divide-slate-100">
            {r.rows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-[13px] text-slate-500">
                  {row.label}
                  {row.note && <span className="block text-[11px] text-slate-400">{row.note}</span>}
                </dt>
                <dd className={`text-right tabular-nums ${row.strong ? "text-[15px] font-extrabold text-ink" : "text-sm font-semibold text-slate-600"}`}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-2 text-sm font-bold text-slate-600">
            {r.chart.kind === "pie" ? "内訳の割合" : "税額の比較"}
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              {r.chart.kind === "pie" ? (
                <PieChart>
                  <Pie
                    data={r.chart.data} dataKey="value" nameKey="name"
                    innerRadius={45} outerRadius={72} paddingAngle={2} strokeWidth={0}
                  >
                    {r.chart.data.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => yen(Number(v))} />
                </PieChart>
              ) : (
                <BarChart data={r.chart.data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(93% 0.005 255)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => man(Number(v))} tick={{ fontSize: 10 }} width={62} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => yen(Number(v))} />
                  <Bar dataKey="税額" fill={COLORS.tax1} radius={[6, 6, 0, 0]} maxBarSize={44} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          {r.chart.kind === "pie" && (
            <ul className="mt-2 space-y-1">
              {r.chart.data.map((d) => (
                <li key={d.name} className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
                  {d.name}
                  <span className="ml-auto font-en font-semibold tabular-nums text-slate-600">{man(d.value)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* AIアドバイス */}
      <AiAdvice text={r.advice} />

      {/* おすすめ専門家 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-600">この結果を相談できる専門家</h3>
          <Link to="/experts" className="inline-flex items-center gap-0.5 text-xs font-bold text-primary-600 hover:text-primary-700">
            すべて見る <ChevronRight size={13} />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {recommended.map((e) => (
            <Link
              key={e.id}
              to={`/experts/${e.id}`}
              className="rounded-xl border border-slate-200 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: e.color }}
                >
                  {e.name[0]}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold">{e.name}</p>
                  <p className="text-[11px] text-slate-500">{e.qualification} / {e.area}</p>
                </div>
              </div>
              <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
                <Stars rating={e.rating} />
                <span className="font-semibold text-ink">{e.rating}</span>
              </p>
              <p className="mt-1 text-[11px] font-semibold text-primary-600">{e.fee}</p>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
