import { describe, expect, it } from "vitest";
import { padSliceHex } from "./padSliceHex";

describe("padSliceHex", () => {
  it("can slice empty hex", () => {
    expect(padSliceHex("0x", 6)).toBe("0x");
    expect(padSliceHex("0x", 6, 10)).toBe("0x00000000");
  });
  it("can slice hex out of bounds", () => {
    expect(padSliceHex("0x000100", 1)).toBe("0x0100");
    expect(padSliceHex("0x000100", 1, 4)).toBe("0x010000");
    expect(padSliceHex("0x000100", 3)).toBe("0x");
    expect(padSliceHex("0x000100", 3, 4)).toBe("0x00");
  });
});
