import type { BadgeSize, Transform } from "../data/seed";

export const CANVAS = 480; // 論理キャンバスサイズ
const BLEED_FILL = 0.45; // 塗り足し円の半径 / キャンバス

export type Radii = { cx: number; cy: number; bleedR: number; finishR: number; safeR: number };

export function radii(size: BadgeSize, canvas = CANVAS): Radii {
  const bleedR = canvas * BLEED_FILL;
  return {
    cx: canvas / 2,
    cy: canvas / 2,
    bleedR,
    finishR: (bleedR * size.finishMm) / size.bleedMm,
    safeR: (bleedR * size.safeMm) / size.bleedMm,
  };
}

type CompositionOpts = {
  img: HTMLImageElement | null;
  transform: Transform;
  bgColor: string;
  size: BadgeSize;
  canvas: number;
  clipR: number;
};

// 背景＋画像を clipR の円に収めて描画する（ガイドは含まない）
function drawComposition(ctx: CanvasRenderingContext2D, o: CompositionOpts) {
  const { cx, cy, bleedR } = radii(o.size, o.canvas);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, o.clipR, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = o.bgColor;
  ctx.fillRect(0, 0, o.canvas, o.canvas);
  if (o.img && o.img.width) {
    const cover = (2 * bleedR) / Math.min(o.img.width, o.img.height);
    const s = cover * o.transform.scale;
    ctx.translate(cx + o.transform.offsetX * o.canvas, cy + o.transform.offsetY * o.canvas);
    ctx.rotate((o.transform.rotation * Math.PI) / 180);
    ctx.drawImage(o.img, (-o.img.width * s) / 2, (-o.img.height * s) / 2, o.img.width * s, o.img.height * s);
  }
  ctx.restore();
}

function ring(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, dash: number[], w = 2) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.setLineDash(dash);
  ctx.lineWidth = w;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.restore();
}

export type GuideFlags = { bleed: boolean; finish: boolean; safe: boolean };

// エディタ描画：合成＋断裁外の減光＋ガイド線
export function drawEditor(
  ctx: CanvasRenderingContext2D,
  size: BadgeSize,
  img: HTMLImageElement | null,
  transform: Transform,
  bgColor: string,
  guides: GuideFlags,
  canvas = CANVAS,
) {
  const { cx, cy, bleedR, finishR, safeR } = radii(size, canvas);
  ctx.clearRect(0, 0, canvas, canvas);
  drawComposition(ctx, { img, transform, bgColor, size, canvas, clipR: bleedR });

  // 断裁範囲の外側を薄いチェッカーで表現
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, canvas, canvas);
  ctx.arc(cx, cy, bleedR, 0, Math.PI * 2, true);
  ctx.fillStyle = "rgba(148,163,184,0.16)";
  ctx.fill("evenodd");
  ctx.restore();

  if (guides.bleed) ring(ctx, cx, cy, bleedR, "#94a3b8", [6, 5], 1.5);
  if (guides.finish) ring(ctx, cx, cy, finishR, "#db2777", [], 2.5);
  if (guides.safe) ring(ctx, cx, cy, safeR, "#059669", [4, 4], 1.5);

  if (guides.finish) {
    ctx.save();
    ctx.strokeStyle = "rgba(219,39,119,0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 9, cy);
    ctx.lineTo(cx + 9, cy);
    ctx.moveTo(cx, cy - 9);
    ctx.lineTo(cx, cy + 9);
    ctx.stroke();
    ctx.restore();
  }
}

// 完成イメージ：仕上がり円でクリップし、金属バッジ風の光沢を重ねる
export function drawPreview(
  ctx: CanvasRenderingContext2D,
  size: BadgeSize,
  img: HTMLImageElement | null,
  transform: Transform,
  bgColor: string,
  canvas = CANVAS,
) {
  const { cx, cy, finishR } = radii(size, canvas);
  ctx.clearRect(0, 0, canvas, canvas);

  // 落ち影
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy + 6, finishR, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(15,23,42,0.28)";
  ctx.filter = "blur(10px)";
  ctx.fill();
  ctx.restore();

  drawComposition(ctx, { img, transform, bgColor, size, canvas, clipR: finishR });

  // 縁の丸みシェーディング
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, finishR, 0, Math.PI * 2);
  ctx.clip();
  const rim = ctx.createRadialGradient(cx, cy, finishR * 0.7, cx, cy, finishR);
  rim.addColorStop(0, "rgba(0,0,0,0)");
  rim.addColorStop(1, "rgba(0,0,0,0.28)");
  ctx.fillStyle = rim;
  ctx.fillRect(0, 0, canvas, canvas);

  // 光沢ハイライト
  const gloss = ctx.createRadialGradient(
    cx - finishR * 0.35,
    cy - finishR * 0.4,
    finishR * 0.05,
    cx - finishR * 0.3,
    cy - finishR * 0.35,
    finishR * 1.1,
  );
  gloss.addColorStop(0, "rgba(255,255,255,0.5)");
  gloss.addColorStop(0.25, "rgba(255,255,255,0.12)");
  gloss.addColorStop(0.5, "rgba(255,255,255,0)");
  ctx.fillStyle = gloss;
  ctx.fillRect(0, 0, canvas, canvas);
  ctx.restore();

  // 金属フチ
  ring(ctx, cx, cy, finishR, "rgba(255,255,255,0.65)", [], 2);
  ring(ctx, cx, cy, finishR - 1.5, "rgba(15,23,42,0.15)", [], 1);
}

// 入稿用 PNG を高解像度で書き出す（300dpi・塗り足し込み）
export function exportPrintPng(
  size: BadgeSize,
  img: HTMLImageElement | null,
  transform: Transform,
  bgColor: string,
  dpi = 300,
): string {
  const px = Math.round((size.bleedMm / 25.4) * dpi);
  const canvasEl = document.createElement("canvas");
  // 塗り足し円が全体を覆うよう、論理サイズを bleedR=0.45 基準で逆算
  const logical = Math.round(px / (2 * BLEED_FILL));
  canvasEl.width = logical;
  canvasEl.height = logical;
  const ctx = canvasEl.getContext("2d")!;
  drawComposition(ctx, { img, transform, bgColor, size, canvas: logical, clipR: radii(size, logical).bleedR });
  return canvasEl.toDataURL("image/png");
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
