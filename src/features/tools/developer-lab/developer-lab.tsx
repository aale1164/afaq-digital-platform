"use client";

import { useMemo, useState } from "react";
import { Braces, Check, Clock3, Code2, Copy, Fingerprint, Hash, KeyRound, Link2, LoaderCircle, Play, Regex, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { RegistrationGate } from "@/components/usage/registration-gate";
import { useToolUsage } from "@/hooks/use-tool-usage";

type LabTool = "json" | "base64" | "uuid" | "hash" | "url" | "timestamp" | "jwt" | "regex";

const labTools: { id: LabTool; label: string; icon: typeof Code2 }[] = [
  { id: "json", label: "JSON", icon: Braces },
  { id: "base64", label: "Base64", icon: Code2 },
  { id: "uuid", label: "UUID", icon: Fingerprint },
  { id: "hash", label: "Hash", icon: Hash },
  { id: "url", label: "URL", icon: Link2 },
  { id: "timestamp", label: "Timestamp", icon: Clock3 },
  { id: "jwt", label: "JWT", icon: KeyRound },
  { id: "regex", label: "Regex", icon: Regex },
];

const startupTimestamp = String(Math.floor(Date.now() / 1000));

function utf8ToBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function base64ToUtf8(value: string) {
  const binary = atob(value.replace(/\s+/g, ""));
  return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
}

function decodeJwtPart(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return JSON.parse(base64ToUtf8(normalized));
}

function looksUnsafeRegex(pattern: string) {
  return pattern.length > 120 || /(\([^)]*[+*][^)]*\))[+*{]/.test(pattern) || /(\.\*){2,}/.test(pattern);
}

export function DeveloperLab() {
  const [tool, setTool] = useState<LabTool>("json");
  const [input, setInput] = useState('{"name":"آفاق","ready":true}');
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("encode");
  const [algorithm, setAlgorithm] = useState("SHA-256");
  const [uuidCount, setUuidCount] = useState(5);
  const [pattern, setPattern] = useState("آفاق");
  const [flags, setFlags] = useState("gu");
  const [busy, setBusy] = useState(false);
  const usage = useToolUsage("developer-lab");

  const helper = useMemo(() => ({
    json: "تنسيق JSON والتحقق من سلامة بنيته.",
    base64: "ترميز وفك نصوص Unicode العربية بصورة صحيحة.",
    uuid: "إنشاء UUID v4 باستخدام مولد المتصفح الآمن.",
    hash: "إنشاء بصمة أحادية الاتجاه عبر Web Crypto.",
    url: "ترميز وفك مكونات الروابط.",
    timestamp: "التحويل بين Unix والوقت المحلي وISO.",
    jwt: "عرض Header وPayload فقط — لا يتحقق من التوقيع.",
    regex: "اختبار تعبير نمطي بقيود تقلل الأنماط الخطرة.",
  })[tool], [tool]);

  function switchTool(next: LabTool) {
    setTool(next);
    setOutput("");
    if (next === "timestamp") setInput(startupTimestamp);
    else if (next === "uuid") setInput("");
    else if (next === "regex") setInput("مرحبًا من منصة آفاق الرقمية. آفاق جديدة تبدأ هنا.");
  }

  async function execute() {
    setBusy(true);
    let result = "";
    try {
      if (tool === "json") result = JSON.stringify(JSON.parse(input), null, 2);
      if (tool === "base64") result = mode === "encode" ? utf8ToBase64(input) : base64ToUtf8(input);
      if (tool === "uuid") result = Array.from({ length: Math.min(50, Math.max(1, uuidCount)) }, () => crypto.randomUUID()).join("\n");
      if (tool === "hash") {
        const digest = await crypto.subtle.digest(algorithm, new TextEncoder().encode(input));
        result = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
      }
      if (tool === "url") result = mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input);
      if (tool === "timestamp") {
        const numeric = Number(input.trim());
        const date = Number.isFinite(numeric) ? new Date(input.trim().length <= 10 ? numeric * 1000 : numeric) : new Date(input);
        if (Number.isNaN(date.getTime())) throw new Error("invalid-date");
        result = JSON.stringify({ unix_seconds: Math.floor(date.getTime() / 1000), unix_milliseconds: date.getTime(), iso: date.toISOString(), local_ar_sa: date.toLocaleString("ar-SA"), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }, null, 2);
      }
      if (tool === "jwt") {
        const parts = input.trim().split(".");
        if (parts.length !== 3) throw new Error("jwt-parts");
        result = JSON.stringify({ warning: "عرض فقط — لم يتم التحقق من التوقيع", header: decodeJwtPart(parts[0]), payload: decodeJwtPart(parts[1]), signature_present: Boolean(parts[2]) }, null, 2);
      }
      if (tool === "regex") {
        if (looksUnsafeRegex(pattern)) throw new Error("unsafe-regex");
        if (input.length > 5000) throw new Error("large-input");
        if (!/^[dgimsuvy]*$/.test(flags) || new Set(flags).size !== flags.length) throw new Error("flags");
        const regex = new RegExp(pattern, flags);
        const matches = Array.from(input.matchAll(regex.global ? regex : new RegExp(regex.source, `${regex.flags}g`))).slice(0, 200);
        result = JSON.stringify({ count: matches.length, truncated: matches.length === 200, matches: matches.map((match) => ({ value: match[0], index: match.index, groups: match.groups ?? null })) }, null, 2);
      }
      const token = await usage.begin();
      if (!token) return;
      setOutput(result);
      await usage.complete(token);
      toast.success("تم تنفيذ العملية.");
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      const message = code === "unsafe-regex" ? "النمط قد يستهلك وقتًا طويلًا؛ بسّطه ثم أعد المحاولة." : code === "large-input" ? "نص اختبار Regex لا يتجاوز 5000 حرف." : tool === "json" ? "JSON غير صالح. راجع الفواصل والأقواس وعلامات الاقتباس." : tool === "jwt" ? "رمز JWT غير صالح أو لا يتكون من ثلاثة أجزاء." : "تعذر تنفيذ العملية. تحقق من المدخلات.";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast.success("تم النسخ.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
      <aside className="glass-panel rounded-[24px] p-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
          {labTools.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => switchTool(id)} className={`flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-bold transition ${tool === id ? "bg-[color-mix(in_srgb,var(--brand)_11%,var(--surface-3))] text-[var(--brand)]" : "text-[var(--muted)] hover:bg-[var(--surface-3)] hover:text-[var(--ink)]"}`}><Icon className="h-4 w-4" />{label}</button>
          ))}
        </div>
      </aside>
      <section className="glass-panel rounded-[28px] p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div><h2 className="font-display text-xl font-bold">{labTools.find((item) => item.id === tool)?.label}</h2><p className="mt-2 text-sm leading-7 text-[var(--muted)]">{helper}</p></div>
          {usage.remaining !== null && <span className="badge shrink-0"><Check className="h-3 w-3 text-[var(--success)]" /> المتبقي {usage.remaining}</span>}
        </div>
        {tool === "jwt" && <div className="mt-5 rounded-xl border border-[color-mix(in_srgb,var(--warning)_35%,transparent)] bg-[color-mix(in_srgb,var(--warning)_8%,transparent)] p-3 text-xs leading-6 text-[var(--warning)]">تحذير: فك JWT لا يثبت صحة التوقيع أو موثوقية محتواه. لا تلصق رموزًا حقيقية حساسة في أجهزة مشتركة.</div>}
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <div>
            <div className="mb-3 flex min-h-10 flex-wrap items-center gap-2">
              {(tool === "base64" || tool === "url") && <><button type="button" onClick={() => setMode("encode")} className={mode === "encode" ? "btn-primary min-h-9 text-xs" : "btn-secondary min-h-9 text-xs"}>ترميز</button><button type="button" onClick={() => setMode("decode")} className={mode === "decode" ? "btn-primary min-h-9 text-xs" : "btn-secondary min-h-9 text-xs"}>فك الترميز</button></>}
              {tool === "hash" && <select className="field min-h-10 w-auto py-1.5 text-xs" value={algorithm} onChange={(event) => setAlgorithm(event.target.value)}><option>SHA-256</option><option>SHA-384</option><option>SHA-512</option><option>SHA-1</option></select>}
              {tool === "uuid" && <label className="flex items-center gap-2 text-xs text-[var(--muted)]">العدد <input type="number" min={1} max={50} value={uuidCount} onChange={(event) => setUuidCount(Number(event.target.value))} className="field min-h-10 w-20 py-1.5" /></label>}
              {tool === "regex" && <><input className="field min-h-10 flex-1 py-1.5 font-mono text-xs" value={pattern} onChange={(event) => setPattern(event.target.value)} placeholder="النمط" dir="ltr" /><input className="field min-h-10 w-20 py-1.5 font-mono text-xs" value={flags} onChange={(event) => setFlags(event.target.value)} placeholder="flags" dir="ltr" /></>}
            </div>
            <label className="label" htmlFor="lab-input">المدخل</label>
            <textarea id="lab-input" className="field min-h-[290px] resize-y font-mono text-sm leading-7" value={input} onChange={(event) => setInput(event.target.value)} placeholder={tool === "uuid" ? "لا يحتاج مدخلًا" : "ضع البيانات هنا..."} dir="auto" disabled={tool === "uuid"} spellCheck={false} />
            <div className="mt-3 flex gap-2"><button type="button" onClick={execute} disabled={busy} className="btn-primary flex-1 disabled:opacity-60">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}{busy ? "جارٍ التنفيذ..." : "تنفيذ"}</button><button type="button" onClick={() => { setInput(""); setOutput(""); }} className="btn-secondary" aria-label="مسح"><RotateCcw className="h-4 w-4" /></button></div>
          </div>
          <div>
            <div className="mb-3 flex min-h-10 items-center justify-between"><span className="label mb-0">النتيجة</span><button type="button" onClick={copyOutput} disabled={!output} className="btn-ghost min-h-9 px-2 text-xs disabled:opacity-40"><Copy className="h-3.5 w-3.5" /> نسخ</button></div>
            <pre className="field min-h-[290px] overflow-auto whitespace-pre-wrap break-all font-mono text-sm leading-7" dir="ltr">{output || <span className="text-[var(--faint)]">ستظهر النتيجة هنا...</span>}</pre>
          </div>
        </div>
      </section>
      <RegistrationGate open={usage.gateOpen} onClose={usage.closeGate} />
    </div>
  );
}
