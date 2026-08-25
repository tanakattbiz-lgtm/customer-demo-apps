import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { BENEFITS, JOBS } from "../data/seed";
import { MachineArt } from "../components/MachineArt";
import { Button, PageHead, Reveal, SectionHead, Tag } from "../components/ui";

export default function Recruit() {
  const [active, setActive] = useState(JOBS[0].id);
  const job = JOBS.find((j) => j.id === active)!;

  return (
    <>
      <PageHead
        en="Recruit"
        ja="採用情報"
        lead="整備スタッフ・営業スタッフ・回送ドライバーを募集しています。完全週休二日制、資格取得支援制度あり、転勤はありません。"
        breadcrumb={[{ label: "ホーム", to: "/" }, { label: "採用情報" }]}
      />

      {/* メッセージ */}
      <section className="border-b border-ink-200">
        <div className="mx-auto max-w-[1200px] px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <Reveal>
              <SectionHead en="Message" ja="地元で、機械と人に向き合う。" />
              <div className="mt-9 space-y-5 text-[13.5px] leading-[2.15] text-ink-600">
                <p>
                  私たちの仕事は、建設機械を貸すことです。ただ、機械を届けて終わりではありません。
                  現場の工事が予定どおりに終わるまで、機械の状態を整え、使い方を伝え、
                  困ったときに駆けつける。そこまでが仕事です。
                </p>
                <p>
                  だから、機械のことを知っている人と、現場のことを分かっている人の両方が必要です。
                  未経験からでも構いません。先輩社員のもとで、一つずつ身につけていただけます。
                </p>
                <p className="text-ink-800">
                  転勤はありません。山陰の現場が、そのまま仕事場です。
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="border border-ink-200 bg-ink-25 p-8 lg:p-10">
                <MachineArt kind="loader" frame idKey="recruit" className="w-full text-navy-700" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 募集職種 */}
      <section className="border-b border-ink-200 bg-ink-25">
        <div className="mx-auto max-w-[1200px] px-6 py-24 sm:px-8 lg:px-12 lg:py-28">
          <Reveal>
            <SectionHead en="Positions" ja="募集職種" />
          </Reveal>

          <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-14">
            {/* 職種タブ */}
            <div className="thin-scroll flex gap-2 overflow-x-auto lg:flex-col lg:gap-0">
              {JOBS.map((j) => {
                const on = active === j.id;
                return (
                  <button
                    key={j.id}
                    onClick={() => setActive(j.id)}
                    className={`flex shrink-0 items-center gap-4 whitespace-nowrap border px-5 py-4 text-left transition-colors lg:w-full lg:border-0 lg:border-b lg:border-ink-200 lg:px-1 ${
                      on
                        ? "border-navy-800 bg-white text-navy-800 lg:bg-transparent"
                        : "border-ink-200 bg-white text-ink-600 hover:text-navy-700 lg:bg-transparent"
                    }`}
                  >
                    <span
                      className={`hidden h-9 w-[2px] shrink-0 lg:block ${on ? "bg-amber-500" : "bg-transparent"}`}
                    />
                    <span>
                      <span className="block text-[14px]">{j.title}</span>
                      <span className="mt-1 block text-[10.5px] text-ink-400">{j.type}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 職種詳細 */}
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="border border-ink-200 bg-white p-8 lg:p-12"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Tag tone="navy">{job.type}</Tag>
                <Tag tone="outline">{job.place}</Tag>
              </div>
              <h3 className="serif mt-6 text-[24px] leading-[1.5] text-ink-900">{job.title}</h3>
              <p className="mt-5 text-[13.5px] leading-[2.1] text-ink-600">{job.body}</p>

              <div className="mt-10 grid gap-10 sm:grid-cols-2">
                <div>
                  <p className="label-en mb-5 text-ink-400">仕事の内容</p>
                  <ul className="space-y-3">
                    {job.duties.map((d) => (
                      <li key={d} className="flex gap-3 text-[12.5px] leading-[1.9] text-ink-700">
                        <span className="mt-[7px] h-1 w-1 shrink-0 bg-amber-500" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="label-en mb-5 text-ink-400">歓迎する経験・資格</p>
                  <ul className="space-y-3">
                    {job.welcome.map((w) => (
                      <li key={w} className="flex gap-3 text-[12.5px] leading-[1.9] text-ink-700">
                        <Check size={13} className="mt-1.5 shrink-0 text-navy-600" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-10 border-t border-ink-200 pt-8">
                <Link to={`/contact?subject=${encodeURIComponent(`採用について(${job.title})`)}`}>
                  <Button size="lg">
                    この職種について問い合わせる <ArrowRight size={15} />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 働く環境 */}
      <section className="mx-auto max-w-[1200px] px-6 py-24 sm:px-8 lg:px-12 lg:py-28">
        <Reveal>
          <SectionHead
            en="Environment"
            ja="働く環境"
            lead="社員が健康に長く働けることが、結果としてお客様への品質につながると考えています。"
          />
        </Reveal>

        <div className="mt-14 grid gap-px border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={Math.min(i * 0.06, 0.3)}>
              <div className="flex h-full flex-col bg-white p-8">
                <span className="tnum text-[11px] text-amber-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="serif mt-5 text-[15.5px] leading-[1.7] text-ink-900">{b.title}</h3>
                <p className="mt-3 text-[12.5px] leading-[2] text-ink-600">{b.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 選考の流れ */}
      <section className="border-y border-ink-200 bg-navy-900 text-white">
        <div className="relative">
          <div className="blueprint absolute inset-0 opacity-30" aria-hidden />
          <div className="relative mx-auto max-w-[1200px] px-6 py-24 sm:px-8 lg:px-12 lg:py-28">
            <Reveal>
              <SectionHead en="Process" tone="light" ja="選考の流れ" />
            </Reveal>
            <div className="mt-14 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { s: "01", t: "お問い合わせ", b: "フォームまたはお電話でご連絡ください。" },
                { s: "02", t: "職場見学", b: "整備工場や営業所を見ていただきます。ご家族の同席も歓迎です。" },
                { s: "03", t: "面接", b: "1 回のみです。志望動機よりも、これまでの経験を伺います。" },
                { s: "04", t: "内定・入社", b: "入社日はご相談に応じます。在職中の方もお気軽にどうぞ。" },
              ].map((p, i) => (
                <Reveal key={p.s} delay={i * 0.07}>
                  <div className="flex h-full flex-col bg-navy-900 p-8">
                    <span className="tnum text-[11px] tracking-[0.2em] text-amber-400">{p.s}</span>
                    <h3 className="serif mt-6 text-[15.5px] text-white">{p.t}</h3>
                    <p className="mt-3.5 text-[12px] leading-[2] text-white/60">{p.b}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2}>
              <div className="mt-14 flex flex-col items-start gap-6 border border-white/15 p-8 sm:flex-row sm:items-center sm:justify-between lg:p-10">
                <div>
                  <h3 className="serif text-[17px] leading-[1.7] text-white">
                    まずは職場を見にきてください
                  </h3>
                  <p className="mt-3 max-w-2xl text-[12.5px] leading-[2] text-white/60">
                    応募の前に、どんな仕事か見ていただくことをおすすめしています。
                    見学だけのご連絡でも構いません。
                  </p>
                </div>
                <Link to="/contact?subject=採用について(職場見学の希望)" className="shrink-0">
                  <Button variant="accent" size="lg">
                    見学を申し込む <ArrowRight size={15} />
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
