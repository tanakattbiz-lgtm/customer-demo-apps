import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Search, MapPin, Video, CalendarCheck, SearchX } from "lucide-react";
import { EXPERTS, QUALIFICATIONS, AREAS } from "../data/experts";
import { Chip, SkeletonBlock, Stars } from "../components/ui";
import { fakeApi } from "../lib/fakeApi";

export function Experts() {
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [qual, setQual] = useState<string | null>(null);
  const [area, setArea] = useState<string | null>(null);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [sort, setSort] = useState<"rating" | "cases" | "reviews">("rating");

  useEffect(() => {
    fakeApi(null, 500).then(() => setLoading(false));
  }, []);

  const list = useMemo(() => {
    return EXPERTS.filter((e) => {
      if (qual && e.qualification !== qual) return false;
      if (area && e.area !== area) return false;
      if (onlineOnly && !e.online) return false;
      if (q) {
        const hay = [e.name, e.kana, e.office, e.area, ...e.specialties].join(" ");
        if (!hay.toLowerCase().includes(q.toLowerCase())) return false;
      }
      return true;
    }).sort((a, b) => b[sort] - a[sort]);
  }, [q, qual, area, onlineOnly, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-en text-xs font-bold uppercase tracking-[0.2em] text-primary-600">
        Experts
      </p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
        専門家をさがす
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        得意分野・地域・資格で絞り込んで、相談したい専門家を自由に指名できます。
      </p>

      {/* 検索・フィルタ */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="名前・事務所名・得意分野で検索(例: 相続、法人化)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 pl-11 pr-4 text-sm outline-none transition-shadow duration-200 focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400">資格:</span>
          <Chip active={qual === null} onClick={() => setQual(null)}>すべて</Chip>
          {QUALIFICATIONS.map((x) => (
            <Chip key={x} active={qual === x} onClick={() => setQual(qual === x ? null : x)}>{x}</Chip>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400">地域:</span>
          <Chip active={area === null} onClick={() => setArea(null)}>すべて</Chip>
          {AREAS.map((x) => (
            <Chip key={x} active={area === x} onClick={() => setArea(area === x ? null : x)}>{x}</Chip>
          ))}
          <Chip active={onlineOnly} onClick={() => setOnlineOnly(!onlineOnly)}>オンライン相談可</Chip>
        </div>
      </div>

      {/* 件数 + 並び替え */}
      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {loading ? "検索中…" : (
            <><span className="font-en font-extrabold text-ink">{list.length}</span> 名の専門家</>
          )}
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 outline-none focus:border-primary-400"
        >
          <option value="rating">評価が高い順</option>
          <option value="cases">実績件数順</option>
          <option value="reviews">口コミが多い順</option>
        </select>
      </div>

      {/* 一覧 */}
      {loading ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
          <SearchX size={32} className="text-slate-300" />
          <p className="mt-3 text-sm font-bold text-slate-600">該当する専門家が見つかりませんでした</p>
          <p className="mt-1 text-xs text-slate-400">検索条件やフィルタを変更してお試しください。</p>
          <button
            onClick={() => { setQ(""); setQual(null); setArea(null); setOnlineOnly(false); }}
            className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
          >
            条件をクリア
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {list.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.03, ease: "easeOut" }}
            >
              <Link
                to={`/experts/${e.id}`}
                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md"
              >
                <div className="flex items-start gap-3.5">
                  <span
                    className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{ background: e.color, width: 52, height: 52 }}
                  >
                    {e.name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-bold">{e.name}</p>
                      <span className="rounded bg-primary-50 px-1.5 py-0.5 text-[10px] font-bold text-primary-700">
                        {e.qualification}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{e.office}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin size={11} /> {e.area}・{e.station}
                    </p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-[13px] leading-6 text-slate-600">{e.message}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {e.specialties.map((s) => (
                    <span key={s} className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-500" style={{ marginTop: "auto", paddingTop: 12 }}>
                  <span className="flex items-center gap-1">
                    <Stars rating={e.rating} />
                    <span className="font-en font-bold text-ink">{e.rating}</span>({e.reviews})
                  </span>
                  <span>実績 {e.cases}件</span>
                  {e.online && <span className="flex items-center gap-1 text-primary-600"><Video size={11} />オンライン可</span>}
                  {e.weekend && <span className="flex items-center gap-1"><CalendarCheck size={11} />土日対応</span>}
                  <span className="ml-auto font-bold text-primary-700">{e.fee}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
