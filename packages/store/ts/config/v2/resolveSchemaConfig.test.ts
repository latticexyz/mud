import { afterAll, beforeAll, describe, it, expectTypeOf } from "vitest";
import { resolveSchemaConfig } from "./resolveSchemaConfig";
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
    expectTypeOf<typeof validFull>().toMatchTypeOf({ key: "address" } as const);
  });
});
