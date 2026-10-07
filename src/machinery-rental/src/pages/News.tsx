import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Inbox } from "lucide-react";
import { NEWS, type NewsCategory } from "../data/seed";
import { EmptyState, PageHead, Reveal, Skeleton, Tag } from "../components/ui";
import { fakeApi } from "../lib/fakeApi";

const CATEGORIES: (NewsCategory | "すべて")[] = [
  "すべて",
  "お知らせ",
  "新商品",
  "ICT建機",
  "イベント",
  "採用",
];

export default function News() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("すべて");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fakeApi(true, 360).then(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [cat]);

  const list = useMemo(
    () => (cat === "すべて" ? NEWS : NEWS.filter((n) => n.category === cat)),
    [cat],
  );

  return (
    <>
      <PageHead
        en="News"
        ja="お知らせ"
        lead="新機種の導入、実演会のご案内、営業に関するお知らせを掲載しています。"
        breadcrumb={[{ label: "ホーム", to: "/" }, { label: "お知らせ" }]}
      />

      <div className="mx-auto max-w-[1200px] px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,200px)_1fr] lg:gap-16">
          {/* カテゴリ */}
          <aside>
            <p className="label-en mb-5 text-ink-400">Category</p>
            <div className="thin-scroll flex gap-2 overflow-x-auto lg:flex-col lg:gap-0">
              {CATEGORIES.map((c) => {
                const n = c === "すべて" ? NEWS.length : NEWS.filter((x) => x.category === c).length;
                const on = cat === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    className={`flex shrink-0 items-center justify-between gap-3 whitespace-nowrap border px-4 py-2.5 text-[12.5px] transition-colors lg:border-0 lg:border-b lg:border-ink-200 lg:px-1 lg:py-3.5 ${
                      on
                        ? "border-navy-800 bg-navy-800 text-white lg:bg-transparent lg:text-navy-800"
                        : "border-ink-200 text-ink-600 hover:text-navy-700"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`hidden h-3.5 w-[2px] lg:block ${on ? "bg-amber-500" : "bg-transparent"}`}
                      />
                      {c}
                    </span>
                    <span className="tnum text-[10.5px] opacity-60">{n}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* 一覧 */}
          <div>
            {loading ? (
              <div className="border-t border-ink-200">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="border-b border-ink-200 py-7">
                    <Skeleton className="mb-3 h-3 w-40" />
                    <Skeleton className="mb-2.5 h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : list.length === 0 ? (
              <EmptyState
                icon={<Inbox size={24} strokeWidth={1.4} />}
                title="該当するお知らせはありません"
                desc="別のカテゴリをお選びください。"
              />
            ) : (
              <div className="border-t border-ink-200">
                {list.map((n, i) => (
                  <Reveal key={n.id} delay={Math.min(i * 0.05, 0.25)}>
                    <Link
                      to={`/news/${n.id}`}
                      className="group block border-b border-ink-200 py-7 transition-colors hover:bg-ink-25"
                    >
                      <div className="flex items-center gap-4">
                        <time className="tnum text-[11.5px] text-ink-400">
                          {n.date.replace(/-/g, ".")}
                        </time>
                        <Tag tone={n.category === "新商品" ? "amber" : "outline"}>
                          {n.category}
                        </Tag>
                      </div>
                      <h2 className="serif mt-3.5 flex items-start gap-3 text-[16px] leading-[1.75] text-ink-900 transition-colors group-hover:text-navy-700">
                        <span className="underline-grow">{n.title}</span>
                        <ArrowUpRight
                          size={15}
                          className="mt-1.5 shrink-0 text-ink-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </h2>
                      <p className="mt-3 text-[12.5px] leading-[2] text-ink-600">{n.lead}</p>
                    </Link>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
