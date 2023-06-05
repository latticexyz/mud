import { assertType, describe, it } from "vitest";
import { decodeValue } from "./decodeValue";

describe("decodeValue", () => {
  it("returns a boolean for bool ABI type", () => {
    assertType<boolean>(decodeValue("bool", "0x00"));
  });
});
