import { subDays, subMonths, addMonths, addDays, formatISO } from "date-fns";

// ---------------- 型定義 ----------------

export type Office = {
  id: string;
  name: string;
};

export type Staff = {
  id: string;
  name: string;
  officeId: string;
  vehicleId: string;
  username: string;
};

export type Admin = {
  id: string;
  name: string;
  username: string;
};

export type Vehicle = {
  id: string;
  plateNumber: string;
  model: string;
  chassisNumber: string;
  officeId: string;
  odometerKm: number;
  inspectionExpiry: string; // ISO date (YYYY-MM-DD)
  inspectionRegisteredAt: string;
  status: "in_service" | "maintenance";
};

export type PartReplaced = "oil" | "tire" | "battery" | "other";

export type DailyReport = {
  id: string;
  staffId: string;
  vehicleId: string;
  officeId: string;
  reportedAt: string; // ISO datetime
  odometerPhoto: string;
  odometerKm: number;
  hygienePhoto: string;
  alcoholLevel: number;
  temperature: number;
  fuelLiters?: number;
  partsReplaced: PartReplaced[];
  conditionNote?: string;
  status: "pending" | "approved";
  approvedBy?: string;
  approvedAt?: string;
};

export type AuditLogEntry = {
  id: string;
  reportId: string;
  staffId: string;
  officeId: string;
  vehicleId: string;
  adminName: string;
  confirmedAt: string;
};

export type InsurancePolicy = {
  vehicleId: string;
  companyName: string;
  agentName: string;
  emergencyContact: string;
  policyNumber: string;
  startDate: string;
  endDate: string;
  liabilityUnlimited: boolean;
  hasVehicleCoverage: boolean;
  deductible: number;
};

export type AccidentStatus = "受付" | "交渉中" | "修理中" | "完了";

export type AccidentRecord = {
  id: string;
  vehicleId: string;
  staffId: string;
  occurredAt: string;
  location: string;
  summary: string;
  counterpartyInfo: string;
  faultRatioSelf: number;
  faultRatioOther: number;
  repairCost: number;
  insurancePayout: number;
  status: AccidentStatus;
  createdAt: string;
};

export type AppData = {
  offices: Office[];
  staffList: Staff[];
  admins: Admin[];
  vehicles: Vehicle[];
  dailyReports: DailyReport[];
  auditLog: AuditLogEntry[];
  insurancePolicies: InsurancePolicy[];
  accidentRecords: AccidentRecord[];
};

// ---------------- ID採番 ----------------
let idc = 0;
export const genId = (p: string) =>
  `${p}_${Date.now().toString(36)}_${(idc++).toString(36)}`;

// ---------------- 固定マスタ ----------------
export const OFFICES: Office[] = [
  { id: "off_tokuyo", name: "特別養護老人ホーム" },
  { id: "off_day", name: "デイサービスセンター" },
  { id: "off_home", name: "訪問介護ステーション" },
];

export const ADMINS: Admin[] = [
  { id: "adm_1", name: "佐藤 花子", username: "admin_sato" },
  { id: "adm_2", name: "高橋 誠", username: "admin_takahashi" },
];

const STAFF_NAMES = [
  "山田 太郎", "鈴木 一郎", "田中 次郎", "伊藤 健太", "渡辺 誠",
  "中村 拓也", "小林 大輔", "加藤 修", "吉田 直人", "山本 亮",
  "松本 悠斗", "井上 正",
];

const VEHICLE_MODELS = [
  { model: "トヨタ ハイエース(福祉車両・車いす仕様)", prefix: "KDH" },
  { model: "日産 セレナ(福祉車両)", prefix: "GFC27" },
  { model: "トヨタ ノア(福祉車両)", prefix: "ZRR" },
  { model: "ホンダ N-BOX(訪問介護用)", prefix: "JF3" },
  { model: "スズキ エブリイ(福祉車両)", prefix: "DA17" },
  { model: "トヨタ シエンタ(福祉車両)", prefix: "NHP" },
];

const PLATE_AREAS = ["杉並", "練馬", "世田谷", "中野"];
const PLATE_KANA = ["あ", "い", "う", "か", "さ", "は"];

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pad4(n: number) {
  return String(n).padStart(4, "0");
}

function buildVehicles(): Vehicle[] {
  const rand = seededRand(42);
  const today = new Date();
  return STAFF_NAMES.map((_, i) => {
    const office = OFFICES[i % OFFICES.length];
    const vm = VEHICLE_MODELS[i % VEHICLE_MODELS.length];
    const area = PLATE_AREAS[i % PLATE_AREAS.length];
    const kana = PLATE_KANA[Math.floor(rand() * PLATE_KANA.length)];
    // 車検満了日: バラつかせる(一部を60日以内に迫らせて警告デモを見せる)
    let expiry: Date;
    if (i === 0) expiry = addDays(today, 12);
    else if (i === 1) expiry = addDays(today, 45);
    else if (i === 2) expiry = addDays(today, 58);
    else expiry = addMonths(today, 4 + Math.floor(rand() * 14));

    return {
      id: `veh_${i + 1}`,
      plateNumber: `${area} 300 ${kana} ${pad4(10 + i * 137).slice(0, 2)}-${pad4(20 + i * 91).slice(0, 2)}`,
      model: vm.model,
      chassisNumber: `${vm.prefix}-${100000 + Math.floor(rand() * 899999)}`,
      officeId: office.id,
      odometerKm: 18000 + Math.floor(rand() * 62000),
      inspectionExpiry: formatISO(expiry, { representation: "date" }),
      inspectionRegisteredAt: formatISO(subMonths(today, 12 + Math.floor(rand() * 12)), {
        representation: "date",
      }),
      status: "in_service",
    };
  });
}

function buildStaff(vehicles: Vehicle[]): Staff[] {
  return STAFF_NAMES.map((name, i) => ({
    id: `stf_${i + 1}`,
    name,
    officeId: vehicles[i].officeId,
    vehicleId: vehicles[i].id,
    username: `staff${i + 1}`,
  }));
}

const NOTES = [
  "", "", "", "特に異常なし", "特に異常なし",
  "タイヤの空気圧をやや低めに感じた", "フロントガラスの汚れが目立った",
  "ワイパーの拭き取りが弱い", "エンジン始動時に異音が少しあった",
];

function buildDailyReports(vehicles: Vehicle[], staffList: Staff[]): {
  reports: DailyReport[];
  log: AuditLogEntry[];
} {
  const rand = seededRand(7);
  const today = new Date();
  const reports: DailyReport[] = [];
  const log: AuditLogEntry[] = [];

  // 過去13日分、各スタッフほぼ毎日提出(欠落もランダムに作る)
  for (let d = 13; d >= 1; d--) {
    const day = subDays(today, d);
    staffList.forEach((staff, si) => {
      if (rand() < 0.12) return; // たまに未提出日を作る(リアルさ)
      const vehicle = vehicles.find((v) => v.id === staff.vehicleId)!;
      const hour = 6 + Math.floor(rand() * 2);
      const minute = Math.floor(rand() * 60);
      const reportedAt = new Date(day);
      reportedAt.setHours(hour, minute, 0, 0);
      const odo = vehicle.odometerKm - d * (30 + Math.floor(rand() * 90)) + si * 3;
      const report: DailyReport = {
        id: genId("rep"),
        staffId: staff.id,
        vehicleId: vehicle.id,
        officeId: staff.officeId,
        reportedAt: reportedAt.toISOString(),
        odometerPhoto: "sample:odometer",
        odometerKm: Math.max(10000, odo),
        hygienePhoto: "sample:hygiene",
        alcoholLevel: 0.0,
        temperature: Math.round((36.1 + rand() * 0.9) * 10) / 10,
        fuelLiters: rand() < 0.25 ? Math.round(20 + rand() * 40) : undefined,
        partsReplaced: rand() < 0.08 ? ["oil"] : [],
        conditionNote: NOTES[Math.floor(rand() * NOTES.length)],
        status: "approved",
        approvedBy: ADMINS[si % ADMINS.length].name,
        approvedAt: new Date(reportedAt.getTime() + (15 + rand() * 40) * 60000).toISOString(),
      };
      reports.push(report);
      log.push({
        id: genId("log"),
        reportId: report.id,
        staffId: staff.id,
        officeId: staff.officeId,
        vehicleId: vehicle.id,
        adminName: report.approvedBy!,
        confirmedAt: report.approvedAt!,
      });
    });
  }

  // 本日分: 何人かは提出済み未確認(pending)、何人かは未提出のまま(スタッフ画面デモ用)
  staffList.forEach((staff, si) => {
    const vehicle = vehicles.find((v) => v.id === staff.vehicleId)!;
    if (si % 4 === 3) return; // 未提出を残す
    const reportedAt = new Date(today);
    reportedAt.setHours(6 + Math.floor(rand() * 2), Math.floor(rand() * 60), 0, 0);
    if (reportedAt > today) reportedAt.setHours(6, 30, 0, 0);
    const odo = vehicle.odometerKm + si;
    const isPending = si % 3 !== 0;
    const report: DailyReport = {
      id: genId("rep"),
      staffId: staff.id,
      vehicleId: vehicle.id,
      officeId: staff.officeId,
      reportedAt: reportedAt.toISOString(),
      odometerPhoto: "sample:odometer",
      odometerKm: odo,
      hygienePhoto: "sample:hygiene",
      alcoholLevel: 0.0,
      temperature: Math.round((36.2 + rand() * 0.7) * 10) / 10,
      fuelLiters: undefined,
      partsReplaced: [],
      conditionNote: "",
      status: isPending ? "pending" : "approved",
      approvedBy: isPending ? undefined : ADMINS[si % ADMINS.length].name,
      approvedAt: isPending
        ? undefined
        : new Date(reportedAt.getTime() + 20 * 60000).toISOString(),
    };
    reports.push(report);
    if (!isPending) {
      log.push({
        id: genId("log"),
        reportId: report.id,
        staffId: staff.id,
        officeId: staff.officeId,
        vehicleId: vehicle.id,
        adminName: report.approvedBy!,
        confirmedAt: report.approvedAt!,
      });
    }
  });

  reports.sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));
  log.sort((a, b) => b.confirmedAt.localeCompare(a.confirmedAt));
  return { reports, log };
}

const INSURERS = [
  { name: "あおぞら損害保険", agent: "みらい保険代理店 東京支社", tel: "03-4500-1122" },
  { name: "はまなす海上火災", agent: "はまなす代理店サービス", tel: "06-4500-3344" },
];

function buildInsurance(vehicles: Vehicle[]): InsurancePolicy[] {
  const rand = seededRand(99);
  const today = new Date();
  return vehicles.map((v, i) => {
    const ins = INSURERS[i % INSURERS.length];
    return {
      vehicleId: v.id,
      companyName: ins.name,
      agentName: ins.agent,
      emergencyContact: ins.tel,
      policyNumber: `POL-${today.getFullYear()}-${(100000 + i * 733).toString().padStart(6, "0")}`,
      startDate: formatISO(subMonths(today, 4), { representation: "date" }),
      endDate: formatISO(addMonths(today, 8), { representation: "date" }),
      liabilityUnlimited: true,
      hasVehicleCoverage: rand() < 0.75,
      deductible: [0, 50000, 100000][Math.floor(rand() * 3)],
    };
  });
}

function buildAccidents(vehicles: Vehicle[], staffList: Staff[]): AccidentRecord[] {
  const rand = seededRand(123);
  const today = new Date();
  const statuses: AccidentStatus[] = ["受付", "交渉中", "修理中", "完了"];
  const summaries = [
    "施設駐車場内で後退時に隣接車両と接触",
    "送迎中、交差点での右折時に対向直進車と接触",
    "利用者宅前で信号待ち停車中に後方から追突された",
    "狭路ですれ違い時に左側ミラーが接触",
    "利用者宅前の私道で塀に接触し車両後部を損傷",
  ];
  const locations = [
    "東京都杉並区 施設駐車場", "東京都練馬区 交差点(区道)",
    "東京都世田谷区 幹線道路上", "東京都中野区 利用者宅前の路地",
  ];
  return Array.from({ length: 5 }).map((_, i) => {
    const vehicle = vehicles[(i * 3) % vehicles.length];
    const staff = staffList.find((s) => s.vehicleId === vehicle.id)!;
    const repairCost = 80000 + Math.floor(rand() * 420000);
    const faultSelf = [0, 10, 20, 30, 50][i % 5];
    const payoutRatio = 0.6 + rand() * 0.35;
    const insurancePayout = Math.round((repairCost * payoutRatio) / 1000) * 1000;
    const status = statuses[Math.min(i, statuses.length - 1)];
    return {
      id: genId("acc"),
      vehicleId: vehicle.id,
      staffId: staff.id,
      occurredAt: subDays(today, 5 + i * 23).toISOString(),
      location: locations[i % locations.length],
      summary: summaries[i % summaries.length],
      counterpartyInfo:
        i % 2 === 0
          ? "相手方: 個人(乗用車) / 連絡先: 090-XXXX-XXXX / 相手側保険: つばさ自動車保険"
          : "相手方: 法人車両(宅配業者) / 連絡先: 相手方勤務先経由 / 相手側保険: 未加入(自社対応)",
      faultRatioSelf: faultSelf,
      faultRatioOther: 100 - faultSelf,
      repairCost,
      insurancePayout: status === "受付" ? 0 : insurancePayout,
      status,
      createdAt: subDays(today, 5 + i * 23).toISOString(),
    };
  });
}

export function buildSeed(): AppData {
  idc = 0;
  const vehicles = buildVehicles();
  const staffList = buildStaff(vehicles);
  const { reports, log } = buildDailyReports(vehicles, staffList);
  return {
    offices: OFFICES,
    staffList,
    admins: ADMINS,
    vehicles,
    dailyReports: reports,
    auditLog: log,
    insurancePolicies: buildInsurance(vehicles),
    accidentRecords: buildAccidents(vehicles, staffList),
  };
}

export const DEFAULT_STAFF_ID = "stf_1";
export const DEFAULT_ADMIN_ID = "adm_1";

export const SAFETY_CONTACTS = [
  { label: "任意保険 事故受付窓口", tel: "0120-000-111" },
  { label: "レッカー・ロードサービス", tel: "0120-000-222" },
  { label: "運行管理者(本社)", tel: "03-4500-0000" },
];

export const APPROVAL_MESSAGE =
  "素晴らしい一日のスタートになりますように。お気をつけていってらっしゃいませ！今日も良い一日になりますように！";
