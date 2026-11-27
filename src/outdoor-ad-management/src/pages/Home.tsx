import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  Handshake,
  PencilLine,
  TrendingUp,
} from "lucide-react";
import { DEFAULT_PLAN, installOverdue, pendingCancel, phaseOf, signedYen, threeMonths } from "../lib/report";
import { useStore } from "../store";
import { ME_ID, OPEN_STAGES, STAFF, type Deal } from "../data/seed";
import { faceLookup, holdActive } from "../lib/domain";
import { daysFromToday, fmtDate, fmtDateJa, relDay } from "../lib/format";
import { ActivityModal } from "../components/forms";
import { Button, Card, Pill } from "../components/ui";

export default function Home() {
  const nav = useNavigate();
  const deals = useStore((s) => s.deals);
  const customers = useStore((s) => s.customers);
  const holds = useStore((s) => s.holds);
  const boards = useStore((s) => s.boards);
  const contracts = useStore((s) => s.contracts);
  const handovers = useStore((s) => s.handovers);
  const orders = useStore((s) => s.orders);
  const [logFor, setLogFor] = useState<Deal | null>(null);
  const myCols = useMemo(() => threeMonths(orders, deals, { kind: "rep", id: ME_ID }, DEFAULT_PLAN), [orders, deals]);
  const myOrders = orders.filter((o) => o.repId === ME_ID);
  const overdueInstall = myOrders.filter((o) => installOverdue(o));
  const cancelSoon = myOrders.filter((o) => {
    const c = phaseOf(o) === "設置済" ? pendingCancel(o) : undefined;
    return c && c.plannedDate && daysFromToday(c.plannedDate) <= 14;
  });
  const waiting = myOrders.filter((o) => !o.kikakuNo);
  const me = STAFF.find((s) => s.id === ME_ID)!;
  const hour = new Date().getHours();
  const greet = hour < 11 ? "おはようございます" : hour < 18 ? "こんにちは" : "お疲れさまです";
  const cname = (id: string) => customers.find((c) => c.id === id)?.company ?? "";
  const lookup = useMemo(() => faceLookup(boards), [boards]);

  const todo = useMemo(
    () =>
      deals
        .filter((d) => d.repId === ME_ID && OPEN_STAGES.includes(d.stage) && d.nextAction && daysFromToday(d.nextAction.date) <= 0)
        .sort((a, b) => a.nextAction!.date.localeCompare(b.nextAction!.date)),
    [deals],
  );
  const myHoldsSoon = holds.filter((h) => h.repId === ME_ID && holdActive(h) && daysFromToday(h.expiresAt) <= 3);
  const myRejected = handovers.filter((h) => {
    const c = contracts.find((k) => k.id === h.contractId);
    return h.status === "差し戻し" && c?.repId === ME_ID;
  });
  const TILES = [
    { to: "/follow-ups", icon: CalendarClock, title: "やることを確認する", desc: "クライアントへの次回対応を、期限の近い順に確認します" },
    { to: "/deals?new=1", icon: Handshake, title: "見込案件を登録する", desc: "新しい案件を始めるときに使います。分からない項目は空欄で構いません" },
    { to: "/customers?new=1", icon: Building2, title: "新しいクライアントを登録する", desc: "名刺や問い合わせの内容を入力します" },
    { to: "/orders", icon: ClipboardList, title: "契約締結・設置・解約を見る", desc: "契約締結した案件の設置予定や、解約の予定を確認します", badge: waiting.length },
    { to: "/report", icon: TrendingUp, title: "営業報告を見る", desc: "今月・来月・再来月の予定と実績が、自動で集計されています" },
    { to: "/dashboard", icon: BarChart3, title: "経営ダッシュボード", desc: "部長・社長向けの、エリア別の新規・純増の一覧です" },
  ];
  const c0 = myCols[0];
  const net = (v: number | null) => (
    <span className={"tnum font-serif text-[24px] font-semibold " + ((v ?? 0) > 0 ? "text-ok-700" : (v ?? 0) < 0 ? "text-bad-700" : "text-navy-900")}>{v === null ? "—" : signedYen(v)}</span>
  );

  return (
    <>
      <div className="mb-8">
        <div className="tnum text-[15px] text-ink-500">{format(new Date(), "yyyy年M月d日(E)", { locale: ja })}</div>
        <h1 className="mt-1 font-serif text-[28px] font-semibold tracking-wide text-navy-900">
          {greet}、{me.name.split(" ")[0]}さん
        </h1>
        <p className="mt-1.5 text-[15px] text-ink-600">下のボタンから、やりたいことを選んでください。</p>
      </div>

      {/* 今月の自分の数字(営業報告から) */}
      <Link
        to="/report"
        data-tour="home-numbers"
        className="mb-8 grid gap-px overflow-hidden rounded-lg border border-ink-200 bg-ink-200 transition hover:border-navy-300 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="bg-white px-5 py-4">
          <div className="text-[13px] text-ink-600">今月の契約締結(広告料/月)</div>
          <div className="tnum mt-1 font-serif text-[24px] font-semibold text-navy-900">¥{(c0.orderActual.amount ?? 0).toLocaleString()}</div>
          <div className="tnum text-[12.5px] text-ink-500">
            {c0.orderActual.count}件 ・ 契約締結予定 ¥{(c0.orderPlan.amount ?? 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white px-5 py-4">
          <div className="text-[13px] text-ink-600">今月の設置 実績</div>
          <div className="tnum mt-1 font-serif text-[24px] font-semibold text-navy-900">¥{(c0.installActual.amount ?? 0).toLocaleString()}</div>
          <div className="tnum text-[12.5px] text-ink-500">
            {c0.installActual.count}件 ・ 予定 ¥{(c0.installPlan.amount ?? 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white px-5 py-4">
          <div className="text-[13px] text-ink-600">今月の解約 実績</div>
          <div className="tnum mt-1 font-serif text-[24px] font-semibold text-bad-700">{(c0.cancelActual.amount ?? 0) > 0 ? "−" : ""}¥{(c0.cancelActual.amount ?? 0).toLocaleString()}</div>
          <div className="tnum text-[12.5px] text-ink-500">
            {c0.cancelActual.count}件 ・ 予定 {(c0.cancelPlan.amount ?? 0) > 0 ? "−" : ""}¥{(c0.cancelPlan.amount ?? 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white px-5 py-4">
          <div className="flex items-center justify-between text-[13px] text-ink-600">
            今月の純増減 実績
            <span className="inline-flex items-center gap-0.5 text-navy-700">
              営業報告へ <ChevronRight size={14} />
            </span>
          </div>
          <div className="mt-1">{net(c0.netActual)}</div>
          <div className="tnum text-[12.5px] text-ink-500">月末までの見通し {signedYen(c0.netPlan)}</div>
        </div>
      </Link>

      {/* お知らせ */}
      {(todo.length > 0 || myHoldsSoon.length > 0 || myRejected.length > 0 || overdueInstall.length > 0 || cancelSoon.length > 0 || waiting.length > 0) && (
        <Card data-tour="home-todo" className="mb-8 overflow-hidden">
          <div className="border-b border-ink-200 px-6 py-4">
            <div className="text-[17px] font-semibold text-navy-900">今日、対応が必要なこと</div>
          </div>
          <div className="divide-y divide-ink-100">
            {todo.slice(0, 4).map((d) => {
              const late = daysFromToday(d.nextAction!.date) < 0;
              return (
                <div key={d.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center">
                  <div className="w-36 shrink-0">
                    <Pill tone={late ? "bad" : "navy"}>{late ? `期限を${relDay(d.nextAction!.date)}` : "今日の予定"}</Pill>
                    <div className="tnum mt-1 text-[14px] text-ink-500">{fmtDateJa(d.nextAction!.date)}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[16px] font-medium text-ink-900">{d.nextAction!.content}</div>
                    <Link to={`/deals/${d.id}`} className="text-[14px] text-navy-700 underline-offset-2 hover:underline">
                      {cname(d.customerId)} / {d.title}
                    </Link>
                  </div>
                  <Button data-tour="home-log" onClick={() => setLogFor(d)}>
                    <PencilLine size={15} />
                    対応したら記録する
                  </Button>
                </div>
              );
            })}
            {todo.length > 4 && (
              <Link to="/follow-ups" className="flex items-center justify-center gap-1 px-6 py-3.5 text-[15px] font-medium text-navy-700 hover:bg-ink-50">
                ほか {todo.length - 4} 件をすべて見る
                <ChevronRight size={16} />
              </Link>
            )}
            {overdueInstall.slice(0, 2).map((o) => (
              <div key={o.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center">
                <div className="w-36 shrink-0">
                  <Pill tone="bad">設置予定日超過</Pill>
                  <div className="tnum mt-1 text-[14px] text-ink-500">予定 {fmtDate(o.plannedInstallDate!)}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[16px] font-medium text-ink-900">設置予定日を過ぎていますが、施工完了がまだ反映されていません</div>
                  <div className="text-[14px] text-ink-500">
                    {cname(o.customerId)} / {o.boardName}
                  </div>
                </div>
                <Button variant="outline" onClick={() => nav(`/orders/${o.id}`)}>
                  案件を開く
                </Button>
              </div>
            ))}
            {cancelSoon.map((o) => {
              const c = pendingCancel(o)!;
              return (
                <div key={o.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center">
                  <div className="w-36 shrink-0">
                    <Pill tone="warn">{c.partial ? "一部解約予定" : "解約予定"}</Pill>
                    <div className="tnum mt-1 text-[14px] text-ink-500">{fmtDate(c.plannedDate!)}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[16px] font-medium text-ink-900">
                      解約の予定日が近づいています(広告料 −¥{c.fee.toLocaleString()}/月)
                    </div>
                    <div className="text-[14px] text-ink-500">
                      {cname(o.customerId)} / {o.boardName} ・ WF {c.wfNo ?? "未提出"}
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => nav(`/orders/${o.id}`)}>
                    案件を開く
                  </Button>
                </div>
              );
            })}
            {waiting.length > 0 && (
              <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center">
                <div className="w-36 shrink-0">
                  <Pill tone="warn">登録待ち</Pill>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[16px] font-medium text-ink-900">工事指示システムへの企画の登録が終わっていない契約締結が {waiting.length}件あります</div>
                  <div className="text-[14px] text-ink-500">工事指示システムにつながった時点で自動で登録し直し、企画番号が入ります。操作は要りません</div>
                </div>
                <Button variant="outline" onClick={() => nav("/orders?tab=waiting")}>
                  一覧を見る
                </Button>
              </div>
            )}
            {myHoldsSoon.map((h) => {
              const l = lookup.get(h.faceId);
              const deal = deals.find((d) => d.id === h.dealId);
              return (
                <div key={h.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center">
                  <div className="w-36 shrink-0">
                    <Pill tone="warn">仮押さえ期限</Pill>
                    <div className="tnum mt-1 text-[14px] text-ink-500">{fmtDate(h.expiresAt)}まで</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[16px] font-medium text-ink-900">
                      {l?.board.name} {l?.face.label} の仮押さえが、まもなく期限切れになります
                    </div>
                    <div className="text-[14px] text-ink-500">{deal && `${cname(deal.customerId)} / ${deal.title}`}</div>
                  </div>
                  {deal && (
                    <Button variant="outline" onClick={() => nav(`/deals/${deal.id}`)}>
                      商談を開く
                    </Button>
                  )}
                </div>
              );
            })}
            {myRejected.map((h) => {
              const c = contracts.find((k) => k.id === h.contractId);
              return (
                <div key={h.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center">
                  <div className="w-36 shrink-0">
                    <Pill tone="bad">差し戻し</Pill>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[16px] font-medium text-ink-900">管理部から書類の修正を頼まれています</div>
                    <div className="text-[14px] text-ink-500">
                      {c && cname(c.customerId)} ・ {h.issues.join("、")}
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => nav(`/handover?id=${h.id}`)}>
                    内容を確認する
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <h2 className="mb-3 text-[17px] font-semibold text-navy-900">やりたいことを選んでください</h2>
      <div data-tour="home-tiles" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="group relative flex items-start gap-4 rounded-lg border border-ink-200 bg-white p-5 transition duration-200 hover:-translate-y-px hover:border-navy-300 hover:shadow-[0_8px_24px_-12px_oklch(25%_0.04_262/0.3)] focus-visible:ring-2 focus-visible:ring-navy-400/40 focus-visible:outline-none"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-navy-900 text-white">
              <t.icon size={22} strokeWidth={1.7} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-[17px] font-semibold text-navy-900">
                {t.title}
                {!!t.badge && <span className="tnum rounded bg-bad-600 px-1.5 py-px text-[12px] font-semibold text-white">{t.badge}</span>}
              </span>
              <span className="mt-1 block text-[14px] leading-relaxed text-ink-500">{t.desc}</span>
            </span>
            <ArrowRight size={18} className="mt-1 shrink-0 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-navy-700" />
          </Link>
        ))}
      </div>

      <ActivityModal
        open={!!logFor}
        onClose={() => setLogFor(null)}
        customerId={logFor?.customerId ?? ""}
        dealId={logFor?.id}
        title={logFor ? `${cname(logFor.customerId)} / ${logFor.title}` : ""}
      />
    </>
  );
}
