import { type ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, LogOut, Phone, X } from "lucide-react";
import { useStore } from "../store";
import { SAFETY_CONTACTS } from "../data/seed";
import { Avatar, Modal } from "./ui";

export default function StaffShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const logout = useStore((s) => s.logout);
  const staffList = useStore((s) => s.staffList);
  const currentStaffId = useStore((s) => s.currentStaffId);
  const me = staffList.find((s) => s.id === currentStaffId) ?? staffList[0];
  const [sosOpen, setSosOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink-100 pb-24">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-ink-200 bg-white/90 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            <Car size={16} />
          </div>
          <span className="text-sm font-bold text-ink-900">車両管理システム</span>
        </div>
        <div className="flex items-center gap-2">
          <Avatar name={me?.name ?? "ス"} size={30} />
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            aria-label="ログアウト"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg px-4 py-5">{children}</main>

      <button
        onClick={() => setSosOpen(true)}
        className="fixed bottom-5 right-5 z-20 flex items-center gap-2 rounded-full bg-rose-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-rose-600/30 transition active:scale-95"
      >
        <Phone size={16} />
        事故・トラブル
      </button>

      <Modal open={sosOpen} onClose={() => setSosOpen(false)} title="緊急連絡先">
        <div className="space-y-2">
          {SAFETY_CONTACTS.map((c) => (
            <a
              key={c.label}
              href={`tel:${c.tel.replace(/-/g, "")}`}
              className="flex items-center justify-between rounded-xl border border-ink-200 px-4 py-3 transition hover:bg-ink-50"
            >
              <div>
                <div className="text-sm font-semibold text-ink-900">{c.label}</div>
                <div className="tnum text-xs text-ink-500">{c.tel}</div>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-600">
                <Phone size={16} />
              </span>
            </a>
          ))}
        </div>
        <button
          onClick={() => setSosOpen(false)}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-ink-200 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50"
        >
          <X size={14} /> 閉じる
        </button>
      </Modal>
    </div>
  );
}
