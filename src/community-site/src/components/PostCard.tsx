import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Heart, MessageCircle, Share2, Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../store";
import type { Post, User } from "../data/seed";
import { timeAgo, nf } from "../lib/format";
import { Avatar } from "./ui";

export default function PostCard({ post }: { post: Post }) {
  const users = useStore((s) => s.users);
  const meId = useStore((s) => s.currentUserId);
  const toggleLike = useStore((s) => s.toggleLike);
  const addComment = useStore((s) => s.addComment);
  const deletePost = useStore((s) => s.deletePost);

  const author = users.find((u) => u.id === post.authorId);
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState("");
  const [bump, setBump] = useState(false);

  if (!author) return null;
  const liked = post.likedBy.includes(meId);
  const isMine = post.authorId === meId;

  const userById = (id: string): User | undefined => users.find((u) => u.id === id);

  const onLike = () => {
    if (!liked) {
      setBump(true);
      setTimeout(() => setBump(false), 340);
    }
    toggleLike(post.id);
  };

  const submitComment = () => {
    if (!draft.trim()) return;
    addComment(post.id, draft);
    setDraft("");
    setShowComments(true);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="rounded-2xl border border-ink-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-start gap-3">
        <Link to={`/u/${author.id}`}>
          <Avatar user={author} size={44} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              to={`/u/${author.id}`}
              className="truncate font-semibold text-ink-900 hover:underline"
            >
              {author.name}
            </Link>
            <span className="truncate text-sm text-ink-400">@{author.handle}</span>
            <span className="text-ink-300">·</span>
            <span className="shrink-0 text-sm text-ink-400">{timeAgo(post.createdAt)}</span>
          </div>
          <span className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
            #{post.topic}
          </span>
        </div>
        {isMine && (
          <button
            onClick={() => {
              deletePost(post.id);
              toast.success("投稿を削除しました");
            }}
            className="rounded-full p-1.5 text-ink-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
            aria-label="削除"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-800">
        {post.body}
      </p>

      {/* アクションバー */}
      <div className="mt-4 flex items-center gap-1 border-t border-ink-100 pt-3">
        <button
          onClick={onLike}
          className={`group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
            liked ? "text-rose-500" : "text-ink-500 hover:bg-rose-50 hover:text-rose-500"
          }`}
        >
          <Heart
            size={18}
            className={`${liked ? "fill-rose-500" : ""} ${bump ? "pop" : ""}`}
          />
          <span className="tnum">{nf(post.likedBy.length)}</span>
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-600"
        >
          <MessageCircle size={18} />
          <span className="tnum">{nf(post.comments.length)}</span>
        </button>
        <button
          onClick={() => toast("投稿リンクをコピーしました", { icon: "🔗" })}
          className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-ink-500 transition-colors hover:bg-ink-100"
        >
          <Share2 size={17} />
          <span className="hidden sm:inline">シェア</span>
        </button>
      </div>

      {/* コメント欄 */}
      <AnimatePresence initial={false}>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3 border-t border-ink-100 pt-3">
              {post.comments.length === 0 && (
                <p className="text-sm text-ink-400">
                  まだコメントはありません。最初のひと言を送ってみましょう。
                </p>
              )}
              {post.comments.map((c) => {
                const cu = userById(c.authorId);
                if (!cu) return null;
                return (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <Link to={`/u/${cu.id}`}>
                      <Avatar user={cu} size={32} />
                    </Link>
                    <div className="min-w-0 flex-1 rounded-2xl bg-ink-50 px-3.5 py-2">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-ink-800">
                          {cu.name}
                        </span>
                        <span className="shrink-0 text-xs text-ink-400">
                          {timeAgo(c.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-ink-700">{c.body}</p>
                    </div>
                  </div>
                );
              })}

              {/* 入力 */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitComment()}
                  placeholder="コメントを書く…"
                  className="flex-1 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
                <button
                  onClick={submitComment}
                  disabled={!draft.trim()}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition-all hover:bg-brand-700 disabled:opacity-40"
                  aria-label="送信"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
