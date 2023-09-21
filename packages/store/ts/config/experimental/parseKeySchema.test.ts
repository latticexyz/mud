import { describe, expect, expectTypeOf, it } from "vitest";
import { parseKeySchema } from "./parseKeySchema";

// TODO: add tests for failing cases (dynamic ABI types)

describe("parseKeySchema", () => {
  it("outputs a key schema for uint8", () => {
    const output = parseKeySchema("uint8");
    const expectedOutput = { key: "uint8" } as const;
    expect(output).toStrictEqual(output);
    expectTypeOf(output).toEqualTypeOf(expectedOutput);
    expectTypeOf(output).toMatchTypeOf(expectedOutput);
  });

  it("outputs a key schema for bool", () => {
    const output = parseKeySchema("bool");
    const expectedOutput = { key: "bool" } as const;
    expect(output).toStrictEqual(output);
    expectTypeOf(output).toEqualTypeOf(expectedOutput);
    expectTypeOf(output).toMatchTypeOf(expectedOutput);
  });

  it("returns a full key schema", () => {
    const output = parseKeySchema({ x: "uint32", y: "uint32" });
    const expectedOutput = { x: "uint32", y: "uint32" } as const;
    expect(output).toStrictEqual(output);
    expectTypeOf(output).toEqualTypeOf(expectedOutput);
    expectTypeOf(output).toMatchTypeOf(expectedOutput);
  });

  it("defaults key schema when undefined", () => {
    const output = parseKeySchema(undefined);
    const expectedOutput = { key: "bytes32" } as const;
    expect(output).toStrictEqual(output);
    expectTypeOf(output).toEqualTypeOf(expectedOutput);
    expectTypeOf(output).toMatchTypeOf(expectedOutput);
  });
});
