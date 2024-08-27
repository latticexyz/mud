import { describe, expect, it } from "vitest";
import { getKeyTuple } from "./getKeyTuple";
import { Table } from "@latticexyz/config";

type PartialTable = Pick<Table, "schema" | "key">;

describe("getKeyTuple", () => {
  it("can encode bool key tuple", () => {
    const table = {
      schema: { id: { type: "bool", internalType: "bool" } },
      key: ["id"],
    } as const satisfies PartialTable;

    expect(getKeyTuple(table, { id: false })).toStrictEqual([
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    ]);
    expect(getKeyTuple(table, { id: true })).toStrictEqual([
      "0x0000000000000000000000000000000000000000000000000000000000000001",
    ]);
  });

  it("can encode complex key tuple", () => {
    const table = {
      schema: {
        a: { type: "uint256", internalType: "uint256" },
        b: { type: "int32", internalType: "int32" },
        c: { type: "bytes16", internalType: "bytes16" },
        d: { type: "address", internalType: "address" },
        e: { type: "bool", internalType: "bool" },
        f: { type: "int8", internalType: "int8" },
      },
      key: ["a", "b", "c", "d", "e", "f"],
    } as const satisfies PartialTable;

    expect(
      getKeyTuple(table, {
        a: 42n,
        b: -42,
        c: "0x12340000000000000000000000000000",
        d: "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF",
        e: true,
        f: 3,
      }),
    ).toStrictEqual([
      "0x000000000000000000000000000000000000000000000000000000000000002a",
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd6",
      "0x1234000000000000000000000000000000000000000000000000000000000000",
      "0x000000000000000000000000ffffffffffffffffffffffffffffffffffffffff",
      "0x0000000000000000000000000000000000000000000000000000000000000001",
      "0x0000000000000000000000000000000000000000000000000000000000000003",
    ]);
  });
});
