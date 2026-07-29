import { useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, ImagePlus, RefreshCw, ScanLine, CheckCircle2 } from "lucide-react";
import { Button } from "./ui";

type Status = "empty" | "analyzing" | "done";

export function PhotoUploadOCR<T>({
  title,
  description,
  sampleImage,
  onAnalyze,
  onResult,
  onPhotoReady,
  resultSummary,
  disabled = false,
}: {
  title: string;
  description: string;
  sampleImage: string;
  onAnalyze: () => Promise<T>;
  onResult: (result: T) => void;
  onPhotoReady?: (src: string) => void;
  resultSummary?: (result: T) => ReactNode;
  disabled?: boolean;
}) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("empty");
  const [result, setResult] = useState<T | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function runAnalysis(src: string) {
    setPhoto(src);
    onPhotoReady?.(src);
    setStatus("analyzing");
    setResult(null);
    const r = await onAnalyze();
    setResult(r);
    setStatus("done");
    onResult(r);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    runAnalysis(url);
    e.target.value = "";
  }

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-ink-900">{title}</div>
          <div className="mt-0.5 text-xs text-ink-500">{description}</div>
        </div>
        {status === "done" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={13} /> 解析完了
          </span>
        )}
      </div>

      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-ink-100">
        {photo ? (
          <img src={photo} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-400">
            <Camera size={30} />
            <span className="text-xs">写真が未添付です</span>
          </div>
        )}

        <AnimatePresence>
          {status === "analyzing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-hidden bg-ink-900/55 backdrop-blur-[1px]"
            >
              <div className="scan-line absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white">
                <ScanLine size={26} className="animate-pulse" />
                <span className="text-xs font-medium">AIが解析中…</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {status === "done" && result && resultSummary && (
        <div className="mt-3 flex flex-wrap gap-2">{resultSummary(result)}</div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || status === "analyzing"}
          onClick={() => fileRef.current?.click()}
        >
          <Camera size={14} /> 撮影 / 写真を選択
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || status === "analyzing"}
          onClick={() => runAnalysis(sampleImage)}
        >
          <ImagePlus size={14} /> サンプル写真を使う
        </Button>
        {status === "done" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => runAnalysis(photo ?? sampleImage)}
          >
            <RefreshCw size={14} /> 再解析
          </Button>
        )}
      </div>
    </div>
  );
}
