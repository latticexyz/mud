import { describe, it } from "vitest";
import { resolveSchema } from "./schema";
import { extendScope, AbiTypeScope } from "./scope";
import { attest } from "@arktype/attest";

describe("resolveSchema", () => {
  it("should map user types to their primitive type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "address" });
    const resolved = resolveSchema({ regular: "uint256", user: "CustomType" }, scope);
    const expected = {
      regular: {
        type: "uint256",
        internalType: "uint256",
      },
      user: {
        type: "address",
        internalType: "CustomType",
      },
    } as const;
    attest<typeof expected>(resolved).type.toString.snap(
      '{ regular: { type: "uint256"; internalType: "uint256"; }; user: { type: "address"; internalType: "CustomType"; }; }',
    );
  });

  it("should throw if a type is not part of the scope", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "address" });
    resolveSchema(
      {
        regular: "uint256",
        // @ts-expect-error Type '"NotACustomType"' is not assignable to type 'AbiType | "CustomType"'.
        user: "NotACustomType",
      },
      scope,
    );
  });
});
