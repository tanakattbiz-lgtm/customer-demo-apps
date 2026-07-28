import { useMemo } from "react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { subDays, format, isSameDay } from "date-fns";
import { ja } from "date-fns/locale";
import { Download, TrendingUp, Clock, CheckCircle2, Inbox, Table2 } from "lucide-react";
import { useStore } from "../store";
import { CATEGORIES, CHANNELS, type Category } from "../data/seed";
import { yen } from "../lib/format";
import { useLoad } from "../lib/useLoad";
import { Card, Button, Skeleton } from "../components/ui";

export default function Dashboard() {
  const requests = useStore((s) => s.requests);
  const loading = useLoad();
  const now = new Date();

  const kpi = useMemo(() => {
    const pending = requests.filter((r) => r.status === "未対応").length;
    const inProgress = requests.filter((r) => r.status === "査定中").length;
    const answered = requests.filter((r) => r.status === "回答済");
    const todayNew = requests.filter((r) => isSameDay(new Date(r.createdAt), now)).length;
    const answerRate = requests.length ? Math.round((answered.length / requests.length) * 100) : 0;
    const totalQuote = answered.reduce((a, r) => a + (r.quote ?? 0), 0);
    return { pending, inProgress, answered: answered.length, todayNew, answerRate, totalQuote };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests]);

  // 直近7日の受付件数
  const intake7 = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(now, 6 - i);
      const n = requests.filter((r) => isSameDay(new Date(r.createdAt), d)).length;
      return { day: format(d, "M/d(E)", { locale: ja }), 件数: n };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests]);

  // 流入経路別
  const byChannel = useMemo(
    () =>
      CHANNELS.map((c) => ({
        name: c,
        件数: requests.filter((r) => r.channel === c).length,
      })).sort((a, b) => b.件数 - a.件数),
    [requests],
  );
  const channelColors = ["#2f9e6e", "#3aa77a", "#4bb389", "#6fc0a0", "#9bd0ba", "#c3e2d5"];

  // カテゴリ別ピボット(スプレッドシート集計)
  const pivot = useMemo(() => {
    return CATEGORIES.map((c) => {
      const rows = requests.filter((r) => r.category === c);
      const answered = rows.filter((r) => r.status === "回答済");
      const sum = answered.reduce((a, r) => a + (r.quote ?? 0), 0);
      return {
        category: c,
        total: rows.length,
        pending: rows.filter((r) => r.status === "未対応").length,
        inProgress: rows.filter((r) => r.status === "査定中").length,
        answered: answered.length,
        sum,
        avg: answered.length ? Math.round(sum / answered.length) : 0,
      };
    });
  }, [requests]);

  const totals = useMemo(
    () =>
      pivot.reduce(
        (a, p) => ({
          total: a.total + p.total,
          pending: a.pending + p.pending,
          inProgress: a.inProgress + p.inProgress,
          answered: a.answered + p.answered,
          sum: a.sum + p.sum,
        }),
        { total: 0, pending: 0, inProgress: 0, answered: 0, sum: 0 },
      ),
    [pivot],
  );

  const exportCsv = () => {
    const header = ["査定番号", "受付日時", "お客様名", "LINE名", "カテゴリ", "ブランド", "商品名", "ランク", "流入経路", "査定方法", "ステータス", "査定額", "担当者", "タグ"];
    const staff = useStore.getState().staff;
    const rows = requests.map((r) => [
      r.code,
      format(new Date(r.createdAt), "yyyy/MM/dd HH:mm"),
      r.customerName,
      r.lineName,
      r.category,
      r.brand,
      r.itemName,
      r.rank,
      r.channel,
      r.method,
      r.status,
      r.quote ?? "",
      staff.find((s) => s.id === r.assigneeId)?.name ?? "未割当",
      r.tags.join(" / "),
    ]);
    const esc = (v: string | number) => {
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [header, ...rows].map((row) => row.map(esc).join(",")).join("\r\n");
    // Excel/スプレッドシートで文字化けしないよう BOM を付与
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `査定依頼_集計_${format(now, "yyyyMMdd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("スプレッドシート(CSV)を書き出しました", { description: `${requests.length} 件` });
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-7 w-16" />
            </Card>
          ))}
        </div>
        <Card className="p-5">
          <Skeleton className="h-56 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">ダッシュボード</h1>
          <p className="mt-1 text-sm text-ink-500">
            LINE 査定依頼の受付状況を集計し、スプレッドシートへ書き出します。
          </p>
        </div>
        <Button onClick={exportCsv}>
          <Download size={16} />
          スプレッドシートに書き出し
        </Button>
      </div>

      {/* --- KPI --- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={<Inbox size={18} />} tone="amber" label="本日の新規受付" value={String(kpi.todayNew)} unit="件" />
        <Kpi icon={<Clock size={18} />} tone="blue" label="対応中（未対応+査定中）" value={String(kpi.pending + kpi.inProgress)} unit="件" />
        <Kpi icon={<CheckCircle2 size={18} />} tone="green" label="回答済率" value={String(kpi.answerRate)} unit="%" />
        <Kpi icon={<TrendingUp size={18} />} tone="green" label="回答済 査定額 合計" value={yen(kpi.totalQuote)} />
      </div>

      {/* --- チャート --- */}
      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <h2 className="mb-4 text-sm font-bold text-ink-800">直近7日の受付件数</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={intake7} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(92% 0.007 150)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "oklch(58% 0.014 152)" }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "oklch(58% 0.014 152)" }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "oklch(96% 0.005 150)" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(92% 0.007 150)", fontSize: 12 }}
                />
                <Bar dataKey="件数" radius={[6, 6, 0, 0]} fill="oklch(54% 0.13 152)" maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-bold text-ink-800">流入経路別（友だち追加の導線）</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byChannel} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={72}
                  tick={{ fontSize: 11, fill: "oklch(48% 0.016 154)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "oklch(96% 0.005 150)" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(92% 0.007 150)", fontSize: 12 }}
                />
                <Bar dataKey="件数" radius={[0, 6, 6, 0]} maxBarSize={22}>
                  {byChannel.map((_, i) => (
                    <Cell key={i} fill={channelColors[i % channelColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* --- スプレッドシート集計(ピボット) --- */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-ink-800">
            <Table2 size={16} className="text-brand-500" />
            カテゴリ別 集計表
          </h2>
          <span className="text-[11px] text-ink-400">依頼データの自動集計イメージ</span>
        </div>
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50 text-left text-[11px] text-ink-500">
                <Th>カテゴリ</Th>
                <Th right>件数</Th>
                <Th right>未対応</Th>
                <Th right>査定中</Th>
                <Th right>回答済</Th>
                <Th right>査定額合計</Th>
                <Th right>平均査定額</Th>
              </tr>
            </thead>
            <tbody>
              {pivot.map((p) => (
                <tr key={p.category} className="border-b border-ink-50 transition hover:bg-ink-50/60">
                  <Td className="font-medium text-ink-800">{p.category as Category}</Td>
                  <Td right className="tnum">{p.total}</Td>
                  <Td right className="tnum text-amber-600">{p.pending || "—"}</Td>
                  <Td right className="tnum text-sky-600">{p.inProgress || "—"}</Td>
                  <Td right className="tnum text-brand-700">{p.answered || "—"}</Td>
                  <Td right className="tnum">{p.sum ? yen(p.sum) : "—"}</Td>
                  <Td right className="tnum text-ink-500">{p.avg ? yen(p.avg) : "—"}</Td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-ink-50 font-semibold text-ink-800">
                <Td>合計</Td>
                <Td right className="tnum">{totals.total}</Td>
                <Td right className="tnum">{totals.pending}</Td>
                <Td right className="tnum">{totals.inProgress}</Td>
                <Td right className="tnum">{totals.answered}</Td>
                <Td right className="tnum">{yen(totals.sum)}</Td>
                <Td right className="tnum text-ink-400">—</Td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}

const KPI_TONE: Record<string, string> = {
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-sky-50 text-sky-600",
  green: "bg-brand-50 text-brand-600",
};

function Kpi({
  icon,
  tone,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  tone: keyof typeof KPI_TONE;
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-500">{label}</span>
        <span className={"grid h-8 w-8 place-items-center rounded-lg " + KPI_TONE[tone]}>{icon}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="tnum text-2xl font-bold text-ink-900">{value}</span>
        {unit && <span className="text-sm text-ink-400">{unit}</span>}
      </div>
    </Card>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th className={"px-4 py-2.5 font-medium " + (right ? "text-right" : "")}>{children}</th>;
}

function Td({
  children,
  right,
  className = "",
}: {
  children: React.ReactNode;
  right?: boolean;
  className?: string;
}) {
  return <td className={"px-4 py-3 " + (right ? "text-right " : "") + className}>{children}</td>;
}
