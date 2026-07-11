"use client";

import QRCode from "qrcode";
import { useMemo, useRef, useState } from "react";
import { Download, ImagePlus, LoaderCircle, Mail, MessageSquareText, Palette, Phone, QrCode, RotateCcw, Wifi } from "lucide-react";
import { toast } from "sonner";
import { RegistrationGate } from "@/components/usage/registration-gate";
import { useToolUsage } from "@/hooks/use-tool-usage";
import { downloadBlob } from "@/lib/utils";

type QrType = "url" | "text" | "phone" | "email" | "wifi";

const types: { id: QrType; label: string; icon: typeof QrCode }[] = [
  { id: "url", label: "رابط", icon: QrCode },
  { id: "text", label: "نص", icon: MessageSquareText },
  { id: "phone", label: "هاتف", icon: Phone },
  { id: "email", label: "بريد", icon: Mail },
  { id: "wifi", label: "Wi‑Fi", icon: Wifi },
];

function wifiEscape(value: string) {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

export function QrStudio() {
  const [type, setType] = useState<QrType>("url");
  const [value, setValue] = useState("https://x.com/aale1164?s=20");
  const [wifi, setWifi] = useState({ ssid: "", password: "", encryption: "WPA", hidden: false });
  const [foreground, setForeground] = useState("#07131e");
  const [background, setBackground] = useState("#ffffff");
  const [logo, setLogo] = useState<string | null>(null);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const usage = useToolUsage("qr-studio");

  const payload = useMemo(() => {
    const clean = value.trim();
    if (type === "phone") return `tel:${clean}`;
    if (type === "email") return `mailto:${clean}`;
    if (type === "wifi") return `WIFI:T:${wifi.encryption};S:${wifiEscape(wifi.ssid)};P:${wifiEscape(wifi.password)};H:${wifi.hidden ? "true" : "false"};;`;
    return clean;
  }, [type, value, wifi]);

  async function readLogo(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) return toast.error("اختر صورة شعار لا تتجاوز 2 MB.");
    const reader = new FileReader();
    reader.onload = () => setLogo(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function generate() {
    if (!payload || (type === "wifi" && !wifi.ssid.trim())) return toast.error("أدخل البيانات المطلوبة أولًا.");
    const token = await usage.begin();
    if (!token) return;
    setBusy(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("missing canvas");
      await QRCode.toCanvas(canvas, payload, {
        width: 860,
        margin: 3,
        errorCorrectionLevel: logo ? "H" : "M",
        color: { dark: foreground, light: background },
      });
      const rawSvg = await QRCode.toString(payload, {
        type: "svg",
        margin: 3,
        errorCorrectionLevel: logo ? "H" : "M",
        color: { dark: foreground, light: background },
      });
      if (logo) {
        const image = new Image();
        image.src = logo;
        await image.decode();
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const size = canvas.width * 0.18;
          const x = (canvas.width - size) / 2;
          const y = (canvas.height - size) / 2;
          ctx.fillStyle = background;
          ctx.beginPath();
          ctx.roundRect(x - 10, y - 10, size + 20, size + 20, 18);
          ctx.fill();
          ctx.drawImage(image, x, y, size, size);
        }
      }
      setPngUrl(canvas.toDataURL("image/png"));
      setSvg(rawSvg);
      await usage.complete(token);
      toast.success("تم إنشاء الرمز بنجاح.");
    } catch {
      toast.error("تعذر إنشاء QR. لم تُخصم العملية.");
    } finally {
      setBusy(false);
    }
  }

  function downloadPng() {
    if (!pngUrl) return;
    const anchor = document.createElement("a");
    anchor.href = pngUrl;
    anchor.download = "afaq-qr.png";
    anchor.click();
  }

  function downloadSvg() {
    if (!svg) return;
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "afaq-qr.svg");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_.86fr]">
      <section className="glass-panel rounded-[28px] p-5 sm:p-7">
        <div className="flex flex-wrap gap-2">
          {types.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setType(id)} className={`min-h-11 rounded-xl border px-3.5 text-sm font-bold transition ${type === id ? "border-[var(--brand)] bg-[color-mix(in_srgb,var(--brand)_11%,transparent)] text-[var(--brand)]" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)]"}`}>
              <Icon className="ml-2 inline h-4 w-4" />{label}
            </button>
          ))}
        </div>
        <div className="hairline my-6" />
        {type === "wifi" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="label">اسم الشبكة</label><input className="field" value={wifi.ssid} onChange={(event) => setWifi({ ...wifi, ssid: event.target.value })} placeholder="Network name" /></div>
            <div><label className="label">كلمة المرور</label><input className="field" value={wifi.password} onChange={(event) => setWifi({ ...wifi, password: event.target.value })} /></div>
            <div><label className="label">نوع الحماية</label><select className="field" value={wifi.encryption} onChange={(event) => setWifi({ ...wifi, encryption: event.target.value })}><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">بدون كلمة مرور</option></select></div>
            <label className="flex items-center gap-2 text-sm text-[var(--muted)]"><input type="checkbox" checked={wifi.hidden} onChange={(event) => setWifi({ ...wifi, hidden: event.target.checked })} className="accent-[var(--brand)]" /> الشبكة مخفية</label>
          </div>
        ) : (
          <div>
            <label className="label">{type === "url" ? "الرابط" : type === "phone" ? "رقم الهاتف" : type === "email" ? "البريد الإلكتروني" : "النص"}</label>
            {type === "text" ? <textarea className="field min-h-28 resize-y" value={value} onChange={(event) => setValue(event.target.value)} maxLength={1500} /> : <input className="field" value={value} onChange={(event) => setValue(event.target.value)} dir={type === "url" || type === "email" ? "ltr" : "auto"} />}
          </div>
        )}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="rounded-2xl border border-[var(--line)] p-4"><span className="label"><Palette className="ml-1 inline h-4 w-4" />لون الرمز</span><div className="flex items-center gap-3"><input type="color" value={foreground} onChange={(event) => setForeground(event.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border-0 bg-transparent" /><code className="text-xs text-[var(--muted)]" dir="ltr">{foreground}</code></div></label>
          <label className="rounded-2xl border border-[var(--line)] p-4"><span className="label"><Palette className="ml-1 inline h-4 w-4" />لون الخلفية</span><div className="flex items-center gap-3"><input type="color" value={background} onChange={(event) => setBackground(event.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border-0 bg-transparent" /><code className="text-xs text-[var(--muted)]" dir="ltr">{background}</code></div></label>
        </div>
        <div className="mt-4 rounded-2xl border border-dashed border-[var(--line-strong)] p-4">
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span><span className="block text-sm font-bold">شعار في المنتصف</span><span className="mt-1 block text-xs text-[var(--faint)]">اختياري — PNG أو JPG حتى 2 MB</span></span>
            <span className="btn-secondary min-h-10 text-xs"><ImagePlus className="h-4 w-4" /> اختر شعارًا</span>
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => readLogo(event.target.files?.[0])} />
          </label>
          {logo && <button type="button" onClick={() => setLogo(null)} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--danger)]"><RotateCcw className="h-3 w-3" /> إزالة الشعار</button>}
        </div>
        <button type="button" onClick={generate} disabled={busy} className="btn-primary mt-6 w-full disabled:opacity-60">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />} {busy ? "جارٍ الإنشاء..." : "إنشاء الرمز"}</button>
      </section>
      <section className="glass-panel flex min-h-[520px] flex-col rounded-[28px] p-5 sm:p-7">
        <div className="flex items-center justify-between"><h2 className="font-display font-bold">المعاينة</h2>{usage.remaining !== null && <span className="badge">المتبقي: {usage.remaining}</span>}</div>
        <div className="my-6 flex flex-1 items-center justify-center rounded-[22px] border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-3)_68%,transparent)] p-5">
          <canvas ref={canvasRef} className={`h-auto w-full max-w-[360px] rounded-xl shadow-2xl ${pngUrl ? "block" : "invisible absolute"}`} />
          {!pngUrl && <div className="text-center text-[var(--faint)]"><QrCode className="mx-auto h-16 w-16 opacity-30" /><p className="mt-4 text-sm">ستظهر النتيجة هنا</p></div>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={downloadPng} disabled={!pngUrl} className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"><Download className="h-4 w-4" /> PNG</button>
          <button type="button" onClick={downloadSvg} disabled={!svg} className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"><Download className="h-4 w-4" /> SVG</button>
        </div>
        {logo && svg && <p className="mt-3 text-center text-[11px] text-[var(--faint)]">ملف SVG يُصدّر الرمز دون الشعار لضمان توافقه؛ PNG يتضمن الشعار.</p>}
      </section>
      <RegistrationGate open={usage.gateOpen} onClose={usage.closeGate} />
    </div>
  );
}
