import { assertType, describe, it } from "vitest";
import { decodeDynamicField } from "./decodeDynamicField";
import { Hex } from "viem";

describe("decodeDynamicField", () => {
  it("returns a boolean array for bool[] ABI type", () => {
    assertType<boolean[]>(decodeDynamicField("bool[]", "0x"));
  });

  it("returns a number array or bigint array for uint[] ABI types", () => {
    assertType<number[]>(decodeDynamicField("uint8[]", "0x"));
    assertType<number[]>(decodeDynamicField("uint16[]", "0x"));
    assertType<number[]>(decodeDynamicField("uint32[]", "0x"));
    assertType<number[]>(decodeDynamicField("uint48[]", "0x"));
    assertType<bigint[]>(decodeDynamicField("uint56[]", "0x"));
    assertType<bigint[]>(decodeDynamicField("uint128[]", "0x"));
    assertType<bigint[]>(decodeDynamicField("uint256[]", "0x"));
  });

  it("returns a number array or bigint array for int[] ABI types", () => {
    assertType<number[]>(decodeDynamicField("int8[]", "0x"));
    assertType<number[]>(decodeDynamicField("int16[]", "0x"));
    assertType<number[]>(decodeDynamicField("int32[]", "0x"));
    assertType<number[]>(decodeDynamicField("int48[]", "0x"));
    assertType<bigint[]>(decodeDynamicField("int56[]", "0x"));
    assertType<bigint[]>(decodeDynamicField("int128[]", "0x"));
    assertType<bigint[]>(decodeDynamicField("int256[]", "0x"));
  });

  it("returns a hex array for bytes[] ABI types", () => {
    assertType<Hex[]>(decodeDynamicField("bytes1[]", "0x"));
    assertType<Hex[]>(decodeDynamicField("bytes2[]", "0x"));
    assertType<Hex[]>(decodeDynamicField("bytes8[]", "0x"));
    assertType<Hex[]>(decodeDynamicField("bytes32[]", "0x"));
  });

  it("returns a hex array for address ABI type", () => {
    assertType<Hex[]>(decodeDynamicField("address[]", "0x"));
  });

  it("returns a hex for bytes ABI type", () => {
    assertType<Hex>(decodeDynamicField("bytes", "0x"));
  });

  it("returns a string for string ABI type", () => {
    assertType<string>(decodeDynamicField("string", "0x"));
  });
});
