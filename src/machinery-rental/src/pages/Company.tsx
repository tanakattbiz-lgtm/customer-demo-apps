import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  ChevronDown,
  Clock,
  HeartHandshake,
  MapPin,
  Phone,
  Sprout,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { BRANCHES, COMPANY_FACTS, FAQS, HISTORY } from "../data/seed";
import { Badge, Button, CountUp, Reveal, SectionHeading } from "../components/ui";

/* ---------- 拠点マップ(山陰エリアの簡易図) ---------- */
function BranchMap({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-200 bg-gradient-to-br from-sea-50 to-sun-50 p-4">
      <svg viewBox="0 0 100 60" className="w-full" role="img" aria-label="山陰エリアの営業所マップ">
        {/* 海 */}
        <rect width="100" height="60" fill="oklch(94% 0.035 230)" />
        {/* 陸地(山陰の海岸線を模した簡易形状) */}
        <path
          d="M0 44 Q14 34 26 34 Q40 30 52 27 Q66 22 78 17 Q90 12 100 12 L100 60 L0 60 Z"
          fill="oklch(96% 0.05 88)"
          stroke="oklch(87% 0.007 90)"
          strokeWidth="0.4"
        />
        <path
          d="M0 44 Q14 34 26 34 Q40 30 52 27 Q66 22 78 17 Q90 12 100 12"
          fill="none"
          stroke="oklch(80% 0.09 232)"
          strokeWidth="0.6"
        />
        {/* 宍道湖・中海を模した水面 */}
        <ellipse cx="29" cy="39" rx="6" ry="2.2" fill="oklch(88% 0.06 230)" />
        <ellipse cx="41" cy="37" rx="4" ry="1.8" fill="oklch(88% 0.06 230)" />

        {BRANCHES.map((b) => {
          const on = active === b.id;
          return (
            <g
              key={b.id}
              transform={`translate(${b.x} ${b.y})`}
              onClick={() => onSelect(b.id)}
              className="cursor-pointer"
            >
              {on && (
                <circle r="4.5" fill="oklch(82% 0.18 82)" opacity="0.35">
                  <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />
                  <animate
                    attributeName="opacity"
                    values="0.4;0;0.4"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <circle
                r={on ? 2.4 : 1.8}
                fill={on ? "oklch(74% 0.17 74)" : "oklch(28% 0.011 98)"}
                stroke="white"
                strokeWidth="0.6"
              />
              <text
                y="-3.4"
                textAnchor="middle"
                fontSize="2.6"
                fontWeight="700"
                fill={on ? "oklch(40% 0.09 58)" : "oklch(39% 0.012 96)"}
              >
                {b.name.replace("営業所", "")}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-center text-[10.5px] text-ink-400">
        ※ 位置は模式図です。ピンをタップすると営業所情報が切り替わります
      </p>
    </div>
  );
}

export default function Company() {
  const [active, setActive] = useState(BRANCHES[0].id);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const branch = BRANCHES.find((b) => b.id === active)!;

  return (
    <>
      {/* ヒーロー */}
      <section className="mesh-light relative overflow-hidden border-b border-ink-200">
        <div className="grid-paper absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <Reveal>
            <p className="text-[11px] font-black tracking-[0.18em] text-sun-800">ABOUT US</p>
            <h1 className="mt-4 max-w-3xl text-[2.3rem] font-black leading-[1.15] tracking-tight text-ink-900 sm:text-5xl">
              お客様、地域の皆様、
              <br />
              そして社員の幸せを一番に。
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.9] text-ink-600">
              1993 年、系列会社のリース事業部から独立してはじまりました。以来 33 年、
              山陰の土木・建築・造園の現場とともに歩んできました。機械を貸す会社である前に、
              地域の仕事が滞りなく進むための会社でありたいと考えています。
            </p>
          </Reveal>
        </div>
      </section>

      {/* 数字 */}
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-ink-200 px-4 sm:px-6 md:grid-cols-4 md:divide-x lg:px-8">
          {[
            { v: 1993, unit: "年", label: "創業", d: 0, plain: true },
            { v: 86, unit: "名", label: "従業員数", d: 0 },
            { v: 482, unit: "台", label: "保有機械", d: 0 },
            { v: 1240, unit: "社", label: "お取引先", d: 0 },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06} className="px-2 py-8 text-center md:px-6">
              <p className="text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">
                {s.plain ? (
                  <span className="tnum">{s.v}</span>
                ) : (
                  <CountUp to={s.v} decimals={s.d} />
                )}
                <span className="ml-1 text-base font-bold text-sun-700">{s.unit}</span>
              </p>
              <p className="mt-1.5 text-[11.5px] font-bold text-ink-500">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 会社概要 */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <SectionHeading eyebrow="Profile" title="会社概要" />
            <p className="mt-5 text-[13.5px] leading-relaxed text-ink-500">
              建設機械のレンタルを軸に、ICT 施工支援と機械整備を行っています。掲載内容は
              デモ用のサンプルです。
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <dl className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
              {COMPANY_FACTS.map((f, i) => (
                <div
                  key={f.label}
                  className={`flex flex-col gap-1 px-6 py-4 text-[13px] sm:flex-row sm:gap-6 ${
                    i % 2 ? "bg-ink-50" : ""
                  }`}
                >
                  <dt className="w-28 shrink-0 font-bold text-ink-500">{f.label}</dt>
                  <dd className="font-bold text-ink-900">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* 沿革 */}
      <section className="border-y border-ink-200 bg-ink-50 py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="History" align="center" title="歩み" />
          </Reveal>
          <ol className="relative mt-12 border-l border-ink-300 pl-8">
            {HISTORY.map((h, i) => (
              <Reveal key={h.year} delay={i * 0.06}>
                <li className="relative pb-9 last:pb-0">
                  <span className="absolute -left-[41px] top-1 grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-sun-500 shadow-[var(--shadow-soft)]" />
                  <p className="tnum text-lg font-black leading-none text-ink-900">{h.year}</p>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-600">{h.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 営業所 */}
      <section id="branches" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="Network"
            title="山陰 6 営業所"
            desc="鳥取・島根の全域をカバー。最寄りの拠点から、最短当日でお届けします。"
          />
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <BranchMap active={active} onSelect={setActive} />
          </Reveal>

          <div className="space-y-2.5">
            {BRANCHES.map((b) => {
              const on = active === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setActive(b.id)}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                    on
                      ? "border-sun-500 bg-sun-50 shadow-[var(--shadow-soft)]"
                      : "border-ink-200 bg-white hover:border-ink-300"
                  }`}
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                      on ? "bg-sun-500 text-ink-900" : "bg-ink-100 text-ink-500"
                    }`}
                  >
                    <MapPin size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-bold text-ink-900">{b.name}</span>
                    <span className="block text-[11.5px] text-ink-400">{b.area}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="tnum block text-[12.5px] font-black text-ink-800">{b.tel}</span>
                    <span className="tnum block text-[10.5px] text-ink-400">{b.hours}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-ink-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-sea-50 text-sea-600">
                <Clock size={20} />
              </span>
              <div>
                <p className="text-[13px] font-bold text-ink-900">
                  {branch.name} ・ {branch.hours}
                </p>
                <p className="text-[11.5px] text-ink-500">
                  日曜・祝日休(緊急時は 24 時間の連絡窓口で対応します)
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() =>
                toast.info("このデモでは発信は行いません", {
                  description: `実際のサイトでは ${branch.name}(${branch.tel})に発信されます`,
                })
              }
            >
              <Phone size={14} /> この営業所に電話
            </Button>
          </div>
        </Reveal>
      </section>

      {/* 採用 */}
      <section id="recruit" className="scroll-mt-24 border-y border-ink-200 bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-sun-50 via-white to-sea-50 p-8 sm:p-12 lg:p-16">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <Reveal>
                <Badge tone="sun" className="mb-5">
                  <Users size={12} /> RECRUIT
                </Badge>
                <h2 className="text-3xl font-black leading-[1.2] tracking-tight text-ink-900 sm:text-[2.3rem]">
                  地元で、機械と人に
                  <br />
                  向き合う仕事を。
                </h2>
                <p className="mt-5 max-w-lg text-[14px] leading-[1.9] text-ink-600">
                  整備スタッフ・営業スタッフを募集しています。2025 年 4 月から完全週休二日制に
                  移行しました。整備士資格の取得支援制度があり、未経験からの育成にも力を入れています。
                </p>
                <div className="mt-7">
                  <Link to="/contact">
                    <Button size="lg" variant="secondary">
                      採用について問い合わせる <ArrowRight size={16} />
                    </Button>
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: Clock, t: "完全週休二日制", d: "土日祝休み(2025 年 4 月〜)" },
                    { icon: Sprout, t: "資格取得支援", d: "整備士・車両系の受験費用を全額補助" },
                    { icon: HeartHandshake, t: "地域密着", d: "転勤なし。山陰の現場が仕事場です" },
                    { icon: Users, t: "平均勤続 14 年", d: "長く働ける環境づくりを続けています" },
                  ].map((c) => (
                    <div key={c.t} className="rounded-2xl border border-ink-200 bg-white p-5">
                      <c.icon size={19} className="text-sun-700" />
                      <p className="mt-3.5 text-[13.5px] font-bold text-ink-900">{c.t}</p>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">{c.d}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <SectionHeading eyebrow="FAQ" align="center" title="よくあるご質問" />
        </Reveal>
        <div className="mt-10 space-y-2.5">
          {FAQS.map((f, i) => {
            const open = openFaq === i;
            return (
              <Reveal key={f.q} delay={Math.min(i * 0.04, 0.2)}>
                <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-ink-50"
                    aria-expanded={open}
                  >
                    <span className="text-[13px] font-black text-sun-700">Q</span>
                    <span className="min-w-0 flex-1 text-[14px] font-bold text-ink-900">{f.q}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-ink-400 transition-transform duration-300 ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="border-t border-ink-200 bg-ink-50 px-6 py-4 pl-[3.4rem] text-[13px] leading-relaxed text-ink-600">
                      {f.a}
                    </p>
                  </motion.div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-10 rounded-2xl border border-ink-200 bg-ink-50 p-6 text-center">
            <p className="text-[13.5px] font-bold text-ink-900">
              解決しないことがあれば、お気軽にご相談ください。
            </p>
            <Link to="/contact" className="mt-4 inline-block">
              <Button variant="secondary">
                お問い合わせフォームへ <ArrowRight size={15} />
              </Button>
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
