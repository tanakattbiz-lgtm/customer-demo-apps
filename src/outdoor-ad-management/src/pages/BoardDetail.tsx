import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Landmark, LayoutGrid, Lightbulb, User } from "lucide-react";
import { useStore, staffName } from "../store";
import type { Face } from "../data/seed";
import { useLoad } from "../lib/useLoad";
import { buildIndex, cellAt, contractState, handoverOf } from "../lib/domain";
import { addMonthKey, daysFromToday, fmtDate, fmtMonth, monthRange, num, thisMonth, yen } from "../lib/format";
import { HoldModal } from "../components/forms";
import { Button, Card, CardHeader, DL, EmptyState, PageHeader, Pill, Skeleton, tableHeadCls, thCls } from "../components/ui";
import { ContractPill, HandoverPill } from "../components/pills";

export default function BoardDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const loading = useLoad(400);
  const board = useStore((s) => s.boards.find((b) => b.id === id));
  const lands = useStore((s) => s.lands);
  const contracts = useStore((s) => s.contracts);
  const holds = useStore((s) => s.holds);
  const customers = useStore((s) => s.customers);
  const handovers = useStore((s) => s.handovers);
  const idx = useMemo(() => buildIndex(contracts, holds), [contracts, holds]);
  const [holdFace, setHoldFace] = useState<{ face: Face; month: string } | null>(null);
  const cur = thisMonth();
  const months = monthRange(cur, 12);
  const cname = (cid: string) => customers.find((c) => c.id === cid)?.company ?? "";

  if (!board) {
    return (
      <Card>
        <EmptyState
          icon={<LayoutGrid size={20} />}
          title="看板が見つかりません"
          action={
            <Link to="/boards">
              <Button>空き状況へ戻る</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  const land = lands.find((l) => l.boardId === board.id && !l.terminated) ?? lands.find((l) => l.boardId === board.id);
  const faceIds = board.faces.map((f) => f.id);
  const history = contracts
    .filter((c) => c.faceIds.some((f) => faceIds.includes(f)))
    .sort((a, b) => b.startMonth.localeCompare(a.startMonth));
  const planned = board.installMonth > cur;

  return (
    <>
      <Link to="/boards" className="mb-4 inline-flex items-center gap-1.5 text-[14px] text-ink-500 transition hover:text-navy-900">
        <ArrowLeft size={14} />
        空き状況・仮押さえ
      </Link>
      <PageHeader
        eyebrow={board.code}
        title={board.name}
        description={`${board.code} ・ ${board.address}`}
        actions={planned ? <Pill tone="warn">設置予定 {fmtMonth(board.installMonth)}〜販売開始</Pill> : undefined}
      />

      {/* 関連図: 土地契約 → 看板 → 広告面 → 広告契約 */}
      <Card className="mb-6 p-5">
        <div className="mb-4 text-[15px] font-semibold text-navy-900">契約の関連</div>
        <div className="grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1.5fr]">
          {/* 土地 */}
          <div className="rounded-md border border-ink-200 p-4">
            <div className="flex items-center gap-2 text-[12px] tracking-[0.15em] text-ink-400">
              <Landmark size={13} />
              土地契約
            </div>
            {land ? (
              <>
                <div className="mt-2 text-[16px] font-semibold text-navy-900">{land.ownerName}</div>
                <div className="text-[12.5px] text-ink-500">地権者({land.ownerKind})</div>
                <div className="mt-3 space-y-1 text-[13px] text-ink-700">
                  <div className="tnum">{land.no}</div>
                  <div className="tnum">
                    賃料 {yen(land.rent)}/月
                  </div>
                  <div className="tnum">
                    {fmtDate(land.startDate)} 〜 {fmtDate(land.endDate)}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {land.terminated ? (
                    <Pill tone="gray">解約済</Pill>
                  ) : daysFromToday(land.endDate) <= 90 ? (
                    <Pill tone="warn">更新期限まで{daysFromToday(land.endDate)}日</Pill>
                  ) : (
                    <Pill tone="ok">契約中</Pill>
                  )}
                  {land.autoRenew && <Pill tone="gray">自動更新</Pill>}
                </div>
                <Link to={`/contracts?tab=land&id=${land.id}`} className="mt-3 inline-block text-[13px] text-navy-700 hover:underline">
                  土地契約の詳細
                </Link>
              </>
            ) : (
              <div className="mt-2 text-[14px] text-ink-500">土地契約が登録されていません</div>
            )}
          </div>
          <Connector />
          {/* 看板 */}
          <div className="rounded-md border border-navy-200 bg-navy-50/50 p-4">
            <div className="flex items-center gap-2 text-[12px] tracking-[0.15em] text-ink-400">
              <LayoutGrid size={13} />
              看板
            </div>
            <BoardIllustration faces={board.faces.length} />
            <DL
              items={[
                ["種別", board.type],
                ["サイズ", board.size],
                ["照明", board.lighting ? <span className="inline-flex items-center gap-1"><Lightbulb size={12} />あり</span> : "なし"],
                ["交通量", <span className="tnum">{num(board.traffic)} /日</span>],
              ]}
            />
          </div>
          <Connector />
          {/* 広告面 → 広告契約 */}
          <div className="space-y-2">
            {board.faces.map((f) => {
              const now = cellAt(idx, board, f, cur);
              const next = (idx.contracts.get(f.id) ?? []).filter((c) => c.startMonth > cur).sort((a, b) => a.startMonth.localeCompare(b.startMonth))[0];
              return (
                <div key={f.id} className="rounded-md border border-ink-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[15px] font-semibold text-navy-900">
                      {f.label} <span className="text-[12.5px] font-normal text-ink-500">{f.direction}</span>
                    </div>
                    <span className="tnum text-[12.5px] text-ink-500">定価 {yen(f.price)}/月</span>
                  </div>
                  <div className="mt-2.5 space-y-1.5 text-[13px]">
                    <div className="flex items-center gap-2">
                      <span className="w-10 shrink-0 text-ink-400">現在</span>
                      {now.kind === "contract" ? (
                        <Link to={`/contracts?id=${now.contract.id}`} className="min-w-0 truncate text-ink-900 hover:underline">
                          {cname(now.contract.customerId)}
                          <span className="tnum ml-1.5 text-ink-500">〜{fmtMonth(now.contract.cancelMonth ?? now.contract.endMonth)}</span>
                        </Link>
                      ) : now.kind === "hold" ? (
                        <span className="text-warn-700">仮押さえ中</span>
                      ) : now.kind === "pre" ? (
                        <span className="text-ink-500">設置前</span>
                      ) : (
                        <span className="font-medium text-navy-700">空き</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-10 shrink-0 text-ink-400">次回</span>
                      {next ? (
                        <Link to={`/contracts?id=${next.id}`} className="min-w-0 truncate text-ink-900 hover:underline">
                          {cname(next.customerId)}
                          <span className="tnum ml-1.5 text-ink-500">{fmtMonth(next.startMonth)}〜</span>
                        </Link>
                      ) : (
                        <span className="text-ink-400">予定なし</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* 12ヶ月の掲載スケジュール */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader title="今後12ヶ月の掲載スケジュール" sub="空き枠をクリックすると仮押さえできます" />
        {loading ? (
          <div className="space-y-2 p-5">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </div>
        ) : (
          <div className="thin-scroll overflow-x-auto">
            <div className="grid min-w-[860px]" style={{ gridTemplateColumns: `120px repeat(12, minmax(56px,1fr))` }}>
              <div className="border-b border-ink-200 bg-ink-50" />
              {months.map((m) => (
                <div key={m} className="border-b border-l border-ink-200 bg-ink-50 py-2 text-center text-[12px] text-ink-500">
                  {m.slice(2, 4)}/{Number(m.slice(5))}月
                </div>
              ))}
              {board.faces.map((f) => (
                <div key={f.id} className="contents">
                  <div className="border-b border-ink-100 px-4 py-2 text-[14px] font-medium text-navy-900">{f.label}</div>
                  {months.map((m) => {
                    const c = cellAt(idx, board, f, m);
                    const pending = c.kind === "contract" && (handoverOf(handovers, c.contract.id)?.status ?? "受領済") !== "受領済";
                    return (
                      <div key={m} className="border-b border-l border-ink-100 p-[3px]">
                        {c.kind === "free" ? (
                          <button
                            onClick={() => setHoldFace({ face: f, month: m })}
                            className="h-7 w-full rounded-[4px] border border-dashed border-ink-200 text-[12px] text-ink-400 transition hover:border-navy-400 hover:text-navy-700"
                          >
                            空き
                          </button>
                        ) : c.kind === "hold" ? (
                          <div className="hatch-hold h-7 rounded-[4px] border border-warn-300" title="仮押さえ中" />
                        ) : c.kind === "pre" ? (
                          <div className="hatch-pre h-7 rounded-[4px] border border-ink-200" title="設置前" />
                        ) : (
                          <button
                            onClick={() => nav(`/contracts?id=${c.contract.id}`)}
                            title={cname(c.contract.customerId)}
                            className={"h-7 w-full rounded-[4px] transition hover:brightness-110 " + (pending ? "bg-navy-400" : "bg-navy-900")}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 広告契約の履歴 */}
      <Card className="overflow-hidden">
        <CardHeader title="この看板の広告契約" sub={`${history.length}件(過去・現在・予定)`} />
        {history.length === 0 ? (
          <EmptyState icon={<User size={20} />} title="広告契約はまだありません" />
        ) : (
          <div className="thin-scroll overflow-x-auto">
            <table className="w-full min-w-[760px] text-[15px]">
              <thead className={tableHeadCls}>
                <tr>
                  <th className={thCls}>契約番号</th>
                  <th className={thCls}>広告主</th>
                  <th className={thCls}>面</th>
                  <th className={thCls}>掲載期間</th>
                  <th className={thCls + " text-right"}>月額</th>
                  <th className={thCls}>状態</th>
                  <th className={thCls}>担当</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 12).map((c) => {
                  const ho = handoverOf(handovers, c.id);
                  return (
                    <tr key={c.id} onClick={() => nav(`/contracts?id=${c.id}`)} className="cursor-pointer border-b border-ink-100 last:border-0 hover:bg-navy-50/50">
                      <td className="tnum px-4 py-2.5 text-ink-600">{c.no}</td>
                      <td className="px-4 py-2.5 font-medium text-navy-900">{cname(c.customerId)}</td>
                      <td className="px-4 py-2.5">{board.faces.filter((f) => c.faceIds.includes(f.id)).map((f) => f.label).join("・")}</td>
                      <td className="tnum px-4 py-2.5 text-ink-600">
                        {fmtMonth(c.startMonth)} 〜 {fmtMonth(c.cancelMonth ?? c.endMonth)}
                      </td>
                      <td className="tnum px-4 py-2.5 text-right">{yen(c.monthlyFee)}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1">
                          <ContractPill state={contractState(c)} />
                          {ho && ho.status !== "受領済" && <HandoverPill status={ho.status} />}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-ink-600">{staffName(c.repId)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <HoldModal
        open={!!holdFace}
        onClose={() => setHoldFace(null)}
        board={board}
        face={holdFace?.face}
        startMonth={holdFace?.month ?? addMonthKey(cur, 1)}
      />
    </>
  );
}

function Connector() {
  return (
    <div className="flex items-center justify-center text-navy-300">
      <ArrowRight size={18} className="hidden lg:block" />
      <ArrowRight size={18} className="rotate-90 lg:hidden" />
    </div>
  );
}

function BoardIllustration({ faces }: { faces: number }) {
  return (
    <svg viewBox="0 0 200 92" className="my-3 h-20 w-full" aria-hidden="true">
      <line x1="0" y1="88" x2="200" y2="88" stroke="currentColor" className="text-ink-300" strokeWidth="1" />
      {faces > 1 ? (
        <>
          <rect x="22" y="10" width="72" height="40" rx="2" className="fill-navy-900" />
          <rect x="106" y="10" width="72" height="40" rx="2" className="fill-navy-700" />
          <text x="58" y="34" textAnchor="middle" className="fill-white text-[12px]">A</text>
          <text x="142" y="34" textAnchor="middle" className="fill-white text-[12px]">B</text>
          <rect x="54" y="50" width="4" height="38" className="fill-ink-400" />
          <rect x="142" y="50" width="4" height="38" className="fill-ink-400" />
        </>
      ) : (
        <>
          <rect x="50" y="10" width="100" height="44" rx="2" className="fill-navy-900" />
          <text x="100" y="36" textAnchor="middle" className="fill-white text-[12px]">A</text>
          <rect x="97" y="54" width="6" height="34" className="fill-ink-400" />
        </>
      )}
    </svg>
  );
}
