import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Send,
  FileEdit,
  Search,
  Inbox,
  Paperclip,
  Building2,
  Mail,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { useStore } from "../store";
import type { HistoryRecord, SendMode } from "../data/seed";
import { fakeApi } from "../lib/fakeApi";
import { fmtDateTime, fromNow } from "../lib/format";
import { Card, Pill, Skeleton, EmptyState, FileChip, inputCls } from "../components/ui";

type Filter = "all" | SendMode;

export default function History() {
  const history = useStore((s) => s.history);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fakeApi(true, 520).then(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(() => {
    const sent = history.filter((h) => h.mode === "送信").length;
    const draft = history.filter((h) => h.mode === "下書き").length;
    const files = history.reduce((n, h) => n + h.attachments.length, 0);
    const suppliers = new Set(history.map((h) => h.supplierId)).size;
    return { sent, draft, files, suppliers };
  }, [history]);

  const list = useMemo(() => {
    const query = q.trim();
    return history.filter((h) => {
      if (filter !== "all" && h.mode !== filter) return false;
      if (!query) return true;
      return (
        h.supplierName.includes(query) ||
        h.projectCode.includes(query) ||
        h.projectName.includes(query) ||
        h.parts.some((p) => p.includes(query))
      );
    });
  }, [history, filter, q]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink-900">送信履歴</h1>
        <p className="mt-1 text-sm text-ink-500">
          送信・下書き保存した見積依頼メールを、送信日時・依頼先・添付図面つきで自動記録します。
        </p>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<Send size={16} />} label="送信済み" value={stats.sent} tone="brand" />
        <StatCard icon={<FileEdit size={16} />} label="下書き" value={stats.draft} tone="gray" />
        <StatCard icon={<Building2 size={16} />} label="依頼先" value={stats.suppliers} tone="gray" />
        <StatCard icon={<Paperclip size={16} />} label="添付図面" value={stats.files} tone="gray" />
      </div>

      {/* フィルタ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl border border-ink-200 bg-white p-0.5">
          {(
            [
              ["all", "すべて"],
              ["送信", "送信済み"],
              ["下書き", "下書き"],
            ] as [Filter, string][]
          ).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={
                "rounded-lg px-3.5 py-1.5 text-sm font-medium transition " +
                (filter === v ? "bg-brand-600 text-white" : "text-ink-500 hover:text-ink-800")
              }
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" />
          <input
            className={inputCls + " pl-9"}
            placeholder="依頼先・物件・部品で検索"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* リスト */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </Card>
          ))}
        </div>
      ) : list.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Inbox size={26} />}
            title={q || filter !== "all" ? "該当する履歴がありません" : "送信履歴はまだありません"}
            description={
              q || filter !== "all"
                ? "検索条件やフィルタを変更してください。"
                : "見積依頼シートから送信すると、ここに自動で記録されます。"
            }
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {list.map((h) => (
            <HistoryItem key={h.id} rec={h} open={openId === h.id} onToggle={() => setOpenId(openId === h.id ? null : h.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "brand" | "gray";
}) {
  return (
    <Card className="px-4 py-3.5">
      <div
        className={
          "grid h-9 w-9 place-items-center rounded-xl " +
          (tone === "brand" ? "bg-brand-50 text-brand-600" : "bg-ink-100 text-ink-500")
        }
      >
        {icon}
      </div>
      <div className="tnum mt-2.5 text-2xl font-bold leading-none text-ink-900">{value}</div>
      <div className="mt-1 text-xs text-ink-500">{label}</div>
    </Card>
  );
}

function HistoryItem({ rec, open, onToggle }: { rec: HistoryRecord; open: boolean; onToggle: () => void }) {
  const isSent = rec.mode === "送信";
  return (
    <Card className="overflow-hidden">
      <button onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-ink-50">
        <span
          className={
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl " +
            (isSent ? "bg-brand-50 text-brand-600" : "bg-ink-100 text-ink-500")
          }
        >
          {isSent ? <Send size={18} /> : <FileEdit size={18} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-ink-900">{rec.supplierName}</span>
            <Pill tone={isSent ? "green" : "gray"}>{isSent ? "送信済み" : "下書き"}</Pill>
            {rec.missing.length > 0 && (
              <Pill tone="amber">
                <AlertTriangle size={11} /> 図面一部未添付
              </Pill>
            )}
          </div>
          <div className="mt-0.5 truncate text-xs text-ink-500">
            <span className="tnum">{rec.projectCode}</span> ・ {rec.parts.join("、")}
          </div>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <div className="tnum text-xs text-ink-600">{fmtDateTime(rec.at)}</div>
          <div className="text-[11px] text-ink-400">{fromNow(rec.at)}</div>
        </div>
        <ChevronDown size={16} className={"shrink-0 text-ink-400 transition " + (open ? "rotate-180" : "")} />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-ink-100 bg-ink-50/60 px-4 py-3.5"
        >
          <div className="grid gap-3 text-xs sm:grid-cols-2">
            <InfoRow icon={<Building2 size={13} />} label="依頼先">
              {rec.supplierName}（{rec.contact} 様）
            </InfoRow>
            <InfoRow icon={<Mail size={13} />} label="物件">
              <span className="tnum">{rec.projectCode}</span> {rec.projectName}
            </InfoRow>
          </div>
          <div className="mt-3 rounded-xl border border-ink-200 bg-white px-3.5 py-2 text-xs">
            <span className="text-ink-400">件名：</span>
            <span className="font-medium text-ink-800">{rec.subject}</span>
          </div>
          <div className="mt-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-600">
              <Paperclip size={13} /> 添付図面 {rec.attachments.length}件
            </div>
            {rec.attachments.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {rec.attachments.map((f) => (
                  <FileChip key={f} name={f} />
                ))}
              </div>
            ) : (
              <div className="text-xs text-ink-400">添付図面なし</div>
            )}
            {rec.missing.length > 0 && (
              <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                図番 {rec.missing.join("・")} は図面が見つからず未添付でした。
              </div>
            )}
          </div>
        </motion.div>
      )}
    </Card>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-ink-100">
      <span className="mt-0.5 text-ink-400">{icon}</span>
      <div className="min-w-0">
        <div className="text-[11px] text-ink-400">{label}</div>
        <div className="text-ink-700">{children}</div>
      </div>
    </div>
  );
}
