import { describe, expect, it } from "vitest";
import { decodeKeyTuple } from "./decodeKeyTuple";
import { abiTypesToSchema } from "./abiTypesToSchema";

// "0x000000000000000000000000000000000000000000000000000000000000002a"
// "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd6"
// "0x1234000000000000000000000000000000000000000000000000000000000000"
// "0x000000000000000000000000ffffffffffffffffffffffffffffffffffffffff"
// "0x0000000000000000000000000000000000000000000000000000000000000001"
// "0x0000000000000000000000000000000000000000000000000000000000000003"

// k1: "uint256",
// k2: "int32",
// k3: "bytes16",
// k4: "address",
// k5: "bool",
// k6: "",

describe("decodeKeyTuple", () => {
  it("can decode bool key tuple", () => {
    expect(
      decodeKeyTuple(abiTypesToSchema(["bool"]), ["0x0000000000000000000000000000000000000000000000000000000000000000"])
    ).toEqual([false]);
    expect(
      decodeKeyTuple(abiTypesToSchema(["bool"]), ["0x0000000000000000000000000000000000000000000000000000000000000001"])
    ).toEqual([true]);
  });

  it("can decode complex key tuple", () => {
    expect(
      decodeKeyTuple(abiTypesToSchema(["uint256", "int32", "bytes16", "address", "bool", "int8"]), [
        "0x000000000000000000000000000000000000000000000000000000000000002a",
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd6",
        "0x1234000000000000000000000000000000000000000000000000000000000000",
        "0x000000000000000000000000ffffffffffffffffffffffffffffffffffffffff",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000000000000000000000000000003",
      ])
    ).toEqual([42n, -42, "0x12340000000000000000000000000000", "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF", true, 3]);
  });
});
