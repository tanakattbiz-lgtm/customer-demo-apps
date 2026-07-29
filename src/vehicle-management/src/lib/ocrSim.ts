/**
 * 「AI OCR」の疑似解析。
 * 本デモではアップロードされた画像の中身は解析せず、
 * 現実的な範囲の値をゆらぎ付きで返すことで「自動入力される手応え」を再現する。
 */
import { fakeApi } from "./fakeApi";

export type OdometerOcrResult = {
  odometerKm: number;
  confidence: number;
};

export async function ocrOdometer(baseKm: number): Promise<OdometerOcrResult> {
  const odometerKm = Math.round(baseKm + Math.random() * 8 + 1);
  return fakeApi(
    { odometerKm, confidence: 0.9 + Math.random() * 0.09 },
    1300,
  );
}

export type HygieneOcrResult = {
  alcoholLevel: number;
  temperature: number;
  confidence: number;
};

export async function ocrHygiene(): Promise<HygieneOcrResult> {
  const temperature = Math.round((36.0 + Math.random() * 0.9) * 10) / 10;
  return fakeApi(
    { alcoholLevel: 0.0, temperature, confidence: 0.9 + Math.random() * 0.09 },
    1500,
  );
}

export type VehicleRegistrationOcrResult = {
  plateNumber: string;
  model: string;
  chassisNumber: string;
  inspectionExpiry: string; // ISO date
};

const SAMPLE_MODELS = [
  "トヨタ ハイエース バン",
  "日産 NV350 キャラバン",
  "いすゞ エルフ",
  "日野 デュトロ",
];
const SAMPLE_AREAS = ["品川", "練馬", "大阪", "福岡"];
const SAMPLE_KANA = ["あ", "い", "う", "か", "さ"];

export async function ocrVehicleRegistration(): Promise<VehicleRegistrationOcrResult> {
  const area = SAMPLE_AREAS[Math.floor(Math.random() * SAMPLE_AREAS.length)];
  const kana = SAMPLE_KANA[Math.floor(Math.random() * SAMPLE_KANA.length)];
  const num1 = Math.floor(10 + Math.random() * 89);
  const num2 = Math.floor(10 + Math.random() * 89);
  const model = SAMPLE_MODELS[Math.floor(Math.random() * SAMPLE_MODELS.length)];
  const chassisNumber = `XZU${Math.floor(100000 + Math.random() * 899999)}`;
  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + 3 + Math.floor(Math.random() * 24));

  return fakeApi(
    {
      plateNumber: `${area} 300 ${kana} ${num1}-${num2}`,
      model,
      chassisNumber,
      inspectionExpiry: expiry.toISOString().slice(0, 10),
    },
    1700,
  );
}
