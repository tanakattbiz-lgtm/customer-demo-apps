import { format, subDays } from "date-fns";

// C列 = 書類種別。A=納品書 / B=請求書 の2種類に振り分ける
export type DocType = "A" | "B";
export type RowStatus = "未生成" | "生成済み";

// 住所録(別エクセル相当)。F列の企業名をキーに住所を補完する
export interface AddressEntry {
  company: string;
  postal: string;
  address: string;
  contact: string; // 担当者(宛名の敬称対象)
}

// リスト.xlsx の1行(A〜G列相当)
export interface ListRow {
  id: string;
  no: number; // A列: 通番
  refNo: string; // B列: 伝票番号
  docType: DocType; // C列: 書類種別
  item: string; // D列: 品名 / 件名
  qty: number; // E列: 数量
  company: string; // F列: 宛先企業名
  amount: number; // G列: 金額(税抜)
  issuedAt: string; // 発行日(ISO)
  status: RowStatus;
}

// --- 住所録(住所補完のマスタ)。実在企業ではない架空のダミー ---
export const ADDRESS_BOOK: AddressEntry[] = [
  { company: "丸和紙工業株式会社", postal: "101-0032", address: "東京都千代田区岩本町2-4-7 丸和ビル5F", contact: "purchasing 購買部 井上 誠" },
  { company: "コスモ電材株式会社", postal: "550-0013", address: "大阪府大阪市西区新町1-8-12", contact: "資材課 田渕 健一" },
  { company: "株式会社ミドリ食品", postal: "460-0008", address: "愛知県名古屋市中区栄3-15-6 栄セントラルビル", contact: "総務部 大西 由紀" },
  { company: "北信精密工業株式会社", postal: "380-0921", address: "長野県長野市栗田1102-3", contact: "調達グループ 宮下 亮" },
  { company: "有限会社さくら印刷", postal: "231-0023", address: "神奈川県横浜市中区山下町74-1", contact: "営業部 桜井 直美" },
  { company: "東西ロジスティクス株式会社", postal: "135-0064", address: "東京都江東区青海2-4-32", contact: "業務課 藤原 一馬" },
  { company: "株式会社ハタノ商会", postal: "812-0011", address: "福岡県福岡市博多区博多駅前3-2-8", contact: "管理部 波多野 修" },
  { company: "光洋メタル株式会社", postal: "455-0032", address: "愛知県名古屋市港区入船2-1-5", contact: "生産管理課 光武 亮太" },
  { company: "株式会社アオヤギ設備", postal: "060-0042", address: "北海道札幌市中央区大通西12-3-1", contact: "工事部 青柳 拓也" },
  { company: "セントラル物産株式会社", postal: "730-0051", address: "広島県広島市中区大手町2-11-10", contact: "仕入課 川口 さやか" },
  { company: "株式会社みのり農産", postal: "020-0022", address: "岩手県盛岡市大通2-8-16", contact: "販売部 実松 圭吾" },
  { company: "大成テクノ株式会社", postal: "435-0016", address: "静岡県浜松市中央区和田町808", contact: "技術管理課 大成 信次" },
  { company: "株式会社ヨシダ工機", postal: "525-0032", address: "滋賀県草津市大路1-1-1", contact: "購買部 吉田 直樹" },
  { company: "西海フーズ株式会社", postal: "850-0035", address: "長崎県長崎市元船町14-5", contact: "調達課 西尾 香織" },
  { company: "株式会社カネマツ", postal: "920-0853", address: "石川県金沢市本町2-15-1", contact: "総務課 金松 英之" },
  { company: "第一化成株式会社", postal: "343-0845", address: "埼玉県越谷市南越谷4-2-1", contact: "資材部 高木 亮" },
  { company: "株式会社トキワ製作所", postal: "753-0074", address: "山口県山口市中央3-2-8", contact: "生産技術課 常盤 学" },
  { company: "南陽建材株式会社", postal: "890-0053", address: "鹿児島県鹿児島市中央町18-1", contact: "営業課 南 隆一" },
  { company: "株式会社アルファ精工", postal: "399-0033", address: "長野県松本市笹賀5652-3", contact: "調達グループ 有田 康" },
  { company: "株式会社ふじや商店", postal: "400-0032", address: "山梨県甲府市中央1-9-4", contact: "仕入担当 藤谷 みどり" },
];

// リストにはあるが住所録に未登録の企業(住所補完が「未照合」になるケースを見せる)
const UNMATCHED_COMPANIES = [
  "株式会社ニシキ通商",
  "オーロラ電子工業株式会社",
  "有限会社まつだ運送",
];

const ITEMS_A = ["ステンレスボルト M6×20", "アルミ角パイプ 40角", "梱包用段ボール A式", "業務用ラベルシール", "研磨ディスク 100mm", "防錆スプレー 480ml", "作業用手袋 L", "PPバンド 15mm"];
const ITEMS_B = ["設備保守作業(定期)", "システム利用料(月額)", "運送費(路線便)", "検査手数料", "データ入力代行", "清掃業務(定期)", "保守部品交換一式"];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

export function buildRows(): ListRow[] {
  const registered = ADDRESS_BOOK.map((a) => a.company);
  // 宛先が重複するように、企業プールは行数より少なくする
  const pool = [
    ...registered,
    ...UNMATCHED_COMPANIES,
  ];
  const rows: ListRow[] = [];
  const N = 50;
  for (let i = 0; i < N; i++) {
    const docType: DocType = i % 3 === 0 ? "B" : "A";
    // 一部の企業に案件が集中するよう重み付け(重複集約デモ用)
    const companyIdx = (i * 7 + Math.floor(i / 4)) % pool.length;
    const company = pool[companyIdx];
    const qty = docType === "A" ? ((i % 8) + 1) * 5 : (i % 4) + 1;
    const unit = docType === "A" ? 120 + (i % 6) * 45 : 18000 + (i % 5) * 6500;
    rows.push({
      id: `row-${String(i + 1).padStart(3, "0")}`,
      no: i + 1,
      refNo: `${docType}-${format(subDays(new Date(), 30), "yyMM")}-${String(i + 1).padStart(4, "0")}`,
      docType,
      item: docType === "A" ? pick(ITEMS_A, i) : pick(ITEMS_B, i),
      qty,
      company,
      amount: qty * unit,
      issuedAt: subDays(new Date(), i % 18).toISOString(),
      status: "未生成",
    });
  }
  return rows;
}

export function findAddress(company: string): AddressEntry | undefined {
  return ADDRESS_BOOK.find((a) => a.company === company);
}
