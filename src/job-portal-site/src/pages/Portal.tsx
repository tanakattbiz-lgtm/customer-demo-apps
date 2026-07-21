import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, MapPin, ChevronDown, SlidersHorizontal, Frown, Heart } from "lucide-react";
import { useStore } from "../store";
import {
  PREFECTURES,
  REGIONS,
  CATEGORIES,
  type Category,
} from "../data/seed";
import { wageSort } from "../lib/format";
import { useLoad } from "../lib/useLoad";
import { CategoryIcon } from "../components/CategoryIcon";
import { JobCard } from "../components/JobCard";
import { Button, Skeleton, EmptyState, Tag } from "../components/ui";

type Sort = "new" | "wage";

const APPEALS = [
  "未経験からでも大丈夫。",
  "はじめての正社員、応援します。",
  "あなたに合う仕事、きっとある。",
];

export default function Portal() {
  const jobs = useStore((s) => s.jobs).filter((j) => j.published);
  const savedCount = useStore((s) => s.savedIds.length);

  const [pref, setPref] = useState("");
  const [city, setCity] = useState("");
  const [keyword, setKeyword] = useState("");
  const [cat, setCat] = useState<Category | "">("");
  const [sort, setSort] = useState<Sort>("new");

  const sig = `${pref}|${city}|${keyword}|${cat}|${sort}`;
  const loading = useLoad(460, [sig]);

  const results = useMemo(() => {
    const kw = keyword.trim();
    const list = jobs.filter((j) => {
      if (pref && j.prefecture !== pref) return false;
      if (city && j.city !== city) return false;
      if (cat && j.category !== cat) return false;
      if (kw && !`${j.title}${j.company}${j.catch}${j.tags.join("")}`.includes(kw))
        return false;
      return true;
    });
    list.sort((a, b) =>
      sort === "wage"
        ? wageSort(b.wage) - wageSort(a.wage)
        : +new Date(b.postedAt) - +new Date(a.postedAt),
    );
    return list;
  }, [jobs, pref, city, keyword, cat, sort]);

  const cities = pref ? REGIONS[pref] : [];
  const hasFilter = !!(pref || city || keyword || cat);

  const clear = () => {
    setPref("");
    setCity("");
    setKeyword("");
    setCat("");
  };

  return (
    <div>
      {/* ===== ヒーロー + 検索 ===== */}
      <section className="hero-glow border-b border-brand-100">
        <div className="mx-auto max-w-5xl px-4 pt-10 pb-8 sm:pt-16 sm:pb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Tag tone="brand" className="mb-4 !px-3 !py-1 text-sm">
              未経験・はじめての正社員 応援サイト
            </Tag>
            <h1 className="text-3xl leading-tight font-bold text-ink-900 sm:text-[2.7rem]">
              「自分にもできるかも」から、
              <br className="hidden sm:block" />
              <span className="text-brand-600">次の一歩</span>を見つけよう。
            </h1>
            <p className="mt-3 max-w-xl text-ink-600">
              むずかしい条件はナシ。住んでいる地域から、あなたに合ったお仕事をかんたんに探せます。
            </p>
          </motion.div>

          {/* 検索カード */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-6 rounded-3xl border border-brand-100 bg-white p-4 shadow-xl shadow-brand-600/5 sm:p-5"
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1.4fr]">
              <label className="block">
                <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-ink-500">
                  <MapPin size={13} /> 都道府県
                </span>
                <div className="relative">
                  <select
                    value={pref}
                    onChange={(e) => {
                      setPref(e.target.value);
                      setCity("");
                    }}
                    className="w-full appearance-none rounded-xl border border-ink-200 bg-white px-3.5 py-3 text-sm font-medium text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25"
                  >
                    <option value="">すべての地域</option>
                    {PREFECTURES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-400"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-ink-500">
                  市区町村
                </span>
                <div className="relative">
                  <select
                    value={city}
                    disabled={!pref}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-ink-200 bg-white px-3.5 py-3 text-sm font-medium text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25 disabled:bg-ink-50 disabled:text-ink-400"
                  >
                    <option value="">{pref ? "市区町村を選ぶ" : "先に都道府県を選択"}</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-400"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-ink-500">
                  キーワード
                </span>
                <div className="relative">
                  <Search
                    size={16}
                    className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-400"
                  />
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="例) 倉庫、寮あり、土日休み"
                    className="w-full rounded-xl border border-ink-200 bg-white py-3 pr-3.5 pl-10 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25"
                  />
                </div>
              </label>
            </div>

            {/* 職種チップ */}
            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const active = cat === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => setCat(active ? "" : c.key)}
                    className={
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition " +
                      (active
                        ? "border-brand-500 bg-brand-500 text-white"
                        : "border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-600")
                    }
                  >
                    <CategoryIcon category={c.key} size={15} />
                    {c.key}
                  </button>
                );
              })}
            </div>
          </motion.div>

          <p className="mt-4 text-center text-sm font-medium text-mint-700">
            {APPEALS[Math.min(APPEALS.length - 1, results.length % APPEALS.length)]}
          </p>
        </div>
      </section>

      {/* ===== 結果一覧 ===== */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-ink-900">
              {hasFilter ? "検索結果" : "新着のお仕事"}
            </h2>
            {!loading && (
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-bold text-brand-600 tnum">
                {results.length}件
              </span>
            )}
            {savedCount > 0 && (
              <Tag tone="gray" className="ml-1">
                <Heart size={12} fill="currentColor" /> 気になる {savedCount}
              </Tag>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasFilter && (
              <Button variant="ghost" size="sm" onClick={clear}>
                条件をクリア
              </Button>
            )}
            <div className="relative">
              <SlidersHorizontal
                size={14}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400"
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="appearance-none rounded-full border border-ink-200 bg-white py-2 pr-8 pl-8 text-sm font-semibold text-ink-700 outline-none focus:border-brand-400"
              >
                <option value="new">新着順</option>
                <option value="wage">給与が高い順</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-ink-400"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-ink-200 bg-white p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="mb-2 h-5 w-full" />
                <Skeleton className="mb-3 h-4 w-2/3" />
                <Skeleton className="mb-3 h-4 w-1/2" />
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={<Frown size={30} />}
            title="条件に合うお仕事が見つかりませんでした"
            description="地域や職種をひろげると、もっとたくさんのお仕事が見つかります。まずは条件をクリアしてみましょう。"
            action={
              <Button variant="soft" onClick={clear}>
                条件をクリアして探す
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((j, i) => (
              <JobCard key={j.id} job={j} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
