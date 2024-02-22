import { afterAll, beforeAll, describe, it, expectTypeOf } from "vitest";
import { setup, cleanup } from "@arktype/attest";
import { resolveStoreConfig } from "./resolveStoreConfig";

// TODO: translate into attest tests
describe("resolveStoreConfig", () => {
  beforeAll(() => {
    setup();
  });

  afterAll(() => {
    cleanup();
  });

  it("should accept a shorthand store config as input and expand it", () => {
    const validFull = resolveStoreConfig({ tables: {} });
    expectTypeOf<typeof validFull>().toMatchTypeOf({ key: "bytes32", value: "address" } as const);
  });
});
