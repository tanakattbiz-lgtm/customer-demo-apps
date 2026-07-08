import type { MatterStatus, InvoiceStatus, ClientStatus } from "../data/seed";

export const matterTone: Record<MatterStatus, string> = {
  受任前: "amber",
  進行中: "blue",
  期日調整中: "violet",
  和解交渉: "gray",
  完了: "green",
};

export const invoiceTone: Record<InvoiceStatus, string> = {
  未請求: "gray",
  送付済: "blue",
  支払済: "green",
  延滞: "red",
};

export const clientTone: Record<ClientStatus, string> = {
  見込み: "amber",
  契約中: "green",
  休眠: "gray",
};
