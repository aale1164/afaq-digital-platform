import { describe, expect, it } from "vitest";
import { liveTools, toolRegistry } from "@/lib/tool-registry";

describe("tool registry", () => {
  it("has unique URL-safe slugs", () => {
    const slugs = toolRegistry.map((tool) => tool.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    slugs.forEach((slug) => expect(slug).toMatch(/^[a-z0-9-]+$/));
  });

  it("ships the six requested real tools", () => {
    expect(liveTools.map((tool) => tool.slug)).toEqual(expect.arrayContaining(["photo-editor", "background-remover", "batch-images", "watermark", "qr-studio", "developer-lab"]));
  });

  it("does not label coming-soon tools as active", () => {
    expect(toolRegistry.filter((tool) => tool.status === "coming-soon").every((tool) => !liveTools.includes(tool))).toBe(true);
  });
});
