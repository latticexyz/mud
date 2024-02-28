import { describe, it, expectTypeOf } from "vitest";
import { isStaticAbiType, getStaticAbiTypeKeys, getDynamicAbiTypeKeys } from "./schema";

describe("isStaticAbiType", () => {
  it("should return true if the provided abi type is static, never otherwise", () => {
    expectTypeOf<isStaticAbiType<"address">>().toMatchTypeOf<true>();
    expectTypeOf<isStaticAbiType<"bytes">>().toMatchTypeOf<never>();
  });
});

describe("getStaticAbiTypeKeys", () => {
  it("should return the keys of the schema that have static length ABI types", () => {
    expectTypeOf<getStaticAbiTypeKeys<{ player: "address"; name: "string"; age: "uint256" }>>().toMatchTypeOf<
      "player" | "age"
    >();
  });
});

describe("getDynamicAbiTypeKeys", () => {
  it("should return the keys of the schema that have dynamic (variable length) ABI types", () => {
    expectTypeOf<
      getDynamicAbiTypeKeys<{ player: "address"; name: "string"; age: "uint256" }>
    >().toMatchTypeOf<"name">();
  });
});
