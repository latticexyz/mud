import { assertType, describe, it } from "vitest";
import { decodeValue } from "./decodeValue";
import { Hex } from "viem";

describe("decodeValue", () => {
  it("returns a boolean for bool ABI type", () => {
    assertType<boolean>(decodeValue("bool", "0x00"));
  });

  it("returns a number or bigint for uint ABI types", () => {
    assertType<number>(decodeValue("uint8", "0x00"));
    assertType<number>(decodeValue("uint16", "0x00"));
    assertType<number>(decodeValue("uint32", "0x00"));
    assertType<number>(decodeValue("uint48", "0x00"));
    assertType<bigint>(decodeValue("uint56", "0x00"));
    assertType<bigint>(decodeValue("uint128", "0x00"));
    assertType<bigint>(decodeValue("uint256", "0x00"));
  });

  it("returns a number or bigint for int ABI types", () => {
    assertType<number>(decodeValue("int8", "0x00"));
    assertType<number>(decodeValue("int16", "0x00"));
    assertType<number>(decodeValue("int32", "0x00"));
    assertType<number>(decodeValue("int48", "0x00"));
    assertType<bigint>(decodeValue("int56", "0x00"));
    assertType<bigint>(decodeValue("int128", "0x00"));
    assertType<bigint>(decodeValue("int256", "0x00"));
  });

  it("returns a hex for bytes ABI types", () => {
    assertType<Hex>(decodeValue("bytes1", "0x00"));
    assertType<Hex>(decodeValue("bytes2", "0x0000"));
    assertType<Hex>(decodeValue("bytes8", "0x0000000000000000"));
    assertType<Hex>(decodeValue("bytes32", "0x0000000000000000000000000000000000000000000000000000000000000000"));
    assertType<Hex>(decodeValue("bytes", "0x00"));
  });

  it("returns a string for string ABI type", () => {
    assertType<string>(decodeValue("string", "0x00"));
  });

  it("returns a hex for address ABI type", () => {
    assertType<Hex>(decodeValue("address", "0x00"));
  });
});
