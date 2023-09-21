import { describe, expect, expectTypeOf, it } from "vitest";
import { TableShapeInput, parseTable, tableInputShapeKeys } from "./table";
import { tableIdToHex } from "@latticexyz/common";

describe("tableInputShapeKeys", () => {
  it("contains the same keys as TableShapeInput", () => {
    expectTypeOf<(typeof tableInputShapeKeys)[number]>().toEqualTypeOf<keyof TableShapeInput>();
  });
});

describe("parseTable", () => {
  it("outputs a table from just a schema ABI type", () => {
    const table = parseTable("", "SomeTable", "uint8");

    expect(table).toStrictEqual({
      type: "table",
      namespace: "",
      name: "SomeTable",
      tableId: tableIdToHex("", "SomeTable"),
      keySchema: { key: "bytes32" },
      valueSchema: { value: "uint8" },
    });

    expectTypeOf<typeof table>().toEqualTypeOf<
      Readonly<{
        type: "table";
        namespace: "";
        name: "SomeTable";
        tableId: `0x${string}`;
        keySchema: Readonly<{ key: "bytes32" }>;
        valueSchema: Readonly<{ value: "uint8" }>;
      }>
    >();
  });

  it("outputs a table from valueSchema shorthand", () => {
    const table = parseTable("", "SomeTable", { valueSchema: "uint8" } as const);

    expect(table).toStrictEqual({
      type: "table",
      namespace: "",
      name: "SomeTable",
      tableId: tableIdToHex("", "SomeTable"),
      keySchema: { key: "bytes32" },
      valueSchema: { value: "uint8" },
    });

    expectTypeOf<typeof table>().toEqualTypeOf<
      Readonly<{
        type: "table";
        namespace: "";
        name: "SomeTable";
        tableId: `0x${string}`;
        keySchema: Readonly<{ key: "bytes32" }>;
        valueSchema: Readonly<{ value: "uint8" }>;
      }>
    >();
  });

  it("outputs a table with undefined keySchema", () => {
    const table = parseTable("", "SomeTable", { keySchema: undefined, valueSchema: "uint8" } as const);

    expect(table).toStrictEqual({
      type: "table",
      namespace: "",
      name: "SomeTable",
      tableId: tableIdToHex("", "SomeTable"),
      keySchema: { key: "bytes32" },
      valueSchema: { value: "uint8" },
    });

    expectTypeOf<typeof table>().toEqualTypeOf<
      Readonly<{
        type: "table";
        namespace: "";
        name: "SomeTable";
        tableId: `0x${string}`;
        keySchema: Readonly<{ key: "bytes32" }>;
        valueSchema: Readonly<{ value: "uint8" }>;
      }>
    >();
  });

  it("outputs a table from keySchema shorthand", () => {
    const table = parseTable("", "SomeTable", { keySchema: "bool", valueSchema: "uint8" } as const);

    expect(table).toStrictEqual({
      type: "table",
      namespace: "",
      name: "SomeTable",
      tableId: tableIdToHex("", "SomeTable"),
      keySchema: { key: "bool" },
      valueSchema: { value: "uint8" },
    });

    expectTypeOf<typeof table>().toEqualTypeOf<
      Readonly<{
        type: "table";
        namespace: "";
        name: "SomeTable";
        tableId: `0x${string}`;
        keySchema: Readonly<{ key: "bool" }>;
        valueSchema: Readonly<{ value: "uint8" }>;
      }>
    >();
  });

  it("outputs a table from keySchema", () => {
    const table = parseTable("", "SomeTable", {
      keySchema: { x: "uint32", y: "uint32" },
      valueSchema: "uint8",
    } as const);

    expect(table).toStrictEqual({
      type: "table",
      namespace: "",
      name: "SomeTable",
      tableId: tableIdToHex("", "SomeTable"),
      keySchema: { x: "uint32", y: "uint32" },
      valueSchema: { value: "uint8" },
    });

    expectTypeOf<typeof table>().toEqualTypeOf<
      Readonly<{
        type: "table";
        namespace: "";
        name: "SomeTable";
        tableId: `0x${string}`;
        keySchema: Readonly<{ x: "uint32"; y: "uint32" }>;
        valueSchema: Readonly<{ value: "uint8" }>;
      }>
    >();
  });

  it("outputs a table from valueSchema", () => {
    const table = parseTable("", "SomeTable", { valueSchema: { exists: "bool" } } as const);

    expect(table).toStrictEqual({
      type: "table",
      namespace: "",
      name: "SomeTable",
      tableId: tableIdToHex("", "SomeTable"),
      keySchema: { key: "bytes32" },
      valueSchema: { exists: "bool" },
    });

    expectTypeOf<typeof table>().toEqualTypeOf<
      Readonly<{
        type: "table";
        namespace: "";
        name: "SomeTable";
        tableId: `0x${string}`;
        keySchema: Readonly<{ key: "bytes32" }>;
        valueSchema: Readonly<{ exists: "bool" }>;
      }>
    >();
  });

  it("outputs a table with a default namespace", () => {
    const table = parseTable("Namespace", "SomeTable", "bytes32");

    expect(table).toStrictEqual({
      type: "table",
      namespace: "Namespace",
      name: "SomeTable",
      tableId: tableIdToHex("Namespace", "SomeTable"),
      keySchema: { key: "bytes32" },
      valueSchema: { value: "bytes32" },
    });

    expectTypeOf<typeof table>().toEqualTypeOf<
      Readonly<{
        type: "table";
        namespace: "Namespace";
        name: "SomeTable";
        tableId: `0x${string}`;
        keySchema: Readonly<{ key: "bytes32" }>;
        valueSchema: Readonly<{ value: "bytes32" }>;
      }>
    >();
  });

  it("outputs a table with a namespace override", () => {
    const table = parseTable("Namespace", "SomeTable", {
      namespace: "CustomNamespace",
      valueSchema: "string",
    } as const);

    expect(table).toStrictEqual({
      type: "table",
      namespace: "CustomNamespace",
      name: "SomeTable",
      tableId: tableIdToHex("CustomNamespace", "SomeTable"),
      keySchema: { key: "bytes32" },
      valueSchema: { value: "string" },
    });

    expectTypeOf<typeof table>().toEqualTypeOf<
      Readonly<{
        type: "table";
        namespace: "CustomNamespace";
        name: "SomeTable";
        tableId: `0x${string}`;
        keySchema: Readonly<{ key: "bytes32" }>;
        valueSchema: Readonly<{ value: "string" }>;
      }>
    >();
  });

  it("outputs an offchain table", () => {
    const table = parseTable("", "SomeTable", { offchainOnly: true, valueSchema: "string" } as const);

    expect(table).toStrictEqual({
      type: "offchainTable",
      namespace: "",
      name: "SomeTable",
      tableId: tableIdToHex("", "SomeTable"),
      keySchema: { key: "bytes32" },
      valueSchema: { value: "string" },
    });

    expectTypeOf<typeof table>().toEqualTypeOf<
      Readonly<{
        type: "offchainTable";
        namespace: "";
        name: "SomeTable";
        tableId: `0x${string}`;
        keySchema: Readonly<{ key: "bytes32" }>;
        valueSchema: Readonly<{ value: "string" }>;
      }>
    >();
  });
});
