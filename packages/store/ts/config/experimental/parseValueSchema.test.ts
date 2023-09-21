import { describe, expect, expectTypeOf, it } from "vitest";
import { parseValueSchema } from "./parseValueSchema";

describe("parseValueSchema", () => {
  it("outputs a key schema for uint8", () => {
    const output = parseValueSchema("uint8");
    const expectedOutput = { value: "uint8" } as const;
    expect(output).toStrictEqual(output);
    expectTypeOf(output).toEqualTypeOf(expectedOutput);
    expectTypeOf(output).toMatchTypeOf(expectedOutput);
  });

  it("outputs a key schema for string", () => {
    const output = parseValueSchema("string");
    const expectedOutput = { value: "string" } as const;
    expect(output).toStrictEqual(output);
    expectTypeOf(output).toEqualTypeOf(expectedOutput);
    expectTypeOf(output).toMatchTypeOf(expectedOutput);
  });

  it("returns a full value schema", () => {
    const output = parseValueSchema({ x: "uint32", y: "uint32" });
    const expectedOutput = { x: "uint32", y: "uint32" } as const;
    expect(output).toStrictEqual(output);
    expectTypeOf(output).toEqualTypeOf(expectedOutput);
    expectTypeOf(output).toMatchTypeOf(expectedOutput);
  });
});
