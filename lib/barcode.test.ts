import { describe, expect, it } from "vitest";
import { CODE128_QUIET_ZONE, code128Modules, code128Values } from "./barcode";

describe("code128Values", () => {
  it("encodes a known symbol: start B, A, check 34, stop", () => {
    // Check value: (104 + 33 * 1) mod 103 = 34.
    expect(code128Values("A")).toEqual([104, 33, 34, 106]);
  });

  it("computes the weighted modulo 103 check value", () => {
    const values = code128Values("erichgrundman.com");
    const data = values.slice(1, -2);
    const check = values[values.length - 2];
    const sum = data.reduce((acc, v, i) => acc + v * (i + 1), 104);
    expect(check).toBe(sum % 103);
    expect(values[0]).toBe(104);
    expect(values[values.length - 1]).toBe(106);
  });

  it("rejects characters outside subset B", () => {
    expect(() => code128Values("tab\there")).toThrow();
  });
});

describe("code128Modules", () => {
  it("has 11 modules per symbol plus a 13 module stop", () => {
    const text = "erichgrundman.com";
    const widths = code128Modules(text);
    const total = widths.reduce((a, b) => a + b, 0);
    // start + chars + check = (text.length + 2) symbols of 11, stop is 13.
    expect(total).toBe((text.length + 2) * 11 + 13);
    expect(widths.length % 2).toBe(1); // starts and ends on a bar
    expect(CODE128_QUIET_ZONE).toBeGreaterThanOrEqual(10);
  });
});
