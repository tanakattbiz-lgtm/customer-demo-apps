import { format } from "date-fns";
import type { Message, Client, Staff } from "../data/seed";

function authorName(m: Message, client: Client, staff: Staff[]): string {
  if (m.from === "client") return client.name;
  return staff.find((s) => s.id === m.authorId)?.name ?? "担当者";
}

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function stamp(): string {
  return format(new Date(), "yyyyMMdd_HHmm");
}

/** チャット履歴をテキストで出力 */
export function exportChatText(
  client: Client,
  messages: Message[],
  staff: Staff[],
) {
  const lines: string[] = [
    `チャット履歴 — ${client.name}`,
    `出力日時: ${format(new Date(), "yyyy年M月d日 HH:mm")}`,
    `件数: ${messages.length}件`,
    "=".repeat(40),
    "",
  ];
  for (const m of messages) {
    const who = authorName(m, client, staff);
    const when = format(new Date(m.at), "yyyy/MM/dd HH:mm");
    lines.push(`[${when}] ${who}`);
    lines.push(m.text);
    lines.push("");
  }
  triggerDownload(
    lines.join("\n"),
    `chat_${client.kana || client.name}_${stamp()}.txt`,
    "text/plain;charset=utf-8",
  );
}

/** チャット履歴を CSV で出力(Excel で開けるよう BOM 付き) */
export function exportChatCsv(
  client: Client,
  messages: Message[],
  staff: Staff[],
) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows: string[] = ["日時,送信者,区分,本文"];
  for (const m of messages) {
    const who = authorName(m, client, staff);
    const when = format(new Date(m.at), "yyyy/MM/dd HH:mm");
    const dir = m.from === "client" ? "顧問先" : "担当者";
    rows.push([esc(when), esc(who), esc(dir), esc(m.text)].join(","));
  }
  // BOM を付けて Excel の文字化けを防ぐ
  triggerDownload(
    "﻿" + rows.join("\r\n"),
    `chat_${client.kana || client.name}_${stamp()}.csv`,
    "text/csv;charset=utf-8",
  );
}
