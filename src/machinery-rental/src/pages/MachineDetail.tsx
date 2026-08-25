import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Phone } from "lucide-react";
import { toast } from "sonner";
import { MACHINES, RENTAL_CATEGORIES, BRANCHES } from "../data/seed";
import { MachineArt } from "../components/MachineArt";
import { MachineCard } from "../components/MachineCard";
import { ArrowLink, Button, DefinitionList, Reveal, SectionHead, Tag } from "../components/ui";

export default function MachineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const m = MACHINES.find((x) => x.id === id);

  if (!m) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="serif text-[18px] text-ink-900">機種が見つかりませんでした</p>
        <p className="mt-4 text-[13px] text-ink-500">
          URL が変更されたか、掲載を終了した可能性があります。
        </p>
        <Link to="/rental" className="mt-8 inline-block">
          <Button>レンタル機械一覧へ</Button>
        </Link>
      </div>
    );
  }

  const category = RENTAL_CATEGORIES.find((c) => c.id === m.category);
  const sameGroup = MACHINES.filter((x) => x.group === m.group && x.id !== m.id).slice(0, 3);
  const sameCategory = MACHINES.filter((x) => x.category === m.category && x.id !== m.id).slice(
    0,
    3,
  );
  const related = sameGroup.length >= 2 ? sameGroup : sameCategory;

  return (
    <>
      {/* パンくず */}
      <div className="border-b border-ink-200 bg-ink-25">
        <div className="thin-scroll mx-auto flex max-w-[1200px] items-center gap-2 overflow-x-auto px-6 py-3 text-[11px] text-ink-400 sm:px-8 lg:px-12">
          <Link to="/" className="shrink-0 hover:text-navy-700">
            ホーム
          </Link>
          <span className="shrink-0 text-ink-300">/</span>
          <Link to="/rental" className="shrink-0 hover:text-navy-700">
            レンタル
          </Link>
          <span className="shrink-0 text-ink-300">/</span>
          <Link to={`/rental?cat=${m.category}`} className="shrink-0 hover:text-navy-700">
            {category?.label}
          </Link>
          <span className="shrink-0 text-ink-300">/</span>
          <span className="shrink-0 text-ink-600">{m.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-12 sm:px-8 lg:px-12 lg:py-20">
        <button
          onClick={() => navigate(-1)}
          className="mb-10 inline-flex items-center gap-2 text-[12px] text-ink-500 transition-colors hover:text-navy-700"
        >
          <ArrowLeft size={14} /> 前のページへ戻る
        </button>

        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          {/* 図版 */}
          <div>
            <div className="border border-ink-200 bg-ink-25 p-8 lg:p-12">
              <MachineArt
                kind={m.art}
                frame
                idKey={`detail-${m.id}`}
                className="w-full text-navy-700"
              />
            </div>
            <p className="mt-4 text-[10.5px] leading-[1.9] text-ink-400">
              ※ 図はイメージです。実際の機械とは形状・装備が異なる場合があります。外形寸法図は
              オンラインカタログをご覧ください。
            </p>
          </div>

          {/* 情報 */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Tag tone="outline">{category?.label}</Tag>
              <Tag tone="neutral">{m.group}</Tag>
              {m.isNew && <Tag tone="amber">NEW</Tag>}
              {m.ict && <Tag tone="navy">ICT 対応</Tag>}
              {m.electric && <Tag tone="outline">電動</Tag>}
            </div>

            <h1 className="serif mt-6 text-[28px] leading-[1.5] text-ink-900 sm:text-[34px]">
              {m.name}
            </h1>
            <p className="tnum mt-3 text-[12.5px] tracking-[0.12em] text-ink-400">
              MODEL {m.model}
            </p>

            <p className="mt-8 border-l-2 border-amber-500 pl-6 text-[14px] leading-[2.1] text-ink-700">
              {m.summary}
            </p>

            <div className="mt-12">
              <h2 className="label-en mb-6 text-ink-400">Specifications</h2>
              <DefinitionList
                items={m.specs.map((s) => ({
                  label: s.label,
                  value: <span className="tnum">{s.value}</span>,
                }))}
              />
            </div>

            <div className="mt-10 flex flex-wrap gap-2">
              {m.tags.map((t) => (
                <span
                  key={t}
                  className="border border-ink-200 px-3 py-1.5 text-[11px] text-ink-500"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* 問い合わせ導線 */}
            <div className="mt-12 border border-ink-200 bg-ink-25 p-8">
              <h2 className="serif text-[16px] leading-[1.7] text-ink-900">
                この機種の空き状況・料金をお調べします
              </h2>
              <p className="mt-3.5 text-[12.5px] leading-[2] text-ink-600">
                使用期間と現場の場所をお知らせいただければ、最寄りの営業所の在庫を確認し、
                お見積りとあわせてご回答します。
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={`/contact?subject=${encodeURIComponent(`${m.name}(${m.model})`)}`}
                  className="flex-1"
                >
                  <Button size="lg" className="w-full">
                    この機種について問い合わせる <ArrowRight size={15} />
                  </Button>
                </Link>
                <button
                  onClick={() =>
                    toast.info("このデモでは発信を行いません", {
                      description: "実際のサイトでは最寄りの営業所へ発信されます",
                    })
                  }
                  className="flex items-center justify-center gap-2 border border-ink-300 px-6 py-4 text-[13px] text-ink-700 transition-colors hover:border-navy-700 hover:text-navy-700"
                >
                  <Phone size={15} /> 電話で相談
                </button>
              </div>
              <p className="mt-5 border-t border-ink-200 pt-5 text-[11px] leading-[1.9] text-ink-500">
                取扱営業所: {BRANCHES.map((b) => b.name.replace("本社・", "")).join(" / ")}
              </p>
            </div>
          </div>
        </div>

        {/* 関連機種 */}
        {related.length > 0 && (
          <section className="mt-28">
            <Reveal>
              <SectionHead
                en="Related"
                ja={sameGroup.length >= 2 ? `同じ分類の機種(${m.group})` : "同じカテゴリの機種"}
              />
            </Reveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => (
                <MachineCard key={r.id} m={r} index={i} />
              ))}
            </div>
            <div className="mt-10">
              <ArrowLink to={`/rental?cat=${m.category}`}>
                {category?.label}の一覧を見る
              </ArrowLink>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
