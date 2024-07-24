import { describe, expect, it } from "vitest";
import { decodeDozerRecord } from "./decodeDozerRecord";
import { defineStore } from "@latticexyz/store/config/v2";

describe("decodeDozerRecord", () => {
  const TestTable = defineStore({
    namespace: "store",
    tables: {
      TestTable: {
        schema: {
          address: "address",
          uint256: "uint256",
          uint32: "uint32",
          bool: "bool",
          bytes: "bytes",
          string: "string",
          uint32Arr: "uint32[]",
        },
        key: [],
      },
    },
  }).tables.store__TestTable;

  it("decodes dozer record", () => {
    const dozerRecord = [
      "0x0000000000000000000000000000000000000000",
      "1234",
      "1234",
      true,
      "0x1234",
      "hello world",
      ["1234", "5678"],
    ];
    const decodedRecord = {
      address: "0x0000000000000000000000000000000000000000",
      uint256: 1234n,
      uint32: 1234,
      bool: true,
      bytes: "0x1234",
      string: "hello world",
      uint32Arr: [1234, 5678],
    };

    const decoded = decodeDozerRecord({ table: TestTable, records: [dozerRecord] });
    expect(decoded).toStrictEqual({ records: [decodedRecord] });
  });
});
