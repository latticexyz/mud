/* eslint-disable max-len */
import { describe, it, expect } from "vitest";
import { defineTable } from "@latticexyz/store/internal";
import { logToRecord } from "./logToRecord";

describe("logToRecord", () => {
  it("should convert a Store_SetRecord log into a decoded table record", async () => {
    const table = defineTable({
      label: "Test",
      schema: {
        key1: "uint32",
        key2: "uint256",
        value1: "address",
        value2: "string",
      },
      key: ["key1", "key2"],
    });

    const record = {
      key1: 1,
      key2: 2n,
      value1: "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c",
      value2: "hello",
    } as const;

    const log = {
      address: "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c",
      args: {
        dynamicData: "0x68656c6c6f",
        encodedLengths: "0x0000000000000000000000000000000000000000000000000500000000000005",
        keyTuple: [
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          "0x0000000000000000000000000000000000000000000000000000000000000002",
        ],
        staticData: "0x3aa5ebb10dc797cac828524e59a333d0a371443c",
        tableId: "0x7462000000000000000000000000000054657374000000000000000000000000",
      },
      eventName: "Store_SetRecord",
    } as const;

    expect(logToRecord({ table, log })).toStrictEqual(record);
  });
});
