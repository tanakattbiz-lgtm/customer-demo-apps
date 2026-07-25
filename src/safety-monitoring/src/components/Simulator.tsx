import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FlaskConical, ChevronRight } from "lucide-react";
import { useStore } from "../store";
import { EVENT_CATALOG, SEVERITY_TONE } from "../lib/domain";
import type { AlertKind } from "../data/seed";
import { Avatar, Button, Field, Modal, Pill, inputCls } from "./ui";
import { fakeApi } from "../lib/fakeApi";

/**
 * 検証用ダミーデータ入力(PoC の肝)。
 * 対象者とイベント種別を選び「発報」すると、ライブ状態が変化し
 * アラートが生成される。実機センサーを待たずに検証フローを一周できる。
 */
export default function Simulator() {
  const open = useStore((s) => s.ui.simOpen);
  const presetUserId = useStore((s) => s.ui.simUserId);
  const users = useStore((s) => s.users);
  const closeSim = useStore((s) => s.closeSim);
  const injectEvent = useStore((s) => s.injectEvent);

  const [userId, setUserId] = useState("");
  const [kind, setKind] = useState<AlertKind>("転倒検知");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setUserId(presetUserId ?? users[0]?.id ?? "");
      setSending(false);
    }
  }, [open, presetUserId, users]);

  const selected = users.find((u) => u.id === userId);
  const def = EVENT_CATALOG.find((e) => e.kind === kind)!;

  const fire = async () => {
    if (!selected) return;
    setSending(true);
    await fakeApi(true, 620);
    const alert = injectEvent(selected.id, kind);
    setSending(false);
    closeSim();
    if (alert) {
      toast.warning(`検証イベント発報 — ${selected.name} 様`, {
        description: `${kind}:${alert.message}`,
      });
    }
  };

  return (
    <Modal
      open={open}
      onClose={closeSim}
      title="検証用イベント発報"
      subtitle="実機センサーを待たずに、擬似イベントで見守りフローを検証します"
      width={560}
    >
      <div className="space-y-5">
        <Field label="対象者" hint="登録済みの見守り対象から選択します">
          <div className="thin-scroll grid max-h-52 grid-cols-1 gap-1.5 overflow-y-auto sm:grid-cols-2">
            {users.map((u) => {
              const active = u.id === userId;
              return (
                <button
                  key={u.id}
                  onClick={() => setUserId(u.id)}
                  className={
                    "flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition " +
                    (active
                      ? "border-teal-400 bg-teal-50 ring-2 ring-teal-400/20"
                      : "border-slate-200 hover:bg-slate-50")
                  }
                >
                  <Avatar name={u.name} color={u.color} size={30} />
                  <div className="min-w-0 leading-tight">
                    <div className="truncate text-sm font-semibold text-slate-800">{u.name}</div>
                    <div className="truncate text-[11px] text-slate-400">{u.location}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="イベント種別">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as AlertKind)}
            className={inputCls}
          >
            {EVENT_CATALOG.map((e) => (
              <option key={e.kind} value={e.kind}>
                {e.kind}(重要度 {e.severity})
              </option>
            ))}
          </select>
        </Field>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-1 flex items-center gap-2">
            <Pill tone={SEVERITY_TONE[def.severity]}>重要度 {def.severity}</Pill>
            <span className="text-sm font-semibold text-slate-700">{def.kind}</span>
          </div>
          <p className="text-sm text-slate-500">{def.desc}</p>
          {selected && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span>{selected.name} 様</span>
              <ChevronRight size={13} className="text-slate-300" />
              <span>{selected.device}</span>
              <ChevronRight size={13} className="text-slate-300" />
              <span>アラート生成 + 通知</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={closeSim} disabled={sending}>
            キャンセル
          </Button>
          <Button onClick={fire} loading={sending} disabled={!selected}>
            {!sending && <FlaskConical size={16} />}
            このイベントを発報
          </Button>
        </div>
      </div>
    </Modal>
  );
}
