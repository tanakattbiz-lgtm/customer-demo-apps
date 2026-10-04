/**
 * ゲーム風チュートリアル(使い方ツアー)。
 * 実際の画面の上で、操作してほしい場所だけを明るく残し、案内役が手順を説明する。
 * 「光っているボタンを押す」「文字を入力する」などを実際に行うと次へ進む。
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, type NavigateFunction } from "react-router-dom";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronRight, MousePointerClick, PencilLine, RotateCcw, X } from "lucide-react";
import { useStore } from "../store";
import { ME_ID } from "../data/seed";

// ======================= 状態 =======================
export const useTourSeen = create<{ seen: boolean; setSeen: (v: boolean) => void }>()(
  persist((set) => ({ seen: false, setSeen: (seen) => set({ seen }) }), { name: "outdoor-ad-management-tour" }),
);

interface Run {
  active: boolean;
  i: number;
  start: () => void;
  stop: () => void;
  go: (i: number) => void;
}
export const useTour = create<Run>((set) => ({
  active: false,
  i: 0,
  start: () => set({ active: true, i: 0 }),
  stop: () => set({ active: false, i: 0 }),
  go: (i) => set({ i }),
}));

// ======================= シナリオ =======================
type Kind = "welcome" | "intro" | "info" | "click" | "input" | "route" | "finish";
interface Step {
  mission: number;
  kind: Kind;
  target?: string; // data-tour の値
  title?: string;
  text: string;
  hint?: string;
  done?: () => boolean; // input: 条件を満たしたら「次へ」が押せる
  waitFor?: () => boolean; // click: 押したあと、この条件になるまで待ってから次へ
  route?: string; // route: この画面に移ったら次へ
  fallbackNav?: string; // route: 対象が見えない(スマホ等)ときに代わりに移動する先
  enter?: (nav: NavigateFunction) => void;
}

const MISSIONS = [
  "画面の見方を覚えよう",
  "お客様への対応を記録しよう",
  "看板の空きを探して仮押さえしよう",
  "契約の書類を管理部へ提出しよう",
  "会社全体の数字を見てみよう",
];

const q = (sel: string) => document.querySelector(sel);
const valueOf = (t: string) => (q(`[data-tour="${t}"]`) as HTMLInputElement | null)?.value?.trim() ?? "";
const gone = (t: string) => () => !q(`[data-tour="${t}"]`);

const STEPS: Step[] = [
  {
    mission: -1,
    kind: "welcome",
    title: "ようこそ、営業・看板管理システムへ",
    text: "はじめての方向けに、実際の画面を使って操作を練習できる「使い方ツアー」を用意しました。5つのミッションを順番にクリアしていきましょう。所要時間は5分ほどです。",
    enter: (nav) => nav("/"),
  },
  // ---- ミッション1 ----
  { mission: 0, kind: "intro", text: "まずは、画面のどこに何があるかを確認しましょう。", enter: (nav) => nav("/") },
  {
    mission: 0,
    kind: "info",
    target: "nav",
    title: "メニュー",
    text: "これがメニューです(スマホでは左上のボタンで開きます)。ここから、いつでも画面を切り替えられます。それぞれの下に、何ができる画面かが書いてあります。",
  },
  {
    mission: 0,
    kind: "info",
    target: "home-todo",
    title: "今日、対応が必要なこと",
    text: "ホームを開くと、今日やるべきことが一番上に出ます。赤い印は期限を過ぎているものです。朝はまずここを見ましょう。",
  },
  {
    mission: 0,
    kind: "info",
    target: "home-tiles",
    title: "やりたいことを選ぶ",
    text: "何をすればいいか迷ったら、ここの大きなボタンから選べば大丈夫です。",
  },
  // ---- ミッション2 ----
  { mission: 1, kind: "intro", text: "お客様に電話や訪問をしたら、その内容をシステムに残します。実際にやってみましょう。", enter: (nav) => nav("/") },
  {
    mission: 1,
    kind: "click",
    target: "home-log",
    title: "対応を記録する",
    text: "光っている「対応したら記録する」ボタンを押してください。",
    hint: "光っているボタンを押してください",
  },
  {
    mission: 1,
    kind: "input",
    target: "act-memo",
    title: "話した内容を書く",
    text: "お客様と話した内容を書きます。練習なので、たとえば「電話で確認しました」と入力してみましょう。",
    hint: "入力できたら「次へ」を押してください",
    done: () => valueOf("act-memo").length >= 4,
  },
  {
    mission: 1,
    kind: "input",
    target: "act-next",
    title: "次にやることを決める",
    text: "次の予定も一緒に決めておくと、忘れずに済みます。たとえば「見積書を送る」と入力しましょう。日付は最初から1週間後になっています。",
    hint: "入力できたら「次へ」を押してください",
    done: () => valueOf("act-next").length >= 2,
  },
  {
    mission: 1,
    kind: "click",
    target: "act-submit",
    title: "記録する",
    text: "最後に「記録する」を押せば完了です。",
    hint: "光っているボタンを押してください",
    waitFor: gone("act-submit"),
  },
  // ---- ミッション3 ----
  { mission: 2, kind: "intro", text: "お客様の希望する時期に、空いている看板を探して「仮押さえ(一時的な確保)」をします。" },
  {
    mission: 2,
    kind: "route",
    target: "nav-boards|nav",
    route: "/boards",
    fallbackNav: "/boards",
    title: "看板の空きを探す",
    text: "メニューの「看板の空きを探す」を押してください。(スマホでは、先に左上のボタンでメニューを開きます)",
    hint: "光っているメニューを押してください",
  },
  {
    mission: 2,
    kind: "info",
    target: "find-form",
    title: "条件を選ぶ",
    text: "エリア・看板の種類・始めたい月・期間を選ぶと、下に空いている面が並びます。今回はこのままでOKです。",
  },
  {
    mission: 2,
    kind: "click",
    target: "hold-btn",
    title: "仮押さえする",
    text: "空いている面の「この面を仮押さえする」を押してください。",
    hint: "光っているボタンを押してください",
  },
  {
    mission: 2,
    kind: "input",
    target: "hold-deal",
    title: "どの商談のためか選ぶ",
    text: "この看板を、どのお客様の商談のために確保するかを選びます。一覧から1つ選んでください。",
    hint: "選べたら「次へ」を押してください",
    done: () => valueOf("hold-deal") !== "",
  },
  {
    mission: 2,
    kind: "click",
    target: "hold-submit",
    title: "確保する",
    text: "「仮押さえする」を押すと、期限までの間、ほかの担当者はこの面を押さえられなくなります。",
    hint: "光っているボタンを押してください",
    waitFor: gone("hold-submit"),
  },
  // ---- ミッション4 ----
  {
    mission: 3,
    kind: "intro",
    text: "お客様の了承が取れたら「成約」です。契約の内容と書類を、管理部へ提出しましょう。さきほど仮押さえした商談の画面を開きます。",
    enter: (nav) => {
      const mine = useStore.getState().holds.filter((h) => h.repId === ME_ID);
      const last = mine.at(-1);
      nav(last ? `/deals/${last.dealId}` : "/deals");
    },
  },
  {
    mission: 3,
    kind: "info",
    target: "next-step",
    title: "次にやること",
    text: "商談の画面には「次にやること」が出ます。迷ったら、ここに書いてある通りに進めれば大丈夫です。",
  },
  {
    mission: 3,
    kind: "click",
    target: "next-step-btn",
    title: "成約を登録する",
    text: "「成約を登録する」を押してください。",
    hint: "光っているボタンを押してください",
  },
  {
    mission: 3,
    kind: "info",
    target: "wizard-steps",
    title: "3つの手順",
    text: "成約の登録は「掲載内容 → 書類の添付 → 確認して提出」の3つの手順で進みます。いまは1つ目です。掲載内容は仮押さえから自動で入っています。",
  },
  {
    mission: 3,
    kind: "click",
    target: "wizard-next",
    title: "次へ進む",
    text: "内容がよければ「次へ進む」を押します。",
    hint: "光っているボタンを押してください",
  },
  {
    mission: 3,
    kind: "input",
    target: "wizard-docs",
    title: "書類を添付する",
    text: "「必須」と書かれた2つの書類を添付します。本番ではパソコンのファイルを選びますが、練習なので「サンプルを添付」を2つ押してください。",
    hint: "2つ添付できたら「次へ」を押してください",
    done: () => document.querySelectorAll('[data-required="true"][data-attached="true"]').length >= 2,
  },
  {
    mission: 3,
    kind: "click",
    target: "wizard-next",
    title: "確認画面へ",
    text: "もう一度「次へ進む」を押すと、確認画面になります。",
    hint: "光っているボタンを押してください",
  },
  {
    mission: 3,
    kind: "click",
    target: "wizard-submit",
    title: "管理部へ提出",
    text: "内容を確認して「この内容で管理部へ提出する」を押せば完了です。管理部が書類をチェックしてくれます。",
    hint: "光っているボタンを押してください",
    waitFor: gone("wizard-submit"),
  },
  // ---- ミッション5 ----
  { mission: 4, kind: "intro", text: "最後に、会社全体の契約数や看板の稼働率を見てみましょう。" },
  {
    mission: 4,
    kind: "route",
    target: "nav-dashboard|nav",
    route: "/dashboard",
    fallbackNav: "/dashboard",
    title: "会社全体の数字",
    text: "メニューの「会社全体の数字」を押してください。(スマホでは、先に左上のボタンでメニューを開きます)",
    hint: "光っているメニューを押してください",
  },
  {
    mission: 4,
    kind: "info",
    target: "kpi",
    title: "大事な数字",
    text: "今月の新規契約・解約・稼働率などが一目でわかります。言葉の意味がわからないときは、横の「?」マークにマウスを乗せると説明が出ます。さきほど提出した契約も、新規契約の数に入っています。",
  },
  { mission: 5, kind: "finish", text: "" },
];

// ======================= 要素の位置 =======================
/** "a|b" のように複数書くと、先に見つかった方を使う(スマホでメニューが閉じているときなど) */
function findVisible(t: string): HTMLElement | null {
  for (const name of t.split("|")) {
    const list = document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`);
    for (const el of list) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) return el;
    }
  }
  return null;
}

type Rect = { x: number; y: number; w: number; h: number };

function useTargetRect(target: string | undefined, key: number) {
  const [rect, setRect] = useState<Rect | null>(null);
  const [missing, setMissing] = useState(false);
  const elRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    setRect(null);
    setMissing(false);
    elRef.current = null;
    if (!target) return;
    let raf = 0;
    let scrolled = false;
    const started = performance.now();
    const loop = () => {
      const el = findVisible(target);
      elRef.current = el;
      if (el) {
        if (!scrolled) {
          el.scrollIntoView({ block: "center", behavior: "smooth" });
          scrolled = true;
        }
        const r = el.getBoundingClientRect();
        setRect((p) =>
          p && Math.abs(p.x - r.left) < 0.5 && Math.abs(p.y - r.top) < 0.5 && Math.abs(p.w - r.width) < 0.5 && Math.abs(p.h - r.height) < 0.5
            ? p
            : { x: r.left, y: r.top, w: r.width, h: r.height },
        );
        setMissing(false);
      } else {
        setRect(null);
        if (performance.now() - started > 1800) setMissing(true);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [target, key]);
  return { rect, missing, elRef };
}

// ======================= 本体 =======================
export default function Tour() {
  const { active, i, go, stop } = useTour();
  const setSeen = useTourSeen((s) => s.setSeen);
  const nav = useNavigate();
  const loc = useLocation();
  const step = STEPS[i];
  const [retry, setRetry] = useState(0);
  const { rect, missing, elRef } = useTargetRect(active ? step?.target : undefined, i * 100 + retry);
  const [ready, setReady] = useState(false);
  const [confirmSkip, setConfirmSkip] = useState(false);
  const advancing = useRef(false);

  const next = useCallback(() => {
    advancing.current = false;
    go(Math.min(i + 1, STEPS.length - 1));
  }, [go, i]);

  // ステップに入ったときの処理
  useEffect(() => {
    if (!active || !step) return;
    setReady(false);
    setConfirmSkip(false);
    advancing.current = false;
    step.enter?.(nav);
  }, [active, i]);

  // 入力待ち
  useEffect(() => {
    if (!active || step?.kind !== "input" || !step.done) return;
    const t = setInterval(() => setReady(step.done!()), 200);
    return () => clearInterval(t);
  }, [active, step]);

  // 画面遷移待ち
  useEffect(() => {
    if (!active || step?.kind !== "route" || !step.route) return;
    if (loc.pathname.startsWith(step.route)) {
      const t = setTimeout(next, 500);
      return () => clearTimeout(t);
    }
  }, [active, step, loc.pathname, next]);

  // クリック待ち
  useEffect(() => {
    if (!active || step?.kind !== "click") return;
    const onClick = (e: MouseEvent) => {
      const el = elRef.current;
      if (!el || advancing.current || !el.contains(e.target as Node)) return;
      advancing.current = true;
      if (step.waitFor) {
        const started = Date.now();
        const t = setInterval(() => {
          if (step.waitFor!()) {
            clearInterval(t);
            setTimeout(next, 250);
          } else if (Date.now() - started > 4000) {
            // 入力エラーなどで画面が閉じなかった
            clearInterval(t);
            advancing.current = false;
          }
        }, 150);
      } else setTimeout(next, 450);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [active, step, elRef, next]);

  // Escキーなどでモーダルを閉じても止まらないよう、ツアー中はEscを無効化
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") e.stopPropagation();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [active]);

  if (!active || !step) return null;

  const finish = () => {
    setSeen(true);
    stop();
  };
  const restartMission = () => {
    const first = STEPS.findIndex((s) => s.mission === step.mission && s.kind === "intro");
    document.querySelectorAll<HTMLElement>('[role="dialog"] button[aria-label="閉じる"]').forEach((b) => b.click());
    setRetry((r) => r + 1);
    go(first >= 0 ? first : i);
  };
  const skipMission = () => {
    const nextIntro = STEPS.findIndex((s, k) => k > i && s.mission > step.mission);
    document.querySelectorAll<HTMLElement>('[role="dialog"] button[aria-label="閉じる"]').forEach((b) => b.click());
    go(nextIntro >= 0 ? nextIntro : STEPS.length - 1);
  };

  // 中央表示のカード
  if (step.kind === "welcome" || step.kind === "intro" || step.kind === "finish") {
    return (
      <div className="fixed inset-0 z-[80] grid place-items-center bg-navy-950/60 p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="w-full max-w-[520px] overflow-hidden rounded-xl bg-white shadow-[0_30px_80px_-20px_oklch(15%_0.04_262/0.6)]"
          >
            {step.kind === "welcome" && (
              <Welcome
                onStart={next}
                onLater={() => {
                  setSeen(true);
                  stop();
                }}
              />
            )}
            {step.kind === "intro" && <MissionIntro n={step.mission} text={step.text} onStart={next} onQuit={() => setConfirmSkip(true)} />}
            {step.kind === "finish" && <Finish onClose={() => { finish(); nav("/"); }} />}
          </motion.div>
        </AnimatePresence>
        {confirmSkip && <QuitConfirm onCancel={() => setConfirmSkip(false)} onQuit={finish} />}
      </div>
    );
  }

  // スポットライト
  const pad = 6;
  const hole = rect ? { x: rect.x - pad, y: rect.y - pad, w: rect.w + pad * 2, h: rect.h + pad * 2 } : null;
  const blocking = step.kind === "info" || step.kind === "input";
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  return (
    <div className="fixed inset-0 z-[80]" style={{ pointerEvents: "none" }}>
      {/* 暗幕(穴の外側だけクリックを止める) */}
      {hole ? (
        <>
          <div className="absolute bg-transparent" style={{ left: 0, top: 0, width: vw, height: Math.max(0, hole.y), pointerEvents: "auto" }} />
          <div className="absolute bg-transparent" style={{ left: 0, top: hole.y + hole.h, width: vw, height: Math.max(0, vh - hole.y - hole.h), pointerEvents: "auto" }} />
          <div className="absolute bg-transparent" style={{ left: 0, top: hole.y, width: Math.max(0, hole.x), height: hole.h, pointerEvents: "auto" }} />
          <div className="absolute bg-transparent" style={{ left: hole.x + hole.w, top: hole.y, width: Math.max(0, vw - hole.x - hole.w), height: hole.h, pointerEvents: "auto" }} />
          {/* 入力ステップ以外の info は穴の中も触らせない */}
          {step.kind === "info" && <div className="absolute" style={{ left: hole.x, top: hole.y, width: hole.w, height: hole.h, pointerEvents: "auto" }} />}
          <motion.div
            className="absolute rounded-lg"
            initial={false}
            animate={{ left: hole.x, top: hole.y, width: hole.w, height: hole.h }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            style={{ boxShadow: "0 0 0 9999px oklch(18% 0.04 262 / 0.62)" }}
          >
            {!blocking && <span className="tour-ring absolute -inset-1 rounded-[10px] border-2 border-white" />}
            {blocking && <span className="absolute -inset-0.5 rounded-[9px] border-2 border-white/90" />}
          </motion.div>
        </>
      ) : (
        <div className="absolute inset-0 bg-navy-950/55" style={{ pointerEvents: "auto" }} />
      )}

      <Bubble
        step={step}
        index={i}
        hole={hole}
        missing={missing}
        ready={ready}
        onNext={next}
        onSkip={() => setConfirmSkip(true)}
        onRestart={restartMission}
        onSkipMission={skipMission}
        onFallback={step.fallbackNav ? () => nav(step.fallbackNav!) : undefined}
      />
      {confirmSkip && <QuitConfirm onCancel={() => setConfirmSkip(false)} onQuit={finish} />}
    </div>
  );
}

// ======================= 吹き出し =======================
function Bubble({
  step,
  index,
  hole,
  missing,
  ready,
  onNext,
  onSkip,
  onRestart,
  onSkipMission,
  onFallback,
}: {
  step: Step;
  index: number;
  hole: { x: number; y: number; w: number; h: number } | null;
  missing: boolean;
  ready: boolean;
  onNext: () => void;
  onSkip: () => void;
  onRestart: () => void;
  onSkipMission: () => void;
  onFallback?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; w: number } | null>(null);
  const [compact, setCompact] = useState(false);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => setExpanded(false), [index]);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const mobile = vw < 640;
  const W = mobile ? vw - 24 : 380;
  const [bh, setBh] = useState(220);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBh(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [index]);

  useLayoutEffect(() => {
    const h = bh;
    if (!hole) {
      setPos({ left: (vw - W) / 2, top: Math.max(16, (vh - h) / 2), w: W });
      return;
    }
    if (mobile) {
      const above = hole.y - 12;
      const below = vh - (hole.y + hole.h) - 12;
      setCompact(Math.max(above, below) < 330 && !expanded);
      // 上か下に収まればそこへ。どちらにも収まらなければ画面下に置く(大事な操作は対象の上側にあることが多いため)
      const top =
        below >= h + 10 ? hole.y + hole.h + 10 : above >= h + 10 ? hole.y - 10 - h : vh - h - 12;
      setPos({ left: 12, top, w: W });
      return;
    }
    setCompact(false);
    const gap = 16;
    const clampTop = (t: number) => Math.min(Math.max(12, t), vh - h - 12);
    // 1) 下 2) 上 に入るならそこへ
    if (hole.y + hole.h + gap + h < vh - 8 || hole.y - gap - h > 8) {
      const top = hole.y + hole.h + gap + h < vh - 8 ? hole.y + hole.h + gap : hole.y - gap - h;
      const left = Math.min(Math.max(12, hole.x + hole.w / 2 - W / 2), vw - W - 12);
      setPos({ left, top: clampTop(top), w: W });
      return;
    }
    // 3) 左右の空いている方に、入る幅で置く(対象に重ならないように)
    const spaceR = vw - (hole.x + hole.w) - gap - 12;
    const spaceL = hole.x - gap - 12;
    const top = clampTop(hole.y + hole.h / 2 - h / 2);
    if (Math.max(spaceL, spaceR) >= 260) {
      const w = Math.min(W, Math.max(spaceL, spaceR));
      const left = spaceR >= spaceL ? hole.x + hole.w + gap : hole.x - gap - w;
      setPos({ left, top, w });
      return;
    }
    // 4) どこにも入らない → 画面の下端に寄せる
    setPos({ left: Math.min(Math.max(12, hole.x + hole.w / 2 - W / 2), vw - W - 12), top: vh - h - 12, w: W });
  }, [hole?.x, hole?.y, hole?.w, hole?.h, index, missing, vw, vh, mobile, W, bh, expanded]);

  const missionSteps = STEPS.filter((s) => s.mission === step.mission && s.kind !== "intro");
  const stepNo = missionSteps.indexOf(step) + 1;
  const ActionIcon = step.kind === "input" ? PencilLine : MousePointerClick;

  return (
    <motion.div
      ref={ref}
      key={index}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: pos ? 1 : 0, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="absolute overflow-hidden rounded-xl bg-white shadow-[0_20px_60px_-15px_oklch(15%_0.04_262/0.55)]"
      style={{ left: pos?.left ?? -9999, top: pos?.top ?? 0, width: pos?.w ?? W, pointerEvents: "auto" }}
      role="dialog"
      aria-label="使い方ツアー"
    >
      {/* 進捗 */}
      <div className="flex items-center gap-3 bg-navy-900 px-4 py-2.5 text-white">
        <span className="shrink-0 text-[12px] font-semibold tracking-[0.12em] whitespace-nowrap">MISSION {step.mission + 1}</span>
        <span className="truncate text-[13px] text-white/75">{MISSIONS[step.mission]}</span>
        <button onClick={onSkip} className="ml-auto grid h-7 w-7 shrink-0 place-items-center rounded text-white/60 hover:bg-white/10 hover:text-white" aria-label="ツアーを終了">
          <X size={15} />
        </button>
      </div>
      <div className="h-1 bg-navy-100">
        <motion.div className="h-full bg-navy-500" initial={false} animate={{ width: `${(stepNo / missionSteps.length) * 100}%` }} />
      </div>

      <div className="flex gap-3.5 px-4 pt-4 pb-3">
        <Guide size={mobile ? 40 : 52} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[13px] font-semibold text-navy-600">案内係</span>
            <span className="tnum text-[12px] text-ink-400">
              {stepNo} / {missionSteps.length}
            </span>
          </div>
          {missing && onFallback ? (
            <>
              <div className="mt-1 text-[16px] font-semibold text-navy-900">{step.title}の画面を開きましょう</div>
              <p className="mt-1 text-[14px] leading-relaxed text-ink-700">下の「画面を開く」を押すと移動します。</p>
            </>
          ) : missing ? (
            <>
              <div className="mt-1 text-[16px] font-semibold text-navy-900">操作する場所が見つかりません</div>
              <p className="mt-1 text-[14px] leading-relaxed text-ink-700">
                画面が閉じたか、別の画面に移動したようです。このミッションを最初からやり直すか、次のミッションへ進んでください。
              </p>
            </>
          ) : (
            <>
              {step.title && <div className="mt-1 text-[16px] font-semibold text-navy-900">{step.title}</div>}
              {compact ? (
                <button onClick={() => setExpanded(true)} className="mt-1 text-[13px] text-navy-700 underline underline-offset-2">
                  くわしい説明を読む
                </button>
              ) : (
                <Typewriter key={index} text={step.text} />
              )}
            </>
          )}
        </div>
      </div>

      {!missing && step.hint && (step.kind === "click" || step.kind === "route" || step.kind === "input") && (
        <div className={"mx-4 mb-3 flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium " + (step.kind === "input" && ready ? "bg-ok-50 text-ok-700" : "bg-navy-50 text-navy-800")}>
          {step.kind === "input" && ready ? <Check size={15} /> : <ActionIcon size={15} />}
          {step.kind === "input" && ready ? "できました。「次へ」を押してください" : step.hint}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-ink-100 bg-ink-50 px-4 py-3">
        {missing && onFallback ? (
          <TourBtn onClick={onFallback}>
            画面を開く
            <ChevronRight size={15} />
          </TourBtn>
        ) : missing ? (
          <>
            <TourBtn variant="outline" onClick={onRestart}>
              <RotateCcw size={14} />
              やり直す
            </TourBtn>
            <TourBtn onClick={onSkipMission}>次のミッションへ</TourBtn>
          </>
        ) : step.kind === "info" ? (
          <TourBtn onClick={onNext}>
            次へ
            <ChevronRight size={15} />
          </TourBtn>
        ) : step.kind === "input" ? (
          <TourBtn onClick={onNext} disabled={!ready}>
            次へ
            <ChevronRight size={15} />
          </TourBtn>
        ) : (
          <span className="text-[12px] text-ink-400">ボタンを押すと自動で次へ進みます</span>
        )}
      </div>
    </motion.div>
  );
}

function TourBtn({
  children,
  variant = "primary",
  ...rest
}: { children: React.ReactNode; variant?: "primary" | "outline" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={
        "inline-flex h-10 items-center gap-1.5 rounded-md px-4 text-[14px] font-medium transition disabled:cursor-not-allowed disabled:opacity-40 " +
        (variant === "primary" ? "bg-navy-900 text-white hover:bg-navy-800" : "border border-ink-300 bg-white text-navy-900 hover:bg-navy-50")
      }
    >
      {children}
    </button>
  );
}

function Typewriter({ text }: { text: string }) {
  const reduce = useMemo(() => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches, []);
  const [n, setN] = useState(reduce ? text.length : 0);
  useEffect(() => {
    if (n >= text.length) return;
    const t = setTimeout(() => setN((x) => Math.min(text.length, x + 2)), 18);
    return () => clearTimeout(t);
  }, [n, text]);
  return (
    <p className="mt-1 min-h-[3em] cursor-default text-[15px] leading-relaxed text-ink-800" onClick={() => setN(text.length)}>
      {text.slice(0, n)}
      {n < text.length && <span className="tour-caret ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-navy-500" />}
    </p>
  );
}

/** 案内役(看板をモチーフにしたキャラクター) */
export function Guide({ size = 52 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" className="shrink-0" aria-hidden="true">
      <rect x="1" y="1" width="54" height="54" rx="12" className="fill-navy-50" />
      <rect x="9" y="11" width="38" height="25" rx="4" className="fill-navy-900" />
      <rect x="12" y="14" width="32" height="19" rx="2.5" className="fill-navy-800" />
      <circle cx="21.5" cy="23" r="3" className="fill-white" />
      <circle cx="34.5" cy="23" r="3" className="fill-white" />
      <circle cx="22.2" cy="23.4" r="1.4" className="fill-navy-900" />
      <circle cx="35.2" cy="23.4" r="1.4" className="fill-navy-900" />
      <path d="M24 28.5 Q28 31.5 32 28.5" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="26.5" y="36" width="3" height="11" className="fill-navy-400" />
      <rect x="19" y="46.5" width="18" height="2.5" rx="1.25" className="fill-navy-300" />
    </svg>
  );
}

// ======================= 中央カード =======================
function Welcome({ onStart, onLater }: { onStart: () => void; onLater: () => void }) {
  return (
    <>
      <div className="bg-navy-900 px-7 pt-8 pb-7 text-white">
        <div className="flex items-center gap-4">
          <Guide size={64} />
          <div>
            <div className="text-[12px] tracking-[0.2em] text-white/60">TUTORIAL</div>
            <div className="mt-1 font-serif text-[22px] font-semibold leading-snug">使い方ツアー</div>
          </div>
        </div>
      </div>
      <div className="px-7 py-6">
        <p className="text-[15px] leading-relaxed text-ink-800">
          はじめまして、案内係です。実際の画面を使って、操作を一緒に練習しましょう。5つのミッションを順番にクリアすれば、毎日の仕事に必要な操作はひと通り覚えられます。
        </p>
        <ol className="mt-5 space-y-2">
          {MISSIONS.map((m, k) => (
            <li key={m} className="flex items-center gap-3 text-[14px] text-ink-800">
              <span className="tnum grid h-6 w-6 shrink-0 place-items-center rounded-full border border-navy-200 text-[12px] font-semibold text-navy-700">{k + 1}</span>
              {m}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[13px] text-ink-500">所要時間は約5分です。練習で入力した内容は、あとで「デモデータを初期状態に戻す」で消せます。</p>
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-ink-100 bg-ink-50 px-7 py-4 sm:flex-row sm:justify-end">
        <TourBtn variant="outline" onClick={onLater}>
          あとで見る
        </TourBtn>
        <TourBtn onClick={onStart}>
          ツアーを始める
          <ChevronRight size={15} />
        </TourBtn>
      </div>
    </>
  );
}

function MissionIntro({ n, text, onStart, onQuit }: { n: number; text: string; onStart: () => void; onQuit: () => void }) {
  return (
    <>
      <div className="px-7 pt-7">
        <div className="flex items-center gap-1.5">
          {MISSIONS.map((_, k) => (
            <span key={k} className={"h-1.5 flex-1 rounded-full " + (k < n ? "bg-navy-900" : k === n ? "bg-navy-500" : "bg-ink-200")} />
          ))}
        </div>
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="mt-6 text-[13px] font-semibold tracking-[0.2em] text-navy-500">
          MISSION {n + 1} / {MISSIONS.length}
        </motion.div>
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 }} className="mt-1 font-serif text-[24px] font-semibold text-navy-900">
          {MISSIONS[n]}
        </motion.div>
        <div className="mt-4 flex gap-3.5 rounded-lg bg-navy-50 p-4">
          <Guide size={44} />
          <p className="text-[15px] leading-relaxed text-ink-800">{text}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between gap-2 border-t border-ink-100 bg-ink-50 px-7 py-4">
        <button onClick={onQuit} className="text-[13px] text-ink-500 hover:text-navy-900">
          ツアーを終了
        </button>
        <TourBtn onClick={onStart}>
          ミッション開始
          <ChevronRight size={15} />
        </TourBtn>
      </div>
    </>
  );
}

function Finish({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="relative overflow-hidden bg-navy-900 px-7 pt-9 pb-8 text-center text-white">
        <Sparks />
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} className="mx-auto w-fit">
          <Medal />
        </motion.div>
        <div className="mt-4 text-[12px] tracking-[0.25em] text-white/60">ALL MISSIONS CLEAR</div>
        <div className="mt-1 font-serif text-[24px] font-semibold">ツアー完了です</div>
      </div>
      <div className="px-7 py-6">
        <ul className="space-y-2">
          {MISSIONS.map((m, k) => (
            <motion.li
              key={m}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + k * 0.08 }}
              className="flex items-center gap-3 text-[14px] text-ink-800"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy-900 text-white">
                <Check size={13} />
              </span>
              {m}
            </motion.li>
          ))}
        </ul>
        <p className="mt-5 text-[14px] leading-relaxed text-ink-600">
          これで毎日の操作はひと通りできます。もう一度見たいときは、画面右上の「使い方ツアー」からいつでも始められます。
        </p>
      </div>
      <div className="flex justify-end border-t border-ink-100 bg-ink-50 px-7 py-4">
        <TourBtn onClick={onClose}>ホームへ戻る</TourBtn>
      </div>
    </>
  );
}

function Medal() {
  return (
    <svg width="84" height="96" viewBox="0 0 84 96" aria-hidden="true">
      <path d="M26 2 L42 34 L58 2 Z" className="fill-navy-400" />
      <path d="M30 2 L42 26 L54 2" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
      <circle cx="42" cy="60" r="32" className="fill-white" />
      <circle cx="42" cy="60" r="25" fill="none" className="stroke-navy-200" strokeWidth="2" />
      <path d="M30 60 L39 69 L55 51" fill="none" className="stroke-navy-900" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Sparks() {
  const dots = Array.from({ length: 14 }, (_, k) => k);
  return (
    <div className="pointer-events-none absolute inset-0">
      {dots.map((k) => (
        <motion.span
          key={k}
          className="absolute h-1.5 w-1.5 rounded-full bg-white/70"
          style={{ left: "50%", top: "45%" }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ x: Math.cos((k / 14) * Math.PI * 2) * (90 + (k % 3) * 30), y: Math.sin((k / 14) * Math.PI * 2) * (60 + (k % 2) * 25), opacity: [0, 1, 0] }}
          transition={{ duration: 1.2, delay: 0.15, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function QuitConfirm({ onCancel, onQuit }: { onCancel: () => void; onQuit: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-navy-950/40 p-4" style={{ pointerEvents: "auto" }}>
      <div className="w-full max-w-[380px] rounded-xl bg-white p-6 shadow-2xl">
        <div className="text-[16px] font-semibold text-navy-900">ツアーを終了しますか?</div>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-600">画面右上の「使い方ツアー」から、いつでも最初から始められます。</p>
        <div className="mt-5 flex justify-end gap-2">
          <TourBtn variant="outline" onClick={onCancel}>
            続ける
          </TourBtn>
          <TourBtn onClick={onQuit}>終了する</TourBtn>
        </div>
      </div>
    </div>
  );
}
