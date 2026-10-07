import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SearchX, X } from "lucide-react";
import {
  MACHINES,
  RENTAL_CATEGORIES,
  type RentalCategoryId,
} from "../data/seed";
import { MachineCard } from "../components/MachineCard";
import { Button, CardSkeleton, EmptyState, PageHead, Reveal } from "../components/ui";
import { fakeApi } from "../lib/fakeApi";

export default function Rental() {
  const [params, setParams] = useSearchParams();

  const catParam = params.get("cat") as RentalCategoryId | null;
  const ictParam = params.get("ict") === "1";

  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<RentalCategoryId | "all">(catParam ?? "all");
  const [group, setGroup] = useState<string>("all");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [ictOnly, setIctOnly] = useState(ictParam);

  /* URL の変化(ヘッダのドロップダウンなど)を state に反映 */
  useEffect(() => {
    setCat((params.get("cat") as RentalCategoryId | null) ?? "all");
    setIctOnly(params.get("ict") === "1");
    setGroup("all");
  }, [params]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fakeApi(true, 380).then(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [cat, group, q, ictOnly]);

  const setCategory = (next: RentalCategoryId | "all") => {
    const p = new URLSearchParams();
    if (next !== "all") p.set("cat", next);
    if (ictOnly) p.set("ict", "1");
    setParams(p, { replace: true });
    setGroup("all");
  };

  /* カテゴリ内の中分類 */
  const groups = useMemo(() => {
    const pool = cat === "all" ? MACHINES : MACHINES.filter((m) => m.category === cat);
    return Array.from(new Set(pool.map((m) => m.group)));
  }, [cat]);

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    return MACHINES.filter((m) => {
      if (cat !== "all" && m.category !== cat) return false;
      if (group !== "all" && m.group !== group) return false;
      if (ictOnly && !m.ict) return false;
      if (!key) return true;
      return [m.name, m.model, m.group, m.headline, m.summary, ...m.tags]
        .join(" ")
        .toLowerCase()
        .includes(key);
    });
  }, [cat, group, q, ictOnly]);

  const activeCategory = RENTAL_CATEGORIES.find((c) => c.id === cat);

  const clear = () => {
    setQ("");
    setGroup("all");
    setCategory("all");
  };

  return (
    <>
      <PageHead
        en="Rental"
        ja="レンタル"
        lead={`標準仕様車・業種別仕様車・アタッチメント・小物商品。全 ${MACHINES.length} 機種を掲載しています。掲載のない機種も、お問い合わせいただければお取り寄せできる場合があります。`}
        breadcrumb={[{ label: "ホーム", to: "/" }, { label: "レンタル" }]}
      />

      {/* カテゴリタブ */}
      <div className="sticky top-[68px] z-40 border-b border-ink-200 bg-white/95 backdrop-blur-md lg:top-[76px]">
        <div className="mx-auto max-w-[1200px] px-6 sm:px-8 lg:px-12">
          <div className="thin-scroll flex items-stretch gap-0 overflow-x-auto">
            <button
              onClick={() => setCategory("all")}
              className={`relative shrink-0 px-5 py-4 text-[13px] tracking-wide transition-colors ${
                cat === "all" ? "text-navy-800" : "text-ink-500 hover:text-navy-700"
              }`}
            >
              すべて
              <span
                className={`absolute inset-x-3 bottom-0 h-[2px] origin-left bg-amber-500 transition-transform duration-300 ${
                  cat === "all" ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
            {RENTAL_CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`relative shrink-0 px-5 py-4 text-[13px] tracking-wide transition-colors ${
                  cat === c.id ? "text-navy-800" : "text-ink-500 hover:text-navy-700"
                }`}
              >
                {c.label}
                <span
                  className={`absolute inset-x-3 bottom-0 h-[2px] origin-left bg-amber-500 transition-transform duration-300 ${
                    cat === c.id ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-14 sm:px-8 lg:px-12 lg:py-20">
        {/* カテゴリ説明 */}
        {activeCategory && (
          <Reveal>
            <div className="mb-12 grid gap-6 border-l-2 border-amber-500 pl-7 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
              <div>
                <span className="label-en text-amber-600">{activeCategory.en}</span>
                <h2 className="serif mt-3.5 text-[22px] leading-[1.6] text-ink-900">
                  {activeCategory.label}
                </h2>
                <p className="mt-2 text-[12.5px] text-ink-500">{activeCategory.lead}</p>
              </div>
              <p className="text-[13px] leading-[2.1] text-ink-600">{activeCategory.desc}</p>
            </div>
          </Reveal>
        )}

        {/* 絞り込み */}
        <div className="mb-10 flex flex-col gap-5 border-y border-ink-200 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="thin-scroll flex items-center gap-2 overflow-x-auto">
            <span className="shrink-0 text-[11px] tracking-wide text-ink-400">分類</span>
            <button
              onClick={() => setGroup("all")}
              className={`shrink-0 border px-3.5 py-1.5 text-[12px] transition-colors ${
                group === "all"
                  ? "border-navy-800 bg-navy-800 text-white"
                  : "border-ink-200 text-ink-600 hover:border-ink-400"
              }`}
            >
              すべて
            </button>
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={`shrink-0 border px-3.5 py-1.5 text-[12px] transition-colors ${
                  group === g
                    ? "border-navy-800 bg-navy-800 text-white"
                    : "border-ink-200 text-ink-600 hover:border-ink-400"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-[12px] text-ink-600">
              <input
                type="checkbox"
                checked={ictOnly}
                onChange={(e) => setIctOnly(e.target.checked)}
                className="h-3.5 w-3.5 accent-navy-700"
              />
              ICT 対応機のみ
            </label>
            <div className="flex min-w-0 items-center gap-2 border border-ink-200 px-3 py-2">
              <Search size={14} className="shrink-0 text-ink-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="機種名・型式で検索"
                aria-label="機械を検索"
                className="w-40 min-w-0 bg-transparent text-[12.5px] outline-none placeholder:text-ink-400 sm:w-52"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="shrink-0 text-ink-400 hover:text-ink-700"
                  aria-label="検索語を消す"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="mb-8 text-[12px] text-ink-500">
          {loading ? (
            "検索しています…"
          ) : (
            <>
              <span className="tnum text-ink-900">{filtered.length}</span> 機種を表示しています
            </>
          )}
        </p>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<SearchX size={24} strokeWidth={1.4} />}
            title="該当する機種がありません"
            desc="検索語や分類を変えてお試しください。掲載のない機種も、他営業所からの回送やお取り寄せでご用意できる場合があります。"
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={clear}>条件をクリア</Button>
                <Link to="/contact">
                  <Button variant="outline">機種について問い合わせる</Button>
                </Link>
              </div>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m, i) => (
              <MachineCard key={m.id} m={m} index={i} />
            ))}
          </div>
        )}

        {/* 補足 */}
        <Reveal>
          <div className="mt-20 grid gap-8 border border-ink-200 bg-ink-25 p-9 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
            <div>
              <h2 className="serif text-[19px] leading-[1.7] text-ink-900">
                レンタル料金は、お見積りにてご案内しています。
              </h2>
              <p className="mt-4 max-w-2xl text-[13px] leading-[2.05] text-ink-600">
                機種・使用期間・輸送距離・現場条件により料金が異なるため、個別にお見積りを
                作成しています。機種と使用期間をお知らせいただければ、当日中を目安にご回答します。
                機種が決まっていない場合も、工事内容からご提案しますのでご相談ください。
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3">
              <Link to="/contact">
                <Button size="lg" className="w-full">
                  見積・在庫を問い合わせる
                </Button>
              </Link>
              <Link to="/catalog">
                <Button size="lg" variant="outline" className="w-full">
                  カタログを見る
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </>
  );
}
