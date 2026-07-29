import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, ScrollText, Search } from "lucide-react";
import { useStore } from "../../store";
import { useLoad } from "../../lib/useLoad";
import { fmtDateTime } from "../../lib/date";
import { Card, EmptyState, Skeleton, inputCls } from "../../components/ui";

export default function AuditLog() {
  const loading = useLoad();
  const auditLog = useStore((s) => s.auditLog);
  const staffList = useStore((s) => s.staffList);
  const offices = useStore((s) => s.offices);
  const vehicles = useStore((s) => s.vehicles);

  const [officeFilter, setOfficeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    return auditLog
      .map((log) => ({
        log,
        staff: staffList.find((s) => s.id === log.staffId),
        office: offices.find((o) => o.id === log.officeId),
        vehicle: vehicles.find((v) => v.id === log.vehicleId),
      }))
      .filter(({ log, staff }) => {
        if (officeFilter !== "all" && log.officeId !== officeFilter) return false;
        if (query && !staff?.name.includes(query)) return false;
        const date = log.confirmedAt.slice(0, 10);
        if (dateFrom && date < dateFrom) return false;
        if (dateTo && date > dateTo) return false;
        return true;
      });
  }, [auditLog, staffList, offices, vehicles, officeFilter, query, dateFrom, dateTo]);

  function exportCsv() {
    const header = ["確認日時", "事業所", "スタッフ", "車両", "確認者"];
    const lines = rows.map(({ log, staff, office, vehicle }) =>
      [
        fmtDateTime(log.confirmedAt),
        office?.name ?? "",
        staff?.name ?? "",
        vehicle ? `${vehicle.model}(${vehicle.plateNumber})` : "",
        log.adminName,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = "﻿" + [header.join(","), ...lines].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `confirmation-log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSVを出力しました");
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">確認者ログ</h1>
          <p className="mt-1 text-sm text-ink-500">
            監査用(白ナンバー義務化対応)に、いつ・誰が確認したかを自動保持しています。
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3.5 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
        >
          <Download size={15} /> CSV出力
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          className={inputCls + " w-auto"}
          value={officeFilter}
          onChange={(e) => setOfficeFilter(e.target.value)}
        >
          <option value="all">すべての事業所</option>
          {offices.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          className={inputCls + " w-auto"}
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <span className="text-sm text-ink-400">〜</span>
        <input
          type="date"
          className={inputCls + " w-auto"}
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            className={inputCls + " w-48 pl-8"}
            placeholder="スタッフ名で検索"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ScrollText size={22} />}
            title="該当するログがありません"
            description="条件を変更してお試しください。"
          />
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-ink-100 text-xs text-ink-400">
              <tr>
                <th className="px-4 py-3 font-medium">確認日時</th>
                <th className="px-4 py-3 font-medium">事業所</th>
                <th className="px-4 py-3 font-medium">スタッフ</th>
                <th className="px-4 py-3 font-medium">車両</th>
                <th className="px-4 py-3 font-medium">確認者</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map(({ log, staff, office, vehicle }) => (
                <tr key={log.id} className="hover:bg-ink-50">
                  <td className="tnum px-4 py-3 text-ink-700">{fmtDateTime(log.confirmedAt)}</td>
                  <td className="px-4 py-3 text-ink-700">{office?.name}</td>
                  <td className="px-4 py-3 font-medium text-ink-900">{staff?.name}</td>
                  <td className="px-4 py-3 text-ink-500">
                    {vehicle?.model}({vehicle?.plateNumber})
                  </td>
                  <td className="px-4 py-3 text-ink-700">{log.adminName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
