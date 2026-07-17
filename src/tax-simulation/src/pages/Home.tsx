import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight, Home as HomeIcon, Landmark, HandCoins, Building2,
  Sparkle, Users, ShieldCheck, ChevronRight,
} from "lucide-react";
import { SIMULATORS, type SimType } from "../data/simulators";
import { EXPERTS } from "../data/experts";
import { Stars } from "../components/ui";

const ICONS: Record<SimType, typeof HomeIcon> = {
  sale: HomeIcon,
  inheritance: Landmark,
  gift: HandCoins,
  rental: Building2,
};

const fade = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.45, ease: "easeOut" as const },
};

export function Home() {
  const featured = EXPERTS.slice(0, 3);
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(700px 380px at 85% -10%, oklch(48% 0.17 258 / 0.55), transparent 70%), radial-gradient(500px 300px at 5% 110%, oklch(56% 0.16 255 / 0.35), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-primary-100">
              <Sparkle size={13} className="text-gold" />
              AIアドバイス付き・無料でつかえる税金シミュレーション
            </p>
            <h1 className="text-3xl font-extrabold leading-snug tracking-tight sm:text-[42px] sm:leading-[1.3]">
              その税金、
              <span className="text-primary-200">払いすぎ</span>
              かもしれません。
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-[15px]">
              不動産の売却・相続・贈与・家賃収入。かんたんな入力だけで税額を概算し、
              AIがあなたの状況に合わせた節税のヒントをアドバイス。
              そのまま気になる専門家を指名して相談まで進めます。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/simulators"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-navy shadow-lg transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                無料でシミュレーションする
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/experts"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-white/10"
              >
                専門家をさがす
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {[
                ["16名", "登録専門家"],
                ["4種類", "シミュレーター"],
                ["約1分", "入力〜結果まで"],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="font-en text-2xl font-extrabold text-white">{v}</p>
                  <p className="text-xs text-slate-400">{l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* シミュレーター */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <motion.div {...fade} className="mb-8">
          <p className="font-en text-xs font-bold uppercase tracking-[0.2em] text-primary-600">
            Simulators
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-[28px]">
            知りたい税金からはじめる
          </h2>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2">
          {SIMULATORS.map((s, i) => {
            const Icon = ICONS[s.type];
            return (
              <motion.div key={s.type} {...fade} transition={{ ...fade.transition, delay: i * 0.05 }}>
                <Link
                  to={`/simulators/${s.type}`}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors duration-200 group-hover:bg-primary-600 group-hover:text-white">
                      <Icon size={20} />
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                      {s.tag} / {s.time}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                  <p className="mt-1.5 flex-1 text-[13px] leading-6 text-slate-500">{s.desc}</p>
                  <p className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary-600">
                    試算する
                    <ChevronRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 特徴 */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <motion.div {...fade} className="mb-10 text-center">
            <p className="font-en text-xs font-bold uppercase tracking-[0.2em] text-primary-600">
              Features
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-[28px]">
              計算して終わり、にしない
            </h2>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Sparkle,
                title: "AIが結果を読み解く",
                desc: "税額の数字だけでなく、「取得費の書類を探すと税額が下がる可能性」など、あなたの入力内容に応じた次の一手をAIがアドバイスします。",
              },
              {
                icon: Users,
                title: "専門家を自分で指名",
                desc: "税理士・司法書士・FP・弁護士から、得意分野・地域・料金で絞り込み。プロフィールを見て納得した専門家を自由に選んで相談できます。",
              },
              {
                icon: ShieldCheck,
                title: "しつこい営業なし",
                desc: "相談の申込はあなたが指名した専門家にだけ届きます。一括見積もりのように複数の事務所から電話がかかってくることはありません。",
              },
            ].map((f, i) => (
              <motion.div key={f.title} {...fade} transition={{ ...fade.transition, delay: i * 0.06 }}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm shadow-primary-600/25">
                  <f.icon size={20} />
                </span>
                <h3 className="mt-4 text-base font-bold">{f.title}</h3>
                <p className="mt-2 text-[13px] leading-6 text-slate-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 専門家 */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <motion.div {...fade} className="mb-8 flex items-end justify-between">
          <div>
            <p className="font-en text-xs font-bold uppercase tracking-[0.2em] text-primary-600">
              Experts
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-[28px]">
              相談できる専門家
            </h2>
          </div>
          <Link
            to="/experts"
            className="hidden items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700 sm:inline-flex"
          >
            すべて見る <ChevronRight size={15} />
          </Link>
        </motion.div>
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((e, i) => (
            <motion.div key={e.id} {...fade} transition={{ ...fade.transition, delay: i * 0.05 }}>
              <Link
                to={`/experts/${e.id}`}
                className="block h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full text-base font-bold text-white"
                    style={{ background: e.color }}
                  >
                    {e.name[0]}
                  </span>
                  <div>
                    <p className="text-[15px] font-bold">{e.name}</p>
                    <p className="text-xs text-slate-500">
                      {e.qualification} / {e.area}
                    </p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-[13px] leading-6 text-slate-500">
                  {e.message}
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <Stars rating={e.rating} />
                  <span className="font-en font-bold text-ink">{e.rating}</span>
                  ({e.reviews}件)
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link to="/experts" className="text-sm font-bold text-primary-600">
            すべての専門家を見る →
          </Link>
        </div>
      </section>

      {/* 流れ */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <motion.h2 {...fade} className="mb-10 text-center text-2xl font-extrabold tracking-tight sm:text-[28px]">
            ご利用の流れ
          </motion.h2>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              ["シミュレーション", "金額や家族構成などを入力するだけ。会員登録は不要です。"],
              ["AIアドバイス", "結果に合わせて、節税の可能性や注意点をAIが解説します。"],
              ["専門家を指名", "得意分野や口コミを見て、相談したい専門家を自由に選択。"],
              ["相談・解決", "オンラインまたは対面で相談。初回無料の専門家も多数。"],
            ].map(([t, d], i) => (
              <motion.div key={t} {...fade} transition={{ ...fade.transition, delay: i * 0.06 }} className="relative">
                <span className="font-en text-3xl font-extrabold text-primary-200">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-base font-bold">{t}</h3>
                <p className="mt-1.5 text-[13px] leading-6 text-slate-500">{d}</p>
              </motion.div>
            ))}
          </div>
          <motion.div {...fade} className="mt-12 text-center">
            <Link
              to="/simulators"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-primary-600/25 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              いますぐ無料で試算する
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
