/**
 * 操作ガイド(オンボーディング)。
 * 実際の画面上で操作対象のみを強調表示し、手順を順に案内する。
 * 対象のボタンを押す・入力するなど、実際に操作すると次の手順へ進む。
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate, type NavigateFunction } from "react-router-dom";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, Check, ChevronRight, MousePointerClick, PencilLine, RotateCcw, X } from "lucide-react";
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

const SECTIONS = [
  "画面構成",
  "営業活動の記録",
  "空き枠の検索と仮押さえ",
  "成約登録と管理部への提出",
  "経営指標の確認",
];

const q = (sel: string) => document.querySelector(sel);
const valueOf = (t: string) => (q(`[data-tour="${t}"]`) as HTMLInputElement | null)?.value?.trim() ?? "";
const gone = (t: string) => () => !q(`[data-tour="${t}"]`);

const HINT_CLICK = "強調表示されているボタンを押してください";
const HINT_MENU = "強調表示されているメニューを押してください";

const STEPS: Step[] = [
  { mission: -1, kind: "welcome", text: "", enter: (nav) => nav("/") },
  // ---- 1. 画面構成 ----
  { mission: 0, kind: "intro", text: "メニューとホーム画面の構成をご説明します。", enter: (nav) => nav("/") },
  {
    mission: 0,
    kind: "info",
    target: "nav",
    title: "メニュー",
    text: "画面左側のメニューから各機能へ移動します。スマートフォンでは、左上のボタンからメニューを開きます。",
  },
  {
    mission: 0,
    kind: "info",
    target: "home-todo",
    title: "本日の対応事項",
    text: "期限を過ぎた対応、本日予定の対応、期限が近い仮押さえなど、本日確認すべき事項がまとめて表示されます。",
  },
  {
    mission: 0,
    kind: "info",
    target: "home-tiles",
    title: "主な操作",
    text: "よく使う操作へは、こちらから直接移動できます。",
  },
  // ---- 2. 営業活動の記録 ----
  {
    mission: 1,
    kind: "intro",
    text: "お客様への訪問・電話などの対応内容を記録し、次回の対応予定を設定する手順です。",
    enter: (nav) => nav("/"),
  },
  {
    mission: 1,
    kind: "click",
    target: "home-log",
    title: "対応の記録",
    text: "「対応したら記録する」を押して、記録画面を開きます。",
    hint: HINT_CLICK,
  },
  {
    mission: 1,
    kind: "input",
    target: "act-memo",
    title: "対応内容の入力",
    text: "お客様とのやり取りの内容を入力します。(入力例: 電話にて掲載時期を確認)",
    hint: "対応内容を入力してください",
    done: () => valueOf("act-memo").length >= 4,
  },
  {
    mission: 1,
    kind: "input",
    target: "act-next",
    title: "次回対応の設定",
    text: "次回の対応内容を入力します。予定日には初期値として1週間後が設定されています。(入力例: 見積書を送付)",
    hint: "次回の対応内容を入力してください",
    done: () => valueOf("act-next").length >= 2,
  },
  {
    mission: 1,
    kind: "click",
    target: "act-submit",
    title: "記録の保存",
    text: "「記録する」を押すと保存され、次回対応が「やること一覧」に反映されます。",
    hint: HINT_CLICK,
    waitFor: gone("act-submit"),
  },
  // ---- 3. 空き枠の検索と仮押さえ ----
  {
    mission: 2,
    kind: "intro",
    text: "お客様の希望時期に空いている広告面を検索し、仮押さえ(一時確保)を行う手順です。",
  },
  {
    mission: 2,
    kind: "route",
    target: "nav-boards|nav",
    route: "/boards",
    fallbackNav: "/boards",
    title: "看板の空きを探す",
    text: "メニューの「看板の空きを探す」を押します。スマートフォンでは、先に左上のボタンでメニューを開きます。",
    hint: HINT_MENU,
  },
  {
    mission: 2,
    kind: "info",
    target: "find-form",
    title: "検索条件",
    text: "エリア・看板の種類・掲載開始月・掲載期間を指定すると、条件に合う空き面が一覧表示されます。ここでは初期条件のまま進めます。",
  },
  {
    mission: 2,
    kind: "click",
    target: "hold-btn",
    title: "仮押さえ",
    text: "一覧から広告面を選び、「この面を仮押さえする」を押します。",
    hint: HINT_CLICK,
  },
  {
    mission: 2,
    kind: "input",
    target: "hold-deal",
    title: "対象商談の選択",
    text: "仮押さえの対象となる商談を一覧から選択します。",
    hint: "商談を選択してください",
    done: () => valueOf("hold-deal") !== "",
  },
  {
    mission: 2,
    kind: "click",
    target: "hold-submit",
    title: "仮押さえの確定",
    text: "「仮押さえする」を押すと、設定した期限まで、他の担当者はこの面を確保できなくなります。",
    hint: HINT_CLICK,
    waitFor: gone("hold-submit"),
  },
  // ---- 4. 成約登録と管理部への提出 ----
  {
    mission: 3,
    kind: "intro",
    text: "お客様の合意後、契約内容と契約書類を登録し、管理部へ提出する手順です。先ほど仮押さえを行った商談の画面を開きます。",
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
    title: "次の対応の表示",
    text: "商談画面の上部には、商談の状況に応じて次に行う操作が表示されます。",
  },
  {
    mission: 3,
    kind: "click",
    target: "next-step-btn",
    title: "成約登録",
    text: "「成約を登録する」を押します。",
    hint: HINT_CLICK,
  },
  {
    mission: 3,
    kind: "info",
    target: "wizard-steps",
    title: "登録の手順",
    text: "成約登録は「掲載内容」「書類の添付」「確認して提出」の3段階で行います。掲載内容には、仮押さえの情報が初期値として入力されています。",
  },
  {
    mission: 3,
    kind: "click",
    target: "wizard-next",
    title: "掲載内容の確認",
    text: "内容を確認し、「次へ進む」を押します。",
    hint: HINT_CLICK,
  },
  {
    mission: 3,
    kind: "input",
    target: "wizard-docs",
    title: "書類の添付",
    text: "「必須」の書類2点を添付します。通常はファイルを選択しますが、このデモでは「サンプルを添付」で代用できます。",
    hint: "必須書類を2点添付してください",
    done: () => document.querySelectorAll('[data-required="true"][data-attached="true"]').length >= 2,
  },
  {
    mission: 3,
    kind: "click",
    target: "wizard-next",
    title: "確認画面へ",
    text: "「次へ進む」を押して、確認画面に進みます。",
    hint: HINT_CLICK,
  },
  {
    mission: 3,
    kind: "click",
    target: "wizard-submit",
    title: "管理部への提出",
    text: "「この内容で管理部へ提出する」を押すと、管理部へ書類確認を依頼します。確認状況は「管理部への書類提出」で確認できます。",
    hint: HINT_CLICK,
    waitFor: gone("wizard-submit"),
  },
  // ---- 5. 経営指標の確認 ----
  { mission: 4, kind: "intro", text: "経営向けの集計画面をご説明します。" },
  {
    mission: 4,
    kind: "route",
    target: "nav-dashboard|nav",
    route: "/dashboard",
    fallbackNav: "/dashboard",
    title: "会社全体の数字",
    text: "メニューの「会社全体の数字」を押します。スマートフォンでは、先に左上のボタンでメニューを開きます。",
    hint: HINT_MENU,
  },
  {
    mission: 4,
    kind: "info",
    target: "kpi",
    title: "主要指標",
    text: "当月の新規契約・解約・稼働率・売上見込みなどを表示します。各項目の「?」から指標の定義を確認できます。先ほど提出した契約も、新規契約数に反映されています。",
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

  // Escキーなどでモーダルを閉じても止まらないよう、ガイド中はEscを無効化
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
  const restartSection = () => {
    const first = STEPS.findIndex((s) => s.mission === step.mission && s.kind === "intro");
    document.querySelectorAll<HTMLElement>('[role="dialog"] button[aria-label="閉じる"]').forEach((b) => b.click());
    setRetry((r) => r + 1);
    go(first >= 0 ? first : i);
  };
  const skipSection = () => {
    const nextIntro = STEPS.findIndex((s, k) => k > i && s.mission > step.mission);
    document.querySelectorAll<HTMLElement>('[role="dialog"] button[aria-label="閉じる"]').forEach((b) => b.click());
    go(nextIntro >= 0 ? nextIntro : STEPS.length - 1);
  };

  // 中央表示のカード
  if (step.kind === "welcome" || step.kind === "intro" || step.kind === "finish") {
    return (
      <div className="fixed inset-0 z-[80] grid place-items-center bg-navy-950/50 p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-[520px] overflow-hidden rounded-lg bg-white shadow-[0_24px_60px_-20px_oklch(15%_0.04_262/0.5)]"
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
            {step.kind === "intro" && <SectionIntro n={step.mission} text={step.text} onStart={next} onQuit={() => setConfirmSkip(true)} />}
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
            {!blocking && <span className="tour-ring absolute -inset-1 rounded-[10px] border-2 border-white/90" />}
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
        onRestart={restartSection}
        onSkipSection={skipSection}
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
  onSkipSection,
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
  onSkipSection: () => void;
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

  const sectionSteps = STEPS.filter((s) => s.mission === step.mission && s.kind !== "intro");
  const stepNo = sectionSteps.indexOf(step) + 1;
  const ActionIcon = step.kind === "input" ? PencilLine : MousePointerClick;

  return (
    <motion.div
      ref={ref}
      key={index}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: pos ? 1 : 0, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute overflow-hidden rounded-lg border border-ink-200 bg-white shadow-[0_18px_48px_-14px_oklch(15%_0.04_262/0.45)]"
      style={{ left: pos?.left ?? -9999, top: pos?.top ?? 0, width: pos?.w ?? W, pointerEvents: "auto" }}
      role="dialog"
      aria-label="操作ガイド"
    >
      {/* 見出し・進捗 */}
      <div className="flex items-center gap-2 border-b border-ink-200 px-4 py-2.5">
        <BookOpen size={15} className="shrink-0 text-navy-600" />
        <span className="truncate text-[13px] text-ink-600">
          操作ガイド
          <span className="mx-1.5 text-ink-300">|</span>
          <span className="tnum">{step.mission + 1}.</span> {SECTIONS[step.mission]}
        </span>
        <span className="tnum ml-auto shrink-0 text-[12px] text-ink-400">
          {stepNo} / {sectionSteps.length}
        </span>
        <button onClick={onSkip} className="grid h-7 w-7 shrink-0 place-items-center rounded text-ink-400 hover:bg-ink-100 hover:text-navy-900" aria-label="操作ガイドを終了">
          <X size={15} />
        </button>
      </div>
      <div className="h-[3px] bg-ink-100">
        <motion.div className="h-full bg-navy-900" initial={false} animate={{ width: `${(stepNo / sectionSteps.length) * 100}%` }} />
      </div>

      <div className="px-4 pt-3.5 pb-3">
        {missing && onFallback ? (
          <>
            <div className="text-[16px] font-semibold text-navy-900">「{step.title}」の画面を開きます</div>
            <p className="mt-1 text-[14px] leading-relaxed text-ink-700">下の「画面を開く」から移動してください。</p>
          </>
        ) : missing ? (
          <>
            <div className="text-[16px] font-semibold text-navy-900">対象の項目が表示されていません</div>
            <p className="mt-1 text-[14px] leading-relaxed text-ink-700">
              画面が閉じられたか、別の画面に移動した可能性があります。この項目を最初からやり直すか、次の項目へ進んでください。
            </p>
          </>
        ) : (
          <>
            {step.title && <div className="text-[16px] font-semibold text-navy-900">{step.title}</div>}
            {compact ? (
              <button onClick={() => setExpanded(true)} className="mt-1 text-[13px] text-navy-700 underline underline-offset-2">
                説明を表示
              </button>
            ) : (
              <p className="mt-1 text-[14.5px] leading-relaxed text-ink-700">{step.text}</p>
            )}
          </>
        )}
      </div>

      {!missing && step.hint && (step.kind === "click" || step.kind === "route" || step.kind === "input") && (
        <div
          className={
            "mx-4 mb-3 flex items-center gap-2 rounded-md border px-3 py-2 text-[13px] " +
            (step.kind === "input" && ready ? "border-ok-600/25 bg-ok-50 text-ok-700" : "border-navy-100 bg-navy-50 text-navy-800")
          }
        >
          {step.kind === "input" && ready ? <Check size={15} /> : <ActionIcon size={15} />}
          {step.kind === "input" && ready ? "入力を確認しました。「次へ」を押してください" : step.hint}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-ink-100 bg-ink-50 px-4 py-2.5">
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
            <TourBtn onClick={onSkipSection}>次の項目へ</TourBtn>
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
          <span className="text-[12px] text-ink-500">操作すると、次の手順に進みます</span>
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

// ======================= 中央カード =======================
function Welcome({ onStart, onLater }: { onStart: () => void; onLater: () => void }) {
  return (
    <>
      <div className="px-7 pt-7">
        <div className="flex items-center gap-2 text-[13px] font-medium text-navy-600">
          <BookOpen size={16} />
          操作ガイド
        </div>
        <div className="mt-2 font-serif text-[22px] font-semibold leading-snug text-navy-900">本システムの基本操作をご案内します</div>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-700">
          実際の画面上で、日々の業務に必要な操作を順にご案内します。所要時間は約5分です。
        </p>
        <ol className="mt-5 divide-y divide-ink-100 rounded-md border border-ink-200">
          {SECTIONS.map((m, k) => (
            <li key={m} className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-ink-800">
              <span className="tnum w-4 text-right text-[13px] font-semibold text-navy-600">{k + 1}</span>
              {m}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[13px] leading-relaxed text-ink-500">
          ガイド中に登録したデータは、サイドバー下部の「デモデータを初期状態に戻す」で元に戻せます。
        </p>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-2 border-t border-ink-100 bg-ink-50 px-7 py-4 sm:flex-row sm:justify-end">
        <TourBtn variant="outline" onClick={onLater}>
          後で確認する
        </TourBtn>
        <TourBtn onClick={onStart}>
          ガイドを開始する
          <ChevronRight size={15} />
        </TourBtn>
      </div>
    </>
  );
}

function SectionIntro({ n, text, onStart, onQuit }: { n: number; text: string; onStart: () => void; onQuit: () => void }) {
  return (
    <>
      <div className="px-7 pt-6">
        <div className="flex items-center justify-between text-[13px] text-ink-500">
          <span className="flex items-center gap-2 font-medium text-navy-600">
            <BookOpen size={15} />
            操作ガイド
          </span>
          <span className="tnum">
            {n + 1} / {SECTIONS.length}
          </span>
        </div>
        <div className="mt-3 flex gap-1">
          {SECTIONS.map((_, k) => (
            <span key={k} className={"h-1 flex-1 rounded-full " + (k <= n ? "bg-navy-900" : "bg-ink-200")} />
          ))}
        </div>
        <div className="mt-5 text-[22px] font-semibold text-navy-900">
          <span className="tnum mr-2 text-navy-500">{n + 1}.</span>
          {SECTIONS[n]}
        </div>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-700">{text}</p>
      </div>
      <div className="mt-6 flex items-center justify-between gap-2 border-t border-ink-100 bg-ink-50 px-7 py-4">
        <button onClick={onQuit} className="text-[13px] text-ink-500 hover:text-navy-900">
          ガイドを終了
        </button>
        <TourBtn onClick={onStart}>
          開始する
          <ChevronRight size={15} />
        </TourBtn>
      </div>
    </>
  );
}

function Finish({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="px-7 pt-7">
        <div className="flex items-center gap-2 text-[13px] font-medium text-navy-600">
          <BookOpen size={16} />
          操作ガイド
        </div>
        <div className="mt-2 font-serif text-[22px] font-semibold text-navy-900">基本操作のご案内は以上です</div>
        <ul className="mt-5 divide-y divide-ink-100 rounded-md border border-ink-200">
          {SECTIONS.map((m) => (
            <li key={m} className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-ink-800">
              <Check size={16} className="shrink-0 text-ok-600" />
              {m}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[14px] leading-relaxed text-ink-600">
          画面右上の「操作ガイド」から、いつでも再度ご確認いただけます。各画面の「この画面の使い方」もあわせてご活用ください。
        </p>
      </div>
      <div className="mt-6 flex justify-end border-t border-ink-100 bg-ink-50 px-7 py-4">
        <TourBtn onClick={onClose}>ホームに戻る</TourBtn>
      </div>
    </>
  );
}

function QuitConfirm({ onCancel, onQuit }: { onCancel: () => void; onQuit: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-navy-950/40 p-4" style={{ pointerEvents: "auto" }}>
      <div className="w-full max-w-[400px] rounded-lg bg-white p-6 shadow-2xl">
        <div className="text-[16px] font-semibold text-navy-900">操作ガイドを終了しますか</div>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-600">画面右上の「操作ガイド」から、いつでも最初から再開できます。</p>
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
