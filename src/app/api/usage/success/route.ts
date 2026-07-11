import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { hmac } from "@/lib/security/hmac";
import { rateLimit } from "@/lib/security/rate-limit";
import { applyVisitorCookie, consumePermit, getUsageIdentity, readPermit } from "@/lib/usage/server";

const schema = z.object({ token: z.string().min(32).max(4096) });

export async function POST(request: NextRequest) {
  const identity = await getUsageIdentity(request);
  const limited = rateLimit(`success:${hmac(identity.ipHash)}`, 60, 60_000);
  if (!limited.allowed) return NextResponse.json({ ok: false, message: "طلبات كثيرة." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "طلب غير صالح." }, { status: 400 });
  const permit = readPermit(parsed.data.token, identity);
  if (!permit) return NextResponse.json({ ok: false, message: "انتهت صلاحية تصريح العملية." }, { status: 401 });
  const result = await consumePermit(permit, identity);
  const response = NextResponse.json({ ok: result.success, ...result }, { status: result.success ? 200 : 402 });
  applyVisitorCookie(response, identity);
  return response;
}
