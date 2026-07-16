import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ImagePlus, Smile, MapPin, Sparkles, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useStore, useCurrentUser, followerCount } from "../store";
import { useLoad } from "../lib/useLoad";
import { fakeApi } from "../lib/fakeApi";
import { nf } from "../lib/format";
import { TRENDING_TOPICS } from "../data/seed";
import { Avatar, Button, Card, PostSkeleton } from "../components/ui";
import PostCard from "../components/PostCard";

type Tab = "all" | "following";

export default function Feed() {
  const loading = useLoad();
  const posts = useStore((s) => s.posts);
  const users = useStore((s) => s.users);
  const me = useCurrentUser();
  const addPost = useStore((s) => s.addPost);
  const toggleFollow = useStore((s) => s.toggleFollow);

  const [tab, setTab] = useState<Tab>("all");
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState("");
  const [posting, setPosting] = useState(false);

  const visible = useMemo(() => {
    if (tab === "all") return posts;
    const ids = new Set([...me.followingIds, me.id]);
    return posts.filter((p) => ids.has(p.authorId));
  }, [posts, tab, me]);

  const suggestions = useMemo(
    () => users.filter((u) => u.id !== me.id && !me.followingIds.includes(u.id)).slice(0, 3),
    [users, me],
  );

  const submit = async () => {
    if (!body.trim()) return;
    setPosting(true);
    await fakeApi(true, 600);
    addPost(body, topic);
    setBody("");
    setTopic("");
    setPosting(false);
    toast.success("投稿しました");
  };

  const overLimit = body.length > 280;

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_260px]">
      {/* 左サイドバー */}
      <aside className="hidden lg:block">
        <div className="sticky top-20 space-y-4">
          <Card className="overflow-hidden">
            <div className="h-14 bg-gradient-to-r from-brand-400 to-brand-600" />
            <div className="px-4 pb-4">
              <div className="-mt-7">
                <Avatar user={me} size={54} ring />
              </div>
              <Link
                to={`/u/${me.id}`}
                className="mt-2 block truncate font-semibold text-ink-900 hover:underline"
              >
                {me.name}
              </Link>
              <p className="truncate text-xs text-ink-400">@{me.handle}</p>
              <div className="mt-3 flex gap-4 text-sm">
                <div>
                  <span className="font-bold text-ink-900 tnum">{me.followingIds.length}</span>
                  <span className="ml-1 text-xs text-ink-400">フォロー</span>
                </div>
                <div>
                  <span className="font-bold text-ink-900 tnum">
                    {followerCount(users, me.id)}
                  </span>
                  <span className="ml-1 text-xs text-ink-400">フォロワー</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </aside>

      {/* 中央: タイムライン */}
      <div className="space-y-4">
        {/* 投稿コンポーザー */}
        <Card className="p-4">
          <div className="flex gap-3">
            <Avatar user={me} size={44} />
            <div className="flex-1">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="いま、どうしてる?好きなことをつぶやいてみましょう"
                rows={body ? 3 : 1}
                className="w-full resize-none bg-transparent pt-2.5 text-[15px] leading-relaxed outline-none placeholder:text-ink-400"
              />
              <AnimatePresence>
                {body && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <input
                      value={topic}
                      onChange={(e) => setTopic(e.target.value.replace(/[#\s]/g, ""))}
                      placeholder="コミュニティ / タグ(例:コーヒー)"
                      className="mt-2 w-full rounded-lg bg-ink-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-100"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="mt-3 flex items-center gap-1 border-t border-ink-100 pt-3">
                <IconBtn icon={<ImagePlus size={18} />} />
                <IconBtn icon={<Smile size={18} />} />
                <IconBtn icon={<MapPin size={18} />} />
                <span
                  className={`ml-auto mr-2 text-xs tnum ${
                    overLimit ? "text-rose-500" : "text-ink-400"
                  }`}
                >
                  {body.length}/280
                </span>
                <Button
                  size="sm"
                  onClick={submit}
                  loading={posting}
                  disabled={!body.trim() || overLimit}
                >
                  投稿する
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* フィルタタブ */}
        <div className="flex gap-1 rounded-full border border-ink-200 bg-white p-1">
          {(
            [
              { k: "all", label: "みんなの投稿" },
              { k: "following", label: "フォロー中" },
            ] as const
          ).map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`relative flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                tab === t.k ? "text-white" : "text-ink-500 hover:text-ink-700"
              }`}
            >
              {tab === t.k && (
                <motion.span
                  layoutId="feedtab"
                  className="absolute inset-0 rounded-full bg-brand-600"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>

        {/* 投稿一覧 */}
        {loading ? (
          <div className="space-y-4">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : visible.length === 0 ? (
          <Card className="px-6 py-14 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-500">
              <UserPlus size={26} />
            </div>
            <p className="mt-4 font-semibold text-ink-800">まだ投稿がありません</p>
            <p className="mt-1 text-sm text-ink-500">
              気になる仲間をフォローすると、ここにその人の投稿が並びます。
            </p>
            <Button variant="soft" size="sm" className="mt-4" onClick={() => setTab("all")}>
              みんなの投稿を見る
            </Button>
          </Card>
        ) : (
          <motion.div layout className="space-y-4">
            <AnimatePresence>
              {visible.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* 右サイドバー */}
      <aside className="hidden lg:block">
        <div className="sticky top-20 space-y-4">
          {/* おすすめの仲間 */}
          <Card className="p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-ink-800">
              <Sparkles size={15} className="text-brand-500" /> おすすめの仲間
            </h3>
            <div className="space-y-3">
              {suggestions.length === 0 && (
                <p className="text-xs text-ink-400">
                  みんなフォロー済みです!
                </p>
              )}
              {suggestions.map((u) => (
                <div key={u.id} className="flex items-center gap-2.5">
                  <Link to={`/u/${u.id}`}>
                    <Avatar user={u} size={38} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/u/${u.id}`}
                      className="block truncate text-sm font-semibold text-ink-800 hover:underline"
                    >
                      {u.name}
                    </Link>
                    <p className="truncate text-xs text-ink-400">{u.interests[0]} 好き</p>
                  </div>
                  <button
                    onClick={() => {
                      toggleFollow(u.id);
                      toast.success(`${u.name}さんをフォローしました`);
                    }}
                    className="flex shrink-0 items-center gap-1 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-700"
                  >
                    <UserPlus size={13} /> フォロー
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* トレンド */}
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-bold text-ink-800">人気のコミュニティ</h3>
            <div className="space-y-1">
              {TRENDING_TOPICS.map((t, i) => (
                <button
                  key={t.topic}
                  onClick={() => toast("このデモでは省略しています", { icon: "🛠️" })}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-ink-50"
                >
                  <div>
                    <p className="text-xs text-ink-400">#{i + 1}</p>
                    <p className="text-sm font-medium text-ink-800">#{t.topic}</p>
                  </div>
                  <span className="text-xs text-ink-400 tnum">{nf(t.count)}件</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </aside>
    </div>
  );
}

function IconBtn({ icon }: { icon: React.ReactNode }) {
  return (
    <button
      onClick={() => toast("このデモでは省略しています", { icon: "🛠️" })}
      className="rounded-full p-2 text-brand-500 transition-colors hover:bg-brand-50"
    >
      {icon}
    </button>
  );
}
