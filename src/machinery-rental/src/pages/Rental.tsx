import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  PackageSearch,
  Satellite,
  SearchX,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { BRANCHES, CATEGORIES, MACHINES, type CategoryId } from "../data/seed";
import { MachineCard } from "../components/MachineCard";
import { Badge, Button, EmptyState, MachineCardSkeleton } from "../components/ui";
import { fakeApi } from "../lib/fakeApi";
import { useStore } from "../store";

type SortKey = "popular" | "price-asc" | "price-desc" | "weight-asc" | "weight-desc";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "popular", label: "おすすめ順" },
  { id: "price-asc", label: "料金が安い順" },
  { id: "price-desc", label: "料金が高い順" },
  { id: "weight-asc", label: "小さい機械順" },
  { id: "weight-desc", label: "大きい機械順" },
];

const PER_PAGE = 9;

export default function Rental() {
  const [params, setParams] = useSearchParams();
  const favorites = useStore((s) => s.favorites);

  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(params.get("q") ?? "");
  const [cats, setCats] = useState<CategoryId[]>(
    params.get("cat") ? [params.get("cat") as CategoryId] : [],
  );
  const [branch, setBranch] = useState<string>(params.get("branch") ?? "all");
  const [ictOnly, setIctOnly] = useState(params.get("ict") === "1");
  const [favOnly, setFavOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("popular");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  /* 初回・条件変更時に疑似APIでロード */
  useEffect(() => {
    let alive = true;
    setLoading(true);
    fakeApi(true, 420).then(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [q, cats, branch, ictOnly, favOnly]);

  /* URL に検索条件を反映(共有・リロード対応) */
  useEffect(() => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (cats.length === 1) next.set("cat", cats[0]);
    if (branch !== "all") next.set("branch", branch);
    if (ictOnly) next.set("ict", "1");
    setParams(next, { replace: true });
    setPage(1);
  }, [q, cats, branch, ictOnly, setParams]);

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    let list = MACHINES.filter((m) => {
      if (cats.length && !cats.includes(m.category)) return false;
      if (ictOnly && !m.ict) return false;
      if (favOnly && !favorites.includes(m.id)) return false;
      if (branch !== "all" && (m.stock[branch] ?? 0) === 0) return false;
      if (!key) return true;
      const hay = [
        m.name,
        m.model,
        m.summary,
        m.classLabel,
        ...m.tags,
        CATEGORIES.find((c) => c.id === m.category)?.label ?? "",
        m.ict ? "ICT" : "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(key);
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.dayRate - b.dayRate;
        case "price-desc":
          return b.dayRate - a.dayRate;
        case "weight-asc":
          return a.weightT - b.weightT;
        case "weight-desc":
          return b.weightT - a.weightT;
        default:
          return (
            Number(b.popular) - Number(a.popular) ||
            b.rating - a.rating ||
            b.reviews - a.reviews
          );
      }
    });
    return list;
  }, [q, cats, branch, ictOnly, favOnly, favorites, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const shown = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const activeCount =
    (q ? 1 : 0) + cats.length + (branch !== "all" ? 1 : 0) + (ictOnly ? 1 : 0) + (favOnly ? 1 : 0);

  const clearAll = () => {
    setQ("");
    setCats([]);
    setBranch("all");
    setIctOnly(false);
    setFavOnly(false);
  };

  const toggleCat = (id: CategoryId) =>
    setCats((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  /* ---------- フィルタ本体(PC=サイドバー / SP=ドロワー) ---------- */
  const FilterBody = (
    <div className="space-y-7">
      <div>
        <p className="mb-3 text-[11px] font-black tracking-wider text-ink-900">カテゴリ</p>
        <div className="space-y-1">
          {CATEGORIES.map((c) => {
            const n = MACHINES.filter((m) => m.category === c.id).length;
            const on = cats.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleCat(c.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[12.5px] font-bold transition-colors ${
                  on ? "bg-sun-100 text-sun-900" : "text-ink-600 hover:bg-ink-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`grid h-4 w-4 place-items-center rounded border transition-colors ${
                      on ? "border-sun-600 bg-sun-600" : "border-ink-300 bg-white"
                    }`}
                  >
                    {on && (
                      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
                        <path
                          d="M2 6 L5 9 L10 3"
                          fill="none"
                          stroke="white"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  {c.label}
                </span>
                <span className="tnum text-[10.5px] font-bold text-ink-400">{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-black tracking-wider text-ink-900">受取り営業所</p>
        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2.5 text-[12.5px] font-bold text-ink-700 outline-none transition-colors focus:border-sea-500"
        >
          <option value="all">すべての営業所</option>
          {BRANCHES.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}({b.area})
            </option>
          ))}
        </select>
        <p className="mt-2 text-[11px] leading-relaxed text-ink-400">
          選択すると、その営業所に在庫のある機種だけを表示します。
        </p>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-black tracking-wider text-ink-900">こだわり条件</p>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] font-bold text-ink-600 transition-colors hover:bg-ink-100">
            <input
              type="checkbox"
              checked={ictOnly}
              onChange={(e) => setIctOnly(e.target.checked)}
              className="h-4 w-4 accent-sea-600"
            />
            <Satellite size={14} className="text-sea-600" />
            ICT 対応機のみ
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] font-bold text-ink-600 transition-colors hover:bg-ink-100">
            <input
              type="checkbox"
              checked={favOnly}
              onChange={(e) => setFavOnly(e.target.checked)}
              className="h-4 w-4 accent-ng-500"
            />
            <Heart size={14} className="text-ng-500" />
            お気に入りのみ({favorites.length})
          </label>
        </div>
      </div>

      {activeCount > 0 && (
        <Button variant="outline" size="sm" className="w-full" onClick={clearAll}>
          <X size={14} /> 条件をクリア
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* ページヘッダ */}
      <div className="mesh-soft border-b border-ink-200">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <p className="text-[11px] font-black tracking-[0.18em] text-sun-800">RENTAL LINEUP</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">
            レンタル機械を探す
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-600">
            全 {MACHINES.length} 機種。各営業所の在庫と空き予定日をその場で確認し、
            そのまま見積カートに追加できます。
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:flex lg:px-8">
        {/* サイドバー(PC) */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-ink-200 bg-white p-5">
            <div className="mb-5 flex items-center gap-2 border-b border-ink-200 pb-4">
              <SlidersHorizontal size={16} className="text-ink-500" />
              <p className="text-[13px] font-black text-ink-900">絞り込み</p>
              {activeCount > 0 && (
                <span className="tnum ml-auto rounded-full bg-sun-500 px-2 py-0.5 text-[10px] font-black text-ink-900">
                  {activeCount}
                </span>
              )}
            </div>
            {FilterBody}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* 検索・並び替えバー */}
          <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-ink-200 bg-white/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:rounded-2xl lg:border lg:bg-white lg:px-4 lg:py-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex w-full min-w-0 items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-2 sm:w-auto sm:flex-1">
                <PackageSearch size={16} className="shrink-0 text-ink-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="機種名・型式・用途で検索"
                  className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-ink-400"
                  aria-label="機械を検索"
                />
                {q && (
                  <button
                    onClick={() => setQ("")}
                    className="shrink-0 rounded-full p-1 text-ink-400 hover:bg-ink-100"
                    aria-label="検索語を消す"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                onClick={() => setFilterOpen(true)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3.5 py-2.5 text-[12.5px] font-bold text-ink-700 lg:hidden"
              >
                <SlidersHorizontal size={14} />
                絞り込み
                {activeCount > 0 && (
                  <span className="tnum grid h-4 min-w-4 place-items-center rounded-full bg-sun-500 px-1 text-[10px] font-black text-ink-900">
                    {activeCount}
                  </span>
                )}
              </button>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="shrink-0 rounded-full border border-ink-200 bg-white px-3 py-2.5 text-[12.5px] font-bold text-ink-700 outline-none"
                aria-label="並び替え"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 適用中のチップ */}
            {activeCount > 0 && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {cats.map((c) => (
                  <button key={c} onClick={() => toggleCat(c)}>
                    <Badge tone="sun">
                      {CATEGORIES.find((x) => x.id === c)?.label} <X size={11} />
                    </Badge>
                  </button>
                ))}
                {branch !== "all" && (
                  <button onClick={() => setBranch("all")}>
                    <Badge tone="sea">
                      {BRANCHES.find((b) => b.id === branch)?.name} <X size={11} />
                    </Badge>
                  </button>
                )}
                {ictOnly && (
                  <button onClick={() => setIctOnly(false)}>
                    <Badge tone="sea">
                      ICT 対応のみ <X size={11} />
                    </Badge>
                  </button>
                )}
                {favOnly && (
                  <button onClick={() => setFavOnly(false)}>
                    <Badge tone="ng">
                      お気に入り <X size={11} />
                    </Badge>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 件数 */}
          <p className="mb-5 text-[12.5px] font-bold text-ink-500">
            {loading ? (
              "検索しています…"
            ) : (
              <>
                <span className="tnum text-ink-900">{filtered.length}</span> 件の機械が見つかりました
                {pageCount > 1 && (
                  <span className="tnum ml-2 font-normal text-ink-400">
                    ({current} / {pageCount} ページ)
                  </span>
                )}
              </>
            )}
          </p>

          {/* 一覧 */}
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <MachineCardSkeleton key={i} />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <EmptyState
              icon={<SearchX size={28} />}
              title="該当する結果がありません"
              desc="キーワードや絞り込み条件を変えてお試しください。在庫のない機種も、他営業所からの回送でご用意できる場合があります。"
              action={
                <Button variant="secondary" onClick={clearAll}>
                  条件をクリアして再検索
                </Button>
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((m, i) => (
                <MachineCard key={m.id} m={m} index={i} />
              ))}
            </div>
          )}

          {/* ページネーション */}
          {!loading && pageCount > 1 && (
            <div className="mt-10 flex items-center justify-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={current === 1}
                className="grid h-9 w-9 place-items-center rounded-full border border-ink-200 bg-white text-ink-600 transition-colors hover:bg-ink-100 disabled:opacity-40"
                aria-label="前のページ"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`tnum h-9 min-w-9 rounded-full px-3 text-[12.5px] font-bold transition-colors ${
                    current === i + 1
                      ? "bg-ink-900 text-white"
                      : "border border-ink-200 bg-white text-ink-600 hover:bg-ink-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={current === pageCount}
                className="grid h-9 w-9 place-items-center rounded-full border border-ink-200 bg-white text-ink-600 transition-colors hover:bg-ink-100 disabled:opacity-40"
                aria-label="次のページ"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* モバイル用フィルタドロワー */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
              className="fixed inset-0 z-[70] bg-ink-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-x-0 bottom-0 z-[71] max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-[var(--shadow-pop)] lg:hidden"
            >
              <div className="mb-5 flex items-center justify-between">
                <p className="text-[15px] font-black text-ink-900">絞り込み</p>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full text-ink-500 hover:bg-ink-100"
                  aria-label="閉じる"
                >
                  <X size={18} />
                </button>
              </div>
              {FilterBody}
              <Button
                variant="secondary"
                size="lg"
                className="mt-6 w-full"
                onClick={() => setFilterOpen(false)}
              >
                {filtered.length} 件を表示
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
