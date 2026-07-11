import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ClientProviders } from "@/components/providers/client-providers";
import { brand } from "@/lib/brand";
import { getPublicSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: `${brand.nameAr} | ${brand.tagline}`,
    template: `%s | ${brand.shortName}`,
  },
  description: "منصة عربية متكاملة لأدوات الصور والمطورين والأعمال، تعمل بخصوصية ووضوح.",
  applicationName: brand.nameAr,
  authors: [{ name: "عدناني" }],
  creator: "عدناني",
  keywords: ["أدوات عربية", "معالجة الصور", "QR", "أدوات المطورين", "آفاق الرقمية"],
  robots: { index: true, follow: true },
  openGraph: {
    title: brand.nameAr,
    description: brand.tagline,
    locale: "ar_SA",
    type: "website",
  },
  icons: { icon: "/afaq-mark.svg", shortcut: "/afaq-mark.svg", apple: "/afaq-mark.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#07131e",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getPublicSiteSettings();
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('afaq-theme');if(t==='light')document.documentElement.dataset.theme='light'}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <a className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-[var(--brand)] focus:px-4 focus:py-3 focus:text-[#031817]" href="#main-content">
          انتقل إلى المحتوى
        </a>
        <div className="noise-overlay" aria-hidden="true" />
        <ClientProviders settings={settings}>
          <SiteHeader xUrl={settings.xUrl} />
          <main id="main-content" className="min-h-[70vh]">{children}</main>
          <SiteFooter xUrl={settings.xUrl} />
        </ClientProviders>
      </body>
    </html>
  );
}
