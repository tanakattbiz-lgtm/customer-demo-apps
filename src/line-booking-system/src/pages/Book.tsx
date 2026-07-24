import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  addDays,
  addMinutes,
  format,
  isBefore,
  isSameDay,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import { ja } from "date-fns/locale";
import {
  ArrowLeft,
  Bell,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  MessageCircle,
  Shield,
  Sparkles,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { BUSINESS, MENUS, menuById, type MenuId } from "../data/seed";
import { useStore } from "../store";
import { fakeApi } from "../lib/fakeApi";
import { PhoneFrame } from "../components/PhoneFrame";
import { Button, Field, inputCls, LINE_GREEN, tnum } from "../components/ui";

type Step = "intro" | "date" | "time" | "form" | "done";

// 指定日の 30 分刻みスロットを生成し、予約済み・過去枠を判定
function useSlots(date: Date | null, menuId: MenuId) {
  const reservations = useStore((s) => s.reservations);
  return useMemo(() => {
    if (!date) return [];
    const dur = menuById(menuId).durationMin;
    const now = new Date();
    const taken = reservations
      .filter((r) => r.status !== "キャンセル" && isSameDay(new Date(r.start), date))
      .map((r) => {
        const st = new Date(r.start);
        return [st, addMinutes(st, menuById(r.menuId).durationMin)] as const;
      });

    const slots: { time: Date; available: boolean }[] = [];
    let t = setMinutes(setHours(startOfDay(date), BUSINESS.startHour), 0);
    const end = setMinutes(setHours(startOfDay(date), BUSINESS.endHour), 0);
    while (isBefore(t, end)) {
      const slotEnd = addMinutes(t, dur);
      const overlaps = taken.some(([s, e]) => t < e && slotEnd > s);
      const past = isBefore(t, now);
      const overflow = isBefore(end, slotEnd) && slotEnd.getTime() !== end.getTime();
      slots.push({ time: t, available: !overlaps && !past && !overflow });
      t = addMinutes(t, BUSINESS.slotMin);
    }
    return slots;
  }, [date, menuId, reservations]);
}

export default function Book() {
  const addReservation = useStore((s) => s.addReservation);
  const settings = useStore((s) => s.settings);

  const [step, setStep] = useState<Step>("intro");
  const [menuId, setMenuId] = useState<MenuId>("free30");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [name, setName] = useState("");
  const [kana, setKana] = useState("");
  const [note, setNote] = useState("");
  const [agree, setAgree] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const menu = menuById(menuId);
  const slots = useSlots(date, menuId);

  const days = useMemo(
    () => Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i)),
    [],
  );

  const nameErr = touched && !name.trim() ? "お名前を入力してください" : "";
  const kanaErr =
    touched && kana && !/^[ぁ-んー\s]+$/.test(kana) ? "ひらがなで入力してください" : "";
  const canSubmit = name.trim() && !kanaErr && agree;

  const reset = () => {
    setStep("intro");
    setMenuId("free30");
    setDate(null);
    setTime(null);
    setName("");
    setKana("");
    setNote("");
    setAgree(false);
    setTouched(false);
  };

  const submit = async () => {
    setTouched(true);
    if (!canSubmit || !time) return;
    setSubmitting(true);
    await fakeApi(null, 900);
    addReservation({ name: name.trim(), kana: kana.trim(), menuId, start: time.toISOString(), note: note.trim() || undefined });
    setSubmitting(false);
    setStep("done");
    if (settings.linePush) toast.success("LINEにプッシュ通知を送信しました");
  };

  const iconFor = (id: MenuId) =>
    id === "online30" ? <Video size={18} /> : id === "paid60" ? <MessageCircle size={18} /> : <Sparkles size={18} />;

  return (
    <PhoneFrame>
      {/* ── ヘッダー(LINE 公式アカウント風) ── */}
      <header
        className="relative z-20 flex items-center gap-3 px-4 pt-8 pb-3 text-white sm:pt-9"
        style={{ backgroundColor: LINE_GREEN }}
      >
        {step !== "intro" && step !== "done" ? (
          <button
            onClick={() => setStep(step === "date" ? "intro" : step === "time" ? "date" : "time")}
            aria-label="戻る"
            className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-white/15"
          >
            <ArrowLeft size={18} />
          </button>
        ) : (
          <div className="grid h-9 w-9 place-items-center rounded-full bg-white/20">
            <MessageCircle size={18} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold">○○サロン 公式アカウント</div>
          <div className="flex items-center gap-1 text-[11px] text-white/85">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
            オンライン予約受付中
          </div>
        </div>
        <Link
          to="/"
          className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium transition hover:bg-white/25"
        >
          デモ終了
        </Link>
      </header>

      {/* ── 本体 ── */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22 }}
            className="min-h-full"
          >
            {step === "intro" && (
              <div>
                {/* ヒーロー */}
                <div className="bg-white px-5 pt-6 pb-7">
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{ backgroundColor: LINE_GREEN }}
                  >
                    <Sparkles size={13} /> 登録3日間限定
                  </div>
                  <h1 className="mt-3 text-2xl leading-snug font-bold text-slate-900">
                    30分無料相談を
                    <br />
                    ご予約いただけます
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    ご希望の日時をお選びください。予約後は自動で<b className="text-slate-700">カレンダー登録</b>と
                    <b className="text-slate-700">LINEでのお知らせ</b>が届きます。
                  </p>
                </div>

                {/* メニュー選択 */}
                <div className="px-5 py-5">
                  <div className="mb-2 text-xs font-semibold text-slate-500">相談メニューを選ぶ</div>
                  <div className="space-y-2.5">
                    {MENUS.map((m) => {
                      const active = menuId === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setMenuId(m.id)}
                          className={
                            "flex w-full items-start gap-3 rounded-2xl border-2 bg-white p-3.5 text-left transition " +
                            (active
                              ? "border-emerald-500 ring-2 ring-emerald-500/15"
                              : "border-slate-200 hover:border-slate-300")
                          }
                        >
                          <div
                            className={
                              "grid h-10 w-10 shrink-0 place-items-center rounded-xl " +
                              (active ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500")
                            }
                          >
                            {iconFor(m.id)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">{m.name}</span>
                              {m.badge && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                  {m.badge}
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 line-clamp-2 text-xs text-slate-500">{m.desc}</div>
                            <div className="mt-1.5 flex items-center gap-2 text-xs">
                              <span className="inline-flex items-center gap-1 text-slate-400">
                                <Clock size={12} />
                                {m.durationMin}分
                              </span>
                              <span className={"font-bold " + (m.price === 0 ? "text-emerald-600" : "text-slate-700")}>
                                {m.price === 0 ? "無料" : `¥${m.price.toLocaleString()}`}
                              </span>
                            </div>
                          </div>
                          <div
                            className={
                              "mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 " +
                              (active ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300")
                            }
                          >
                            {active && <Check size={12} strokeWidth={3} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="px-5 pb-6">
                  <Button variant="line" className="w-full" onClick={() => setStep("date")}>
                    日時を選ぶ <ChevronRight size={16} />
                  </Button>
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <Shield size={12} /> 30秒で完了・キャンセルも無料
                  </div>
                </div>
              </div>
            )}

            {step === "date" && (
              <div className="px-5 py-5">
                <StepTitle icon={<CalendarDays size={16} />} n={1} label="ご希望日を選ぶ" />
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {days.map((d) => {
                    const active = date && isSameDay(d, date);
                    const isToday = isSameDay(d, new Date());
                    const dow = d.getDay();
                    return (
                      <button
                        key={d.toISOString()}
                        onClick={() => {
                          setDate(d);
                          setTime(null);
                          setStep("time");
                        }}
                        className={
                          "flex flex-col items-center rounded-xl border py-2.5 transition " +
                          (active ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300")
                        }
                      >
                        <span
                          className={
                            "text-[10px] font-medium " +
                            (dow === 0 ? "text-rose-500" : dow === 6 ? "text-sky-500" : "text-slate-400")
                          }
                        >
                          {isToday ? "今日" : format(d, "E", { locale: ja })}
                        </span>
                        <span className={"text-lg font-bold " + tnum + " text-slate-800"}>{format(d, "d")}</span>
                        <span className="text-[10px] text-slate-400">{format(d, "M")}月</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === "time" && date && (
              <div className="px-5 py-5">
                <StepTitle icon={<Clock size={16} />} n={2} label="時間を選ぶ(30分刻み)" />
                <div className="mt-1.5 mb-3 text-sm font-medium text-slate-600">
                  {format(date, "M月d日(E)", { locale: ja })} ・ {menu.name}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((s) => (
                    <button
                      key={s.time.toISOString()}
                      disabled={!s.available}
                      onClick={() => {
                        setTime(s.time);
                        setStep("form");
                      }}
                      className={
                        "rounded-xl border py-2.5 text-sm font-semibold transition " +
                        tnum +
                        " " +
                        (s.available
                          ? "border-emerald-200 bg-white text-emerald-700 hover:border-emerald-500 hover:bg-emerald-50"
                          : "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-300 line-through")
                      }
                    >
                      {format(s.time, "HH:mm")}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded border border-emerald-200 bg-white" /> 空き
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded bg-slate-200" /> 予約済み
                  </span>
                </div>
              </div>
            )}

            {step === "form" && date && time && (
              <div className="px-5 py-5">
                <StepTitle icon={<MessageCircle size={16} />} n={3} label="お客様情報" />
                {/* 選択内容サマリ */}
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <CalendarCheck size={16} className="text-emerald-600" />
                    {format(time, "M月d日(E) HH:mm", { locale: ja })}〜
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {menu.name}・{menu.durationMin}分・{menu.price === 0 ? "無料" : `¥${menu.price.toLocaleString()}`}
                  </div>
                </div>

                <div className="mt-4 space-y-3.5">
                  <Field label="お名前" required error={nameErr}>
                    <input
                      className={inputCls}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="例)山田 花子"
                    />
                  </Field>
                  <Field label="ふりがな" error={kanaErr}>
                    <input
                      className={inputCls}
                      value={kana}
                      onChange={(e) => setKana(e.target.value)}
                      placeholder="やまだ はなこ"
                    />
                  </Field>
                  <Field label="相談したいこと" hint="任意・当日の参考にします">
                    <textarea
                      className={inputCls + " min-h-[76px] resize-none"}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="例)SNS集客について相談したいです"
                    />
                  </Field>
                  <label className="flex items-start gap-2.5 rounded-xl bg-slate-100 p-3 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-emerald-600"
                    />
                    <span>
                      予約内容の確認・リマインドを<b>LINEのメッセージ</b>で受け取ることに同意します。
                    </span>
                  </label>
                </div>

                <div className="mt-5">
                  <Button variant="line" className="w-full" loading={submitting} onClick={submit}>
                    {submitting ? "予約を確定しています…" : "この内容で予約する"}
                  </Button>
                  {touched && !canSubmit && !submitting && (
                    <div className="mt-2 text-center text-xs text-rose-600">
                      お名前の入力と同意のチェックが必要です
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === "done" && time && (
              <DoneScreen
                name={name}
                time={time}
                menuName={menu.name}
                provider={settings.calendarProvider}
                onReset={reset}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </PhoneFrame>
  );
}

function StepTitle({ icon, n, label }: { icon: React.ReactNode; n: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-emerald-600">{icon}</span>
      <div>
        <div className="text-[11px] font-medium text-slate-400">STEP {n} / 3</div>
        <div className="text-base font-bold text-slate-900">{label}</div>
      </div>
    </div>
  );
}

function DoneScreen({
  name,
  time,
  menuName,
  provider,
  onReset,
}: {
  name: string;
  time: Date;
  menuName: string;
  provider: "google" | "zoom" | "timerex";
  onReset: () => void;
}) {
  const providerLabel = provider === "google" ? "Googleカレンダー" : provider === "zoom" ? "ZOOM" : "TimeRex";
  return (
    <div className="px-5 py-8">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="mx-auto grid h-20 w-20 place-items-center rounded-full text-white"
        style={{ backgroundColor: LINE_GREEN }}
      >
        <Check size={40} strokeWidth={3} />
      </motion.div>
      <h2 className="mt-5 text-center text-xl font-bold text-slate-900">ご予約が完了しました</h2>
      <p className="mt-1 text-center text-sm text-slate-500">
        {name.trim() || "お客様"}さま、ありがとうございます
      </p>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
        <Row label="日時" value={format(time, "M月d日(E) HH:mm", { locale: ja })} />
        <Row label="メニュー" value={menuName} />
      </div>

      {/* 自動処理の可視化(この案件の核心:通知・連携が確実に動く) */}
      <div className="mt-4 space-y-2">
        <AutoStep icon={<CalendarCheck size={15} />} text={`${providerLabel} に予定を自動登録しました`} />
        <AutoStep icon={<Bell size={15} />} text="LINEに予約確定のお知らせを送信しました" />
        <AutoStep icon={<Clock size={15} />} text="前日・1時間前にリマインドを自動送信します" />
      </div>

      {/* 疑似 LINE プッシュ通知カード */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-5 flex items-start gap-3 rounded-2xl bg-slate-900 p-3.5 text-white shadow-lg"
      >
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: LINE_GREEN }}>
          <MessageCircle size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold">○○サロン</span>
            <span className="text-[10px] text-white/50">今</span>
          </div>
          <div className="mt-0.5 text-xs leading-relaxed text-white/85">
            ご予約ありがとうございます。{format(time, "M/d HH:mm", { locale: ja })}〜「{menuName}」で承りました🌿
          </div>
        </div>
      </motion.div>

      <div className="mt-6">
        <Button variant="outline" className="w-full" onClick={onReset}>
          別の日程でもう一度予約する
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function AutoStep({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 px-3.5 py-2.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">{icon}</span>
      <span className="text-xs font-medium text-emerald-800">{text}</span>
      <Check size={14} className="ml-auto text-emerald-600" strokeWidth={3} />
    </div>
  );
}
