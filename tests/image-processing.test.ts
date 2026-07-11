import { describe, expect, it } from "vitest";
import { calculateDimensions } from "@/lib/client/image-processing";

describe("image dimensions", () => {
  it("preserves aspect ratio inside requested bounds", () => {
    expect(calculateDimensions(4000, 2000, 1000, 1000, true)).toEqual({ width: 1000, height: 500 });
  });

  it("supports exact resize when ratio preservation is disabled", () => {
    expect(calculateDimensions(4000, 2000, 800, 600, false)).toEqual({ width: 800, height: 600 });
  });

  it("keeps original dimensions when both fields are zero", () => {
    expect(calculateDimensions(1200, 800, 0, 0, true)).toEqual({ width: 1200, height: 800 });
  });
});
