import { assertType, describe, it } from "vitest";
import { decodeStaticField } from "./decodeStaticField";
import { Hex } from "viem";

describe("decodeStaticField", () => {
  it("returns a boolean for bool ABI type", () => {
    assertType<boolean>(decodeStaticField("bool", "0x"));
  });

  it("returns a number or bigint for uint ABI types", () => {
    assertType<number>(decodeStaticField("uint8", "0x"));
    assertType<number>(decodeStaticField("uint16", "0x"));
    assertType<number>(decodeStaticField("uint32", "0x"));
    assertType<number>(decodeStaticField("uint48", "0x"));
    assertType<bigint>(decodeStaticField("uint56", "0x"));
    assertType<bigint>(decodeStaticField("uint128", "0x"));
    assertType<bigint>(decodeStaticField("uint256", "0x"));
  });

  it("returns a number or bigint for int ABI types", () => {
    assertType<number>(decodeStaticField("int8", "0x"));
    assertType<number>(decodeStaticField("int16", "0x"));
    assertType<number>(decodeStaticField("int32", "0x"));
    assertType<number>(decodeStaticField("int48", "0x"));
    assertType<bigint>(decodeStaticField("int56", "0x"));
    assertType<bigint>(decodeStaticField("int128", "0x"));
    assertType<bigint>(decodeStaticField("int256", "0x"));
  });

  it("returns a hex for bytes ABI types", () => {
    assertType<Hex>(decodeStaticField("bytes1", "0x"));
    assertType<Hex>(decodeStaticField("bytes2", "0x"));
    assertType<Hex>(decodeStaticField("bytes8", "0x"));
    assertType<Hex>(decodeStaticField("bytes32", "0x"));
  });

  it("returns a hex for address ABI type", () => {
    assertType<Hex>(decodeStaticField("address", "0x"));
  });
});
