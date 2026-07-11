import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "كلمة مرور جديدة" };

export default function ResetPasswordPage() {
  return <AuthShell title="كلمة مرور جديدة" description="اختر كلمة قوية لا تستخدمها في خدمة أخرى."><AuthForm mode="reset" /></AuthShell>;
}
