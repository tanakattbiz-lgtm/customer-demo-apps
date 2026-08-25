import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { addDays, format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  ArrowRight,
  Calculator,
  Check,
  FileText,
  Printer,
  ShoppingCart,
  Sparkles,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import {
  BRANCHES,
  CATEGORIES,
  MACHINES,
  OPTIONS,
  type CategoryId,
} from "../data/seed";
import { MachineArt } from "../components/MachineArt";
import { Badge, Button, Reveal } from "../components/ui";
import { calcBaseFee, discountLabel, yen } from "../lib/format";
import { fakeApi } from "../lib/fakeApi";
import { useStore } from "../store";

type Purpose = {
  id: string;
  label: string;
  desc: string;
  cats: CategoryId[];
  reason: string;
};

const PURPOSES: Purpose[] = [
  {
    id: "gaikou",
    label: "外構・造園",
    desc: "住宅まわりの掘削・整地・植栽",
    cats: ["mini-excavator", "small", "attachment"],
    reason: "狭所での取り回しを重視し、ミニショベルと転圧機を組み合わせるのが定番です。",
  },
  {
    id: "doboku",
    label: "土木・造成",
    desc: "道路・河川・宅地造成",
    cats: ["excavator", "large-excavator", "bulldozer", "carrier"],
    reason: "掘削と敷均しを並行させる工程が多いため、ショベル + ドーザの構成をおすすめします。",
  },
  {
    id: "kaitai",
    label: "解体・産廃",
    desc: "建物解体・現場内再資源化",
    cats: ["excavator", "crusher", "attachment"],
    reason: "圧砕機での二次破砕と、現場内での再生砕石化を組み合わせると搬出費を抑えられます。",
  },
  {
    id: "suido",
    label: "上下水道・管路",
    desc: "配管布設・側溝・舗装復旧",
    cats: ["mini-excavator", "excavator", "small"],
    reason: "掘削から埋戻し・転圧まで一連で行うため、ショベルと転圧機のセットが効率的です。",
  },
  {
    id: "setsubi",
    label: "設備・点検",
    desc: "屋内外の高所作業・電源確保",
    cats: ["aerial", "small"],
    reason: "屋内なら電動リフト、屋外なら自走式ブームと発電機の組み合わせが扱いやすい構成です。",
  },
  {
    id: "josetsu",
    label: "除雪・冬季",
    desc: "駐車場・構内・道路の除雪",
    cats: ["wheel-loader", "carrier"],
    reason: "除雪仕様のホイールローダは台数が限られます。11 月までのご予約をおすすめします。",
  },
];

const SCALES = [
  { id: "s", label: "小規模", desc: "〜5t クラス中心", max: 5 },
  { id: "m", label: "中規模", desc: "5〜15t クラス中心", max: 16 },
  { id: "l", label: "大規模", desc: "20t クラス以上", max: 99 },
];

const TAX = 0.1;

export default function Simulator() {
  const navigate = useNavigate();
  const addToCart = useStore((s) => s.addToCart);

  const [step, setStep] = useState(1);
  const [purpose, setPurpose] = useState<Purpose | null>(null);
  const [scale, setScale] = useState(SCALES[1]);
  const [picked, setPicked] = useState<string[]>([]);
  const [branch, setBranch] = useState(BRANCHES[0].id);
  const [days, setDays] = useState(14);
  const [startOffset, setStartOffset] = useState(3);
  const [optionIds, setOptionIds] = useState<string[]>(["transport", "insurance"]);
  const [calculating, setCalculating] = useState(false);
  const [adding, setAdding] = useState(false);

  const startDate = addDays(new Date(), startOffset);

  const recommended = useMemo(() => {
    if (!purpose) return [];
    return MACHINES.filter(
      (m) => purpose.cats.includes(m.category) && m.weightT <= scale.max,
    )
      .sort((a, b) => Number(b.popular) - Number(a.popular) || b.rating - a.rating)
      .slice(0, 6);
  }, [purpose, scale]);

  const pickedMachines = MACHINES.filter((m) => picked.includes(m.id));

  const lines = pickedMachines.map((m) => {
    const base = calcBaseFee(m.dayRate, m.monthRate, days);
    return { m, base };
  });
  const baseTotal = lines.reduce((s, l) => s + l.base, 0);
  const optionLines = optionIds
    .map((id) => OPTIONS.find((o) => o.id === id))
    .filter((o): o is (typeof OPTIONS)[number] => Boolean(o))
    .map((o) => ({
      o,
      amount:
        o.unit === "1日"
          ? o.price * days * Math.max(1, pickedMachines.length)
          : o.unit === "1回"
            ? o.price
            : o.price * Math.max(1, pickedMachines.length),
    }));
  const optTotal = optionLines.reduce((s, l) => s + l.amount, 0);
  const subtotal = baseTotal + optTotal;
  const tax = Math.round(subtotal * TAX);
  const disc = discountLabel(days);

  const goStep = async (n: number) => {
    if (n === 3) {
      setCalculating(true);
      await fakeApi(true, 600);
      setCalculating(false);
    }
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addAllToCart = async () => {
    setAdding(true);
    await fakeApi(true, 600);
    pickedMachines.forEach((m) =>
      addToCart({
        machineId: m.id,
        branchId: branch,
        startDate: format(startDate, "yyyy-MM-dd"),
        days,
        qty: 1,
        optionIds,
      }),
    );
    setAdding(false);
    toast.success(`${pickedMachines.length} 件を見積カートに追加しました`, {
      action: { label: "カートを見る", onClick: () => navigate("/cart") },
    });
  };

  const togglePick = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <>
      <div className="mesh-soft border-b border-ink-200">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <p className="text-[11px] font-black tracking-[0.18em] text-sun-800">SIMULATOR</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">
            見積シミュレーター
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-600">
            工種と規模を選ぶだけで、必要な機械の組み合わせと概算料金をその場で試算します。
            機種が決まっていなくても大丈夫です。
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ステップインジケータ */}
        <div className="mb-10 flex items-center gap-2">
          {[
            { n: 1, label: "工種を選ぶ" },
            { n: 2, label: "機械を選ぶ" },
            { n: 3, label: "条件と見積" },
          ].map((s, i) => (
            <div key={s.n} className="flex flex-1 items-center gap-2">
              <button
                onClick={() => s.n < step && goStep(s.n)}
                disabled={s.n > step}
                className={`flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 transition-colors ${
                  s.n === step
                    ? "bg-ink-900 text-white"
                    : s.n < step
                      ? "bg-sun-100 text-sun-900 hover:bg-sun-200"
                      : "text-ink-300"
                }`}
              >
                <span
                  className={`tnum grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-black ${
                    s.n === step
                      ? "bg-sun-500 text-ink-900"
                      : s.n < step
                        ? "bg-white text-sun-800"
                        : "bg-ink-100 text-ink-400"
                  }`}
                >
                  {s.n < step ? <Check size={13} strokeWidth={3.5} /> : s.n}
                </span>
                <span className="hidden whitespace-nowrap text-[12.5px] font-bold sm:inline">
                  {s.label}
                </span>
              </button>
              {i < 2 && <span className="h-px flex-1 bg-ink-200" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ---------- STEP 1 ---------- */}
          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-xl font-black text-ink-900">どんな工事に使いますか?</h2>
              <p className="mt-1.5 text-[13px] text-ink-500">
                選ぶと、その工種でよく使われる機械をご提案します。
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PURPOSES.map((p) => {
                  const on = purpose?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPurpose(p)}
                      className={`rounded-2xl border p-5 text-left transition-all duration-200 ${
                        on
                          ? "border-sun-500 bg-sun-50 shadow-[var(--shadow-lift)]"
                          : "border-ink-200 bg-white hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-[var(--shadow-soft)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[15px] font-bold text-ink-900">{p.label}</p>
                        <span
                          className={`grid h-5 w-5 place-items-center rounded-full border transition-colors ${
                            on ? "border-sun-600 bg-sun-600" : "border-ink-300"
                          }`}
                        >
                          {on && <Check size={12} className="text-white" strokeWidth={3.5} />}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[12px] text-ink-500">{p.desc}</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {p.cats.slice(0, 3).map((c) => (
                          <span
                            key={c}
                            className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold text-ink-500"
                          >
                            {CATEGORIES.find((x) => x.id === c)?.short}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              <h2 className="mt-10 text-xl font-black text-ink-900">現場の規模は?</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {SCALES.map((s) => {
                  const on = scale.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setScale(s)}
                      className={`rounded-2xl border p-5 text-left transition-all ${
                        on
                          ? "border-sea-500 bg-sea-50"
                          : "border-ink-200 bg-white hover:border-ink-300"
                      }`}
                    >
                      <p className="text-[14.5px] font-bold text-ink-900">{s.label}</p>
                      <p className="mt-1 text-[12px] text-ink-500">{s.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-10 flex justify-end">
                <Button
                  size="lg"
                  variant="secondary"
                  disabled={!purpose}
                  onClick={() => goStep(2)}
                >
                  機械の提案を見る <ArrowRight size={16} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ---------- STEP 2 ---------- */}
          {step === 2 && purpose && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="rounded-2xl border border-sea-200 bg-sea-50 p-5">
                <p className="flex items-center gap-2 text-[12px] font-black text-sea-700">
                  <Sparkles size={14} /> {purpose.label}({scale.label})へのご提案
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-700">{purpose.reason}</p>
              </div>

              <h2 className="mt-8 text-xl font-black text-ink-900">
                使う機械を選んでください
                <span className="ml-2 text-[12px] font-bold text-ink-400">(複数選択可)</span>
              </h2>

              {recommended.length === 0 ? (
                <p className="mt-6 rounded-2xl border border-dashed border-ink-300 bg-ink-50 p-8 text-center text-[13px] text-ink-500">
                  この条件に合う機械が見つかりませんでした。規模を変えてお試しください。
                </p>
              ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {recommended.map((m) => {
                    const on = picked.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => togglePick(m.id)}
                        className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                          on
                            ? "border-sun-500 bg-sun-50 shadow-[var(--shadow-soft)]"
                            : "border-ink-200 bg-white hover:border-ink-300"
                        }`}
                      >
                        <div className="shrink-0 overflow-hidden rounded-xl bg-sun-50">
                          <MachineArt
                            kind={m.art}
                            scene={false}
                            idKey={`sim-${m.id}`}
                            className="h-16 w-24"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-bold text-ink-900">{m.name}</p>
                          <p className="tnum mt-0.5 text-[11px] font-bold text-ink-400">
                            {m.model} / {m.classLabel}
                          </p>
                          <p className="tnum mt-1.5 text-[13px] font-black text-sun-800">
                            {yen(m.dayRate)}
                            <span className="text-[10px] font-bold text-ink-400"> / 日</span>
                          </p>
                        </div>
                        <span
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors ${
                            on ? "border-sun-600 bg-sun-600" : "border-ink-300"
                          }`}
                        >
                          {on && <Check size={13} className="text-white" strokeWidth={3.5} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-10 flex flex-wrap justify-between gap-3">
                <Button variant="ghost" size="lg" onClick={() => goStep(1)}>
                  <Undo2 size={16} /> 工種を選び直す
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  disabled={picked.length === 0}
                  loading={calculating}
                  onClick={() => goStep(3)}
                >
                  {picked.length > 0 ? `${picked.length} 台で試算する` : "機械を選んでください"}
                  <ArrowRight size={16} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ---------- STEP 3 ---------- */}
          {step === 3 && (
            <motion.div
              key="s3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start"
            >
              {/* 条件 */}
              <div className="rounded-3xl border border-ink-200 bg-white p-6">
                <p className="flex items-center gap-2 text-[13px] font-black text-ink-900">
                  <Calculator size={16} className="text-sun-700" /> レンタル条件
                </p>

                <div className="mt-6 space-y-6">
                  <div>
                    <label className="mb-2 block text-[11px] font-black tracking-wider text-ink-900">
                      受取り営業所
                    </label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full rounded-xl border border-ink-300 bg-white px-3.5 py-3 text-[13px] font-bold text-ink-800 outline-none focus:border-sea-500"
                    >
                      {BRANCHES.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}({b.area})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] font-black tracking-wider text-ink-900">
                      開始日
                    </label>
                    <input
                      type="date"
                      value={format(startDate, "yyyy-MM-dd")}
                      min={format(new Date(), "yyyy-MM-dd")}
                      onChange={(e) => {
                        const diff = Math.round(
                          (new Date(e.target.value).setHours(0, 0, 0, 0) -
                            new Date().setHours(0, 0, 0, 0)) /
                            86400000,
                        );
                        setStartOffset(Math.max(0, diff));
                      }}
                      className="tnum w-full rounded-xl border border-ink-300 bg-white px-3.5 py-3 text-[13px] font-bold text-ink-800 outline-none focus:border-sea-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-[11px] font-black tracking-wider text-ink-900">
                      レンタル期間
                      {disc && (
                        <span className="rounded-full bg-ok-100 px-2 py-0.5 text-[10px] font-black text-ok-700">
                          {disc}
                        </span>
                      )}
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={120}
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      className="w-full accent-sun-600"
                      aria-label="レンタル日数"
                    />
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="tnum text-2xl font-black text-ink-900">
                        {days}
                        <span className="ml-1 text-[12px] font-bold text-ink-400">日間</span>
                      </span>
                      <span className="text-[11.5px] font-bold text-ink-500">
                        〜{format(addDays(startDate, days), "M月d日(E)", { locale: ja })}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] font-black tracking-wider text-ink-900">
                      オプション
                    </label>
                    <div className="space-y-1.5">
                      {OPTIONS.map((o) => {
                        const on = optionIds.includes(o.id);
                        return (
                          <button
                            key={o.id}
                            onClick={() =>
                              setOptionIds((ids) =>
                                ids.includes(o.id)
                                  ? ids.filter((x) => x !== o.id)
                                  : [...ids, o.id],
                              )
                            }
                            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                              on ? "border-sun-500 bg-sun-50" : "border-ink-200 hover:border-ink-300"
                            }`}
                          >
                            <span
                              className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${
                                on ? "border-sun-600 bg-sun-600" : "border-ink-300"
                              }`}
                            >
                              {on && <Check size={11} className="text-white" strokeWidth={3.5} />}
                            </span>
                            <span className="min-w-0 flex-1 text-[12.5px] font-bold text-ink-900">
                              {o.label}
                              {o.recommended && (
                                <span className="ml-2 rounded-full bg-sea-50 px-1.5 py-0.5 text-[9.5px] font-black text-sea-700">
                                  推奨
                                </span>
                              )}
                            </span>
                            <span className="tnum shrink-0 text-[11.5px] font-black text-ink-600">
                              {yen(o.price)}
                              <span className="font-bold text-ink-400">/{o.unit}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <Button variant="ghost" className="mt-6 w-full" onClick={() => goStep(2)}>
                  <Undo2 size={15} /> 機械を選び直す
                </Button>
              </div>

              {/* 見積書プレビュー */}
              <div className="lg:sticky lg:top-24">
                <div className="overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-[var(--shadow-lift)]">
                  <div className="flex items-center gap-2 border-b border-ink-200 bg-ink-50 px-6 py-4">
                    <FileText size={16} className="text-ink-500" />
                    <p className="text-[13px] font-black text-ink-900">御見積書(概算)</p>
                    <Badge tone="sun" className="ml-auto">
                      デモ
                    </Badge>
                  </div>

                  <div className="px-6 py-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 text-[11.5px] text-ink-500">
                      <span>
                        受取り: {BRANCHES.find((b) => b.id === branch)?.name}
                      </span>
                      <span className="tnum">
                        {format(startDate, "yyyy/M/d")} 〜{" "}
                        {format(addDays(startDate, days), "yyyy/M/d")}({days}日)
                      </span>
                    </div>

                    <table className="mt-4 w-full text-left">
                      <thead>
                        <tr className="border-b border-ink-200 text-[10px] font-black tracking-wider text-ink-400">
                          <th className="pb-2">品目</th>
                          <th className="pb-2 text-right">数量</th>
                          <th className="pb-2 text-right">金額</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-100">
                        {lines.map(({ m, base }) => (
                          <tr key={m.id} className="text-[12.5px]">
                            <td className="py-2.5">
                              <span className="block font-bold text-ink-900">{m.name}</span>
                              <span className="tnum block text-[10.5px] text-ink-400">
                                {m.model} ・ {yen(m.dayRate)}/日
                              </span>
                            </td>
                            <td className="tnum py-2.5 text-right text-ink-500">{days} 日</td>
                            <td className="tnum py-2.5 text-right font-bold text-ink-900">
                              {yen(base)}
                            </td>
                          </tr>
                        ))}
                        {optionLines.map(({ o, amount }) => (
                          <tr key={o.id} className="text-[12.5px]">
                            <td className="py-2.5">
                              <span className="block font-bold text-ink-700">{o.label}</span>
                              <span className="block text-[10.5px] text-ink-400">
                                {yen(o.price)} / {o.unit}
                              </span>
                            </td>
                            <td className="tnum py-2.5 text-right text-ink-500">
                              {o.unit === "1回" ? "1 回" : `${pickedMachines.length} 台`}
                            </td>
                            <td className="tnum py-2.5 text-right font-bold text-ink-900">
                              {yen(amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <dl className="mt-5 space-y-2 border-t border-ink-200 pt-4 text-[12.5px]">
                      <div className="flex justify-between">
                        <dt className="text-ink-500">小計</dt>
                        <dd className="tnum font-bold text-ink-900">{yen(subtotal)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-ink-500">消費税(10%)</dt>
                        <dd className="tnum font-bold text-ink-900">{yen(tax)}</dd>
                      </div>
                      <div className="flex items-baseline justify-between border-t border-ink-200 pt-3">
                        <dt className="text-[14px] font-black text-ink-900">合計</dt>
                        <dd className="tnum text-3xl font-black leading-none text-sun-800">
                          {yen(subtotal + tax)}
                        </dd>
                      </div>
                    </dl>

                    {disc && (
                      <p className="mt-4 rounded-xl bg-ok-100 px-4 py-3 text-[11.5px] font-bold leading-relaxed text-ok-700">
                        {disc}を適用しています。さらに長期でお使いの場合は個別にお見積りします。
                      </p>
                    )}
                  </div>

                  <div className="space-y-2.5 border-t border-ink-200 bg-ink-50 px-6 py-5">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full"
                      loading={adding}
                      onClick={addAllToCart}
                    >
                      <ShoppingCart size={16} /> この内容でカートに入れる
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        toast.info("このデモでは PDF 出力は省略しています", {
                          description: "実際のサイトでは見積書 PDF をその場でダウンロードできます",
                        })
                      }
                    >
                      <Printer size={15} /> 見積書を PDF で保存
                    </Button>
                  </div>
                </div>

                <p className="mt-3 px-2 text-[11px] leading-relaxed text-ink-400">
                  ※ 概算です。輸送距離・現場条件・繁忙期の在庫状況により変動します。正式なお見積りは
                  担当よりご提示します。
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step === 1 && (
          <Reveal delay={0.2}>
            <div className="mt-16 rounded-2xl border border-ink-200 bg-ink-50 p-6 text-center">
              <p className="text-[13px] font-bold text-ink-900">
                機種が決まっている場合は、一覧から直接お選びいただけます。
              </p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/rental")}>
                レンタル機械一覧へ <ArrowRight size={15} />
              </Button>
            </div>
          </Reveal>
        )}
      </div>
    </>
  );
}
