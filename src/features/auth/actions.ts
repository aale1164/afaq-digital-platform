"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/turnstile";
import type { AuthState } from "@/features/auth/state";

const emailSchema = z.string().trim().email("أدخل بريدًا إلكترونيًا صحيحًا").max(254);
const passwordSchema = z.string().min(8, "كلمة المرور يجب ألا تقل عن 8 أحرف").max(128);

function errorMessage(error: unknown) {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? "البيانات غير صحيحة";
  return "تعذر إتمام الطلب. حاول مرة أخرى.";
}

export async function signUpAction(_: AuthState, formData: FormData): Promise<AuthState> {
  try {
    const data = z.object({
      fullName: z.string().trim().min(2, "اكتب اسمك").max(80),
      email: emailSchema,
      password: passwordSchema,
      acceptTerms: z.literal("on", { error: "يجب الموافقة على الشروط" }),
    }).parse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      password: formData.get("password"),
      acceptTerms: formData.get("acceptTerms"),
    });

    const requestHeaders = await headers();
    const captcha = await verifyTurnstile(formData.get("cf-turnstile-response")?.toString() ?? null, requestHeaders.get("x-forwarded-for")?.split(",")[0]);
    if (!captcha.success) return { status: "error", message: "تعذر اجتياز اختبار الحماية. أعد المحاولة." };

    const supabase = await createSupabaseServerClient();
    if (!supabase) return { status: "error", message: "التسجيل غير مهيأ بعد. افتح صفحة الإعداد الأولي لربط Supabase." };
    const origin = requestHeaders.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
        emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      },
    });
    if (error) {
      const duplicate = /already|registered|exists/i.test(error.message);
      return { status: "error", message: duplicate ? "هذا البريد مستخدم مسبقًا. جرّب تسجيل الدخول." : "تعذر إنشاء الحساب. تحقق من البيانات ثم أعد المحاولة." };
    }
    return { status: "success", message: "تم إنشاء الحساب. افتح بريدك واضغط رابط التأكيد." };
  } catch (error) {
    return { status: "error", message: errorMessage(error) };
  }
}

export async function signInAction(_: AuthState, formData: FormData): Promise<AuthState> {
  try {
    const data = z.object({ email: emailSchema, password: z.string().min(1, "اكتب كلمة المرور") }).parse({
      email: formData.get("email"), password: formData.get("password"),
    });
    const requestHeaders = await headers();
    const captcha = await verifyTurnstile(formData.get("cf-turnstile-response")?.toString() ?? null, requestHeaders.get("x-forwarded-for")?.split(",")[0]);
    if (!captcha.success) return { status: "error", message: "تعذر اجتياز اختبار الحماية. أعد المحاولة." };
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { status: "error", message: "تسجيل الدخول غير مهيأ. اربط Supabase من صفحة الإعداد الأولي." };
    const { data: authData, error } = await supabase.auth.signInWithPassword(data);
    if (error) return { status: "error", message: "البريد أو كلمة المرور غير صحيحة، أو لم يتم تأكيد البريد." };
    if (!authData.user.email_confirmed_at) {
      await supabase.auth.signOut();
      return { status: "error", message: "أكد بريدك الإلكتروني أولًا ثم سجّل الدخول." };
    }
  } catch (error) {
    return { status: "error", message: errorMessage(error) };
  }
  redirect("/dashboard");
}

export async function requestPasswordResetAction(_: AuthState, formData: FormData): Promise<AuthState> {
  try {
    const email = emailSchema.parse(formData.get("email"));
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { status: "error", message: "خدمة البريد غير مهيأة بعد." };
    const requestHeaders = await headers();
    const origin = requestHeaders.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=/reset-password` });
    return { status: "success", message: "إذا كان البريد مسجلًا فسيصلك رابط إعادة التعيين خلال دقائق." };
  } catch (error) {
    return { status: "error", message: errorMessage(error) };
  }
}

export async function updatePasswordAction(_: AuthState, formData: FormData): Promise<AuthState> {
  try {
    const password = passwordSchema.parse(formData.get("password"));
    const confirmPassword = formData.get("confirmPassword")?.toString();
    if (password !== confirmPassword) return { status: "error", message: "كلمتا المرور غير متطابقتين." };
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { status: "error", message: "المصادقة غير مهيأة بعد." };
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { status: "error", message: "انتهت صلاحية الرابط أو تعذر تحديث كلمة المرور." };
    return { status: "success", message: "تم تحديث كلمة المرور. يمكنك الآن تسجيل الدخول." };
  } catch (error) {
    return { status: "error", message: errorMessage(error) };
  }
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
