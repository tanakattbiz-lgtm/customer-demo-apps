import { subDays, addDays, subHours, subMinutes } from "date-fns";

/* =========================================================================
 * 内航海運 配船・運航進捗モニタリングシステム — シードデータ
 *
 * 業務の流れ:
 *   荷主から配船依頼を受注 → 本船を配船 → 積地/揚地の荷役を手配 →
 *   運航中の進捗を遠隔で監視 → 揚げ荷完了 → 運賃を請求 → 入金確認
 *
 * 各「配船案件(Voyage)」は複数の「確認事項(CheckItem)」を持ち、
 * 期日超過・不備が発生すると管理者へアラートが飛ぶ。
 * ここに入っているのはすべて自作のダミーデータ(実在の企業・個人ではない)。
 * ========================================================================= */

const iso = (d: Date) => d.toISOString();
const now = new Date();

// ---- 型定義 --------------------------------------------------------------

export type CargoType = "鋼材" | "石油製品" | "セメント" | "一般貨物";

export type ItemStatus = "未着手" | "進行中" | "完了" | "不備";

export interface CheckItem {
  id: string;
  label: string;
  status: ItemStatus;
  assigneeId: string;
  dueAt: string; // 期日
  completedAt?: string;
  note?: string;
}

/** 配船案件(受注 1 件 = 1 航海) */
export interface Voyage {
  id: string;
  code: string; // 例: VY-2607-018
  shipperId: string; // 荷主(取引先)
  cargo: CargoType;
  cargoDetail: string; // 例: 熱延コイル 1,800t
  vesselId: string; // 本船
  loadPort: string; // 積地
  dischargePort: string; // 揚地
  assigneeId: string; // 運航担当(社員)
  priority: "高" | "中" | "低";
  freight: number; // 運賃(円)
  receivedAt: string; // 受注日時
  etd: string; // 出港予定
  eta: string; // 入港予定
  items: CheckItem[];
  createdAt: string;
  updatedAt: string;
}

export type AlertKind = "期日超過" | "不備" | "停滞" | "期日接近";
export type AlertStatus = "未確認" | "確認済" | "対応済";

export interface Alert {
  id: string;
  voyageId: string;
  voyageCode: string;
  kind: AlertKind;
  severity: "高" | "中" | "低";
  message: string;
  at: string;
  status: AlertStatus;
  assigneeId: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  team: "運航部" | "業務部" | "管理部";
  color: string;
}

export interface Shipper {
  id: string;
  name: string;
  cargo: CargoType;
}

export interface AppData {
  staff: Staff[];
  shippers: Shipper[];
  voyages: Voyage[];
  alerts: Alert[];
}

// 監視する側(管理者 = ログインユーザー)
export const CURRENT_USER_ID = "s_manager";

// ---- 社員(運航担当・管理者)---------------------------------------------

export const STAFF: Staff[] = [
  { id: "s_manager", name: "運航管理者", role: "運航管理者(あなた)", team: "管理部", color: "oklch(50% 0.13 224)" },
  { id: "s_sato", name: "佐藤 健太", role: "運航担当", team: "運航部", color: "oklch(55% 0.14 30)" },
  { id: "s_takada", name: "髙田 美咲", role: "運航担当", team: "運航部", color: "oklch(55% 0.14 150)" },
  { id: "s_ishii", name: "石井 亮", role: "運航担当", team: "運航部", color: "oklch(55% 0.13 280)" },
  { id: "s_okada", name: "岡田 由紀", role: "業務担当", team: "業務部", color: "oklch(58% 0.13 90)" },
  { id: "s_mori", name: "森 大輔", role: "運航担当", team: "運航部", color: "oklch(52% 0.13 330)" },
  { id: "s_hara", name: "原 彩花", role: "業務担当", team: "業務部", color: "oklch(56% 0.12 200)" },
];

const OPERATORS = ["s_sato", "s_takada", "s_ishii", "s_mori"];

// ---- 荷主(取引先)-------------------------------------------------------

export const SHIPPERS: Shipper[] = [
  { id: "sh_towa", name: "東和鋼材株式会社", cargo: "鋼材" },
  { id: "sh_kaiyo", name: "海洋製鉄株式会社", cargo: "鋼材" },
  { id: "sh_daiichi", name: "第一石油輸送株式会社", cargo: "石油製品" },
  { id: "sh_rinkai", name: "臨海エネルギー株式会社", cargo: "石油製品" },
  { id: "sh_minato", name: "みなとセメント工業株式会社", cargo: "セメント" },
  { id: "sh_seto", name: "瀬戸内マテリアル株式会社", cargo: "セメント" },
  { id: "sh_kyowa", name: "協和物産株式会社", cargo: "一般貨物" },
  { id: "sh_nissan", name: "日進化成株式会社", cargo: "石油製品" },
];

// ---- 本船(自社船・傭船)-------------------------------------------------

interface Vessel {
  id: string;
  name: string;
  type: CargoType;
  dwt: number;
}
export const VESSELS: Vessel[] = [
  { id: "v1", name: "第十八 日昌丸", type: "鋼材", dwt: 4980 },
  { id: "v2", name: "幸洋丸", type: "鋼材", dwt: 6200 },
  { id: "v3", name: "第五 恵比寿丸", type: "石油製品", dwt: 3500 },
  { id: "v4", name: "天佑丸", type: "石油製品", dwt: 4100 },
  { id: "v5", name: "白嶺丸", type: "セメント", dwt: 5300 },
  { id: "v6", name: "第七 住吉丸", type: "セメント", dwt: 4700 },
  { id: "v7", name: "翔洋丸", type: "一般貨物", dwt: 2990 },
];

// ---- 港(積地/揚地)------------------------------------------------------

const PORTS = [
  "京浜(川崎)", "千葉", "水島", "四日市", "堺泉北", "名古屋",
  "神戸", "北九州(戸畑)", "君津", "鹿島", "宇部", "苫小牧",
];

// ---- 確認事項テンプレート(貨物種別ごと)---------------------------------

interface ItemTpl {
  label: string;
  // 受注からの相対期日(日)。運航フローの順序に対応。
  offset: number;
}

const BASE_STEPS: ItemTpl[] = [
  { label: "用船契約・運賃合意", offset: 1 },
  { label: "本船スケジュール確定", offset: 2 },
  { label: "積地バース・荷役手配", offset: 3 },
];
const MID_STEPS: Record<CargoType, ItemTpl[]> = {
  鋼材: [
    { label: "船積み明細・検数確認", offset: 4 },
    { label: "ラッシング(固縛)確認", offset: 5 },
  ],
  石油製品: [
    { label: "危険物明細・安全確認書", offset: 4 },
    { label: "タンク洗浄・前積み確認", offset: 5 },
  ],
  セメント: [
    { label: "数量(検量)確認", offset: 4 },
    { label: "荷役設備(アンローダ)手配", offset: 5 },
  ],
  一般貨物: [
    { label: "貨物明細・数量確認", offset: 4 },
    { label: "積付け計画確認", offset: 5 },
  ],
};
const END_STEPS: ItemTpl[] = [
  { label: "揚地バース・受入手配", offset: 7 },
  { label: "運送完了報告", offset: 9 },
  { label: "運賃請求書発行", offset: 11 },
  { label: "入金確認", offset: 25 },
];

function buildItems(
  cargo: CargoType,
  receivedAt: Date,
  progress: number, // 0..1 どこまで進んでいるか
  assigneeId: string,
  opts: { defect?: number } = {},
): CheckItem[] {
  const tpls = [...BASE_STEPS, ...MID_STEPS[cargo], ...END_STEPS];
  const total = tpls.length;
  const doneCount = Math.round(progress * total);
  return tpls.map((t, i) => {
    const dueAt = addDays(receivedAt, t.offset);
    let status: ItemStatus;
    let completedAt: string | undefined;
    let note: string | undefined;
    if (i < doneCount) {
      status = "完了";
      completedAt = iso(addDays(receivedAt, Math.max(0, t.offset - 0.5)));
    } else if (i === doneCount) {
      status = "進行中";
    } else {
      status = "未着手";
    }
    // 不備を仕込む(指定インデックス)
    if (opts.defect === i) {
      status = "不備";
      completedAt = undefined;
      note = DEFECT_NOTES[cargo] ?? "書類に不備があります。差し戻し中。";
    }
    return {
      id: `${cargo}-${i}-${Math.round(receivedAt.getTime() / 1000) % 100000}`,
      label: t.label,
      status,
      assigneeId,
      dueAt: iso(dueAt),
      completedAt,
      note,
    };
  });
}

const DEFECT_NOTES: Record<CargoType, string> = {
  鋼材: "検数票の数量と契約数量に相違あり。荷主へ照会中。",
  石油製品: "危険物明細書の記載漏れ。安全確認書の再提出待ち。",
  セメント: "検量記録が未添付。荷役会社へ再依頼。",
  一般貨物: "梱包明細の一部が不足。荷主へ確認依頼中。",
};

const CARGO_DETAIL: Record<CargoType, string[]> = {
  鋼材: ["熱延コイル 1,800t", "厚板 2,400t", "H形鋼 1,200t", "鋼管 950t", "線材コイル 1,600t"],
  石油製品: ["A重油 2,000kl", "軽油 1,500kl", "ガソリン 1,200kl", "灯油 1,800kl", "潤滑油基油 900kl"],
  セメント: ["普通ポルトランドセメント 3,200t", "高炉セメント 2,800t", "クリンカ 4,000t", "フライアッシュ 1,500t"],
  一般貨物: ["珪砂 1,100t", "石灰石 2,600t", "肥料原料 1,400t", "産業塩 1,900t"],
};

// ---- 配船案件の生成 ------------------------------------------------------

let vc = 0;
function makeVoyage(
  shipper: Shipper,
  daysAgo: number,
  progress: number,
  opts: { defect?: number; priority?: "高" | "中" | "低"; assigneeId?: string } = {},
): Voyage {
  vc += 1;
  const cargo = shipper.cargo;
  const receivedAt = subHours(subDays(now, daysAgo), (vc * 3) % 20);
  const assigneeId = opts.assigneeId ?? OPERATORS[vc % OPERATORS.length];
  const vessel = VESSELS.filter((v) => v.type === cargo)[vc % VESSELS.filter((v) => v.type === cargo).length];
  const load = PORTS[vc % PORTS.length];
  let disc = PORTS[(vc * 5 + 3) % PORTS.length];
  if (disc === load) disc = PORTS[(vc * 5 + 4) % PORTS.length];
  const items = buildItems(cargo, receivedAt, progress, assigneeId, { defect: opts.defect });
  const code = `VY-${2607}-${String(100 + vc).slice(1)}`;
  const detailList = CARGO_DETAIL[cargo];
  const freightBase = cargo === "石油製品" ? 3_600_000 : cargo === "鋼材" ? 2_900_000 : cargo === "セメント" ? 2_400_000 : 1_800_000;
  return {
    id: `vy_${vc}`,
    code,
    shipperId: shipper.id,
    cargo,
    cargoDetail: detailList[vc % detailList.length],
    vesselId: vessel.id,
    loadPort: load,
    dischargePort: disc,
    assigneeId,
    priority: opts.priority ?? (["高", "中", "中", "低"] as const)[vc % 4],
    freight: freightBase + ((vc * 137_000) % 900_000),
    receivedAt: iso(receivedAt),
    etd: iso(addDays(receivedAt, 3)),
    eta: iso(addDays(receivedAt, 6)),
    items,
    createdAt: iso(receivedAt),
    updatedAt: iso(subHours(now, (vc * 2) % 30)),
  };
}

const S = Object.fromEntries(SHIPPERS.map((s) => [s.id, s])) as Record<string, Shipper>;

function buildVoyages(): Voyage[] {
  return [
    // 進行中(順調)
    makeVoyage(S.sh_towa, 2, 0.35, { priority: "高" }),
    makeVoyage(S.sh_daiichi, 3, 0.55),
    makeVoyage(S.sh_minato, 1, 0.2, { priority: "中" }),
    makeVoyage(S.sh_kaiyo, 4, 0.66),
    // 不備あり(アラート対象)
    makeVoyage(S.sh_rinkai, 5, 0.5, { defect: 3, priority: "高" }),
    makeVoyage(S.sh_seto, 6, 0.45, { defect: 4 }),
    // 期日超過リスク(停滞)
    makeVoyage(S.sh_kyowa, 8, 0.28, { priority: "高" }),
    makeVoyage(S.sh_nissan, 7, 0.4),
    // 順調に進行
    makeVoyage(S.sh_towa, 3, 0.44),
    makeVoyage(S.sh_minato, 5, 0.6),
    makeVoyage(S.sh_daiichi, 6, 0.7),
    makeVoyage(S.sh_kaiyo, 2, 0.15, { priority: "中" }),
    // 不備あり
    makeVoyage(S.sh_towa, 9, 0.55, { defect: 1, priority: "高" }),
    // 完了間近
    makeVoyage(S.sh_seto, 10, 0.85),
    makeVoyage(S.sh_kyowa, 11, 0.9),
    // 完了
    makeVoyage(S.sh_daiichi, 16, 1),
    makeVoyage(S.sh_minato, 18, 1),
    makeVoyage(S.sh_kaiyo, 20, 1),
    // 新規受注(着手前)
    makeVoyage(S.sh_nissan, 0, 0.05, { priority: "高" }),
    makeVoyage(S.sh_rinkai, 0, 0.05, { priority: "中" }),
  ];
}

// ---- アラートの生成(不備・期日超過を検出済みの想定)---------------------

let ac = 0;
function mkAlert(v: Voyage, kind: AlertKind, severity: "高" | "中" | "低", message: string, minsAgo: number): Alert {
  ac += 1;
  return {
    id: `al_${ac}`,
    voyageId: v.id,
    voyageCode: v.code,
    kind,
    severity,
    message,
    at: iso(subMinutes(now, minsAgo)),
    status: ac <= 2 ? "未確認" : ac <= 5 ? "確認済" : "対応済",
    assigneeId: v.assigneeId,
  };
}

function buildAlerts(voyages: Voyage[]): Alert[] {
  const out: Alert[] = [];
  for (const v of voyages) {
    const defect = v.items.find((it) => it.status === "不備");
    if (defect) {
      out.push(
        mkAlert(v, "不備", v.priority === "高" ? "高" : "中", `「${defect.label}」に不備 — ${defect.note}`, 12 + out.length * 37),
      );
    }
  }
  // 期日接近・停滞のサンプル
  const running = voyages.filter((v) => v.items.some((it) => it.status === "進行中"));
  if (running[0]) out.push(mkAlert(running[0], "期日接近", "中", `「${running[0].items.find((i) => i.status === "進行中")?.label}」の期日が24時間以内です。`, 55));
  if (running[2]) out.push(mkAlert(running[2], "停滞", "低", "48時間 進捗の更新がありません。担当者に状況確認を推奨。", 190));
  if (running[1]) out.push(mkAlert(running[1], "期日接近", "低", "揚地バースの受入手配 期日が近づいています。", 320));
  return out.sort((a, b) => b.at.localeCompare(a.at));
}

// ---- エクスポート --------------------------------------------------------

export function buildSeed(): AppData {
  vc = 0;
  ac = 0;
  const voyages = buildVoyages();
  const alerts = buildAlerts(voyages);
  return { staff: STAFF, shippers: SHIPPERS, voyages, alerts };
}

// ---- 参照ヘルパ ----------------------------------------------------------

export const vesselName = (id: string) => VESSELS.find((v) => v.id === id)?.name ?? "—";
export const staffById = (staff: Staff[], id: string) => staff.find((s) => s.id === id);
export const shipperById = (shippers: Shipper[], id: string) => shippers.find((s) => s.id === id);
