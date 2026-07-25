import { format, formatDistanceToNowStrict } from "date-fns";
import { ja } from "date-fns/locale";

export const ago = (iso: string) =>
  formatDistanceToNowStrict(new Date(iso), { addSuffix: true, locale: ja });

export const fmtTime = (iso: string) => format(new Date(iso), "HH:mm");

export const fmtDateTime = (iso: string) => format(new Date(iso), "M/d HH:mm");
