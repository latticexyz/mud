import { assertType, describe, it } from "vitest";
import { decodeValue } from "./decodeValue";

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
});
