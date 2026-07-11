import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "منصة آفاق الرقمية",
    short_name: "آفاق",
    description: "أدوات عربية ذكية ونتائج حقيقية.",
    start_url: "/",
    display: "standalone",
    background_color: "#07131e",
    theme_color: "#07131e",
    lang: "ar",
    dir: "rtl",
    icons: [{ src: "/afaq-mark.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
