import { attest } from "@ark/attest";
import { describe, it } from "vitest";
import { AbiTypeScope, Scope, ScopeOptions, extendScope, getStaticAbiTypeKeys } from "./scope";

describe("extendScope", () => {
  it("should extend the provided scope", () => {
    const extendedScope = extendScope(Scope, { static: "uint256", dynamic: "string" });
    attest<ScopeOptions<{ static: "uint256"; dynamic: "string" }>>(extendedScope).type.toString.snap(
      '{ types: { static: "uint256"; dynamic: "string" } }',
    );

    const furtherExtendedScope = extendScope(extendedScope, { static2: "uint256", dynamic2: "string" });
    attest<ScopeOptions<{ static: "uint256"; dynamic: "string"; static2: "uint256"; dynamic2: "string" }>>(
      furtherExtendedScope,
    ).type.toString.snap(`{
  types: {
    static: "uint256"
    dynamic: "string"
    static2: "uint256"
    dynamic2: "string"
  }
}`);
  });
});

describe("getStaticAbiTypeKeys", () => {
  it("returns only static keys", () => {
    attest<
      "static" | "otherStatic",
      getStaticAbiTypeKeys<{ static: "uint256"; otherStatic: "address"; dynamic: "string" }>
    >();
  });

  it("returns only static keys with a scope", () => {
    const extendedScope = extendScope(AbiTypeScope, { static: "uint256", dynamic: "string" });
    attest<
      "static" | "customStatic",
      getStaticAbiTypeKeys<
        { static: "uint256"; dynamic: "string"; customStatic: "static"; customDynamic: "dynamic" },
        typeof extendedScope
      >
    >();
  });
});
