"use client";

import { createContext, useContext } from "react";
import type { PublicSiteSettings } from "@/lib/site-settings";
import { brand } from "@/lib/brand";

const SiteSettingsContext = createContext<PublicSiteSettings>({ xUrl: brand.xUrl });

export function SiteSettingsProvider({ settings, children }: { settings: PublicSiteSettings; children: React.ReactNode }) {
  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
