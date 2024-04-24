import { describe, expect, expectTypeOf, it } from "vitest";
import {
  ArrayAbiType,
  FixedArrayAbiType,
  fixedArrayToArray,
  isArrayAbiType,
  isFixedArrayAbiType,
} from "./arrayAbiTypes";

describe("isArrayAbiType", () => {
  it("should validate ABI type", () => {
    expect(isArrayAbiType("uint8")).toBe(false);
    expect(isArrayAbiType("uint8[]")).toBe(true);
    expect(isArrayAbiType("bool[]")).toBe(true);
    expect(isArrayAbiType("bool[4]")).toBe(false);
    expect(isArrayAbiType("string[]")).toBe(false);
    expect(isArrayAbiType("string[4]")).toBe(false);
  });

  it("should narrow the ABI type", () => {
    const abiType = "uint8[]";
    if (isArrayAbiType(abiType)) {
      expectTypeOf<typeof abiType>().toMatchTypeOf<ArrayAbiType>();
      expectTypeOf<typeof abiType>().toEqualTypeOf<"uint8[]">();
    } else {
      expect.fail();
    }
  });

  it("should narrow an unknown", () => {
    const abiType = "uint8[]" as unknown;
    if (isArrayAbiType(abiType)) {
      expectTypeOf<typeof abiType>().toEqualTypeOf<ArrayAbiType>();
    } else {
      expect.fail();
    }
  });
});

describe("isFixedArrayAbiType", () => {
  it("should validate ABI type", () => {
    expect(isFixedArrayAbiType("uint8")).toBe(false);
    expect(isFixedArrayAbiType("uint8[]")).toBe(false);
    expect(isFixedArrayAbiType("bool[]")).toBe(false);
    expect(isFixedArrayAbiType("bool[4]")).toBe(true);
    expect(isFixedArrayAbiType("string[]")).toBe(false);
    expect(isFixedArrayAbiType("string[4]")).toBe(false);
  });

  it("should narrow the ABI type", () => {
    const abiType = "uint8[4]";
    if (isFixedArrayAbiType(abiType)) {
      expectTypeOf<typeof abiType>().toMatchTypeOf<FixedArrayAbiType>();
      expectTypeOf<typeof abiType>().toEqualTypeOf<"uint8[4]">();
    } else {
      expect.fail();
    }
  });

  it("should narrow an unknown", () => {
    const abiType = "uint8[4]" as unknown;
    if (isFixedArrayAbiType(abiType)) {
      expectTypeOf<typeof abiType>().toEqualTypeOf<FixedArrayAbiType>();
    } else {
      expect.fail();
    }
  });
});

describe("fixedArrayToArray", () => {
  it("should convert a fixed array to a regular array", () => {
    expect(fixedArrayToArray("uint8[2]")).toBe("uint8[]");
    expectTypeOf(fixedArrayToArray("uint8[2]")).toEqualTypeOf<"uint8[]">();

    expect(fixedArrayToArray("bool[4]")).toBe("bool[]");
    expectTypeOf(fixedArrayToArray("bool[4]")).toEqualTypeOf<"bool[]">();
  });
});
