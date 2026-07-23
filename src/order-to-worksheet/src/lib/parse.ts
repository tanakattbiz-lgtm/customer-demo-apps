import { PART_MASTER, type Worksheet, type WsStatus } from "../data/seed";

/** 入力チェック結果の一項目 */
export type Check = {
  level: "error" | "warn" | "info";
  field: string;
  message: string;
};

/** 変換結果(確定前の指示書ドラフト + チェック) */
export type Draft = Omit<Worksheet, "id" | "no" | "createdAt" | "status"> & {
  matchedMaster: boolean;
};

export type ParseResult = {
  draft: Draft;
  checks: Check[];
};

/** 複数の別名キーから最初にヒットした値を返す */
function pick(raw: string, keys: string[]): string {
  for (const line of raw.split(/\r?\n/)) {
    for (const k of keys) {
      // 「品番：xxx」「品番 xxx」「・品番 xxx」など
      const re = new RegExp(`(?:^|[\\s・-])${k}\\s*[：:＝=]?\\s*(.+)$`);
      const m = line.match(re);
      if (m && m[1].trim()) return m[1].trim();
    }
  }
  return "";
}

/** 数量文字列から整数を抽出(全角対応)。抽出不能なら null */
function parseQty(s: string): number | null {
  if (!s) return null;
  const z2h = s.replace(/[０-９]/g, (d) =>
    String.fromCharCode(d.charCodeAt(0) - 0xfee0),
  );
  const m = z2h.match(/-?\d[\d,]*/);
  if (!m) return null;
  const n = Number(m[0].replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** 納期文字列を YYYY-MM-DD に正規化。できなければ null */
function parseDate(s: string): string | null {
  if (!s) return null;
  const z2h = s.replace(/[０-９]/g, (d) =>
    String.fromCharCode(d.charCodeAt(0) - 0xfee0),
  );
  const m = z2h.match(/(\d{4})[\/\-年.](\d{1,2})[\/\-月.](\d{1,2})/);
  if (!m) return null;
  const [, y, mo, d] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

/** 品番らしき文字列を抽出(英大文字-数字パターン) */
function pickPartCode(raw: string): string {
  const direct = pick(raw, ["品番", "型番", "品目コード"]);
  const fromDirect = direct.match(/[A-Za-z]{1,4}[-‐ー]?\d{3,5}/);
  if (fromDirect) return fromDirect[0].toUpperCase().replace(/[‐ー]/, "-");
  const any = raw.match(/[A-Za-z]{1,4}-\d{3,5}/);
  return any ? any[0].toUpperCase() : "";
}

const DAY = 86400000;

/** 取引先オーダー原文 → 作業指示書ドラフト + 入力チェック */
export function parseOrder(raw: string): ParseResult {
  const checks: Check[] = [];

  const client = pick(raw, ["発注元", "取引先", "お客様", "会社名", "得意先"]).replace(
    /\s+.*$/,
    "",
  );
  const partCode = pickPartCode(raw);
  const master = PART_MASTER.find((p) => p.code === partCode);

  const partNameRaw = pick(raw, ["品名", "品目", "名称"]);
  const qtyStr = pick(raw, ["数量", "個数", "員数", "数"]);
  const quantity = parseQty(qtyStr);
  const dueStr = pick(raw, ["希望納期", "納期", "納品希望日", "納品日"]);
  const dueDate = parseDate(dueStr);
  const surface = pick(raw, ["表面処理", "処理", "めっき"]);
  const note = pick(raw, ["備考", "特記", "特記事項", "メモ"]);

  const draft: Draft = {
    client: client || "",
    partCode,
    partName: master?.name || partNameRaw || "",
    quantity,
    unit: master?.unit || "個",
    category: master?.category || "",
    material: master?.material || "",
    surface: surface || master?.surface || "",
    dueDate,
    process: master?.process || [],
    note,
    raw,
    matchedMaster: !!master,
  };

  // --- 入力チェック(自動変換の肝) ---
  if (!partCode) {
    checks.push({ level: "error", field: "品番", message: "品番を検出できませんでした。" });
  } else if (!master) {
    checks.push({
      level: "warn",
      field: "品番",
      message: `品番「${partCode}」はマスタ未登録です。加工区分・工程を手動で設定してください。`,
    });
  } else {
    checks.push({
      level: "info",
      field: "品番",
      message: `マスタ照合OK：${master.category} / ${master.material} / 標準工程 ${master.process.length} 工程を自動展開。`,
    });
  }

  if (!draft.partName) {
    checks.push({ level: "error", field: "品名", message: "品名が未入力です。" });
  }

  if (quantity === null) {
    checks.push({
      level: "error",
      field: "数量",
      message: qtyStr
        ? `数量「${qtyStr}」を数値に変換できませんでした。`
        : "数量が読み取れません。取引先に確認してください。",
    });
  } else if (quantity <= 0) {
    checks.push({ level: "error", field: "数量", message: "数量が 0 以下です。" });
  } else if (quantity >= 5000) {
    checks.push({
      level: "warn",
      field: "数量",
      message: `大ロット(${quantity.toLocaleString()}${draft.unit})です。分納・材料手配を確認してください。`,
    });
  }

  if (!dueDate) {
    checks.push({
      level: "warn",
      field: "納期",
      message: dueStr
        ? `納期「${dueStr}」を日付に変換できませんでした。手動で指定してください。`
        : "納期が読み取れません。手動で指定してください。",
    });
  } else {
    const lead = Math.round((new Date(dueDate).getTime() - Date.now()) / DAY);
    if (lead < 0) {
      checks.push({ level: "error", field: "納期", message: "納期が過去日です。" });
    } else if (lead <= 5) {
      checks.push({
        level: "warn",
        field: "納期",
        message: `短納期です(残り約${lead}日)。工程調整が必要な可能性があります。`,
      });
    }
  }

  if (surface && master && surface !== master.surface) {
    checks.push({
      level: "info",
      field: "表面処理",
      message: `指定「${surface}」がマスタ標準(${master.surface})と異なります。指定を優先します。`,
    });
  }

  return { draft, checks };
}

/** 編集後のドラフトを再検証(画面上の手直しにリアルタイム追従) */
export function validateDraft(d: Draft): Check[] {
  const checks: Check[] = [];

  if (!d.partCode)
    checks.push({ level: "error", field: "品番", message: "品番が未入力です。" });
  else if (!d.matchedMaster)
    checks.push({
      level: "warn",
      field: "品番",
      message: `品番「${d.partCode}」はマスタ未登録です。加工区分を手動で設定してください。`,
    });

  if (!d.partName)
    checks.push({ level: "error", field: "品名", message: "品名が未入力です。" });
  if (!d.category)
    checks.push({
      level: "warn",
      field: "加工区分",
      message: "加工区分が未設定です。工程が展開されません。",
    });

  if (d.quantity === null)
    checks.push({ level: "error", field: "数量", message: "数量が未入力です。" });
  else if (d.quantity <= 0)
    checks.push({ level: "error", field: "数量", message: "数量が 0 以下です。" });
  else if (d.quantity >= 5000)
    checks.push({
      level: "warn",
      field: "数量",
      message: `大ロット(${d.quantity.toLocaleString()}${d.unit})です。分納・材料手配を確認してください。`,
    });

  if (!d.dueDate)
    checks.push({ level: "warn", field: "納期", message: "納期が未指定です。" });
  else {
    const lead = Math.round((new Date(d.dueDate).getTime() - Date.now()) / DAY);
    if (lead < 0)
      checks.push({ level: "error", field: "納期", message: "納期が過去日です。" });
    else if (lead <= 5)
      checks.push({
        level: "warn",
        field: "納期",
        message: `短納期です(残り約${lead}日)。工程調整が必要な可能性があります。`,
      });
  }

  return checks;
}

/** チェック結果から確定可否とステータスを判定 */
export function statusFromChecks(checks: Check[]): {
  status: WsStatus;
  canConfirm: boolean;
} {
  const hasError = checks.some((c) => c.level === "error");
  const hasWarn = checks.some((c) => c.level === "warn");
  if (hasError) return { status: "下書き", canConfirm: false };
  if (hasWarn) return { status: "要確認", canConfirm: true };
  return { status: "確定", canConfirm: true };
}
