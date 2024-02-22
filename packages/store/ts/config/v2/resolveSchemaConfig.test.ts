import { afterAll, beforeAll, describe, it, expectTypeOf } from "vitest";
import {
  resolveSchemaConfig,
  isStaticAbiType,
  isStaticAbiTypeSchema,
  extractStaticAbiKeys,
} from "./resolveSchemaConfig";
import { setup, cleanup } from "@arktype/attest";

// TODO: translate into attest tests
describe("resolveSchemaConfig", () => {
  beforeAll(() => {
    setup();
  });

  afterAll(() => {
    cleanup();
  });

  it("should throw if a parameter is passed that is not a valid AbiType", () => {
    // @ts-expect-error Type '"asdf"' is not assignable to type 'AbiType'.
    resolveSchemaConfig({ notAnAbiType: "asdf" });
  });

  it("should accept a full schema as input and pass it through", () => {
    const validFull = resolveSchemaConfig({ player: "address" } as const);
    expectTypeOf<typeof validFull>().toMatchTypeOf({ player: "address" } as const);
  });

  it("should accept a shorthand schema as input and expand it", () => {
    const validFull = resolveSchemaConfig("address" as const);
    expectTypeOf<typeof validFull>().toMatchTypeOf({ key: "bytes32", value: "address" } as const);
  });
});

describe("isStaticAbiType", () => {
  it("should return true if the provided abi type is static, never otherwise", () => {
    expectTypeOf<isStaticAbiType<"address">>().toMatchTypeOf<true>();
    expectTypeOf<isStaticAbiType<"bytes">>().toMatchTypeOf<never>();
  });
});

describe("isStaticAbiTypeSchema", () => {
  it("should return true if the schema only has static abi types", () => {
    expectTypeOf<isStaticAbiTypeSchema<"address">>().toMatchTypeOf<true>();
    expectTypeOf<isStaticAbiTypeSchema<"bytes">>().toMatchTypeOf<never>();
    expectTypeOf<isStaticAbiTypeSchema<{ x: "uint256" }>>().toMatchTypeOf<true>();
    expectTypeOf<isStaticAbiTypeSchema<{ name: "string" }>>().toMatchTypeOf<never>();
  });
});

describe("extractStaticAbiTypeSchema", () => {
  it("should return a subset of the schema filtered by static ABI types", () => {
    expectTypeOf<extractStaticAbiKeys<{ player: "address"; name: "string" }>>().toMatchTypeOf<"player">();
  });
});
