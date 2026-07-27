import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles, Headset, BookOpen, User, Star, Monitor } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../store";
import { Card, Pill, Button, EmptyState } from "../components/ui";
import { clock, fullDate, statusTone } from "../lib/format";
import { useLoad } from "../lib/useLoad";
import { Skeleton } from "../components/ui";

export function LogDetail() {
  const { id } = useParams();
  const session = useStore((s) => s.sessions.find((x) => x.id === id));
  const kb = useStore((s) => s.kb);
  const setStatus = useStore((s) => s.setSessionStatus);
  const loading = useLoad([id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-4 lg:p-8">
        <Skeleton className="h-6 w-40 rounded" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl p-4 lg:p-8">
        <Card>
          <EmptyState
            icon={<Monitor size={26} />}
            title="会話が見つかりません"
            description="削除されたか、初期化された可能性があります。"
            action={
              <Link to="/logs">
                <Button variant="outline">会話ログへ戻る</Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  const kbById = (kid: string) => kb.find((a) => a.id === kid);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 lg:p-8">
      <Link
        to="/logs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition hover:text-ink-800"
      >
        <ArrowLeft size={16} /> 会話ログ一覧へ
      </Link>

      {/* セッション情報 */}
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-ink-100 text-ink-500">
              <User size={20} />
            </div>
            <div>
              <div className="text-base font-bold text-ink-900">{session.visitor}</div>
              <div className="text-xs text-ink-400">
                {session.channel} ・ {fullDate(session.startedAt)} 開始
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {session.rating && (
              <Pill tone="amber">
                <Star size={12} /> {session.rating}.0
              </Pill>
            )}
            <Pill tone={statusTone(session.status)}>{session.status}</Pill>
          </div>
        </div>
      </Card>

      {/* トランスクリプト */}
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-ink-400">
          <span className="h-px flex-1 bg-ink-100" />
          会話の記録
          <span className="h-px flex-1 bg-ink-100" />
        </div>
        <div className="space-y-4">
          {session.messages.map((m) => {
            if (m.role === "user") {
              return (
                <div key={m.id} className="flex justify-end gap-2">
                  <div className="max-w-[80%]">
                    <div className="rounded-2xl rounded-tr-sm bg-brand-600 px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-white">
                      {m.text}
                    </div>
                    <div className="mt-1 text-right text-[11px] text-ink-400">{clock(m.at)}</div>
                  </div>
                </div>
              );
            }
            const isAgent = m.role === "agent";
            return (
              <div key={m.id} className="flex gap-2">
                <div
                  className={
                    "grid h-8 w-8 shrink-0 place-items-center self-end rounded-full text-white " +
                    (isAgent ? "bg-emerald-500" : "bg-gradient-to-br from-brand-500 to-brand-700")
                  }
                >
                  {isAgent ? <Headset size={15} /> : <Sparkles size={15} />}
                </div>
                <div className="max-w-[82%]">
                  <div className="mb-0.5 text-[11px] font-medium text-ink-400">
                    {isAgent ? "オペレーター" : "AIアシスタント"}
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-ink-100 px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-ink-800">
                    {m.text}
                  </div>
                  {m.sourceIds && m.sourceIds.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-400">
                        <BookOpen size={11} /> 参照した知識
                      </span>
                      {m.sourceIds.map((sid) => {
                        const a = kbById(sid);
                        if (!a) return null;
                        return (
                          <Link
                            key={sid}
                            to="/knowledge"
                            className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] text-brand-700 transition hover:bg-brand-100"
                          >
                            {a.question}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-1 text-[11px] text-ink-400">{clock(m.at)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 運用アクション */}
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="text-sm text-ink-500">このセッションのステータスを更新</div>
        <div className="flex gap-2">
          {session.status !== "解決済み" && (
            <Button
              variant="outline"
              onClick={() => {
                setStatus(session.id, "解決済み");
                toast.success("解決済みにしました");
              }}
            >
              解決済みにする
            </Button>
          )}
          {session.status !== "有人対応" && (
            <Button
              onClick={() => {
                setStatus(session.id, "有人対応");
                toast.success("有人対応に切り替えました");
              }}
            >
              <Headset size={15} /> 有人対応へ
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
