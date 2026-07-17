// シミュレーターのメタ情報
export type SimType = "sale" | "inheritance" | "gift" | "rental";

export interface SimMeta {
  type: SimType;
  title: string;
  short: string;
  desc: string;
  time: string;
  tag: string;
}

export const SIMULATORS: SimMeta[] = [
  {
    type: "sale",
    title: "不動産売却の税金",
    short: "売却",
    desc: "マンション・戸建て・土地を売ったときの譲渡所得税と手取り額を試算。3,000万円特別控除にも対応。",
    time: "約1分",
    tag: "譲渡所得税",
  },
  {
    type: "inheritance",
    title: "相続税",
    short: "相続",
    desc: "遺産総額と家族構成から相続税の総額を試算。配偶者の税額軽減も自動で反映します。",
    time: "約1分",
    tag: "相続税",
  },
  {
    type: "gift",
    title: "贈与税",
    short: "贈与",
    desc: "親から子への資金援助など、1年間に受けた贈与にかかる税金を試算。特例税率に対応。",
    time: "約30秒",
    tag: "贈与税",
  },
  {
    type: "rental",
    title: "家賃収入の税金",
    short: "家賃収入",
    desc: "給与と家賃収入を合算した所得税・住民税を試算。青色申告や法人化の目安もアドバイス。",
    time: "約1分",
    tag: "不動産所得",
  },
];

export const simMeta = (t: SimType) => SIMULATORS.find((s) => s.type === t)!;
