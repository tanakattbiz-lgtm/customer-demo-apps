import { subDays, subHours, addDays } from "date-fns";

/* =========================================================================
 * 型定義
 * ========================================================================= */

/** 加工会社(見積依頼先)。※システムに登録されたサンプルの取引先データ。 */
export interface Supplier {
  id: string;
  name: string;
  /** 得意分野(材質・加工)。依頼先の自動サジェストに使用。 */
  specialties: string[];
  /** 標準回答目安(営業日) */
  leadDays: number;
  /** 担当者名 */
  contact: string;
  /** これまでの発注実績(件) */
  orders: number;
}

/** 物件(オーダーメイド設備の案件) */
export interface Project {
  id: string;
  /** 物件番号 */
  code: string;
  /** 物件名 */
  name: string;
  /** 納入先(エンドユーザー) */
  destination: string;
  /** 納品希望日 */
  dueDate: string;
  note?: string;
}

/** 部品(見積依頼シートの1行) */
export interface Part {
  id: string;
  projectId: string;
  /** 部品名 */
  name: string;
  /** 材質 */
  material: string;
  /** 数量 */
  qty: number;
  /** 単位 */
  unit: string;
  /** 希望納期 */
  dueDate: string;
  /** 図番(図面フォルダ検索のキー) */
  drawingNo: string;
  /** 見積依頼先(最大3社) */
  supplierIds: string[];
}

export type SendMode = "送信" | "下書き";

/** 送信履歴(1通のメール = 1レコード) */
export interface HistoryRecord {
  id: string;
  at: string;
  mode: SendMode;
  supplierId: string;
  supplierName: string;
  contact: string;
  projectCode: string;
  projectName: string;
  subject: string;
  /** 依頼した部品名 */
  parts: string[];
  /** 添付された図面ファイル名 */
  attachments: string[];
  /** 図面が見つからなかった図番 */
  missing: string[];
}

export interface AppData {
  suppliers: Supplier[];
  projects: Project[];
  parts: Part[];
  /** 図面フォルダの中身(図番 → 実在するファイル名の配列)。自動検索の対象。 */
  drawingFolder: Record<string, string[]>;
  history: HistoryRecord[];
}

export const CURRENT_USER = { name: "森 博幸", role: "設計・調達 担当", initial: "森" };

/* =========================================================================
 * マスタ:加工会社(サンプル取引先)
 * ========================================================================= */

const SUPPLIERS: Supplier[] = [
  { id: "sp1", name: "東和精密工業", specialties: ["ステンレス", "アルミ", "マシニング"], leadDays: 7, contact: "斉藤 誠", orders: 128 },
  { id: "sp2", name: "北関東鉄工所", specialties: ["鉄", "溶接", "板金"], leadDays: 9, contact: "大久保 亮", orders: 96 },
  { id: "sp3", name: "山田製作所", specialties: ["アルミ", "板金", "曲げ"], leadDays: 6, contact: "山田 和彦", orders: 214 },
  { id: "sp4", name: "コスモ金属加工", specialties: ["ステンレス", "溶接", "研磨"], leadDays: 8, contact: "藤本 直人", orders: 73 },
  { id: "sp5", name: "三栄テクノ", specialties: ["樹脂", "切削", "マシニング"], leadDays: 10, contact: "松岡 里奈", orders: 51 },
  { id: "sp6", name: "第一プレス工業", specialties: ["鉄", "プレス", "板金"], leadDays: 12, contact: "小林 秀樹", orders: 145 },
  { id: "sp7", name: "ナカジマ製作", specialties: ["アルミ", "ステンレス", "マシニング"], leadDays: 7, contact: "中島 佳孝", orders: 88 },
  { id: "sp8", name: "光洋バルブ工業", specialties: ["鋳物", "旋盤", "鉄"], leadDays: 14, contact: "河野 健一", orders: 39 },
];

/* =========================================================================
 * 物件
 * ========================================================================= */

const PROJECTS: Project[] = [
  {
    id: "pj1",
    code: "PJ-2608-014",
    name: "電池部材ライン向け 搬送コンベア一式",
    destination: "△△エナジー 第2工場",
    dueDate: addDays(new Date(), 36).toISOString(),
    note: "既設ラインとの取合いあり。フレームは現地寸法優先。",
  },
  {
    id: "pj2",
    code: "PJ-2607-041",
    name: "自動計量・充填ユニット 架台改造",
    destination: "◇◇フーズ 関西センター",
    dueDate: addDays(new Date(), 21).toISOString(),
    note: "洗浄対応のためステンレス指定部あり。",
  },
  {
    id: "pj3",
    code: "PJ-2606-088",
    name: "検査工程 治具・カバー製作",
    destination: "□□電機 本社工場",
    dueDate: addDays(new Date(), 12).toISOString(),
  },
];

/* =========================================================================
 * 図面フォルダ(自動検索の対象)
 * =========================================================================
 * 図番をキーに、フォルダ内に「実在する」ファイル名を持たせる。
 * 一部の部品はわざと図面が未登録 → 「図面が見つかりません」を体感させる。
 */

const DRAWING_FOLDER: Record<string, string[]> = {
  "AP-2041": ["AP-2041_組図.pdf", "AP-2041_フレーム.dxf"],
  "AP-2042": ["AP-2042_ローラ.pdf", "AP-2042.dxf"],
  "AP-2043": ["AP-2043_駆動部.pdf"],
  "AP-2044": ["AP-2044_ガイド.dxf"],
  "AP-2045": ["AP-2045_カバー.pdf", "AP-2045_カバー.dxf"],
  "BF-1180": ["BF-1180_架台.pdf", "BF-1180_架台.dxf"],
  "BF-1181": ["BF-1181_ホッパ.pdf"],
  "BF-1182": ["BF-1182_配管サポート.dxf"],
  "CK-3307": ["CK-3307_治具ベース.pdf", "CK-3307.dxf"],
  "CK-3308": ["CK-3308_位置決めピン.pdf"],
  // CK-3309・BF-1183 は未登録(図面が見つからないケース)
};

/* =========================================================================
 * 部品(見積依頼シート)
 * ========================================================================= */

const PARTS: Part[] = [
  // --- PJ-2608-014 搬送コンベア ---
  { id: "pt01", projectId: "pj1", name: "メインフレーム", material: "SS400", qty: 2, unit: "式", drawingNo: "AP-2041", dueDate: addDays(new Date(), 20).toISOString(), supplierIds: ["sp2", "sp6"] },
  { id: "pt02", projectId: "pj1", name: "搬送ローラ Assy", material: "アルミA5052", qty: 24, unit: "本", drawingNo: "AP-2042", dueDate: addDays(new Date(), 18).toISOString(), supplierIds: ["sp3", "sp1", "sp7"] },
  { id: "pt03", projectId: "pj1", name: "駆動部ブラケット", material: "SS400", qty: 4, unit: "個", drawingNo: "AP-2043", dueDate: addDays(new Date(), 18).toISOString(), supplierIds: ["sp1"] },
  { id: "pt04", projectId: "pj1", name: "サイドガイド", material: "アルミA5052", qty: 8, unit: "本", drawingNo: "AP-2044", dueDate: addDays(new Date(), 22).toISOString(), supplierIds: [] },
  { id: "pt05", projectId: "pj1", name: "安全カバー", material: "SUS304", qty: 6, unit: "枚", drawingNo: "AP-2045", dueDate: addDays(new Date(), 24).toISOString(), supplierIds: ["sp4"] },

  // --- PJ-2607-041 充填ユニット架台 ---
  { id: "pt06", projectId: "pj2", name: "改造架台フレーム", material: "SUS304", qty: 1, unit: "式", drawingNo: "BF-1180", dueDate: addDays(new Date(), 10).toISOString(), supplierIds: ["sp4", "sp1"] },
  { id: "pt07", projectId: "pj2", name: "計量ホッパ", material: "SUS304", qty: 2, unit: "個", drawingNo: "BF-1181", dueDate: addDays(new Date(), 12).toISOString(), supplierIds: ["sp4"] },
  { id: "pt08", projectId: "pj2", name: "配管サポート", material: "SUS304", qty: 12, unit: "個", drawingNo: "BF-1182", dueDate: addDays(new Date(), 9).toISOString(), supplierIds: [] },
  { id: "pt09", projectId: "pj2", name: "調整ハンドル", material: "樹脂MC901", qty: 4, unit: "個", drawingNo: "BF-1183", dueDate: addDays(new Date(), 14).toISOString(), supplierIds: ["sp5"] },

  // --- PJ-2606-088 検査治具 ---
  { id: "pt10", projectId: "pj3", name: "治具ベースプレート", material: "アルミA5052", qty: 3, unit: "枚", drawingNo: "CK-3307", dueDate: addDays(new Date(), 6).toISOString(), supplierIds: ["sp3", "sp7"] },
  { id: "pt11", projectId: "pj3", name: "位置決めピン", material: "SUS440C", qty: 20, unit: "本", drawingNo: "CK-3308", dueDate: addDays(new Date(), 7).toISOString(), supplierIds: ["sp1"] },
  { id: "pt12", projectId: "pj3", name: "防塵カバー", material: "樹脂PC", qty: 5, unit: "枚", drawingNo: "CK-3309", dueDate: addDays(new Date(), 8).toISOString(), supplierIds: [] },
];

/* =========================================================================
 * 初期の送信履歴
 * ========================================================================= */

function seedHistory(): HistoryRecord[] {
  return [
    {
      id: "h1",
      at: subHours(new Date(), 3).toISOString(),
      mode: "送信",
      supplierId: "sp3",
      supplierName: "山田製作所",
      contact: "山田 和彦",
      projectCode: "PJ-2606-088",
      projectName: "検査工程 治具・カバー製作",
      subject: "【見積依頼】PJ-2606-088 治具ベースプレート 他1件（○○製作所）",
      parts: ["治具ベースプレート"],
      attachments: ["CK-3307_治具ベース.pdf", "CK-3307.dxf"],
      missing: [],
    },
    {
      id: "h2",
      at: subHours(new Date(), 3).toISOString(),
      mode: "送信",
      supplierId: "sp7",
      supplierName: "ナカジマ製作",
      contact: "中島 佳孝",
      projectCode: "PJ-2606-088",
      projectName: "検査工程 治具・カバー製作",
      subject: "【見積依頼】PJ-2606-088 治具ベースプレート（○○製作所）",
      parts: ["治具ベースプレート"],
      attachments: ["CK-3307_治具ベース.pdf", "CK-3307.dxf"],
      missing: [],
    },
    {
      id: "h3",
      at: subDays(new Date(), 1).toISOString(),
      mode: "下書き",
      supplierId: "sp1",
      supplierName: "東和精密工業",
      contact: "斉藤 誠",
      projectCode: "PJ-2606-088",
      projectName: "検査工程 治具・カバー製作",
      subject: "【見積依頼】PJ-2606-088 位置決めピン（○○製作所）",
      parts: ["位置決めピン"],
      attachments: ["CK-3308_位置決めピン.pdf"],
      missing: [],
    },
    {
      id: "h4",
      at: subDays(new Date(), 2).toISOString(),
      mode: "送信",
      supplierId: "sp4",
      supplierName: "コスモ金属加工",
      contact: "藤本 直人",
      projectCode: "PJ-2607-041",
      projectName: "自動計量・充填ユニット 架台改造",
      subject: "【見積依頼】PJ-2607-041 計量ホッパ 他1件（○○製作所）",
      parts: ["計量ホッパ", "改造架台フレーム"],
      attachments: ["BF-1181_ホッパ.pdf", "BF-1180_架台.pdf", "BF-1180_架台.dxf"],
      missing: [],
    },
  ];
}

/* =========================================================================
 * seed 生成
 * ========================================================================= */

export function buildSeed(): AppData {
  return {
    suppliers: SUPPLIERS.map((s) => ({ ...s })),
    projects: PROJECTS.map((p) => ({ ...p })),
    parts: PARTS.map((p) => ({ ...p, supplierIds: [...p.supplierIds] })),
    drawingFolder: JSON.parse(JSON.stringify(DRAWING_FOLDER)),
    history: seedHistory(),
  };
}

export const MATERIALS = [
  "SS400",
  "SUS304",
  "SUS440C",
  "アルミA5052",
  "アルミA5083",
  "樹脂MC901",
  "樹脂PC",
  "鋳物FC250",
];

export const UNITS = ["個", "本", "枚", "式", "セット"];
