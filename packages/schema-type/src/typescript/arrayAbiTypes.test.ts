import { describe, expect, it } from "vitest";
import { fixedArrayToArray, isArrayAbiType, isFixedArrayAbiType } from "./arrayAbiTypes";

describe("isArrayAbiType", () => {
  it("should validate ABI type as an array", async () => {
    expect(isArrayAbiType("uint8")).toBe(false);
    expect(isArrayAbiType("uint8[]")).toBe(true);
    expect(isArrayAbiType("bool[]")).toBe(true);
    expect(isArrayAbiType("bool[4]")).toBe(false);
    expect(isArrayAbiType("string[]")).toBe(false);
    expect(isArrayAbiType("string[4]")).toBe(false);
  });
});

describe("isFixedArrayAbiType", () => {
  it("should validate ABI type as an array", async () => {
    expect(isFixedArrayAbiType("uint8")).toBe(false);
    expect(isFixedArrayAbiType("uint8[]")).toBe(false);
    expect(isFixedArrayAbiType("bool[]")).toBe(false);
    expect(isFixedArrayAbiType("bool[4]")).toBe(true);
    expect(isFixedArrayAbiType("string[]")).toBe(false);
    expect(isFixedArrayAbiType("string[4]")).toBe(false);
  });
});

describe("fixedArrayToArray", () => {
  it("should convert a fixed array to a regular array", async () => {
    expect(fixedArrayToArray("uint8[2]")).toBe("uint8[]");
    expect(fixedArrayToArray("bool[4]")).toBe("bool[]");
  });
});
