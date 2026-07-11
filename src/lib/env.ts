import "server-only";
import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));

const schema = z.object({
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  OWNER_EMAIL: z.string().email().optional().or(z.literal("")),
  VISITOR_HMAC_SECRET: z.string().min(32).optional(),
  ANONYMOUS_FREE_RUNS: z.coerce.number().int().min(0).max(100).default(3),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  REMOVE_BG_API_KEY: z.string().optional(),
  BACKGROUND_REMOVAL_PROVIDER: z.enum(["remove-bg"]).default("remove-bg"),
});

const parsed = schema.safeParse(process.env);

export const env = parsed.success
  ? parsed.data
  : {
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      OWNER_EMAIL: process.env.OWNER_EMAIL,
      VISITOR_HMAC_SECRET: process.env.VISITOR_HMAC_SECRET,
      ANONYMOUS_FREE_RUNS: 3,
      TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
      REMOVE_BG_API_KEY: process.env.REMOVE_BG_API_KEY,
      BACKGROUND_REMOVAL_PROVIDER: "remove-bg" as const,
    };

export const serviceStatus = {
  supabase: Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL &&
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      env.SUPABASE_SERVICE_ROLE_KEY,
  ),
  auth: Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  visitorSecurity: Boolean(env.VISITOR_HMAC_SECRET && env.VISITOR_HMAC_SECRET.length >= 32),
  turnstile: Boolean(env.TURNSTILE_SECRET_KEY),
  backgroundRemoval: Boolean(env.REMOVE_BG_API_KEY),
  owner: Boolean(env.OWNER_EMAIL),
} as const;

export function configurationIssues() {
  const issues: { key: string; label: string; required: boolean }[] = [];
  if (!serviceStatus.auth) issues.push({ key: "supabase", label: "ربط Supabase للمصادقة", required: true });
  if (!serviceStatus.visitorSecurity) issues.push({ key: "hmac", label: "إنشاء VISITOR_HMAC_SECRET", required: true });
  if (!serviceStatus.owner) issues.push({ key: "owner", label: "تحديد OWNER_EMAIL", required: true });
  if (!serviceStatus.turnstile) issues.push({ key: "turnstile", label: "ربط Cloudflare Turnstile", required: false });
  if (!serviceStatus.backgroundRemoval) issues.push({ key: "remove-bg", label: "إضافة REMOVE_BG_API_KEY", required: false });
  return issues;
}
