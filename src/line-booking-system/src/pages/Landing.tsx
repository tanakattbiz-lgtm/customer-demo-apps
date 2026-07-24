import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Bell, CalendarCheck, Clock, LayoutDashboard, MessageCircle, Smartphone } from "lucide-react";
import { LINE_GREEN } from "../components/ui";

const FEATURES = [
  { icon: <Clock size={16} />, title: "30分刻みの予約枠", desc: "空き状況をリアルタイム表示" },
  { icon: <CalendarCheck size={16} />, title: "カレンダー自動登録", desc: "Google / ZOOM / TimeRex" },
  { icon: <Bell size={16} />, title: "確実に届く通知", desc: "予約確定・リマインドを自動配信" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 to-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div
            className="mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold text-white shadow-sm"
            style={{ backgroundColor: LINE_GREEN }}
          >
            <MessageCircle size={16} /> LINE連携 予約・無料相談システム
          </div>
          <h1 className="mx-auto mt-5 max-w-2xl text-3xl leading-tight font-bold text-slate-900 sm:text-4xl">
            「30分無料相談」から予約まで、
            <br className="hidden sm:block" />
            LINEの中で完結する仕組み
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
            登録3日間限定の無料相談ボタンから、30分刻みの予約・カレンダー自動登録・確実なプッシュ通知までを一気通貫で。
            お客様の予約画面と、店舗の管理画面の両方をご確認いただけます。
          </p>
        </motion.div>

        {/* 機能ストリップ */}
        <div className="mx-auto mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-left"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">{f.icon}</span>
              <div className="mt-2.5 text-sm font-bold text-slate-900">{f.title}</div>
              <div className="text-xs text-slate-500">{f.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* 2つの入口 */}
        <div className="mx-auto mt-8 grid w-full max-w-3xl gap-4 sm:grid-cols-2">
          <EntryCard
            to="/book"
            tone="line"
            icon={<Smartphone size={22} />}
            eyebrow="お客様の画面"
            title="LINEから予約する"
            desc="スマホでそのまま。無料相談の日時を選んで予約する流れを体験できます。"
          />
          <EntryCard
            to="/admin"
            tone="dark"
            icon={<LayoutDashboard size={22} />}
            eyebrow="店舗の画面"
            title="管理画面を見る"
            desc="届いた予約の一覧、本日のスケジュール、通知の配信状況を確認できます。"
          />
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          ※ これは提案用のデモです。入力したデータはブラウザ内にのみ保存され、外部には送信されません。
        </p>
      </div>
    </div>
  );
}

function EntryCard({
  to,
  tone,
  icon,
  eyebrow,
  title,
  desc,
}: {
  to: string;
  tone: "line" | "dark";
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  desc: string;
}) {
  const isLine = tone === "line";
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span
        className="grid h-12 w-12 place-items-center rounded-2xl text-white"
        style={{ backgroundColor: isLine ? LINE_GREEN : "#0f172a" }}
      >
        {icon}
      </span>
      <div className="mt-4 text-xs font-semibold text-slate-400">{eyebrow}</div>
      <div className="mt-0.5 flex items-center gap-1.5 text-lg font-bold text-slate-900">
        {title}
        <ArrowRight size={18} className="transition group-hover:translate-x-1" />
      </div>
      <p className="mt-1.5 text-sm text-slate-500">{desc}</p>
    </Link>
  );
}
