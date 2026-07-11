"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, ImagePlus, LoaderCircle, Palette, Settings2, Sparkles, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { RegistrationGate } from "@/components/usage/registration-gate";
import { useToolUsage } from "@/hooks/use-tool-usage";
import { canvasToBlob, validateImageFile } from "@/lib/client/image-processing";
import { downloadBlob } from "@/lib/utils";

export function BackgroundRemover({ configured }: { configured: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [comparison, setComparison] = useState(50);
  const [backgroundMode, setBackgroundMode] = useState<"transparent" | "color" | "image">("transparent");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resourcesRef = useRef<{ source: string | null; result: string | null; background: string | null }>({ source: null, result: null, background: null });
  const usage = useToolUsage("background-remover");

  useEffect(() => { resourcesRef.current = { source: sourceUrl, result: resultUrl, background: backgroundImageUrl }; }, [sourceUrl, resultUrl, backgroundImageUrl]);
  useEffect(() => () => {
    if (resourcesRef.current.source) URL.revokeObjectURL(resourcesRef.current.source);
    if (resourcesRef.current.result) URL.revokeObjectURL(resourcesRef.current.result);
    if (resourcesRef.current.background) URL.revokeObjectURL(resourcesRef.current.background);
  }, []);

  function chooseFile(selected?: File) {
    if (!selected) return;
    const error = validateImageFile(selected, 10 * 1024 * 1024);
    if (error) return toast.error(error);
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(selected);
    setSourceUrl(URL.createObjectURL(selected));
    setResultBlob(null);
    setResultUrl(null);
  }

  function chooseBackground(selected?: File) {
    if (!selected) return;
    const error = validateImageFile(selected, 10 * 1024 * 1024);
    if (error) return toast.error(error);
    if (backgroundImageUrl) URL.revokeObjectURL(backgroundImageUrl);
    setBackgroundImage(selected);
    setBackgroundImageUrl(URL.createObjectURL(selected));
  }

  async function removeBackground() {
    if (!configured) return toast.error("أكمل إعداد مزود الإزالة في الخادم أولًا.");
    if (!file) return toast.error("اختر الصورة أولًا.");
    const permit = await usage.begin();
    if (!permit) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("permit", permit);
      const response = await fetch("/api/tools/background-remove", { method: "POST", body: form });
      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(error?.message || "تعذرت إزالة الخلفية.");
      }
      const blob = await response.blob();
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
      toast.success("تمت إزالة الخلفية بنجاح.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذرت الإزالة. لم تُخصم العملية.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadResult() {
    if (!resultBlob || !resultUrl) return;
    if (backgroundMode === "transparent") return downloadBlob(resultBlob, "afaq-background-removed.png");
    try {
      const foreground = new Image(); foreground.src = resultUrl; await foreground.decode();
      const canvas = document.createElement("canvas");
      canvas.width = foreground.naturalWidth; canvas.height = foreground.naturalHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("canvas");
      if (backgroundMode === "color") { context.fillStyle = backgroundColor; context.fillRect(0, 0, canvas.width, canvas.height); }
      if (backgroundMode === "image" && backgroundImage) {
        const image = new Image(); image.src = URL.createObjectURL(backgroundImage); await image.decode();
        const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
        const width = image.naturalWidth * scale; const height = image.naturalHeight * scale;
        context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
        URL.revokeObjectURL(image.src);
      }
      context.drawImage(foreground, 0, 0);
      const blob = await canvasToBlob(canvas, "image/jpeg", 0.94);
      downloadBlob(blob, "afaq-new-background.jpg");
    } catch {
      toast.error("تعذر تركيب الخلفية المختارة.");
    }
  }

  if (!configured) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_.9fr]">
        <div className="glass-panel rounded-[28px] p-7 sm:p-10">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--warning)_10%,var(--surface-3))] text-[var(--warning)]"><Settings2 className="h-6 w-6" /></span>
          <h2 className="font-display mt-6 text-2xl font-bold">الأداة حقيقية، لكن المزود غير مربوط</h2>
          <p className="mt-4 leading-8 text-[var(--muted)]">إزالة الخلفية تحتاج معالجة متخصصة. جهزنا Adapter آمنًا لمزود remove.bg؛ يبقى مفتاح المزود في الخادم ولا يصل إلى المتصفح.</p>
          <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface-3)] p-5 font-mono text-sm" dir="ltr">REMOVE_BG_API_KEY=your_key_here</div>
          <p className="mt-4 text-xs leading-6 text-[var(--faint)]">بعد وضع المفتاح في <code>.env.local</code> وإعادة التشغيل ستعمل الواجهة نفسها دون تعديل الكود.</p>
        </div>
        <div className="rounded-[28px] border border-dashed border-[var(--line-strong)] p-8 text-center opacity-65"><AlertTriangle className="mx-auto h-10 w-10 text-[var(--warning)]" /><h3 className="mt-5 font-bold">التشغيل متوقف حتى الإعداد</h3><p className="mt-3 text-sm leading-7 text-[var(--muted)]">لم نضع زرًا يعطي نتيجة وهمية أو يرفع الصورة إلى جهة غير معلنة.</p></div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr]">
      <aside className="glass-panel h-fit rounded-[28px] p-5 sm:p-6">
        <h2 className="font-display font-bold">الصورة والإخراج</h2>
        <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 flex min-h-[140px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--line-strong)] hover:bg-[color-mix(in_srgb,var(--brand)_5%,transparent)]"><UploadCloud className="h-8 w-8 text-[var(--brand)]" /><strong className="mt-3 text-sm">اختر صورة</strong><small className="mt-2 text-[var(--faint)]">PNG، JPG، WEBP — حتى 10 MB</small></button>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])} />
        {file && <div className="mt-3 truncate text-xs text-[var(--muted)]">{file.name}</div>}
        <button type="button" onClick={removeBackground} disabled={busy || !file} className="btn-primary mt-5 w-full disabled:opacity-45">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{busy ? "جارٍ الإزالة..." : "إزالة الخلفية"}</button>
        {resultUrl && <><div className="hairline my-6" /><label className="label">الخلفية الجديدة</label><div className="grid grid-cols-3 gap-2">{[["transparent", "شفافة"], ["color", "لون"], ["image", "صورة"]].map(([id, label]) => <button key={id} type="button" onClick={() => setBackgroundMode(id as typeof backgroundMode)} className={`min-h-10 rounded-xl border text-xs font-bold ${backgroundMode === id ? "border-[var(--brand)] text-[var(--brand)]" : "border-[var(--line)] text-[var(--muted)]"}`}>{label}</button>)}</div>{backgroundMode === "color" && <label className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--line)] p-3"><Palette className="h-4 w-4 text-[var(--brand)]" /><input type="color" value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)} className="h-9 w-14 bg-transparent" /><span className="text-xs text-[var(--muted)]">{backgroundColor}</span></label>}{backgroundMode === "image" && <label className="btn-secondary mt-4 w-full cursor-pointer text-xs"><ImagePlus className="h-4 w-4" /> اختيار صورة خلفية<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => chooseBackground(event.target.files?.[0])} /></label>}<button type="button" onClick={downloadResult} className="btn-secondary mt-4 w-full"><Download className="h-4 w-4" /> تنزيل النتيجة</button></>}
      </aside>
      <section className="glass-panel min-h-[560px] rounded-[28px] p-5 sm:p-7">
        <div className="flex items-center justify-between"><h2 className="font-display font-bold">قبل وبعد</h2>{resultUrl && <span className="badge text-[var(--success)]"><CheckCircle2 className="h-3 w-3" /> اكتملت</span>}</div>
        <div className="mt-5 flex min-h-[450px] items-center justify-center overflow-hidden rounded-[22px] border border-[var(--line)] bg-[repeating-conic-gradient(#d9e2e5_0_25%,#fff_0_50%)_0_0/22px_22px]">
          {sourceUrl ? <div className="relative max-h-[520px] w-full overflow-hidden" style={{ aspectRatio: "4 / 3" }}><img src={sourceUrl} alt="الصورة الأصلية" className="absolute inset-0 h-full w-full object-contain" />{resultUrl && <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${comparison}%` }}><div className="absolute inset-y-0 left-0" style={{ width: `${10000 / comparison}%` }}><div className="relative h-full w-full" style={backgroundMode === "color" ? { background: backgroundColor } : backgroundMode === "image" && backgroundImageUrl ? { backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}><img src={resultUrl} alt="بعد إزالة الخلفية" className="absolute inset-0 h-full w-full object-contain" /></div></div></div>}{resultUrl && <div className="absolute inset-y-0 w-0.5 bg-white shadow-xl" style={{ left: `${comparison}%` }}><span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-800 shadow-xl">↔</span></div>}</div> : <div className="text-center text-slate-500"><ImagePlus className="mx-auto h-14 w-14 opacity-30" /><p className="mt-4 text-sm">اختر صورة لبدء المعاينة</p></div>}
        </div>
        {resultUrl && <div className="mt-5"><div className="flex justify-between text-xs text-[var(--faint)]"><span>بعد</span><span>قبل</span></div><input type="range" min={5} max={95} value={comparison} onChange={(event) => setComparison(Number(event.target.value))} className="range-accent mt-2 w-full" /></div>}
      </section>
      <RegistrationGate open={usage.gateOpen} onClose={usage.closeGate} />
    </div>
  );
}
