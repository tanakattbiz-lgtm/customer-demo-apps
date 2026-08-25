import { Link } from "react-router-dom";
import { TERMS } from "../data/seed";
import { Button, PageHead, Reveal } from "../components/ui";

export default function Terms() {
  return (
    <>
      <PageHead
        en="Terms"
        ja="建設機械等レンタル基本約款"
        lead="当社がお客様に建設機械等をレンタルする際の基本的な事項を定めたものです。本ページには主要な条項を抜粋して掲載しています。"
        breadcrumb={[{ label: "ホーム", to: "/" }, { label: "レンタル基本約款" }]}
      />

      <div className="mx-auto max-w-[900px] px-6 py-16 sm:px-8 lg:py-24">
        <Reveal>
          <div className="border border-ink-200 bg-ink-25 p-7">
            <p className="text-[12.5px] leading-[2.05] text-ink-600">
              本デモに掲載している約款は、コーポレートサイトの構成をお示しするためのサンプルです。
              実際の契約内容を定めるものではありません。
            </p>
          </div>
        </Reveal>

        <div className="mt-14">
          {TERMS.map((t, i) => (
            <Reveal key={t.article} delay={Math.min(i * 0.05, 0.3)}>
              <section className="border-b border-ink-200 py-9 first:border-t">
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-8">
                  <div className="shrink-0 sm:w-32">
                    <span className="tnum text-[12px] tracking-wide text-amber-600">
                      {t.article}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h2 className="serif text-[16px] leading-[1.7] text-ink-900">{t.title}</h2>
                    <p className="mt-4 text-[13.5px] leading-[2.15] text-ink-600">{t.body}</p>
                  </div>
                </div>
              </section>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-14 border border-ink-200 p-9">
            <h2 className="serif text-[17px] leading-[1.7] text-ink-900">
              約款についてのご質問
            </h2>
            <p className="mt-4 text-[13px] leading-[2.05] text-ink-600">
              契約内容や補償の範囲についてご不明な点がありましたら、担当営業所または
              お問い合わせフォームよりご連絡ください。全文の写しをご希望の場合もお申し付けください。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contact?subject=レンタル基本約款について">
                <Button>約款について問い合わせる</Button>
              </Link>
              <Link to="/overview#faq">
                <Button variant="outline">よくあるご質問</Button>
              </Link>
            </div>
          </div>
        </Reveal>

        <p className="mt-10 text-right text-[11px] text-ink-400">
          制定 1993 年 4 月 / 最終改定 2025 年 4 月
        </p>
      </div>
    </>
  );
}
