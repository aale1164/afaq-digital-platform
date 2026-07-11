import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyTurnstile } from "@/lib/turnstile";
import { rateLimit } from "@/lib/security/rate-limit";
import { hmac } from "@/lib/security/hmac";

const schema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().email().max(254), subject: z.string().trim().min(3).max(120), message: z.string().trim().min(10).max(3000), website: z.string().max(0) });

export async function POST(request: NextRequest) {
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const limited = rateLimit(`contact:${hmac(ip)}`, 5, 60 * 60 * 1000);
  if (!limited.allowed) return NextResponse.json({ message: "وصل الحد المؤقت للرسائل. حاول لاحقًا." }, { status: 429 });
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ message: "طلب غير صالح." }, { status: 400 });
  const parsed = schema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return NextResponse.json({ message: "راجع الحقول المطلوبة وطول الرسالة." }, { status: 400 });
  const captcha = await verifyTurnstile(form.get("cf-turnstile-response")?.toString() ?? null, ip);
  if (!captcha.success) return NextResponse.json({ message: "تعذر اجتياز اختبار الحماية." }, { status: 400 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ message: "خدمة الرسائل غير مهيأة بعد." }, { status: 503 });
  const { error } = await admin.from("support_messages").insert({ name: parsed.data.name, email: parsed.data.email, subject: parsed.data.subject, message: parsed.data.message, ip_hash: hmac(`contact-ip:${ip}`), status: "new" });
  return error ? NextResponse.json({ message: "تعذر حفظ الرسالة." }, { status: 500 }) : NextResponse.json({ ok: true });
}
