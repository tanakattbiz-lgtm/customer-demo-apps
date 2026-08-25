import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Download, Eye, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { CATALOGS } from "../data/seed";
import { MachineArt } from "../components/MachineArt";
import { Button, CardSkeleton, PageHead, Reveal, Tag } from "../components/ui";
import { fakeApi } from "../lib/fakeApi";
import { useStore } from "../store";

export default function Catalog() {
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const viewed = useStore((s) => s.viewedCatalogs);
  const markViewed = useStore((s) => s.markCatalogViewed);

  useEffect(() => {
    let alive = true;
    fakeApi(true, 420).then(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = preview ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [preview]);

  const item = CATALOGS.find((c) => c.id === preview);

  return (
    <>
      <PageHead
        en="Catalog"
        ja="オンラインカタログ"
        lead="機種の主要諸元、外形寸法、適合母機の一覧をまとめています。ウェブ上でご覧いただけるほか、PDF としてダウンロードいただけます。"
        breadcrumb={[{ label: "ホーム", to: "/" }, { label: "オンラインカタログ" }]}
      />

      <div className="mx-auto max-w-[1200px] px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-px border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-3">
            {CATALOGS.map((c, i) => (
              <Reveal key={c.id} delay={Math.min(i * 0.06, 0.3)}>
                <article className="flex h-full flex-col bg-white p-8">
                  <div className="flex items-center justify-between">
                    <Tag tone="outline">{c.category}</Tag>
                    {viewed.includes(c.id) && (
                      <span className="text-[10px] text-amber-700">閲覧済み</span>
                    )}
                  </div>

                  <div className="my-8 border border-ink-100 bg-ink-25 py-4">
                    <MachineArt
                      kind={c.art}
                      idKey={`cat-${c.id}`}
                      className="h-24 w-full text-navy-600"
                    />
                  </div>

                  <h2 className="serif text-[16px] leading-[1.7] text-ink-900">{c.title}</h2>
                  <p className="mt-3.5 text-[12.5px] leading-[2] text-ink-600">{c.desc}</p>

                  <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-1.5 border-t border-ink-100 pt-5 text-[11px] text-ink-500">
                    <div className="flex gap-2">
                      <dt className="text-ink-400">ページ数</dt>
                      <dd className="tnum">{c.pages}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-ink-400">容量</dt>
                      <dd className="tnum">{c.size}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-ink-400">更新</dt>
                      <dd className="tnum">{c.updated.replace(/-/g, ".")}</dd>
                    </div>
                  </dl>

                  <div className="mt-7 flex gap-2.5">
                    <button
                      onClick={() => {
                        setPreview(c.id);
                        markViewed(c.id);
                      }}
                      className="flex flex-1 items-center justify-center gap-2 border border-ink-300 px-4 py-3 text-[12px] text-ink-700 transition-colors hover:border-navy-700 hover:text-navy-700"
                    >
                      <Eye size={14} /> 閲覧する
                    </button>
                    <button
                      onClick={() =>
                        toast.info("このデモでは PDF の配布を省略しています", {
                          description: "実際のサイトではその場でダウンロードできます",
                        })
                      }
                      className="grid h-auto w-12 place-items-center border border-ink-300 text-ink-500 transition-colors hover:border-navy-700 hover:text-navy-700"
                      aria-label="PDF をダウンロード"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal>
          <div className="mt-16 grid gap-8 border border-ink-200 bg-ink-25 p-9 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
            <div>
              <h2 className="serif text-[19px] leading-[1.7] text-ink-900">
                冊子のカタログも郵送しています。
              </h2>
              <p className="mt-4 max-w-2xl text-[13px] leading-[2.05] text-ink-600">
                現場事務所に置いておける冊子版をご希望の場合は、お問い合わせフォームより
                送付先をお知らせください。営業担当がお届けにあがることも可能です。
              </p>
            </div>
            <Link to="/contact?subject=カタログの送付について" className="shrink-0">
              <Button size="lg">カタログを請求する</Button>
            </Link>
          </div>
        </Reveal>
      </div>

      {/* 閲覧モーダル(誌面プレビュー) */}
      <AnimatePresence>
        {item && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreview(null)}
              className="fixed inset-0 z-[80] bg-navy-900/55 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`${item.title} のプレビュー`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-4 top-1/2 z-[81] mx-auto max-h-[86dvh] w-[min(900px,92vw)] -translate-y-1/2 overflow-y-auto bg-white"
            >
              <div className="sticky top-0 flex items-center justify-between border-b border-ink-200 bg-white px-7 py-4">
                <div className="flex items-center gap-3">
                  <FileText size={15} className="text-ink-400" />
                  <p className="serif text-[14px] text-ink-900">{item.title}</p>
                </div>
                <button
                  onClick={() => setPreview(null)}
                  className="grid h-9 w-9 place-items-center text-ink-500 hover:text-ink-900"
                  aria-label="閉じる"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              <div className="p-7 lg:p-10">
                {/* 表紙 */}
                <div className="border border-ink-200 bg-ink-25 p-10">
                  <span className="label-en text-amber-600">{item.category}</span>
                  <h3 className="serif mt-4 text-[24px] leading-[1.5] text-ink-900">
                    {item.title}
                  </h3>
                  <MachineArt
                    kind={item.art}
                    frame
                    idKey={`preview-${item.id}`}
                    className="mt-8 w-full text-navy-700"
                  />
                  <div className="mt-8 flex items-end justify-between border-t border-ink-200 pt-5">
                    <p className="serif text-[13px] text-ink-700">○○レンタル株式会社</p>
                    <p className="tnum text-[10.5px] text-ink-400">
                      {item.updated.replace(/-/g, ".")} 版
                    </p>
                  </div>
                </div>

                {/* 誌面イメージ */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border border-ink-200 p-6">
                      <p className="tnum text-[10px] text-ink-400">
                        P.{String(i + 2).padStart(2, "0")}
                      </p>
                      <div className="mt-4 space-y-2">
                        <div className="h-2 w-2/3 bg-ink-200" />
                        <div className="h-2 w-full bg-ink-100" />
                        <div className="h-2 w-5/6 bg-ink-100" />
                      </div>
                      <MachineArt
                        kind={item.art}
                        idKey={`preview-p${i}-${item.id}`}
                        className="mt-5 h-16 w-full text-ink-300"
                      />
                      <div className="mt-5 space-y-2">
                        <div className="h-1.5 w-full bg-ink-100" />
                        <div className="h-1.5 w-4/5 bg-ink-100" />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-8 text-[11px] leading-[1.9] text-ink-400">
                  ※ 本デモでは誌面イメージのみを表示しています。実際のサイトでは全 {item.pages}{" "}
                  ページの内容をブラウザ上でご覧いただけます。
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
