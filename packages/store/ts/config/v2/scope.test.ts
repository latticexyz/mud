import { attest } from "@arktype/attest";
import { describe, it } from "vitest";
import { EmptyScope, ScopeOptions, extendScope } from "./scope";

describe("extendScope", () => {
  it("should extend the provided scope", () => {
    const extendedScope = extendScope(EmptyScope, { static: "uint256", dynamic: "string" });
    attest<ScopeOptions<{ static: "uint256" }, { static: "uint256"; dynamic: "string" }>>(
      extendedScope
    ).type.toString.snap(
      '{ staticTypes: { static: "uint256"; }; allTypes: { static: "uint256"; dynamic: "string"; }; }'
    );

    const furtherExtendedScope = extendScope(extendedScope, { static2: "uint256", dynamic2: "string" });
    attest<
      ScopeOptions<
        { static: "uint256"; static2: "uint256" },
        { static: "uint256"; dynamic: "string"; static2: "uint256"; dynamic2: "string" }
      >
    >(furtherExtendedScope).type.toString.snap(
      '{ staticTypes: { static: "uint256"; static2: "uint256"; }; allTypes: { static: "uint256"; dynamic: "string"; static2: "uint256"; dynamic2: "string"; }; }'
    );
  });
});
