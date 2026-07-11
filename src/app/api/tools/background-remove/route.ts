import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { hmac } from "@/lib/security/hmac";
import { rateLimit } from "@/lib/security/rate-limit";
import { applyVisitorCookie, consumePermit, getUsageIdentity, readPermit } from "@/lib/usage/server";

export const runtime = "nodejs";

function validImageSignature(bytes: Uint8Array, type: string) {
  if (type === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}

export async function POST(request: NextRequest) {
  if (!env.REMOVE_BG_API_KEY) {
    return NextResponse.json({ ok: false, message: "مزود إزالة الخلفية غير مهيأ. أضف REMOVE_BG_API_KEY في الخادم." }, { status: 503 });
  }
  const identity = await getUsageIdentity(request);
  const limited = rateLimit(`remove-bg:${hmac(identity.ipHash)}`, 8, 60_000);
  if (!limited.allowed) return NextResponse.json({ ok: false, message: "طلبات كثيرة. انتظر قليلًا ثم أعد المحاولة." }, { status: 429 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const token = form?.get("permit")?.toString();
  if (!(file instanceof File) || !token) return NextResponse.json({ ok: false, message: "الصورة أو تصريح العملية مفقود." }, { status: 400 });
  if (file.size <= 0 || file.size > 10 * 1024 * 1024) return NextResponse.json({ ok: false, message: "حجم الصورة يجب ألا يتجاوز 10 MB." }, { status: 413 });
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return NextResponse.json({ ok: false, message: "نوع الصورة غير مدعوم." }, { status: 415 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!validImageSignature(bytes.slice(0, 16), file.type)) return NextResponse.json({ ok: false, message: "محتوى الملف لا يطابق نوع الصورة." }, { status: 415 });

  const permit = readPermit(token, identity, "background-remover");
  if (!permit) return NextResponse.json({ ok: false, message: "انتهت صلاحية تصريح العملية. أعد المحاولة." }, { status: 401 });

  const providerForm = new FormData();
  providerForm.set("image_file", new Blob([bytes], { type: file.type }), "upload-image");
  providerForm.set("size", "auto");
  let providerResponse: Response;
  try {
    providerResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": env.REMOVE_BG_API_KEY },
      body: providerForm,
      signal: AbortSignal.timeout(60_000),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ ok: false, message: "تعذر الاتصال بمزود الإزالة. لم تُخصم العملية." }, { status: 502 });
  }
  if (!providerResponse.ok) {
    const status = providerResponse.status === 402 ? 503 : 502;
    return NextResponse.json({ ok: false, message: providerResponse.status === 402 ? "رصيد مزود إزالة الخلفية غير كافٍ." : "لم يقبل المزود الصورة. جرّب صورة أوضح." }, { status });
  }
  const resultBytes = await providerResponse.arrayBuffer();
  const consumed = await consumePermit(permit, identity);
  if (!consumed.success) return NextResponse.json({ ok: false, message: "تعذر تسجيل العملية بعد نجاح المزود. تواصل مع الدعم." }, { status: 500 });

  const response = new NextResponse(resultBytes, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, no-store, max-age=0",
      "X-Afaq-Remaining": String(consumed.remaining),
    },
  });
  applyVisitorCookie(response, identity);
  return response;
}
