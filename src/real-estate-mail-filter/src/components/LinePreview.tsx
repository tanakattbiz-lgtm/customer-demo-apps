import { format } from "date-fns";
import { MessageSquare } from "lucide-react";

/**
 * LINE通知のプレビュー。実際に送られるメッセージ本文をそのまま表示する。
 * (デモのため送信は行わない)
 */
export function LinePreview({
  message,
  at,
  compact = false,
}: {
  message: string;
  at?: Date;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-xl bg-[oklch(93%_0.012_240)] ${compact ? "p-3" : "p-4"}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-line-500 text-white">
          <MessageSquare size={12} />
        </span>
        <span className="text-[11px] font-medium text-ink-600">物件通知ボット</span>
      </div>
      <div className="flex items-end gap-1.5">
        <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
          <p className="whitespace-pre-wrap break-words text-[12px] leading-relaxed text-ink-800">
            {message}
          </p>
        </div>
        <span className="tnum shrink-0 pb-0.5 text-[10px] text-ink-400">
          {format(at ?? new Date(), "HH:mm")}
        </span>
      </div>
    </div>
  );
}
