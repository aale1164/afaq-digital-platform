"use client";

import { Toaster } from "sonner";
import { SiteSettingsProvider } from "./site-settings-provider";
import type { PublicSiteSettings } from "@/lib/site-settings";

export function ClientProviders({ children, settings }: { children: React.ReactNode; settings: PublicSiteSettings }) {
  return (
    <SiteSettingsProvider settings={settings}>
      {children}
      <Toaster
        position="bottom-left"
        dir="rtl"
        richColors
        toastOptions={{
          style: {
            background: "var(--surface-3)",
            border: "1px solid var(--line-strong)",
            color: "var(--ink)",
          },
        }}
      />
    </SiteSettingsProvider>
  );
}
