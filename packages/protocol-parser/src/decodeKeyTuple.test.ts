import { describe, expect, it } from "vitest";
import { decodeKeyTuple } from "./decodeKeyTuple";

describe("decodeKeyTuple", () => {
  it("can decode bool key tuple", () => {
    expect(
      decodeKeyTuple({ staticFields: ["bool"], dynamicFields: [] }, [
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      ])
    ).toStrictEqual([false]);
    expect(
      decodeKeyTuple({ staticFields: ["bool"], dynamicFields: [] }, [
        "0x0000000000000000000000000000000000000000000000000000000000000001",
      ])
    ).toStrictEqual([true]);
  });

  it("can decode complex key tuple", () => {
    expect(
      decodeKeyTuple({ staticFields: ["uint256", "int32", "bytes16", "address", "bool", "int8"], dynamicFields: [] }, [
        "0x000000000000000000000000000000000000000000000000000000000000002a",
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd6",
        "0x1234000000000000000000000000000000000000000000000000000000000000",
        "0x000000000000000000000000ffffffffffffffffffffffffffffffffffffffff",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000000000000000000000000000003",
      ])
    ).toStrictEqual([
      42n,
      -42,
      "0x12340000000000000000000000000000",
      "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF",
      true,
      3,
    ]);
  });
});
