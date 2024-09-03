import { describe, expect, it } from "vitest";
import { decodeField } from "./decodeField";

describe("decodeDozerField", () => {
  it("should decode numbers to the expected value type", () => {
    expect(decodeField("uint48", "1")).toBe(1);
    expect(decodeField("uint56", "1")).toBe(1n);
  });
});
