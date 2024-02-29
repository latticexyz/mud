import { describe, it, expectTypeOf } from "vitest";
import { isStaticAbiType, getStaticAbiTypeKeys, getDynamicAbiTypeKeys, resolveSchema } from "./schema";

describe("isStaticAbiType", () => {
  it("should return true if the provided abi type is static, never otherwise", () => {
    expectTypeOf<isStaticAbiType<"address">>().toEqualTypeOf<true>();
    expectTypeOf<isStaticAbiType<"bytes">>().toEqualTypeOf<never>();
  });
});

describe("getStaticAbiTypeKeys", () => {
  it("should return the keys of the schema that have static length ABI types", () => {
    expectTypeOf<getStaticAbiTypeKeys<{ player: "address"; name: "string"; age: "uint256" }>>().toEqualTypeOf<
      "player" | "age"
    >();
  });

  it("should return the keys of the schema that have static types (including user types)", () => {
    expectTypeOf<
      getStaticAbiTypeKeys<
        { player: "address"; name: "CustomDynamicType"; age: "CustomStaticType" },
        { CustomStaticType: "uint256"; CustomDynamicType: "string" }
      >
    >().toEqualTypeOf<"player" | "age">();
  });
});

describe("getDynamicAbiTypeKeys", () => {
  it("should return the keys of the schema that have dynamic (variable length) ABI types", () => {
    expectTypeOf<
      getDynamicAbiTypeKeys<{ player: "address"; name: "string"; age: "uint256" }>
    >().toEqualTypeOf<"name">();
  });

  it("should return the keys of the schema that have dynamic types (including user types)", () => {
    expectTypeOf<
      getDynamicAbiTypeKeys<
        { player: "address"; name: "CustomDynamicType"; age: "CustomStaticType" },
        { CustomStaticType: "uint256"; CustomDynamicType: "string" }
      >
    >().toEqualTypeOf<"name">();
  });
});

describe("resolveSchema", () => {
  it("should map user types to their primitive type", () => {
    const resolvedSchema = resolveSchema({ regular: "uint256", user: "CustomType" }, { CustomType: "bytes32" });
    expectTypeOf<typeof resolvedSchema.regular>().toEqualTypeOf<{ type: "uint256"; internalType: "uint256" }>();
    expectTypeOf<typeof resolvedSchema.user>().toEqualTypeOf<{ type: "bytes32"; internalType: "CustomType" }>();
  });

  it("should throw if a type is not part of the user types nor abi types", () => {
    resolveSchema(
      {
        regular: "uint256",
        // @ts-expect-error Type '"NotACustomType"' is not assignable to type 'AbiType | "CustomType"'.
        user: "NotACustomType",
      },
      { CustomType: "bytes32" }
    );
  });
});
