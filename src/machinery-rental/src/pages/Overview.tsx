import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ChevronDown, Phone } from "lucide-react";
import { toast } from "sonner";
import {
  BRANCHES,
  COMPANY_FACTS,
  COMPANY_NUMBERS,
  FAQS,
  HISTORY,
  PHILOSOPHY,
} from "../data/seed";
import {
  ArrowLink,
  Button,
  CountUp,
  DefinitionList,
  PageHead,
  Reveal,
  SectionHead,
  Tag,
} from "../components/ui";

/* ---------- 拠点図(山陰エリアの模式図) ---------- */
function BranchMap({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div className="border border-ink-200 bg-ink-25 p-5">
      <svg viewBox="0 0 100 68" className="w-full" role="img" aria-label="山陰エリアの営業所配置図">
        {/* 海 */}
        <rect width="100" height="68" fill="oklch(97% 0.012 252)" />
        {/* 陸地 */}
        <path
          d="M0 46 Q14 36 26 36 Q40 32 52 29 Q66 24 78 19 Q90 14 100 14 L100 68 L0 68 Z"
          fill="oklch(100% 0 0)"
          stroke="oklch(85% 0.006 252)"
          strokeWidth="0.35"
        />
        {/* 海岸線 */}
        <path
          d="M0 46 Q14 36 26 36 Q40 32 52 29 Q66 24 78 19 Q90 14 100 14"
          fill="none"
          stroke="oklch(76% 0.05 252)"
          strokeWidth="0.5"
        />
        {/* 湖 */}
        <ellipse cx="29" cy="40" rx="5.6" ry="1.9" fill="oklch(94% 0.015 252)" />
        <ellipse cx="40" cy="38" rx="3.6" ry="1.5" fill="oklch(94% 0.015 252)" />

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
                <circle r="3.4" fill="none" stroke="oklch(70% 0.135 66)" strokeWidth="0.5">
                  <animate attributeName="r" values="2.4;5;2.4" dur="2.4s" repeatCount="indefinite" />
                  <animate
                    attributeName="opacity"
                    values="0.9;0;0.9"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <circle
                r={on ? 1.9 : 1.3}
                fill={on ? "oklch(70% 0.135 66)" : "oklch(35% 0.085 252)"}
              />
              <text
                y="-2.9"
                textAnchor="middle"
                fontSize="2.5"
                fontWeight="500"
                fill={on ? "oklch(52% 0.11 58)" : "oklch(46% 0.011 252)"}
              >
                {b.name.replace("本社・", "").replace("営業所", "")}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-3 text-center text-[10px] text-ink-400">
        ※ 位置は模式図です。ピンを選択すると営業所の情報が切り替わります
      </p>
    </div>
  );
}

export default function Overview() {
  const [active, setActive] = useState(BRANCHES[0].id);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const branch = BRANCHES.find((b) => b.id === active)!;

  return (
    <>
      <PageHead
        en="Company"
        ja="会社概要"
        lead="1993 年の創業以来、山陰の建設現場とともに歩んできました。機械を貸す会社である前に、地域の仕事が滞りなく進むための会社でありたいと考えています。"
        breadcrumb={[{ label: "ホーム", to: "/" }, { label: "会社概要" }]}
      />

      {/* 数字 */}
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-y-10 px-6 py-14 sm:px-8 lg:grid-cols-4 lg:gap-0 lg:px-12">
          {COMPANY_NUMBERS.map((n, i) => (
            <Reveal
              key={n.label}
              delay={i * 0.07}
              className={`lg:px-10 ${i > 0 ? "lg:border-l lg:border-ink-200" : ""}`}
            >
              <p className="label-en text-ink-400">{n.label}</p>
              <p className="serif mt-4 text-[36px] leading-none text-ink-900">
                <CountUp to={n.value} />
                <span className="ml-1.5 text-[14px] text-amber-600">{n.unit}</span>
              </p>
              <p className="mt-3 text-[11.5px] text-ink-500">{n.note}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 経営理念 */}
      <section id="philosophy" className="scroll-mt-28 border-b border-ink-200 bg-ink-25">
        <div className="mx-auto max-w-[1200px] px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-20">
            <Reveal>
              <SectionHead en="Philosophy" ja="経営理念" />
            </Reveal>
            <Reveal delay={0.1}>
              <p className="serif text-[22px] leading-[1.9] text-navy-800 sm:text-[27px]">
                {PHILOSOPHY.slogan}
              </p>
              <div className="mt-9 space-y-5">
                {PHILOSOPHY.body.map((p, i) => (
                  <p key={i} className="text-[13.5px] leading-[2.15] text-ink-600">
                    {p}
                  </p>
                ))}
              </div>

              <div className="mt-14 grid gap-px border border-ink-200 bg-ink-200 sm:grid-cols-3">
                {PHILOSOPHY.pillars.map((p, i) => (
                  <div key={p.title} className="bg-white p-7">
                    <span className="tnum text-[11px] text-amber-600">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="serif mt-5 text-[15.5px] text-ink-900">{p.title}</h3>
                    <p className="mt-3 text-[12px] leading-[2] text-ink-600">{p.body}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 会社概要 */}
      <section className="mx-auto max-w-[1200px] px-6 py-24 sm:px-8 lg:px-12 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-20">
          <Reveal>
            <SectionHead en="Profile" ja="会社概要" />
            <p className="mt-7 text-[12.5px] leading-[2] text-ink-500">
              掲載の商号・所在地・電話番号・実績は、すべてデモ用の架空のサンプルです。
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <DefinitionList items={COMPANY_FACTS} />
          </Reveal>
        </div>
      </section>

      {/* 沿革 */}
      <section id="history" className="scroll-mt-28 border-y border-ink-200 bg-ink-25">
        <div className="mx-auto max-w-[1200px] px-6 py-24 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-20">
            <Reveal>
              <SectionHead en="History" ja="沿革" />
            </Reveal>
            <Reveal delay={0.1}>
              <ol className="border-t border-ink-200">
                {HISTORY.map((h) => (
                  <li
                    key={h.year}
                    className="flex flex-col gap-2 border-b border-ink-200 py-6 sm:flex-row sm:gap-10"
                  >
                    <span className="tnum w-20 shrink-0 text-[15px] leading-[1.9] text-navy-700">
                      {h.year}
                    </span>
                    <span className="text-[13.5px] leading-[2] text-ink-600">{h.text}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 営業所 */}
      <section id="branches" className="scroll-mt-28">
        <div className="mx-auto max-w-[1200px] px-6 py-24 sm:px-8 lg:px-12 lg:py-28">
          <Reveal>
            <SectionHead
              en="Network"
              ja="営業所一覧"
              lead="鳥取県 3 拠点、島根県 5 拠点。山陰両県の全域をカバーしています。"
            />
          </Reveal>

          <div className="mt-14 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <Reveal>
              <BranchMap active={active} onSelect={setActive} />

              {/* 選択中の営業所 */}
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-6 border border-ink-200 p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="label-en text-ink-400">{branch.pref}</span>
                    <h3 className="serif mt-2.5 text-[19px] text-ink-900">{branch.name}</h3>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {branch.isHq && <Tag tone="navy">本社</Tag>}
                    {branch.hasWorkshop && <Tag tone="amber">整備工場</Tag>}
                  </div>
                </div>
                <dl className="mt-6 space-y-2.5 text-[12.5px]">
                  {[
                    { k: "所在地", v: branch.address },
                    { k: "電話", v: branch.tel },
                    { k: "FAX", v: branch.fax },
                    { k: "営業時間", v: `${branch.hours}(土日祝休)` },
                  ].map((r) => (
                    <div key={r.k} className="flex gap-6">
                      <dt className="w-16 shrink-0 text-ink-400">{r.k}</dt>
                      <dd className="tnum text-ink-800">{r.v}</dd>
                    </div>
                  ))}
                </dl>
                <button
                  onClick={() =>
                    toast.info("このデモでは発信を行いません", {
                      description: `実際のサイトでは ${branch.name}(${branch.tel})へ発信されます`,
                    })
                  }
                  className="mt-7 flex w-full items-center justify-center gap-2 border border-ink-300 py-3 text-[12.5px] text-ink-700 transition-colors hover:border-navy-700 hover:text-navy-700"
                >
                  <Phone size={14} /> この営業所に電話する
                </button>
              </motion.div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="border-t border-ink-200">
                {BRANCHES.map((b) => {
                  const on = active === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setActive(b.id)}
                      className={`flex w-full items-center gap-5 border-b border-ink-200 px-1 py-5 text-left transition-colors ${
                        on ? "bg-ink-25" : "hover:bg-ink-25"
                      }`}
                    >
                      <span
                        className={`h-8 w-[2px] shrink-0 transition-colors ${
                          on ? "bg-amber-500" : "bg-transparent"
                        }`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] text-ink-900">{b.name}</span>
                        <span className="block text-[11px] text-ink-400">
                          {b.pref} ・ {b.area}
                        </span>
                      </span>
                      <span className="tnum shrink-0 text-[13px] text-ink-600">{b.tel}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-7 text-[12px] leading-[2] text-ink-500">
                最寄りの営業所が分からない場合は、本社(0859-00-0000)へご連絡ください。
                現場の所在地をお聞きし、担当の営業所へおつなぎします。
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-28 border-t border-ink-200 bg-ink-25">
        <div className="mx-auto max-w-[1200px] px-6 py-24 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-20">
            <Reveal>
              <SectionHead en="FAQ" ja="よくあるご質問" />
              <div className="mt-9">
                <ArrowLink to="/contact">解決しない場合はお問い合わせへ</ArrowLink>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="border-t border-ink-200">
                {FAQS.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <div key={f.q} className="border-b border-ink-200">
                      <button
                        onClick={() => setOpenFaq(open ? null : i)}
                        className="flex w-full items-start gap-5 py-6 text-left"
                        aria-expanded={open}
                      >
                        <span className="serif shrink-0 text-[13px] text-amber-600">Q</span>
                        <span className="min-w-0 flex-1 text-[14px] leading-[1.85] text-ink-800">
                          {f.q}
                        </span>
                        <ChevronDown
                          size={16}
                          strokeWidth={1.5}
                          className={`mt-1 shrink-0 text-ink-400 transition-transform duration-300 ${
                            open ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <motion.div
                        initial={false}
                        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="flex gap-5 pb-7 text-[13px] leading-[2.1] text-ink-600">
                          <span className="serif shrink-0 text-[13px] text-ink-300">A</span>
                          <span>{f.a}</span>
                        </p>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-ink-200">
        <div className="mx-auto max-w-[1200px] px-6 py-20 sm:px-8 lg:px-12">
          <div className="flex flex-col items-start justify-between gap-8 border border-ink-200 p-10 lg:flex-row lg:items-center lg:p-14">
            <div>
              <h2 className="serif text-[21px] leading-[1.7] text-ink-900">
                採用情報も掲載しています
              </h2>
              <p className="mt-3.5 max-w-2xl text-[13px] leading-[2] text-ink-600">
                整備スタッフ・営業スタッフ・回送ドライバーを募集しています。完全週休二日制、
                資格取得支援制度あり、転勤はありません。
              </p>
            </div>
            <Link to="/recruit" className="shrink-0">
              <Button size="lg">採用情報を見る</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
