export type QuotaResult = { success: boolean; nextCount: number; remaining: number; idempotent: boolean };

export function consumeQuota(currentCount: number, limit: number, alreadyConsumed = false): QuotaResult {
  const safeCount = Math.max(0, Math.trunc(currentCount));
  const safeLimit = Math.max(0, Math.trunc(limit));
  if (alreadyConsumed) return { success: true, nextCount: safeCount, remaining: Math.max(0, safeLimit - safeCount), idempotent: true };
  if (safeCount >= safeLimit) return { success: false, nextCount: safeCount, remaining: 0, idempotent: false };
  const nextCount = safeCount + 1;
  return { success: true, nextCount, remaining: Math.max(0, safeLimit - nextCount), idempotent: false };
}
