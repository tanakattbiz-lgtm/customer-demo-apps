import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { CalendarCheck2, CalendarClock, CalendarPlus, Phone, PencilLine } from "lucide-react";
import { useStore, staffName } from "../store";
import { toast } from "sonner";
import { ME_ID, OPEN_STAGES, actionsOf, type Deal, type NextAction } from "../data/seed";
import { useLoad } from "../lib/useLoad";
import { daysFromToday, fmtDateJa, man, relDay } from "../lib/format";
import { ActivityModal, NextActionModal } from "../components/forms";
import { gcalUrl } from "../lib/gcal";
import { Button, Card, EmptyState, PageHeader, Pill, Segmented, Skeleton } from "../components/ui";
import { StagePill } from "../components/pills";

type Bucket = "overdue" | "today" | "week" | "later" | "none";
const BUCKETS: { key: Bucket; label: string; sub: string }[] = [
  { key: "overdue", label: "期限超過", sub: "予定日を過ぎている対応" },
  { key: "today", label: "今日", sub: "本日対応予定" },
  { key: "week", label: "今後7日間", sub: "明日〜1週間以内" },
  { key: "later", label: "8日以降", sub: "" },
  { key: "none", label: "次回対応が未設定", sub: "進行中なのに次の一手が決まっていない商談" },
];

export default function FollowUps() {
  const loading = useLoad();
  const deals = useStore((s) => s.deals);
  const customers = useStore((s) => s.customers);
  const [scope, setScope] = useState<"me" | "all">("me");
  const [logFor, setLogFor] = useState<{ d: Deal; na: NextAction | null } | null>(null);
  const [editFor, setEditFor] = useState<{ d: Deal; na: NextAction | null } | null>(null);
  const removeNextAction = useStore((s) => s.removeNextAction);

  // 1つの見込案件に次回対応が複数あれば、1件ずつ並べる
  type Entry = { d: Deal; na: NextAction | null };
  const grouped = useMemo(() => {
    const g: Record<Bucket, Entry[]> = { overdue: [], today: [], week: [], later: [], none: [] };
    deals
      .filter((d) => OPEN_STAGES.includes(d.stage) && (scope === "all" || d.repId === ME_ID))
      .forEach((d) => {
        const list = actionsOf(d);
        if (list.length === 0) return g.none.push({ d, na: null });
        list.forEach((na) => {
          const n = daysFromToday(na.date);
          g[n < 0 ? "overdue" : n === 0 ? "today" : n <= 7 ? "week" : "later"].push({ d, na });
        });
      });
    (Object.keys(g) as Bucket[]).forEach((k) => g[k].sort((a, b) => (a.na?.date ?? "").localeCompare(b.na?.date ?? "")));
    return g;
  }, [deals, scope]);

  const cust = (id: string) => customers.find((c) => c.id === id);
  const total = Object.values(grouped).reduce((s, a) => s + a.length, 0);

  return (
    <>
      <PageHeader
        eyebrow="Follow-ups"
        title="やること一覧"
        description="クライアントへの次回対応(電話・訪問など)を、期限の近い順に並べています。"
        guide={[
          "「期限超過」(赤字)の項目から順に対応してください。",
          "対応したら「対応を記録」を押し、話した内容を書きます。",
          "記録の画面で、次の予定日と内容も一緒に決められます。",
          "「Googleカレンダーに追加」で、次の対応を自分のカレンダーに入れられます(本番では自動で反映する形も選べます)。",
        ]}
        actions={
          <Segmented
            value={scope}
            onChange={setScope}
            items={[
              { value: "me", label: "自分の担当" },
              { value: "all", label: "全担当" },
            ]}
          />
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["overdue", "today", "week", "none"] as Bucket[]).map((k) => {
          const b = BUCKETS.find((x) => x.key === k)!;
          return (
            <Card key={k} className="px-5 py-4">
              <div className="text-[13px] text-ink-500">{b.label}</div>
              <div className="mt-1.5 flex items-baseline gap-1">
                {loading ? (
                  <Skeleton className="h-7 w-10" />
                ) : (
                  <span className={"tnum text-[28px] font-semibold " + (k === "overdue" && grouped[k].length ? "text-bad-600" : "text-navy-900")}>
                    {grouped[k].length}
                  </span>
                )}
                <span className="text-[13px] text-ink-500">件</span>
              </div>
            </Card>
          );
        })}
      </div>

      {loading ? (
        <Card>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-ink-100 px-5 py-4 last:border-0">
              <Skeleton className="h-10 w-16" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </Card>
      ) : total === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarCheck2 size={20} />}
            title="進行中の商談がありません"
            description="商談を登録すると、次回対応がここに表示されます。"
            action={
              <Link to="/deals">
                <Button>商談一覧へ</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="space-y-7">
          {BUCKETS.map((b) =>
            grouped[b.key].length === 0 ? null : (
              <section key={b.key}>
                <div className="mb-2.5 flex items-baseline gap-3">
                  <h2 className={"text-[16px] font-semibold " + (b.key === "overdue" ? "text-bad-600" : "text-navy-900")}>
                    {b.label}
                  </h2>
                  <span className="tnum text-[13px] text-ink-400">{grouped[b.key].length}件</span>
                  {b.sub && <span className="hidden text-[13px] text-ink-400 sm:inline">{b.sub}</span>}
                </div>
                <Card className="overflow-hidden">
                  <AnimatePresence initial={false}>
                    {grouped[b.key].map(({ d, na }) => {
                      const c = cust(d.customerId);
                      return (
                        <motion.div
                          key={d.id + (na?.id ?? "")}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex flex-col gap-3 border-b border-ink-100 px-5 py-4 last:border-0 sm:flex-row sm:items-center"
                        >
                          <div className="w-full shrink-0 sm:w-28">
                            {na ? (
                              <>
                                <div className="tnum text-[15px] font-semibold text-navy-900">{fmtDateJa(na.date)}</div>
                                <div
                                  className={
                                    "mt-0.5 text-[12.5px] " +
                                    (daysFromToday(na.date) < 0 ? "font-medium text-bad-600" : "text-ink-500")
                                  }
                                >
                                  {relDay(na.date)}
                                </div>
                              </>
                            ) : (
                              <Pill tone="warn">未設定</Pill>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[15px] font-medium text-ink-900">
                              {na?.content ?? "次回対応を設定してください"}
                              {actionsOf(d).length > 1 && <span className="ml-2 text-[12px] font-normal text-ink-400">(この案件の次回対応 {actionsOf(d).length}件)</span>}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-500">
                              <Link to={`/deals/${d.id}`} className="font-medium text-navy-700 underline-offset-2 hover:underline">
                                {c?.company} / {d.title}
                              </Link>
                              <StagePill stage={d.stage} />
                              <span className="tnum">{d.monthlyBudget === null ? "金額未入力" : `${man(d.monthlyBudget)}/月`}</span>
                              {scope === "all" && <span>担当: {staffName(d.repId)}</span>}
                              {c && (
                                <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 hover:text-navy-900">
                                  <Phone size={11} />
                                  <span className="tnum">{c.phone}</span>
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-wrap gap-2">
                            {na && (
                              <a href={gcalUrl(`${c?.company ?? ""} ${na.content}`, na.date, `見込案件: ${d.title}`)} target="_blank" rel="noreferrer">
                                <Button variant="ghost" size="sm">
                                  <CalendarPlus size={13} />
                                  Googleカレンダーに追加
                                </Button>
                              </a>
                            )}
                            <Button variant="outline" size="sm" onClick={() => setEditFor({ d, na })}>
                              <CalendarClock size={13} />
                              {na ? "日程変更" : "設定"}
                            </Button>
                            {na && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-bad-600"
                                onClick={() => {
                                  removeNextAction(d.id, na.id!);
                                  toast.success("次回対応を削除しました");
                                }}
                              >
                                削除
                              </Button>
                            )}
                            <Button size="sm" onClick={() => setLogFor({ d, na })}>
                              <PencilLine size={13} />
                              対応を記録
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </Card>
              </section>
            ),
          )}
        </div>
      )}

      <ActivityModal
        open={!!logFor}
        onClose={() => setLogFor(null)}
        customerId={logFor?.d.customerId ?? ""}
        dealId={logFor?.d.id}
        doneActionId={logFor?.na?.id}
        title={logFor ? `${cust(logFor.d.customerId)?.company} / ${logFor.d.title}` : ""}
      />
      <NextActionModal open={!!editFor} onClose={() => setEditFor(null)} deal={editFor?.d} action={editFor?.na ?? null} />
    </>
  );
}
