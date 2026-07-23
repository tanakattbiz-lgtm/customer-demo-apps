import { subDays, subHours, formatISO } from "date-fns";

/** 変換ステータス */
export type WsStatus = "確定" | "要確認" | "下書き";

/** 作業指示書レコード */
export type Worksheet = {
  id: string;
  no: string; // WS-2026-0001
  createdAt: string; // ISO
  client: string; // 取引先(サンプルデータ=現実的ダミー)
  partCode: string;
  partName: string;
  quantity: number | null;
  unit: string;
  category: string; // 加工区分
  material: string;
  surface: string; // 表面処理
  dueDate: string | null; // YYYY-MM-DD
  process: string[]; // 工程
  note: string;
  status: WsStatus;
  raw: string; // 取り込んだオーダー原文
};

/** 品番マスタ(自動変換の辞書) */
export type PartMaster = {
  code: string;
  name: string;
  category: string;
  material: string;
  surface: string;
  process: string[];
  unit: string;
};

export const PART_MASTER: PartMaster[] = [
  {
    code: "TP-3080",
    name: "六角ボルト M8×30",
    category: "切削加工",
    material: "SUS304",
    surface: "三価クロメート",
    process: ["材料切断", "旋盤加工", "ねじ転造", "表面処理", "検査"],
    unit: "個",
  },
  {
    code: "TP-3120",
    name: "段付シャフト φ12",
    category: "切削加工",
    material: "S45C",
    surface: "無電解ニッケル",
    process: ["材料切断", "NC旋盤", "研磨", "表面処理", "寸法検査"],
    unit: "本",
  },
  {
    code: "SG-1120",
    name: "研削カラー φ20",
    category: "研削加工",
    material: "SUJ2",
    surface: "なし",
    process: ["前加工", "熱処理", "円筒研削", "外観検査"],
    unit: "個",
  },
  {
    code: "WD-2045",
    name: "架台フレーム 450角",
    category: "溶接",
    material: "SS400",
    surface: "溶融亜鉛めっき",
    process: ["切断", "開先加工", "仮組", "本溶接", "めっき", "外観検査"],
    unit: "台",
  },
  {
    code: "PR-5510",
    name: "取付ブラケット L型",
    category: "プレス",
    material: "SPCC t2.3",
    surface: "電気亜鉛めっき",
    process: ["ブランク抜き", "曲げ", "タップ", "表面処理", "検査"],
    unit: "枚",
  },
  {
    code: "PR-5580",
    name: "補強プレート 100×60",
    category: "プレス",
    material: "SPCC t3.2",
    surface: "カチオン塗装",
    process: ["ブランク抜き", "バリ取り", "塗装", "検査"],
    unit: "枚",
  },
  {
    code: "CN-7300",
    name: "アルミ筐体 A-300",
    category: "切削加工",
    material: "A5052",
    surface: "アルマイト(黒)",
    process: ["材料切断", "マシニング", "バリ取り", "アルマイト", "外観検査"],
    unit: "個",
  },
  {
    code: "CN-7420",
    name: "冷却ブロック φ42",
    category: "切削加工",
    material: "A6063",
    surface: "アルマイト(白)",
    process: ["材料切断", "マシニング", "洗浄", "アルマイト", "リーク検査"],
    unit: "個",
  },
];

/** サンプル取引先(発注元=システム利用企業の顧客。現実的ダミー) */
export const CLIENTS = [
  "東海精密工業株式会社",
  "北陸メタルワークス株式会社",
  "山田製作所",
  "共栄テクノ株式会社",
  "西日本産業機械株式会社",
  "みどり金属工業株式会社",
];

export const CATEGORIES = ["切削加工", "研削加工", "溶接", "プレス", "組立", "その他"];

/** 素早くデモするための「取引先から届いたオーダー原文」テンプレ */
export const SAMPLE_ORDERS: { label: string; text: string }[] = [
  {
    label: "標準的な発注書",
    text: `発注書
発注元：東海精密工業株式会社  製造部 調達課
品番：TP-3080
品名：六角ボルト M8×30
数量：1200 個
希望納期：2026/08/05
表面処理：三価クロメート指定
備考：ロット管理必須。ミルシート添付のこと。`,
  },
  {
    label: "納期・数量が曖昧",
    text: `いつもお世話になっております。西日本産業機械の田口です。
下記の件、ご手配お願いいたします。

・品番 WD-2045(架台フレーム 450角)
・数量 未定(20台前後を想定)
・納期は今週中に…

詳細は追ってご連絡します。`,
  },
  {
    label: "マスタ未登録の品番",
    text: `【お見積・製作依頼】
取引先：みどり金属工業株式会社
品番：XX-9001
品名：特注治具ベース
数量：8 台
希望納期：2026/08/20
備考：図面 rev.C 支給。材質A5052、黒アルマイト希望。`,
  },
];

/** 履歴のシード(過去データ。開くたび「最近のデータ」に見えるよう相対生成) */
export function buildSeed(): Worksheet[] {
  const iso = (d: Date) => formatISO(d);
  const ymd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;

  const rows: Array<
    [string, string, number | null, string, WsStatus, number, number]
  > = [
    // [partCode, client, qty, surfaceOverride, status, daysAgo, dueInDays]
    ["TP-3080", "東海精密工業株式会社", 1200, "", "確定", 0, 13],
    ["CN-7300", "共栄テクノ株式会社", 60, "", "確定", 0, 9],
    ["WD-2045", "西日本産業機械株式会社", 18, "", "要確認", 1, 4],
    ["PR-5510", "山田製作所", 5000, "", "確定", 1, 20],
    ["SG-1120", "北陸メタルワークス株式会社", 240, "", "確定", 2, 15],
    ["TP-3120", "東海精密工業株式会社", 800, "", "確定", 2, 11],
    ["CN-7420", "共栄テクノ株式会社", 120, "", "要確認", 3, 3],
    ["PR-5580", "みどり金属工業株式会社", 3200, "", "確定", 4, 18],
    ["CN-7300", "山田製作所", 45, "アルマイト(白)", "確定", 5, 12],
    ["WD-2045", "北陸メタルワークス株式会社", 30, "", "確定", 6, 22],
    ["TP-3080", "西日本産業機械株式会社", 2400, "", "確定", 7, 16],
    ["SG-1120", "共栄テクノ株式会社", 180, "", "下書き", 8, 6],
    ["PR-5510", "東海精密工業株式会社", 6000, "", "確定", 9, 25],
    ["CN-7420", "みどり金属工業株式会社", 90, "", "確定", 11, 19],
    ["TP-3120", "山田製作所", 650, "", "確定", 12, 14],
    ["WD-2045", "共栄テクノ株式会社", 12, "", "要確認", 14, 8],
    ["PR-5580", "北陸メタルワークス株式会社", 2800, "", "確定", 16, 21],
    ["TP-3080", "みどり金属工業株式会社", 1500, "", "確定", 18, 24],
  ];

  return rows.map((r, i) => {
    const [code, client, qty, surfaceOv, status, daysAgo, dueIn] = r;
    const m = PART_MASTER.find((p) => p.code === code)!;
    const created = subHours(subDays(new Date(), daysAgo), (i % 6) * 2 + 1);
    const due = subDays(new Date(), -dueIn); // 未来日
    return {
      id: `ws-seed-${i}`,
      no: `WS-2026-${String(1042 - i).padStart(4, "0")}`,
      createdAt: iso(created),
      client,
      partCode: code,
      partName: m.name,
      quantity: qty,
      unit: m.unit,
      category: m.category,
      material: m.material,
      surface: surfaceOv || m.surface,
      dueDate: ymd(due),
      process: m.process,
      note: i % 4 === 0 ? "ミルシート添付。ロット管理必須。" : "",
      status,
      raw: `品番：${code}\n数量：${qty ?? "未定"}\n取引先：${client}`,
    };
  });
}
