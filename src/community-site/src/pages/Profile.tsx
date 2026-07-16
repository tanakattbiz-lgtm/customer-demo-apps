import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { MapPin, CalendarDays, UserPlus, UserCheck, Pencil, ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";
import { useStore, useCurrentUser, followerCount } from "../store";
import { useLoad } from "../lib/useLoad";
import { joinMonth, nf, avatarGradient } from "../lib/format";
import { Avatar, Button, Card, PostSkeleton } from "../components/ui";
import PostCard from "../components/PostCard";
import type { User } from "../data/seed";

export default function Profile() {
  const { id } = useParams();
  const loading = useLoad();
  const users = useStore((s) => s.users);
  const posts = useStore((s) => s.posts);
  const me = useCurrentUser();
  const toggleFollow = useStore((s) => s.toggleFollow);

  const user = users.find((u) => u.id === id);
  const isMe = user?.id === me.id;
  const isFollowing = user ? me.followingIds.includes(user.id) : false;

  const [tab, setTab] = useState<"posts" | "following">("posts");
  const [editing, setEditing] = useState(false);

  const userPosts = useMemo(
    () => posts.filter((p) => p.authorId === user?.id),
    [posts, user],
  );
  const followingUsers = useMemo(
    () =>
      user
        ? users.filter((u) => user.followingIds.includes(u.id))
        : [],
    [users, user],
  );

  if (!user) {
    return (
      <Card className="px-6 py-16 text-center">
        <p className="font-semibold text-ink-800">ユーザーが見つかりません</p>
        <Link to="/" className="mt-3 inline-block text-sm text-brand-600 hover:underline">
          ホームに戻る
        </Link>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/"
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-ink-800"
      >
        <ArrowLeft size={16} /> タイムラインに戻る
      </Link>

      {/* プロフィールヘッダー */}
      <Card className="overflow-hidden">
        <div
          className="h-32"
          style={{ background: avatarGradient(user.id) }}
        />
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between">
            <div className="-mt-10">
              <div className="rounded-full ring-4 ring-white">
                <Avatar user={user} size={84} />
              </div>
            </div>
            <div className="mt-3">
              {isMe ? (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Pencil size={15} /> プロフィール編集
                </Button>
              ) : isFollowing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toggleFollow(user.id);
                    toast(`${user.name}さんのフォローを解除しました`);
                  }}
                >
                  <UserCheck size={15} /> フォロー中
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    toggleFollow(user.id);
                    toast.success(`${user.name}さんをフォローしました`);
                  }}
                >
                  <UserPlus size={15} /> フォローする
                </Button>
              )}
            </div>
          </div>

          <div className="mt-3">
            <h1 className="text-xl font-bold text-ink-900">{user.name}</h1>
            <p className="text-sm text-ink-400">@{user.handle}</p>
          </div>

          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-700">
            {user.bio}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {user.interests.map((t) => (
              <span
                key={t}
                className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
              >
                #{t}
              </span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {user.location}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays size={14} /> {joinMonth(user.joinedAt)}から利用
            </span>
          </div>

          <div className="mt-4 flex gap-5 border-t border-ink-100 pt-4 text-sm">
            <div>
              <span className="font-bold text-ink-900 tnum">{user.followingIds.length}</span>
              <span className="ml-1 text-ink-400">フォロー</span>
            </div>
            <div>
              <span className="font-bold text-ink-900 tnum">
                {followerCount(users, user.id)}
              </span>
              <span className="ml-1 text-ink-400">フォロワー</span>
            </div>
            <div>
              <span className="font-bold text-ink-900 tnum">{nf(userPosts.length)}</span>
              <span className="ml-1 text-ink-400">投稿</span>
            </div>
          </div>
        </div>
      </Card>

      {/* タブ */}
      <div className="mt-4 mb-4 flex gap-1 rounded-full border border-ink-200 bg-white p-1">
        {(
          [
            { k: "posts", label: `投稿 ${userPosts.length}` },
            { k: "following", label: `フォロー中 ${followingUsers.length}` },
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
                layoutId="proftab"
                className="absolute inset-0 rounded-full bg-brand-600"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>

      {/* コンテンツ */}
      {tab === "posts" ? (
        loading ? (
          <div className="space-y-4">
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : userPosts.length === 0 ? (
          <Card className="px-6 py-14 text-center">
            <p className="font-semibold text-ink-800">まだ投稿がありません</p>
            <p className="mt-1 text-sm text-ink-500">
              {isMe
                ? "タイムラインから最初の投稿をしてみましょう。"
                : "この人はまだ投稿していません。"}
            </p>
          </Card>
        ) : (
          <motion.div layout className="space-y-4">
            {userPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </motion.div>
        )
      ) : (
        <div className="space-y-3">
          {followingUsers.length === 0 ? (
            <Card className="px-6 py-14 text-center">
              <p className="font-semibold text-ink-800">まだ誰もフォローしていません</p>
            </Card>
          ) : (
            followingUsers.map((u) => <FollowRow key={u.id} user={u} />)
          )}
        </div>
      )}

      {editing && <EditModal onClose={() => setEditing(false)} />}
    </div>
  );
}

function FollowRow({ user }: { user: User }) {
  const users = useStore((s) => s.users);
  const me = useCurrentUser();
  const toggleFollow = useStore((s) => s.toggleFollow);
  const isMe = user.id === me.id;
  const following = me.followingIds.includes(user.id);
  return (
    <Card className="flex items-center gap-3 p-3.5">
      <Link to={`/u/${user.id}`}>
        <Avatar user={user} size={46} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          to={`/u/${user.id}`}
          className="block truncate font-semibold text-ink-900 hover:underline"
        >
          {user.name}
        </Link>
        <p className="truncate text-sm text-ink-400">@{user.handle}</p>
        <p className="mt-0.5 truncate text-xs text-ink-500">{user.bio}</p>
      </div>
      {!isMe &&
        (following ? (
          <Button variant="outline" size="sm" onClick={() => toggleFollow(user.id)}>
            <UserCheck size={14} /> フォロー中
          </Button>
        ) : (
          <Button size="sm" onClick={() => toggleFollow(user.id)}>
            <UserPlus size={14} /> フォロー
          </Button>
        ))}
    </Card>
  );
}

function EditModal({ onClose }: { onClose: () => void }) {
  const me = useCurrentUser();
  const updateProfile = useStore((s) => s.updateProfile);
  const [name, setName] = useState(me.name);
  const [bio, setBio] = useState(me.bio);
  const [location, setLocation] = useState(me.location);

  const save = () => {
    updateProfile({ name: name.trim() || me.name, bio, location });
    toast.success("プロフィールを更新しました");
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">プロフィール編集</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-400 hover:bg-ink-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">表示名</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">自己紹介</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-ink-200 bg-ink-50 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">お住まい</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={onClose}>
              キャンセル
            </Button>
            <Button onClick={save}>保存する</Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
