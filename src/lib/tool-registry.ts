export type ToolStatus = "active" | "external" | "coming-soon" | "maintenance";
export type AccessLevel = "public" | "member" | "premium";

export type ToolIconName =
  | "image"
  | "wand"
  | "layers"
  | "stamp"
  | "qr"
  | "code"
  | "file"
  | "scan"
  | "languages"
  | "shield"
  | "graduation"
  | "building";

export type ToolDefinition = {
  slug: string;
  nameAr: string;
  nameEn: string;
  description: string;
  category: "الصور" | "المطورون" | "المستندات" | "الأعمال" | "الطلاب";
  icon: ToolIconName;
  status: ToolStatus;
  accessLevel: AccessLevel;
  anonymousLimit: number;
  memberLimit: number | null;
  creditCost: number;
  featured: boolean;
  maintenanceMode: boolean;
  sortOrder: number;
  processing: "browser" | "server" | "external";
  highlights: string[];
};

export const toolRegistry: ToolDefinition[] = [
  {
    slug: "photo-editor",
    nameAr: "محرر الصور الاحترافي",
    nameEn: "Photo Editor V3",
    description: "حرّر صورك، أضف النصوص العربية والعناصر، واقتص النتيجة من جهازك مباشرة.",
    category: "الصور",
    icon: "image",
    status: "active",
    accessLevel: "public",
    anonymousLimit: 3,
    memberLimit: null,
    creditCost: 1,
    featured: true,
    maintenanceMode: false,
    sortOrder: 1,
    processing: "browser",
    highlights: ["كتابة عربية", "سحب وتدوير", "تصدير PNG"],
  },
  {
    slug: "background-remover",
    nameAr: "إزالة خلفية الصور",
    nameEn: "Background Remover",
    description: "إزالة احترافية عبر مزود خارجي آمن مع معاينة قبل وبعد وخيارات خلفية متعددة.",
    category: "الصور",
    icon: "wand",
    status: "external",
    accessLevel: "public",
    anonymousLimit: 3,
    memberLimit: 25,
    creditCost: 2,
    featured: true,
    maintenanceMode: false,
    sortOrder: 2,
    processing: "external",
    highlights: ["خلفية شفافة", "قبل وبعد", "المفتاح في الخادم"],
  },
  {
    slug: "batch-images",
    nameAr: "معمل الصور الدُفعي",
    nameEn: "Batch Image Lab",
    description: "اضغط وغيّر المقاس والصيغة لعشرات الصور ثم نزّلها في ملف ZIP واحد.",
    category: "الصور",
    icon: "layers",
    status: "active",
    accessLevel: "public",
    anonymousLimit: 3,
    memberLimit: null,
    creditCost: 1,
    featured: true,
    maintenanceMode: false,
    sortOrder: 3,
    processing: "browser",
    highlights: ["عدة صور", "PNG/JPG/WEBP", "تنزيل ZIP"],
  },
  {
    slug: "watermark",
    nameAr: "العلامة المائية الجماعية",
    nameEn: "Bulk Watermark",
    description: "احمِ صورك بنص أو شعار مع تحكم كامل بالموضع والحجم والشفافية.",
    category: "الصور",
    icon: "stamp",
    status: "active",
    accessLevel: "public",
    anonymousLimit: 3,
    memberLimit: null,
    creditCost: 1,
    featured: false,
    maintenanceMode: false,
    sortOrder: 4,
    processing: "browser",
    highlights: ["نص أو شعار", "تطبيق جماعي", "خصوصية محلية"],
  },
  {
    slug: "qr-studio",
    nameAr: "استوديو QR",
    nameEn: "QR Studio",
    description: "أنشئ رموز QR للرابط والنص والهاتف والبريد وWi‑Fi بألوان وهوية خاصة.",
    category: "الأعمال",
    icon: "qr",
    status: "active",
    accessLevel: "public",
    anonymousLimit: 3,
    memberLimit: null,
    creditCost: 1,
    featured: true,
    maintenanceMode: false,
    sortOrder: 5,
    processing: "browser",
    highlights: ["6 أنواع", "ألوان مخصصة", "PNG وSVG"],
  },
  {
    slug: "developer-lab",
    nameAr: "مختبر المطور",
    nameEn: "Developer Lab",
    description: "ثماني أدوات يومية للبيانات والترميز والتجزئة والوقت والتعبيرات النمطية.",
    category: "المطورون",
    icon: "code",
    status: "active",
    accessLevel: "public",
    anonymousLimit: 3,
    memberLimit: null,
    creditCost: 1,
    featured: true,
    maintenanceMode: false,
    sortOrder: 6,
    processing: "browser",
    highlights: ["JSON وBase64", "Hash وUUID", "JWT وRegex"],
  },
  {
    slug: "pdf-studio",
    nameAr: "استوديو PDF",
    nameEn: "PDF Studio",
    description: "دمج وضغط وتقسيم ملفات PDF بأمان.",
    category: "المستندات",
    icon: "file",
    status: "coming-soon",
    accessLevel: "member",
    anonymousLimit: 0,
    memberLimit: 10,
    creditCost: 2,
    featured: false,
    maintenanceMode: false,
    sortOrder: 20,
    processing: "browser",
    highlights: ["قيد التطوير"],
  },
  {
    slug: "arabic-ocr",
    nameAr: "استخراج النص العربي",
    nameEn: "Arabic OCR",
    description: "استخراج النصوص العربية من الصور والمستندات.",
    category: "المستندات",
    icon: "languages",
    status: "coming-soon",
    accessLevel: "member",
    anonymousLimit: 0,
    memberLimit: 10,
    creditCost: 2,
    featured: false,
    maintenanceMode: false,
    sortOrder: 21,
    processing: "server",
    highlights: ["قيد الدراسة"],
  },
  {
    slug: "document-scanner",
    nameAr: "ماسح المستندات",
    nameEn: "Document Scanner",
    description: "تصحيح منظور المستند وتحسين وضوحه تلقائيًا.",
    category: "المستندات",
    icon: "scan",
    status: "coming-soon",
    accessLevel: "public",
    anonymousLimit: 3,
    memberLimit: null,
    creditCost: 1,
    featured: false,
    maintenanceMode: false,
    sortOrder: 22,
    processing: "browser",
    highlights: ["قريبًا"],
  },
  {
    slug: "image-forensics",
    nameAr: "فحص سلامة الصور",
    nameEn: "Image Integrity",
    description: "مؤشرات أولية تساعد على فحص بيانات الصورة وآثار التعديل.",
    category: "الصور",
    icon: "shield",
    status: "coming-soon",
    accessLevel: "member",
    anonymousLimit: 0,
    memberLimit: 5,
    creditCost: 3,
    featured: false,
    maintenanceMode: false,
    sortOrder: 23,
    processing: "server",
    highlights: ["مؤشرات وليست حكمًا قطعيًا"],
  },
  {
    slug: "student-tools",
    nameAr: "أدوات الطلاب",
    nameEn: "Student Tools",
    description: "مجموعة أدوات عملية للدراسة والملفات والعروض.",
    category: "الطلاب",
    icon: "graduation",
    status: "coming-soon",
    accessLevel: "member",
    anonymousLimit: 0,
    memberLimit: null,
    creditCost: 1,
    featured: false,
    maintenanceMode: false,
    sortOrder: 30,
    processing: "browser",
    highlights: ["قريبًا"],
  },
  {
    slug: "business-tools",
    nameAr: "أدوات الشركات",
    nameEn: "Business Tools",
    description: "معالجة ملفات وعمليات متكررة للشركات والفرق.",
    category: "الأعمال",
    icon: "building",
    status: "coming-soon",
    accessLevel: "premium",
    anonymousLimit: 0,
    memberLimit: 100,
    creditCost: 3,
    featured: false,
    maintenanceMode: false,
    sortOrder: 31,
    processing: "server",
    highlights: ["مخطط للمرحلة القادمة"],
  },
];

export const liveTools = toolRegistry.filter((tool) => tool.status === "active" || tool.status === "external");
export const featuredTools = liveTools.filter((tool) => tool.featured);
export const categories = [...new Set(toolRegistry.map((tool) => tool.category))];

export function getTool(slug: string) {
  return toolRegistry.find((tool) => tool.slug === slug);
}
