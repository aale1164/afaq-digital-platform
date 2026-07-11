import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { featureFlags } from "@/lib/brand";
import { getCurrentUser } from "@/lib/auth";
import { demoOwner } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const realUser = await getCurrentUser();
  if (!realUser && !featureFlags.demoMode) redirect("/login?next=/dashboard");
  return <DashboardShell user={realUser ?? demoOwner} demo={!realUser}>{children}</DashboardShell>;
}
