import { subDays, subHours } from "date-fns";

export type BadgeSize = {
  id: string;
  label: string;
  mm: number;
  finishMm: number; // 仕上がり径
  bleedMm: number; // 塗り足しを含む断裁径
  safeMm: number; // デザイン安全エリア径
  unitPrice: number; // 1個あたりの参考単価（デモ用ダミー）
};

export const SIZES: BadgeSize[] = [
  { id: "s25", label: "25mm", mm: 25, finishMm: 25, bleedMm: 33, safeMm: 17, unitPrice: 90 },
  { id: "s32", label: "32mm", mm: 32, finishMm: 32, bleedMm: 40, safeMm: 24, unitPrice: 110 },
  { id: "s44", label: "44mm", mm: 44, finishMm: 44, bleedMm: 52, safeMm: 36, unitPrice: 140 },
  { id: "s57", label: "57mm", mm: 57, finishMm: 57, bleedMm: 65, safeMm: 49, unitPrice: 180 },
  { id: "s75", label: "75mm", mm: 75, finishMm: 75, bleedMm: 83, safeMm: 67, unitPrice: 240 },
];

export const sizeById = (id: string) => SIZES.find((s) => s.id === id) ?? SIZES[2];

export type Transform = {
  scale: number; // 1 = 塗り足し円をちょうど覆う
  rotation: number; // degrees
  offsetX: number; // キャンバス幅に対する割合 (-0.6 .. 0.6)
  offsetY: number;
};

export const DEFAULT_TRANSFORM: Transform = { scale: 1, rotation: 0, offsetX: 0, offsetY: 0 };

export type DesignStatus = "draft" | "ready" | "ordered";

export type Design = {
  id: string;
  name: string;
  sizeId: string;
  imageSrc: string | null;
  bgColor: string;
  transform: Transform;
  qty: number;
  status: DesignStatus;
  createdAt: string;
  updatedAt: string;
};

// ---- ダミー絵柄（自作 SVG。実在キャラ・ロゴは使用しない）----------------

const enc = (svg: string) =>
  "data:image/svg+xml," +
  encodeURIComponent(svg.replace(/\s{2,}/g, " ").trim());

function gradient(id: string, a: string, b: string, angle = 45) {
  const r = (angle * Math.PI) / 180;
  const x2 = (Math.cos(r) * 0.5 + 0.5).toFixed(3);
  const y2 = (Math.sin(r) * 0.5 + 0.5).toFixed(3);
  return `<linearGradient id='${id}' x1='0' y1='0' x2='${x2}' y2='${y2}'>
    <stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient>`;
}

function artInitial(letter: string, a: string, b: string) {
  return enc(`<svg xmlns='http://www.w3.org/2000/svg' width='560' height='560'>
    <defs>${gradient("g", a, b, 60)}</defs>
    <rect width='560' height='560' fill='url(#g)'/>
    <circle cx='280' cy='280' r='190' fill='rgba(255,255,255,.14)'/>
    <text x='280' y='378' font-family='Arial, sans-serif' font-size='300' font-weight='700'
      fill='#fff' text-anchor='middle'>${letter}</text></svg>`);
}

function artDots(bg: string, dot: string) {
  let c = "";
  for (let y = 0; y < 7; y++)
    for (let x = 0; x < 7; x++)
      c += `<circle cx='${40 + x * 80}' cy='${40 + y * 80}' r='24' fill='${dot}'/>`;
  return enc(`<svg xmlns='http://www.w3.org/2000/svg' width='560' height='560'>
    <rect width='560' height='560' fill='${bg}'/>${c}</svg>`);
}

function artStars(a: string, b: string, star: string) {
  const pts = (cx: number, cy: number, r: number) => {
    let p = "";
    for (let i = 0; i < 10; i++) {
      const ang = (Math.PI / 5) * i - Math.PI / 2;
      const rr = i % 2 ? r * 0.45 : r;
      p += `${(cx + Math.cos(ang) * rr).toFixed(1)},${(cy + Math.sin(ang) * rr).toFixed(1)} `;
    }
    return `<polygon points='${p}' fill='${star}'/>`;
  };
  return enc(`<svg xmlns='http://www.w3.org/2000/svg' width='560' height='560'>
    <defs>${gradient("g", a, b, 120)}</defs><rect width='560' height='560' fill='url(#g)'/>
    ${pts(180, 200, 90)}${pts(400, 300, 60)}${pts(260, 420, 45)}</svg>`);
}

function artStripes(a: string, b: string) {
  let s = "";
  for (let i = -8; i < 16; i++)
    s += `<rect x='${i * 70}' y='-100' width='36' height='900' fill='${i % 2 ? a : b}' transform='rotate(30 280 280)'/>`;
  return enc(`<svg xmlns='http://www.w3.org/2000/svg' width='560' height='560'>
    <rect width='560' height='560' fill='${b}'/>${s}</svg>`);
}

function artHeart(a: string, b: string) {
  return enc(`<svg xmlns='http://www.w3.org/2000/svg' width='560' height='560'>
    <defs>${gradient("g", a, b, 90)}</defs><rect width='560' height='560' fill='url(#g)'/>
    <path d='M280 430 C140 330 160 200 250 200 C300 200 280 250 280 250
      C280 250 260 200 310 200 C400 200 420 330 280 430 Z' fill='#fff' opacity='.92'/></svg>`);
}

export const ARTWORKS: string[] = [
  artInitial("A", "#f472b6", "#a855f7"),
  artInitial("R", "#22d3ee", "#3b82f6"),
  artDots("#fde68a", "#f97316"),
  artStars("#1e293b", "#4338ca", "#fbbf24"),
  artStripes("#ec4899", "#fbcfe8"),
  artHeart("#fb7185", "#e11d48"),
  artInitial("K", "#34d399", "#059669"),
  artDots("#ede9fe", "#8b5cf6"),
  artStars("#0f766e", "#0d9488", "#f0fdfa"),
  artInitial("S", "#fb923c", "#ef4444"),
];

// ---- シードデザイン ------------------------------------------------------

const now = new Date();
const iso = (d: Date) => d.toISOString();

type Seed = [
  name: string,
  sizeId: string,
  art: number,
  bg: string,
  qty: number,
  status: DesignStatus,
  daysAgo: number,
  t: Partial<Transform>,
];

const RAW: Seed[] = [
  ["推しカラー缶バッジ", "s57", 0, "#fce7f3", 30, "ready", 0, { scale: 1.05 }],
  ["サークルロゴ 2026", "s44", 1, "#e0f2fe", 100, "ordered", 2, { scale: 1.2, rotation: -4 }],
  ["夏フェス記念バッジ", "s75", 3, "#0f172a", 50, "ready", 1, { scale: 0.95 }],
  ["ハートモチーフ", "s32", 5, "#fff1f2", 24, "draft", 0, { scale: 1.1, offsetY: -0.03 }],
  ["水玉ポップ", "s44", 2, "#fffbeb", 40, "ordered", 5, { scale: 1, rotation: 6 }],
  ["スタースタジオ", "s57", 8, "#134e4a", 60, "ready", 3, { scale: 1.15 }],
  ["イニシャル A", "s25", 0, "#faf5ff", 10, "draft", 0, { scale: 1.25 }],
  ["ストライプ・ピンク", "s44", 4, "#fdf2f8", 80, "ready", 4, { scale: 1 }],
  ["部活記念 バスケ部", "s57", 6, "#ecfdf5", 45, "ordered", 8, { scale: 1.1, rotation: -8 }],
  ["ラベンダードット", "s32", 7, "#f5f3ff", 20, "draft", 1, { scale: 1.05 }],
  ["サンセット S", "s75", 9, "#fff7ed", 25, "ready", 6, { scale: 0.9 }],
  ["ブルーグラデ R", "s44", 1, "#eff6ff", 36, "draft", 0, { scale: 1.3, offsetX: 0.04 }],
  ["文化祭2026 スター", "s57", 3, "#1e1b4b", 120, "ordered", 12, { scale: 1 }],
  ["ミントグリーン K", "s32", 6, "#f0fdf4", 16, "ready", 2, { scale: 1.15 }],
];

export function makeSeedDesigns(): Design[] {
  return RAW.map((r, i) => {
    const [name, sizeId, art, bg, qty, status, daysAgo, t] = r;
    const created = subDays(now, daysAgo + 2);
    const updated = daysAgo === 0 ? subHours(now, (i % 6) + 1) : subDays(now, daysAgo);
    return {
      id: `dsn_${(1000 + i).toString(36)}`,
      name,
      sizeId,
      imageSrc: ARTWORKS[art],
      bgColor: bg,
      transform: { ...DEFAULT_TRANSFORM, ...t },
      qty,
      status,
      createdAt: iso(created),
      updatedAt: iso(updated),
    };
  });
}

export const BG_SWATCHES = [
  "#ffffff",
  "#fce7f3",
  "#fef3c7",
  "#dcfce7",
  "#dbeafe",
  "#ede9fe",
  "#0f172a",
  "#1e1b4b",
  "#134e4a",
  "#7f1d1d",
];
