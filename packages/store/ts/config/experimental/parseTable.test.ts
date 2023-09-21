import { describe, expect, expectTypeOf, it } from "vitest";
import { TableShapeInput, parseTable, tableInputShapeKeys } from "./parseTable";
import { tableIdToHex } from "@latticexyz/common";

describe("tableInputShapeKeys", () => {
  it("contains the same keys as TableShapeInput", () => {
    expectTypeOf<(typeof tableInputShapeKeys)[number]>().toEqualTypeOf<keyof TableShapeInput>();
  });
});

describe("parseTable", () => {
  it("outputs a table from just a schema ABI type", () => {
    const output = parseTable("", "SomeTable", "uint8");

    const expectedOutput = {
      type: "table",
      namespace: "",
      name: "SomeTable",
      tableId: tableIdToHex("", "SomeTable"),
      keySchema: { key: "bytes32" },
      valueSchema: { value: "uint8" },
    } as const;

    expect(output).toStrictEqual(output);
    expectTypeOf(output).toEqualTypeOf(expectedOutput);
    expectTypeOf(output).toMatchTypeOf(expectedOutput);
  });

  it("outputs a table from valueSchema shorthand", () => {
    const output = parseTable("", "SomeTable", { valueSchema: "uint8" });

    const expectedOutput = {
      type: "table",
      namespace: "",
      name: "SomeTable",
      tableId: tableIdToHex("", "SomeTable"),
      keySchema: { key: "bytes32" },
      valueSchema: { value: "uint8" },
    } as const;

    expect(output).toStrictEqual(output);
    expectTypeOf(output).toEqualTypeOf(expectedOutput);
    expectTypeOf(output).toMatchTypeOf(expectedOutput);
  });

  it("outputs a table with undefined keySchema", () => {
    const output = parseTable("", "SomeTable", { keySchema: undefined, valueSchema: "uint8" });

    const expectedOutput = {
      type: "table",
      namespace: "",
      name: "SomeTable",
      tableId: tableIdToHex("", "SomeTable"),
      keySchema: { key: "bytes32" },
      valueSchema: { value: "uint8" },
    } as const;

    expect(output).toStrictEqual(output);
    expectTypeOf(output).toEqualTypeOf(expectedOutput);
    expectTypeOf(output).toMatchTypeOf(expectedOutput);
  });

  it("outputs a table from keySchema shorthand", () => {
    const output = parseTable("", "SomeTable", { keySchema: "bool", valueSchema: "uint8" });

    const expectedOutput = {
      type: "table",
      namespace: "",
      name: "SomeTable",
      tableId: tableIdToHex("", "SomeTable"),
      keySchema: { key: "bool" },
      valueSchema: { value: "uint8" },
    } as const;

    expect(output).toStrictEqual(output);
    expectTypeOf(output).toEqualTypeOf(expectedOutput);
    expectTypeOf(output).toMatchTypeOf(expectedOutput);
  });

  it("outputs a table from keySchema", () => {
    const output = parseTable("", "SomeTable", {
      keySchema: { x: "uint32", y: "uint32" },
      valueSchema: "uint8",
    });

    const expectedOutput = {
      type: "table",
      namespace: "",
      name: "SomeTable",
      tableId: tableIdToHex("", "SomeTable"),
      keySchema: { x: "uint32", y: "uint32" },
      valueSchema: { value: "uint8" },
    } as const;

    expect(output).toStrictEqual(output);
    expectTypeOf(output).toEqualTypeOf(expectedOutput);
    expectTypeOf(output).toMatchTypeOf(expectedOutput);
  });

  it("outputs a table from valueSchema", () => {
    const output = parseTable("", "SomeTable", { valueSchema: { exists: "bool" } });

    const expectedOutput = {
      type: "table",
      namespace: "",
      name: "SomeTable",
      tableId: tableIdToHex("", "SomeTable"),
      keySchema: { key: "bytes32" },
      valueSchema: { exists: "bool" },
    } as const;

    expect(output).toStrictEqual(output);
    expectTypeOf(output).toEqualTypeOf(expectedOutput);
    expectTypeOf(output).toMatchTypeOf(expectedOutput);
  });

  it("outputs a table with a default namespace", () => {
    const output = parseTable("Namespace", "SomeTable", "bytes32");

    const expectedOutput = {
      type: "table",
      namespace: "Namespace",
      name: "SomeTable",
      tableId: tableIdToHex("Namespace", "SomeTable"),
      keySchema: { key: "bytes32" },
      valueSchema: { value: "bytes32" },
    } as const;

    expect(output).toStrictEqual(output);
    expectTypeOf(output).toEqualTypeOf(expectedOutput);
    expectTypeOf(output).toMatchTypeOf(expectedOutput);
  });

  it("outputs a table with a namespace override", () => {
    const output = parseTable("Namespace", "SomeTable", {
      namespace: "CustomNamespace",
      valueSchema: "string",
      // TODO: figure out if we can preserve namespace string literal type without as const requirement
    } as const);

    const expectedOutput = {
      type: "table",
      namespace: "CustomNamespace",
      name: "SomeTable",
      tableId: tableIdToHex("CustomNamespace", "SomeTable"),
      keySchema: { key: "bytes32" },
      valueSchema: { value: "string" },
    } as const;

    expect(output).toStrictEqual(output);
    expectTypeOf(output).toEqualTypeOf(expectedOutput);
    expectTypeOf(output).toMatchTypeOf(expectedOutput);
  });

  it("outputs an offchain table", () => {
    const output = parseTable("", "SomeTable", { offchainOnly: true, valueSchema: "string" });

    const expectedOutput = {
      type: "offchainTable",
      namespace: "",
      name: "SomeTable",
      tableId: tableIdToHex("", "SomeTable"),
      keySchema: { key: "bytes32" },
      valueSchema: { value: "string" },
    } as const;

    expect(output).toStrictEqual(output);
    expectTypeOf(output).toEqualTypeOf(expectedOutput);
    expectTypeOf(output).toMatchTypeOf(expectedOutput);
  });
});
