import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  History, Users, CalendarDays, Video, Trash2, ChevronRight, Inbox, RotateCcw,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { useStore } from "../store/useStore";
import { simMeta } from "../data/simulators";
import { man } from "../lib/tax";
import { Button, Modal } from "../components/ui";
import { fakeApi } from "../lib/fakeApi";
import { EXPERTS } from "../data/experts";

const STATUS_STYLE: Record<string, string> = {
  受付中: "bg-amber-50 text-amber-600",
  日程調整中: "bg-blue-50 text-blue-600",
  確定: "bg-emerald-50 text-emerald-600",
};

export function MyPage() {
  const { history, requests, cancelRequest, resetAll } = useStore();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);

  const doCancel = async () => {
    if (!confirmId) return;
    setCanceling(true);
    await fakeApi(null, 500);
    cancelRequest(confirmId);
    setCanceling(false);
    setConfirmId(null);
    toast.success("相談の申込をキャンセルしました");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-en text-xs font-bold uppercase tracking-[0.2em] text-primary-600">
        My Page
      </p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">マイページ</h1>
      <p className="mt-2 text-sm text-slate-500">
        シミュレーションの履歴と、専門家への相談申込を確認できます。
      </p>

      {/* 相談申込 */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Users size={17} className="text-primary-600" />
          相談の申込
          {requests.length > 0 && (
            <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[11px] font-bold text-white">
              {requests.length}
            </span>
          )}
        </h2>
        {requests.length === 0 ? (
          <div className="mt-3 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
            <Inbox size={30} className="text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-600">まだ相談の申込はありません</p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
              気になる専門家を指名して、最初の相談を申し込んでみましょう。初回無料の専門家も多数登録されています。
            </p>
            <Link
              to="/experts"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-transform hover:scale-[1.02]"
            >
              専門家をさがす <ChevronRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {requests.map((r, i) => {
              const expert = EXPERTS.find((e) => e.id === r.expertId);
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04, ease: "easeOut" }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <Link to={`/experts/${r.expertId}`} className="group flex items-center gap-3">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-full text-base font-bold text-white"
                        style={{ background: expert?.color ?? "#64748b" }}
                      >
                        {r.expertName[0]}
                      </span>
                      <span>
                        <span className="block text-[15px] font-bold group-hover:text-primary-700">
                          {r.expertName}
                          <span className="ml-2 rounded bg-primary-50 px-1.5 py-0.5 text-[10px] font-bold text-primary-700">
                            {r.qualification}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-400">
                          申込: {formatDistanceToNow(new Date(r.date), { addSuffix: true, locale: ja })}
                        </span>
                      </span>
                    </Link>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${STATUS_STYLE[r.status]}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 rounded-xl bg-slate-50 p-4 text-[13px] text-slate-600 sm:grid-cols-3">
                    <p className="font-semibold">{r.topic}</p>
                    <p className="flex items-center gap-1.5">
                      <CalendarDays size={13} className="text-slate-400" />
                      希望日 {format(new Date(r.preferredDate + "T00:00:00"), "M月d日(E)", { locale: ja })}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Video size={13} className="text-slate-400" />
                      {r.method}
                    </p>
                  </div>
                  {r.message && (
                    <p className="mt-2 text-xs leading-6 text-slate-500">{r.message}</p>
                  )}
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => setConfirmId(r.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={13} />
                      申込をキャンセル
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* 履歴 */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <History size={17} className="text-primary-600" />
          シミュレーション履歴
        </h2>
        {history.length === 0 ? (
          <div className="mt-3 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
            <History size={30} className="text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-600">まだ履歴がありません</p>
            <p className="mt-1 text-xs text-slate-400">シミュレーションを実行すると、ここに結果が保存されます。</p>
            <Link
              to="/simulators"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-transform hover:scale-[1.02]"
            >
              シミュレーションする <ChevronRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
            {history.map((h) => (
              <Link
                key={h.id}
                to={`/simulators/${h.type}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                      {simMeta(h.type).tag}
                    </span>
                    <span className="truncate">{h.summary}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {format(new Date(h.date), "yyyy/MM/dd HH:mm")} — {h.headline}
                  </p>
                </div>
                <p className="shrink-0 text-[15px] font-extrabold tabular-nums text-primary-700">
                  {man(h.totalTax)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* リセット */}
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-bold">デモデータのリセット</p>
        <p className="mt-1 text-xs text-slate-500">
          履歴と相談申込をすべて削除し、初期状態に戻します(デモの動作確認用)。
        </p>
        <div className="mt-3">
          <Button
            variant="danger"
            onClick={() => {
              resetAll();
              toast.success("デモデータを初期状態に戻しました");
            }}
          >
            <RotateCcw size={14} />
            初期状態に戻す
          </Button>
        </div>
      </div>

      {/* キャンセル確認 */}
      <Modal open={confirmId !== null} onClose={() => !canceling && setConfirmId(null)} title="申込をキャンセルしますか?">
        <p className="text-sm leading-6 text-slate-600">
          この相談申込を取り消します。この操作は元に戻せません。
        </p>
        <div className="mt-5 flex gap-3">
          <Button variant="ghost" full onClick={() => setConfirmId(null)} disabled={canceling}>
            戻る
          </Button>
          <Button variant="danger" full onClick={doCancel} loading={canceling}>
            キャンセルする
          </Button>
        </div>
      </Modal>
    </div>
  );
}
