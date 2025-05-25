import { test, expect } from "@playwright/test";
import { cn, contrastColor } from "../../src/lib/utils";

test.describe("Utils", () => {
  test.describe("cn function", () => {
    test("should merge class names correctly", () => {
      const result = cn("text-red-500", "bg-blue-500");
      expect(result).toBe("text-red-500 bg-blue-500");
    });

    test("should handle conditional classes", () => {
      const result = cn(
        "base-class",
        true && "conditional-class",
        false && "hidden-class"
      );
      expect(result).toBe("base-class conditional-class");
    });

    test("should handle undefined and null values", () => {
      const result = cn("base-class", undefined, null, "another-class");
      expect(result).toBe("base-class another-class");
    });

    test("should merge conflicting Tailwind classes correctly", () => {
      const result = cn("text-red-500", "text-blue-500");
      expect(result).toBe("text-blue-500");
    });
  });

  test.describe("contrastColor function", () => {
    test("should return white for dark colors", () => {
      expect(contrastColor("#000000")).toBe("white");
      expect(contrastColor("#333333")).toBe("white");
      expect(contrastColor("#1a1a1a")).toBe("white");
    });

    test("should return black for light colors", () => {
      expect(contrastColor("#ffffff")).toBe("black");
      expect(contrastColor("#f0f0f0")).toBe("black");
      expect(contrastColor("#cccccc")).toBe("black");
    });

    test("should handle 3-character hex colors", () => {
      expect(contrastColor("#000")).toBe("white");
      expect(contrastColor("#fff")).toBe("black");
      expect(contrastColor("#f00")).toBe("white");
    });

    test("should handle rgb colors", () => {
      expect(contrastColor("rgb(0, 0, 0)")).toBe("white");
      expect(contrastColor("rgb(255, 255, 255)")).toBe("black");
      expect(contrastColor("rgb(128, 128, 128)")).toBe("black");
    });

    test("should handle rgba colors", () => {
      expect(contrastColor("rgba(0, 0, 0, 1)")).toBe("white");
      expect(contrastColor("rgba(255, 255, 255, 0.5)")).toBe("black");
    });

    test("should return black for invalid colors", () => {
      expect(contrastColor("invalid")).toBe("black");
      expect(contrastColor("#gg")).toBe("black");
      expect(contrastColor("")).toBe("black");
    });

    test("should handle non-string input", () => {
      expect(contrastColor(null as any)).toBe("black");
      expect(contrastColor(undefined as any)).toBe("black");
      expect(contrastColor(123 as any)).toBe("black");
    });
  });
});
