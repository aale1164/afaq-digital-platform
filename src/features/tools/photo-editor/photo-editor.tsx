"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BringToFront, Crop, Download, ImagePlus, Layers3, LoaderCircle, RotateCcw, SendToBack, Trash2, Type, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { RegistrationGate } from "@/components/usage/registration-gate";
import { useToolUsage } from "@/hooks/use-tool-usage";
import { canvasToBlob, validateImageFile } from "@/lib/client/image-processing";
import { downloadBlob } from "@/lib/utils";

type BaseElement = { id: string; x: number; y: number; rotation: number; scale: number };
type TextElement = BaseElement & { type: "text"; text: string; color: string; fontSize: number; fontFamily: string; bold: boolean };
type ImageElement = BaseElement & { type: "image"; src: string; width: number; height: number };
type EditorElement = TextElement | ImageElement;
type Point = { x: number; y: number };
type CropRect = { x: number; y: number; width: number; height: number };

const initialSize = { width: 1000, height: 700 };

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadHtmlImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export function PhotoEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCache = useRef(new Map<string, HTMLImageElement>());
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const cropStartRef = useRef<Point | null>(null);
  const [canvasSize, setCanvasSize] = useState(initialSize);
  const [background, setBackground] = useState<string | null>(null);
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [text, setText] = useState("آفاق جديدة تبدأ هنا");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(58);
  const [fontFamily, setFontFamily] = useState("IBM Plex Sans Arabic");
  const [bold, setBold] = useState(true);
  const [cropMode, setCropMode] = useState(false);
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [renderTick, setRenderTick] = useState(0);
  const [exportType, setExportType] = useState("image/png");
  const [busy, setBusy] = useState(false);
  const usage = useToolUsage("photo-editor");

  const selected = useMemo(() => elements.find((element) => element.id === selectedId) ?? null, [elements, selectedId]);

  const getImage = useCallback((src: string) => {
    const cached = imageCache.current.get(src);
    if (cached) return cached;
    const image = new Image();
    image.onload = () => setRenderTick((value) => value + 1);
    image.src = src;
    imageCache.current.set(src, image);
    return image;
  }, []);

  const elementDimensions = useCallback((element: EditorElement, context: CanvasRenderingContext2D) => {
    if (element.type === "image") return { width: element.width, height: element.height };
    context.font = `${element.bold ? 700 : 400} ${element.fontSize}px "${element.fontFamily}"`;
    const metrics = context.measureText(element.text || " ");
    return { width: Math.max(20, metrics.width + 20), height: element.fontSize * 1.4 };
  }, []);

  const drawScene = useCallback((context: CanvasRenderingContext2D, showSelection = true) => {
    context.clearRect(0, 0, canvasSize.width, canvasSize.height);
    context.fillStyle = "#0a1722";
    context.fillRect(0, 0, canvasSize.width, canvasSize.height);
    if (background) {
      const image = getImage(background);
      if (image.complete && image.naturalWidth) context.drawImage(image, 0, 0, canvasSize.width, canvasSize.height);
    } else {
      context.strokeStyle = "rgba(140,180,195,.12)";
      context.lineWidth = 1;
      const step = Math.max(35, Math.round(canvasSize.width / 20));
      for (let x = 0; x <= canvasSize.width; x += step) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, canvasSize.height); context.stroke(); }
      for (let y = 0; y <= canvasSize.height; y += step) { context.beginPath(); context.moveTo(0, y); context.lineTo(canvasSize.width, y); context.stroke(); }
    }

    for (const element of elements) {
      const dimensions = elementDimensions(element, context);
      context.save();
      context.translate(element.x, element.y);
      context.rotate((element.rotation * Math.PI) / 180);
      context.scale(element.scale, element.scale);
      if (element.type === "text") {
        context.direction = "rtl";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = `${element.bold ? 700 : 400} ${element.fontSize}px "${element.fontFamily}"`;
        context.fillStyle = element.color;
        context.shadowColor = "rgba(0,0,0,.32)";
        context.shadowBlur = Math.max(2, element.fontSize * 0.06);
        context.fillText(element.text, 0, 0);
      } else {
        const image = getImage(element.src);
        if (image.complete && image.naturalWidth) context.drawImage(image, -element.width / 2, -element.height / 2, element.width, element.height);
      }
      if (showSelection && element.id === selectedId) {
        context.shadowColor = "transparent";
        context.strokeStyle = "#42e8c6";
        context.lineWidth = Math.max(1.5, 2 / element.scale);
        context.setLineDash([8 / element.scale, 6 / element.scale]);
        context.strokeRect(-dimensions.width / 2, -dimensions.height / 2, dimensions.width, dimensions.height);
        context.setLineDash([]);
        context.fillStyle = "#42e8c6";
        for (const [x, y] of [[-dimensions.width / 2, -dimensions.height / 2], [dimensions.width / 2, -dimensions.height / 2], [-dimensions.width / 2, dimensions.height / 2], [dimensions.width / 2, dimensions.height / 2]]) {
          context.beginPath(); context.arc(x, y, 6 / element.scale, 0, Math.PI * 2); context.fill();
        }
      }
      context.restore();
    }

    if (showSelection && cropMode && cropRect) {
      context.save();
      context.fillStyle = "rgba(0,0,0,.55)";
      context.beginPath();
      context.rect(0, 0, canvasSize.width, canvasSize.height);
      context.rect(cropRect.x, cropRect.y, cropRect.width, cropRect.height);
      context.fill("evenodd");
      context.strokeStyle = "#efc77c";
      context.lineWidth = 3;
      context.setLineDash([12, 8]);
      context.strokeRect(cropRect.x, cropRect.y, cropRect.width, cropRect.height);
      context.restore();
    }
  }, [background, canvasSize, cropMode, cropRect, elementDimensions, elements, getImage, selectedId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    drawScene(context, true);
  }, [drawScene, renderTick]);

  function canvasPoint(event: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * canvasSize.width, y: ((event.clientY - rect.top) / rect.height) * canvasSize.height };
  }

  function hitTest(point: Point) {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return null;
    for (let index = elements.length - 1; index >= 0; index -= 1) {
      const element = elements[index];
      const angle = (-element.rotation * Math.PI) / 180;
      const dx = point.x - element.x;
      const dy = point.y - element.y;
      const localX = (dx * Math.cos(angle) - dy * Math.sin(angle)) / element.scale;
      const localY = (dx * Math.sin(angle) + dy * Math.cos(angle)) / element.scale;
      const dimensions = elementDimensions(element, context);
      if (Math.abs(localX) <= dimensions.width / 2 && Math.abs(localY) <= dimensions.height / 2) return element;
    }
    return null;
  }

  function pointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = canvasPoint(event);
    if (cropMode) {
      cropStartRef.current = point;
      setCropRect({ x: point.x, y: point.y, width: 0, height: 0 });
      return;
    }
    const element = hitTest(point);
    setSelectedId(element?.id ?? null);
    if (element) dragRef.current = { id: element.id, offsetX: point.x - element.x, offsetY: point.y - element.y };
  }

  function pointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const point = canvasPoint(event);
    if (cropMode && cropStartRef.current) {
      const start = cropStartRef.current;
      setCropRect({ x: Math.min(start.x, point.x), y: Math.min(start.y, point.y), width: Math.abs(point.x - start.x), height: Math.abs(point.y - start.y) });
      return;
    }
    if (dragRef.current) {
      const drag = dragRef.current;
      setElements((current) => current.map((element) => element.id === drag.id ? { ...element, x: Math.max(0, Math.min(canvasSize.width, point.x - drag.offsetX)), y: Math.max(0, Math.min(canvasSize.height, point.y - drag.offsetY)) } : element));
    }
  }

  function pointerUp() {
    dragRef.current = null;
    cropStartRef.current = null;
  }

  async function setBackgroundFromFile(file?: File) {
    if (!file) return;
    const error = validateImageFile(file, 20 * 1024 * 1024);
    if (error) return toast.error(error);
    try {
      const src = await fileToDataUrl(file);
      const image = await loadHtmlImage(src);
      const ratio = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
      setCanvasSize({ width: Math.max(300, Math.round(image.naturalWidth * ratio)), height: Math.max(240, Math.round(image.naturalHeight * ratio)) });
      imageCache.current.set(src, image);
      setBackground(src);
      setElements([]);
      setSelectedId(null);
      setCropRect(null);
      toast.success("تم فتح الصورة.");
    } catch {
      toast.error("تعذر قراءة الصورة.");
    }
  }

  function addText() {
    if (!text.trim()) return toast.error("اكتب النص أولًا.");
    const element: TextElement = { id: crypto.randomUUID(), type: "text", text: text.trim(), x: canvasSize.width / 2, y: canvasSize.height / 2, rotation: 0, scale: 1, color: textColor, fontSize, fontFamily, bold };
    setElements((current) => [...current, element]);
    setSelectedId(element.id);
  }

  async function addOverlayImage(file?: File) {
    if (!file) return;
    const error = validateImageFile(file, 10 * 1024 * 1024);
    if (error) return toast.error(error);
    try {
      const src = await fileToDataUrl(file);
      const image = await loadHtmlImage(src);
      imageCache.current.set(src, image);
      const ratio = Math.min(1, (canvasSize.width * 0.36) / image.naturalWidth, (canvasSize.height * 0.36) / image.naturalHeight);
      const element: ImageElement = { id: crypto.randomUUID(), type: "image", src, width: image.naturalWidth * ratio, height: image.naturalHeight * ratio, x: canvasSize.width / 2, y: canvasSize.height / 2, rotation: 0, scale: 1 };
      setElements((current) => [...current, element]);
      setSelectedId(element.id);
    } catch {
      toast.error("تعذر إضافة الصورة.");
    }
  }

  function updateSelected(patch: Partial<EditorElement>) {
    if (!selectedId) return;
    setElements((current) => current.map((element) => element.id === selectedId ? { ...element, ...patch } as EditorElement : element));
  }

  function reorder(direction: "front" | "back") {
    if (!selectedId) return;
    setElements((current) => {
      const selectedElement = current.find((element) => element.id === selectedId);
      if (!selectedElement) return current;
      const rest = current.filter((element) => element.id !== selectedId);
      return direction === "front" ? [...rest, selectedElement] : [selectedElement, ...rest];
    });
  }

  function applyCrop() {
    if (!cropRect || cropRect.width < 30 || cropRect.height < 30) return toast.error("حدد مساحة قص أكبر.");
    const source = document.createElement("canvas");
    source.width = canvasSize.width;
    source.height = canvasSize.height;
    const sourceContext = source.getContext("2d");
    if (!sourceContext) return;
    drawScene(sourceContext, false);
    const target = document.createElement("canvas");
    target.width = Math.round(cropRect.width);
    target.height = Math.round(cropRect.height);
    target.getContext("2d")?.drawImage(source, cropRect.x, cropRect.y, cropRect.width, cropRect.height, 0, 0, target.width, target.height);
    const src = target.toDataURL("image/png");
    const image = new Image(); image.src = src; imageCache.current.set(src, image);
    setBackground(src);
    setCanvasSize({ width: target.width, height: target.height });
    setElements([]);
    setSelectedId(null);
    setCropRect(null);
    setCropMode(false);
    toast.success("تم تطبيق القص.");
  }

  async function exportImage() {
    const token = await usage.begin();
    if (!token) return;
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("canvas");
      drawScene(context, false);
      const blob = await canvasToBlob(canvas, exportType, exportType === "image/jpeg" ? 0.92 : undefined);
      downloadBlob(blob, `afaq-design.${exportType === "image/png" ? "png" : "jpg"}`);
      await usage.complete(token);
      toast.success("تم تصدير التصميم.");
    } catch {
      toast.error("تعذر التصدير. لم تُخصم العملية.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setCanvasSize(initialSize); setBackground(null); setElements([]); setSelectedId(null); setCropRect(null); setCropMode(false);
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel flex flex-wrap items-center gap-2 rounded-[22px] p-3">
        <label className="btn-primary cursor-pointer text-sm"><UploadCloud className="h-4 w-4" /> فتح صورة<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { setBackgroundFromFile(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>
        <label className="btn-secondary cursor-pointer text-sm"><ImagePlus className="h-4 w-4" /> إضافة صورة<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { addOverlayImage(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>
        <button type="button" onClick={() => { setCropMode((value) => !value); setSelectedId(null); setCropRect(null); }} className={cropMode ? "btn-primary text-sm" : "btn-secondary text-sm"}><Crop className="h-4 w-4" /> قص تفاعلي</button>
        {cropMode && <button type="button" onClick={applyCrop} className="btn-secondary text-sm text-[var(--gold)]">تطبيق القص</button>}
        <div className="mx-1 hidden h-8 w-px bg-[var(--line)] sm:block" />
        <button type="button" onClick={reset} className="btn-ghost text-sm"><RotateCcw className="h-4 w-4" /> جديد</button>
        <div className="mr-auto flex items-center gap-2">
          <select value={exportType} onChange={(event) => setExportType(event.target.value)} className="field min-h-10 w-auto py-1.5 text-xs"><option value="image/png">PNG</option><option value="image/jpeg">JPG</option></select>
          <button type="button" onClick={exportImage} disabled={busy} className="btn-primary text-sm disabled:opacity-60">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} تصدير</button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[285px_1fr]">
        <aside className="glass-panel h-fit rounded-[24px] p-5">
          <div className="flex items-center gap-2"><Type className="h-4 w-4 text-[var(--brand)]" /><h2 className="font-display text-sm font-bold">النص العربي</h2></div>
          <div className="mt-4 space-y-4">
            <textarea value={text} onChange={(event) => setText(event.target.value)} className="field min-h-24 resize-y" maxLength={160} />
            <div className="grid grid-cols-[1fr_68px] gap-2"><select className="field" value={fontFamily} onChange={(event) => setFontFamily(event.target.value)}><option value="IBM Plex Sans Arabic">IBM Plex Arabic</option><option value="Noto Kufi Arabic">Noto Kufi</option><option value="Tahoma">Tahoma</option><option value="Arial">Arial</option></select><input type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} className="field h-12 cursor-pointer p-2" aria-label="لون النص" /></div>
            <div><div className="flex justify-between"><label className="label">حجم الخط</label><span className="text-xs text-[var(--brand)]">{fontSize}px</span></div><input type="range" min={18} max={180} value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} className="range-accent w-full" /></div>
            <label className="flex items-center gap-2 text-sm text-[var(--muted)]"><input type="checkbox" checked={bold} onChange={(event) => setBold(event.target.checked)} className="accent-[var(--brand)]" /> خط عريض</label>
            <button type="button" onClick={addText} className="btn-primary w-full"><Type className="h-4 w-4" /> إضافة النص</button>
          </div>
          <div className="hairline my-6" />
          <div className="flex items-center gap-2"><Layers3 className="h-4 w-4 text-[var(--brand)]" /><h2 className="font-display text-sm font-bold">العنصر المحدد</h2></div>
          {selected ? <div className="mt-4 space-y-4"><div><div className="flex justify-between"><label className="label">الحجم</label><span className="text-xs text-[var(--brand)]">{Math.round(selected.scale * 100)}%</span></div><input type="range" min={20} max={300} value={selected.scale * 100} onChange={(event) => updateSelected({ scale: Number(event.target.value) / 100 })} className="range-accent w-full" /></div><div><div className="flex justify-between"><label className="label">الدوران</label><span className="text-xs text-[var(--brand)]">{selected.rotation}°</span></div><input type="range" min={-180} max={180} value={selected.rotation} onChange={(event) => updateSelected({ rotation: Number(event.target.value) })} className="range-accent w-full" /></div><div className="grid grid-cols-3 gap-2"><button type="button" onClick={() => reorder("front")} className="btn-secondary min-h-10 p-0" title="إلى الأمام"><BringToFront className="h-4 w-4" /></button><button type="button" onClick={() => reorder("back")} className="btn-secondary min-h-10 p-0" title="إلى الخلف"><SendToBack className="h-4 w-4" /></button><button type="button" onClick={() => { setElements((current) => current.filter((element) => element.id !== selectedId)); setSelectedId(null); }} className="btn-danger min-h-10 p-0" title="حذف"><Trash2 className="h-4 w-4" /></button></div><p className="text-[11px] leading-5 text-[var(--faint)]">اسحب العنصر على اللوحة، واستخدم التحكم للحجم والدوران.</p></div> : <p className="mt-4 text-xs leading-6 text-[var(--faint)]">اضغط عنصرًا داخل اللوحة لتعديله.</p>}
        </aside>
        <section className="glass-panel overflow-hidden rounded-[26px] p-3 sm:p-5">
          <div className="mb-3 flex items-center justify-between px-1 text-xs text-[var(--faint)]"><span>{canvasSize.width} × {canvasSize.height} px</span>{cropMode ? <span className="text-[var(--gold)]">اسحب على الصورة لتحديد منطقة القص</span> : <span>اسحب العناصر لتغيير موضعها</span>}</div>
          <div className="flex min-h-[360px] items-center justify-center overflow-auto rounded-[18px] border border-[var(--line)] bg-[repeating-conic-gradient(#132431_0_25%,#0d1c28_0_50%)_0_0/22px_22px] p-2 sm:min-h-[560px]">
            <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} className="h-auto max-h-[72vh] w-full max-w-full touch-none rounded-lg object-contain shadow-2xl" style={{ aspectRatio: `${canvasSize.width}/${canvasSize.height}` }} />
          </div>
          {!background && elements.length === 0 && <p className="mt-3 text-center text-xs text-[var(--faint)]">ابدأ بفتح صورة، أو صمّم على اللوحة الفارغة.</p>}
        </section>
      </div>
      {usage.remaining !== null && <p className="text-center text-xs text-[var(--faint)]">العمليات المتبقية: {usage.remaining} — لا تُحسب إلا عند نجاح التصدير.</p>}
      <RegistrationGate open={usage.gateOpen} onClose={usage.closeGate} />
    </div>
  );
}
