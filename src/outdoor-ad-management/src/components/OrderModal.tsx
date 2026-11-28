import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDays, format } from "date-fns";
import { toast } from "sonner";
import { Camera, FileText, Image as ImageIcon, Link2, Paperclip, X } from "lucide-react";
import { useStore } from "../store";
import { KIKAKU_TYPE_DEF, ORDER_KIKAKU_TYPES, type Attachment, type Deal, type KikakuType } from "../data/seed";
import { fakeApi } from "../lib/fakeApi";
import { todayISO, yen } from "../lib/format";
import { Button, Field, Modal, Segmented, errCls, inputCls } from "./ui";
import { QTag, SourceTag } from "./tags";

type NewFile = Omit<Attachment, "id" | "uploadedAt" | "by">;
const kindOf = (name: string): "pdf" | "image" => (/\.(png|jpe?g|heic|webp|gif)$/i.test(name) ? "image" : "pdf");

/** 契約書スキャンの添付欄(項目定義 I24)。PDF・画像、複数ファイル、iPadのカメラから */
export function ScanPicker({ files, onAdd, onRemove, sample, hideList }: { files: { id?: string; name: string; kind: "pdf" | "image" }[]; onAdd: (f: NewFile[]) => void; onRemove: (i: number) => void; sample: string; hideList?: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const pick = (list: FileList | null) => {
    if (!list?.length) return;
    onAdd(Array.from(list).map((f) => ({ name: f.name, kind: kindOf(f.name) })));
  };
  return (
    <div>
      <input ref={fileRef} type="file" multiple accept="application/pdf,image/*" className="hidden" onChange={(e) => { pick(e.target.files); e.target.value = ""; }} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { pick(e.target.files); e.target.value = ""; }} />
      {!hideList && <div className="overflow-hidden rounded-md border border-ink-200">
        {files.length === 0 ? (
          <div className="px-4 py-4 text-center text-[13.5px] text-ink-500">まだ添付されていません</div>
        ) : (
          files.map((f, i) => (
            <div key={f.id ?? f.name + i} className="flex min-h-12 items-center gap-2.5 border-b border-ink-100 px-3.5 py-2 last:border-0">
              {f.kind === "image" ? <ImageIcon size={16} className="text-navy-600" /> : <FileText size={16} className="text-navy-600" />}
              <span className="min-w-0 flex-1 truncate text-[14px] text-ink-900">{f.name}</span>
              <button type="button" onClick={() => onRemove(i)} className="grid h-9 w-9 place-items-center rounded text-ink-400 hover:bg-ink-100 hover:text-bad-600" aria-label="外す">
                <X size={15} />
              </button>
            </div>
          ))
        )}
      </div>}
      <div className={(hideList ? "" : "mt-2 ") + "flex flex-wrap gap-2"}>
        <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <Paperclip size={13} />
          ファイルを選ぶ(PDF・画像)
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => camRef.current?.click()}>
          <Camera size={13} />
          カメラで撮る(iPad)
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => onAdd([{ name: sample, kind: "pdf" }])}>
          サンプルを添付
        </Button>
      </div>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-400">
        保存したファイルは公開リンクにせず、権限のある人だけが開けます。差し替えの履歴も残す想定です。
      </p>
    </div>
  );
}

export default function OrderModal({ open, onClose, deal }: { open: boolean; onClose: () => void; deal: Deal }) {
  const nav = useNavigate();
  const registerOrder = useStore((s) => s.registerOrder);
  const [f, setF] = useState({ orderDate: "", planned: "", ad: "", makeup: "", rent: "", kikakuNo: "", boardName: "" });
  const [kType, setKType] = useState<KikakuType>("新規新設");
  const [files, setFiles] = useState<NewFile[]>([]);
  const [landFiles, setLandFiles] = useState<NewFile[]>([]);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open) return;
    const s = (v: number | null) => (v === null ? "" : String(v));
    setF({
      orderDate: todayISO(),
      planned: format(addDays(new Date(), 35), "yyyy-MM-dd"),
      ad: s(deal.monthlyBudget),
      makeup: s(deal.makeupFee),
      rent: s(deal.landRent),
      kikakuNo: "",
      boardName: "",
    });
    setKType(deal.investment ? "投資" : deal.signType === "既存の看板に掲出" ? "既存新規" : "新規新設");
    setFiles([]);
    setLandFiles([]);
    setTouched(false);
  }, [open, deal]);
  const n = (v: string) => (v.trim() === "" ? null : Number(v));
  const errs = {
    orderDate: !f.orderDate ? "契約締結日を選択してください" : f.orderDate > todayISO() ? "契約締結日に未来の日付は入れられません" : "",
    planned: f.planned && f.planned < f.orderDate ? "設置予定日は契約締結日以降にしてください" : "",
    ad: n(f.ad) === null ? "広告料を入力してください(契約締結時までに確定)" : !(n(f.ad)! >= 0) ? "0以上の金額を入力してください" : "",
    boardName: !f.boardName.trim() ? "設置場所(媒体)を入力してください" : "",
  };
  const err = (k: keyof typeof errs) => (touched ? errs[k] : "");
  const submit = async () => {
    setTouched(true);
    if (Object.values(errs).some(Boolean)) return;
    setBusy(true);
    await fakeApi(null, 650);
    const id = registerOrder(deal.id, {
      kikakuType: kType,
      orderDate: f.orderDate,
      plannedInstallDate: f.planned || null,
      adFee: n(f.ad),
      makeupFee: n(f.makeup),
      landRent: n(f.rent),
      kikakuNo: null,
      boardName: f.boardName.trim(),
      attachments: [...files.map((f) => ({ ...f, doc: "掲出契約書" as const })), ...landFiles.map((f) => ({ ...f, doc: "土地契約書" as const }))],
    });
    const no = useStore.getState().orders.find((o) => o.id === id)?.kikakuNo;
    setBusy(false);
    onClose();
    toast.success(`企画を作成し、工事指示システムに登録しました(企画番号 ${no})`, {
      description: "このあとの承認・デザイン・工事・施工完了は、工事指示システムから自動で反映されます。",
      action: { label: "契約締結の画面を開く", onClick: () => nav(`/orders/${id}`) },
    });
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="契約締結を登録(企画を作成)"
      sub="この見込案件の内容を引き継いで企画を作り、工事指示システムへ登録します"
      width={640}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button data-tour="order-submit" onClick={submit} loading={busy}>
            企画を確定して登録する
          </Button>
        </>
      }
    >
      <div data-tour="order-form" className="space-y-5">
        <div className="flex gap-3 rounded-md border border-navy-100 bg-navy-50 px-4 py-3 text-[13.5px] leading-relaxed text-navy-800">
          <Link2 size={16} className="mt-0.5 shrink-0" />
          <div>
            ここで作った企画は、<span className="font-semibold">確定するとその場で工事指示システムに登録</span>され、企画番号が付きます。
            工事指示システムに同じ内容を入れ直す必要はありません。承認・デザイン・工事・施工完了は、工事指示システムから自動で反映されます。
          </div>
        </div>
        <Field label="企画の種類" required hint={KIKAKU_TYPE_DEF[kType]}>
          <Segmented value={kType} onChange={(v) => setKType(v as KikakuType)} items={ORDER_KIKAKU_TYPES.map((t) => ({ value: t, label: t }))} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="設置場所(媒体)" required error={err("boardName")} hint="既存の看板は、工事指示システムの媒体から選ぶ想定です">
            <input data-tour="order-board" className={inputCls + (err("boardName") ? errCls : "")} placeholder="例: 国道2号 西本町交差点" value={f.boardName} onChange={(e) => setF({ ...f, boardName: e.target.value })} />
          </Field>
          <Field label="契約締結日" required error={err("orderDate")}>
            <input type="date" className={inputCls} value={f.orderDate} max={todayISO()} onChange={(e) => setF({ ...f, orderDate: e.target.value })} />
          </Field>
          <Field label="設置予定日" error={err("planned")} hint="設置の完了は、製造部の施工完了から自動で入る想定です">
            <input type="date" className={inputCls} value={f.planned} onChange={(e) => setF({ ...f, planned: e.target.value })} />
          </Field>
        </div>
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[14.5px] font-semibold text-navy-900">
            金額(税抜) <QTag id="Q05" />
            <span className="ml-auto text-[12px] font-normal text-ink-500">見込案件の金額を引き継いでいます</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="広告料(月額)" required error={err("ad")}>
              <input type="number" inputMode="numeric" className={inputCls + " tnum" + (err("ad") ? errCls : "")} value={f.ad} onChange={(e) => setF({ ...f, ad: e.target.value })} />
            </Field>
            <Field label="化粧料">
              <input type="number" inputMode="numeric" className={inputCls + " tnum"} placeholder="未入力" value={f.makeup} onChange={(e) => setF({ ...f, makeup: e.target.value })} />
            </Field>
            <Field label="地代(年額)">
              <input type="number" inputMode="numeric" className={inputCls + " tnum"} placeholder="未入力" value={f.rent} onChange={(e) => setF({ ...f, rent: e.target.value })} />
            </Field>
          </div>
          <p className="mt-1.5 text-[12.5px] text-ink-500">
            この金額で企画を登録します。登録した後に変わった場合は、工事指示システムの金額を正とします。
            {n(f.ad) !== null && <span className="tnum ml-1">広告料 {yen(n(f.ad)!)}/月</span>}
          </p>
        </div>
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[14.5px] font-semibold text-navy-900">
            屋外広告物掲出契約書(スキャン) <SourceTag kind="input" compact /> <QTag id="Q16" />
            <span className="ml-auto text-[12px] font-normal text-ink-500">任意(必須にする時点は確認中)</span>
          </div>
          <ScanPicker
            files={files}
            sample="屋外広告物掲出契約書_署名済.pdf"
            onAdd={(x) => setFiles((p) => [...p, ...x])}
            onRemove={(i) => setFiles((p) => p.filter((_, j) => j !== i))}
          />
        </div>
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[14.5px] font-semibold text-navy-900">
            土地契約書(スキャン) <SourceTag kind="input" compact />
            <span className="ml-auto text-[12px] font-normal text-ink-500">地主との契約がある場合</span>
          </div>
          <ScanPicker
            files={landFiles}
            sample="土地契約書_署名済.pdf"
            onAdd={(x) => setLandFiles((p) => [...p, ...x])}
            onRemove={(i) => setLandFiles((p) => p.filter((_, j) => j !== i))}
          />
        </div>
      </div>
    </Modal>
  );
}
