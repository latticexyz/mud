import { describe, expect, it } from "vitest";
import { decodeValue } from "./decodeValue";

describe("decodeValue", () => {
  it("can decode a bool", () => {
    expect(decodeValue("bool", "0x00")).toEqual(false);
    expect(decodeValue("bool", "0x01")).toEqual(true);

    // TODO: these feel like edge cases and trimming padding may get tricky with other types, decide if we shouldn't allow for parsing these values
    expect(decodeValue("bool", "0x0")).toEqual(false);
    expect(decodeValue("bool", "0x1")).toEqual(true);
    expect(decodeValue("bool", "0x000")).toEqual(false);
    expect(decodeValue("bool", "0x001")).toEqual(true);
    expect(decodeValue("bool", "0x0000")).toEqual(false);
    expect(decodeValue("bool", "0x0001")).toEqual(true);
  });
});
