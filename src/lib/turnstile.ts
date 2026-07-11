import "server-only";
import { env } from "@/lib/env";

export async function verifyTurnstile(token: string | null, remoteIp?: string | null) {
  if (!env.TURNSTILE_SECRET_KEY) return { success: true, skipped: true };
  if (!token) return { success: false, skipped: false };
  try {
    const form = new FormData();
    form.set("secret", env.TURNSTILE_SECRET_KEY);
    form.set("response", token);
    if (remoteIp) form.set("remoteip", remoteIp);
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
      cache: "no-store",
    });
    const result = (await response.json()) as { success?: boolean };
    return { success: result.success === true, skipped: false };
  } catch {
    return { success: false, skipped: false };
  }
}
