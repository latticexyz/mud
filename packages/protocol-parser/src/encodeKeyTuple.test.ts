import { describe, expect, it } from "vitest";
import { encodeKeyTuple } from "./encodeKeyTuple";

describe("encodeKeyTuple", () => {
  it("can encode bool key tuple", () => {
    expect(encodeKeyTuple({ staticFields: ["bool"], dynamicFields: [] }, [false])).toStrictEqual([
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    ]);
    expect(
      encodeKeyTuple(
        {
          staticFields: ["bool"],
          dynamicFields: [],
        },
        [true]
      )
    ).toStrictEqual(["0x0000000000000000000000000000000000000000000000000000000000000001"]);
  });

  it("can encode complex key tuple", () => {
    expect(
      encodeKeyTuple({ staticFields: ["uint256", "int32", "bytes16", "address", "bool", "int8"], dynamicFields: [] }, [
        42n,
        -42,
        "0x12340000000000000000000000000000",
        "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF",
        true,
        3,
      ])
    ).toStrictEqual([
      "0x000000000000000000000000000000000000000000000000000000000000002a",
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd6",
      "0x1234000000000000000000000000000000000000000000000000000000000000",
      "0x000000000000000000000000ffffffffffffffffffffffffffffffffffffffff",
      "0x0000000000000000000000000000000000000000000000000000000000000001",
      "0x0000000000000000000000000000000000000000000000000000000000000003",
    ]);
  });
});
