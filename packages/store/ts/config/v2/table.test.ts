import { afterAll, beforeAll, describe, it, expectTypeOf } from "vitest";
import { resolveTableConfig, resolveTableShorthandConfig, NoStaticKeyFieldError } from "./table";
import { setup, cleanup } from "@arktype/attest";

// TODO: translate into attest tests
describe("resolveTableConfig", () => {
  beforeAll(() => {
    setup();
  });

  afterAll(() => {
    cleanup();
  });
});

//   it("should return an error if the provided keys don't match", () => {
//     const invalid = resolveTableConfig({ schema: { player: "address", score: "uint256" }, keys: ["x"] } as const);
//     expectTypeOf<typeof invalid>().toEqualTypeOf<ErrorInvalidKeys<{ expected: "player" | "score"; received: "x" }>>();
//   });

//   it("should return an error if a field with non-static ABI type is used as key", () => {
//     const invalid = resolveTableConfig({ schema: { player: "address", name: "string" }, keys: ["name"] } as const);
//     expectTypeOf<typeof invalid>().toEqualTypeOf<{ expected: "player"; received: "x" }>();
//   });

//   it("should expand a shorthand table input", () => {
//     const valid = resolveTableConfig("address");
//     expectTypeOf<typeof valid.keySchema>().toMatchTypeOf({ key: "bytes32" } as const);
//     expectTypeOf<typeof valid.valueSchema>().toMatchTypeOf({} as const);
//     expectTypeOf<typeof valid.schema>().toMatchTypeOf({ key: "bytes32", value: "address" } as const);
//     expectTypeOf<typeof valid.keys>().toMatchTypeOf(["key"] as const);
//   });

//   it("should create an empty key schema if no keys array is passed", () => {
//     const valid = resolveTableConfig({ schema: { player: "address", score: "uint256" }, keys: [] } as const);
//     expectTypeOf<typeof valid.keySchema>().toMatchTypeOf({} as const);
//     expectTypeOf<typeof valid.valueSchema>().toMatchTypeOf({ player: "address", score: "uint256" } as const);
//     expectTypeOf<typeof valid.schema>().toMatchTypeOf({ player: "address", score: "uint256" } as const);
//     expectTypeOf<typeof valid.keys>().toMatchTypeOf([] as const);
//   });

//   it("should resolve the table config if it is not passed as const", () => {
//     const valid = resolveTableConfig({ schema: { player: "address", score: "uint256" }, keys: ["player"] });
//     expectTypeOf<typeof valid.keySchema>().toMatchTypeOf({ player: "address" } as const);
//     expectTypeOf<typeof valid.valueSchema>().toMatchTypeOf({ score: "uint256" } as const);
//     expectTypeOf<typeof valid.schema>().toMatchTypeOf({ score: "uint256", player: "address" } as const);
//     expectTypeOf<typeof valid.keys>().toMatchTypeOf(["player"] as const);
//   });

//   it("should resolve the table config if it is not passed as const", () => {
//     const valid = resolveTableConfig({ schema: { player: "address", score: "uint256" }, keys: ["player"] } as const);
//     expectTypeOf<typeof valid.keySchema>().toMatchTypeOf({ player: "address" } as const);
//     expectTypeOf<typeof valid.valueSchema>().toMatchTypeOf({ score: "uint256" } as const);
//     expectTypeOf<typeof valid.schema>().toMatchTypeOf({ score: "uint256", player: "address" } as const);
//     expectTypeOf<typeof valid.keys>().toMatchTypeOf(["player"] as const);
//   });
// });

describe("resolveTableShorthandConfig", () => {
  it("should expand a single ABI type into a key/value schema", () => {
    const config = resolveTableShorthandConfig("address");
    expectTypeOf<typeof config.schema>().toEqualTypeOf<{ key: "bytes32"; value: "address" }>();
    expectTypeOf<typeof config.keys>().toEqualTypeOf<["key"]>();
  });

  it("given a schema with a key field with static ABI type, it should use `key` as single key", () => {
    const config = resolveTableShorthandConfig({ key: "address", name: "string", age: "uint256" });
    expectTypeOf<typeof config.schema>().toEqualTypeOf<{ key: "address"; name: "string"; age: "uint256" }>();
    expectTypeOf<typeof config.keys>().toEqualTypeOf<["key"]>();
  });

  it("throw an error if the shorthand doesn't include a key field", () => {
    const config = resolveTableShorthandConfig({ name: "string", age: "uint256" });
    expectTypeOf<typeof config>().toEqualTypeOf<NoStaticKeyFieldError>();
  });

  it("throw an error if the shorthand config includes a non-static key field", () => {
    const config = resolveTableShorthandConfig({ key: "string", name: "string", age: "uint256" });
    expectTypeOf<typeof config>().toEqualTypeOf<NoStaticKeyFieldError>();
  });
});
