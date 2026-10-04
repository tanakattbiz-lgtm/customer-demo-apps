import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, FileText, LayoutGrid, Paperclip, X } from "lucide-react";
import { useStore } from "../store";
import { DOC_KINDS, REQUIRED_DOCS, type Deal, type HandoverDoc } from "../data/seed";
import { fakeApi } from "../lib/fakeApi";
import { buildIndex, faceLookup, holdActive, isFree } from "../lib/domain";
import { addMonthKey, fmtMonth, monthRange, monthsBetween, thisMonth, yen } from "../lib/format";
import { Button, EmptyState, Field, Modal, inputCls, textareaCls } from "./ui";

export function DocRow({
  doc,
  required,
  onChange,
  sampleName,
  error,
}: {
  doc: HandoverDoc;
  required: boolean;
  onChange: (fileName: string | null) => void;
  sampleName: string;
  error?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      className={
        "flex flex-col gap-2 border-b border-ink-100 px-4 py-3 last:border-0 sm:flex-row sm:items-center " + (error ? "bg-bad-50/60" : "")
      }
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span
          className={
            "grid h-6 w-6 shrink-0 place-items-center rounded-full border " +
            (doc.fileName ? "border-ok-600 bg-ok-600 text-white" : "border-ink-300 text-ink-300")
          }
        >
          {doc.fileName ? <Check size={13} /> : <FileText size={12} />}
        </span>
        <div className="min-w-0">
          <div className="text-[15px] font-medium text-ink-900">
            {doc.kind}
            {required ? <span className="ml-1.5 text-[11.5px] font-normal text-bad-500">必須</span> : <span className="ml-1.5 text-[11.5px] font-normal text-ink-400">任意</span>}
          </div>
          <div className="truncate text-[12.5px] text-ink-500">{doc.fileName ?? "未添付"}</div>
        </div>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <input
          ref={ref}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onChange(f.name);
            e.target.value = "";
          }}
        />
        {doc.fileName ? (
          <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
            <X size={12} />
            外す
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => onChange(sampleName)}>
            サンプルを添付
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => ref.current?.click()}>
          <Paperclip size={12} />
          {doc.fileName ? "差し替え" : "ファイルを選択"}
        </Button>
      </div>
    </div>
  );
}

export default function CloseDealModal({ open, onClose, deal }: { open: boolean; onClose: () => void; deal: Deal }) {
  const nav = useNavigate();
  const boards = useStore((s) => s.boards);
  const holds = useStore((s) => s.holds);
  const contracts = useStore((s) => s.contracts);
  const closeDeal = useStore((s) => s.closeDeal);
  const lookup = useMemo(() => faceLookup(boards), [boards]);
  const idx = useMemo(() => buildIndex(contracts, holds), [contracts, holds]);
  const myHolds = holds.filter((h) => h.dealId === deal.id && holdActive(h));
  const cur = thisMonth();

  const [faceIds, setFaceIds] = useState<string[]>([]);
  const [start, setStart] = useState(cur);
  const [end, setEnd] = useState(cur);
  const [fee, setFee] = useState("");
  const [docs, setDocs] = useState<HandoverDoc[]>([]);
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!open) return;
    const hs = holds.filter((h) => h.dealId === deal.id && holdActive(h));
    setFaceIds(hs.map((h) => h.faceId));
    const s = hs.length ? hs.map((h) => h.startMonth).sort()[0] : addMonthKey(cur, 1);
    const e = hs.length ? hs.map((h) => h.endMonth).sort().at(-1)! : addMonthKey(s, deal.months - 1);
    setStart(s);
    setEnd(e);
    const list = hs.reduce((sum, h) => sum + (lookup.get(h.faceId)?.face.price ?? 0), 0);
    setFee(String(list));
    setDocs(DOC_KINDS.map((k) => ({ kind: k, fileName: null })));
    setNote("");
    setTouched(false);
    setStep(1);
  }, [open]);

  const listPrice = faceIds.reduce((s, id) => s + (lookup.get(id)?.face.price ?? 0), 0);
  const feeNum = Number(fee);
  const conflicts = faceIds.filter((id) => {
    const l = lookup.get(id);
    return l && !isFree(idx, l.board, l.face, start, end, deal.id);
  });
  const missingDocs = docs.filter((d) => REQUIRED_DOCS.includes(d.kind) && !d.fileName).map((d) => d.kind);
  const errs = {
    faces: faceIds.length === 0 ? "掲載する広告面を1つ以上選択してください" : "",
    period: end < start ? "終了月は開始月以降を選択してください" : conflicts.length ? "選択期間に他の契約・仮押さえと重なる面があります" : "",
    fee: !(feeNum > 0) ? "月額契約金額を入力してください" : "",
    docs: missingDocs.length ? `${missingDocs.join("・")}を添付してください` : "",
  };
  const months = monthsBetween(start, end);
  const discount = listPrice > 0 ? (1 - feeNum / listPrice) * 100 : 0;

  const next = () => {
    setTouched(true);
    if (step === 1 && (errs.faces || errs.period || errs.fee)) return;
    if (step === 2 && errs.docs) return;
    setTouched(false);
    setStep((x) => x + 1);
  };

  const submit = async () => {
    setTouched(true);
    if (Object.values(errs).some(Boolean)) return;
    setBusy(true);
    await fakeApi(null, 700);
    closeDeal(deal.id, { faceIds, startMonth: start, endMonth: end, monthlyFee: feeNum, docs, note: note.trim() });
    setBusy(false);
    onClose();
    toast.success("管理部へ書類を提出しました", {
      description: "管理部が書類を確認します。結果は「管理部への書類提出」で確認できます。",
      action: { label: "提出状況を見る", onClick: () => nav("/handover") },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="成約を登録する"
      sub="3つの手順で、契約の内容と書類を管理部へ提出します"
      width={680}
      footer={
        myHolds.length ? (
          <>
            {step === 1 ? (
              <Button variant="ghost" onClick={onClose}>
                キャンセル
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setStep((x) => x - 1)} disabled={busy}>
                戻る
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={next}>次へ進む</Button>
            ) : (
              <Button onClick={submit} loading={busy}>
                この内容で管理部へ提出する
              </Button>
            )}
          </>
        ) : undefined
      }
    >
      {myHolds.length === 0 ? (
        <EmptyState
          icon={<LayoutGrid size={20} />}
          title="仮押さえ中の広告面がありません"
          description="成約登録の前に、掲載する看板・広告面を仮押さえしてください。"
          action={
            <Button
              onClick={() => {
                onClose();
                nav(`/boards?deal=${deal.id}`);
              }}
            >
              看板の空き状況を見る
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <Stepper step={step} />
          {step === 1 && (
          <>
          <section>
            <SectionTitle n={1} title="掲載する広告面を確認する" />
            <div className="overflow-hidden rounded-md border border-ink-200">
              {myHolds.map((h) => {
                const l = lookup.get(h.faceId);
                if (!l) return null;
                const checked = faceIds.includes(h.faceId);
                const bad = conflicts.includes(h.faceId);
                return (
                  <label
                    key={h.id}
                    className={"flex cursor-pointer items-center gap-3 border-b border-ink-100 px-4 py-3 last:border-0 hover:bg-ink-50 " + (bad ? "bg-bad-50/60" : "")}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[oklch(29.5%_0.047_262)]"
                      checked={checked}
                      onChange={(e) =>
                        setFaceIds((p) => (e.target.checked ? [...p, h.faceId] : p.filter((x) => x !== h.faceId)))
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-medium text-navy-900">
                        {l.board.name} {l.face.label}
                      </div>
                      <div className="text-[12.5px] text-ink-500">
                        {l.board.code} ・ {l.board.type} ・ {l.face.direction}
                      </div>
                    </div>
                    <div className="tnum text-[14px] text-ink-700">{yen(l.face.price)}/月</div>
                  </label>
                );
              })}
            </div>
            {touched && errs.faces && <div className="mt-1.5 text-[12.5px] text-bad-600">{errs.faces}</div>}
          </section>

          <section>
            <SectionTitle n={2} title="掲載期間と金額を入力する" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="掲載開始月" required>
                <select className={inputCls} value={start} onChange={(e) => setStart(e.target.value)}>
                  {monthRange(cur, 24).map((m) => (
                    <option key={m} value={m}>
                      {fmtMonth(m)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="掲載終了月" required>
                <select className={inputCls} value={end} onChange={(e) => setEnd(e.target.value)}>
                  {monthRange(cur, 40).map((m) => (
                    <option key={m} value={m}>
                      {fmtMonth(m)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="月額契約金額(円)" required error={touched ? errs.fee : ""}>
                <input type="number" className={inputCls + " tnum"} value={fee} onChange={(e) => setFee(e.target.value)} step={1000} />
              </Field>
            </div>
            {errs.period && <div className="mt-1.5 text-[12.5px] text-bad-600">{errs.period}</div>}
            <div className="mt-3 grid grid-cols-3 divide-x divide-ink-200 rounded-md bg-ink-50 py-3 text-center">
              <Mini label="定価合計(月額)" value={yen(listPrice)} />
              <Mini label="値引率" value={`${discount.toFixed(1)}%`} />
              <Mini label={`契約総額(${end >= start ? months : 0}ヶ月)`} value={yen(end >= start ? feeNum * months : 0)} strong />
            </div>
          </section>
          </>
          )}

          {step === 2 && (
          <>
          <section>
            <SectionTitle n={1} title="契約書類を添付する" />
            <p className="mb-2.5 text-[14px] leading-relaxed text-ink-600">
              「ファイルを選択」でパソコン内のファイル(PDF・写真など)を選びます。「必須」と書かれた書類は必ず添付してください。
            </p>
            <div className="overflow-hidden rounded-md border border-ink-200">
              {docs.map((d, i) => (
                <DocRow
                  key={d.kind}
                  doc={d}
                  required={REQUIRED_DOCS.includes(d.kind)}
                  error={touched && REQUIRED_DOCS.includes(d.kind) && !d.fileName}
                  sampleName={`${d.kind.replace(/[()]/g, "")}_署名済.pdf`}
                  onChange={(name) => setDocs((p) => p.map((x, j) => (j === i ? { ...x, fileName: name } : x)))}
                />
              ))}
            </div>
            {touched && errs.docs && <div className="mt-1.5 text-[12.5px] text-bad-600">{errs.docs}</div>}
          </section>

          <section>
            <SectionTitle n={2} title="管理部へのメモ(任意)" />
            <textarea
              className={textareaCls}
              placeholder="例: 請求書は本社経理部宛てでお願いします。"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </section>
          </>
          )}

          {step === 3 && (
            <section>
              <p className="mb-3 text-[15px] text-ink-700">内容を確認して、よろしければ「この内容で管理部へ提出する」を押してください。</p>
              <div className="overflow-hidden rounded-md border border-ink-200">
                {(
                  [
                    ["掲載する面", faceIds.map((id) => { const l = lookup.get(id); return `${l?.board.name} ${l?.face.label}`; }).join("、")],
                    ["掲載期間", `${fmtMonth(start)} 〜 ${fmtMonth(end)}(${months}ヶ月)`],
                    ["月額", yen(feeNum)],
                    ["契約総額", yen(feeNum * months)],
                    ["添付した書類", docs.filter((d) => d.fileName).map((d) => d.kind).join("、")],
                    ["管理部へのメモ", note.trim() || "なし"],
                  ] as [string, string][]
                ).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[120px_1fr] gap-3 border-b border-ink-100 px-4 py-3 text-[15px] last:border-0">
                    <span className="text-ink-500">{k}</span>
                    <span className="tnum text-ink-900">{v}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </Modal>
  );
}

function SectionTitle({ n, title }: { n: number; title: string }) {
  return (
    <div className="mb-2.5 flex items-center gap-2">
      <span className="tnum grid h-5 w-5 place-items-center rounded-full bg-navy-900 text-[12px] font-semibold text-white">{n}</span>
      <span className="text-[15px] font-semibold text-navy-900">{title}</span>
    </div>
  );
}

function Mini({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="px-2">
      <div className="text-[12px] text-ink-500">{label}</div>
      <div className={"tnum mt-0.5 " + (strong ? "text-[17px] font-semibold text-navy-900" : "text-[15px] text-ink-800")}>{value}</div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  const items = ["掲載内容", "書類の添付", "確認して提出"];
  return (
    <ol className="flex items-center gap-2">
      {items.map((label, i) => {
        const n = i + 1;
        const state = n < step ? "done" : n === step ? "now" : "todo";
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={
                "tnum grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px] font-semibold " +
                (state === "todo" ? "border border-ink-300 text-ink-400" : "bg-navy-900 text-white")
              }
            >
              {state === "done" ? <Check size={14} /> : n}
            </span>
            <span className={"text-[14px] " + (state === "now" ? "font-semibold text-navy-900" : "text-ink-500")}>{label}</span>
            {n < items.length && <span className="hidden h-px flex-1 bg-ink-200 sm:block" />}
          </li>
        );
      })}
    </ol>
  );
}
