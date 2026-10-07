import { format } from "date-fns";

export const ymd = (d: Date | string) => format(new Date(d), "yyyy/MM/dd");

export const ymdhm = (d: Date | string) => format(new Date(d), "yyyy/MM/dd HH:mm");
