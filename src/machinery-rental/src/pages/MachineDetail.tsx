import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addDays, format } from "date-fns";
import { ja } from "date-fns/locale";
import { motion } from "motion/react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  Heart,
  Info,
  Leaf,
  Phone,
  Satellite,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import {
  BRANCHES,
  CATEGORIES,
  MACHINES,
  OPTIONS,
  availabilityFor,
  nextAvailableDate,
} from "../data/seed";
import { MachineArt } from "../components/MachineArt";
import { MachineCard } from "../components/MachineCard";
import { Badge, Button, Reveal } from "../components/ui";
import { StockDot } from "../components/MachineCard";
import { calcBaseFee, discountLabel, md, yen } from "../lib/format";
import { fakeApi } from "../lib/fakeApi";
import { useStore } from "../store";
import { toast } from "sonner";

const DAY_PRESETS = [1, 3, 7, 14, 30, 60];

export default function MachineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const m = MACHINES.find((x) => x.id === id);

  const addToCart = useStore((s) => s.addToCart);
  const favorites = useStore((s) => s.favorites);
  const toggleFavorite = useStore((s) => s.toggleFavorite);

  /** 空きのある最初の日を探す(見つからなければ翌日) */
  const firstOpen = (machineId: string, branchId: string) => {
    for (let i = 1; i <= 20; i++) {
      if (availabilityFor(machineId, branchId, i) > 0) return i;
    }
    return 1;
  };

  const [branch, setBranch] = useState(BRANCHES[0].id);
  const [startOffset, setStartOffset] = useState(() =>
    id ? firstOpen(id, BRANCHES[0].id) : 1,
  );
  const [days, setDays] = useState(7);
  const [qty, setQty] = useState(1);
  const [optionIds, setOptionIds] = useState<string[]>(["transport"]);
  const [adding, setAdding] = useState(false);

  const startDate = useMemo(() => addDays(new Date(), startOffset), [startOffset]);

  const calendar = useMemo(() => {
    if (!m) return [];
    return Array.from({ length: 21 }, (_, i) => ({
      offset: i,
      date: addDays(new Date(), i),
      count: availabilityFor(m.id, branch, i),
    }));
  }, [m, branch]);

  /* 営業所を切り替えたとき、その日に空きが無ければ直近の空き日へ寄せる */
  useEffect(() => {
    if (!id) return;
    if (availabilityFor(id, branch, startOffset) === 0) setStartOffset(firstOpen(id, branch));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch, id]);

  if (!m) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-lg font-bold text-ink-900">機械が見つかりませんでした</p>
        <Link to="/rental" className="mt-6 inline-block">
          <Button variant="secondary">レンタル機械一覧へ</Button>
        </Link>
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.id === m.category);
  const totalStock = Object.values(m.stock).reduce((a, b) => a + b, 0);
  const fav = favorites.includes(m.id);

  const base = calcBaseFee(m.dayRate, m.monthRate, days) * qty;
  const optFee = optionIds.reduce((sum, oid) => {
    const o = OPTIONS.find((x) => x.id === oid);
    if (!o) return sum;
    if (o.unit === "1日") return sum + o.price * days * qty;
    if (o.unit === "1回") return sum + o.price;
    return sum + o.price * qty;
  }, 0);
  const total = base + optFee;
  const disc = discountLabel(days);

  const availableOnStart = availabilityFor(m.id, branch, startOffset);
  const canOrder = availableOnStart >= qty;
  const nextDate = nextAvailableDate(m.id, branch);

  const related = MACHINES.filter((x) => x.category === m.category && x.id !== m.id).slice(0, 3);
  const fallbackRelated = MACHINES.filter((x) => x.popular && x.id !== m.id).slice(0, 3);

  const handleAdd = async () => {
    setAdding(true);
    await fakeApi(true, 500);
    addToCart({
      machineId: m.id,
      branchId: branch,
      startDate: format(startDate, "yyyy-MM-dd"),
      days,
      qty,
      optionIds,
    });
    setAdding(false);
    toast.success("見積カートに追加しました", {
      description: `${m.name} / ${days}日間 / ${yen(total)}`,
      action: { label: "カートを見る", onClick: () => navigate("/cart") },
    });
  };

  return (
    <>
      {/* パンくず */}
      <div className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto px-4 py-3 text-[11.5px] font-bold text-ink-400 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0 hover:text-ink-900">
            ホーム
          </Link>
          <ChevronRight size={12} className="shrink-0" />
          <Link to="/rental" className="shrink-0 hover:text-ink-900">
            レンタル機械
          </Link>
          <ChevronRight size={12} className="shrink-0" />
          <Link to={`/rental?cat=${m.category}`} className="shrink-0 hover:text-ink-900">
            {category?.label}
          </Link>
          <ChevronRight size={12} className="shrink-0" />
          <span className="shrink-0 text-ink-700">{m.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-ink-500 transition-colors hover:text-ink-900"
        >
          <ArrowLeft size={15} /> 前のページへ戻る
        </button>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          {/* ---------- 左: 機械情報 ---------- */}
          <div>
            <div className="overflow-hidden rounded-3xl border border-ink-200 bg-sun-50">
              <MachineArt kind={m.art} idKey={`detail-${m.id}`} className="w-full" />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Badge tone="sun">{category?.label}</Badge>
              {m.ict && (
                <Badge tone="sea">
                  <Satellite size={11} /> ICT 対応
                </Badge>
              )}
              {m.eco && (
                <Badge tone="ok">
                  <Leaf size={11} /> 排出ガス 4 次基準
                </Badge>
              )}
              {m.popular && <Badge tone="warn">人気機種</Badge>}
              <button
                onClick={() => toggleFavorite(m.id)}
                className={`ml-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-bold transition-colors ${
                  fav
                    ? "border-ng-100 bg-ng-100 text-ng-700"
                    : "border-ink-200 bg-white text-ink-500 hover:text-ng-500"
                }`}
              >
                <Heart size={13} fill={fav ? "currentColor" : "none"} />
                {fav ? "お気に入り登録済み" : "お気に入り"}
              </button>
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-ink-900 sm:text-4xl">
              {m.name}
            </h1>
            <p className="tnum mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] font-bold text-ink-400">
              <span>型式 {m.model}</span>
              <span>{m.classLabel}</span>
              <span className="flex items-center gap-1 text-ink-600">
                <Star size={12} className="fill-sun-500 text-sun-500" />
                {m.rating.toFixed(1)}
                <span className="font-normal text-ink-400">({m.reviews} 件のご利用)</span>
              </span>
            </p>

            <p className="mt-5 text-[14.5px] leading-[1.9] text-ink-600">{m.summary}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {m.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-ink-200 bg-white px-3 py-1 text-[11px] font-bold text-ink-500"
                >
                  #{t}
                </span>
              ))}
            </div>

            {/* 主要諸元 */}
            <section className="mt-10">
              <h2 className="mb-4 text-[15px] font-black text-ink-900">主要諸元</h2>
              <dl className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
                {m.specs.map((s, i) => (
                  <div
                    key={s.label}
                    className={`flex items-baseline gap-4 px-5 py-3.5 text-[13px] ${
                      i % 2 ? "bg-ink-50" : ""
                    }`}
                  >
                    <dt className="w-32 shrink-0 font-bold text-ink-500">{s.label}</dt>
                    <dd className="tnum font-bold text-ink-900">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* 営業所別在庫 */}
            <section className="mt-10">
              <h2 className="mb-1 text-[15px] font-black text-ink-900">営業所別の在庫</h2>
              <p className="mb-4 text-[12px] text-ink-500">
                在庫のない営業所でも、他拠点からの回送でご用意できる場合があります。
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {BRANCHES.map((b) => {
                  const n = m.stock[b.id] ?? 0;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setBranch(b.id)}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                        branch === b.id
                          ? "border-sun-500 bg-sun-50 shadow-[var(--shadow-soft)]"
                          : "border-ink-200 bg-white hover:border-ink-300"
                      }`}
                    >
                      <span>
                        <span className="block text-[13px] font-bold text-ink-900">{b.name}</span>
                        <span className="block text-[11px] text-ink-400">{b.area}</span>
                      </span>
                      <StockDot total={n} />
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 空き状況カレンダー */}
            <section className="mt-10">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays size={17} className="text-sun-700" />
                <h2 className="text-[15px] font-black text-ink-900">
                  今後 3 週間の空き状況
                  <span className="ml-2 text-[11.5px] font-bold text-ink-400">
                    {BRANCHES.find((b) => b.id === branch)?.name}
                  </span>
                </h2>
              </div>
              <div className="rounded-2xl border border-ink-200 bg-white p-4">
                <div className="grid grid-cols-7 gap-1.5">
                  {["日", "月", "火", "水", "木", "金", "土"].map((w) => (
                    <div key={w} className="pb-1 text-center text-[10px] font-black text-ink-400">
                      {w}
                    </div>
                  ))}
                  {Array.from({ length: new Date().getDay() }).map((_, i) => (
                    <div key={`pad-${i}`} />
                  ))}
                  {calendar.map((c) => {
                    const selected = c.offset === startOffset;
                    const tone =
                      c.count === 0
                        ? "bg-ink-100 text-ink-300"
                        : c.count <= 2
                          ? "bg-warn-100 text-warn-700 hover:bg-warn-100"
                          : "bg-ok-100 text-ok-700";
                    return (
                      <button
                        key={c.offset}
                        onClick={() => c.count > 0 && setStartOffset(c.offset)}
                        disabled={c.count === 0}
                        className={`rounded-lg px-1 py-2 text-center transition-all disabled:cursor-not-allowed ${tone} ${
                          selected ? "ring-2 ring-ink-900 ring-offset-1" : ""
                        }`}
                        title={`${md(c.date)} — ${c.count === 0 ? "空きなし" : `${c.count} 台`}`}
                      >
                        <span className="tnum block text-[12px] font-black leading-none">
                          {format(c.date, "d")}
                        </span>
                        <span className="mt-1 block text-[9.5px] font-bold leading-none">
                          {c.count === 0 ? "×" : `${c.count}台`}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-ink-200 pt-3 text-[10.5px] font-bold text-ink-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-ok-100" /> 空きあり
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-warn-100" /> 残りわずか
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-ink-100" /> 空きなし
                  </span>
                  <span className="ml-auto">日付をタップすると開始日を変更できます</span>
                </div>
              </div>
            </section>
          </div>

          {/* ---------- 右: 予約パネル ---------- */}
          <div>
            <div className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-[var(--shadow-lift)]">
                <div className="border-b border-ink-200 bg-gradient-to-br from-sun-50 to-white px-6 py-5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black tracking-wider text-ink-400">日極料金</p>
                      <p className="tnum text-3xl font-black leading-none text-ink-900">
                        {yen(m.dayRate)}
                        <span className="ml-1 text-[11px] font-bold text-ink-400">/ 日</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-black tracking-wider text-ink-400">月極料金</p>
                      <p className="tnum text-lg font-black leading-none text-ink-700">
                        {yen(m.monthRate)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <StockDot total={totalStock} />
                  </div>
                </div>

                <div className="space-y-5 px-6 py-6">
                  {/* 営業所 */}
                  <div>
                    <label className="mb-2 block text-[11px] font-black tracking-wider text-ink-900">
                      受取り営業所
                    </label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full rounded-xl border border-ink-300 bg-white px-3.5 py-3 text-[13px] font-bold text-ink-800 outline-none transition-colors focus:border-sea-500"
                    >
                      {BRANCHES.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}(在庫 {m.stock[b.id] ?? 0} 台)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 開始日 */}
                  <div>
                    <label className="mb-2 block text-[11px] font-black tracking-wider text-ink-900">
                      レンタル開始日
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={format(startDate, "yyyy-MM-dd")}
                        min={format(new Date(), "yyyy-MM-dd")}
                        max={format(addDays(new Date(), 20), "yyyy-MM-dd")}
                        onChange={(e) => {
                          const diff = Math.round(
                            (new Date(e.target.value).setHours(0, 0, 0, 0) -
                              new Date().setHours(0, 0, 0, 0)) /
                              86400000,
                          );
                          setStartOffset(Math.max(0, Math.min(20, diff)));
                        }}
                        className="tnum flex-1 rounded-xl border border-ink-300 bg-white px-3.5 py-3 text-[13px] font-bold text-ink-800 outline-none transition-colors focus:border-sea-500"
                      />
                    </div>
                    <p className="mt-2 text-[11.5px] font-bold text-ink-500">
                      {format(startDate, "M月d日(E)", { locale: ja })} 開始 ・ 返却予定{" "}
                      {format(addDays(startDate, days), "M月d日(E)", { locale: ja })}
                    </p>
                  </div>

                  {/* 期間 */}
                  <div>
                    <label className="mb-2 block text-[11px] font-black tracking-wider text-ink-900">
                      レンタル期間
                      {disc && (
                        <span className="ml-2 rounded-full bg-ok-100 px-2 py-0.5 text-[10px] font-black text-ok-700">
                          {disc}
                        </span>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {DAY_PRESETS.map((d) => (
                        <button
                          key={d}
                          onClick={() => setDays(d)}
                          className={`tnum rounded-full px-3.5 py-2 text-[12px] font-bold transition-colors ${
                            days === d
                              ? "bg-ink-900 text-white"
                              : "border border-ink-200 bg-white text-ink-600 hover:bg-ink-100"
                          }`}
                        >
                          {d >= 30 ? `${d / 30} か月` : `${d} 日`}
                        </button>
                      ))}
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={90}
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      className="mt-3 w-full accent-sun-600"
                      aria-label="レンタル日数"
                    />
                    <p className="tnum mt-1 text-center text-[11.5px] font-bold text-ink-500">
                      {days} 日間
                    </p>
                  </div>

                  {/* 台数 */}
                  <div>
                    <label className="mb-2 block text-[11px] font-black tracking-wider text-ink-900">
                      台数
                    </label>
                    <div className="inline-flex items-center rounded-xl border border-ink-300 bg-white">
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="grid h-11 w-11 place-items-center text-lg font-black text-ink-500 hover:text-ink-900"
                        aria-label="台数を減らす"
                      >
                        −
                      </button>
                      <span className="tnum w-10 text-center text-[15px] font-black text-ink-900">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty((q) => Math.min(5, q + 1))}
                        className="grid h-11 w-11 place-items-center text-lg font-black text-ink-500 hover:text-ink-900"
                        aria-label="台数を増やす"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* オプション */}
                  <div>
                    <label className="mb-2 block text-[11px] font-black tracking-wider text-ink-900">
                      オプション
                    </label>
                    <div className="space-y-1.5">
                      {OPTIONS.filter((o) => o.id !== "ictsupport" || m.ict).map((o) => {
                        const on = optionIds.includes(o.id);
                        return (
                          <button
                            key={o.id}
                            onClick={() =>
                              setOptionIds((ids) =>
                                ids.includes(o.id) ? ids.filter((x) => x !== o.id) : [...ids, o.id],
                              )
                            }
                            className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                              on
                                ? "border-sun-500 bg-sun-50"
                                : "border-ink-200 bg-white hover:border-ink-300"
                            }`}
                          >
                            <span
                              className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors ${
                                on ? "border-sun-600 bg-sun-600" : "border-ink-300"
                              }`}
                            >
                              {on && <Check size={11} className="text-white" strokeWidth={3.5} />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-baseline justify-between gap-2">
                                <span className="text-[12.5px] font-bold text-ink-900">
                                  {o.label}
                                </span>
                                <span className="tnum shrink-0 text-[11.5px] font-black text-ink-700">
                                  {yen(o.price)}
                                  <span className="font-bold text-ink-400">/{o.unit}</span>
                                </span>
                              </span>
                              <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-500">
                                {o.desc}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 金額 */}
                  <div className="rounded-2xl bg-ink-50 p-4">
                    <dl className="space-y-2 text-[12.5px]">
                      <div className="flex justify-between">
                        <dt className="text-ink-500">
                          基本料金({days} 日 × {qty} 台)
                        </dt>
                        <dd className="tnum font-bold text-ink-900">{yen(base)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-ink-500">オプション({optionIds.length} 件)</dt>
                        <dd className="tnum font-bold text-ink-900">{yen(optFee)}</dd>
                      </div>
                      <div className="flex items-baseline justify-between border-t border-ink-200 pt-2.5">
                        <dt className="text-[13px] font-black text-ink-900">概算合計(税別)</dt>
                        <dd className="tnum text-2xl font-black text-sun-800">{yen(total)}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* 在庫警告 */}
                  {!canOrder && (
                    <div className="flex gap-2.5 rounded-xl border border-warn-100 bg-warn-100/60 p-3.5">
                      <Info size={16} className="mt-0.5 shrink-0 text-warn-700" />
                      <p className="text-[11.5px] leading-relaxed text-warn-700">
                        <span className="font-black">
                          選択した開始日は空きが {availableOnStart} 台です。
                        </span>
                        <br />
                        {nextDate
                          ? `${md(nextDate)}以降であればご用意できます。他営業所からの回送もご相談ください。`
                          : "他営業所からの回送でご用意できる場合があります。お問い合わせください。"}
                      </p>
                    </div>
                  )}

                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    loading={adding}
                    disabled={!canOrder}
                    onClick={handleAdd}
                  >
                    <ShoppingCart size={17} />
                    {canOrder ? "見積カートに追加" : "この日は空きがありません"}
                  </Button>

                  <button
                    onClick={() =>
                      toast.info("このデモでは発信は行いません", {
                        description: `実際のサイトでは ${BRANCHES.find((b) => b.id === branch)?.name} に発信されます`,
                      })
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-ink-300 py-3 text-[13px] font-bold text-ink-700 transition-colors hover:bg-ink-100"
                  >
                    <Phone size={15} /> 電話で相談する
                  </button>
                </div>

                <div className="grid grid-cols-3 divide-x divide-ink-200 border-t border-ink-200 bg-ink-50 text-center">
                  {[
                    { icon: Truck, t: "現場直送" },
                    { icon: ShieldCheck, t: "補償プラン" },
                    { icon: Satellite, t: "設定サポート" },
                  ].map((f) => (
                    <div key={f.t} className="px-2 py-4">
                      <f.icon size={16} className="mx-auto text-sun-700" />
                      <p className="mt-1.5 text-[10.5px] font-bold text-ink-500">{f.t}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-3 px-2 text-[11px] leading-relaxed text-ink-400">
                ※ 表示金額は概算です。輸送距離・現場条件により変動します。正式なお見積りは担当より
                ご連絡いたします。
              </p>
            </div>
          </div>
        </div>

        {/* 関連機種 */}
        <section className="mt-20">
          <Reveal>
            <h2 className="text-xl font-black tracking-tight text-ink-900">
              {related.length > 0 ? "同じカテゴリの機械" : "よく借りられている機械"}
            </h2>
          </Reveal>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(related.length > 0 ? related : fallbackRelated).map((r, i) => (
              <motion.div key={r.id} layout>
                <MachineCard m={r} index={i} />
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
