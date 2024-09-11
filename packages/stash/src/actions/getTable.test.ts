import { attest } from "@ark/attest";
import { defineTable } from "@latticexyz/store/config/v2";
import { describe, it, expect, vi } from "vitest";
import { createStash } from "../createStash";
import { getTable } from "./getTable";

describe("getTable", () => {
  it("should return a bound table", () => {
    const stash = createStash();
    const table = getTable({
      stash: stash,
      table: defineTable({
        label: "table1",
        namespaceLabel: "namespace1",
        schema: { field1: "uint32", field2: "address" },
        key: ["field1"],
      }),
    });

    attest(stash.get().config).snap({
      namespace1: {
        table1: {
          label: "table1",
          type: "table",
          namespace: "namespace1",
          namespaceLabel: "namespace1",
          name: "table1",
          tableId: "0x74626e616d65737061636531000000007461626c653100000000000000000000",
          schema: {
            field1: { type: "uint32", internalType: "uint32" },
            field2: { type: "address", internalType: "address" },
          },
          key: ["field1"],
        },
      },
    });

    attest(stash.get().records).snap({ namespace1: { table1: {} } });
    expect(table.setRecord).toBeDefined();
    expect(table.getRecord).toBeDefined();
  });

  describe("decodeKey", () => {
    it("should decode an encoded table key", () => {
      const stash = createStash();
      const table = stash.getTable({
        table: defineTable({
          label: "test",
          schema: { field1: "string", field2: "uint32", field3: "uint256" },
          key: ["field2", "field3"],
        }),
      });

      const key = { field2: 1, field3: 2n };
      table.setRecord({ key, value: { field1: "hello" } });

      const encodedKey = table.encodeKey({ key });
      attest<typeof key>(table.decodeKey({ encodedKey })).equals({ field2: 1, field3: 2n });
    });
  });

  describe("deleteRecord", () => {
    it("should throw a type error if an invalid key is provided", () => {
      const stash = createStash();
      const table = stash.getTable({
        table: defineTable({
          label: "test",
          schema: { field1: "string", field2: "uint32", field3: "uint256" },
          key: ["field2", "field3"],
        }),
      });

      attest(() =>
        table.deleteRecord({
          // @ts-expect-error Property 'field3' is missing in type '{ field2: number; }'
          key: { field2: 1 },
        }),
      ).type.errors(`Property 'field3' is missing in type '{ field2: number; }'`);

      attest(() =>
        table.deleteRecord({
          // @ts-expect-error Type 'string' is not assignable to type 'number'
          key: { field2: 1, field3: "invalid" },
        }),
      ).type.errors(`Type 'string' is not assignable to type 'bigint'`);
    });
  });

  describe("encodeKey", () => {
    it("should throw a type error if an invalid key is provided", () => {
      const stash = createStash();
      const table = stash.getTable({
        table: defineTable({
          label: "test",
          schema: { field1: "string", field2: "uint32", field3: "uint256" },
          key: ["field2", "field3"],
        }),
      });

      attest(() =>
        table.encodeKey({
          // @ts-expect-error Property 'field3' is missing in type '{ field2: number; }'
          key: {
            field2: 1,
          },
        }),
      )
        .throws(`Provided key is missing field field3.`)
        .type.errors(`Property 'field3' is missing in type '{ field2: number; }'`);

      attest(
        table.encodeKey({
          key: {
            field2: 1,
            // @ts-expect-error Type 'string' is not assignable to type 'bigint'.
            field3: "invalid",
          },
        }),
      ).type.errors(`Type 'string' is not assignable to type 'bigint'.`);
    });
  });

  describe("getConfig", () => {
    it("should return the config type of the given table", () => {
      const stash = createStash();
      const config = defineTable({
        label: "test",
        schema: { field1: "string", field2: "uint32", field3: "uint256" },
        key: ["field2", "field3"],
      });
      const table = stash.getTable({
        table: config,
      });
      attest<typeof config, ReturnType<typeof table.getTableConfig>>();
    });
  });

  describe("getKeys", () => {
    it("should return the key map of a table", () => {
      const stash = createStash();
      const table = stash.getTable({
        table: defineTable({
          label: "test",
          schema: {
            player: "int32",
            match: "int32",
            x: "int32",
            y: "int32",
          },
          key: ["player", "match"],
        }),
      });

      table.setRecord({ key: { player: 1, match: 2 }, value: { x: 3, y: 4 } });
      table.setRecord({ key: { player: 5, match: 6 }, value: { x: 7, y: 8 } });

      attest<{ [encodedKey: string]: { player: number; match: number } }>(table.getKeys()).snap({
        "1|2": { player: 1, match: 2 },
        "5|6": { player: 5, match: 6 },
      });
    });
  });

  describe("getRecord", () => {
    it("should throw a type error if the key type doesn't match", () => {
      const stash = createStash();
      const table = stash.getTable({
        table: defineTable({
          label: "test",
          schema: { field1: "string", field2: "uint32", field3: "int32" },
          key: ["field2", "field3"],
        }),
      });

      attest(() =>
        table.getRecord({
          // @ts-expect-error Property 'field3' is missing in type '{ field2: number; }'
          key: { field2: 1 },
        }),
      ).type.errors(`Property 'field3' is missing in type '{ field2: number; }'`);

      attest(() =>
        table.getRecord({
          // @ts-expect-error Type 'string' is not assignable to type 'number'
          key: { field2: 1, field3: "invalid" },
        }),
      ).type.errors(`Type 'string' is not assignable to type 'number'`);
    });
  });

  describe("getRecords", () => {
    it("should get all records from a table", () => {
      const config = defineTable({
        label: "test",
        schema: {
          player: "int32",
          match: "int32",
          x: "uint256",
          y: "uint256",
        },
        key: ["player", "match"],
      });
      const stash = createStash();
      const table = stash.getTable({ table: config });

      table.setRecord({ key: { player: 1, match: 2 }, value: { x: 3n, y: 4n } });
      table.setRecord({ key: { player: 5, match: 6 }, value: { x: 7n, y: 8n } });

      attest<{ [encodedKey: string]: { player: number; match: number; x: bigint; y: bigint } }>(
        table.getRecords(),
      ).equals({
        "1|2": { player: 1, match: 2, x: 3n, y: 4n },
        "5|6": { player: 5, match: 6, x: 7n, y: 8n },
      });

      attest<{ [encodedKey: string]: { player: number; match: number; x: bigint; y: bigint } }>(
        table.getRecords({ keys: [{ player: 1, match: 2 }] }),
      ).equals({
        "1|2": { player: 1, match: 2, x: 3n, y: 4n },
      });
    });
  });

  describe("setRecord", () => {
    it("should show a type warning if an invalid table, key or record is used", () => {
      const config = defineTable({
        label: "test",
        schema: {
          field1: "string",
          field2: "uint32",
          field3: "int32",
        },
        key: ["field2", "field3"],
      });
      const stash = createStash();
      const table = stash.getTable({ table: config });

      attest(() =>
        table.setRecord({
          // @ts-expect-error Property 'field2' is missing in type '{ field3: number; }'
          key: { field3: 2 },
          value: { field1: "" },
        }),
      )
        .throws("Provided key is missing field field2.")
        .type.errors(`Property 'field2' is missing in type '{ field3: number; }`);

      attest(() =>
        table.setRecord({
          // @ts-expect-error Type 'string' is not assignable to type 'number'.
          key: { field2: 1, field3: "invalid" },
          value: { field1: "" },
        }),
      ).type.errors(`Type 'string' is not assignable to type 'number'.`);

      attest(() =>
        table.setRecord({
          key: { field2: 1, field3: 2 },
          // @ts-expect-error Type 'number' is not assignable to type 'string'.
          value: { field1: 1 },
        }),
      ).type.errors(`Type 'number' is not assignable to type 'string'.`);
    });
  });

  describe("setRecords", () => {
    it("should show a type warning if an invalid table, key or record is used", () => {
      const config = defineTable({
        label: "test",
        schema: {
          field1: "string",
          field2: "uint32",
          field3: "int32",
        },
        key: ["field2", "field3"],
      });
      const stash = createStash();
      const table = stash.getTable({ table: config });

      attest(() =>
        table.setRecords({
          // @ts-expect-error Type '{ field1: string; }' is missing the following properties from type
          records: [{ field1: "" }],
        }),
      )
        .throws("Provided key is missing field field2.")
        .type.errors(`Type '{ field1: string; }' is missing the following properties from type`);

      attest(() =>
        table.setRecords({
          // @ts-expect-error Type 'number' is not assignable to type 'string'.
          records: [{ field1: 1, field2: 1, field3: 2 }],
        }),
      ).type.errors(`Type 'number' is not assignable to type 'string'.`);
    });
  });

  describe("subscribe", () => {
    it("should notify subscriber of table change", () => {
      const config1 = defineTable({
        label: "table1",
        schema: { a: "address", b: "uint256", c: "uint32" },
        key: ["a"],
      });
      const config2 = defineTable({
        label: "table2",
        schema: { a: "address", b: "uint256", c: "uint32" },
        key: ["a"],
      });
      const stash = createStash();
      const table1 = stash.getTable({ table: config1 });
      const table2 = stash.getTable({ table: config2 });
      const subscriber = vi.fn();

      table1.subscribe({ subscriber });

      table1.setRecord({ key: { a: "0x00" }, value: { b: 1n, c: 2 } });

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenNthCalledWith(1, {
        "0x00": {
          prev: undefined,
          current: { a: "0x00", b: 1n, c: 2 },
        },
      });

      // Expect unrelated updates to not notify subscribers
      table2.setRecord({ key: { a: "0x01" }, value: { b: 1n, c: 2 } });
      expect(subscriber).toHaveBeenCalledTimes(1);

      table1.setRecord({ key: { a: "0x00" }, value: { b: 1n, c: 3 } });

      expect(subscriber).toHaveBeenCalledTimes(2);
      expect(subscriber).toHaveBeenNthCalledWith(2, {
        "0x00": {
          prev: { a: "0x00", b: 1n, c: 2 },
          current: { a: "0x00", b: 1n, c: 3 },
        },
      });
    });
  });
});
