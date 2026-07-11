"use client";

import JSZip from "jszip";
import { useEffect, useMemo, useRef, useState } from "react";
import { Archive, CheckCircle2, Download, FileImage, Images, LoaderCircle, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { RegistrationGate } from "@/components/usage/registration-gate";
import { useToolUsage } from "@/hooks/use-tool-usage";
import { bytesLabel, downloadBlob, safeFilename } from "@/lib/utils";
import { calculateDimensions, canvasToBlob, extensionForType, loadBitmap, validateImageFile } from "@/lib/client/image-processing";

type ImageEntry = { id: string; file: File; preview: string };
type OutputEntry = { name: string; before: number; after: number; width: number; height: number };

export function BatchImages() {
  const [files, setFiles] = useState<ImageEntry[]>([]);
  const [format, setFormat] = useState("image/webp");
  const [quality, setQuality] = useState(82);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [preserveRatio, setPreserveRatio] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [output, setOutput] = useState<{ blob: Blob; entries: OutputEntry[] } | null>(null);
  const usage = useToolUsage("batch-images");
  const filesRef = useRef<ImageEntry[]>([]);

  useEffect(() => { filesRef.current = files; }, [files]);
  useEffect(() => () => filesRef.current.forEach((entry) => URL.revokeObjectURL(entry.preview)), []);

  const totalSize = useMemo(() => files.reduce((sum, entry) => sum + entry.file.size, 0), [files]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list).slice(0, Math.max(0, 25 - files.length));
    const valid: ImageEntry[] = [];
    incoming.forEach((file) => {
      const error = validateImageFile(file);
      if (error) toast.error(`${file.name}: ${error}`);
      else valid.push({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) });
    });
    if (Array.from(list).length + files.length > 25) toast.warning("الحد الأقصى 25 صورة في العملية الواحدة.");
    setFiles((current) => [...current, ...valid]);
    setOutput(null);
  }

  function removeFile(id: string) {
    setFiles((current) => {
      const target = current.find((entry) => entry.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return current.filter((entry) => entry.id !== id);
    });
    setOutput(null);
  }

  async function processImages() {
    if (!files.length) return toast.error("أضف صورة واحدة على الأقل.");
    if (width < 0 || height < 0 || width > 10000 || height > 10000) return toast.error("الأبعاد يجب أن تكون بين 1 و10000 بكسل، أو صفرًا للإبقاء على الأصل.");
    const token = await usage.begin();
    if (!token) return;
    setBusy(true);
    setProgress(0);
    setOutput(null);
    try {
      const zip = new JSZip();
      const entries: OutputEntry[] = [];
      for (let index = 0; index < files.length; index += 1) {
        const entry = files[index];
        const bitmap = await loadBitmap(entry.file);
        const dimensions = calculateDimensions(bitmap.width, bitmap.height, width, height, preserveRatio);
        const canvas = document.createElement("canvas");
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        const context = canvas.getContext("2d", { alpha: format !== "image/jpeg" });
        if (!context) throw new Error("canvas-context");
        if (format === "image/jpeg") {
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
        }
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        const blob = await canvasToBlob(canvas, format, quality / 100);
        const base = safeFilename(entry.file.name.replace(/\.[^.]+$/, "")) || `image-${index + 1}`;
        const name = `${base}-afaq.${extensionForType(format)}`;
        zip.file(name, blob);
        entries.push({ name, before: entry.file.size, after: blob.size, width: canvas.width, height: canvas.height });
        setProgress(Math.round(((index + 1) / files.length) * 85));
      }
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } }, (metadata) => setProgress(85 + Math.round(metadata.percent * 0.15)));
      setOutput({ blob, entries });
      await usage.complete(token);
      setProgress(100);
      toast.success(`تم تجهيز ${files.length} صورة داخل ZIP.`);
    } catch {
      toast.error("تعذرت معالجة الصور. لم تُخصم العملية.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[.78fr_1.22fr]">
      <aside className="glass-panel h-fit rounded-[28px] p-5 sm:p-6">
        <h2 className="font-display font-bold">إعدادات المعالجة</h2>
        <div className="mt-6 space-y-5">
          <div><label className="label">صيغة الإخراج</label><div className="grid grid-cols-3 gap-2">{[["image/webp", "WEBP"], ["image/jpeg", "JPG"], ["image/png", "PNG"]].map(([value, label]) => <button key={value} type="button" onClick={() => setFormat(value)} className={`min-h-10 rounded-xl border text-xs font-bold ${format === value ? "border-[var(--brand)] bg-[color-mix(in_srgb,var(--brand)_11%,transparent)] text-[var(--brand)]" : "border-[var(--line)] text-[var(--muted)]"}`}>{label}</button>)}</div></div>
          {format !== "image/png" && <div><div className="flex items-center justify-between"><label className="label">الجودة</label><span className="text-xs font-bold text-[var(--brand)]">{quality}%</span></div><input type="range" min={30} max={100} value={quality} onChange={(event) => setQuality(Number(event.target.value))} className="range-accent w-full" /></div>}
          <div className="grid grid-cols-2 gap-3"><div><label className="label">العرض الأقصى</label><input type="number" min={0} max={10000} value={width} onChange={(event) => setWidth(Number(event.target.value))} className="field" placeholder="الأصلي" /></div><div><label className="label">الارتفاع الأقصى</label><input type="number" min={0} max={10000} value={height} onChange={(event) => setHeight(Number(event.target.value))} className="field" placeholder="الأصلي" /></div></div>
          <label className="flex items-center gap-2 text-sm text-[var(--muted)]"><input type="checkbox" checked={preserveRatio} onChange={(event) => setPreserveRatio(event.target.checked)} className="accent-[var(--brand)]" /> المحافظة على تناسب الصورة</label>
          <div className="rounded-xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-3)_55%,transparent)] p-3 text-xs leading-6 text-[var(--faint)]">ضع 0 في العرض والارتفاع للإبقاء على المقاس الأصلي. تُعالج الصور محليًا داخل المتصفح.</div>
          <button type="button" onClick={processImages} disabled={busy || !files.length} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-45">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Images className="h-4 w-4" />}{busy ? `جارٍ المعالجة ${progress}%` : "معالجة الصور"}</button>
          {busy && <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]"><div className="h-full rounded-full bg-[var(--brand)] transition-all" style={{ width: `${progress}%` }} /></div>}
          {output && <button type="button" onClick={() => downloadBlob(output.blob, "afaq-batch-images.zip")} className="btn-secondary w-full"><Download className="h-4 w-4" /> تنزيل ZIP ({bytesLabel(output.blob.size)})</button>}
          {usage.remaining !== null && <p className="text-center text-xs text-[var(--faint)]">العمليات المتبقية: {usage.remaining}</p>}
        </div>
      </aside>
      <section className="glass-panel rounded-[28px] p-5 sm:p-7">
        <label className="flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--brand)_3%,transparent)] p-6 text-center transition hover:bg-[color-mix(in_srgb,var(--brand)_6%,transparent)]">
          <UploadCloud className="h-9 w-9 text-[var(--brand)]" /><strong className="mt-4">اسحب صورك أو اخترها</strong><span className="mt-2 text-xs text-[var(--faint)]">حتى 25 صورة — PNG، JPG، WEBP — بحد 15 MB للصورة</span>
          <input type="file" multiple accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { addFiles(event.target.files); event.currentTarget.value = ""; }} />
        </label>
        <div className="mt-5 flex items-center justify-between"><h2 className="font-bold">الملفات <span className="text-[var(--brand)]">({files.length})</span></h2>{files.length > 0 && <span className="text-xs text-[var(--faint)]">{bytesLabel(totalSize)}</span>}</div>
        {files.length ? (
          <div className="mt-4 max-h-[520px] space-y-2 overflow-auto pl-1">
            {files.map((entry, index) => {
              const result = output?.entries[index];
              return <div key={entry.id} className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-3)_55%,transparent)] p-3"><img src={entry.preview} alt="" className="h-14 w-14 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold" dir="auto">{entry.file.name}</p><p className="mt-1 text-[11px] text-[var(--faint)]">{bytesLabel(entry.file.size)}{result ? ` ← ${bytesLabel(result.after)} · ${result.width}×${result.height}` : ""}</p></div>{result && <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--success)]" />}<button type="button" onClick={() => removeFile(entry.id)} className="btn-ghost h-9 min-h-9 w-9 shrink-0 p-0 text-[var(--danger)]" aria-label={`حذف ${entry.file.name}`}><Trash2 className="h-4 w-4" /></button></div>;
            })}
          </div>
        ) : <div className="py-16 text-center text-[var(--faint)]"><FileImage className="mx-auto h-10 w-10 opacity-35" /><p className="mt-3 text-sm">لم تضف صورًا بعد</p></div>}
        {output && <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--success)_25%,transparent)] bg-[color-mix(in_srgb,var(--success)_7%,transparent)] p-4 text-sm text-[var(--success)]"><Archive className="h-5 w-5" /><span>ملف ZIP جاهز ويحتوي على {output.entries.length} صورة.</span></div>}
      </section>
      <RegistrationGate open={usage.gateOpen} onClose={usage.closeGate} />
    </div>
  );
}
