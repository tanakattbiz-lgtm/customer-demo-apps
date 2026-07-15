import { useEffect, useRef } from "react";
import type { Design } from "../data/seed";
import { sizeById } from "../data/seed";
import { drawPreview, loadImage } from "../lib/badge";

// デザインを金属バッジ風の完成イメージで描くサムネイル
export default function BadgeThumb({ design, size = 200 }: { design: Design; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let alive = true;
    const canvasEl = ref.current;
    if (!canvasEl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasEl.width = size * dpr;
    canvasEl.height = size * dpr;
    const ctx = canvasEl.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bs = sizeById(design.sizeId);

    const render = (img: HTMLImageElement | null) => {
      if (!alive) return;
      drawPreview(ctx, bs, img, design.transform, design.bgColor, size);
    };

    if (design.imageSrc) {
      loadImage(design.imageSrc).then(render).catch(() => render(null));
    } else {
      render(null);
    }
    return () => {
      alive = false;
    };
  }, [design, size]);

  return <canvas ref={ref} style={{ width: size, height: size }} className="block" />;
}
