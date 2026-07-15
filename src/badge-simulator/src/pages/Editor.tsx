import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Upload, ImageIcon, Trash2, RotateCw, Maximize2, Crosshair,
  Eye, Save, AlertTriangle, Sparkles, Move,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../store";
import {
  SIZES, sizeById, ARTWORKS, BG_SWATCHES, DEFAULT_TRANSFORM,
  type Transform, type Design, type DesignStatus,
} from "../data/seed";
import { CANVAS, drawEditor, loadImage, type GuideFlags } from "../lib/badge";
import { fakeApi } from "../lib/fakeApi";
import { Button, Card, Field, Slider } from "../components/ui";
import PreviewModal from "../components/PreviewModal";

export default function Editor() {
  const { id } = useParams();
  const nav = useNavigate();
  const getDesign = useStore((s) => s.getDesign);
  const saveDesign = useStore((s) => s.saveDesign);
  const createDesign = useStore((s) => s.createDesign);
  const setStatus = useStore((s) => s.setStatus);

  const existing = id && id !== "new" ? getDesign(id) : undefined;

  const [editingId, setEditingId] = useState<string | null>(existing ? existing.id : null);
  const [name, setName] = useState(existing?.name ?? "無題のデザイン");
  const [sizeId, setSizeId] = useState(existing?.sizeId ?? SIZES[2].id);
  const [imageSrc, setImageSrc] = useState<string | null>(existing?.imageSrc ?? null);
  const [bgColor, setBgColor] = useState(existing?.bgColor ?? "#ffffff");
  const [transform, setTransform] = useState<Transform>(existing?.transform ?? { ...DEFAULT_TRANSFORM });
  const [qty, setQty] = useState(existing?.qty ?? 20);
  const [statusVal, setStatusVal] = useState<DesignStatus>(existing?.status ?? "draft");

  const [guides, setGuides] = useState<GuideFlags>({ bleed: true, finish: true, safe: true });
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  const size = useMemo(() => sizeById(sizeId), [sizeId]);

  // 画像の読み込み
  useEffect(() => {
    let alive = true;
    if (!imageSrc) {
      setImageEl(null);
      return;
    }
    loadImage(imageSrc)
      .then((img) => alive && setImageEl(img))
      .catch(() => alive && setImageEl(null));
    return () => {
      alive = false;
    };
  }, [imageSrc]);

  // 描画
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    el.width = CANVAS * dpr;
    el.height = CANVAS * dpr;
    const ctx = el.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawEditor(ctx, size, imageEl, transform, bgColor, guides);
  }, [size, imageEl, transform, bgColor, guides]);

  const patch = (p: Partial<Transform>) => setTransform((t) => ({ ...t, ...p }));

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("画像ファイルを選択してください");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      toast.error("ファイルサイズが大きすぎます", { description: "12MB 以下の画像を使用してください" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setTransform({ ...DEFAULT_TRANSFORM });
      toast.success("画像を読み込みました");
    };
    reader.readAsDataURL(file);
  };

  // ドラッグで移動
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!imageEl) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drag.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - drag.current.x) / rect.width;
    const dy = (e.clientY - drag.current.y) / rect.height;
    drag.current = { x: e.clientX, y: e.clientY };
    setTransform((t) => ({
      ...t,
      offsetX: clamp(t.offsetX + dx, -0.6, 0.6),
      offsetY: clamp(t.offsetY + dy, -0.6, 0.6),
    }));
  };
  const onPointerUp = () => {
    drag.current = null;
  };
  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!imageEl) return;
    const next = clamp(transform.scale * (e.deltaY < 0 ? 1.06 : 0.94), 0.3, 4);
    patch({ scale: round2(next) });
  };

  const save = async () => {
    setSaving(true);
    const base: Omit<Design, "id" | "createdAt" | "updatedAt"> = {
      name: name.trim() || "無題のデザイン",
      sizeId,
      imageSrc,
      bgColor,
      transform,
      qty,
      status: statusVal,
    };
    await fakeApi(true, 550);
    if (editingId) {
      const cur = getDesign(editingId);
      if (cur) saveDesign({ ...cur, ...base });
    } else {
      const created = createDesign(base);
      setEditingId(created.id);
      nav(`/editor/${created.id}`, { replace: true });
    }
    setSaving(false);
    toast.success("デザインを保存しました");
  };

  const coverWarning = imageEl && transform.scale < 1;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link to="/" className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 hover:bg-ink-100">
          <ArrowLeft size={18} />
        </Link>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-[160px] flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-lg font-bold
            text-ink-900 outline-none hover:border-ink-200 focus:border-brand-400 focus:bg-white"
        />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye size={16} /> 完成イメージ・入稿
          </Button>
          <Button onClick={save} loading={saving}>
            {!saving && <Save size={16} />} 保存
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* キャンバス */}
        <Card className="checker relative overflow-hidden p-4 sm:p-6">
          <div className="mx-auto w-full max-w-[520px]">
            <canvas
              ref={canvasRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              onWheel={onWheel}
              style={{ width: "100%", aspectRatio: "1 / 1", touchAction: "none" }}
              className={`rounded-lg ${imageEl ? "cursor-grab active:cursor-grabbing" : ""}`}
            />
          </div>

          {!imageEl && (
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute inset-x-6 bottom-6 top-6 m-auto grid h-40 max-w-xs place-items-center gap-2
                rounded-xl border-2 border-dashed border-brand-300 bg-white/70 text-brand-600 backdrop-blur-sm
                transition hover:bg-white"
            >
              <Upload size={26} />
              <span className="text-sm font-medium">クリックして画像をアップロード</span>
              <span className="text-xs text-ink-400">PNG / JPG / SVG（12MB まで）</span>
            </button>
          )}

          {imageEl && (
            <div className="pointer-events-none absolute left-6 top-6 flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-xs text-ink-500 shadow-sm backdrop-blur">
              <Move size={13} /> ドラッグで移動 ・ ホイールで拡大縮小
            </div>
          )}

          {/* ガイド凡例 */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-ink-500">
            <Legend color="#db2777" solid label="仕上がり線" />
            <Legend color="#94a3b8" label="塗り足し（断裁範囲）" />
            <Legend color="#059669" label="デザイン安全エリア" />
          </div>
        </Card>

        {/* 右パネル */}
        <div className="space-y-4">
          {coverWarning && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle size={15} className="mt-px shrink-0" />
              <span>絵柄が塗り足し（断裁範囲）まで届いていない可能性があります。フチに白が出ないよう拡大するか、背景色をご確認ください。</span>
            </div>
          )}

          {/* サイズ */}
          <Card className="p-4">
            <Field label="バッジサイズ">
              <div className="flex flex-wrap gap-1.5">
                {SIZES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSizeId(s.id)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                      sizeId === s.id
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-ink-200 text-ink-600 hover:bg-ink-50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </Field>
            <p className="mt-2 text-xs text-ink-400">
              仕上がり {size.finishMm}mm ／ 塗り足し込み {size.bleedMm}mm ／ 安全エリア {size.safeMm}mm
            </p>
          </Card>

          {/* 画像 */}
          <Card className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-ink-500">絵柄</span>
              {imageEl && (
                <button
                  onClick={() => { setImageSrc(null); setTransform({ ...DEFAULT_TRANSFORM }); }}
                  className="flex items-center gap-1 text-xs text-ink-400 hover:text-red-500"
                >
                  <Trash2 size={12} /> 削除
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => fileRef.current?.click()}>
                <Upload size={15} /> アップロード
              </Button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            <p className="mb-2 mt-4 flex items-center gap-1 text-xs text-ink-400">
              <Sparkles size={12} /> サンプル絵柄で試す
            </p>
            <div className="grid grid-cols-5 gap-2">
              {ARTWORKS.map((a, i) => (
                <button
                  key={i}
                  onClick={() => { setImageSrc(a); setTransform({ ...DEFAULT_TRANSFORM }); }}
                  className={`overflow-hidden rounded-lg border-2 transition ${
                    imageSrc === a ? "border-brand-500" : "border-transparent hover:border-ink-300"
                  }`}
                >
                  <img src={a} alt="" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          </Card>

          {/* 変形 */}
          <Card className="space-y-4 p-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 font-medium text-ink-500"><Maximize2 size={12} /> 拡大・縮小</span>
                <span className="tabular-nums text-ink-400">{Math.round(transform.scale * 100)}%</span>
              </div>
              <Slider value={transform.scale} min={0.3} max={4} step={0.01} onChange={(v) => patch({ scale: v })} />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 font-medium text-ink-500"><RotateCw size={12} /> 回転</span>
                <span className="tabular-nums text-ink-400">{Math.round(transform.rotation)}°</span>
              </div>
              <Slider value={transform.rotation} min={-180} max={180} step={1} onChange={(v) => patch({ rotation: v })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" className="!justify-start !px-2 text-xs" onClick={() => patch({ rotation: round2(transform.rotation + 90) > 180 ? transform.rotation + 90 - 360 : transform.rotation + 90 })}>
                <RotateCw size={14} /> 90°回転
              </Button>
              <Button
                variant="ghost"
                className="!justify-start !px-2 text-xs"
                onClick={() => { setTransform({ ...DEFAULT_TRANSFORM }); toast("配置をリセットしました"); }}
              >
                <Crosshair size={14} /> 中央にリセット
              </Button>
            </div>
          </Card>

          {/* 背景色 */}
          <Card className="p-4">
            <Field label="背景色（絵柄の外側）">
              <div className="flex flex-wrap items-center gap-2">
                {BG_SWATCHES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setBgColor(c)}
                    style={{ background: c }}
                    className={`h-7 w-7 rounded-full border shadow-sm transition ${
                      bgColor === c ? "ring-2 ring-brand-500 ring-offset-2" : "border-ink-200"
                    }`}
                    aria-label={c}
                  />
                ))}
                <label className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-full border border-ink-200">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="absolute -inset-2 cursor-pointer"
                  />
                </label>
              </div>
            </Field>
          </Card>

          {/* ガイド表示 */}
          <Card className="p-4">
            <span className="mb-2 block text-xs font-medium text-ink-500">ガイド表示</span>
            <div className="space-y-1">
              <GuideRow label="仕上がり線" checked={guides.finish} onChange={(v) => setGuides((g) => ({ ...g, finish: v }))} />
              <GuideRow label="塗り足し（断裁範囲）" checked={guides.bleed} onChange={(v) => setGuides((g) => ({ ...g, bleed: v }))} />
              <GuideRow label="デザイン安全エリア" checked={guides.safe} onChange={(v) => setGuides((g) => ({ ...g, safe: v }))} />
            </div>
          </Card>

          {/* 数量・ステータス */}
          <Card className="grid grid-cols-2 gap-3 p-4">
            <Field label="数量">
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
            </Field>
            <Field label="ステータス">
              <select
                value={statusVal}
                onChange={(e) => setStatusVal(e.target.value as DesignStatus)}
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-700 outline-none focus:border-brand-400"
              >
                <option value="draft">下書き</option>
                <option value="ready">入稿準備OK</option>
                <option value="ordered">注文済み</option>
              </select>
            </Field>
          </Card>
        </div>
      </div>

      {showPreview && (
        <PreviewModal
          name={name}
          size={size}
          imageSrc={imageSrc}
          transform={transform}
          bgColor={bgColor}
          qty={qty}
          onClose={() => setShowPreview(false)}
          onOrder={() => {
            setStatusVal("ordered");
            let targetId = editingId;
            if (!targetId) {
              const created = createDesign({
                name: name.trim() || "無題のデザイン",
                sizeId, imageSrc, bgColor, transform, qty, status: "ordered",
              });
              targetId = created.id;
              setEditingId(created.id);
              nav(`/editor/${created.id}`, { replace: true });
            } else {
              const cur = getDesign(targetId);
              if (cur) saveDesign({ ...cur, name, sizeId, imageSrc, bgColor, transform, qty });
              setStatus(targetId, "ordered");
            }
            setShowPreview(false);
            toast.success("注文を確定しました", { description: "「注文済み」として保存されました（デモ）" });
          }}
        />
      )}
    </div>
  );
}

function Legend({ color, label, solid }: { color: string; label: string; solid?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block h-0 w-5 rounded"
        style={{ borderTop: `2px ${solid ? "solid" : "dashed"} ${color}` }}
      />
      {label}
    </span>
  );
}

function GuideRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-md px-1 py-1 text-sm text-ink-600 hover:bg-ink-50">
      {label}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-brand-500"
      />
    </label>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
function round2(v: number) {
  return Math.round(v * 100) / 100;
}
