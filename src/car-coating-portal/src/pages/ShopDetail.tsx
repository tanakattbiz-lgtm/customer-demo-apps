import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  MapPin,
  Clock,
  CalendarX,
  Bookmark,
  Star,
  Camera,
  MessageSquarePlus,
  ThumbsUp,
  BadgeCheck,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../store";
import { type MenuTag } from "../data/seed";
import { useLoad } from "../lib/useLoad";
import {
  Card,
  Pill,
  Stars,
  StarInput,
  Skeleton,
  PhotoTile,
  Button,
  Modal,
  Field,
  inputCls,
  EmptyState,
} from "../components/ui";
import { yen, fromNow, dateLabel } from "../lib/format";

function ReviewModal({
  open,
  onClose,
  shopId,
  menus,
}: {
  open: boolean;
  onClose: () => void;
  shopId: string;
  menus: MenuTag[];
}) {
  const addReview = useStore((s) => s.addReview);
  const [rating, setRating] = useState(5);
  const [author, setAuthor] = useState("");
  const [car, setCar] = useState("");
  const [menu, setMenu] = useState<MenuTag>(menus[0]);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  const err = {
    author: !author.trim() ? "ニックネームを入力してください" : "",
    body:
      body.trim().length < 10 ? "口コミは10文字以上でご記入ください" : "",
  };
  const valid = !err.author && !err.body;

  const submit = async () => {
    setTouched(true);
    if (!valid) return;
    setSaving(true);
    // 疑似 API 送信
    await new Promise((r) => setTimeout(r, 700));
    addReview(shopId, {
      author: author.trim(),
      rating,
      car: car.trim() || "非公開",
      menu,
      body: body.trim(),
    });
    setSaving(false);
    toast.success("口コミを投稿しました。ありがとうございます！");
    onClose();
    setRating(5);
    setAuthor("");
    setCar("");
    setBody("");
    setTouched(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="口コミを投稿する" width={560}>
      <div className="space-y-4">
        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-700">総合評価</span>
          <div className="flex items-center gap-3">
            <StarInput value={rating} onChange={setRating} />
            <span className="tnum text-lg font-bold text-amber-600">{rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="ニックネーム" required error={touched ? err.author : ""}>
            <input
              className={inputCls}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="例：週末ドライバー"
            />
          </Field>
          <Field label="車種（任意）" hint="未入力の場合は「非公開」で表示されます">
            <input
              className={inputCls}
              value={car}
              onChange={(e) => setCar(e.target.value)}
              placeholder="例：トヨタ アルファード"
            />
          </Field>
        </div>
        <Field label="利用した施工メニュー">
          <select className={inputCls} value={menu} onChange={(e) => setMenu(e.target.value as MenuTag)}>
            {menus.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="口コミ本文"
          required
          error={touched ? err.body : ""}
          hint={`${body.length} 文字`}
        >
          <textarea
            className={inputCls + " min-h-28 resize-none"}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="仕上がりや対応の丁寧さ、料金への納得感など、これから利用する方の参考になる感想をご記入ください。"
          />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            キャンセル
          </Button>
          <Button onClick={submit} loading={saving} disabled={!valid}>
            投稿する
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-56 w-full" />
      </div>
    </div>
  );
}

export default function ShopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const shop = useStore((s) => s.shops.find((x) => x.id === id));
  const saved = useStore((s) => (id ? s.bookmarks.includes(id) : false));
  const toggleBookmark = useStore((s) => s.toggleBookmark);
  const markHelpful = useStore((s) => s.markHelpful);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [activeShot, setActiveShot] = useState(0);

  const { loading } = useLoad(() => true, [id], 520);

  const ratingBars = useMemo(() => {
    if (!shop) return [];
    const counts = [5, 4, 3, 2, 1].map((n) => ({
      n,
      c: shop.reviews.filter((r) => r.rating === n).length,
    }));
    const total = shop.reviews.length || 1;
    return counts.map((x) => ({ ...x, pct: Math.round((x.c / total) * 100) }));
  }, [shop]);

  if (!shop) {
    return (
      <EmptyState
        icon={<Camera size={26} />}
        title="店舗が見つかりませんでした"
        description="URLが正しいかご確認ください。"
        action={<Button onClick={() => navigate("/")}>店舗一覧へ戻る</Button>}
      />
    );
  }

  if (loading) return <DetailSkeleton />;

  const shots = [{ id: "main", title: "メインビジュアル", hue: shop.hue }, ...shop.gallery];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-1 text-xs text-ink-400">
        <Link to="/" className="hover:text-brand-600">
          店舗をさがす
        </Link>
        <ChevronRight size={13} />
        <span>{shop.pref}</span>
        <ChevronRight size={13} />
        <span className="text-ink-600">{shop.name}</span>
      </div>

      <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
        <ArrowLeft size={16} /> 検索結果へ戻る
      </Link>

      {/* ギャラリー */}
      <div className="grid gap-3 sm:grid-cols-5">
        <div className="relative sm:col-span-3">
          <PhotoTile
            hue={shots[activeShot].hue}
            label={shots[activeShot].title}
            className="h-64 w-full sm:h-80"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {shop.isPromoted && (
              <Pill tone="aqua" className="bg-white/90">
                <Sparkles size={11} fill="currentColor" strokeWidth={0} /> PR掲載
              </Pill>
            )}
            {shop.badges.map((b) => (
              <Pill key={b} tone="amber" className="bg-white/90">
                {b}
              </Pill>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:col-span-2 sm:grid-cols-2">
          {shots.slice(0, 4).map((g, i) => (
            <button
              key={g.id}
              onClick={() => setActiveShot(i)}
              className={
                "overflow-hidden rounded-lg ring-2 transition " +
                (activeShot === i ? "ring-brand-500" : "ring-transparent hover:ring-brand-200")
              }
            >
              <PhotoTile hue={g.hue} className="h-16 w-full sm:h-[92px]" icon={false} />
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* メイン */}
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-sm text-ink-400">
              <MapPin size={14} /> {shop.pref} {shop.city}・{shop.station}
            </div>
            <h1 className="text-2xl font-extrabold text-ink-900">{shop.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Stars value={shop.rating} size={18} />
              <span className="tnum text-xl font-bold text-amber-600">{shop.rating.toFixed(1)}</span>
              <span className="tnum text-sm text-ink-400">口コミ {shop.reviewCount}件</span>
              <span className="text-ink-200">|</span>
              <span className="text-sm text-ink-500">創業 {shop.established}年</span>
            </div>
            <p className="mt-3 leading-relaxed text-ink-600">{shop.catch}</p>
          </div>

          {/* 施工メニュー・料金 */}
          <Card className="overflow-hidden">
            <div className="border-b border-ink-100 px-5 py-3">
              <h2 className="text-sm font-bold text-ink-800">施工メニュー・料金の目安</h2>
            </div>
            <ul className="divide-y divide-ink-100">
              {shop.menus.map((m) => (
                <li key={m.tag} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <BadgeCheck size={15} className="shrink-0 text-brand-500" />
                      <span className="text-sm font-semibold text-ink-800">{m.name}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 pl-6 text-xs text-ink-400">
                      <Pill tone="blue">{m.tag}</Pill>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} /> {m.duration}
                      </span>
                    </div>
                  </div>
                  <span className="tnum shrink-0 text-base font-bold text-ink-900">{yen(m.price)}〜</span>
                </li>
              ))}
            </ul>
            <p className="border-t border-ink-100 bg-ink-50 px-5 py-2.5 text-[11px] text-ink-400">
              ※ 料金は車両サイズ・状態により変動します。正確な金額は店頭でのお見積りをご確認ください。
            </p>
          </Card>

          {/* 施工事例 */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Camera size={18} className="text-brand-500" />
              <h2 className="text-lg font-bold text-ink-900">施工事例</h2>
              <span className="tnum text-xs text-ink-400">{shop.gallery.length}件</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {shop.gallery.map((g) => (
                <PhotoTile key={g.id} hue={g.hue} label={g.title} className="aspect-square w-full" />
              ))}
            </div>
          </div>

          {/* 口コミ */}
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-amber-400" fill="currentColor" strokeWidth={0} />
                <h2 className="text-lg font-bold text-ink-900">口コミ</h2>
                <span className="tnum text-xs text-ink-400">最新 {shop.reviews.length}件を表示</span>
              </div>
              <Button onClick={() => setReviewOpen(true)}>
                <MessageSquarePlus size={16} /> 口コミを書く
              </Button>
            </div>

            {/* 評価サマリ */}
            <Card className="mb-4 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex shrink-0 flex-col items-center sm:w-40">
                  <span className="tnum text-4xl font-extrabold text-amber-600">
                    {shop.rating.toFixed(1)}
                  </span>
                  <Stars value={shop.rating} size={16} />
                  <span className="tnum mt-1 text-xs text-ink-400">{shop.reviewCount}件の評価</span>
                </div>
                <div className="flex-1 space-y-1.5">
                  {ratingBars.map((b) => (
                    <div key={b.n} className="flex items-center gap-2">
                      <span className="tnum flex w-8 items-center gap-0.5 text-xs text-ink-500">
                        {b.n}
                        <Star size={11} className="text-amber-400" fill="currentColor" strokeWidth={0} />
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                        <div
                          className="h-full rounded-full bg-amber-400 transition-[width] duration-500"
                          style={{ width: `${b.pct}%` }}
                        />
                      </div>
                      <span className="tnum w-8 text-right text-xs text-ink-400">{b.c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {shop.reviews.length === 0 ? (
              <EmptyState
                icon={<MessageSquarePlus size={26} />}
                title="まだ口コミがありません"
                description="この店舗を利用したことがある方は、最初の口コミを投稿してみませんか？"
                action={<Button onClick={() => setReviewOpen(true)}>口コミを書く</Button>}
              />
            ) : (
              <div className="space-y-3">
                {shop.reviews.map((r) => (
                  <motion.div key={r.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                            {r.author.slice(0, 1)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-ink-800">{r.author}</div>
                            <div className="flex items-center gap-1.5">
                              <Stars value={r.rating} size={12} />
                              <span className="text-[11px] text-ink-400" title={dateLabel(r.createdAt)}>
                                {fromNow(r.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Pill tone="blue">{r.menu}</Pill>
                      </div>
                      <p className="mt-2.5 text-sm leading-relaxed text-ink-600">{r.body}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[11px] text-ink-400">車種：{r.car}</span>
                        <button
                          onClick={() => {
                            markHelpful(shop.id, r.id);
                            toast.message("「参考になった」を送信しました");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1 text-xs font-medium text-ink-500 transition hover:border-brand-300 hover:text-brand-600"
                        >
                          <ThumbsUp size={13} /> 参考になった
                          <span className="tnum font-bold">{r.helpful}</span>
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* サイド情報 */}
        <div className="space-y-4">
          <Card className="sticky top-20 p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="tnum text-2xl font-extrabold text-amber-600">{shop.rating.toFixed(1)}</span>
              <Stars value={shop.rating} />
              <span className="tnum text-xs text-ink-400">({shop.reviewCount})</span>
            </div>
            <dl className="space-y-2.5 text-sm">
              <div className="flex gap-2">
                <dt className="flex w-20 shrink-0 items-center gap-1 text-ink-400">
                  <MapPin size={14} /> 所在地
                </dt>
                <dd className="text-ink-700">
                  {shop.pref} {shop.city}
                  <br />
                  <span className="text-xs text-ink-400">{shop.station}</span>
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="flex w-20 shrink-0 items-center gap-1 text-ink-400">
                  <Clock size={14} /> 営業時間
                </dt>
                <dd className="text-ink-700">{shop.hours}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="flex w-20 shrink-0 items-center gap-1 text-ink-400">
                  <CalendarX size={14} /> 定休日
                </dt>
                <dd className="text-ink-700">{shop.holiday}</dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {shop.tags.map((t) => (
                <Pill key={t} tone="blue">
                  {t}
                </Pill>
              ))}
            </div>

            <div className="mt-5 space-y-2">
              <Button className="w-full" onClick={() => setReviewOpen(true)}>
                <MessageSquarePlus size={16} /> 口コミを書く
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  toggleBookmark(shop.id);
                  toast[saved ? "message" : "success"](saved ? "保存を解除しました" : "保存した店に追加しました");
                }}
              >
                <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
                {saved ? "保存済み" : "この店を保存"}
              </Button>
            </div>

            {/* 簡易マップ表現(座標は持たないため、エリアの模式図で代替) */}
            <div className="mt-4 overflow-hidden rounded-xl border border-ink-100">
              <div className="relative h-28 bg-[linear-gradient(0deg,transparent_23px,oklch(90%_0.01_240)_24px),linear-gradient(90deg,transparent_23px,oklch(90%_0.01_240)_24px)] bg-[size:24px_24px]">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-brand-600">
                  <MapPin size={30} fill="currentColor" className="drop-shadow" />
                </div>
                <span className="absolute bottom-2 left-2 rounded bg-white/85 px-2 py-0.5 text-[10px] text-ink-500">
                  {shop.station}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        shopId={shop.id}
        menus={shop.tags}
      />
    </motion.div>
  );
}
