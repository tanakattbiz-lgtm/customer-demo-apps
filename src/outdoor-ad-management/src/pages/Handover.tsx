import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Check, FileText, Inbox, SearchX, Search, Undo2 } from "lucide-react";
import { useStore, staffName } from "../store";
import { ADMIN_DEPT, ADMIN_NAME, ISSUE_OPTIONS, REQUIRED_DOCS, type Handover as HO, type HandoverDoc, type HandoverStatus } from "../data/seed";
import { useLoad } from "../lib/useLoad";
import { fakeApi } from "../lib/fakeApi";
import { faceLookup } from "../lib/domain";
import { daysFromToday, fmtDateTime, fmtPeriod, monthsBetween, yen } from "../lib/format";
import { DocRow } from "../components/CloseDealModal";
import {
  Button,
  Card,
  Drawer,
  EmptyState,
  Field,
  Modal,
  PageHeader,
  Pagination,
  Pill,
  TableSkeleton,
  Tabs,
  inputCls,
  tableHeadCls,
  textareaCls,
  thCls,
} from "../components/ui";
import { HandoverPill } from "../components/pills";

type Tab = "todo" | "rejected" | "done" | "all";
const PER = 15;

export default function Handover() {
  const loading = useLoad();
  const [params, setParams] = useSearchParams();
  const handovers = useStore((s) => s.handovers);
  const contracts = useStore((s) => s.contracts);
  const customers = useStore((s) => s.customers);
  const [tab, setTab] = useState<Tab>("todo");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const selected = handovers.find((h) => h.id === params.get("id"));

  const cmap = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);
  const kmap = useMemo(() => new Map(contracts.map((c) => [c.id, c])), [contracts]);
  const inTab = (h: HO, t: Tab) =>
    t === "all" || (t === "todo" ? h.status === "提出済" || h.status === "再提出" : t === "rejected" ? h.status === "差し戻し" : h.status === "受領済");
  const counts = {
    todo: handovers.filter((h) => inTab(h, "todo")).length,
    rejected: handovers.filter((h) => inTab(h, "rejected")).length,
    done: handovers.filter((h) => inTab(h, "done")).length,
    all: handovers.length,
  };
  const rows = useMemo(() => {
    const kw = q.trim();
    return handovers
      .filter((h) => inTab(h, tab))
      .filter((h) => {
        if (!kw) return true;
        const c = kmap.get(h.contractId);
        return h.no.includes(kw) || (c && (c.no.includes(kw) || (cmap.get(c.customerId)?.company ?? "").includes(kw)));
      })
      .sort((a, b) => (tab === "done" ? b.updatedAt.localeCompare(a.updatedAt) : a.updatedAt.localeCompare(b.updatedAt)));
  }, [handovers, tab, q, kmap, cmap]);

  // 選択されたタブに対象がなければ「すべて」へ(URLから直接開いた場合)
  useEffect(() => {
    if (selected && !inTab(selected, tab)) setTab("all");
  }, [selected?.id]);

  return (
    <>
      <PageHeader
        eyebrow="Handover"
        title="管理部への引継ぎ"
        description="成約した契約の契約情報・契約書を管理部へ引き継ぎます。管理部は内容を確認し、受領または不備の差し戻しを行います。"
      />

      {/* フロー */}
      <Card className="mb-6 px-5 py-4">
        <div className="flex flex-col gap-3 text-[12.5px] md:flex-row md:items-center">
          <FlowStep role="営業" label="成約登録・書類提出" />
          <ArrowRight size={15} className="hidden shrink-0 text-ink-300 md:block" />
          <FlowStep role="管理部" label="内容・書類を確認" />
          <ArrowRight size={15} className="hidden shrink-0 text-ink-300 md:block" />
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Pill tone="ok">受領</Pill>
              <span className="text-ink-600">契約確定・請求等の後続業務へ</span>
            </div>
            <div className="flex items-center gap-2">
              <Pill tone="bad">差し戻し</Pill>
              <span className="text-ink-600">営業が修正して再提出</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="mb-4 flex flex-col gap-3 border-b border-ink-200 md:flex-row md:items-end md:justify-between">
        <Tabs<Tab>
          value={tab}
          onChange={(v) => {
            setTab(v);
            setPage(1);
          }}
          items={[
            { value: "todo", label: "管理部 確認待ち", count: counts.todo },
            { value: "rejected", label: "差し戻し中", count: counts.rejected },
            { value: "done", label: "受領済", count: counts.done },
            { value: "all", label: "すべて", count: counts.all },
          ]}
        />
        <div className="relative mb-2">
          <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" />
          <input className={inputCls + " w-full pl-8 md:w-60"} placeholder="引継ぎ番号・契約番号・広告主" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          q ? (
            <EmptyState icon={<SearchX size={20} />} title="該当する引継ぎがありません" />
          ) : (
            <EmptyState
              icon={<Inbox size={20} />}
              title={tab === "todo" ? "確認待ちの引継ぎはありません" : tab === "rejected" ? "差し戻し中の引継ぎはありません" : "引継ぎはまだありません"}
              description={tab === "todo" ? "営業が成約登録すると、ここに届きます。" : undefined}
            />
          )
        ) : (
          <>
            <div className="thin-scroll overflow-x-auto">
              <table className="w-full min-w-[920px] text-[13px]">
                <thead className={tableHeadCls}>
                  <tr>
                    <th className={thCls}>引継ぎ番号</th>
                    <th className={thCls}>広告主 / 契約</th>
                    <th className={thCls + " text-right"}>契約総額</th>
                    <th className={thCls}>提出者</th>
                    <th className={thCls}>最終更新</th>
                    <th className={thCls}>経過</th>
                    <th className={thCls}>状態</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice((page - 1) * PER, page * PER).map((h) => {
                    const c = kmap.get(h.contractId);
                    const age = -daysFromToday(h.updatedAt.slice(0, 10));
                    const missing = h.docs.filter((d) => !d.fileName).length;
                    return (
                      <tr key={h.id} onClick={() => setParams({ id: h.id })} className="cursor-pointer border-b border-ink-100 transition last:border-0 hover:bg-navy-50/50">
                        <td className="tnum px-4 py-3 text-ink-600">{h.no}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-navy-900">{c && cmap.get(c.customerId)?.company}</div>
                          <div className="text-[11.5px] text-ink-500">
                            <span className="tnum">{c?.no}</span> ・ {c?.faceIds.length}面{missing > 0 && ` ・ 任意書類 未添付${missing}`}
                          </div>
                        </td>
                        <td className="tnum px-4 py-3 text-right">{c && yen(c.monthlyFee * monthsBetween(c.startMonth, c.endMonth))}</td>
                        <td className="px-4 py-3 text-ink-700">{c && staffName(c.repId)}</td>
                        <td className="tnum px-4 py-3 text-ink-600">{fmtDateTime(h.updatedAt)}</td>
                        <td className="px-4 py-3">
                          {h.status === "受領済" ? (
                            <span className="text-ink-400">—</span>
                          ) : (
                            <span className={"tnum text-[12.5px] " + (age >= 3 ? "font-medium text-warn-700" : "text-ink-600")}>{age === 0 ? "本日" : `${age}日`}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <HandoverPill status={h.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} total={rows.length} per={PER} onChange={setPage} />
          </>
        )}
      </Card>

      <HandoverDrawer ho={selected} onClose={() => setParams({})} />
    </>
  );
}

function FlowStep({ role, label }: { role: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={"rounded px-2 py-1 text-[11px] font-medium " + (role === "営業" ? "bg-navy-100 text-navy-800" : "bg-navy-900 text-white")}>{role}</span>
      <span className="text-ink-800">{label}</span>
    </div>
  );
}

function HandoverDrawer({ ho, onClose }: { ho?: HO; onClose: () => void }) {
  const contract = useStore((s) => s.contracts.find((c) => c.id === ho?.contractId));
  const customer = useStore((s) => s.customers.find((c) => c.id === contract?.customerId));
  const boards = useStore((s) => s.boards);
  const receive = useStore((s) => s.receiveHandover);
  const lookup = useMemo(() => faceLookup(boards), [boards]);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [resubmitOpen, setResubmitOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const status: HandoverStatus | undefined = ho?.status;
  const adminTurn = status === "提出済" || status === "再提出";

  return (
    <>
      <Drawer
        open={!!ho}
        onClose={onClose}
        width={560}
        title={customer?.company}
        sub={ho && <span className="tnum">{ho.no}</span>}
        footer={
          ho &&
          (adminTurn ? (
            <>
              <span className="mr-auto text-[11.5px] text-ink-500">管理部の操作</span>
              <Button variant="danger" onClick={() => setRejectOpen(true)}>
                <Undo2 size={14} />
                差し戻す
              </Button>
              <Button
                loading={busy}
                onClick={async () => {
                  setBusy(true);
                  await fakeApi(null, 600);
                  receive(ho.id);
                  setBusy(false);
                  toast.success("契約書類を受領しました", { description: "契約が確定し、後続業務へ引き継がれました。" });
                }}
              >
                <Check size={14} />
                受領する
              </Button>
            </>
          ) : status === "差し戻し" ? (
            <>
              <span className="mr-auto text-[11.5px] text-ink-500">営業の操作</span>
              <Button onClick={() => setResubmitOpen(true)}>修正して再提出</Button>
            </>
          ) : undefined)
        }
      >
        {ho && contract && (
          <div className="space-y-6 px-6 py-5">
            <div className="flex items-center gap-2">
              <HandoverPill status={ho.status} />
              {ho.receivedAt && <span className="tnum text-[12px] text-ink-500">受領 {fmtDateTime(ho.receivedAt)}</span>}
            </div>

            {ho.status === "差し戻し" && (
              <div className="rounded-md border border-bad-100 bg-bad-50 px-4 py-3.5">
                <div className="text-[12.5px] font-semibold text-bad-700">管理部からの差し戻し内容</div>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-[12.5px] text-bad-700">
                  {ho.issues.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
                {ho.issueNote && <p className="mt-2 text-[12.5px] text-ink-700">{ho.issueNote}</p>}
              </div>
            )}

            <section>
              <div className="mb-2 text-[12px] font-medium text-ink-500">契約情報</div>
              <div className="rounded-md border border-ink-200">
                <div className="grid grid-cols-2 gap-px bg-ink-100">
                  {[
                    ["契約番号", contract.no],
                    ["担当営業", staffName(contract.repId)],
                    ["掲載期間", fmtPeriod(contract.startMonth, contract.endMonth)],
                    ["月額", yen(contract.monthlyFee)],
                    ["契約総額", yen(contract.monthlyFee * monthsBetween(contract.startMonth, contract.endMonth))],
                    ["先方担当", customer ? `${customer.contact}` : "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-white px-4 py-2.5">
                      <div className="text-[11px] text-ink-500">{k}</div>
                      <div className="tnum mt-0.5 text-[13px] text-ink-900">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-ink-100 px-4 py-2.5">
                  <div className="text-[11px] text-ink-500">掲載面</div>
                  {contract.faceIds.map((f) => {
                    const l = lookup.get(f);
                    return (
                      <Link key={f} to={`/boards/${l?.board.id}`} className="mt-0.5 block text-[13px] text-navy-800 hover:underline">
                        {l?.board.name} {l?.face.label}({l?.board.code})
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>

            <section>
              <div className="mb-2 text-[12px] font-medium text-ink-500">提出書類</div>
              <div className="overflow-hidden rounded-md border border-ink-200">
                {ho.docs.map((d) => (
                  <div key={d.kind} className="flex items-center gap-3 border-b border-ink-100 px-4 py-2.5 last:border-0">
                    <FileText size={15} className={d.fileName ? "text-navy-600" : "text-ink-300"} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] text-ink-900">
                        {d.kind}
                        {REQUIRED_DOCS.includes(d.kind) && <span className="ml-1.5 text-[10px] text-bad-500">必須</span>}
                      </div>
                      <div className="truncate text-[11.5px] text-ink-500">{d.fileName ?? "未添付"}</div>
                    </div>
                    {d.fileName && (
                      <button
                        onClick={() => toast("プレビュー", { description: `${d.fileName}(デモのためファイル内容は表示されません)` })}
                        className="text-[11.5px] text-navy-700 hover:underline"
                      >
                        表示
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-3 text-[12px] font-medium text-ink-500">やり取りの履歴</div>
              <ol className="space-y-0">
                {[...ho.history].reverse().map((e, i, arr) => (
                  <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                    {i < arr.length - 1 && <span className="absolute top-6 bottom-0 left-[11px] w-px bg-ink-200" />}
                    <span
                      className={
                        "z-10 mt-0.5 grid h-[23px] w-[23px] shrink-0 place-items-center rounded-full text-[10px] font-semibold " +
                        (e.role === "管理部" ? "bg-navy-900 text-white" : "bg-navy-100 text-navy-800")
                      }
                    >
                      {e.role === "管理部" ? "管" : "営"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 text-[12.5px]">
                        <span className={"font-semibold " + (e.action === "差し戻し" ? "text-bad-600" : e.action === "受領" ? "text-ok-700" : "text-navy-900")}>{e.action}</span>
                        <span className="text-ink-600">{e.actor}</span>
                        <span className="tnum text-[11.5px] text-ink-400">{fmtDateTime(e.at)}</span>
                      </div>
                      {e.note && <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-700">{e.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        )}
      </Drawer>
      {ho && <RejectModal open={rejectOpen} onClose={() => setRejectOpen(false)} id={ho.id} />}
      {ho && <ResubmitModal open={resubmitOpen} onClose={() => setResubmitOpen(false)} ho={ho} />}
    </>
  );
}

function RejectModal({ open, onClose, id }: { open: boolean; onClose: () => void; id: string }) {
  const reject = useStore((s) => s.rejectHandover);
  const [issues, setIssues] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) {
      setIssues([]);
      setNote("");
      setTouched(false);
    }
  }, [open]);
  const err = issues.length === 0 ? "不備の内容を1つ以上選択してください" : "";
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="不備を差し戻す"
      sub={`${ADMIN_DEPT} ${ADMIN_NAME}`}
      width={500}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            variant="danger"
            loading={busy}
            onClick={async () => {
              setTouched(true);
              if (err) return;
              setBusy(true);
              await fakeApi(null);
              reject(id, issues, note.trim());
              setBusy(false);
              onClose();
              toast.success("営業担当へ差し戻しました", { description: "担当者が修正して再提出すると、確認待ちに戻ります。" });
            }}
          >
            差し戻す
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="mb-2 text-[12px] font-medium text-ink-600">不備の内容</div>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {ISSUE_OPTIONS.map((o) => (
              <label key={o} className={"flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-[12.5px] transition " + (issues.includes(o) ? "border-navy-400 bg-navy-50 text-navy-900" : "border-ink-200 text-ink-700 hover:bg-ink-50")}>
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 accent-[oklch(29.5%_0.047_262)]"
                  checked={issues.includes(o)}
                  onChange={(e) => setIssues((p) => (e.target.checked ? [...p, o] : p.filter((x) => x !== o)))}
                />
                {o}
              </label>
            ))}
          </div>
          {touched && err && <div className="mt-1.5 text-[11.5px] text-bad-600">{err}</div>}
        </div>
        <Field label="営業担当へのコメント">
          <textarea className={textareaCls} placeholder="例: 契約書2ページ目の押印が漏れています。差し替えをお願いします。" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

function ResubmitModal({ open, onClose, ho }: { open: boolean; onClose: () => void; ho: HO }) {
  const resubmit = useStore((s) => s.resubmitHandover);
  const [docs, setDocs] = useState<HandoverDoc[]>(ho.docs);
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) {
      setDocs(ho.docs);
      setNote("");
      setTouched(false);
    }
  }, [open, ho]);
  const missing = docs.filter((d) => REQUIRED_DOCS.includes(d.kind) && !d.fileName);
  const err = { docs: missing.length ? "必須書類を添付してください" : "", note: !note.trim() ? "修正内容を入力してください" : "" };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="修正して再提出"
      width={620}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            loading={busy}
            onClick={async () => {
              setTouched(true);
              if (err.docs || err.note) return;
              setBusy(true);
              await fakeApi(null, 600);
              resubmit(ho.id, docs, note.trim());
              setBusy(false);
              onClose();
              toast.success("管理部へ再提出しました");
            }}
          >
            再提出する
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md border border-bad-100 bg-bad-50 px-4 py-3 text-[12.5px] text-bad-700">
          指摘事項: {ho.issues.join("、")}
          {ho.issueNote && <div className="mt-1 text-ink-700">{ho.issueNote}</div>}
        </div>
        <div>
          <div className="mb-2 text-[12px] font-medium text-ink-600">書類の差し替え</div>
          <div className="overflow-hidden rounded-md border border-ink-200">
            {docs.map((d, i) => (
              <DocRow
                key={d.kind}
                doc={d}
                required={REQUIRED_DOCS.includes(d.kind)}
                sampleName={`${d.kind.replace(/[()]/g, "")}_修正版.pdf`}
                error={touched && REQUIRED_DOCS.includes(d.kind) && !d.fileName}
                onChange={(name) => setDocs((p) => p.map((x, j) => (j === i ? { ...x, fileName: name } : x)))}
              />
            ))}
          </div>
          {touched && err.docs && <div className="mt-1.5 text-[11.5px] text-bad-600">{err.docs}</div>}
        </div>
        <Field label="管理部へのコメント" required error={touched ? err.note : ""}>
          <textarea className={textareaCls} placeholder="例: 押印済みの契約書に差し替えました。" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
