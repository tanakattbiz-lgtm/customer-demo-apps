import { useState } from "react";
import { Link2, PencilLine } from "lucide-react";

/**
 * データの出どころの印。
 * - link: 工事指示システム(企画)から自動で入る想定の項目
 * - input: この営業管理システムで入力する項目
 */
export function SourceTag({ kind, compact }: { kind: "link" | "input"; compact?: boolean }) {
  return kind === "link" ? (
    <span
      title="工事指示システム(企画)から自動で入る想定の項目です"
      className="inline-flex shrink-0 items-center gap-1 rounded border border-navy-200 bg-navy-50 px-1.5 py-px text-[11.5px] font-medium whitespace-nowrap text-navy-700"
    >
      <Link2 size={11} />
      {!compact && "既存システムから自動"}
    </span>
  ) : (
    <span
      title="この営業管理システムで入力する項目です"
      className="inline-flex shrink-0 items-center gap-1 rounded border border-ink-200 bg-white px-1.5 py-px text-[11.5px] whitespace-nowrap text-ink-500"
    >
      <PencilLine size={11} />
      {!compact && "ここで入力"}
    </span>
  );
}

/** 項目定義・SE確認用シートの確認事項(Q番号)。画面上で「まだ決まっていない所」を示す */
export const QUESTIONS: Record<string, string> = {
  Q01: "案件の単位・キー(顧客×契約×媒体のどこで1案件にするか、複数媒体・折半の数え方)",
  Q02: "見込み3段階の判定基準、金額未確定・予定月不明の扱い、見込み履歴の保存",
  Q03: "看板・土地・高さの区分(新設/新規/既存、別項目にするか、4mちょうどの扱い)",
  Q04: "獲得経路と案件種別(テレアポで投資看板を受注した場合の分け方)",
  Q05: "金額の単位・端数(広告料は月額、地代は年額か。税込の出し方、比率の桁)",
  Q06: "既存システムとの連携(顧客・媒体・社員・WF・製造の取得可否、キー、更新責任者)",
  Q07: "担当者・閲覧範囲(各階層の閲覧・編集、代理入力、異動、折半計上)",
  Q08: "例外処理(見送り・失注・再開、受注取消、設置前解約、設置日の訂正)",
  Q09: "月末履歴・集計時点(過去月を当時の状態で再現する方法、修正時の締め直し)",
  Q10: "初回導入の範囲(今回作る機能と、後回しにする機能)",
  Q12: "予定額の定義(残りの予定だけか、実績込みの月全体の見通しか。対象にする見込み段階)",
  Q13: "解約の計上(解約日が意味する日、一部解約、取消・撤回、WFの更新責任)",
  Q14: "純増減と3ヶ月比較(値上げ・値下げを含めるか、当月途中・未来月・過去修正の表示)",
  Q16: "契約書スキャン添付(必須の時点、形式・容量、iPadでの操作、閲覧権限、差替え履歴)",
};
export function QTag({ id }: { id: keyof typeof QUESTIONS | string }) {
  const [open, setOpen] = useState(false);
  const text = QUESTIONS[id];
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center rounded border border-warn-300 bg-warn-50 px-1.5 py-px text-[11px] font-medium whitespace-nowrap text-warn-700 transition hover:bg-warn-100"
        aria-label={`確認中 ${id}`}
      >
        確認中 {id}
      </button>
      {open && text && (
        <span className="absolute top-full left-0 z-40 mt-1 w-64 rounded-md border border-ink-200 bg-white px-3 py-2 text-left text-[12.5px] leading-relaxed font-normal text-ink-700 shadow-[0_8px_24px_-8px_rgba(34,49,74,0.3)]">
          <span className="mb-0.5 block font-semibold text-navy-900">{id} 確認中</span>
          {text}
        </span>
      )}
    </span>
  );
}
