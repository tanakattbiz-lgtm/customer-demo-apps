import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  ChevronRight,
  Gauge,
  MapPin,
  Recycle,
  Satellite,
  Search,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";
import {
  CASES,
  CATEGORIES,
  ICT_EFFECT,
  MACHINES,
  NEWS,
  STRENGTHS,
} from "../data/seed";
import { MachineArt } from "../components/MachineArt";
import { MachineCard } from "../components/MachineCard";
import { Badge, Button, CountUp, Reveal, SectionHeading } from "../components/ui";
import { relativeDay } from "../lib/format";

/* =========================================================
   トップページ
   ========================================================= */

function Hero() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  return (
    <section className="mesh-light relative overflow-hidden">
      <div className="grid-paper absolute inset-0" aria-hidden />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:px-8 lg:pb-28 lg:pt-20">
        <div>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-sun-300 bg-white/80 px-3.5 py-1.5 text-[11.5px] font-bold text-sun-900 backdrop-blur"
          >
            <Sparkles size={13} />
            山陰 6 営業所 / 保有 482 台 / ICT 建機 38 台
          </motion.div>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-[2.6rem] font-black leading-[1.08] tracking-tight text-ink-900 sm:text-6xl lg:text-[4.1rem]"
          >
            借りて終わり、
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">にしない。</span>
              <motion.span
                initial={reduce ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ originX: 0 }}
                className="absolute inset-x-0 bottom-1.5 z-0 h-4 rounded-sm bg-sun-400/70 sm:bottom-2 sm:h-5"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-lg text-[15px] leading-[1.9] text-ink-600 sm:text-base"
          >
            機械を届けるだけなら、どこでもできます。私たちは、現場が動き出すところまで一緒に走る
            レンタル会社です。ICT 建機の初期設定から、急なトラブルの代替機手配まで。
            <span className="font-bold text-ink-900">山陰の現場の、いちばん近くに。</span>
          </motion.p>

          {/* クイック検索 */}
          <motion.form
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={(e) => {
              e.preventDefault();
              navigate(q.trim() ? `/rental?q=${encodeURIComponent(q.trim())}` : "/rental");
            }}
            className="mt-8 flex max-w-xl items-center gap-2 rounded-full border border-ink-200 bg-white p-1.5 shadow-[var(--shadow-lift)]"
          >
            <Search size={18} className="ml-3 shrink-0 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="機種名・型式で探す(例: ミニショベル、ICT、発電機)"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-[13.5px] outline-none placeholder:text-ink-400"
              aria-label="機械を検索"
            />
            <Button type="submit" variant="secondary" className="shrink-0">
              検索
            </Button>
          </motion.form>

          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-4 flex flex-wrap gap-2"
          >
            {["ミニショベル 3t", "ICT", "除雪", "発電機", "高所作業車"].map((t) => (
              <button
                key={t}
                onClick={() => navigate(`/rental?q=${encodeURIComponent(t)}`)}
                className="rounded-full border border-ink-200 bg-white/70 px-3 py-1.5 text-[11.5px] font-bold text-ink-500 transition-colors hover:border-sun-400 hover:bg-white hover:text-ink-900"
              >
                {t}
              </button>
            ))}
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link to="/simulator">
              <Button size="lg">
                料金をシミュレーションする <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/ict">
              <Button size="lg" variant="outline">
                <Satellite size={16} /> ICT 建機を見る
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* ヒーロービジュアル */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/60 p-2 shadow-[var(--shadow-pop)] backdrop-blur">
            <MachineArt
              kind="excavator"
              idKey="hero"
              className="w-full rounded-[22px]"
            />
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]"
              aria-hidden
            >
              <div
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/55 to-transparent"
                style={{ animation: "sheen 4.5s ease-in-out infinite" }}
              />
            </div>
          </div>

          {/* 浮遊カード */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="absolute -left-2 bottom-6 rounded-2xl border border-ink-200 bg-white/95 px-4 py-3 shadow-[var(--shadow-lift)] backdrop-blur sm:-left-6"
          >
            <p className="text-[10px] font-bold tracking-wide text-ink-400">最短お届け</p>
            <p className="mt-0.5 text-lg font-black leading-none text-ink-900">
              当日<span className="ml-1 text-xs font-bold text-ink-500">出し対応</span>
            </p>
            <p className="mt-1.5 flex items-center gap-1 text-[10.5px] font-bold text-ok-700">
              <MapPin size={11} /> 米子・松江ほか 6 拠点
            </p>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.68 }}
            className="absolute -right-1 top-6 rounded-2xl border border-sea-200 bg-white/95 px-4 py-3 shadow-[var(--shadow-lift)] backdrop-blur sm:-right-4"
          >
            <p className="flex items-center gap-1 text-[10px] font-bold tracking-wide text-sea-600">
              <Satellite size={11} /> ICT 施工実績
            </p>
            <p className="tnum mt-0.5 text-lg font-black leading-none text-ink-900">
              <CountUp to={214} /> 現場
            </p>
            <p className="mt-1.5 text-[10.5px] font-bold text-ink-400">丁張り工数 -82%</p>
          </motion.div>
        </motion.div>
      </div>

      {/* 数字ストリップ */}
      <div className="relative border-y border-ink-200 bg-white/70 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-ink-200 px-4 sm:px-6 md:grid-cols-4 md:divide-x lg:px-8">
          {[
            { v: 482, d: 0, unit: "台", label: "保有機械台数" },
            { v: 99.2, d: 1, unit: "%", label: "稼働率(整備品質)" },
            { v: 33, d: 0, unit: "年", label: "山陰での事業年数" },
            { v: 1240, d: 0, unit: "社", label: "お取引先" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06} className="px-2 py-7 text-center md:px-6">
              <p className="text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">
                <CountUp to={s.v} decimals={s.d} />
                <span className="ml-1 text-base font-bold text-sun-700">{s.unit}</span>
              </p>
              <p className="mt-1.5 text-[11.5px] font-bold text-ink-500">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <Reveal>
        <SectionHeading
          eyebrow="Lineup"
          title={
            <>
              現場に合わせて、
              <span className="text-sun-700">10 カテゴリ</span>から。
            </>
          }
          desc="0.8t のミニショベルから 30t クラス、環境リサイクル機械や小物まで。カテゴリを選ぶと、在庫と空き状況をその場で確認できます。"
        />
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c, i) => {
          const count = MACHINES.filter((m) => m.category === c.id).length;
          const featured = i === 0 || i === 5;
          return (
            <Reveal
              key={c.id}
              delay={Math.min(i * 0.04, 0.3)}
              className={`min-w-0 ${featured ? "lg:col-span-2" : ""}`}
            >
              <Link
                to={`/rental?cat=${c.id}`}
                className={`group flex h-full items-center gap-4 overflow-hidden rounded-2xl border border-ink-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-sun-300 hover:shadow-[var(--shadow-lift)] ${
                  featured ? "bg-gradient-to-br from-sun-50 to-white" : ""
                }`}
              >
                <div className="shrink-0 overflow-hidden rounded-xl bg-sun-50">
                  <MachineArt
                    kind={c.art}
                    scene={false}
                    idKey={`cat-${c.id}`}
                    className="h-16 w-24 transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="min-w-0 truncate text-[15px] font-bold text-ink-900">
                      {c.label}
                    </h3>
                    <span className="tnum shrink-0 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold text-ink-500">
                      {count} 機種
                    </span>
                  </div>
                  <p className={`mt-1 text-[12.5px] leading-relaxed text-ink-500 ${featured ? "" : "line-clamp-2"}`}>
                    {c.desc}
                  </p>
                </div>
                <ChevronRight
                  size={18}
                  className="shrink-0 text-ink-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-sun-700"
                />
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function Strengths() {
  const icons = [Truck, Satellite, Wrench, Recycle];
  return (
    <section className="mesh-soft border-y border-ink-200 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Why us"
            align="center"
            title={
              <>
                「機械が届いた」の先に、
                <br className="hidden sm:block" />
                私たちの仕事があります。
              </>
            }
            desc="レンタルは手段です。現場が予定どおり終わること。それだけを目的に、4 つのことを徹底しています。"
          />
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STRENGTHS.map((s, i) => {
            const Icon = icons[i];
            return (
              <Reveal key={s.id} delay={i * 0.07}>
                <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]">
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-sun-100 text-sun-800 transition-colors group-hover:bg-sun-500 group-hover:text-ink-900">
                    <Icon size={22} />
                  </div>
                  <p className="text-2xl font-black leading-none tracking-tight text-ink-900">
                    {s.stat}
                    <span className="ml-1 text-[11px] font-bold text-ink-400">{s.statUnit}</span>
                  </p>
                  <h3 className="mt-3 text-[15px] font-bold leading-snug text-ink-900">{s.title}</h3>
                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-500">{s.body}</p>
                  <div className="mt-5 h-1 w-10 rounded-full bg-sun-400 transition-all duration-300 group-hover:w-full" />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function IctBand() {
  const max = 100;
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="overflow-hidden rounded-[32px] border border-sea-200 bg-gradient-to-br from-sea-50 via-white to-sun-50">
        <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:p-16">
          <Reveal>
            <Badge tone="sea" className="mb-5">
              <Satellite size={12} /> ICT 建機 / スマート施工
            </Badge>
            <h2 className="text-3xl font-black leading-[1.15] tracking-tight text-ink-900 sm:text-[2.4rem]">
              丁張りを、
              <br />
              ほとんど無くしませんか。
            </h2>
            <p className="mt-5 max-w-md text-[14.5px] leading-[1.9] text-ink-600">
              3D 設計データを機械に入れるだけで、排土板やバケットが設計面を自動で追います。
              測量・丁張り・出来形計測の工数が消え、オペレータの熟練度に左右されない仕上がりに。
              <span className="font-bold text-ink-900">
                導入現場の 7 割が「初めての ICT 施工」です。
              </span>
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/ict">
                <Button size="lg">
                  ICT 施工の効果を見る <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/rental?ict=1">
                <Button size="lg" variant="outline">
                  ICT 対応機の在庫
                </Button>
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-lift)] sm:p-7">
              <p className="text-[11px] font-black tracking-wider text-ink-400">
                従来施工を 100 としたときの ICT 施工(自社実績平均)
              </p>
              <div className="mt-6 space-y-5">
                {ICT_EFFECT.map((e, i) => (
                  <div key={e.name}>
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <span className="text-[12.5px] font-bold text-ink-700">{e.name}</span>
                      <span className="tnum text-sm font-black text-sea-600">
                        {e.ICT施工}
                        <span className="ml-0.5 text-[10px] font-bold text-ink-400">/ 100</span>
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-ink-100">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(e.ICT施工 / max) * 100}%` }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.9, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-sea-400 to-sea-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 border-t border-ink-200 pt-4 text-[11px] leading-relaxed text-ink-400">
                ※ 本デモに掲載の数値はすべてサンプルです。実際の効果は現場条件により異なります。
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Popular() {
  const list = MACHINES.filter((m) => m.popular).slice(0, 8);
  return (
    <section className="border-y border-ink-200 bg-ink-50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Popular"
              title="よく出ている機械"
              desc="直近 3 か月の受注実績が多い機種です。繁忙期は早めのご予約をおすすめします。"
            />
            <Link to="/rental" className="shrink-0">
              <Button variant="outline">
                すべての機械を見る <ArrowRight size={15} />
              </Button>
            </Link>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((m, i) => (
            <MachineCard key={m.id} m={m} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Cases() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <Reveal>
        <SectionHeading
          eyebrow="Case study"
          title="現場が、変わりました。"
          desc="山陰のお客様の導入事例です(掲載内容はデモ用のサンプルで、社名はすべて架空です)。"
        />
      </Reveal>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {CASES.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.07}>
            <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
              <div className="flex items-stretch gap-5 border-b border-ink-200 bg-gradient-to-r from-sun-50 to-white p-5">
                <div className="shrink-0 overflow-hidden rounded-xl bg-white">
                  <MachineArt
                    kind={c.art}
                    scene={false}
                    idKey={`case-${c.id}`}
                    className="h-20 w-28 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[11px] font-bold text-ink-400">{c.industry}</p>
                  <p className="text-[13px] font-black text-ink-900">{c.client}</p>
                  <p className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl font-black leading-none tracking-tight text-sun-700">
                      {c.metricValue}
                    </span>
                    <span className="text-[11px] font-bold text-ink-500">{c.metricLabel}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-[15.5px] font-bold leading-snug text-ink-900">{c.title}</h3>
                <dl className="mt-4 space-y-3 text-[12.5px] leading-relaxed">
                  <div>
                    <dt className="mb-0.5 text-[10.5px] font-black tracking-wider text-ng-700">
                      課題
                    </dt>
                    <dd className="text-ink-600">{c.problem}</dd>
                  </div>
                  <div>
                    <dt className="mb-0.5 text-[10.5px] font-black tracking-wider text-ok-700">
                      ご提案
                    </dt>
                    <dd className="text-ink-600">{c.solution}</dd>
                  </div>
                </dl>
                <p className="mt-auto pt-5 text-[11.5px] font-bold text-ink-400">{c.sub}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Flow() {
  const steps = [
    {
      icon: Search,
      title: "探す・空きを確認",
      body: "オンラインで機種と各営業所の在庫、空き予定日をその場で確認できます。",
    },
    {
      icon: CalendarCheck,
      title: "見積・仮予約",
      body: "期間とオプションを選ぶと概算料金が即時表示。そのまま仮予約に進めます。",
    },
    {
      icon: Truck,
      title: "現場へお届け",
      body: "回送車で現場へ直接。積込・積下ろしと始業前点検まで当社で行います。",
    },
    {
      icon: BadgeCheck,
      title: "返却・アフター",
      body: "引取り後は整備士が全数点検。稼働データを次回のご提案に活かします。",
    },
  ];
  return (
    <section className="border-y border-ink-200 bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Flow"
            align="center"
            title="ご利用は 4 ステップ"
            desc="お問い合わせから最短当日でお届けします。初めての方には担当がお電話でご案内します。"
          />
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <div className="relative h-full rounded-2xl border border-ink-200 bg-ink-50 p-6">
                <span className="absolute right-5 top-4 text-4xl font-black leading-none text-sun-200">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-white text-sun-800 shadow-[var(--shadow-soft)]">
                  <s.icon size={20} />
                </div>
                <h3 className="text-[14.5px] font-bold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink-500">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function News() {
  const toneOf = (c: string) =>
    c === "ICT" ? "sea" : c === "新商品" ? "sun" : c === "採用" ? "ok" : "neutral";
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_1fr]">
        <Reveal>
          <SectionHeading eyebrow="News" title="お知らせ" />
          <p className="mt-5 text-[13px] leading-relaxed text-ink-500">
            新機種の導入、実演会、営業に関するご案内などを掲載しています。
          </p>
          <Link to="/contact" className="mt-6 inline-block">
            <Button variant="outline" size="sm">
              お問い合わせはこちら <ArrowRight size={14} />
            </Button>
          </Link>
        </Reveal>

        <div className="divide-y divide-ink-200 border-y border-ink-200">
          {NEWS.map((n, i) => (
            <Reveal key={n.id} delay={Math.min(i * 0.05, 0.25)}>
              <article className="group flex flex-col gap-1.5 py-5 sm:flex-row sm:items-start sm:gap-6">
                <div className="flex shrink-0 items-center gap-3 sm:w-48">
                  <time className="tnum text-[12px] font-bold text-ink-400">
                    {n.date.replace(/-/g, "/")}
                  </time>
                  <Badge tone={toneOf(n.category) as "sea" | "sun" | "ok" | "neutral"}>
                    {n.category}
                  </Badge>
                </div>
                <div className="min-w-0">
                  <h3 className="text-[14px] font-bold leading-snug text-ink-900 transition-colors group-hover:text-sun-800">
                    {n.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-ink-500">
                    {n.body}
                  </p>
                  <p className="mt-1.5 text-[11px] font-bold text-ink-300">{relativeDay(n.date)}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-[32px] bg-ink-900 px-8 py-14 sm:px-14 sm:py-20">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(30rem 20rem at 88% 0%, oklch(60% 0.15 82 / 0.55), transparent 60%), radial-gradient(26rem 18rem at 0% 100%, oklch(45% 0.12 240 / 0.5), transparent 60%)",
            }}
            aria-hidden
          />
          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-black tracking-[0.18em] text-sun-400">
                <Gauge size={14} /> GET STARTED
              </p>
              <h2 className="mt-4 text-3xl font-black leading-[1.2] tracking-tight text-white sm:text-[2.5rem]">
                何を借りればいいか、
                <br />
                決まっていなくて大丈夫です。
              </h2>
              <p className="mt-5 max-w-xl text-[14.5px] leading-[1.9] text-ink-300">
                「この工事にどのクラスが合うか」からご相談ください。図面や現場写真をお送りいただければ、
                機種とオプションの組み合わせをこちらでご提案します。
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link to="/simulator">
                <Button variant="secondary" size="lg" className="w-full">
                  見積シミュレーターを使う <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  size="lg"
                  className="w-full border border-white/25 bg-white/10 text-white hover:bg-white/20"
                >
                  相談する(無料)
                </Button>
              </Link>
              <p className="mt-1 text-center text-[11px] text-ink-400">
                受付 8:00-17:30 / 緊急時は 24 時間対応
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <Strengths />
      <IctBand />
      <Popular />
      <Cases />
      <Flow />
      <News />
      <CtaBand />
    </>
  );
}
