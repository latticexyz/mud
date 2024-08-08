import { describe, expect, it } from "vitest";
import { decodeDozerField } from "./decodeDozerField";

describe("decodeDozerField", () => {
  it("should decode numbers to the expected value type", () => {
    expect(decodeDozerField("uint48", "1")).toBe(1);
    expect(decodeDozerField("uint56", "1")).toBe(1n);
  });
});
