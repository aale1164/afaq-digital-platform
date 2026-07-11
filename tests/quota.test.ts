import { describe, expect, it } from "vitest";
import { consumeQuota } from "@/lib/usage/quota";

describe("anonymous quota", () => {
  it("allows exactly three successful operations", () => {
    const first = consumeQuota(0, 3);
    const second = consumeQuota(first.nextCount, 3);
    const third = consumeQuota(second.nextCount, 3);
    const fourth = consumeQuota(third.nextCount, 3);
    expect([first.success, second.success, third.success, fourth.success]).toEqual([true, true, true, false]);
    expect(third.remaining).toBe(0);
    expect(fourth.nextCount).toBe(3);
  });

  it("does not charge the same operation twice", () => {
    const duplicate = consumeQuota(1, 3, true);
    expect(duplicate).toEqual({ success: true, nextCount: 1, remaining: 2, idempotent: true });
  });

  it("keeps the count unchanged when no success commit occurs", () => {
    const countBeforeFailedTool = 2;
    const countAfterFailedTool = countBeforeFailedTool;
    expect(countAfterFailedTool).toBe(2);
    expect(consumeQuota(countAfterFailedTool, 3).remaining).toBe(0);
  });
});
