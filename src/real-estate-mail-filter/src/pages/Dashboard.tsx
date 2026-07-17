import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, isSameDay, subDays } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Check, Inbox, Tag } from "lucide-react";
import { motion } from "motion/react";
import { useStore } from "../store";
import { useRows, type Row } from "../lib/rows";
import { lineMessage } from "../lib/rules";
import { useLoad } from "../lib/useLoad";
import { Badge, Card, EmptyState, SectionTitle, Skeleton, Stat } from "../components/ui";
import { MailDrawer } from "../components/MailDrawer";
import { LinePreview } from "../components/LinePreview";

export function Dashboard() {
  const loading = useLoad(550);
  const { conditions, reviewed, toggleReviewed } = useStore();
  const rows = useRows(conditions);
  const [selected, setSelected] = useState<Row | null>(null);

  const matched = useMemo(() => rows.filter((r) => r.j.action === "label"), [rows]);
  const archived = useMemo(() => rows.filter((r) => r.j.action === "archive"), [rows]);
  const property = useMemo(() => rows.filter((r) => r.j.isProperty), [rows]);
  const unreviewed = matched.filter((r) => !reviewed[r.mail.id]);

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    return days.map((d) => {
      const of = rows.filter((r) => isSameDay(r.at, d));
      return {
        day: format(d, "M/d"),
        要確認: of.filter((r) => r.j.action === "label").length,
        アーカイブ: of.filter((r) => r.j.action === "archive").length,
        対象外: of.filter((r) => !r.j.isProperty).length,
      };
    });
  }, [rows]);

  const digest = [...matched].sort((a, b) => {
    const ra = reviewed[a.mail.id] ? 1 : 0;
    const rb = reviewed[b.mail.id] ? 1 : 0;
    if (ra !== rb) return ra - rb;
    return b.at.getTime() - a.at.getTime();
  });

  return (
    <>
      <header className="mb-6">
        <h1 className="text-lg font-bold text-ink-900">ダッシュボード</h1>
        <p className="mt-1 text-xs text-ink-500">
          直近7日間の受信メール {rows.length} 件を、現在の条件(
          {conditions.prefs.join("・") || "未設定"} / {conditions.structures.join("・") || "未設定"} / 築
          {conditions.maxAge}年以内)で自動仕分けした結果です。
        </p>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[92px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="受信メール" value={rows.length} unit="件" hint="直近7日間" />
          <Stat
            label="物件情報メール"
            value={property.length}
            unit="件"
            hint={`通常業務メール ${rows.length - property.length} 件は対象外`}
          />
          <Stat
            label="要確認(条件合致)"
            value={matched.length}
            unit="件"
            tone="warn"
            hint={`うち未確認 ${unreviewed.length} 件`}
          />
          <Stat
            label="自動アーカイブ"
            value={archived.length}
            unit="件"
            tone="ok"
            hint="条件外の物件メール"
          />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* 要確認ダイジェスト */}
        <Card className="min-w-0 lg:col-span-2">
          <SectionTitle
            title="要確認物件ダイジェスト"
            desc={`Gmailで「${conditions.labelName}」ラベルが付いた物件`}
            right={
              <Link
                to="/logs"
                className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[12px] font-medium text-brand-600 transition-colors duration-150 hover:text-brand-700"
              >
                判定ログを見る
                <ArrowRight size={13} />
              </Link>
            }
          />
          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : digest.length === 0 ? (
            <EmptyState
              icon={<Inbox size={20} />}
              title="条件に合致する物件はありません"
              desc="現在の条件では要確認の物件が0件です。条件設定シートで所在地・構造・築年数を見直すと、対象が変わります。"
              action={
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-[13px] font-medium text-white transition-colors duration-150 hover:bg-brand-700"
                >
                  条件設定シートを開く
                  <ArrowRight size={13} />
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-ink-200">
              {digest.slice(0, 6).map((r, i) => {
                const ex = r.mail.extracted!;
                const done = !!reviewed[r.mail.id];
                return (
                  <motion.li
                    key={r.mail.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.15) }}
                  >
                    <button
                      onClick={() => setSelected(r)}
                      className="flex w-full items-start gap-3 px-6 py-4 text-left transition-colors duration-150 hover:bg-ink-50"
                    >
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                          done
                            ? "bg-ok-50 text-ok-600"
                            : "bg-warn-50 text-warn-700"
                        }`}
                      >
                        {done ? <Check size={14} /> : <Tag size={13} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-[13px] font-bold text-ink-900">
                            {ex.pref}
                            {ex.city}
                          </span>
                          {done && <Badge tone="ok">確認済み</Badge>}
                        </span>
                        <span className="tnum mt-1 block text-[12px] text-ink-600">
                          {ex.structure} / 築{r.j.age}年 /{" "}
                          {ex.price.toLocaleString()}万円 / 利回り{ex.yieldPct.toFixed(2)}%
                        </span>
                        <span className="mt-1 block truncate text-[11px] text-ink-400">
                          {r.mail.from}・{format(r.at, "M月d日 HH:mm", { locale: ja })}
                        </span>
                      </span>
                      {ex.source === "添付PDF" && (
                        <Badge tone="brand">PDF読取</Badge>
                      )}
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          {/* 直近7日 */}
          <Card>
            <SectionTitle title="日別の処理内訳" desc="直近7日間" />
            <div className="px-3 py-4">
              {loading ? (
                <Skeleton className="h-[180px] rounded-lg" />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData} barCategoryGap="28%">
                    <CartesianGrid
                      strokeDasharray="2 4"
                      vertical={false}
                      stroke="var(--color-ink-200)"
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 10, fill: "var(--color-ink-500)" }}
                      axisLine={{ stroke: "var(--color-ink-200)" }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      width={22}
                      tick={{ fontSize: 10, fill: "var(--color-ink-500)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        border: "1px solid var(--color-ink-200)",
                      }}
                    />
                    <Bar
                      dataKey="要確認"
                      stackId="a"
                      fill="var(--color-warn-500)"
                      animationDuration={500}
                    />
                    <Bar
                      dataKey="アーカイブ"
                      stackId="a"
                      fill="var(--color-brand-300)"
                      animationDuration={500}
                    />
                    <Bar
                      dataKey="対象外"
                      stackId="a"
                      fill="var(--color-ink-300)"
                      radius={[3, 3, 0, 0]}
                      animationDuration={500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* 最新のLINE通知 */}
          <Card>
            <SectionTitle
              title="最新のLINE通知"
              desc={conditions.notifyLine ? "条件合致時に自動送信" : "通知は現在オフ"}
            />
            <div className="p-4">
              {loading ? (
                <Skeleton className="h-[150px] rounded-xl" />
              ) : matched.length === 0 ? (
                <p className="px-2 py-6 text-center text-[12px] text-ink-500">
                  条件に合致する物件がないため、通知はありません。
                </p>
              ) : (
                <LinePreview
                  message={lineMessage(matched[0].mail, conditions)}
                  at={matched[0].at}
                  compact
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      <MailDrawer
        row={selected}
        cond={conditions}
        reviewed={selected ? !!reviewed[selected.mail.id] : false}
        onToggleReviewed={toggleReviewed}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
