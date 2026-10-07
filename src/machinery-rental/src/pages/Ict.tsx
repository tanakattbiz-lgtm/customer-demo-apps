import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight } from "lucide-react";
import { ICT_EFFECT, ICT_FEATURES, ICT_FLOW, MACHINES } from "../data/seed";
import { MachineArt } from "../components/MachineArt";
import { MachineCard } from "../components/MachineCard";
import { ArrowLink, Button, CountUp, PageHead, Reveal, SectionHead } from "../components/ui";

const CHART_DATA = ICT_EFFECT.map((e) => ({
  name: e.name,
  従来施工: e.conventional,
  ICT施工: e.ict,
}));

const tooltipStyle = {
  borderRadius: 2,
  border: "1px solid oklch(91.5% 0.005 252)",
  boxShadow: "0 16px 36px -22px rgba(20,30,50,0.35)",
  fontSize: 12,
  fontFamily: "var(--font-sans)",
};

export default function Ict() {
  const ictMachines = MACHINES.filter((m) => m.ict);

  return (
    <>
      <PageHead
        en="ICT Construction"
        ja="ICT 建機"
        lead="3D 設計データに沿って、機械が自動で仕上げます。当社は機械をお貸しするだけでなく、設計データの準備から現地調整、オペレータ講習まで現場で伴走します。"
        breadcrumb={[{ label: "ホーム", to: "/" }, { label: "ICT 建機" }]}
      />

      {/* 導入部 */}
      <section className="mx-auto max-w-[1200px] px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <Reveal>
            <SectionHead
              en="Overview"
              ja={
                <>
                  丁張りを、
                  <br />
                  ほとんど無くせます。
                </>
              }
            />
            <div className="mt-9 space-y-5 text-[13.5px] leading-[2.1] text-ink-600">
              <p>
                ICT 建機は、あらかじめ機械に取り込んだ 3D 設計データをもとに、バケットや排土板の
                位置を自動で制御します。設計面を超えて掘りすぎることがなく、丁張りや目視の当たりに
                頼らずに施工を進められます。
              </p>
              <p>
                結果として、測量・丁張り設置・出来形計測にかけていた時間が大きく減り、
                オペレータの熟練度による仕上がりの差も小さくなります。公共工事における ICT 施工の
                適用が広がるなか、山陰でも導入現場が増えています。
              </p>
              <p className="text-ink-800">
                当社がご導入いただいた現場の約 7 割は、
                <span className="border-b border-amber-500 pb-0.5">
                  初めて ICT 施工に取り組まれるお客様
                </span>
                です。
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="border border-ink-200 bg-ink-25 p-8 lg:p-10">
              <MachineArt kind="dozer" frame idKey="ict-hero" className="w-full text-navy-700" />
            </div>
            <div className="mt-px grid grid-cols-3 gap-px bg-ink-200">
              {[
                { v: 214, u: "現場", l: "支援実績" },
                { v: 38, u: "台", l: "ICT 建機保有" },
                { v: 82, u: "%", l: "丁張り工数削減" },
              ].map((s) => (
                <div key={s.l} className="bg-white px-4 py-6 text-center">
                  <p className="serif text-[26px] leading-none text-navy-800">
                    <CountUp to={s.v} />
                    <span className="ml-0.5 text-[11px] text-amber-600">{s.u}</span>
                  </p>
                  <p className="mt-2.5 text-[10.5px] text-ink-500">{s.l}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* できること */}
      <section className="border-y border-ink-200 bg-ink-25">
        <div className="mx-auto max-w-[1200px] px-6 py-24 sm:px-8 lg:px-12 lg:py-28">
          <Reveal>
            <SectionHead
              en="Features"
              ja="ICT でできること"
              lead="現場の条件やご予算に応じて、4 つの選択肢からご提案します。"
            />
          </Reveal>

          <div className="mt-14 grid gap-px border border-ink-200 bg-ink-200 sm:grid-cols-2">
            {ICT_FEATURES.map((f, i) => (
              <Reveal key={f.id} delay={i * 0.07}>
                <div className="flex h-full flex-col bg-white p-8 lg:p-10">
                  <span className="label-en text-amber-600">{f.en}</span>
                  <h3 className="serif mt-5 text-[18px] leading-[1.6] text-ink-900">{f.title}</h3>
                  <p className="mt-4 text-[13px] leading-[2.05] text-ink-600">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 効果 */}
      <section className="mx-auto max-w-[1200px] px-6 py-24 sm:px-8 lg:px-12 lg:py-28">
        <Reveal>
          <SectionHead
            en="Effect"
            ja="数字で見る ICT 施工"
            lead="当社が支援した現場の平均値です。従来施工を 100 としています(掲載の数値はデモ用のサンプルです)。"
          />
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <Reveal>
            <div className="border border-ink-200 p-7 lg:p-9">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CHART_DATA} barGap={8} margin={{ top: 8, right: 8 }}>
                    <CartesianGrid
                      strokeDasharray="2 4"
                      stroke="oklch(91.5% 0.005 252)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "oklch(46% 0.011 252)" }}
                      axisLine={{ stroke: "oklch(85% 0.006 252)" }}
                      tickLine={false}
                      tickMargin={10}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "oklch(70% 0.008 252)" }}
                      axisLine={false}
                      tickLine={false}
                      width={34}
                    />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(98% 0.003 252)" }} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 14 }} iconType="square" />
                    <Bar dataKey="従来施工" fill="oklch(85% 0.006 252)" />
                    <Bar dataKey="ICT施工" fill="oklch(35% 0.085 252)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="border-t border-ink-200">
              {ICT_EFFECT.map((e) => (
                <div
                  key={e.name}
                  className="flex items-baseline justify-between gap-6 border-b border-ink-200 py-6"
                >
                  <span className="text-[13px] text-ink-700">{e.name}</span>
                  <span className="flex items-baseline gap-3">
                    <span className="serif text-[26px] leading-none text-navy-800">
                      −{100 - e.ict}
                      <span className="ml-0.5 text-[12px] text-amber-600">%</span>
                    </span>
                  </span>
                </div>
              ))}
              <p className="mt-6 text-[11px] leading-[1.9] text-ink-400">
                ※ 効果は現場条件・工種・オペレータの習熟度により異なります。実際の見込みについては
                担当よりご説明します。
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 導入の流れ */}
      <section className="border-y border-ink-200 bg-navy-900 text-white">
        <div className="relative">
          <div className="blueprint absolute inset-0 opacity-30" aria-hidden />
          <div className="relative mx-auto max-w-[1200px] px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
            <Reveal>
              <SectionHead
                en="Flow"
                tone="light"
                ja="導入までの流れ"
                lead="「機械は入ったが使えない」を残さないために、納品前後のすべての段階で担当者が関わります。"
              />
            </Reveal>

            <div className="mt-16 grid gap-px bg-white/10 lg:grid-cols-5">
              {ICT_FLOW.map((f, i) => (
                <Reveal key={f.step} delay={i * 0.07}>
                  <div className="flex h-full flex-col bg-navy-900 p-7 lg:p-8">
                    <span className="tnum text-[11px] tracking-[0.2em] text-amber-400">
                      {f.step}
                    </span>
                    <h3 className="serif mt-6 text-[15.5px] leading-[1.7] text-white">
                      {f.title}
                    </h3>
                    <p className="mt-4 text-[12px] leading-[2] text-white/60">{f.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2}>
              <div className="mt-14 flex flex-col items-start gap-6 border border-white/15 p-8 sm:flex-row sm:items-center sm:justify-between lg:p-10">
                <div>
                  <h3 className="serif text-[17px] leading-[1.7] text-white">
                    現場見学・操作体験会を随時開催しています
                  </h3>
                  <p className="mt-3 max-w-2xl text-[12.5px] leading-[2] text-white/60">
                    稼働中の現場をお借りし、マシンコントロール搭載機を実際に操作いただけます。
                    参加は無料です。スマートフォンを用いた 3 次元測量のデモも行っています。
                  </p>
                </div>
                <Link to="/contact?subject=ICT建機の体験会について" className="shrink-0">
                  <Button variant="accent" size="lg">
                    体験会について問い合わせる <ArrowRight size={15} />
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ICT 対応機 */}
      <section className="mx-auto max-w-[1200px] px-6 py-24 sm:px-8 lg:px-12 lg:py-28">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHead
              en="Lineup"
              ja={`ICT 対応機(${ictMachines.length} 機種)`}
              lead="いずれも設計データの準備・現地調整・オペレータ講習込みでお貸出しできます。"
            />
            <ArrowLink to="/rental?ict=1" className="shrink-0">
              一覧で見る
            </ArrowLink>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ictMachines.map((m, i) => (
            <MachineCard key={m.id} m={m} index={i} />
          ))}
        </div>

        <Reveal>
          <div className="mt-16 border border-ink-200 bg-ink-25 p-9 lg:p-12">
            <h2 className="serif text-[19px] leading-[1.7] text-ink-900">
              お手持ちの機械に、後付けという選択肢もあります。
            </h2>
            <p className="mt-4 max-w-3xl text-[13px] leading-[2.05] text-ink-600">
              レトロフィットキットを装着すれば、既存の油圧ショベルで 3D マシンガイダンスを
              使えます。取付と撤去は当社が行い、キットのみの月単位レンタルにも対応します。
              新車を導入する前に、まず一台から試したいというお客様に多くご利用いただいています。
              対応可能な母機の型式には条件がありますので、お手持ちの機械の型式をお知らせください。
            </p>
            <div className="mt-8">
              <Link to="/contact?subject=レトロフィットキットについて">
                <Button>レトロフィットについて相談する</Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
