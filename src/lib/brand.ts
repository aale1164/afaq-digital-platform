export const brand = {
  nameAr: "منصة آفاق الرقمية",
  shortName: "آفاق",
  nameEn: "AFAQ DIGITAL",
  tagline: "أدوات عربية ذكية. نتائج حقيقية.",
  signature: "برمجة وتطوير عدناني",
  developerName: "عدناني",
  xUrl: process.env.NEXT_PUBLIC_X_URL || "https://x.com/aale1164?s=20",
  xHandle: "@aale1164",
  supportEmail: "support@afaq.local",
} as const;

export const featureFlags = {
  marketplace: process.env.MARKETPLACE_ENABLED === "true",
  developerApi: process.env.DEVELOPER_API_ENABLED === "true",
  demoMode: process.env.DEMO_MODE === "true" || (process.env.NODE_ENV !== "production" && process.env.DEMO_MODE !== "false"),
} as const;
