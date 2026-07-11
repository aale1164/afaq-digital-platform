"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileState } from "@/features/profile/state";

export async function updateProfileAction(_: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "انتهت الجلسة. سجّل الدخول مجددًا." };
  const parsed = z.object({ fullName: z.string().trim().min(2).max(80) }).safeParse({ fullName: formData.get("fullName") });
  if (!parsed.success) return { status: "error", message: "الاسم يجب أن يكون بين حرفين و80 حرفًا." };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "الحفظ غير متاح في الوضع الاستعراضي." };
  const { error } = await supabase.from("profiles").update({ full_name: parsed.data.fullName, updated_at: new Date().toISOString() }).eq("id", user.id);
  if (error) return { status: "error", message: "تعذر حفظ التغييرات." };
  await supabase.auth.updateUser({ data: { full_name: parsed.data.fullName } });
  revalidatePath("/dashboard");
  return { status: "success", message: "تم حفظ الملف الشخصي." };
}

export async function requestAccountDeletionAction(_: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "انتهت الجلسة." };
  if (formData.get("confirmation") !== "حذف حسابي") return { status: "error", message: "اكتب «حذف حسابي» للتأكيد." };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "الطلب غير متاح في الوضع الاستعراضي." };
  const { error } = await supabase.from("account_deletion_requests").upsert({ user_id: user.id, requested_at: new Date().toISOString(), status: "pending" }, { onConflict: "user_id" });
  return error ? { status: "error", message: "تعذر تسجيل الطلب." } : { status: "success", message: "تم تسجيل طلب الحذف، وسيُراجع قبل التنفيذ لحماية الحساب." };
}
