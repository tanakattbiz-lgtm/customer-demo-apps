import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  CloudDownload,
  FileCode2,
  Table2,
  Upload,
  Check,
  Loader2,
  Globe,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { useStore } from "../store";
import { useLoad } from "../lib/useLoad";
import { relTime, clockTime, yen, diffLabel } from "../lib/format";
import { fakeApi } from "../lib/fakeApi";
import type { Race } from "../data/seed";
import {
  Card,
  Skeleton,
  Pill,
  Button,
  FrameBadge,
  CardStatusBadge,
  ResultStatusBadge,
} from "../components/ui";

// ---- 処理パイプラインのステップ定義 ----
const STEPS = [
  { key: "fetch-card", label: "番組表・出走表 取得", icon: CloudDownload },
  { key: "gen-card", label: "出走表ページ生成・公開", icon: FileCode2 },
  { key: "fetch-result", label: "確定結果データ 取得", icon: CloudDownload },
  { key: "gen-table", label: "結果テーブル生成(枠番色付け)", icon: Table2 },
  { key: "publish", label: "レースページ 自動公開", icon: Upload },
] as const;

function doneCount(r: Race, live: number): number {
  // 状態から「完了済みステップ数」を算出。live(処理中に手動で進めた段階)も加味。
  let n = 0;
  if (r.entries.length) n = 1; // 出走表データは取得済み
  if (r.cardStatus === "公開済") n = 2;
  if (r.resultStatus === "確定") n = 3;
  if (r.resultStatus === "掲載済") n = 5;
  return Math.max(n, live);
}

function Pipeline({ done, running }: { done: number; running: number }) {
  return (
    <ol className="space-y-0">
      {STEPS.map((s, i) => {
        const isDone = i < done;
        const isRunning = running === i + 1;
        const Icon = s.icon;
        return (
          <li key={s.key} className="flex items-center gap-3 py-2">
            <div
              className={
                "grid h-8 w-8 shrink-0 place-items-center rounded-full transition " +
                (isDone
                  ? "bg-brand-600 text-white"
                  : isRunning
                    ? "bg-brand-100 text-brand-700"
                    : "bg-ink-100 text-ink-400")
              }
            >
              {isDone ? <Check size={16} /> : isRunning ? <Loader2 size={16} className="animate-spin" /> : <Icon size={15} />}
            </div>
            <span
              className={
                "text-sm " + (isDone ? "font-medium text-ink-800" : isRunning ? "font-semibold text-brand-700" : "text-ink-400")
              }
            >
              {s.label}
            </span>
            {isDone && <Check size={14} className="ml-auto text-brand-500" />}
            {isRunning && <span className="ml-auto text-xs font-medium text-brand-600">処理中…</span>}
          </li>
        );
      })}
    </ol>
  );
}

export default function RaceDetail() {
  const loading = useLoad(480);
  const { id } = useParams();
  const navigate = useNavigate();
  const race = useStore((s) => s.races.find((r) => r.id === id));
  const meeting = useStore((s) => s.meetings.find((m) => m.id === race?.meetingId));
  const publishCard = useStore((s) => s.publishCard);
  const publishResult = useStore((s) => s.publishResult);

  const [running, setRunning] = useState(0); // 0=idle, それ以外は処理中のステップ番号

  const done = useMemo(() => (race ? doneCount(race, running) : 0), [race, running]);

  if (!race) {
    return (
      <div className="py-20 text-center">
        <div className="text-ink-500">レースが見つかりませんでした。</div>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
          ダッシュボードへ戻る
        </Button>
      </div>
    );
  }

  const publishPath = `/${race.track}/${new Date().toISOString().slice(0, 10)}/${race.no}R/`;

  // ---- 結果取得〜自動掲載の一連処理(手応えのある段階表示) ----
  const runPublish = async () => {
    setRunning(3);
    await fakeApi(true, 950);
    setRunning(4);
    await fakeApi(true, 850);
    setRunning(5);
    await fakeApi(true, 750);
    publishResult(race.id);
    setRunning(0);
    toast.success(`${race.track} ${race.no}R の結果を掲載しました。`, {
      description: "結果テーブルを生成し、ページを自動公開しました。",
    });
  };

  const runCard = async () => {
    setRunning(2);
    await fakeApi(true, 900);
    publishCard(race.id);
    setRunning(0);
    toast.success(`${race.track} ${race.no}R の出走表を公開しました。`);
  };

  return (
    <div>
      <button
        onClick={() => navigate("/")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition hover:text-ink-800"
      >
        <ArrowLeft size={16} /> ダッシュボード
      </button>

      {/* ---- Race header ---- */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="tnum text-2xl font-bold text-ink-900">{race.no}R</span>
            {race.grade && (
              <span className="rounded bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">{race.grade}</span>
            )}
            <h1 className="text-xl font-bold text-ink-900">{race.name}</h1>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500">
            <span className="font-medium text-ink-700">{race.track}</span>
            {meeting && <span>{meeting.kai}回{meeting.day}日</span>}
            <span>発走 {race.start}</span>
            <span>
              {race.surface}
              {race.distance}m
            </span>
            <span>{race.headcount}頭</span>
            {meeting && <span>{meeting.weather}・馬場{meeting.going}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <ResultStatusBadge status={race.resultStatus} />
          <CardStatusBadge status={race.cardStatus} />
        </div>
      </div>

      {/* ---- Pipeline + action ---- */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <Card className="p-5">
          <div className="text-sm font-semibold text-ink-800">自動処理パイプライン</div>
          <div className="mt-3">
            <Pipeline done={done} running={running} />
          </div>
        </Card>

        <Card className="flex flex-col p-5">
          <div className="text-sm font-semibold text-ink-800">処理アクション</div>

          {race.cardStatus === "未生成" ? (
            <div className="mt-3 flex flex-1 flex-col justify-between gap-4">
              <p className="text-sm leading-relaxed text-ink-500">
                このレースの出走表ページはまだ生成されていません。番組表データから出走表テーブルを生成し、レースページを公開します。
              </p>
              <Button onClick={runCard} loading={running > 0}>
                {running === 0 && <FileCode2 size={16} />} 出走表を生成して公開
              </Button>
            </div>
          ) : race.resultStatus === "掲載済" ? (
            <div className="mt-3 flex flex-1 flex-col justify-between gap-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <Globe size={16} /> 公開済みページ
                </div>
                <code className="tnum mt-2 block truncate rounded-lg bg-white px-3 py-2 text-xs text-ink-600">
                  {publishPath}
                </code>
                {race.resultPublishedAt && (
                  <div className="mt-2 text-xs text-ink-500">
                    掲載日時 {clockTime(race.resultPublishedAt)}({relTime(race.resultPublishedAt)})
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={runPublish} loading={running > 0}>
                {running === 0 && <RotateCcw size={16} />} 結果データを再取得して再掲載
              </Button>
            </div>
          ) : race.resultStatus === "確定" ? (
            <div className="mt-3 flex flex-1 flex-col justify-between gap-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm leading-relaxed text-amber-800">
                レースは<b>確定済み</b>です。確定データ(着順・オッズ・払戻・タイム等)を取得し、結果テーブルを生成してページを自動公開します。
              </div>
              <Button onClick={runPublish} loading={running > 0}>
                {running === 0 && <Upload size={16} />} 結果を取得して掲載
              </Button>
            </div>
          ) : (
            <div className="mt-3 flex flex-1 flex-col justify-between gap-4">
              <p className="text-sm leading-relaxed text-ink-500">
                出走表は公開済みです。発走・確定後、自動処理が確定を検知して結果を掲載します。手動で結果掲載をテストすることもできます。
              </p>
              <Button variant="outline" onClick={runPublish} loading={running > 0}>
                {running === 0 && <Upload size={16} />} 確定を待たずに結果掲載をテスト
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* ---- 結果テーブル ---- */}
      {race.result && (
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <Trophy size={18} className="text-brand-600" />
            <h2 className="text-base font-bold text-ink-900">確定結果</h2>
            {race.winTime && <Pill tone="gray">勝ちタイム {race.winTime}</Pill>}
            <Pill tone={race.resultStatus === "掲載済" ? "green" : "amber"}>
              {race.resultStatus === "掲載済" ? "ページ掲載済" : "掲載待ち"}
            </Pill>
          </div>
          {loading ? (
            <Skeleton className="h-64 rounded-2xl" />
          ) : (
            <Card className="overflow-hidden">
              <div className="thin-scroll overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs font-semibold text-ink-500">
                      <th className="px-3 py-2.5 text-center">着</th>
                      <th className="px-3 py-2.5 text-center">枠馬番</th>
                      <th className="px-3 py-2.5">馬名</th>
                      <th className="px-3 py-2.5">騎手</th>
                      <th className="px-3 py-2.5 tnum text-center">人気</th>
                      <th className="px-3 py-2.5 tnum text-right">単勝</th>
                      <th className="px-3 py-2.5 tnum">タイム</th>
                      <th className="px-3 py-2.5">着差</th>
                      <th className="px-3 py-2.5">通過</th>
                      <th className="px-3 py-2.5 tnum text-right">馬体重</th>
                    </tr>
                  </thead>
                  <tbody>
                    {race.result.map((row) => (
                      <tr
                        key={row.no}
                        className={
                          "border-b border-ink-100 last:border-0 " + (row.place === 1 ? "bg-brand-50/50" : "")
                        }
                      >
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={
                              "tnum inline-grid h-6 w-6 place-items-center rounded-full text-xs font-bold " +
                              (row.place === 1
                                ? "bg-brand-600 text-white"
                                : row.place <= 3
                                  ? "bg-brand-100 text-brand-700"
                                  : "text-ink-500")
                            }
                          >
                            {row.place}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex justify-center">
                            <FrameBadge frame={row.frame} no={row.no} />
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-medium text-ink-900">{row.horse}</td>
                        <td className="px-3 py-2.5 text-ink-600">{row.jockey}</td>
                        <td className="tnum px-3 py-2.5 text-center text-ink-600">{row.pop}</td>
                        <td className="tnum px-3 py-2.5 text-right text-ink-700">{row.odds.toFixed(1)}</td>
                        <td className="tnum px-3 py-2.5 text-ink-700">{row.time}</td>
                        <td className="px-3 py-2.5 text-ink-500">{row.margin || "—"}</td>
                        <td className="tnum px-3 py-2.5 text-ink-500">{row.passing}</td>
                        <td className="tnum px-3 py-2.5 text-right text-ink-600">
                          {row.bodyWeight}
                          <span
                            className={
                              "ml-1 text-xs " +
                              (row.bodyDiff > 0 ? "text-rose-500" : row.bodyDiff < 0 ? "text-sky-600" : "text-ink-400")
                            }
                          >
                            ({diffLabel(row.bodyDiff)})
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* 払戻 */}
          {race.payouts && (
            <Card className="mt-4 p-5">
              <div className="text-sm font-semibold text-ink-800">払戻金</div>
              <div className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {race.payouts.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 border-b border-ink-100 py-1.5 text-sm last:border-0">
                    <span className="w-14 shrink-0 font-medium text-ink-500">{p.label}</span>
                    <span className="tnum font-semibold text-ink-800">{p.combo}</span>
                    <span className="tnum ml-auto font-bold text-ink-900">{yen(p.yen)}</span>
                    <span className="tnum w-14 shrink-0 text-right text-xs text-ink-400">{p.pop}人気</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ---- 出走表 ---- */}
      <div className="mt-6">
        <h2 className="mb-3 text-base font-bold text-ink-900">出走表</h2>
        {loading ? (
          <Skeleton className="h-64 rounded-2xl" />
        ) : (
          <Card className="overflow-hidden">
            <div className="thin-scroll overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs font-semibold text-ink-500">
                    <th className="px-3 py-2.5 text-center">枠馬番</th>
                    <th className="px-3 py-2.5">馬名</th>
                    <th className="px-3 py-2.5">性齢</th>
                    <th className="px-3 py-2.5 tnum text-center">斤量</th>
                    <th className="px-3 py-2.5">騎手</th>
                    <th className="px-3 py-2.5 tnum text-right">単勝</th>
                    <th className="px-3 py-2.5 tnum text-center">人気</th>
                    <th className="px-3 py-2.5 tnum text-right">馬体重</th>
                  </tr>
                </thead>
                <tbody>
                  {[...race.entries]
                    .sort((a, b) => a.no - b.no)
                    .map((e) => (
                      <tr key={e.no} className="border-b border-ink-100 last:border-0">
                        <td className="px-3 py-2.5">
                          <div className="flex justify-center">
                            <FrameBadge frame={e.frame} no={e.no} />
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-medium text-ink-900">{e.horse}</td>
                        <td className="px-3 py-2.5 text-ink-600">{e.sexAge}</td>
                        <td className="tnum px-3 py-2.5 text-center text-ink-600">{e.weight}</td>
                        <td className="px-3 py-2.5 text-ink-600">{e.jockey}</td>
                        <td className="tnum px-3 py-2.5 text-right text-ink-700">{e.odds.toFixed(1)}</td>
                        <td className="tnum px-3 py-2.5 text-center">
                          <span
                            className={
                              "inline-grid h-5 min-w-5 place-items-center rounded px-1 text-xs font-semibold " +
                              (e.pop <= 3 ? "bg-brand-100 text-brand-700" : "text-ink-500")
                            }
                          >
                            {e.pop}
                          </span>
                        </td>
                        <td className="tnum px-3 py-2.5 text-right text-ink-600">
                          {e.bodyWeight}
                          <span className="ml-1 text-xs text-ink-400">({diffLabel(e.bodyDiff)})</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
