import { describe, expect, it } from "vitest";
import { canManageRole } from "@/lib/permissions";

describe("role protection", () => {
  it("never allows managing OWNER through normal admin actions", () => {
    expect(canManageRole("OWNER", "OWNER")).toBe(false);
    expect(canManageRole("ADMIN", "OWNER")).toBe(false);
  });

  it("lets OWNER manage non-owner roles", () => {
    expect(canManageRole("OWNER", "ADMIN")).toBe(true);
    expect(canManageRole("OWNER", "USER")).toBe(true);
  });

  it("limits ADMIN to lower roles", () => {
    expect(canManageRole("ADMIN", "ADMIN")).toBe(false);
    expect(canManageRole("ADMIN", "SUPPORT")).toBe(true);
    expect(canManageRole("SUPPORT", "USER")).toBe(false);
  });
});
