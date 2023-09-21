import { describe, expect, expectTypeOf, it } from "vitest";
import { parseKeySchema } from "./parseKeySchema";

// TODO: add tests for failing cases (dynamic ABI types)

describe("parseKeySchema", () => {
  it("outputs a key schema for uint8", () => {
    const keySchema = parseKeySchema("uint8");
    expect(keySchema).toStrictEqual({ key: "uint8" });
    expectTypeOf<typeof keySchema>().toEqualTypeOf<Readonly<{ key: "uint8" }>>();
  });

  it("outputs a key schema for bool", () => {
    const keySchema = parseKeySchema("bool");
    expect(keySchema).toStrictEqual({ key: "bool" });
    expectTypeOf<typeof keySchema>().toEqualTypeOf<Readonly<{ key: "bool" }>>();
  });

  it("returns a full key schema", () => {
    const keySchema = parseKeySchema({ x: "uint32", y: "uint32" });
    expect(keySchema).toStrictEqual({ x: "uint32", y: "uint32" });
    expectTypeOf<typeof keySchema>().toEqualTypeOf<Readonly<{ x: "uint32"; y: "uint32" }>>();
  });

  it("defaults key schema when undefined", () => {
    const keySchema = parseKeySchema(undefined);
    expect(keySchema).toStrictEqual({ key: "bytes32" });
    expectTypeOf<typeof keySchema>().toEqualTypeOf<Readonly<{ key: "bytes32" }>>();
  });
});
