import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, Phone } from "lucide-react";
import {
  BRANCHES,
  CATALOGS,
  COMPANY_NUMBERS,
  MACHINES,
  NEWS,
  PHILOSOPHY,
  RENTAL_CATEGORIES,
  STRENGTHS,
} from "../data/seed";
import { MachineArt } from "../components/MachineArt";
import { ArrowLink, Button, CountUp, Reveal, SectionHead, Tag } from "../components/ui";

const EASE = [0.16, 1, 0.3, 1] as const;

/* =========================================================
   トップページ
   ========================================================= */

function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-ink-200">
      <div className="wash absolute inset-0" aria-hidden />
      <div className="blueprint absolute inset-0" aria-hidden />

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-14 px-6 pb-20 pt-16 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:px-12 lg:pb-28 lg:pt-24">
        <div>
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="flex items-center gap-3"
          >
            <span className="h-px w-8 bg-amber-500" />
            <span className="label-en text-amber-600">Since 1993 — San'in</span>
          </motion.div>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.08, ease: EASE }}
            className="serif mt-8 text-[34px] leading-[1.45] tracking-[0.02em] text-ink-900 sm:text-[46px] lg:text-[56px] lg:leading-[1.36]"
          >
            「満足」で、
            <br />
            終わらせない。
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.18, ease: EASE }}
            className="mt-9 max-w-xl text-[14px] leading-[2.1] text-ink-600 sm:text-[15px]"
          >
            機械をお届けした時点で、私たちの仕事は終わりません。その機械が現場で確かに働き、
            工期どおりに工事が終わる。そこまでを見届けてはじめて、お客様の「満足」に届いたと
            考えています。山陰両県 8 営業所から、建設機械と ICT 施工を支えています。
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.28, ease: EASE }}
            className="mt-12 flex flex-wrap items-center gap-4"
          >
            <Link to="/rental">
              <Button size="lg">
                レンタル機械を見る <ArrowRight size={15} />
              </Button>
            </Link>
            <Link to="/ictmachine">
              <Button size="lg" variant="outline">
                ICT 建機について
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* ヒーロービジュアル */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.12, ease: EASE }}
          className="relative"
        >
          <div className="border border-ink-200 bg-white/75 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-ink-200 px-6 py-3.5 sm:px-8">
              <p className="label-en text-ink-400">Hydraulic Excavator</p>
              <p className="tnum text-[10px] tracking-[0.18em] text-ink-400">SAN&apos;IN / 1993—</p>
            </div>

            <div className="px-6 py-8 sm:px-10 sm:py-10">
              <MachineArt kind="excavator" frame idKey="hero" className="w-full text-navy-700" />
            </div>

            <dl className="grid grid-cols-3 border-t border-ink-200">
              {[
                { k: "保有機械", v: "482", u: "台" },
                { k: "営業所", v: "8", u: "拠点" },
                { k: "ICT 建機", v: "38", u: "台" },
              ].map((s, i) => (
                <div
                  key={s.k}
                  className={`px-4 py-5 text-center sm:px-6 ${i > 0 ? "border-l border-ink-200" : ""}`}
                >
                  <dt className="text-[10.5px] text-ink-400">{s.k}</dt>
                  <dd className="serif mt-2 text-[22px] leading-none text-ink-900">
                    {s.v}
                    <span className="ml-1 text-[11px] text-amber-600">{s.u}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Numbers() {
  return (
    <section className="border-b border-ink-200 bg-white">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-y-10 px-6 py-14 sm:px-8 lg:grid-cols-4 lg:gap-0 lg:px-12 lg:py-16">
        {COMPANY_NUMBERS.map((n, i) => (
          <Reveal
            key={n.label}
            delay={i * 0.08}
            className={`lg:px-10 ${i > 0 ? "lg:border-l lg:border-ink-200" : ""}`}
          >
            <p className="label-en text-ink-400">{n.label}</p>
            <p className="serif mt-4 text-[38px] leading-none text-ink-900 lg:text-[44px]">
              <CountUp to={n.value} />
              <span className="ml-1.5 text-[15px] text-amber-600">{n.unit}</span>
            </p>
            <p className="mt-3 text-[11.5px] text-ink-500">{n.note}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function RentalCategories() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-16">
        <Reveal>
          <SectionHead
            en="Rental"
            ja={
              <>
                現場の仕事に、
                <br />
                合わせて選べる。
              </>
            }
            lead="標準仕様車から業種別仕様車、アタッチメント、小物商品まで。工種と現場条件をお聞きしたうえで、適した機種をご提案します。"
          />
          <div className="mt-10">
            <ArrowLink to="/rental">すべての機械を見る</ArrowLink>
          </div>
        </Reveal>

        <div className="grid gap-px border border-ink-200 bg-ink-200 sm:grid-cols-2">
          {RENTAL_CATEGORIES.map((c, i) => {
            const count = MACHINES.filter((m) => m.category === c.id).length;
            return (
              <Reveal key={c.id} delay={i * 0.07}>
                <Link
                  to={`/rental?cat=${c.id}`}
                  className="group flex h-full flex-col bg-white p-8 transition-colors duration-300 hover:bg-ink-25 lg:p-10"
                >
                  <div className="flex items-start justify-between">
                    <span className="label-en text-amber-600">{c.en}</span>
                    <span className="tnum text-[11px] text-ink-400">{count} 機種</span>
                  </div>

                  <MachineArt
                    kind={c.art}
                    idKey={`cat-${c.id}`}
                    className="my-6 h-20 w-full text-navy-600 transition-transform duration-700 group-hover:translate-x-1"
                  />

                  <h3 className="serif text-[18px] text-ink-900">{c.label}</h3>
                  <p className="mt-1.5 text-[12px] text-ink-500">{c.lead}</p>
                  <p className="mt-4 text-[12.5px] leading-[1.95] text-ink-600">{c.desc}</p>

                  <span className="mt-6 inline-flex items-center gap-2 text-[12px] text-ink-500 transition-colors group-hover:text-navy-700">
                    詳しく見る
                    <ArrowUpRight
                      size={13}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function IctBand() {
  return (
    <section className="relative overflow-hidden bg-navy-900 text-white">
      <div className="blueprint absolute inset-0 opacity-[0.35]" aria-hidden />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(48rem 24rem at 84% 0%, oklch(45% 0.09 250 / 0.55), transparent 62%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-14 px-6 py-24 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-32">
        <Reveal>
          <SectionHead
            en="ICT Construction"
            tone="light"
            ja={
              <>
                設計データを入れる。
                <br />
                あとは、機械が守る。
              </>
            }
            lead="3D 設計データに沿って、バケットや排土板を機械が自動で制御します。丁張りや目視の当たりに頼らず、オペレータの熟練度に左右されない仕上がりに。導入現場の約 7 割が、初めての ICT 施工です。"
          />
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/ictmachine">
              <Button size="lg" variant="accent">
                ICT 建機の詳細 <ArrowRight size={15} />
              </Button>
            </Link>
            <Link to="/rental?ict=1">
              <Button
                size="lg"
                className="border border-white/25 bg-transparent text-white hover:bg-white/10"
              >
                ICT 対応機を見る
              </Button>
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="border border-white/15 p-8 lg:p-10">
            <MachineArt kind="dozer" frame idKey="ict-band" className="w-full text-white/85" />
            <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
              {[
                { k: "丁張り工数", v: "-82", u: "%" },
                { k: "施工日数", v: "-36", u: "%" },
                { k: "ICT 保有", v: "38", u: "台" },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="text-[10.5px] text-white/45">{s.k}</dt>
                  <dd className="serif mt-2 text-[24px] leading-none text-white">
                    {s.v}
                    <span className="ml-0.5 text-[12px] text-amber-400">{s.u}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Strengths() {
  return (
    <section className="border-b border-ink-200 bg-ink-25">
      <div className="mx-auto max-w-[1200px] px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
        <Reveal>
          <SectionHead
            en="Our commitment"
            align="center"
            ja="「借りて終わり」に、しないために。"
            lead="レンタルは手段です。現場が予定どおり終わること。それだけを目的に、4 つのことを続けています。"
          />
        </Reveal>

        <div className="mt-16 grid gap-px border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-4">
          {STRENGTHS.map((s, i) => (
            <Reveal key={s.no} delay={i * 0.08}>
              <div className="flex h-full flex-col bg-white p-8 lg:p-9">
                <span className="label-en text-amber-600">{s.no}</span>
                <p className="serif mt-6 text-[28px] leading-none text-navy-800">
                  {s.metric}
                  <span className="ml-1.5 text-[11px] tracking-wide text-ink-400">
                    {s.metricUnit}
                  </span>
                </p>
                <h3 className="serif mt-6 text-[15.5px] leading-[1.7] text-ink-900">{s.title}</h3>
                <p className="mt-3.5 text-[12.5px] leading-[1.95] text-ink-600">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Philosophy() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
      <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <Reveal>
          <SectionHead en="Philosophy" ja="経営理念" />
          <p className="serif mt-10 text-[20px] leading-[1.9] text-navy-800 sm:text-[23px]">
            {PHILOSOPHY.slogan}
          </p>
          <div className="mt-8 space-y-5">
            {PHILOSOPHY.body.map((p, i) => (
              <p key={i} className="text-[13.5px] leading-[2.1] text-ink-600">
                {p}
              </p>
            ))}
          </div>
          <div className="mt-10">
            <ArrowLink to="/overview">会社概要を見る</ArrowLink>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="border-t border-ink-200">
            {PHILOSOPHY.pillars.map((p, i) => (
              <div key={p.title} className="border-b border-ink-200 py-8">
                <div className="flex items-baseline gap-5">
                  <span className="tnum text-[11px] text-amber-600">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="serif text-[16px] text-ink-900">{p.title}</h3>
                    <p className="mt-3 text-[12.5px] leading-[2] text-ink-600">{p.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Catalogs() {
  const list = CATALOGS.slice(0, 3);
  return (
    <section className="border-y border-ink-200 bg-ink-25">
      <div className="mx-auto max-w-[1200px] px-6 py-24 sm:px-8 lg:px-12 lg:py-28">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHead
              en="Catalog"
              ja="オンラインカタログ"
              lead="機種の諸元、外形寸法、適合母機の一覧をまとめています。現場での打ち合わせにご活用ください。"
            />
            <ArrowLink to="/catalog" className="shrink-0">
              すべてのカタログ
            </ArrowLink>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-px border border-ink-200 bg-ink-200 md:grid-cols-3">
          {list.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.08}>
              <Link
                to="/catalog"
                className="group flex h-full flex-col bg-white p-8 transition-colors hover:bg-ink-25"
              >
                <div className="flex items-center justify-between">
                  <Tag tone="outline">{c.category}</Tag>
                  <span className="tnum text-[10.5px] text-ink-400">{c.pages} ページ</span>
                </div>
                <MachineArt
                  kind={c.art}
                  idKey={`home-cat-${c.id}`}
                  className="my-7 h-20 w-full text-navy-600 transition-transform duration-700 group-hover:scale-105"
                />
                <h3 className="serif text-[15.5px] leading-[1.7] text-ink-900">{c.title}</h3>
                <p className="mt-3 text-[12px] leading-[1.95] text-ink-600">{c.desc}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[11.5px] text-ink-500 transition-colors group-hover:text-navy-700">
                  カタログを見る
                  <ArrowUpRight size={12} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function News() {
  const list = NEWS.slice(0, 5);
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-16">
        <Reveal>
          <SectionHead en="News" ja="お知らせ" />
          <p className="mt-7 text-[13px] leading-[2] text-ink-600">
            新機種の導入、実演会のご案内、営業に関するお知らせを掲載しています。
          </p>
          <div className="mt-9">
            <ArrowLink to="/news">お知らせ一覧</ArrowLink>
          </div>
        </Reveal>

        <div className="border-t border-ink-200">
          {list.map((n, i) => (
            <Reveal key={n.id} delay={Math.min(i * 0.05, 0.25)}>
              <Link
                to={`/news/${n.id}`}
                className="group flex flex-col gap-2 border-b border-ink-200 py-6 transition-colors hover:bg-ink-25 sm:flex-row sm:items-baseline sm:gap-8"
              >
                <div className="flex shrink-0 items-center gap-4 sm:w-52">
                  <time className="tnum text-[11.5px] text-ink-400">
                    {n.date.replace(/-/g, ".")}
                  </time>
                  <Tag tone={n.category === "新商品" ? "amber" : "outline"}>{n.category}</Tag>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[14px] leading-[1.8] text-ink-800 transition-colors group-hover:text-navy-700">
                    <span className="underline-grow">{n.title}</span>
                  </h3>
                </div>
                <ArrowUpRight
                  size={14}
                  className="hidden shrink-0 text-ink-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:block"
                />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Network() {
  return (
    <section className="border-t border-ink-200 bg-ink-25">
      <div className="mx-auto max-w-[1200px] px-6 py-24 sm:px-8 lg:px-12 lg:py-28">
        <Reveal>
          <SectionHead
            en="Network"
            ja="山陰両県、8 営業所。"
            lead="鳥取・島根の全域をカバーしています。最寄りの拠点から、最短当日でお届けします。"
          />
        </Reveal>

        <div className="mt-14 grid gap-px border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-4">
          {BRANCHES.map((b, i) => (
            <Reveal key={b.id} delay={Math.min(i * 0.05, 0.3)}>
              <div className="flex h-full flex-col bg-white p-7">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="label-en text-ink-400">{b.pref}</p>
                    <h3 className="serif mt-2.5 text-[15px] leading-[1.6] text-ink-900">
                      {b.name}
                    </h3>
                  </div>
                  {b.isHq && <Tag tone="navy">本社</Tag>}
                </div>
                <p className="mt-4 text-[11.5px] text-ink-500">{b.area}</p>
                <p className="tnum mt-auto pt-5 text-[14px] tracking-wide text-ink-800">{b.tel}</p>
                {b.hasWorkshop && (
                  <p className="mt-2 text-[10.5px] text-amber-700">整備工場 併設</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-8">
            <ArrowLink to="/overview#branches">営業所の詳細を見る</ArrowLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ContactBand() {
  return (
    <section className="border-t border-ink-200 bg-white">
      <div className="mx-auto max-w-[1200px] px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid items-center gap-12 border border-ink-200 p-10 lg:grid-cols-[1.2fr_1fr] lg:p-16">
          <Reveal>
            <span className="label-en text-amber-600">Contact</span>
            <h2 className="serif mt-5 text-[26px] leading-[1.55] text-ink-900 sm:text-[32px]">
              何を借りればいいか、
              <br />
              決まっていなくて構いません。
            </h2>
            <p className="mt-7 max-w-xl text-[13.5px] leading-[2.1] text-ink-600">
              「この工事にどのクラスが合うか」からご相談ください。工種・工期・現場条件をお聞きし、
              機種の組み合わせをご提案します。図面や現場写真をお送りいただければ、より具体的な
              ご提案が可能です。
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="border-t border-ink-200 pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
              <p className="label-en text-ink-400">お電話でのお問い合わせ</p>
              <a
                href="tel:0859000000"
                onClick={(e) => e.preventDefault()}
                className="tnum mt-4 flex items-center gap-3 text-[30px] leading-none tracking-wide text-ink-900"
              >
                <Phone size={20} className="text-amber-600" />
                0859-00-0000
              </a>
              <p className="mt-3 text-[11.5px] text-ink-500">
                受付 8:00 - 17:30(土日祝休)
                <br />
                レンタル中の故障・トラブルは 24 時間受付
              </p>
              <Link to="/contact" className="mt-8 block">
                <Button size="lg" className="w-full">
                  お問い合わせフォーム <ArrowRight size={15} />
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Numbers />
      <RentalCategories />
      <IctBand />
      <Strengths />
      <Philosophy />
      <Catalogs />
      <News />
      <Network />
      <ContactBand />
    </>
  );
}
