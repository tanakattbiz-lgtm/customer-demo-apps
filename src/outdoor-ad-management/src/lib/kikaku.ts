/**
 * 企画(工事指示システム)まわりの表示用の決まり。
 * 新しいシステムで企画を作り、確定したらその場で工事指示システムへ登録する。
 * 承認・デザイン・工事・施工完了などの進み具合は、工事指示システムから読み戻して表示する。
 */
import { addDays, format, parseISO } from "date-fns";
import type { KikakuType, Order } from "../data/seed";
import { todayISO } from "./format";

/** 企画の種類(古いデータは看板の区分から判断) */
export function kikakuTypeOf(o: Order): KikakuType {
  if (o.kikakuType) return o.kikakuType;
  if (o.investment) return "投資";
  return o.signType === "看板を新設" ? "新規新設" : "既存新規";
}

export interface KikakuStep {
  key: string;
  label: string;
  /** 終わった日(yyyy-MM-dd)。null=まだ */
  date: string | null;
  /** 予定日(工事予定など) */
  planned?: string | null;
}

const plus = (iso: string, n: number) => format(addDays(parseISO(iso), n), "yyyy-MM-dd");
const doneBy = (iso: string, today: string) => (iso <= today ? iso : null);

/**
 * 企画の進み具合(工事指示システムから読み戻す想定)。
 * デモでは、契約締結日と設置日から日付を作って再現している。
 */
export function kikakuSteps(o: Order, today = todayISO()): KikakuStep[] {
  if (!o.kikakuNo) return [];
  const base = o.orderDate;
  const installed = o.actualInstallDate;
  // 設置済みなら、途中の工程はすべて終わっている
  const at = (n: number) => (installed ? (plus(base, n) <= installed ? plus(base, n) : installed) : doneBy(plus(base, n), today));
  return [
    { key: "register", label: "企画を登録", date: base },
    { key: "boss", label: "上長承認", date: at(1) },
    { key: "president", label: "社長承認", date: at(3) },
    { key: "design", label: "デザイン承認", date: at(10) },
    { key: "work", label: "工事予定", date: installed ? installed : null, planned: o.plannedInstallDate },
    { key: "done", label: "施工完了(設置)", date: installed },
  ];
}

/** 今どこまで進んでいるか(表示用) */
export function kikakuStatus(o: Order, today = todayISO()): string {
  if (!o.kikakuNo) return "登録待ち";
  const steps = kikakuSteps(o, today);
  const last = [...steps].reverse().find((s) => s.date);
  if (!last) return "企画を登録";
  if (last.key === "design") return "工事待ち";
  return last.label.replace("を登録", "登録済み");
}
