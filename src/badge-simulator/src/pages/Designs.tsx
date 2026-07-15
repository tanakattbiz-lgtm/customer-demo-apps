import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Search, Copy, Trash2, Pencil, Plus, CircleDot, Package } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../store";
import { sizeById, type DesignStatus } from "../data/seed";
import { fakeApi } from "../lib/fakeApi";
import BadgeThumb from "../components/BadgeThumb";
import { Badge, Button, Card } from "../components/ui";

const STATUS: Record<DesignStatus, { label: string; tone: "amber" | "brand" | "green" }> = {
  draft: { label: "下書き", tone: "amber" },
  ready: { label: "入稿準備OK", tone: "brand" },
  ordered: { label: "注文済み", tone: "green" },
};

type Filter = "all" | DesignStatus;
type Sort = "updated" | "name" | "qty";

export default function Designs() {
  const designs = useStore((s) => s.designs);
  const removeDesign = useStore((s) => s.removeDesign);
  const duplicateDesign = useStore((s) => s.duplicateDesign);
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("updated");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fakeApi(true, 500).then(() => setLoading(false));
  }, []);

  const list = useMemo(() => {
    let r = designs;
    if (filter !== "all") r = r.filter((d) => d.status === filter);
    if (q.trim()) r = r.filter((d) => d.name.toLowerCase().includes(q.trim().toLowerCase()));
    const s = [...r];
    if (sort === "updated") s.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    if (sort === "name") s.sort((a, b) => a.name.localeCompare(b.name, "ja"));
    if (sort === "qty") s.sort((a, b) => b.qty - a.qty);
    return s;
  }, [designs, filter, q, sort]);

  const counts = useMemo(
    () => ({
      all: designs.length,
      draft: designs.filter((d) => d.status === "draft").length,
      ready: designs.filter((d) => d.status === "ready").length,
      ordered: designs.filter((d) => d.status === "ordered").length,
    }),
    [designs],
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">マイデザイン</h1>
          <p className="mt-0.5 text-sm text-ink-400">
            缶バッジの入稿データを作成・管理します（全 {designs.length} 件）
          </p>
        </div>
        <Link to="/editor/new">
          <Button>
            <Plus size={16} /> 新しいバッジを作る
          </Button>
        </Link>
      </div>

      {/* フィルタ・検索バー */}
      <Card className="mb-5 flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="デザイン名で検索"
            className="w-full rounded-lg border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm outline-none
              focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {(["all", "draft", "ready", "ordered"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === f ? "bg-brand-500 text-white" : "text-ink-500 hover:bg-ink-100"
              }`}
            >
              {f === "all" ? "すべて" : STATUS[f].label}
              <span className={`ml-1.5 text-xs ${filter === f ? "text-white/80" : "text-ink-400"}`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-600 outline-none focus:border-brand-400"
        >
          <option value="updated">更新が新しい順</option>
          <option value="name">名前順</option>
          <option value="qty">数量が多い順</option>
        </select>
      </Card>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="checker grid aspect-square place-items-center">
                <div className="h-32 w-32 animate-pulse rounded-full bg-ink-200/70" />
              </div>
              <div className="space-y-2 p-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-ink-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-ink-100" />
              </div>
            </Card>
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState hasDesigns={designs.length > 0} onClear={() => { setQ(""); setFilter("all"); }} onCreate={() => nav("/editor/new")} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((d) => {
            const bs = sizeById(d.sizeId);
            return (
              <Card key={d.id} className="group overflow-hidden transition hover:border-brand-300 hover:shadow-md">
                <Link to={`/editor/${d.id}`} className="checker relative block aspect-square">
                  <div className="grid h-full place-items-center p-3">
                    <BadgeThumb design={d} size={168} />
                  </div>
                  <span className="absolute left-2 top-2">
                    <Badge tone={STATUS[d.status].tone}>{STATUS[d.status].label}</Badge>
                  </span>
                </Link>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-sm font-semibold text-ink-900">{d.name}</h3>
                  </div>
                  <p className="mt-1 flex items-center gap-2 text-xs text-ink-400">
                    <span className="inline-flex items-center gap-1">
                      <CircleDot size={12} /> {bs.label}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Package size={12} /> {d.qty}個
                    </span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-400">
                    {formatDistanceToNow(new Date(d.updatedAt), { addSuffix: true, locale: ja })}に更新
                  </p>

                  <div className="mt-3 flex items-center gap-1 border-t border-ink-100 pt-2">
                    <Link
                      to={`/editor/${d.id}`}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50"
                    >
                      <Pencil size={13} /> 編集
                    </Link>
                    <button
                      onClick={() => {
                        const c = duplicateDesign(d.id);
                        if (c) toast.success("複製しました", { description: c.name });
                      }}
                      className="grid h-8 w-8 place-items-center rounded-md text-ink-400 hover:bg-ink-100"
                      aria-label="複製"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => setPendingDelete(d.id)}
                      className="grid h-8 w-8 place-items-center rounded-md text-ink-400 hover:bg-red-50 hover:text-red-500"
                      aria-label="削除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {pendingDelete && (
        <ConfirmDelete
          name={designs.find((d) => d.id === pendingDelete)?.name ?? ""}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            removeDesign(pendingDelete);
            setPendingDelete(null);
            toast.success("デザインを削除しました");
          }}
        />
      )}
    </div>
  );
}

function EmptyState({
  hasDesigns,
  onClear,
  onCreate,
}: {
  hasDesigns: boolean;
  onClear: () => void;
  onCreate: () => void;
}) {
  return (
    <Card className="grid place-items-center px-6 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-500">
        <CircleDot size={30} />
      </div>
      {hasDesigns ? (
        <>
          <h3 className="mt-4 font-semibold text-ink-900">該当する結果がありません</h3>
          <p className="mt-1 text-sm text-ink-400">検索条件を変えてお試しください。</p>
          <Button variant="outline" className="mt-4" onClick={onClear}>
            条件をクリア
          </Button>
        </>
      ) : (
        <>
          <h3 className="mt-4 font-semibold text-ink-900">まだデザインがありません</h3>
          <p className="mt-1 text-sm text-ink-400">最初の缶バッジをデザインしてみましょう。</p>
          <Button className="mt-4" onClick={onCreate}>
            <Plus size={16} /> 新しいバッジを作る
          </Button>
        </>
      )}
    </Card>
  );
}

function ConfirmDelete({
  name,
  onCancel,
  onConfirm,
}: {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink-900/40 p-4" onClick={onCancel}>
      <Card className="w-full max-w-sm p-5" >
        <div onClick={(e) => e.stopPropagation()}>
          <h3 className="font-semibold text-ink-900">デザインを削除しますか？</h3>
          <p className="mt-1.5 text-sm text-ink-500">
            「{name}」を削除します。この操作は取り消せません。
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={onCancel}>
              キャンセル
            </Button>
            <Button variant="danger" onClick={onConfirm}>
              <Trash2 size={15} /> 削除する
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
