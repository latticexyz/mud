import { describe, it } from "vitest";
import { attest } from "@arktype/attest";
import { resolveTableConfig } from "./table";
import { Table } from "./output";
import { AbiTypeScope, extendScope } from "./scope";
import { Hex } from "viem";
import { TABLE_CODEGEN_DEFAULTS } from "./defaults";

describe("resolveTableConfig", () => {
  it("should expand a single ABI type into a key/value schema", () => {
    const table = resolveTableConfig("address");
    const expected = {
      tableId: "0x" as Hex,
      schema: {
        key: {
          type: "bytes32",
          internalType: "bytes32",
        },
        value: {
          type: "address",
          internalType: "address",
        },
      },
      keySchema: {
        key: {
          type: "bytes32",
          internalType: "bytes32",
        },
      },
      valueSchema: {
        value: {
          type: "address",
          internalType: "address",
        },
      },
      primaryKey: ["key"],
      name: "",
      namespace: "",
      codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
      type: "table",
    } as const;

    attest<typeof expected>(table).equals(expected);
  });

  it("should expand a single custom type into a key/value schema", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "address" });
    const table = resolveTableConfig("CustomType", scope);
    const expected = {
      tableId: "0x" as Hex,
      schema: {
        key: {
          type: "bytes32",
          internalType: "bytes32",
        },
        value: {
          type: "address",
          internalType: "CustomType",
        },
      },
      keySchema: {
        key: {
          type: "bytes32",
          internalType: "bytes32",
        },
      },
      valueSchema: {
        value: {
          type: "address",
          internalType: "CustomType",
        },
      },
      primaryKey: ["key"],
      name: "",
      namespace: "",
      codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
      type: "table",
    } as const;

    attest<typeof expected>(table).equals(expected);
  });

  it("should use `key` as single key if it has a static ABI type", () => {
    const table = resolveTableConfig({ key: "address", name: "string", age: "uint256" });
    const expected = {
      tableId: "0x" as Hex,
      schema: {
        key: {
          type: "address",
          internalType: "address",
        },
        name: {
          type: "string",
          internalType: "string",
        },
        age: {
          type: "uint256",
          internalType: "uint256",
        },
      },
      keySchema: {
        key: {
          type: "address",
          internalType: "address",
        },
      },
      valueSchema: {
        name: {
          type: "string",
          internalType: "string",
        },
        age: {
          type: "uint256",
          internalType: "uint256",
        },
      },
      primaryKey: ["key"],
      name: "",
      namespace: "",
      codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
      type: "table",
    } as const;

    attest<typeof expected>(table).equals(expected);
  });

  it("should use `key` as single key if it has a static custom type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "uint256" });
    const table = resolveTableConfig({ key: "CustomType", name: "string", age: "uint256" }, scope);
    const expected = {
      tableId: "0x" as Hex,
      schema: {
        key: {
          type: "uint256",
          internalType: "CustomType",
        },
        name: {
          type: "string",
          internalType: "string",
        },
        age: {
          type: "uint256",
          internalType: "uint256",
        },
      },
      keySchema: {
        key: {
          type: "uint256",
          internalType: "CustomType",
        },
      },
      valueSchema: {
        name: {
          type: "string",
          internalType: "string",
        },
        age: {
          type: "uint256",
          internalType: "uint256",
        },
      },
      primaryKey: ["key"],
      name: "",
      namespace: "",
      codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
      type: "table",
    } as const;

    attest<typeof expected>(table);
  });

  it("should throw if the shorthand key is a dynamic ABI type", () => {
    // @ts-expect-error Invalid schema. Expected a `key` field with a static ABI type or an explicit `primaryKey` option.
    attest(() => resolveTableConfig({ key: "string", name: "string", age: "uint256" })).throwsAndHasTypeError(
      "Invalid schema. Expected a `key` field with a static ABI type or an explicit `primaryKey` option.",
    );
  });

  it("should throw if the shorthand key is a dyamic custom type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "bytes" });
    // @ts-expect-error Invalid schema. Expected a `key` field with a static ABI type or an explicit `primaryKey` option.
    attest(() => resolveTableConfig({ key: "CustomType" }, scope)).throwsAndHasTypeError(
      "Invalid schema. Expected a `key` field with a static ABI type or an explicit `primaryKey` option.",
    );
  });

  it("should throw if the shorthand key is neither a custom nor ABI type", () => {
    // @ts-expect-error Argument of type '"NotAnAbiType"' is not assignable to parameter of type 'AbiType'
    attest(() => resolveTableConfig("NotAnAbiType"))
      .throws("Invalid ABI type. `NotAnAbiType` not found in scope.")
      .type.errors(`Argument of type '"NotAnAbiType"' is not assignable to parameter of type 'AbiType'`);
  });

  it("should throw if the shorthand doesn't include a key field", () => {
    // @ts-expect-error Invalid schema. Expected a `key` field with a static ABI type or an explicit `primaryKey` option.
    attest(() => resolveTableConfig({ name: "string", age: "uint256" })).throwsAndHasTypeError(
      "Invalid schema. Expected a `key` field with a static ABI type or an explicit `primaryKey` option.",
    );
  });

  it("should return the full config given a full config with one key", () => {
    const table = resolveTableConfig({
      schema: { key: "address", name: "string", age: "uint256" },
      primaryKey: ["age"],
    });
    const expected = {
      tableId: "0x" as Hex,
      schema: {
        key: { type: "address", internalType: "address" },
        name: { type: "string", internalType: "string" },
        age: { type: "uint256", internalType: "uint256" },
      },
      keySchema: {
        age: { type: "uint256", internalType: "uint256" },
      },
      valueSchema: {
        key: { type: "address", internalType: "address" },
        name: { type: "string", internalType: "string" },
      },
      primaryKey: ["age"],
      name: "",
      namespace: "",
      codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
      type: "table",
    } as const;

    attest<typeof expected>(table).equals(expected);
  });

  it("should return the full config given a full config with two primaryKey", () => {
    const table = resolveTableConfig({
      schema: { key: "address", name: "string", age: "uint256" },
      primaryKey: ["age", "key"],
    });
    const expected = {
      tableId: "0x" as Hex,
      schema: {
        key: { type: "address", internalType: "address" },
        name: { type: "string", internalType: "string" },
        age: { type: "uint256", internalType: "uint256" },
      },
      keySchema: {
        age: { type: "uint256", internalType: "uint256" },
        key: { type: "address", internalType: "address" },
      },
      valueSchema: {
        name: { type: "string", internalType: "string" },
      },
      primaryKey: ["age", "key"],
      name: "",
      namespace: "",
      codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
      type: "table",
    } as const;

    attest<typeof expected>(table).equals(expected);
  });

  it("should return the full config given a config with custom types as values", () => {
    const scope = extendScope(AbiTypeScope, { CustomString: "string", CustomNumber: "uint256" });
    const table = resolveTableConfig({ key: "address", name: "CustomString", age: "CustomNumber" }, scope);
    const expected = {
      tableId: "0x" as Hex,
      schema: {
        key: {
          type: "address",
          internalType: "address",
        },
        name: {
          type: "string",
          internalType: "CustomString",
        },
        age: {
          type: "uint256",
          internalType: "CustomNumber",
        },
      },
      keySchema: {
        key: {
          type: "address",
          internalType: "address",
        },
      },
      valueSchema: {
        name: {
          type: "string",
          internalType: "CustomString",
        },
        age: {
          type: "uint256",
          internalType: "CustomNumber",
        },
      },
      primaryKey: ["key"],
      name: "",
      namespace: "",
      codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
      type: "table",
    } as const;

    attest<typeof expected>(table).equals(expected);
  });

  it("should return the full config given a config with custom type as key", () => {
    const scope = extendScope(AbiTypeScope, { CustomString: "string", CustomNumber: "uint256" });
    const table = resolveTableConfig({ key: "CustomNumber", name: "CustomString", age: "CustomNumber" }, scope);
    const expected = {
      tableId: "0x" as Hex,
      schema: {
        key: {
          type: "uint256",
          internalType: "CustomNumber",
        },
        name: {
          type: "string",
          internalType: "CustomString",
        },
        age: {
          type: "uint256",
          internalType: "CustomNumber",
        },
      },
      keySchema: {
        key: {
          type: "uint256",
          internalType: "CustomNumber",
        },
      },
      valueSchema: {
        name: {
          type: "string",
          internalType: "CustomString",
        },
        age: {
          type: "uint256",
          internalType: "CustomNumber",
        },
      },
      primaryKey: ["key"],
      name: "",
      namespace: "",
      codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
      type: "table",
    } as const;

    attest<typeof expected>(table).equals(expected);
  });

  it("should throw if the provided key is a dynamic ABI type", () => {
    attest(() =>
      resolveTableConfig({
        schema: { key: "address", name: "string", age: "uint256" },
        // @ts-expect-error Type '"name"' is not assignable to type '"key" | "age"'
        primaryKey: ["name"],
      }),
    )
      .throws('Invalid primary key. Expected `("key" | "age")[]`, received `["name"]`')
      .type.errors(`Type '"name"' is not assignable to type '"key" | "age"'`);
  });

  it("should throw if the provided key is a dynamic ABI type if user types are provided", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "string" });
    attest(() =>
      resolveTableConfig(
        {
          schema: { key: "address", name: "string", age: "uint256" },
          // @ts-expect-error Type '"name"' is not assignable to type '"key" | "age"'
          primaryKey: ["name"],
        },
        scope,
      ),
    )
      .throws('Invalid primary key. Expected `("key" | "age")[]`, received `["name"]`')
      .type.errors(`Type '"name"' is not assignable to type '"key" | "age"'`);
  });

  it("should throw if the provided key is a dynamic custom type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "string" });
    attest(() =>
      resolveTableConfig(
        {
          schema: { key: "CustomType", name: "string", age: "uint256" },
          // @ts-expect-error Type '"key"' is not assignable to type '"age"'
          primaryKey: ["key"],
        },
        scope,
      ),
    )
      .throws('Invalid primary key. Expected `("age")[]`, received `["key"]`')
      .type.errors(`Type '"key"' is not assignable to type '"age"'`);
  });

  it("should throw if the provided key is neither a custom nor ABI type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "string" });
    attest(() =>
      resolveTableConfig(
        {
          schema: { key: "address", name: "string", age: "uint256" },
          // @ts-expect-error Type '"NotAKey"' is not assignable to type '"key" | "age"'
          primaryKey: ["NotAKey"],
        },
        scope,
      ),
    )
      .throws('Invalid primary key. Expected `("key" | "age")[]`, received `["NotAKey"]`')
      .type.errors(`Type '"NotAKey"' is not assignable to type '"key" | "age"'`);
  });

  it("should extend the output Table type", () => {
    const scope = extendScope(AbiTypeScope, { CustomString: "string", CustomNumber: "uint256" });
    const table = resolveTableConfig({ key: "CustomNumber", name: "CustomString", age: "CustomNumber" }, scope);
    attest<true, typeof table extends Table ? true : false>();
  });
});
