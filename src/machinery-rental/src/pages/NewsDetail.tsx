import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { NEWS } from "../data/seed";
import { Button, Reveal, Tag } from "../components/ui";

export default function NewsDetail() {
  const { id } = useParams();
  const index = NEWS.findIndex((n) => n.id === id);
  const item = NEWS[index];

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="serif text-[18px] text-ink-900">お知らせが見つかりませんでした</p>
        <p className="mt-4 text-[13px] text-ink-500">
          URL が変更されたか、掲載を終了した可能性があります。
        </p>
        <Link to="/news" className="mt-8 inline-block">
          <Button>お知らせ一覧へ</Button>
        </Link>
      </div>
    );
  }

  const prev = NEWS[index + 1];
  const next = NEWS[index - 1];

  return (
    <>
      <div className="border-b border-ink-200 bg-ink-25">
        <div className="thin-scroll mx-auto flex max-w-[1200px] items-center gap-2 overflow-x-auto px-6 py-3 text-[11px] text-ink-400 sm:px-8 lg:px-12">
          <Link to="/" className="shrink-0 hover:text-navy-700">
            ホーム
          </Link>
          <span className="shrink-0 text-ink-300">/</span>
          <Link to="/news" className="shrink-0 hover:text-navy-700">
            お知らせ
          </Link>
          <span className="shrink-0 text-ink-300">/</span>
          <span className="shrink-0 truncate text-ink-600">{item.title}</span>
        </div>
      </div>

      <article className="mx-auto max-w-[760px] px-6 py-16 sm:px-8 lg:py-24">
        <Reveal>
          <div className="flex items-center gap-4">
            <time className="tnum text-[12px] text-ink-400">{item.date.replace(/-/g, ".")}</time>
            <Tag tone={item.category === "新商品" ? "amber" : "outline"}>{item.category}</Tag>
          </div>

          <h1 className="serif mt-6 text-[26px] leading-[1.65] text-ink-900 sm:text-[32px]">
            {item.title}
          </h1>

          <p className="mt-8 border-l-2 border-amber-500 pl-6 text-[14px] leading-[2.1] text-ink-700">
            {item.lead}
          </p>

          <div className="mt-12 space-y-7 border-t border-ink-200 pt-12">
            {item.body.map((p, i) => (
              <p key={i} className="text-[14px] leading-[2.2] text-ink-700">
                {p}
              </p>
            ))}
          </div>

          <div className="mt-14 border border-ink-200 bg-ink-25 p-8">
            <p className="text-[12.5px] leading-[2] text-ink-600">
              本件に関するお問い合わせは、お問い合わせフォームまたは最寄りの営業所までご連絡ください。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={`/contact?subject=${encodeURIComponent(item.title)}`}>
                <Button>この件について問い合わせる</Button>
              </Link>
              <Link to="/overview#branches">
                <Button variant="outline">営業所一覧</Button>
              </Link>
            </div>
          </div>
        </Reveal>

        {/* 前後の記事 */}
        <nav className="mt-16 grid gap-px border border-ink-200 bg-ink-200 sm:grid-cols-2">
          {prev ? (
            <Link
              to={`/news/${prev.id}`}
              className="group flex flex-col gap-2 bg-white p-6 transition-colors hover:bg-ink-25"
            >
              <span className="flex items-center gap-2 text-[11px] text-ink-400">
                <ArrowLeft size={12} /> 前のお知らせ
              </span>
              <span className="text-[13px] leading-[1.8] text-ink-800 transition-colors group-hover:text-navy-700">
                {prev.title}
              </span>
            </Link>
          ) : (
            <span className="bg-white p-6" />
          )}
          {next ? (
            <Link
              to={`/news/${next.id}`}
              className="group flex flex-col items-end gap-2 bg-white p-6 text-right transition-colors hover:bg-ink-25"
            >
              <span className="flex items-center gap-2 text-[11px] text-ink-400">
                次のお知らせ <ArrowRight size={12} />
              </span>
              <span className="text-[13px] leading-[1.8] text-ink-800 transition-colors group-hover:text-navy-700">
                {next.title}
              </span>
            </Link>
          ) : (
            <span className="bg-white p-6" />
          )}
        </nav>

        <div className="mt-10 text-center">
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-[12.5px] text-ink-600 transition-colors hover:text-navy-700"
          >
            <ArrowLeft size={13} /> お知らせ一覧へ戻る
          </Link>
        </div>
      </article>
    </>
  );
}
