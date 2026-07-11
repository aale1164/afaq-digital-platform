import { NextResponse } from "next/server";
import { serviceStatus } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "afaq-digital",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    dependencies: { auth_configured: serviceStatus.auth, database_configured: serviceStatus.supabase, background_removal_configured: serviceStatus.backgroundRemoval },
  }, { headers: { "Cache-Control": "no-store" } });
}
