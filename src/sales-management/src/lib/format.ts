import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

/** ¥1,234,567 */
export function yen(n: number): string {
  return "¥" + Math.round(n).toLocaleString("ja-JP");
}

/** 大きい金額を「123万」「1,234万」表記に(カード見出し用) */
export function man(n: number): string {
  const m = n / 10000;
  if (m >= 10000) return (m / 10000).toFixed(m % 10000 === 0 ? 0 : 1) + "億";
  return Math.round(m).toLocaleString("ja-JP") + "万";
}

/** 2026/07/20 */
export function ymd(iso: string): string {
  return format(parseISO(iso), "yyyy/MM/dd");
}

/** 7/20(月) */
export function md(iso: string): string {
  return format(parseISO(iso), "M/d(E)", { locale: ja });
}

/** 前月比などのデルタ表記 */
export function pct(n: number): string {
  const s = Math.round(n);
  return (s > 0 ? "+" : "") + s + "%";
}

// ---------------- CSV ----------------

function csvCell(v: string | number): string {
  const s = String(v);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

/** 行(オブジェクト配列)を CSV 文字列に。BOM 付きで Excel の文字化けを防ぐ。 */
export function toCSV(headers: string[], rows: (string | number)[][]): string {
  const head = headers.map(csvCell).join(",");
  const body = rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
  return "﻿" + head + "\r\n" + body;
}

/** ブラウザで CSV をダウンロードさせる */
export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** クォート対応の簡易 CSV パーサ。行 → セル配列。 */
export function parseCSV(text: string): string[][] {
  const clean = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (inQuotes) {
      if (c === '"') {
        if (clean[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && clean[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += c;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}
