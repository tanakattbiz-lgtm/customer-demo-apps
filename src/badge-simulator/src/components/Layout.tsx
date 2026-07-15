import { type ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CircleDot, Plus, RotateCcw, Bell } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../store";
import { Button } from "./ui";

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const reset = useStore((s) => s.reset);
  const [confirming, setConfirming] = useState(false);
  const isList = pathname === "/" || pathname.startsWith("/designs");

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 border-b border-ink-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-500 text-white">
              <CircleDot size={18} />
            </span>
            <span className="text-[15px] font-bold tracking-tight text-ink-900">
              缶バッジデザインスタジオ
            </span>
          </Link>
          <span className="ml-1 hidden rounded-full bg-ink-100 px-2 py-0.5 text-[11px] text-ink-500 sm:inline">
            ○○缶バッジ工房 様 デモ
          </span>

          <nav className="ml-auto flex items-center gap-1">
            <Link
              to="/"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                isList ? "bg-brand-50 text-brand-700" : "text-ink-500 hover:bg-ink-100"
              }`}
            >
              マイデザイン
            </Link>
            <button
              onClick={() => toast("このデモでは省略しています", { description: "通知機能はモック対象外です" })}
              className="grid h-9 w-9 place-items-center rounded-lg text-ink-400 hover:bg-ink-100"
              aria-label="お知らせ"
            >
              <Bell size={18} />
            </button>
            <Link to="/editor/new" className="ml-1">
              <Button className="!py-1.5">
                <Plus size={16} /> 新規作成
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>

      <footer className="border-t border-ink-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 py-4 text-xs text-ink-400 sm:flex-row sm:items-center">
          <span>本画面は提案用のデモです。表示データはすべてダミーです。</span>
          {confirming ? (
            <span className="flex items-center gap-2">
              <span className="text-ink-500">初期データに戻しますか？</span>
              <button
                className="font-medium text-red-500 hover:underline"
                onClick={() => {
                  reset();
                  setConfirming(false);
                  toast.success("初期データに戻しました");
                }}
              >
                リセット実行
              </button>
              <button className="text-ink-400 hover:underline" onClick={() => setConfirming(false)}>
                キャンセル
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="flex items-center gap-1 text-ink-400 hover:text-ink-600"
            >
              <RotateCcw size={13} /> デモデータをリセット
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
