import { attest } from "@arktype/attest";
import { describe, it } from "vitest";
import { getStaticAbiTypeKeys, AbiTypeScope, extendScope } from "./scope";
import { resolveTable, validateKeys } from "./table";
import { Hex } from "viem";
import { TABLE_CODEGEN_DEFAULTS } from "./defaults";

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
    const table = resolveTable({
      schema: { id: "address", name: "string", age: "uint256" },
      key: ["age"],
      name: "",
    });

    const expected = {
      tableId: "0x" as Hex,
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
    const table = resolveTable({
      schema: { id: "address", name: "string", age: "uint256" },
      key: ["age", "id"],
      name: "",
    });
    const expected = {
      tableId: "0x" as Hex,
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
});
