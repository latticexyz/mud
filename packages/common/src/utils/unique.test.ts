import { describe, expect, it } from "vitest";
import { unique } from "./unique";

describe("unique", () => {
  it("should return unique values", () => {
    expect(unique([1, 2, 1, 4, 3, 2])).toMatchInlineSnapshot(`
      [
        1,
        2,
        4,
        3,
      ]
    `);
  });
});
