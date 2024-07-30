import { describe, it } from "vitest";
import { defineSchema } from "./schema";
import { Schema } from "./output";
import { extendScope, AbiTypeScope } from "./scope";
import { attest } from "@ark/attest";

describe("resolveSchema", () => {
  it("should map user types to their primitive type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "address" });
    const resolved = defineSchema({ regular: "uint256", user: "CustomType" }, scope);
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

    attest<typeof expected>(resolved).equals(expected).type.toString.snap(`{
	readonly regular: {
		readonly type: "uint256"
		readonly internalType: "uint256"
	}
	readonly user: {
		readonly type: "address"
		readonly internalType: "CustomType"
	}
}`);
  });

  it("should throw if a type is not part of the scope", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "address" });
    attest(() =>
      defineSchema(
        {
          regular: "uint256",
          // @ts-expect-error Type '"NotACustomType"' is not assignable to type 'AbiType | "CustomType"'.
          user: "NotACustomType",
        },
        scope,
      ),
    )
      .throws(`"NotACustomType" is not a valid type in this scope.`)
      .type.errors(`Type '"NotACustomType"' is not assignable to type 'AbiType | "CustomType"'.`);
  });

  it("should extend the output Schema type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "address" });
    const resolved = defineSchema({ regular: "uint256", user: "CustomType" }, scope);
    attest<true, typeof resolved extends Schema ? true : false>();
  });

  it("should map user types to their primitive type", () => {
    const resolved = defineSchema({ coordinate: "int32[2]" });
    const expected = {
      coordinate: {
        type: "int32[]",
        internalType: "int32[2]",
      },
    } as const;

    attest<typeof expected>(resolved).equals(expected).type.toString.snap(`{
	readonly coordinate: {
		readonly type: "int32[]"
		readonly internalType: "int32[2]"
	}
}`);
  });
});
