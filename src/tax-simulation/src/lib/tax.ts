// 税金シミュレーションの計算ロジック(令和8年度時点の一般的な税制を簡略化)
// ※デモ用の概算計算。実際の税額は個別事情により異なる。

export const yen = (n: number) =>
  "¥" + Math.round(n).toLocaleString("ja-JP");

export const man = (n: number) => {
  const m = n / 10000;
  if (m >= 10000) {
    const oku = Math.floor(m / 10000);
    const rest = Math.round(m % 10000);
    return rest > 0 ? `${oku}億${rest.toLocaleString()}万円` : `${oku}億円`;
  }
  return `${Math.round(m).toLocaleString()}万円`;
};

/* ---------------- 所得税の速算表 ---------------- */
const INCOME_TAX_TABLE: Array<[number, number, number]> = [
  // [上限, 税率, 控除額]
  [1_950_000, 0.05, 0],
  [3_300_000, 0.1, 97_500],
  [6_950_000, 0.2, 427_500],
  [9_000_000, 0.23, 636_000],
  [18_000_000, 0.33, 1_536_000],
  [40_000_000, 0.4, 2_796_000],
  [Infinity, 0.45, 4_796_000],
];

export function incomeTax(taxable: number): number {
  if (taxable <= 0) return 0;
  const t = Math.floor(taxable / 1000) * 1000;
  const row = INCOME_TAX_TABLE.find(([cap]) => t <= cap)!;
  return Math.max(0, t * row[1] - row[2]);
}

export function incomeTaxRate(taxable: number): number {
  if (taxable <= 0) return 0;
  return INCOME_TAX_TABLE.find(([cap]) => taxable <= cap)![1];
}

/* ---------------- 給与所得控除 ---------------- */
export function salaryDeduction(salary: number): number {
  if (salary <= 1_625_000) return 550_000;
  if (salary <= 1_800_000) return salary * 0.4 - 100_000;
  if (salary <= 3_600_000) return salary * 0.3 + 80_000;
  if (salary <= 6_600_000) return salary * 0.2 + 440_000;
  if (salary <= 8_500_000) return salary * 0.1 + 1_100_000;
  return 1_950_000;
}

/* ================ 1. 不動産売却(譲渡所得税) ================ */
export interface SaleInput {
  salePrice: number;        // 売却価格
  purchasePrice: number;    // 取得費(0なら概算5%)
  saleCost: number;         // 譲渡費用
  holdingYears: number;     // 所有期間(年)
  isResidence: boolean;     // 居住用財産(3,000万円特別控除)
}

export interface SaleResult {
  kind: "sale";
  acquisitionCost: number;
  usedEstimatedCost: boolean;
  grossGain: number;
  specialDeduction: number;
  taxableGain: number;
  isLongTerm: boolean;
  lightRateApplied: boolean;
  incomeTaxAmt: number;
  residentTaxAmt: number;
  totalTax: number;
  effectiveRate: number;
  netProceeds: number;
}

export function calcSale(i: SaleInput): SaleResult {
  const estimated = i.salePrice * 0.05;
  const usedEstimatedCost = i.purchasePrice < estimated;
  const acquisitionCost = Math.max(i.purchasePrice, estimated);
  const grossGain = Math.max(0, i.salePrice - acquisitionCost - i.saleCost);
  const specialDeduction = i.isResidence ? Math.min(grossGain, 30_000_000) : 0;
  const taxableGain = Math.max(0, grossGain - specialDeduction);
  const isLongTerm = i.holdingYears > 5;
  const lightRateApplied = i.isResidence && i.holdingYears > 10;

  let incomeTaxAmt = 0;
  let residentTaxAmt = 0;
  if (lightRateApplied) {
    // 10年超所有の居住用: 6,000万円以下 10.21% / 超過分 15.315%(所得税・復興税)
    const under = Math.min(taxableGain, 60_000_000);
    const over = Math.max(0, taxableGain - 60_000_000);
    incomeTaxAmt = under * 0.1021 + over * 0.15315;
    residentTaxAmt = under * 0.04 + over * 0.05;
  } else if (isLongTerm) {
    incomeTaxAmt = taxableGain * 0.15315;
    residentTaxAmt = taxableGain * 0.05;
  } else {
    incomeTaxAmt = taxableGain * 0.3063;
    residentTaxAmt = taxableGain * 0.09;
  }
  const totalTax = incomeTaxAmt + residentTaxAmt;
  return {
    kind: "sale",
    acquisitionCost,
    usedEstimatedCost,
    grossGain,
    specialDeduction,
    taxableGain,
    isLongTerm,
    lightRateApplied,
    incomeTaxAmt,
    residentTaxAmt,
    totalTax,
    effectiveRate: i.salePrice > 0 ? totalTax / i.salePrice : 0,
    netProceeds: i.salePrice - i.saleCost - totalTax,
  };
}

/* ================ 2. 相続税 ================ */
export interface InheritanceInput {
  totalAssets: number;      // 遺産総額
  debts: number;            // 債務・葬式費用
  hasSpouse: boolean;
  numChildren: number;
}

const INHERITANCE_TABLE: Array<[number, number, number]> = [
  [10_000_000, 0.1, 0],
  [30_000_000, 0.15, 500_000],
  [50_000_000, 0.2, 2_000_000],
  [100_000_000, 0.3, 7_000_000],
  [200_000_000, 0.4, 17_000_000],
  [300_000_000, 0.45, 27_000_000],
  [600_000_000, 0.5, 42_000_000],
  [Infinity, 0.55, 72_000_000],
];

function inheritanceBracket(amount: number) {
  return INHERITANCE_TABLE.find(([cap]) => amount <= cap)!;
}

export interface InheritanceResult {
  kind: "inheritance";
  netAssets: number;
  numHeirs: number;
  basicDeduction: number;
  taxableEstate: number;
  totalTaxBeforeRelief: number;
  spouseRelief: number;
  totalTax: number;
  effectiveRate: number;
  perHeir: Array<{ label: string; share: number; tax: number }>;
}

export function calcInheritance(i: InheritanceInput): InheritanceResult {
  const numHeirs = (i.hasSpouse ? 1 : 0) + i.numChildren;
  const netAssets = Math.max(0, i.totalAssets - i.debts);
  const basicDeduction = 30_000_000 + 6_000_000 * numHeirs;
  const taxableEstate = Math.max(0, netAssets - basicDeduction);

  // 法定相続分で按分して税額を計算し合算
  const shares: Array<{ label: string; ratio: number }> = [];
  if (i.hasSpouse && i.numChildren > 0) {
    shares.push({ label: "配偶者", ratio: 0.5 });
    for (let c = 0; c < i.numChildren; c++)
      shares.push({ label: `子${c + 1}`, ratio: 0.5 / i.numChildren });
  } else if (i.hasSpouse) {
    shares.push({ label: "配偶者", ratio: 1 });
  } else if (i.numChildren > 0) {
    for (let c = 0; c < i.numChildren; c++)
      shares.push({ label: `子${c + 1}`, ratio: 1 / i.numChildren });
  }

  let totalTaxBeforeRelief = 0;
  const perHeir = shares.map((s) => {
    const share = taxableEstate * s.ratio;
    const [, rate, ded] = inheritanceBracket(share);
    const tax = Math.max(0, share * rate - ded);
    totalTaxBeforeRelief += tax;
    return { label: s.label, share, tax };
  });

  // 配偶者の税額軽減: 法定相続分 or 1.6億円まで非課税(実際の取得割合=法定相続分と仮定)
  let spouseRelief = 0;
  if (i.hasSpouse && totalTaxBeforeRelief > 0) {
    const spouseRatio = i.numChildren > 0 ? 0.5 : 1;
    spouseRelief = totalTaxBeforeRelief * spouseRatio;
  }
  const totalTax = Math.max(0, totalTaxBeforeRelief - spouseRelief);
  return {
    kind: "inheritance",
    netAssets,
    numHeirs,
    basicDeduction,
    taxableEstate,
    totalTaxBeforeRelief,
    spouseRelief,
    totalTax,
    effectiveRate: netAssets > 0 ? totalTax / netAssets : 0,
    perHeir,
  };
}

/* ================ 3. 贈与税(暦年課税) ================ */
export interface GiftInput {
  amount: number;          // 年間贈与額
  isSpecial: boolean;      // 特例贈与(直系尊属→18歳以上)
}

const GIFT_SPECIAL: Array<[number, number, number]> = [
  [2_000_000, 0.1, 0],
  [4_000_000, 0.15, 100_000],
  [6_000_000, 0.2, 300_000],
  [10_000_000, 0.3, 900_000],
  [15_000_000, 0.4, 1_900_000],
  [30_000_000, 0.45, 2_650_000],
  [45_000_000, 0.5, 4_150_000],
  [Infinity, 0.55, 6_400_000],
];
const GIFT_GENERAL: Array<[number, number, number]> = [
  [2_000_000, 0.1, 0],
  [3_000_000, 0.15, 100_000],
  [4_000_000, 0.2, 250_000],
  [6_000_000, 0.3, 650_000],
  [10_000_000, 0.4, 1_250_000],
  [15_000_000, 0.45, 1_750_000],
  [30_000_000, 0.5, 2_500_000],
  [Infinity, 0.55, 4_000_000],
];

export interface GiftResult {
  kind: "gift";
  basicDeduction: number;
  taxable: number;
  rate: number;
  totalTax: number;
  effectiveRate: number;
  netReceived: number;
}

export function calcGift(i: GiftInput): GiftResult {
  const basicDeduction = Math.min(i.amount, 1_100_000);
  const taxable = Math.max(0, i.amount - 1_100_000);
  const table = i.isSpecial ? GIFT_SPECIAL : GIFT_GENERAL;
  const [, rate, ded] = table.find(([cap]) => taxable <= cap)!;
  const totalTax = Math.max(0, taxable * rate - ded);
  return {
    kind: "gift",
    basicDeduction,
    taxable,
    rate,
    totalTax,
    effectiveRate: i.amount > 0 ? totalTax / i.amount : 0,
    netReceived: i.amount - totalTax,
  };
}

/* ================ 4. 不動産所得(家賃収入の確定申告) ================ */
export interface RentalInput {
  salaryIncome: number;    // 給与収入(年収)
  rentIncome: number;      // 年間家賃収入
  expenses: number;        // 年間経費(管理費・修繕・減価償却など)
  socialInsurance: number; // 社会保険料(0なら給与の14%で概算)
  blueDeduction: boolean;  // 青色申告特別控除(65万円)
}

export interface RentalResult {
  kind: "rental";
  rentalProfit: number;
  blueDeductionAmt: number;
  salaryAfterDeduction: number;
  socialInsuranceUsed: number;
  totalIncome: number;
  taxableIncome: number;
  incomeTaxAmt: number;
  reconstructionTax: number;
  residentTaxAmt: number;
  totalTax: number;
  taxOnSalaryOnly: number;
  additionalTax: number;   // 家賃収入で増える税額
  marginalRate: number;
}

export function calcRental(i: RentalInput): RentalResult {
  const blueDeductionAmt = i.blueDeduction ? 650_000 : 0;
  const rentalProfit = Math.max(
    0,
    i.rentIncome - i.expenses - blueDeductionAmt
  );
  const salaryAfterDeduction = Math.max(
    0,
    i.salaryIncome - salaryDeduction(i.salaryIncome)
  );
  const socialInsuranceUsed =
    i.socialInsurance > 0 ? i.socialInsurance : i.salaryIncome * 0.14;
  const basicDeduction = 480_000;
  const totalIncome = salaryAfterDeduction + rentalProfit;
  const taxableIncome = Math.max(
    0,
    totalIncome - socialInsuranceUsed - basicDeduction
  );
  const it = incomeTax(taxableIncome);
  const reconstructionTax = it * 0.021;
  const residentTaxAmt = taxableIncome * 0.1;
  const totalTax = it + reconstructionTax + residentTaxAmt;

  // 給与のみの場合の税額(比較用)
  const taxableSalaryOnly = Math.max(
    0,
    salaryAfterDeduction - socialInsuranceUsed - basicDeduction
  );
  const itS = incomeTax(taxableSalaryOnly);
  const taxOnSalaryOnly = itS + itS * 0.021 + taxableSalaryOnly * 0.1;

  return {
    kind: "rental",
    rentalProfit,
    blueDeductionAmt,
    salaryAfterDeduction,
    socialInsuranceUsed,
    totalIncome,
    taxableIncome,
    incomeTaxAmt: it,
    reconstructionTax,
    residentTaxAmt,
    totalTax,
    taxOnSalaryOnly,
    additionalTax: Math.max(0, totalTax - taxOnSalaryOnly),
    marginalRate: incomeTaxRate(taxableIncome),
  };
}

export type SimResult =
  | SaleResult
  | InheritanceResult
  | GiftResult
  | RentalResult;
