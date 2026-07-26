import type { AppData, Part, Project, Supplier } from "../data/seed";
import { fmtDate } from "./format";

/** 自動生成された1通のメール(下書き) */
export interface DraftEmail {
  supplier: Supplier;
  parts: Part[];
  /** 自動検索でヒットした図面ファイル(重複排除済み) */
  attachments: string[];
  /** 図面フォルダに見つからなかった図番 */
  missing: string[];
  subject: string;
  body: string;
}

/** 図面フォルダを検索して、図番に対応するファイル名を返す(自動添付の要) */
export function findDrawings(folder: Record<string, string[]>, drawingNo: string): string[] {
  return folder[drawingNo] ?? [];
}

/**
 * 選択された部品を「依頼先ごと」にまとめ、個別メールを自動生成する。
 * 1社に複数部品が割り当たっていれば1通に集約する(件名・本文・図番・添付を自動挿入)。
 */
export function composeEmails(data: AppData, project: Project, partIds: string[]): DraftEmail[] {
  const selected = data.parts.filter((p) => partIds.includes(p.id) && p.projectId === project.id);

  // supplierId → Part[]
  const bySupplier = new Map<string, Part[]>();
  for (const part of selected) {
    for (const sid of part.supplierIds) {
      const arr = bySupplier.get(sid) ?? [];
      arr.push(part);
      bySupplier.set(sid, arr);
    }
  }

  const emails: DraftEmail[] = [];
  for (const [sid, parts] of bySupplier) {
    const supplier = data.suppliers.find((s) => s.id === sid);
    if (!supplier) continue;

    const attachments = new Set<string>();
    const missing: string[] = [];
    for (const part of parts) {
      const files = findDrawings(data.drawingFolder, part.drawingNo);
      if (files.length === 0) missing.push(part.drawingNo);
      files.forEach((f) => attachments.add(f));
    }

    emails.push({
      supplier,
      parts,
      attachments: [...attachments],
      missing,
      subject: buildSubject(project, parts),
      body: buildBody(project, supplier, parts),
    });
  }

  // 部品点数の多い順(=主要依頼先を上に)
  return emails.sort((a, b) => b.parts.length - a.parts.length);
}

function buildSubject(project: Project, parts: Part[]): string {
  const head = parts[0]?.name ?? "";
  const rest = parts.length > 1 ? ` 他${parts.length - 1}件` : "";
  return `【見積依頼】${project.code} ${head}${rest}（○○製作所）`;
}

function buildBody(project: Project, supplier: Supplier, parts: Part[]): string {
  const lines = parts
    .map(
      (p, i) =>
        `  ${i + 1}. ${p.name}（図番: ${p.drawingNo}）\n` +
        `     材質: ${p.material} / 数量: ${p.qty}${p.unit} / 希望納期: ${fmtDate(p.dueDate)}`,
    )
    .join("\n");

  return [
    `${supplier.name}\n${supplier.contact} 様`,
    ``,
    `いつもお世話になっております。○○製作所 調達担当です。`,
    `下記の件につきまして、お見積りをご依頼申し上げます。`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `■ 物件名　： ${project.name}`,
    `■ 物件番号： ${project.code}`,
    `■ 納入先　： ${project.destination}`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `【ご依頼部品】`,
    lines,
    ``,
    `図面（PDF / DXF）を本メールに添付しております。`,
    `ご不明点がございましたらお気軽にお問い合わせください。`,
    `お手数をおかけしますが、よろしくお願い申し上げます。`,
    ``,
    `──────────────────`,
    `○○製作所　調達部`,
    `${project.code} 担当`,
    `──────────────────`,
  ].join("\n");
}
