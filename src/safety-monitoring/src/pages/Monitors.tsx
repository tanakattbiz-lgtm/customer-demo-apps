import { useMemo, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import {
  Search,
  HeartPulse,
  Footprints,
  BatteryFull,
  BatteryLow,
  Watch,
  MapPin,
  Wifi,
  WifiOff,
  FlaskConical,
  SearchX,
} from "lucide-react";
import { useStore } from "../store";
import { useLoad } from "../lib/useLoad";
import { statusOf, STATUS_TONE, synthHR, SEVERITY_TONE } from "../lib/domain";
import type { UserStatus, Watchee } from "../data/seed";
import { ago } from "../lib/format";
import { Avatar, Button, Card, EmptyState, Modal, Pill, Skeleton, StatusDot } from "../components/ui";

const FILTERS: (UserStatus | "すべて")[] = ["すべて", "異常", "注意", "正常", "オフライン"];

export default function Monitors() {
  const users = useStore((s) => s.users);
  const alerts = useStore((s) => s.alerts);
  const openSim = useStore((s) => s.openSim);
  const loading = useLoad();

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<UserStatus | "すべて">("すべて");
  const [detailId, setDetailId] = useState<string | null>(null);

  const rows = useMemo(() => {
    return users
      .map((u) => ({ u, st: statusOf(u, alerts) }))
      .filter(({ u, st }) => {
        if (filter !== "すべて" && st !== filter) return false;
        if (q.trim()) {
          const s = q.trim().toLowerCase();
          return (
            u.name.toLowerCase().includes(s) ||
            u.kana.toLowerCase().includes(s) ||
            u.location.toLowerCase().includes(s) ||
            u.deviceId.toLowerCase().includes(s)
          );
        }
        return true;
      })
      .sort((a, b) => rank(a.st) - rank(b.st));
  }, [users, alerts, q, filter]);

  const detail = users.find((u) => u.id === detailId) ?? null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">見守り一覧</h1>
        <p className="mt-1 text-sm text-slate-500">
          各端末から届くバイタルと状態をリアルタイムに表示します。カードをタップで詳細を確認できます。
        </p>
      </div>

      {/* 検索・絞り込み */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="氏名・居室・端末IDで検索"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/25"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                "rounded-lg px-3 py-2 text-sm font-medium transition " +
                (filter === f ? "bg-teal-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50")
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<SearchX size={26} />}
            title="該当する利用者がいません"
            description="検索条件や絞り込みを変更してください。"
            action={<Button variant="outline" onClick={() => { setQ(""); setFilter("すべて"); }}>条件をクリア</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ u, st }) => (
            <MonitorCard key={u.id} u={u} st={st} onOpen={() => setDetailId(u.id)} />
          ))}
        </div>
      )}

      <DetailModal
        user={detail}
        status={detail ? statusOf(detail, alerts) : "正常"}
        alerts={detail ? alerts.filter((a) => a.userId === detail.id).slice(0, 6) : []}
        onClose={() => setDetailId(null)}
        onSim={(id) => { setDetailId(null); openSim(id); }}
        onToggle={(id, online) => {
          useStore.getState().setOnline(id, online);
          toast.success(online ? "端末をオンラインに戻しました" : "端末をオフラインに設定しました");
        }}
      />
    </div>
  );
}

function rank(st: UserStatus) {
  return { 異常: 0, 注意: 1, オフライン: 2, 正常: 3 }[st];
}

function MonitorCard({ u, st, onOpen }: { u: Watchee; st: UserStatus; onOpen: () => void }) {
  const lowBat = u.battery <= 20;
  return (
    <button
      onClick={onOpen}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-teal-300 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <Avatar name={u.name} color={u.color} size={42} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold text-slate-800">{u.name} 様</span>
            <span className="text-[11px] text-slate-400">{u.age}歳</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
            <MapPin size={12} /> <span className="truncate">{u.location}</span>
          </div>
        </div>
        <Pill tone={STATUS_TONE[st]}>
          <StatusDot tone={STATUS_TONE[st]} pulse={st === "異常"} />
          {st}
        </Pill>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
        <Metric icon={<HeartPulse size={14} />} tone={u.online && u.hr > u.restingHR + 35 ? "text-rose-600" : "text-slate-800"} value={u.online ? `${u.hr}` : "—"} unit="bpm" />
        <Metric icon={<Footprints size={14} />} value={u.online ? u.steps.toLocaleString() : "—"} unit="歩" />
        <Metric
          icon={lowBat ? <BatteryLow size={14} /> : <BatteryFull size={14} />}
          tone={lowBat ? "text-amber-600" : "text-slate-800"}
          value={`${u.battery}`}
          unit="%"
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          {u.online ? <Wifi size={12} className="text-emerald-500" /> : <WifiOff size={12} className="text-slate-400" />}
          {u.online ? "同期" : "通信なし"} {ago(u.lastSyncAt)}
        </span>
        <span className="truncate">{u.device}</span>
      </div>
    </button>
  );
}

function Metric({
  icon,
  value,
  unit,
  tone = "text-slate-800",
}: {
  icon: React.ReactNode;
  value: string;
  unit: string;
  tone?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 text-slate-400">{icon}</div>
      <div className="mt-0.5 flex items-baseline gap-0.5">
        <span className={"tabular-nums text-base font-bold " + tone}>{value}</span>
        <span className="text-[11px] text-slate-400">{unit}</span>
      </div>
    </div>
  );
}

function DetailModal({
  user,
  status,
  alerts,
  onClose,
  onSim,
  onToggle,
}: {
  user: Watchee | null;
  status: UserStatus;
  alerts: { id: string; kind: string; severity: "高" | "中" | "低"; message: string; at: string; status: string }[];
  onClose: () => void;
  onSim: (id: string) => void;
  onToggle: (id: string, online: boolean) => void;
}) {
  const series = useMemo(() => (user ? synthHR(user) : []), [user]);
  if (!user) return null;

  return (
    <Modal open={!!user} onClose={onClose} title={`${user.name} 様`} subtitle={`${user.kana} ・ ${user.age}歳 ${user.gender}性`} width={620}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={STATUS_TONE[status]}>
            <StatusDot tone={STATUS_TONE[status]} pulse={status === "異常"} />
            {status}
          </Pill>
          <Pill tone="gray">{user.care}</Pill>
          <Pill tone="gray">{user.plan}</Pill>
        </div>

        {/* バイタル */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="心拍数" value={user.online ? `${user.hr}` : "—"} unit="bpm" sub={`安静時 ${user.restingHR}`} />
          <Stat label="本日の歩数" value={user.online ? user.steps.toLocaleString() : "—"} unit="歩" sub={user.wearing ? "装着中" : "未装着"} />
          <Stat label="バッテリー" value={`${user.battery}`} unit="%" sub={user.online ? "オンライン" : "オフライン"} />
        </div>

        {/* HR 推移 */}
        <Card className="p-4">
          <div className="mb-2 text-xs font-semibold text-slate-500">心拍の推移(直近120分)</div>
          {series.length === 0 ? (
            <div className="grid h-28 place-items-center text-sm text-slate-400">端末オフラインのためデータがありません</div>
          ) : (
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                  <YAxis domain={["dataMin - 6", "dataMax + 6"]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                    formatter={(v: number) => [`${v} bpm`, "心拍"]}
                    labelFormatter={(l) => `${l}`}
                  />
                  <Line type="monotone" dataKey="hr" stroke="#0d9488" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* 端末情報 */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-slate-50 p-4 text-sm">
          <InfoRow icon={<Watch size={14} />} label="デバイス" value={user.device} />
          <InfoRow icon={<MapPin size={14} />} label="所在" value={user.location} />
          <InfoRow icon={<Wifi size={14} />} label="端末ID" value={user.deviceId} />
          <InfoRow icon={<HeartPulse size={14} />} label="最終同期" value={ago(user.lastSyncAt)} />
        </div>

        {/* この利用者のイベント履歴 */}
        <div>
          <div className="mb-2 text-xs font-semibold text-slate-500">この利用者のイベント履歴</div>
          {alerts.length === 0 ? (
            <p className="rounded-xl bg-slate-50 py-6 text-center text-sm text-slate-400">記録されたイベントはありません。</p>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              {alerts.map((a) => (
                <li key={a.id} className="flex items-start gap-2.5 px-3 py-2.5">
                  <StatusDot tone={SEVERITY_TONE[a.severity]} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">{a.kind}</span>
                      <Pill tone={a.status === "対応済" ? "green" : a.status === "対応中" ? "amber" : "red"}>{a.status}</Pill>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{a.message}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{ago(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <Button variant="outline" onClick={() => onToggle(user.id, !user.online)}>
            {user.online ? <WifiOff size={16} /> : <Wifi size={16} />}
            {user.online ? "オフラインにする" : "オンラインに戻す"}
          </Button>
          <Button onClick={() => onSim(user.id)}>
            <FlaskConical size={16} />
            この利用者で検証発報
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Stat({ label, value, unit, sub }: { label: string; value: string; unit: string; sub: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="text-[11px] text-slate-400">{label}</div>
      <div className="mt-1 flex items-baseline gap-0.5">
        <span className="tabular-nums text-xl font-bold text-slate-900">{value}</span>
        <span className="text-[11px] text-slate-400">{unit}</span>
      </div>
      <div className="mt-0.5 text-[11px] text-slate-400">{sub}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400">{icon}</span>
      <span className="text-slate-400">{label}</span>
      <span className="ml-auto font-medium text-slate-700">{value}</span>
    </div>
  );
}
