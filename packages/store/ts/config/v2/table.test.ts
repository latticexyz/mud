import { attest } from "@arktype/attest";
import { describe, it } from "vitest";
import { getStaticAbiTypeKeys, AbiTypeScope, extendScope } from "./scope";
import { validateKeys, defineTable } from "./table";
import { TABLE_CODEGEN_DEFAULTS } from "./defaults";
import { resourceToHex } from "@latticexyz/common";

describe("validateKeys", () => {
  it("should return a tuple of valid keys", () => {
    attest<
      ["static"],
      validateKeys<getStaticAbiTypeKeys<{ static: "uint256"; dynamic: "string" }, AbiTypeScope>, ["static"]>
    >();
  });

  it("should return a tuple of valid keys with an extended scope", () => {
    const scope = extendScope(AbiTypeScope, { static: "address", dynamic: "string" });

    attest<
      ["static", "customStatic"],
      validateKeys<
        getStaticAbiTypeKeys<
          { static: "uint256"; dynamic: "string"; customStatic: "static"; customDynamic: "dynamic" },
          typeof scope
        >,
        ["static", "customStatic"]
      >
    >();
  });

  it("should return a tuple of valid keys with an extended scope", () => {
    const scope = extendScope(AbiTypeScope, { static: "address", dynamic: "string" });

    attest<
      ["static", "customStatic"],
      validateKeys<
        getStaticAbiTypeKeys<
          { static: "uint256"; dynamic: "string"; customStatic: "static"; customDynamic: "dynamic" },
          typeof scope
        >,
        ["static", "customStatic"]
      >
    >();
  });
});

describe("resolveTable", () => {
  it("should return the full config given a full config with one key", () => {
    const table = defineTable({
      schema: { id: "address", name: "string", age: "uint256" },
      key: ["age"],
      name: "",
    });

    const expected = {
      tableId: resourceToHex({ type: "table", namespace: "", name: "" }),
      schema: {
        id: { type: "address", internalType: "address" },
        name: { type: "string", internalType: "string" },
        age: { type: "uint256", internalType: "uint256" },
      },
      keySchema: {
        age: { type: "uint256", internalType: "uint256" },
      },
      valueSchema: {
        id: { type: "address", internalType: "address" },
        name: { type: "string", internalType: "string" },
      },
      key: ["age"],
      name: "",
      namespace: "",
      codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
      type: "table",
    } as const;

    attest<typeof expected>(table).equals(expected);
  });

  it("should return the full config given a full config with two key", () => {
    const table = defineTable({
      schema: { id: "address", name: "string", age: "uint256" },
      key: ["age", "id"],
      name: "",
    });
    const expected = {
      tableId: resourceToHex({ type: "table", namespace: "", name: "" }),
      schema: {
        id: { type: "address", internalType: "address" },
        name: { type: "string", internalType: "string" },
        age: { type: "uint256", internalType: "uint256" },
      },
      keySchema: {
        age: { type: "uint256", internalType: "uint256" },
        id: { type: "address", internalType: "address" },
      },
      valueSchema: {
        name: { type: "string", internalType: "string" },
      },
      key: ["age", "id"],
      name: "",
      namespace: "",
      codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
      type: "table",
    } as const;

    attest<typeof expected>(table).equals(expected);
  });

  it("should return the full config given a full config with custom type", () => {
    const scope = extendScope(AbiTypeScope, { Static: "address", Dynamic: "string" });

    const table = defineTable(
      {
        schema: { id: "Static", name: "Dynamic", age: "uint256" },
        key: ["age"],
        name: "",
      },
      scope,
    );

    const expected = {
      tableId: resourceToHex({ type: "table", namespace: "", name: "" }),
      schema: {
        id: { type: "address", internalType: "Static" },
        name: { type: "string", internalType: "Dynamic" },
        age: { type: "uint256", internalType: "uint256" },
      },
      keySchema: {
        age: { type: "uint256", internalType: "uint256" },
      },
      valueSchema: {
        id: { type: "address", internalType: "Static" },
        name: { type: "string", internalType: "Dynamic" },
      },
      key: ["age"],
      name: "",
      namespace: "",
      codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
      type: "table",
    } as const;

    attest<typeof expected>(table).equals(expected);
  });

  it("should throw if the provided key is a dynamic ABI type", () => {
    attest(() =>
      defineTable({
        schema: { id: "address", name: "string", age: "uint256" },
        // @ts-expect-error Type '"name"' is not assignable to type '"id" | "age"'
        key: ["name"],
        name: "",
      }),
    )
      .throws('Invalid key. Expected `("id" | "age")[]`, received `["name"]`')
      .type.errors(`Type '"name"' is not assignable to type '"id" | "age"'`);
  });

  it("should throw if the provided key is a dynamic ABI type if user types are provided", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "string" });
    attest(() =>
      defineTable(
        {
          schema: { id: "address", name: "string", age: "uint256" },
          // @ts-expect-error Type '"name"' is not assignable to type '"id" | "age"'
          key: ["name"],
          name: "",
        },
        scope,
      ),
    )
      .throws('Invalid key. Expected `("id" | "age")[]`, received `["name"]`')
      .type.errors(`Type '"name"' is not assignable to type '"id" | "age"'`);
  });

  it("should throw if the provided key is a dynamic custom type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "string" });
    attest(() =>
      defineTable(
        {
          schema: { id: "CustomType", name: "string", age: "uint256" },
          // @ts-expect-error Type '"id"' is not assignable to type '"age"'
          key: ["id"],
          name: "",
        },
        scope,
      ),
    )
      .throws('Invalid key. Expected `("age")[]`, received `["id"]`')
      .type.errors(`Type '"id"' is not assignable to type '"age"'`);
  });

  it("should throw if the provided key is neither a custom nor ABI type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "string" });
    attest(() =>
      defineTable(
        {
          schema: { id: "address", name: "string", age: "uint256" },
          // @ts-expect-error Type '"NotAKey"' is not assignable to type '"id" | "age"'
          key: ["NotAKey"],
          name: "",
        },
        scope,
      ),
    )
      .throws('Invalid key. Expected `("id" | "age")[]`, received `["NotAKey"]`')
      .type.errors(`Type '"NotAKey"' is not assignable to type '"id" | "age"'`);
  });
});
