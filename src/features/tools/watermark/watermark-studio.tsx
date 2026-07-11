"use client";

import JSZip from "jszip";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlignCenter, Download, ImagePlus, Images, LoaderCircle, Stamp, Trash2, Type, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { RegistrationGate } from "@/components/usage/registration-gate";
import { useToolUsage } from "@/hooks/use-tool-usage";
import { canvasToBlob, extensionForType, loadBitmap, validateImageFile } from "@/lib/client/image-processing";
import { bytesLabel, downloadBlob, safeFilename } from "@/lib/utils";

type Position = "top-right" | "top-center" | "top-left" | "center-right" | "center" | "center-left" | "bottom-right" | "bottom-center" | "bottom-left";
type Entry = { id: string; file: File; preview: string };

const positions: Position[] = ["top-right", "top-center", "top-left", "center-right", "center", "center-left", "bottom-right", "bottom-center", "bottom-left"];

function coordinates(position: Position, canvasWidth: number, canvasHeight: number, markWidth: number, markHeight: number) {
  const margin = Math.max(18, Math.round(Math.min(canvasWidth, canvasHeight) * 0.035));
  const horizontal = position.endsWith("right") ? canvasWidth - margin - markWidth : position.endsWith("left") ? margin : (canvasWidth - markWidth) / 2;
  const vertical = position.startsWith("top") ? margin : position.startsWith("bottom") ? canvasHeight - margin - markHeight : (canvasHeight - markHeight) / 2;
  return { x: horizontal, y: vertical };
}

export function WatermarkStudio() {
  const [files, setFiles] = useState<Entry[]>([]);
  const [mode, setMode] = useState<"text" | "logo">("text");
  const [text, setText] = useState("برمجة وتطوير عدناني");
  const [color, setColor] = useState("#ffffff");
  const [opacity, setOpacity] = useState(58);
  const [size, setSize] = useState(7);
  const [position, setPosition] = useState<Position>("bottom-right");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [format, setFormat] = useState("image/jpeg");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ zip: Blob; preview: string; count: number } | null>(null);
  const usage = useToolUsage("watermark");
  const resourcesRef = useRef<{ files: Entry[]; logo: string | null; result: string | null }>({ files: [], logo: null, result: null });

  useEffect(() => { resourcesRef.current = { files, logo: logoPreview, result: result?.preview ?? null }; }, [files, logoPreview, result]);
  useEffect(() => () => {
    resourcesRef.current.files.forEach((entry) => URL.revokeObjectURL(entry.preview));
    if (resourcesRef.current.logo) URL.revokeObjectURL(resourcesRef.current.logo);
    if (resourcesRef.current.result) URL.revokeObjectURL(resourcesRef.current.result);
  }, []);

  const totalSize = useMemo(() => files.reduce((sum, entry) => sum + entry.file.size, 0), [files]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const accepted: Entry[] = [];
    Array.from(list).slice(0, Math.max(0, 20 - files.length)).forEach((file) => {
      const error = validateImageFile(file);
      if (error) toast.error(`${file.name}: ${error}`);
      else accepted.push({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) });
    });
    setFiles((current) => [...current, ...accepted]);
    setResult(null);
  }

  function selectLogo(file?: File) {
    if (!file) return;
    const error = validateImageFile(file, 5 * 1024 * 1024);
    if (error) return toast.error(error);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function processAll() {
    if (!files.length) return toast.error("أضف صورة واحدة على الأقل.");
    if (mode === "text" && !text.trim()) return toast.error("اكتب نص العلامة المائية.");
    if (mode === "logo" && !logoFile) return toast.error("اختر صورة الشعار أولًا.");
    const token = await usage.begin();
    if (!token) return;
    setBusy(true);
    setProgress(0);
    try {
      await document.fonts.ready;
      const logoBitmap = logoFile ? await loadBitmap(logoFile) : null;
      const zip = new JSZip();
      let firstOutput: Blob | null = null;
      for (let index = 0; index < files.length; index += 1) {
        const entry = files[index];
        const bitmap = await loadBitmap(entry.file);
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("canvas-context");
        if (format === "image/jpeg") {
          context.fillStyle = "#fff";
          context.fillRect(0, 0, canvas.width, canvas.height);
        }
        context.drawImage(bitmap, 0, 0);
        bitmap.close();
        context.globalAlpha = opacity / 100;
        if (mode === "text") {
          let fontSize = Math.max(18, Math.round(canvas.width * (size / 100)));
          context.font = `700 ${fontSize}px "IBM Plex Sans Arabic", Arial`;
          context.textBaseline = "top";
          context.direction = "rtl";
          let metrics = context.measureText(text.trim());
          const maxWidth = canvas.width * 0.76;
          if (metrics.width > maxWidth) {
            fontSize = Math.max(14, Math.round(fontSize * (maxWidth / metrics.width)));
            context.font = `700 ${fontSize}px "IBM Plex Sans Arabic", Arial`;
            metrics = context.measureText(text.trim());
          }
          const markWidth = metrics.width;
          const markHeight = fontSize * 1.25;
          const { x, y } = coordinates(position, canvas.width, canvas.height, markWidth, markHeight);
          context.shadowColor = "rgba(0,0,0,.28)";
          context.shadowBlur = Math.max(2, fontSize * 0.08);
          context.fillStyle = color;
          context.textAlign = "right";
          context.fillText(text.trim(), x + markWidth, y);
        } else if (logoBitmap) {
          const targetWidth = Math.max(36, canvas.width * (size / 100) * 2.5);
          const targetHeight = targetWidth * (logoBitmap.height / logoBitmap.width);
          const { x, y } = coordinates(position, canvas.width, canvas.height, targetWidth, targetHeight);
          context.drawImage(logoBitmap, x, y, targetWidth, targetHeight);
        }
        context.globalAlpha = 1;
        const blob = await canvasToBlob(canvas, format, format === "image/png" ? undefined : 0.9);
        if (!firstOutput) firstOutput = blob;
        const base = safeFilename(entry.file.name.replace(/\.[^.]+$/, "")) || `image-${index + 1}`;
        zip.file(`${base}-watermarked.${extensionForType(format)}`, blob);
        setProgress(Math.round(((index + 1) / files.length) * 88));
      }
      logoBitmap?.close();
      const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } }, (metadata) => setProgress(88 + Math.round(metadata.percent * 0.12)));
      if (!firstOutput) throw new Error("empty-output");
      if (result) URL.revokeObjectURL(result.preview);
      setResult({ zip: zipBlob, preview: URL.createObjectURL(firstOutput), count: files.length });
      await usage.complete(token);
      setProgress(100);
      toast.success("طُبقت العلامة المائية بنجاح.");
    } catch {
      toast.error("تعذر تطبيق العلامة المائية. لم تُخصم العملية.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[.84fr_1.16fr]">
      <aside className="glass-panel h-fit rounded-[28px] p-5 sm:p-6">
        <h2 className="font-display font-bold">إعداد العلامة</h2>
        <div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={() => setMode("text")} className={mode === "text" ? "btn-primary" : "btn-secondary"}><Type className="h-4 w-4" /> نص</button><button type="button" onClick={() => setMode("logo")} className={mode === "logo" ? "btn-primary" : "btn-secondary"}><ImagePlus className="h-4 w-4" /> شعار</button></div>
        <div className="mt-5 space-y-5">
          {mode === "text" ? <div><label className="label">النص</label><input className="field" value={text} onChange={(event) => setText(event.target.value)} maxLength={100} /><div className="mt-3 flex items-center gap-3"><input type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-10 w-14 cursor-pointer rounded-lg bg-transparent" /><span className="text-xs text-[var(--faint)]">لون النص</span></div></div> : <div className="rounded-2xl border border-dashed border-[var(--line-strong)] p-4"><label className="flex cursor-pointer items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--brand)_9%,transparent)] text-[var(--brand)]"><ImagePlus className="h-5 w-5" /></span><span><strong className="block text-sm">اختر شعارًا</strong><small className="text-[var(--faint)]">يفضل PNG شفاف</small></span><input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => selectLogo(event.target.files?.[0])} /></label>{logoPreview && <img src={logoPreview} alt="معاينة الشعار" className="mt-4 max-h-24 max-w-full rounded-xl object-contain" />}</div>}
          <div><div className="flex justify-between"><label className="label">الحجم</label><span className="text-xs font-bold text-[var(--brand)]">{size}%</span></div><input type="range" min={2} max={20} value={size} onChange={(event) => setSize(Number(event.target.value))} className="range-accent w-full" /></div>
          <div><div className="flex justify-between"><label className="label">الشفافية</label><span className="text-xs font-bold text-[var(--brand)]">{opacity}%</span></div><input type="range" min={10} max={100} value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} className="range-accent w-full" /></div>
          <div><label className="label"><AlignCenter className="ml-1 inline h-4 w-4" />الموضع</label><div className="grid grid-cols-3 gap-2 rounded-2xl border border-[var(--line)] p-3" dir="ltr">{positions.map((item) => <button key={item} type="button" onClick={() => setPosition(item)} aria-label={item} className={`aspect-[1.5] rounded-lg border transition ${position === item ? "border-[var(--brand)] bg-[color-mix(in_srgb,var(--brand)_16%,transparent)]" : "border-[var(--line)] bg-[var(--surface-3)]"}`}><span className={`mx-auto block h-1.5 w-1.5 rounded-full ${position === item ? "bg-[var(--brand)]" : "bg-[var(--faint)]"}`} /></button>)}</div></div>
          <div><label className="label">صيغة الإخراج</label><select className="field" value={format} onChange={(event) => setFormat(event.target.value)}><option value="image/jpeg">JPG — مناسب للصور</option><option value="image/png">PNG — يحافظ على الشفافية</option><option value="image/webp">WEBP — حجم أقل</option></select></div>
          <button type="button" onClick={processAll} disabled={busy || !files.length} className="btn-primary w-full disabled:opacity-45">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Stamp className="h-4 w-4" />}{busy ? `جارٍ التطبيق ${progress}%` : "تطبيق على جميع الصور"}</button>
          {busy && <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]"><div className="h-full bg-[var(--brand)] transition-all" style={{ width: `${progress}%` }} /></div>}
          {result && <button type="button" onClick={() => downloadBlob(result.zip, "afaq-watermarked-images.zip")} className="btn-secondary w-full"><Download className="h-4 w-4" /> تنزيل {result.count} صورة ({bytesLabel(result.zip.size)})</button>}
        </div>
      </aside>
      <section className="glass-panel rounded-[28px] p-5 sm:p-7">
        <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-[var(--line-strong)] p-5 text-center hover:bg-[color-mix(in_srgb,var(--brand)_5%,transparent)]"><UploadCloud className="h-8 w-8 text-[var(--brand)]" /><strong className="mt-3">اختر الصور</strong><span className="mt-2 text-xs text-[var(--faint)]">حتى 20 صورة، بحد 15 MB للصورة</span><input type="file" multiple accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { addFiles(event.target.files); event.currentTarget.value = ""; }} /></label>
        <div className="mt-5 flex items-center justify-between"><h2 className="font-bold"><Images className="ml-2 inline h-4 w-4 text-[var(--brand)]" />الصور ({files.length})</h2><span className="text-xs text-[var(--faint)]">{bytesLabel(totalSize)}</span></div>
        {result && <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--line)]"><div className="border-b border-[var(--line)] px-4 py-3 text-xs font-bold text-[var(--success)]">معاينة أول نتيجة</div><div className="bg-[repeating-conic-gradient(#d9e2e5_0_25%,#fff_0_50%)_0_0/20px_20px] p-4"><img src={result.preview} alt="معاينة الصورة بعد العلامة" className="mx-auto max-h-[330px] max-w-full rounded-xl object-contain shadow-xl" /></div></div>}
        <div className="mt-5 max-h-[430px] space-y-2 overflow-auto">
          {files.map((entry) => <div key={entry.id} className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3"><img src={entry.preview} alt="" className="h-12 w-12 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{entry.file.name}</p><p className="mt-1 text-[11px] text-[var(--faint)]">{bytesLabel(entry.file.size)}</p></div><button type="button" onClick={() => { URL.revokeObjectURL(entry.preview); setFiles((current) => current.filter((item) => item.id !== entry.id)); }} className="btn-ghost h-9 min-h-9 w-9 p-0 text-[var(--danger)]" aria-label="حذف"><Trash2 className="h-4 w-4" /></button></div>)}
          {!files.length && <div className="py-14 text-center text-[var(--faint)]"><Images className="mx-auto h-9 w-9 opacity-35" /><p className="mt-3 text-sm">الصور التي تختارها ستظهر هنا</p></div>}
        </div>
      </section>
      <RegistrationGate open={usage.gateOpen} onClose={usage.closeGate} />
    </div>
  );
}
