import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() { return <div className="container-shell flex min-h-[62vh] items-center justify-center py-16"><div className="max-w-lg text-center"><Compass className="mx-auto h-14 w-14 text-[var(--brand)]" /><p className="font-display mt-6 text-6xl font-bold text-[var(--line-strong)]">404</p><h1 className="font-display mt-4 text-2xl font-bold">هذا الأفق غير موجود</h1><p className="mt-4 leading-8 text-[var(--muted)]">قد يكون الرابط قديمًا أو كُتب بطريقة غير صحيحة.</p><div className="mt-7 flex justify-center gap-3"><Link href="/" className="btn-primary">الرئيسية</Link><Link href="/tools" className="btn-secondary">الأدوات</Link></div></div></div>; }
