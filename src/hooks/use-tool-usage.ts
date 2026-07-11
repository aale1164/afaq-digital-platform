"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

type PermitResponse = { ok: boolean; token?: string; remaining?: number; reason?: string; message?: string };

export function useToolUsage(toolSlug: string) {
  const [gateOpen, setGateOpen] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  const begin = useCallback(async () => {
    try {
      const response = await fetch("/api/usage/permit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolSlug }),
      });
      const result = (await response.json()) as PermitResponse;
      if (!response.ok || !result.ok || !result.token) {
        if (response.status === 402 || result.reason === "limit_reached" || result.reason === "registration_required") setGateOpen(true);
        else toast.error(result.message || "تعذر بدء العملية.");
        return null;
      }
      setRemaining(result.remaining ?? null);
      return result.token;
    } catch {
      toast.error("تعذر الاتصال بنظام الاستخدام.");
      return null;
    }
  }, [toolSlug]);

  const complete = useCallback(async (token: string) => {
    try {
      const response = await fetch("/api/usage/success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = (await response.json()) as { ok: boolean; remaining?: number };
      if (response.ok && result.ok) setRemaining(result.remaining ?? null);
      return response.ok && result.ok;
    } catch {
      return false;
    }
  }, []);

  return { begin, complete, remaining, gateOpen, closeGate: () => setGateOpen(false) };
}
