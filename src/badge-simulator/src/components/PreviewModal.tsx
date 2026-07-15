import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { X, Download, ShoppingBag, Check, FileImage } from "lucide-react";
import { toast } from "sonner";
import type { BadgeSize, Transform } from "../data/seed";
import { drawPreview, exportPrintPng, loadImage } from "../lib/badge";
import { fakeApi } from "../lib/fakeApi";
import { Button } from "./ui";

type Props = {
  name: string;
  size: BadgeSize;
  imageSrc: string | null;
  transform: Transform;
  bgColor: string;
  qty: number;
  onClose: () => void;
  onOrder: () => void;
};

export default function PreviewModal(props: Props) {
  const { name, size, imageSrc, transform, bgColor, qty } = props;
  const ref = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [exporting, setExporting] = useState(false);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    const canvasEl = ref.current;
    if (!canvasEl) return;
    const D = 340;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasEl.width = D * dpr;
    canvasEl.height = D * dpr;
    const ctx = canvasEl.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const render = (img: HTMLImageElement | null) => {
      imgRef.current = img;
      drawPreview(ctx, size, img, transform, bgColor, D);
    };
    if (imageSrc) loadImage(imageSrc).then(render).catch(() => render(null));
    else render(null);
  }, [size, imageSrc, transform, bgColor]);

  const printPx = Math.round((size.bleedMm / 25.4) * 300);
  const total = qty * size.unitPrice;

  const handleExport = async () => {
    setExporting(true);
    const url = exportPrintPng(size, imgRef.current, transform, bgColor, 300);
    await fakeApi(true, 600);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name || "badge"}_${size.label}_入稿データ.png`;
    a.click();
    setExporting(false);
    toast.success("入稿データを書き出しました", {
      description: `${size.label}／${printPx}×${printPx}px・300dpi`,
    });
  };

  const handleOrder = async () => {
    setOrdering(true);
    await fakeApi(true, 700);
    setOrdering(false);
    props.onOrder();
  };

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink-900/50 p-4" onClick={props.onClose}>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-ink-200 px-5 py-3">
          <h2 className="font-semibold text-ink-900">完成イメージ・入稿</h2>
          <button onClick={props.onClose} className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <div className="grid place-items-center rounded-xl bg-gradient-to-b from-ink-100 to-ink-200 py-8">
            <canvas ref={ref} style={{ width: 340, height: 340 }} />
          </div>

          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-ink-900">{name || "無題のデザイン"}</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <Row k="サイズ" v={`${size.label}（仕上がり径 ${size.finishMm}mm）`} />
              <Row k="入稿サイズ" v={`塗り足し込み ${size.bleedMm}mm`} />
              <Row k="解像度" v={`${printPx} × ${printPx}px / 300dpi`} />
              <Row k="数量" v={`${qty}個`} />
              <Row k="参考金額" v={`¥${total.toLocaleString()}（@¥${size.unitPrice}）`} />
            </dl>

            <ul className="mt-4 space-y-1.5 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
              <li className="flex gap-1.5"><Check size={14} className="mt-px shrink-0" />塗り足しまで絵柄が入っています</li>
              <li className="flex gap-1.5"><Check size={14} className="mt-px shrink-0" />重要な要素は安全エリア内に収まっています</li>
              <li className="flex gap-1.5"><FileImage size={14} className="mt-px shrink-0" />PNG（CMYK 相当・フチ折り込み対応）で書き出します</li>
            </ul>

            <div className="mt-auto flex flex-col gap-2 pt-5">
              <Button variant="outline" onClick={handleExport} loading={exporting}>
                {!exporting && <Download size={16} />} 入稿用データを書き出す
              </Button>
              <Button onClick={handleOrder} loading={ordering}>
                {!ordering && <ShoppingBag size={16} />} この内容で注文を確定
              </Button>
              <p className="text-center text-[11px] text-ink-400">
                ※ 本デモでは決済・外部連携は行いません
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-ink-100 pb-2">
      <dt className="text-ink-400">{k}</dt>
      <dd className="text-right font-medium text-ink-800">{v}</dd>
    </div>
  );
}
