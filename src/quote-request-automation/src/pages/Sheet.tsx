import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import {
  Plus,
  Send,
  Pencil,
  Trash2,
  Building2,
  UserPlus,
  PackageOpen,
  CalendarClock,
  MapPin,
  FileText,
  FileBox,
  AlertCircle,
} from "lucide-react";
import { useStore } from "../store";
import type { Part } from "../data/seed";
import { fakeApi } from "../lib/fakeApi";
import { fmtDateShort, fmtDate, daysUntil, fileKind } from "../lib/format";
import { findDrawings } from "../lib/compose";
import { Card, Button, Pill, Skeleton, EmptyState, Modal } from "../components/ui";
import SupplierPicker from "../components/SupplierPicker";
import PartModal from "../components/PartModal";
import SendModal from "../components/SendModal";

export default function Sheet() {
  const projects = useStore((s) => s.projects);
  const parts = useStore((s) => s.parts);
  const suppliers = useStore((s) => s.suppliers);
  const drawingFolder = useStore((s) => s.drawingFolder);
  const currentProjectId = useStore((s) => s.currentProjectId);
  const setCurrentProject = useStore((s) => s.setCurrentProject);
  const deletePart = useStore((s) => s.deletePart);

  const project = projects.find((p) => p.id === currentProjectId) ?? projects[0];
  const rows = useMemo(() => parts.filter((p) => p.projectId === project.id), [parts, project.id]);

  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pickPart, setPickPart] = useState<Part | null>(null);
  const [editPart, setEditPart] = useState<Part | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [delPart, setDelPart] = useState<Part | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);

  // 物件切替のたびに「読み込み」を演出
  useEffect(() => {
    setLoading(true);
    let alive = true;
    fakeApi(true, 500).then(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [project.id]);

  // 依頼先が付いた行を既定で選択
  useEffect(() => {
    setSelected(new Set(rows.filter((r) => r.supplierIds.length > 0).map((r) => r.id)));
  }, [project.id, rows.length]);

  const supplierName = (id: string) => suppliers.find((s) => s.id === id)?.name ?? "不明";

  const assignedRows = rows.filter((r) => r.supplierIds.length > 0);
  const selectedRows = rows.filter((r) => selected.has(r.id) && r.supplierIds.length > 0);
  const emailCount = new Set(selectedRows.flatMap((r) => r.supplierIds)).size;

  const toggleRow = (id: string) => {
    setSelected((cur) => {
      const next = new Set(cur);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const allSelected = assignedRows.length > 0 && assignedRows.every((r) => selected.has(r.id));
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(assignedRows.map((r) => r.id)));

  const onDelete = async () => {
    if (!delPart) return;
    setDeleting(true);
    await fakeApi(true, 380);
    deletePart(delPart.id);
    setDeleting(false);
    toast.success("部品を削除しました");
    setDelPart(null);
  };

  const onSend = () => {
    if (selectedRows.length === 0) {
      toast.error("依頼先が設定された部品を選択してください");
      return;
    }
    setSendOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* 見出し + 物件切替 */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-900">見積依頼シート</h1>
          <p className="mt-1 text-sm text-ink-500">
            部品ごとに依頼先(最大3社)を選び、図面を自動添付して一括送信します。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium text-ink-500">物件</label>
          <select
            value={project.id}
            onChange={(e) => setCurrentProject(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code}　{p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 物件メタ */}
      <Card className="px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="tnum font-bold text-brand-700">{project.code}</span>
          <span className="font-semibold text-ink-900">{project.name}</span>
          <span className="flex items-center gap-1.5 text-ink-500">
            <MapPin size={15} className="text-ink-400" /> {project.destination}
          </span>
          <span className="flex items-center gap-1.5 text-ink-500">
            <CalendarClock size={15} className="text-ink-400" /> 納品希望 {fmtDate(project.dueDate)}
          </span>
        </div>
        {project.note && <p className="mt-2 text-xs text-ink-400">備考: {project.note}</p>}
      </Card>

      {/* ツールバー */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <span>
            部品 <span className="tnum font-semibold text-ink-800">{rows.length}</span> 件
          </span>
          {assignedRows.length > 0 && (
            <>
              <span className="text-ink-300">/</span>
              <span>
                選択 <span className="tnum font-semibold text-brand-700">{selectedRows.length}</span> 件
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            <Plus size={16} /> 部品を追加
          </Button>
          <Button onClick={onSend} disabled={selectedRows.length === 0}>
            <Send size={16} />
            見積依頼を送信
            {emailCount > 0 && (
              <span className="ml-0.5 rounded-md bg-white/20 px-1.5 py-0.5 text-xs tnum">{emailCount}社</span>
            )}
          </Button>
        </div>
      </div>

      {/* シート本体 */}
      {loading ? (
        <SheetSkeleton />
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<PackageOpen size={26} />}
            title="この物件にはまだ部品がありません"
            description="部品を追加して、材質・図番・希望納期・依頼先を登録しましょう。"
            action={
              <Button onClick={() => setAddOpen(true)}>
                <Plus size={16} /> 最初の部品を追加
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {/* --- デスクトップ:テーブル --- */}
          <Card className="hidden overflow-hidden md:block">
            <div className="thin-scroll overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead>
                  <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs text-ink-500">
                    <th className="w-10 py-2.5 pr-2 pl-4">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="h-4 w-4 accent-brand-600"
                        aria-label="すべて選択"
                      />
                    </th>
                    <th className="px-2 py-2.5 font-medium">部品名 / 材質</th>
                    <th className="px-2 py-2.5 font-medium">数量</th>
                    <th className="px-2 py-2.5 font-medium">希望納期</th>
                    <th className="px-2 py-2.5 font-medium">図番 / 図面</th>
                    <th className="px-2 py-2.5 font-medium">見積依頼先(最大3社)</th>
                    <th className="w-20 px-2 py-2.5 text-right font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const files = findDrawings(drawingFolder, r.drawingNo);
                    const isSel = selected.has(r.id);
                    const d = daysUntil(r.dueDate);
                    return (
                      <tr
                        key={r.id}
                        className={
                          "border-b border-ink-100 transition last:border-0 " +
                          (isSel ? "bg-brand-50/50" : "hover:bg-ink-50")
                        }
                      >
                        <td className="py-3 pr-2 pl-4 align-top">
                          <input
                            type="checkbox"
                            checked={isSel}
                            disabled={r.supplierIds.length === 0}
                            onChange={() => toggleRow(r.id)}
                            className="h-4 w-4 accent-brand-600 disabled:opacity-40"
                            aria-label={`${r.name} を選択`}
                          />
                        </td>
                        <td className="px-2 py-3 align-top">
                          <div className="font-semibold text-ink-900">{r.name}</div>
                          <div className="mt-0.5 text-xs text-ink-500">{r.material}</div>
                        </td>
                        <td className="tnum px-2 py-3 align-top whitespace-nowrap text-ink-700">
                          {r.qty}
                          <span className="text-xs text-ink-400"> {r.unit}</span>
                        </td>
                        <td className="px-2 py-3 align-top whitespace-nowrap">
                          <div className="tnum text-ink-700">{fmtDateShort(r.dueDate)}</div>
                          <div className={"text-[11px] " + (d < 7 ? "text-rose-600" : "text-ink-400")}>
                            {d < 0 ? `${-d}日超過` : d === 0 ? "本日" : `あと${d}日`}
                          </div>
                        </td>
                        <td className="px-2 py-3 align-top">
                          <div className="tnum text-xs font-medium text-ink-700">{r.drawingNo}</div>
                          <DrawingBadges files={files} />
                        </td>
                        <td className="px-2 py-3 align-top">
                          <SupplierCell
                            names={r.supplierIds.map(supplierName)}
                            count={r.supplierIds.length}
                            onEdit={() => setPickPart(r)}
                          />
                        </td>
                        <td className="px-2 py-3 text-right align-top whitespace-nowrap">
                          <button
                            onClick={() => setEditPart(r)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
                            aria-label="編集"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDelPart(r)}
                            className="ml-0.5 grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-rose-50 hover:text-rose-600"
                            aria-label="削除"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* --- モバイル:カード --- */}
          <div className="space-y-3 md:hidden">
            {rows.map((r) => {
              const files = findDrawings(drawingFolder, r.drawingNo);
              const isSel = selected.has(r.id);
              return (
                <Card key={r.id} className={"p-4 " + (isSel ? "ring-1 ring-brand-300" : "")}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSel}
                      disabled={r.supplierIds.length === 0}
                      onChange={() => toggleRow(r.id)}
                      className="mt-1 h-4 w-4 accent-brand-600 disabled:opacity-40"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-ink-900">{r.name}</div>
                          <div className="text-xs text-ink-500">
                            {r.material} ・ {r.qty}
                            {r.unit}
                          </div>
                        </div>
                        <div className="flex shrink-0">
                          <button
                            onClick={() => setEditPart(r)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDelPart(r)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
                        <span className="tnum">納期 {fmtDateShort(r.dueDate)}</span>
                        <span className="tnum">図番 {r.drawingNo}</span>
                      </div>
                      <div className="mt-1.5">
                        <DrawingBadges files={files} />
                      </div>
                      <div className="mt-2.5">
                        <SupplierCell
                          names={r.supplierIds.map(supplierName)}
                          count={r.supplierIds.length}
                          onEdit={() => setPickPart(r)}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* モーダル群 */}
      {pickPart && <SupplierPicker part={pickPart} open onClose={() => setPickPart(null)} />}
      {addOpen && <PartModal open onClose={() => setAddOpen(false)} projectId={project.id} />}
      {editPart && (
        <PartModal open onClose={() => setEditPart(null)} projectId={project.id} edit={editPart} />
      )}
      {sendOpen && (
        <SendModal
          open
          onClose={() => setSendOpen(false)}
          project={project}
          partIds={selectedRows.map((r) => r.id)}
        />
      )}

      {/* 削除確認 */}
      <Modal
        open={!!delPart}
        onClose={() => setDelPart(null)}
        title="部品を削除しますか?"
        width={420}
        footer={
          <>
            <Button variant="outline" onClick={() => setDelPart(null)}>
              キャンセル
            </Button>
            <Button variant="danger" onClick={onDelete} loading={deleting}>
              削除する
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-500">
            <AlertCircle size={20} />
          </div>
          <p className="text-sm text-ink-600">
            「<span className="font-semibold text-ink-900">{delPart?.name}</span>」をシートから削除します。この操作は取り消せません。
          </p>
        </div>
      </Modal>
    </div>
  );
}

function DrawingBadges({ files }: { files: string[] }) {
  if (files.length === 0) {
    return (
      <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
        <AlertCircle size={12} /> 図面未検出
      </span>
    );
  }
  const hasPdf = files.some((f) => fileKind(f) === "pdf");
  const hasDxf = files.some((f) => fileKind(f) === "dxf");
  return (
    <span className="mt-1 inline-flex items-center gap-1.5">
      {hasPdf && (
        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-[11px] font-medium text-rose-700">
          <FileText size={11} /> PDF
        </span>
      )}
      {hasDxf && (
        <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-1.5 py-0.5 text-[11px] font-medium text-brand-700">
          <FileBox size={11} /> DXF
        </span>
      )}
      <span className="text-[11px] text-ink-400">自動検出</span>
    </span>
  );
}

function SupplierCell({
  names,
  count,
  onEdit,
}: {
  names: string[];
  count: number;
  onEdit: () => void;
}) {
  if (count === 0) {
    return (
      <button
        onClick={onEdit}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-ink-300 px-2.5 py-1.5 text-xs font-medium text-ink-500 transition hover:border-brand-300 hover:text-brand-600"
      >
        <UserPlus size={14} /> 依頼先を選ぶ
      </button>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <AnimatePresence initial={false}>
        {names.map((n) => (
          <motion.span
            key={n}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700"
          >
            <Building2 size={12} /> {n}
          </motion.span>
        ))}
      </AnimatePresence>
      <button
        onClick={onEdit}
        className="rounded-lg px-1.5 py-1 text-xs font-medium text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
      >
        {count < 3 ? "＋変更" : "変更"}
      </button>
    </div>
  );
}

function SheetSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="space-y-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-ink-100 px-4 py-4 last:border-0">
            <Skeleton className="h-4 w-4" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="hidden h-7 w-40 rounded-lg sm:block" />
          </div>
        ))}
      </div>
    </Card>
  );
}
