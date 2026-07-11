import { getCurrentUser } from "@/lib/auth";
import { demoOwner } from "@/lib/demo-data";
import { ProfileForms } from "@/components/dashboard/profile-forms";

export default async function ProfilePage() {
  const realUser = await getCurrentUser();
  const user = realUser ?? demoOwner;
  return <div><p className="text-sm text-[var(--muted)]">إعدادات الحساب</p><h1 className="font-display mt-2 text-3xl font-bold">الملف الشخصي</h1><p className="mt-3 text-sm leading-7 text-[var(--muted)]">حدّث بياناتك أو اطلب حذف الحساب من مسار واضح وآمن.</p><div className="mt-8"><ProfileForms name={user.name} email={user.email} demo={!realUser} /></div></div>;
}
