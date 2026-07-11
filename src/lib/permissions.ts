export const appRoles = ["OWNER", "ADMIN", "SUPPORT", "USER", "DEVELOPER"] as const;
export type AppRole = (typeof appRoles)[number];

export function canManageRole(actor: AppRole, target: AppRole) {
  if (target === "OWNER") return false;
  if (actor === "OWNER") return true;
  if (actor === "ADMIN") return target === "USER" || target === "DEVELOPER" || target === "SUPPORT";
  return false;
}
