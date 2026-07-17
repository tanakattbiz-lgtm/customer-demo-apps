import { useMemo } from "react";
import { MAILS, receivedAt, type Mail } from "../data/seed";
import { judge, type Conditions, type Judgement } from "./rules";

export type Row = {
  mail: Mail;
  at: Date;
  j: Judgement;
};

/** 受信メール全件を現在の条件で判定し、新しい順に並べる */
export function useRows(cond: Conditions): Row[] {
  return useMemo(
    () =>
      MAILS.map((mail) => ({ mail, at: receivedAt(mail), j: judge(mail, cond) })).sort(
        (a, b) => b.at.getTime() - a.at.getTime(),
      ),
    [cond],
  );
}
