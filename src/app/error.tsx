"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("AFAQ route error", { digest: error.digest }); }, [error]);
  return <div className="container-shell flex min-h-[62vh] items-center justify-center py-16"><div className="max-w-lg text-center"><AlertTriangle className="mx-auto h-14 w-14 text-[var(--warning)]" /><h1 className="font-display mt-6 text-2xl font-bold">حدث خطأ غير متوقع</h1><p className="mt-4 leading-8 text-[var(--muted)]">لم نعرض تفاصيل الخادم أو Stack Trace لحماية النظام. جرّب مرة أخرى.</p>{error.digest && <p className="mt-2 text-[10px] text-[var(--faint)]" dir="ltr">Reference: {error.digest}</p>}<button type="button" onClick={reset} className="btn-primary mt-7"><RotateCcw className="h-4 w-4" /> إعادة المحاولة</button></div></div>;
}
