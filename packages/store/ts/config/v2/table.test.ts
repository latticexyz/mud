import { attest } from "@arktype/attest";
import { describe, it } from "vitest";
import { getStaticAbiTypeKeys, AbiTypeScope, extendScope } from "./scope";
import { validateKeys, defineTable } from "./table";
import { TABLE_CODEGEN_DEFAULTS, TABLE_DEPLOY_DEFAULTS } from "./defaults";
import { resourceToHex } from "@latticexyz/common";
import { getKeySchema, getValueSchema } from "@latticexyz/protocol-parser/internal";

describe("validateKeys", () => {
  it("should return a tuple of valid keys", () => {
    attest<
      readonly ["static"],
      validateKeys<getStaticAbiTypeKeys<{ static: "uint256"; dynamic: "string" }, AbiTypeScope>, ["static"]>
    >();
  });

  it("should return a tuple of valid keys with an extended scope", () => {
    const scope = extendScope(AbiTypeScope, { static: "address", dynamic: "string" });

    attest<
      readonly ["static", "customStatic"],
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
      readonly ["static", "customStatic"],
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
      key: ["age"],
      name: "",
      namespace: "",
      codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
      type: "table",
      deploy: TABLE_DEPLOY_DEFAULTS,
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
      key: ["age", "id"],
      name: "",
      namespace: "",
      codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
      type: "table",
      deploy: TABLE_DEPLOY_DEFAULTS,
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
      key: ["age"],
      name: "",
      namespace: "",
      codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
      type: "table",
      deploy: TABLE_DEPLOY_DEFAULTS,
    } as const;

    attest<typeof expected>(table).equals(expected);
  });

  it("should pass through deploy config", () => {
    const table = defineTable({
      schema: { id: "address" },
      key: ["id"],
      name: "",
      deploy: { disabled: true },
    });

    const expected = { disabled: true } as const;

    attest<typeof expected>(table.deploy).equals(expected);
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

  it("should throw if no key is provided", () => {
    attest(() =>
      // @ts-expect-error Property 'key' is missing in type
      defineTable({
        schema: { id: "address" },
        name: "",
      }),
    )
      .throws('Invalid key. Expected `("id")[]`, received `undefined')
      .type.errors("Property 'key' is missing in type");
  });

  it("should throw if a string is provided as key", () => {
    attest(() =>
      defineTable({
        schema: { id: "address" },
        // @ts-expect-error Type 'string' is not assignable to type 'readonly string[]'
        key: "",
        name: "",
      }),
    )
      .throws('Invalid key. Expected `("id")[]`, received ``')
      .type.errors("Type 'string' is not assignable to type 'readonly string[]'");
  });

  it("should throw if a string is provided as schema", () => {
    attest(() =>
      defineTable({
        // @ts-expect-error Type 'string' is not assignable to type 'SchemaInput'.
        schema: "uint256",
        key: [],
        name: "",
      }),
    )
      .throws('Error: Expected schema, received "uint256"')
      .type.errors("Type 'string' is not assignable to type 'SchemaInput'.");
  });

  it("should throw if an unknown key is provided", () => {
    attest(() =>
      defineTable({
        schema: { id: "address" },
        key: ["id"],
        name: "",
        // @ts-expect-error Key `keySchema` does not exist in TableInput
        keySchema: { id: "address" },
      }),
    ).type.errors("Key `keySchema` does not exist in TableInput ");
  });
});

// TODO: move tests to protocol parser after we add arktype
describe("getKeySchema", () => {
  it("should return the fields of the schema that are part of the key", () => {
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
      age: {
        type: "uint256",
        internalType: "uint256",
      },
    } as const;

    attest<typeof expected>(getKeySchema(table)).equals(expected);
  });
});

// TODO: move tests to protocol parser after we add arktype
describe("getValueSchema", () => {
  it("should return the fields of the schema that are not part of the key", () => {
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
      id: {
        type: "address",
        internalType: "Static",
      },
      name: {
        type: "string",
        internalType: "Dynamic",
      },
    } as const;

    attest<typeof expected>(getValueSchema(table)).equals(expected);
  });
});
