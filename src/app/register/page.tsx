import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "إنشاء حساب" };

export default function RegisterPage() {
  return <AuthShell title="افتح أفقك الرقمي" description="أنشئ حسابًا مجانيًا، ثم أكّد بريدك لحماية الحساب." footer={<>لديك حساب؟ <Link href="/login" className="font-bold text-[var(--brand)]">سجّل الدخول</Link></>}><AuthForm mode="register" /></AuthShell>;
}
