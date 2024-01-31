import { describe, expect, it } from "vitest";
import { readHex } from "./readHex";

describe("readHex", () => {
  it("can slice empty hex", () => {
    expect(readHex("0x", 6)).toBe("0x");
    expect(readHex("0x", 6, 10)).toBe("0x00000000");
  });
  it("can slice hex out of bounds", () => {
    expect(readHex("0x000100", 1)).toBe("0x0100");
    expect(readHex("0x000100", 1, 4)).toBe("0x010000");
    expect(readHex("0x000100", 3)).toBe("0x");
    expect(readHex("0x000100", 3, 4)).toBe("0x00");
  });
});
