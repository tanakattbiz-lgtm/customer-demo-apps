import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
  FolderSearch,
  Mail,
  Send,
  FileEdit,
  ChevronDown,
  Paperclip,
  AlertTriangle,
  User,
  Lock,
  CheckCircle2,
} from "lucide-react";
import type { Project, SendMode } from "../data/seed";
import { useStore } from "../store";
import { composeEmails, type DraftEmail } from "../lib/compose";
import { fakeApi } from "../lib/fakeApi";
import { fmtDate } from "../lib/format";
import { Modal, Button, Pill, FileChip, Spinner, Skeleton } from "./ui";

type Phase = "scanning" | "review" | "sending";

export default function SendModal({
  open,
  onClose,
  project,
  partIds,
}: {
  open: boolean;
  onClose: () => void;
  project: Project;
  partIds: string[];
}) {
  const navigate = useNavigate();
  const suppliers = useStore((s) => s.suppliers);
  const parts = useStore((s) => s.parts);
  const drawingFolder = useStore((s) => s.drawingFolder);
  const projects = useStore((s) => s.projects);
  const settings = useStore((s) => s.settings);
  const recordSend = useStore((s) => s.recordSend);

  const emails = useMemo(
    () =>
      composeEmails(
        { suppliers, parts, drawingFolder, projects, history: [] },
        project,
        partIds,
      ),
    // 部品/依頼先が固定された状態でモーダルを開くので open をキーに再計算
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, project.id, partIds.join(",")],
  );

  const [phase, setPhase] = useState<Phase>("scanning");
  const [mode, setMode] = useState<SendMode>(settings.defaultMode);
  const [openIdx, setOpenIdx] = useState<number>(0);

  useEffect(() => {
    if (!open) return;
    setPhase("scanning");
    setMode(settings.defaultMode);
    setOpenIdx(0);
    let alive = true;
    fakeApi(true, 900).then(() => alive && setPhase("review"));
    return () => {
      alive = false;
    };
  }, [open, settings.defaultMode]);

  const totalAttachments = emails.reduce((n, e) => n + e.attachments.length, 0);
  const missingCount = emails.filter((e) => e.missing.length > 0).length;
  const blocked = settings.blockOnMissing && missingCount > 0;

  const onSend = async () => {
    setPhase("sending");
    await fakeApi(true, 1100);
    recordSend({ code: project.code, name: project.name }, emails, mode);
    toast.success(
      mode === "送信"
        ? `${emails.length}社へ見積依頼を送信しました`
        : `${emails.length}件をOutlookの下書きに保存しました`,
      { description: `図面 ${totalAttachments} ファイルを自動添付` },
    );
    onClose();
    navigate("/history");
  };

  return (
    <Modal
      open={open}
      onClose={phase === "sending" ? () => {} : onClose}
      title="見積依頼メールの自動生成"
      subtitle={`${project.code}　${project.name}`}
      width={720}
      footer={
        phase === "review" || phase === "sending" ? (
          <>
            <div className="mr-auto hidden items-center gap-2 text-xs text-ink-500 sm:flex">
              <ModeToggle mode={mode} onChange={setMode} disabled={phase === "sending"} />
            </div>
            <Button variant="outline" onClick={onClose} disabled={phase === "sending"}>
              キャンセル
            </Button>
            <Button onClick={onSend} loading={phase === "sending"} disabled={blocked}>
              {phase !== "sending" &&
                (mode === "送信" ? <Send size={16} /> : <FileEdit size={16} />)}
              {mode === "送信" ? `${emails.length}社へ送信` : `${emails.length}件を下書き保存`}
            </Button>
          </>
        ) : null
      }
    >
      {phase === "scanning" ? (
        <ScanningView count={partIds.length} />
      ) : (
        <div className="space-y-4">
          {/* サマリ */}
          <div className="grid grid-cols-3 gap-2.5">
            <Stat label="生成メール" value={emails.length} unit="通" tone="brand" />
            <Stat label="自動添付図面" value={totalAttachments} unit="件" tone="brand" />
            <Stat label="図面未検出" value={missingCount} unit="社" tone={missingCount ? "amber" : "gray"} />
          </div>

          {/* モードトグル(モバイル用) */}
          <div className="flex sm:hidden">
            <ModeToggle mode={mode} onChange={setMode} disabled={false} />
          </div>

          {blocked && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <span>
                図面が見つからない依頼先があります。設定「図面未検出時は送信を止める」が有効のため送信できません。図番を確認するか設定を解除してください。
              </span>
            </div>
          )}

          <p className="text-xs text-ink-400">
            依頼先ごとにメールを自動集約し、件名・本文へ物件名・図番・納期を差し込みました。図面（PDF / DXF）はフォルダから自動検索し添付済みです。
          </p>

          {/* メール一覧 */}
          <div className="space-y-2.5">
            {emails.map((e, i) => (
              <EmailCard
                key={e.supplier.id}
                email={e}
                mode={mode}
                open={openIdx === i}
                onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

function ScanningView({ count }: { count: number }) {
  return (
    <div className="py-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-500">
          <FolderSearch size={28} className="animate-pulse" />
        </div>
        <div className="text-sm font-semibold text-ink-800">図面フォルダを検索し、メールを生成しています…</div>
        <div className="text-xs text-ink-400">選択された {count} 部品の図番を照合中</div>
      </div>
      <div className="mt-6 space-y-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: number;
  unit: string;
  tone: "brand" | "amber" | "gray";
}) {
  const c =
    tone === "brand"
      ? "text-brand-700 bg-brand-50 border-brand-100"
      : tone === "amber"
        ? "text-amber-800 bg-amber-50 border-amber-100"
        : "text-ink-600 bg-ink-50 border-ink-100";
  return (
    <div className={"rounded-xl border px-3 py-2.5 " + c}>
      <div className="text-[11px] font-medium opacity-80">{label}</div>
      <div className="tnum mt-0.5 text-xl font-bold leading-none">
        {value}
        <span className="ml-0.5 text-xs font-medium opacity-70">{unit}</span>
      </div>
    </div>
  );
}

function ModeToggle({
  mode,
  onChange,
  disabled,
}: {
  mode: SendMode;
  onChange: (m: SendMode) => void;
  disabled: boolean;
}) {
  return (
    <div className="inline-flex rounded-xl border border-ink-200 bg-ink-50 p-0.5">
      {(["送信", "下書き"] as SendMode[]).map((m) => (
        <button
          key={m}
          disabled={disabled}
          onClick={() => onChange(m)}
          className={
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 " +
            (mode === m ? "bg-white text-brand-700 shadow-sm" : "text-ink-500 hover:text-ink-700")
          }
        >
          {m === "送信" ? <Send size={13} /> : <FileEdit size={13} />}
          {m === "送信" ? "Outlookで送信" : "下書き保存"}
        </button>
      ))}
    </div>
  );
}

function EmailCard({
  email,
  mode,
  open,
  onToggle,
}: {
  email: DraftEmail;
  mode: SendMode;
  open: boolean;
  onToggle: () => void;
}) {
  const hasMissing = email.missing.length > 0;
  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
      <button onClick={onToggle} className="flex w-full items-center gap-3 px-3.5 py-3 text-left hover:bg-ink-50">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <Mail size={17} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-ink-900">{email.supplier.name}</span>
            <Pill tone="blue">{email.parts.length}部品</Pill>
            {hasMissing && (
              <Pill tone="amber">
                <AlertTriangle size={11} /> 図面未検出
              </Pill>
            )}
          </span>
          <span className="mt-0.5 block truncate text-xs text-ink-400">{email.subject}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-xs text-ink-500">
          <Paperclip size={13} />
          <span className="tnum">{email.attachments.length}</span>
          <ChevronDown size={16} className={"transition " + (open ? "rotate-180" : "")} />
        </span>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-ink-100 bg-ink-50/60"
        >
          <div className="space-y-3 px-3.5 py-3.5">
            {/* 宛先 */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-ink-700 ring-1 ring-ink-200">
                <User size={13} className="text-ink-400" />
                {email.supplier.contact} 様
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-ink-400 ring-1 ring-ink-200">
                <Lock size={12} />
                宛先メールは登録済み（デモのため非表示）
              </span>
            </div>

            {/* 件名・本文プレビュー */}
            <div className="rounded-xl border border-ink-200 bg-white">
              <div className="border-b border-ink-100 px-3.5 py-2 text-xs">
                <span className="text-ink-400">件名：</span>
                <span className="font-medium text-ink-800">{email.subject}</span>
              </div>
              <pre className="thin-scroll max-h-52 overflow-auto whitespace-pre-wrap px-3.5 py-3 text-[11.5px] leading-relaxed text-ink-700">
                {email.body}
              </pre>
            </div>

            {/* 添付図面(自動検索結果) */}
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-600">
                <Paperclip size={13} /> 自動添付された図面
              </div>
              {email.attachments.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {email.attachments.map((f) => (
                    <FileChip key={f} name={f} />
                  ))}
                </div>
              ) : (
                <div className="text-xs text-ink-400">添付できる図面がありません</div>
              )}
              {hasMissing && (
                <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                  <span>
                    図番 {email.missing.join("・")} の図面がフォルダに見つかりませんでした。手動で添付するか図番をご確認ください。
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-ink-400">
              <CheckCircle2 size={12} className="text-emerald-500" />
              {mode === "送信" ? "送信時にOutlookから自動送信されます" : "Outlookの下書きフォルダに保存されます"}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
