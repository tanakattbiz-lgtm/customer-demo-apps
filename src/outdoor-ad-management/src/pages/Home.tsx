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
  Handshake,
  LayoutGrid,
  PencilLine,
  Undo2,
} from "lucide-react";
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
  const [logFor, setLogFor] = useState<Deal | null>(null);
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
  const allRejected = handovers.filter((h) => h.status === "差し戻し");

  const TILES = [
    { to: "/follow-ups", icon: CalendarClock, title: "やることを確認する", desc: "お客様への次回対応を、期限の近い順に確認します" },
    { to: "/customers?new=1", icon: Building2, title: "新しいお客様を登録する", desc: "名刺や問い合わせの内容を入力します" },
    { to: "/deals?new=1", icon: Handshake, title: "商談を登録する", desc: "お客様との商談を始めるときに使います" },
    { to: "/boards", icon: LayoutGrid, title: "看板の空きを探す", desc: "エリアと期間を選ぶと、空いている面が出てきます" },
    {
      to: "/handover?tab=rejected",
      icon: Undo2,
      title: "差し戻された書類を直す",
      desc: "管理部から修正を頼まれた契約書類を確認します",
      badge: allRejected.length,
    },
    { to: "/dashboard", icon: BarChart3, title: "会社全体の数字を見る", desc: "新規契約・解約・稼働率などの集計です" },
  ];

  return (
    <>
      <div className="mb-8">
        <div className="tnum text-[15px] text-ink-500">{format(new Date(), "yyyy年M月d日(E)", { locale: ja })}</div>
        <h1 className="mt-1 font-serif text-[28px] font-semibold tracking-wide text-navy-900">
          {greet}、{me.name.split(" ")[0]}さん
        </h1>
        <p className="mt-1.5 text-[15px] text-ink-600">下のボタンから、やりたいことを選んでください。</p>
      </div>

      {/* お知らせ */}
      {(todo.length > 0 || myHoldsSoon.length > 0 || myRejected.length > 0) && (
        <Card className="mb-8 overflow-hidden">
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
                  <Button onClick={() => setLogFor(d)}>
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
