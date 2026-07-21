import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  Search,
  MapPin,
  Star,
  Trophy,
  SlidersHorizontal,
  Bookmark,
  X,
  Sparkles,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../store";
import { REGIONS, ALL_TAGS, type MenuTag, type RegionKey, type Shop } from "../data/seed";
import { useLoad } from "../lib/useLoad";
import {
  Card,
  Pill,
  Stars,
  Skeleton,
  PhotoTile,
  EmptyState,
  Button,
} from "../components/ui";
import { yen } from "../lib/format";

type Sort = "recommended" | "rating" | "reviews" | "price";
const SORTS: { key: Sort; label: string }[] = [
  { key: "recommended", label: "おすすめ順" },
  { key: "rating", label: "評価が高い順" },
  { key: "reviews", label: "口コミが多い順" },
  { key: "price", label: "料金が安い順" },
];

function BookmarkButton({ shopId }: { shopId: string }) {
  const saved = useStore((s) => s.bookmarks.includes(shopId));
  const toggle = useStore((s) => s.toggleBookmark);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        toggle(shopId);
        toast[saved ? "message" : "success"](saved ? "保存を解除しました" : "保存した店に追加しました");
      }}
      aria-label={saved ? "保存を解除" : "保存する"}
      className={
        "grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition " +
        (saved
          ? "border-brand-200 bg-white text-brand-600"
          : "border-white/40 bg-black/25 text-white hover:bg-black/40")
      }
    >
      <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}

function ShopCard({ shop, rank }: { shop: Shop; rank?: number }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Link to={`/shop/${shop.id}`} className="group block">
        <Card className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
          <div className="relative">
            <PhotoTile hue={shop.hue} rounded="rounded-none" className="h-40 w-full" />
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {typeof rank === "number" && (
                <span className="tnum inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-950 shadow">
                  <Crown size={12} fill="currentColor" strokeWidth={0} /> {rank}位
                </span>
              )}
              {shop.isPromoted && (
                <Pill tone="aqua" className="bg-white/90">
                  <Sparkles size={11} fill="currentColor" strokeWidth={0} /> PR
                </Pill>
              )}
              {shop.isNew && <Pill tone="green" className="bg-white/90">NEW</Pill>}
            </div>
            <div className="absolute right-3 top-3">
              <BookmarkButton shopId={shop.id} />
            </div>
          </div>
          <div className="p-4">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-ink-400">
              <MapPin size={13} /> {shop.pref} {shop.city}
            </div>
            <h3 className="mb-1.5 line-clamp-1 text-[15px] font-bold text-ink-900 group-hover:text-brand-700">
              {shop.name}
            </h3>
            <div className="mb-2 flex items-center gap-1.5">
              <Stars value={shop.rating} />
              <span className="tnum text-sm font-bold text-amber-600">{shop.rating.toFixed(1)}</span>
              <span className="tnum text-xs text-ink-400">口コミ {shop.reviewCount}件</span>
            </div>
            <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-ink-500">{shop.catch}</p>
            <div className="mb-3 flex flex-wrap gap-1">
              {shop.tags.slice(0, 3).map((t) => (
                <Pill key={t} tone="blue">
                  {t}
                </Pill>
              ))}
              {shop.tags.length > 3 && <Pill tone="gray">+{shop.tags.length - 3}</Pill>}
            </div>
            <div className="flex items-center justify-between border-t border-ink-100 pt-3">
              <span className="text-xs text-ink-400">
                料金目安 <span className="tnum text-sm font-bold text-ink-800">{yen(shop.priceFrom)}〜</span>
              </span>
              <span className="text-xs font-semibold text-brand-600 group-hover:underline">詳細を見る →</span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

function CardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

export default function Home() {
  const shops = useStore((s) => s.shops);
  const bookmarks = useStore((s) => s.bookmarks);
  const [params, setParams] = useSearchParams();
  const savedView = params.get("saved") === "1";

  const [q, setQ] = useState("");
  const [region, setRegion] = useState<RegionKey | "all">("all");
  const [tags, setTags] = useState<MenuTag[]>([]);
  const [sort, setSort] = useState<Sort>("recommended");
  const [showFilters, setShowFilters] = useState(false);

  const toggleTag = (t: MenuTag) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  // ランキング(常に全店から評価スコアで算出)
  const ranking = useMemo(
    () =>
      [...shops]
        .sort((a, b) => b.rating * Math.log10(b.reviewCount + 10) - a.rating * Math.log10(a.reviewCount + 10))
        .slice(0, 5),
    [shops],
  );

  const filtered = useMemo(() => {
    let list = shops;
    if (savedView) list = list.filter((s) => bookmarks.includes(s.id));
    if (region !== "all") list = list.filter((s) => s.region === region);
    if (tags.length) list = list.filter((s) => tags.every((t) => s.tags.includes(t)));
    if (q.trim()) {
      const k = q.trim();
      list = list.filter(
        (s) =>
          s.name.includes(k) ||
          s.pref.includes(k) ||
          s.city.includes(k) ||
          s.catch.includes(k) ||
          s.tags.some((t) => t.includes(k)),
      );
    }
    const sorted = [...list];
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else if (sort === "reviews") sorted.sort((a, b) => b.reviewCount - a.reviewCount);
    else if (sort === "price") sorted.sort((a, b) => a.priceFrom - b.priceFrom);
    else sorted.sort((a, b) => Number(b.isPromoted) - Number(a.isPromoted) || b.rating - a.rating);
    return sorted;
  }, [shops, bookmarks, savedView, region, tags, q, sort]);

  // 検索条件が変わるたびに疑似ロード(スケルトン表示)
  const { data, loading } = useLoad(
    () => filtered,
    [savedView, region, tags.join(","), sort, q],
    420,
  );
  const results = data ?? [];
  const activeFilters = (region !== "all" ? 1 : 0) + tags.length + (q.trim() ? 1 : 0);

  return (
    <div className="space-y-8">
      {/* ヒーロー検索 */}
      {!savedView && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 px-5 py-9 text-white sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-aqua-400/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-brand-400/25 blur-3xl" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles size={13} fill="currentColor" strokeWidth={0} /> 全国 {shops.length} 店舗を掲載
            </span>
            <h1 className="mt-3 text-2xl font-extrabold leading-snug sm:text-3xl">
              愛車を、もっと美しく。
              <br className="hidden sm:block" />
              近くのカーコーティング店を探そう。
            </h1>
            <p className="mt-2 text-sm text-white/80">
              エリアと施工メニューから、あなたにぴったりの専門店が見つかります。
            </p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="店名・エリア・施工内容で検索（例：ガラスコーティング 横浜）"
                  className="w-full rounded-xl border border-white/20 bg-white py-3.5 pl-11 pr-4 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:ring-4 focus:ring-white/25"
                />
              </div>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as RegionKey | "all")}
                className="rounded-xl border border-white/20 bg-white px-4 py-3.5 text-sm font-medium text-ink-800 outline-none focus:ring-4 focus:ring-white/25"
              >
                <option value="all">エリアを選ぶ</option>
                {REGIONS.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {ALL_TAGS.slice(0, 6).map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={
                    "rounded-full px-3 py-1 text-xs font-medium transition " +
                    (tags.includes(t)
                      ? "bg-white text-brand-700"
                      : "bg-white/12 text-white hover:bg-white/20")
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ランキング */}
      {!savedView && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="text-amber-500" size={20} fill="currentColor" strokeWidth={0} />
            <h2 className="text-lg font-bold text-ink-900">今週の人気ランキング</h2>
            <span className="text-xs text-ink-400">口コミ評価をもとに集計</span>
          </div>
          <div className="thin-scroll -mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
            {ranking.map((s, i) => (
              <Link key={s.id} to={`/shop/${s.id}`} className="group w-64 shrink-0 snap-start">
                <Card className="flex h-full items-center gap-3 p-3 transition hover:shadow-md">
                  <div className="relative">
                    <PhotoTile hue={s.hue} className="h-16 w-16" icon={false} />
                    <span className="tnum absolute -left-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-amber-400 text-xs font-extrabold text-amber-950 shadow">
                      {i + 1}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 text-sm font-bold text-ink-900 group-hover:text-brand-700">
                      {s.name}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1">
                      <Star size={12} className="text-amber-400" fill="currentColor" strokeWidth={0} />
                      <span className="tnum text-xs font-bold text-amber-600">{s.rating.toFixed(1)}</span>
                      <span className="tnum text-[11px] text-ink-400">({s.reviewCount})</span>
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-[11px] text-ink-400">{s.pref} {s.city}</div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 検索結果 */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-ink-900">
              {savedView ? "保存した店" : "検索結果"}
            </h2>
            <span className="tnum text-sm text-ink-400">{loading ? "…" : `${results.length}件`}</span>
            {activeFilters > 0 && !savedView && (
              <Pill tone="blue">絞り込み {activeFilters}</Pill>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-50 sm:hidden"
            >
              <SlidersHorizontal size={15} /> 絞り込み
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 outline-none focus:border-brand-400"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 施工メニュー絞り込み(チップ) */}
        <div className={(showFilters ? "flex" : "hidden") + " mb-4 flex-wrap gap-1.5 sm:flex"}>
          <button
            onClick={() => {
              setRegion("all");
              setTags([]);
              setQ("");
            }}
            className={
              "rounded-full border px-3 py-1 text-xs font-medium transition " +
              (activeFilters === 0
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-ink-200 bg-white text-ink-600 hover:border-brand-300")
            }
          >
            すべて
          </button>
          {ALL_TAGS.map((t) => (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              className={
                "rounded-full border px-3 py-1 text-xs font-medium transition " +
                (tags.includes(t)
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-ink-200 bg-white text-ink-600 hover:border-brand-300")
              }
            >
              {t}
            </button>
          ))}
        </div>

        {/* アクティブな条件チップ */}
        {activeFilters > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {region !== "all" && (
              <button
                onClick={() => setRegion("all")}
                className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
              >
                {REGIONS.find((r) => r.key === region)?.label} <X size={12} />
              </button>
            )}
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
              >
                {t} <X size={12} />
              </button>
            ))}
            {q.trim() && (
              <button
                onClick={() => setQ("")}
                className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
              >
                「{q}」 <X size={12} />
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : results.length === 0 ? (
          savedView ? (
            <EmptyState
              icon={<Bookmark size={26} />}
              title="保存した店舗はまだありません"
              description="気になる店舗のブックマークを押すと、ここに一覧で表示されます。"
              action={
                <Button onClick={() => setParams({})}>店舗をさがす</Button>
              }
            />
          ) : (
            <EmptyState
              icon={<Search size={26} />}
              title="該当する店舗が見つかりませんでした"
              description="エリアや施工メニューの条件を変えて、もう一度お試しください。"
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setRegion("all");
                    setTags([]);
                    setQ("");
                  }}
                >
                  条件をリセット
                </Button>
              }
            />
          )
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((s) => (
              <ShopCard
                key={s.id}
                shop={s}
                rank={
                  sort === "recommended" && !savedView && activeFilters === 0
                    ? ranking.findIndex((r) => r.id === s.id) + 1 || undefined
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
