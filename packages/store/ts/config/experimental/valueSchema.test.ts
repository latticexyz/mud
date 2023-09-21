import { describe, expect, expectTypeOf, it } from "vitest";
import { parseValueSchema } from "./valueSchema";

describe("parseValueSchema", () => {
  it("outputs a key schema for uint8", () => {
    const valueSchema = parseValueSchema("uint8");
    expect(valueSchema).toStrictEqual({ value: "uint8" });
    expectTypeOf<typeof valueSchema>().toEqualTypeOf<Readonly<{ value: "uint8" }>>();
  });

  it("outputs a key schema for string", () => {
    const valueSchema = parseValueSchema("string");
    expect(valueSchema).toStrictEqual({ value: "string" });
    expectTypeOf<typeof valueSchema>().toEqualTypeOf<Readonly<{ value: "string" }>>();
  });

  it("returns a full value schema", () => {
    const valueSchema = parseValueSchema({ x: "uint32", y: "uint32" });
    expect(valueSchema).toStrictEqual({ x: "uint32", y: "uint32" });
    expectTypeOf<typeof valueSchema>().toEqualTypeOf<Readonly<{ x: "uint32"; y: "uint32" }>>();
  });
});
