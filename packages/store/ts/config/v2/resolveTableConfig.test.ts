import { afterAll, beforeAll, describe, it, expectTypeOf } from "vitest";
import { resolveTableConfig } from "./resolveTableConfig";
import { setup, cleanup } from "@arktype/attest";

// TODO: translate into attest tests
describe("resolveTableConfig", () => {
  beforeAll(() => {
    setup();
  });

  afterAll(() => {
    cleanup();
  });

  it("should return an error if the provided keys don't match", () => {
    const invalid = resolveTableConfig({ schema: { player: "address", score: "uint256" }, keys: ["x"] } as const);
    expectTypeOf<typeof invalid>().toEqualTypeOf<"Error: keys must be a subset of schema">();
  });

  it("should separate key and value schema", () => {
    const valid = resolveTableConfig({ schema: { player: "address", score: "uint256" }, keys: ["player"] } as const);
    expectTypeOf<typeof valid.keySchema>().toMatchTypeOf({ player: "address" } as const);
    expectTypeOf<typeof valid.valueSchema>().toMatchTypeOf({ score: "uint256" } as const);
    expectTypeOf<typeof valid.schema>().toMatchTypeOf({ score: "uint256", player: "address" } as const);
    expectTypeOf<typeof valid.keys>().toMatchTypeOf(["player"] as const);
  });
});
