import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { hmac } from "@/lib/security/hmac";
import { rateLimit } from "@/lib/security/rate-limit";
import { applyVisitorCookie, getUsageIdentity, issuePermit } from "@/lib/usage/server";

const schema = z.object({ toolSlug: z.string().regex(/^[a-z0-9-]{2,60}$/) });

export async function POST(request: NextRequest) {
  const identity = await getUsageIdentity(request);
  const limited = rateLimit(`permit:${hmac(identity.ipHash)}`, 30, 60_000);
  if (!limited.allowed) {
    return NextResponse.json({ ok: false, reason: "rate_limited", message: "طلبات كثيرة خلال وقت قصير. انتظر قليلًا." }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "طلب غير صالح." }, { status: 400 });
  const permit = await issuePermit(identity, parsed.data.toolSlug);
  const status = permit.allowed ? 200 : permit.reason === "limit_reached" || permit.reason === "registration_required" ? 402 : 403;
  const response = NextResponse.json({ ok: permit.allowed, ...permit }, { status });
  applyVisitorCookie(response, identity);
  return response;
}
