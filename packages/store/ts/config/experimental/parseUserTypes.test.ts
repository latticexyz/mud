import { describe, expect, expectTypeOf, it } from "vitest";
import { parseUserTypes } from "./parseUserTypes";

describe("parseKeySchema", () => {
  it("defaults user types when undefined", () => {
    const output = parseUserTypes(undefined);
    const expectedOutput = {} as const;
    expect(output).toStrictEqual(expectedOutput);
    expectTypeOf(output).toEqualTypeOf(expectedOutput);
    expectTypeOf(output).toMatchTypeOf(expectedOutput);
  });
});
