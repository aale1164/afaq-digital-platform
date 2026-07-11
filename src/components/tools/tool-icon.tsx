import {
  Building2,
  Code2,
  FileText,
  GraduationCap,
  ImageIcon,
  Languages,
  Layers3,
  QrCode,
  ScanLine,
  ShieldCheck,
  Stamp,
  WandSparkles,
} from "lucide-react";
import type { ToolIconName } from "@/lib/tool-registry";
import { cn } from "@/lib/utils";

const iconMap = {
  image: ImageIcon,
  wand: WandSparkles,
  layers: Layers3,
  stamp: Stamp,
  qr: QrCode,
  code: Code2,
  file: FileText,
  scan: ScanLine,
  languages: Languages,
  shield: ShieldCheck,
  graduation: GraduationCap,
  building: Building2,
} satisfies Record<ToolIconName, typeof ImageIcon>;

export function ToolIcon({ name, className }: { name: ToolIconName; className?: string }) {
  const Icon = iconMap[name];
  return <Icon className={cn("h-5 w-5", className)} aria-hidden="true" />;
}
