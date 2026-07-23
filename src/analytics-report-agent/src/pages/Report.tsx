import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Sparkles,
  Send,
  RefreshCw,
  Check,
  Pin,
  TrendingUp,
  TrendingDown,
  CircleCheck,
  MessageSquare,
  History,
  ChevronRight,
} from "lucide-react";
import { useStore } from "../store";
import { week, month, growth, evalKpis, aggregate, organicRatio } from "../lib/analytics";
import type { Proposal, Priority } from "../data/seed";
import { num, pct, delta, wdmd, md_hm } from "../lib/format";
import { fakeApi } from "../lib/fakeApi";
import { subDays } from "date-fns";
import { Card, Button, Pill, Modal, Toggle, Delta } from "../components/ui";
import { GoogleChatCard } from "../components/GoogleChatCard";

const PRIORITY_ORDER: Record<Priority, number> = { 高: 0, 中: 1, 低: 2 };
const PRIORITY_TONE: Record<Priority, "red" | "amber" | "gray"> = {
  高: "red",
  中: "amber",
  低: "gray",
};

const STEPS = [
  "GA4 からアクセスデータを取得中…",
  "主要指標とチャネルを解析中…",
  "KPI 進捗を評価中…",
  "AI が改善提案を生成中…",
];

export default function Report() {
  const metrics = useStore((s) => s.metrics);
  const channels = useStore((s) => s.channels);
  const kpis = useStore((s) => s.kpis);
  const proposals = useStore((s) => s.proposals);
  const pinned = useStore((s) => s.pinned);
  const togglePin = useStore((s) => s.toggleProposalPin);
  const notifications = useStore((s) => s.notifications);
  const pushNotification = useStore((s) => s.pushNotification);
  const settings = useStore((s) => s.settings);

  const [phase, setPhase] = useState<"generating" | "done">("generating");
  const [step, setStep] = useState(0);
  const [sendOpen, setSendOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [includeProposals, setIncludeProposals] = useState(settings.includeProposals);

  const w = useMemo(() => week(metrics), [metrics]);
  const m = useMemo(() => month(metrics), [metrics]);
  const kpiEvals = useMemo(() => evalKpis(metrics, channels, kpis), [metrics, channels, kpis]);
  const orgRatio = useMemo(() => organicRatio(channels), [channels]);

  const periodLabel = useMemo(() => {
    const end = subDays(new Date(), 1);
    const start = subDays(end, 6);
    return `${wdmd(start.toISOString())} 〜 ${wdmd(end.toISOString())}`;
  }, []);

  const sorted = useMemo(
    () =>
      [...proposals].sort((a, b) => {
        const pin = Number(pinned.includes(b.id)) - Number(pinned.includes(a.id));
        if (pin !== 0) return pin;
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      }),
    [proposals, pinned],
  );

  // 通知本文に載せる提案(採用=ピン留めがあればそれ、無ければ優先度上位3件)
  const notifyProposals = useMemo(() => {
    const pins = sorted.filter((p) => pinned.includes(p.id));
    return (pins.length ? pins : sorted).slice(0, 3);
  }, [sorted, pinned]);

  const wow = {
    users: growth(w.cur.users, w.prev.users),
    cvr: growth(w.cur.cvr, w.prev.cvr),
    conversions: growth(w.cur.conversions, w.prev.conversions),
  };

  // 生成アニメーション(初回・再生成)
  const runGenerate = () => {
    setPhase("generating");
    setStep(0);
    let i = 0;
    const tick = () => {
      i += 1;
      if (i < STEPS.length) {
        setStep(i);
        window.setTimeout(tick, 620 + Math.random() * 260);
      } else {
        fakeApi(true, 300).then(() => setPhase("done"));
      }
    };
    window.setTimeout(tick, 640);
  };

  useEffect(() => {
    runGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doSend = async () => {
    setSending(true);
    await fakeApi(true, 900);
    pushNotification({
      title: "週次アクセス解析レポート",
      period: periodLabel,
      space: settings.spaceName,
      status: "送信成功",
      trigger: "手動",
      headline: buildHeadline(w.cur.users, wow.users),
    });
    setSending(false);
    setSendOpen(false);
    toast.success("Google Chat へ送信しました", {
      description: `${settings.spaceName} に週次レポートを通知しました。`,
    });
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-900">レポート＆改善提案</h1>
          <p className="mt-0.5 text-sm text-ink-500">
            対象期間 {periodLabel}・○○株式会社 コーポレートサイト
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runGenerate} disabled={phase === "generating"}>
            <RefreshCw size={15} />
            再生成
          </Button>
          <Button onClick={() => setSendOpen(true)} disabled={phase !== "done"}>
            <Send size={15} />
            Google Chat へ通知
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === "generating" ? (
          <GeneratingView key="gen" step={step} />
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* AI 要約 */}
            <Card className="overflow-hidden">
              <div className="flex items-center gap-2 border-b border-ink-100 bg-brand-50/60 px-5 py-3">
                <Sparkles size={16} className="text-brand-600" />
                <span className="text-sm font-bold text-ink-800">AI による状況サマリー</span>
                <span className="ml-auto text-[11px] text-ink-400">LLM 生成 / 前週比較</span>
              </div>
              <div className="space-y-3 px-5 py-4 text-sm leading-relaxed text-ink-700">
                {buildSummary(w.cur, wow, orgRatio, kpiEvals).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </Card>

            {/* 主要指標 */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MetricMini label="ユーザー数" value={num(w.cur.users) + " 人"} d={wow.users} />
              <MetricMini label="コンバージョン" value={num(w.cur.conversions) + " 件"} d={wow.conversions} />
              <MetricMini label="CV率" value={pct(w.cur.cvr)} d={wow.cvr} />
              <MetricMini
                label="オーガニック比率"
                value={orgRatio.toFixed(1) + "%"}
                d={growth(w.cur.users, w.prev.users) * 0.4}
              />
            </div>

            {/* KPI 評価 */}
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-bold text-ink-900">KPI 進捗評価</h2>
              <div className="space-y-2.5">
                {kpiEvals.map((k) => {
                  const tone =
                    k.status === "達成" ? "green" : k.status === "順調" ? "brand" : "amber";
                  return (
                    <div
                      key={k.kpi.id}
                      className="flex items-center gap-3 rounded-xl border border-ink-100 px-4 py-3"
                    >
                      <span className="min-w-0 flex-1 text-sm font-medium text-ink-700">
                        {k.kpi.label}
                      </span>
                      <div className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-ink-200 sm:block">
                        <div
                          className={
                            "h-full rounded-full " +
                            (tone === "green"
                              ? "bg-emerald-500"
                              : tone === "brand"
                                ? "bg-brand-500"
                                : "bg-amber-500")
                          }
                          style={{ width: `${Math.min(100, k.ratio * 100)}%` }}
                        />
                      </div>
                      <span className="tnum w-12 text-right text-sm font-semibold text-ink-800">
                        {Math.round(k.ratio * 100)}%
                      </span>
                      <Pill tone={tone as "green" | "brand" | "amber"}>{k.status}</Pill>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* AI 改善提案 */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-ink-900">AI 改善提案</h2>
                <span className="text-xs text-ink-400">
                  ピン留めした提案が通知本文に優先掲載されます
                </span>
              </div>
              <div className="space-y-3">
                {sorted.map((p) => (
                  <ProposalCard
                    key={p.id}
                    p={p}
                    pinned={pinned.includes(p.id)}
                    onPin={() => {
                      togglePin(p.id);
                      toast(pinned.includes(p.id) ? "採用を解除しました" : "提案を採用しました", {
                        description: p.title,
                      });
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 送信履歴 */}
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <History size={16} className="text-ink-400" />
                <h2 className="text-sm font-bold text-ink-900">Google Chat 送信履歴</h2>
              </div>
              <div className="divide-y divide-ink-100">
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-center gap-3 py-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                      <CircleCheck size={17} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-ink-800">{n.title}</span>
                        <Pill tone={n.trigger === "手動" ? "brand" : "gray"}>{n.trigger}</Pill>
                      </div>
                      <div className="truncate text-xs text-ink-400">{n.headline}</div>
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      <div className="text-xs font-medium text-ink-600">{n.period}</div>
                      <div className="tnum text-[11px] text-ink-400">{md_hm(n.sentAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 送信モーダル */}
      <Modal
        open={sendOpen}
        onClose={() => {
          setSending(false);
          setSendOpen(false);
        }}
        title="Google Chat へ通知"
        width={520}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-ink-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <MessageSquare size={16} className="text-brand-600" />
              <span className="font-medium text-ink-700">宛先スペース</span>
            </div>
            <span className="text-sm font-semibold text-ink-800">{settings.spaceName}</span>
          </div>

          <label className="flex items-center justify-between rounded-xl border border-ink-100 px-4 py-3">
            <div>
              <div className="text-sm font-medium text-ink-700">改善提案を本文に含める</div>
              <div className="text-xs text-ink-400">優先度上位3件を掲載します</div>
            </div>
            <Toggle checked={includeProposals} onChange={setIncludeProposals} />
          </label>

          <div>
            <div className="mb-1.5 text-xs font-semibold text-ink-400">送信プレビュー</div>
            <GoogleChatCard
              space={settings.spaceName}
              periodLabel={periodLabel}
              cur={w.cur}
              wow={wow}
              kpis={kpiEvals}
              proposals={includeProposals ? notifyProposals : []}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => setSendOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={doSend} loading={sending}>
              {!sending && <Send size={15} />}
              この内容で送信
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ---- 生成中ビュー --------------------------------------------------------
function GeneratingView({ step }: { step: number }) {
  return (
    <motion.div
      key="gen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Card className="flex flex-col items-center gap-5 px-6 py-14">
        <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-brand-50">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "linear" }}
            className="absolute inset-1 rounded-xl border-2 border-brand-200 border-t-brand-600"
          />
          <Sparkles size={22} className="text-brand-600" />
        </div>
        <div className="w-full max-w-sm space-y-2.5">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm">
              <span
                className={
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full transition " +
                  (i < step
                    ? "bg-emerald-500 text-white"
                    : i === step
                      ? "bg-brand-600 text-white"
                      : "bg-ink-200 text-ink-400")
                }
              >
                {i < step ? (
                  <Check size={12} />
                ) : i === step ? (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                ) : (
                  <span className="text-[10px]">{i + 1}</span>
                )}
              </span>
              <span className={i <= step ? "text-ink-800" : "text-ink-400"}>{s}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

// ---- 提案カード ----------------------------------------------------------
function ProposalCard({ p, pinned, onPin }: { p: Proposal; pinned: boolean; onPin: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className={"p-4 transition " + (pinned ? "border-brand-300 bg-brand-50/40" : "")}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={PRIORITY_TONE[p.priority]}>優先度 {p.priority}</Pill>
            <span className="text-[11px] font-medium text-ink-400">{p.category}</span>
          </div>
          <h3 className="mt-1.5 text-sm font-bold text-ink-900">{p.title}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <TrendingUp size={13} />
            {p.impact}
          </div>
        </div>
        <button
          onClick={onPin}
          aria-label="提案を採用"
          className={
            "grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition " +
            (pinned
              ? "border-brand-300 bg-brand-600 text-white"
              : "border-ink-200 text-ink-400 hover:bg-ink-50 hover:text-ink-700")
          }
        >
          <Pin size={16} className={pinned ? "fill-white" : ""} />
        </button>
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-2 flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
      >
        <ChevronRight
          size={14}
          className={"transition " + (open ? "rotate-90" : "")}
        />
        {open ? "詳細を隠す" : "打ち手と根拠を見る"}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3 rounded-xl bg-ink-50 p-3.5 text-sm">
              <div>
                <div className="mb-1 text-[11px] font-semibold text-ink-400">具体的な打ち手</div>
                <p className="leading-relaxed text-ink-700">{p.detail}</p>
              </div>
              <div>
                <div className="mb-1 text-[11px] font-semibold text-ink-400">データ上の根拠</div>
                <p className="leading-relaxed text-ink-600">{p.basis}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ---- 指標ミニカード ------------------------------------------------------
function MetricMini({ label, value, d }: { label: string; value: string; d: number }) {
  return (
    <Card className="p-4">
      <div className="text-xs font-medium text-ink-500">{label}</div>
      <div className="tnum mt-1.5 text-xl font-bold text-ink-900">{value}</div>
      <div className="mt-1 flex items-center gap-1.5">
        <Delta value={d} />
        <span className="text-[11px] text-ink-400">前週比</span>
      </div>
    </Card>
  );
}

// ---- 要約テキスト生成 ----------------------------------------------------
function buildHeadline(users: number, wow: number): string {
  const dir = wow >= 0 ? "増加" : "減少";
  return `ユーザー数は前週比 ${delta(wow)} の${dir}(${num(users)}人)。`;
}

function buildSummary(
  cur: ReturnType<typeof aggregate>,
  wow: { users: number; cvr: number; conversions: number },
  orgRatio: number,
  kpiEvals: ReturnType<typeof evalKpis>,
): string[] {
  const achieved = kpiEvals.filter((k) => k.status === "達成").length;
  const good = kpiEvals.filter((k) => k.status === "順調").length;
  const need = kpiEvals.filter((k) => k.status === "要改善");

  const p1 = `今週のユーザー数は ${num(cur.users)} 人で、前週から ${delta(wow.users)} ${
    wow.users >= 0 ? "伸長" : "減少"
  }しました。セッションあたりのCV率は ${pct(cur.cvr)}(前週比 ${delta(wow.cvr)})、コンバージョンは ${num(
    cur.conversions,
  )} 件(${delta(wow.conversions)})で、集客と転換の両面で${
    wow.users >= 0 && wow.conversions >= 0 ? "堅調に推移" : "一部に鈍化がみられる状況"
  }です。`;

  const p2 = `流入構成ではオーガニック検索が ${orgRatio.toFixed(
    1,
  )}% を占め、依然として最大の獲得チャネルです。自然検索の受け皿となるコンテンツ拡充が、今後の安定成長の鍵になります。`;

  const p3 =
    need.length > 0
      ? `KPI は 4 項目中 ${achieved} 項目が目標達成、${good} 項目が順調ペースです。一方で「${need
          .map((k) => k.kpi.label)
          .join(
            "・",
          )}」が目標を下回っており、下記の改善提案では優先度「高」の施策からの着手を推奨します。`
      : `KPI は 4 項目中 ${achieved} 項目が目標を達成し、全体として計画を上回るペースです。この勢いを維持するため、下記の改善提案で伸びしろの大きい施策を提示しました。`;

  return [p1, p2, p3];
}
