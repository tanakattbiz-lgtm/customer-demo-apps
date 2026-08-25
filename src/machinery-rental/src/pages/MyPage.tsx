import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { addDays, format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  AlertTriangle,
  ChevronDown,
  ClipboardList,
  Heart,
  Mail,
  MapPin,
  RotateCcw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { BRANCHES, MACHINES, OPTIONS } from "../data/seed";
import { MachineArt } from "../components/MachineArt";
import { MachineCard } from "../components/MachineCard";
import { Badge, Button, EmptyState, Skeleton } from "../components/ui";
import { ymdhm, yen } from "../lib/format";
import { fakeApi } from "../lib/fakeApi";
import { itemTotal, useStore, type OrderStatus } from "../store";

const TABS = [
  { id: "orders", label: "申込履歴", icon: ClipboardList },
  { id: "favorites", label: "お気に入り", icon: Heart },
  { id: "inquiries", label: "問い合わせ履歴", icon: Mail },
] as const;

const statusTone: Record<OrderStatus, "sun" | "sea" | "ok" | "neutral" | "ng"> = {
  受付中: "sun",
  手配済み: "sea",
  貸出中: "ok",
  返却済み: "neutral",
  キャンセル: "ng",
};

export default function MyPage() {
  const orders = useStore((s) => s.orders);
  const favorites = useStore((s) => s.favorites);
  const inquiries = useStore((s) => s.inquiries);
  const cancelOrder = useStore((s) => s.cancelOrder);
  const resetAll = useStore((s) => s.resetAll);

  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("orders");
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fakeApi(true, 450).then(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [tab]);

  const favMachines = MACHINES.filter((m) => favorites.includes(m.id));

  const doCancel = async () => {
    if (!confirmId) return;
    setCanceling(true);
    await fakeApi(true, 700);
    cancelOrder(confirmId);
    setCanceling(false);
    setConfirmId(null);
    toast.success("お申し込みをキャンセルしました", {
      description: "ご不明点はお気軽にお問い合わせください",
    });
  };

  return (
    <>
      <div className="mesh-soft border-b border-ink-200">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <p className="text-[11px] font-black tracking-[0.18em] text-sun-800">MY PAGE</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">
            申込・お気に入り
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-600">
            このデモでは、お申し込みやお気に入りはブラウザ内に保存されます。ページを再読み込みしても
            内容は残ります。
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* タブ */}
        <div className="thin-scroll mb-8 flex gap-1 overflow-x-auto border-b border-ink-200">
          {TABS.map((t) => {
            const count =
              t.id === "orders" ? orders.length : t.id === "favorites" ? favorites.length : inquiries.length;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex shrink-0 items-center gap-2 px-4 py-3 text-[13px] font-bold transition-colors ${
                  active ? "text-ink-900" : "text-ink-400 hover:text-ink-700"
                }`}
              >
                <t.icon size={15} />
                {t.label}
                <span className="tnum rounded-full bg-ink-100 px-1.5 py-0.5 text-[10px] font-black text-ink-500">
                  {count}
                </span>
                {active && (
                  <motion.span
                    layoutId="mypage-tab"
                    className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-sun-600"
                  />
                )}
              </button>
            );
          })}
          <button
            onClick={() => {
              resetAll();
              toast.success("デモデータを初期状態に戻しました");
            }}
            className="ml-auto hidden shrink-0 items-center gap-1.5 self-center rounded-full border border-ink-300 px-3.5 py-2 text-[11.5px] font-bold text-ink-500 transition-colors hover:bg-ink-100 sm:inline-flex"
          >
            <RotateCcw size={13} /> リセット
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-ink-200 bg-white p-5">
                <Skeleton className="mb-3 h-4 w-40" />
                <Skeleton className="mb-2 h-3 w-64" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        ) : tab === "orders" ? (
          orders.length === 0 ? (
            <EmptyState
              icon={<ClipboardList size={28} />}
              title="まだお申し込みがありません"
              desc="機械を選んで見積カートから申し込むと、ここで進捗を確認できます。"
              action={
                <Link to="/rental">
                  <Button variant="secondary" size="lg">
                    最初の 1 台を探す
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {orders.map((o) => {
                const open = openId === o.id;
                return (
                  <article
                    key={o.id}
                    className="overflow-hidden rounded-2xl border border-ink-200 bg-white"
                  >
                    <button
                      onClick={() => setOpenId(open ? null : o.id)}
                      className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-ink-50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="tnum text-[13.5px] font-black text-ink-900">{o.id}</span>
                          <Badge tone={statusTone[o.status]}>{o.status}</Badge>
                          <span className="tnum text-[11px] font-bold text-ink-400">
                            {ymdhm(o.createdAt)} 受付
                          </span>
                        </div>
                        <p className="mt-1.5 truncate text-[12.5px] text-ink-500">
                          {o.items
                            .map((i) => MACHINES.find((m) => m.id === i.machineId)?.name)
                            .filter(Boolean)
                            .join(" / ")}
                        </p>
                        <p className="mt-1 text-[11.5px] font-bold text-ink-400">
                          {o.customer.company} ・ {o.customer.site}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="tnum text-lg font-black text-ink-900">{yen(o.total)}</p>
                        <p className="text-[10px] font-bold text-ink-400">税別</p>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-ink-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden border-t border-ink-200 bg-ink-50"
                        >
                          <div className="space-y-3 p-5">
                            {o.items.map((item) => {
                              const m = MACHINES.find((x) => x.id === item.machineId);
                              if (!m) return null;
                              const start = new Date(item.startDate);
                              return (
                                <div
                                  key={item.uid}
                                  className="flex gap-4 rounded-xl border border-ink-200 bg-white p-3"
                                >
                                  <div className="hidden shrink-0 overflow-hidden rounded-lg bg-sun-50 sm:block">
                                    <MachineArt
                                      kind={m.art}
                                      idKey={`order-${item.uid}`}
                                      className="h-16 w-24"
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[13px] font-bold text-ink-900">{m.name}</p>
                                    <p className="tnum mt-0.5 text-[11px] font-bold text-ink-400">
                                      {BRANCHES.find((b) => b.id === item.branchId)?.name} ・{" "}
                                      {format(start, "M/d(E)", { locale: ja })}〜
                                      {format(addDays(start, item.days), "M/d(E)", { locale: ja })}(
                                      {item.days}日) ・ {item.qty}台
                                    </p>
                                    {item.optionIds.length > 0 && (
                                      <div className="mt-1.5 flex flex-wrap gap-1">
                                        {item.optionIds.map((oid) => (
                                          <Badge key={oid} tone="sun">
                                            {OPTIONS.find((x) => x.id === oid)?.label}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <p className="tnum shrink-0 self-center text-[13px] font-black text-ink-900">
                                    {yen(itemTotal(item))}
                                  </p>
                                </div>
                              );
                            })}

                            <div className="grid gap-3 rounded-xl border border-ink-200 bg-white p-4 text-[12px] sm:grid-cols-2">
                              <div>
                                <p className="mb-1 text-[10px] font-black tracking-wider text-ink-400">
                                  ご担当者
                                </p>
                                <p className="font-bold text-ink-800">
                                  {o.customer.company} {o.customer.person} 様
                                </p>
                                <p className="tnum text-ink-500">{o.customer.tel}</p>
                                <p className="text-ink-500">{o.customer.email}</p>
                              </div>
                              <div>
                                <p className="mb-1 text-[10px] font-black tracking-wider text-ink-400">
                                  現場
                                </p>
                                <p className="flex items-start gap-1 font-bold text-ink-800">
                                  <MapPin size={13} className="mt-0.5 shrink-0" />
                                  {o.customer.site}
                                </p>
                                {o.customer.note && (
                                  <p className="mt-1 text-ink-500">備考: {o.customer.note}</p>
                                )}
                              </div>
                            </div>

                            {o.status !== "キャンセル" && (
                              <div className="flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setConfirmId(o.id)}
                                >
                                  この申込をキャンセル
                                </Button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </article>
                );
              })}
            </div>
          )
        ) : tab === "favorites" ? (
          favMachines.length === 0 ? (
            <EmptyState
              icon={<Heart size={28} />}
              title="お気に入りがまだありません"
              desc="機械カードのハートを押すと、気になる機種をここにまとめておけます。次回の見積り時にすぐ呼び出せます。"
              action={
                <Link to="/rental">
                  <Button variant="secondary" size="lg">
                    機械を探す
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {favMachines.map((m, i) => (
                <MachineCard key={m.id} m={m} index={i} />
              ))}
            </div>
          )
        ) : inquiries.length === 0 ? (
          <EmptyState
            icon={<Mail size={28} />}
            title="お問い合わせ履歴はありません"
            desc="お問い合わせフォームから送信すると、控えがここに残ります。"
            action={
              <Link to="/contact">
                <Button variant="secondary" size="lg">
                  お問い合わせへ
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {inquiries.map((q) => (
              <article key={q.id} className="rounded-2xl border border-ink-200 bg-white p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="sea">{q.category}</Badge>
                  <span className="tnum text-[11px] font-bold text-ink-400">
                    {ymdhm(q.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-[13px] font-bold text-ink-900">
                  {q.company} {q.name} 様
                </p>
                <p className="mt-1.5 whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink-600">
                  {q.body}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* キャンセル確認ダイアログ */}
      <AnimatePresence>
        {confirmId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !canceling && setConfirmId(null)}
              className="fixed inset-0 z-[80] bg-ink-900/45 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 6 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 z-[81] w-[min(420px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-7 shadow-[var(--shadow-pop)]"
            >
              <button
                onClick={() => !canceling && setConfirmId(null)}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-ink-400 hover:bg-ink-100"
                aria-label="閉じる"
              >
                <X size={17} />
              </button>
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-ng-100 text-ng-700">
                <AlertTriangle size={22} />
              </div>
              <h2 className="text-[17px] font-black text-ink-900">お申し込みをキャンセルします</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
                受付番号 <span className="tnum font-bold text-ink-800">{confirmId}</span>{" "}
                のお申し込みをキャンセルします。この操作は取り消せません。
              </p>
              <div className="mt-6 flex gap-2.5">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmId(null)}
                  disabled={canceling}
                >
                  やめる
                </Button>
                <Button variant="danger" className="flex-1" loading={canceling} onClick={doCancel}>
                  キャンセルする
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
