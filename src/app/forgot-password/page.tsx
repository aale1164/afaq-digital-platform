import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "استعادة كلمة المرور" };

export default function ForgotPasswordPage() {
  return <AuthShell title="استعادة الوصول" description="سنرسل رابطًا مؤقتًا إلى بريدك إن كان مسجلًا لدينا." footer={<Link href="/login" className="font-bold text-[var(--brand)]">العودة إلى تسجيل الدخول</Link>}><AuthForm mode="forgot" /></AuthShell>;
}
