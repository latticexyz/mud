import { afterAll, beforeAll, describe, it, expectTypeOf } from "vitest";
import { isStaticAbiType, getStaticAbiTypeKeys } from "./schema";
import { setup, cleanup } from "@arktype/attest";

// TODO: translate into attest tests
describe("schema", () => {
  beforeAll(() => {
    setup();
  });

  afterAll(() => {
    cleanup();
  });
});

describe("isStaticAbiType", () => {
  it("should return true if the provided abi type is static, never otherwise", () => {
    expectTypeOf<isStaticAbiType<"address">>().toMatchTypeOf<true>();
    expectTypeOf<isStaticAbiType<"bytes">>().toMatchTypeOf<never>();
  });
});

describe("getStaticAbiTypeKeys", () => {
  it("should return the keys of the schema that have static ABI types", () => {
    expectTypeOf<getStaticAbiTypeKeys<{ player: "address"; name: "string"; age: "uint256" }>>().toMatchTypeOf<
      "player" | "age"
    >();
  });
});
