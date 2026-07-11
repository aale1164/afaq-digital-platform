import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default function LoginPage() {
  return <AuthShell title="أهلًا بعودتك" description="ادخل إلى حسابك لمتابعة أدواتك واستخداماتك." footer={<>ليس لديك حساب؟ <Link href="/register" className="font-bold text-[var(--brand)]">أنشئ حسابًا</Link></>}><AuthForm mode="login" /></AuthShell>;
}
