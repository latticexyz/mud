import { describe, expect, it } from "vitest";
import { encodeLengths } from "./encodeLengths";

describe("encodeLengths", () => {
  it("can encode empty tuple", () => {
    expect(encodeLengths([])).toMatchInlineSnapshot(
      '"0x0000000000000000000000000000000000000000000000000000000000000000"'
    );
  });

  it("can encode bool key tuple", () => {
    expect(encodeLengths(["0x1234", "0x12345678"])).toMatchInlineSnapshot(
      '"0x0000000000000000000000000000000000000004000000000200000000000006"'
    );
  });
});
