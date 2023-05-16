import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDatabase, createDatabaseClient } from ".";
import { mudConfig } from "@latticexyz/store/register";
import { scan, subscribe } from "./utils";
import { KeyValue } from "./types";

const config = mudConfig({
  tables: {
    MultiKey: { primaryKeys: { first: "bytes32", second: "uint32" }, schema: "int32" },
    Position: { schema: { x: "int32", y: "int32" } },
  },
});

describe("utils", () => {
  let db: ReturnType<typeof createDatabase>;
  let client: ReturnType<typeof createDatabaseClient<typeof config>>;

  beforeEach(() => {
    db = createDatabase();
    client = createDatabaseClient(db, config);
  });

  describe("scan", () => {
    it("should return a list of all database entries", () => {
      const positionUpdates: KeyValue<typeof config, "Position">[] = [
        { key: { key: "0x00" }, value: { x: 1, y: 2 } },
        { key: { key: "0x01" }, value: { x: 2, y: 3 } },
        { key: { key: "0x02" }, value: { x: 3, y: 4 } },
        { key: { key: "0x03" }, value: { x: 4, y: 5 } },
      ];

      const multiKeyUpdates: KeyValue<typeof config, "MultiKey">[] = [
        { key: { first: "0x00", second: 4 }, value: { value: 1 } },
        { key: { first: "0x01", second: 3 }, value: { value: 2 } },
        { key: { first: "0x02", second: 2 }, value: { value: 3 } },
        { key: { first: "0x03", second: 1 }, value: { value: 4 } },
      ];

      // Set values in the tables
      for (const update of positionUpdates) client.tables.Position.set(update.key, update.value);
      for (const update of multiKeyUpdates) client.tables.MultiKey.set(update.key, update.value);

      const rows = scan(config, client._tupleDatabaseClient);

      expect(rows.length).toBe(positionUpdates.length + multiKeyUpdates.length);
      expect(rows).toEqual([
        ...multiKeyUpdates.map((row) => ({ ...row, namespace: config["namespace"], table: "MultiKey" })),
        ...positionUpdates.map((row) => ({ ...row, namespace: config["namespace"], table: "Position" })),
      ]);
    });

    it("should return a list of all entries of the Position table", () => {
      const positionUpdates: KeyValue<typeof config, "Position">[] = [
        { key: { key: "0x00" }, value: { x: 1, y: 2 } },
        { key: { key: "0x01" }, value: { x: 2, y: 3 } },
        { key: { key: "0x02" }, value: { x: 3, y: 4 } },
        { key: { key: "0x03" }, value: { x: 4, y: 5 } },
      ];

      const multiKeyUpdates: KeyValue<typeof config, "MultiKey">[] = [
        { key: { first: "0x00", second: 4 }, value: { value: 1 } },
        { key: { first: "0x01", second: 3 }, value: { value: 2 } },
        { key: { first: "0x02", second: 2 }, value: { value: 3 } },
        { key: { first: "0x03", second: 1 }, value: { value: 4 } },
      ];

      // Set values in the tables
      for (const update of positionUpdates) client.tables.Position.set(update.key, update.value);
      for (const update of multiKeyUpdates) client.tables.MultiKey.set(update.key, update.value);

      const rows = scan(config, client._tupleDatabaseClient, { namespace: "", table: "Position" });

      expect(rows.length).toBe(positionUpdates.length);
      expect(rows).toEqual([
        ...positionUpdates.map((row) => ({ ...row, namespace: config["namespace"], table: "Position" })),
      ]);
    });

    it("should return a list of all entries of the MultiKey table with keys greater than { first: 0x02, second: 0 } and less than { first: 0x03, second: 4 }", () => {
      const positionUpdates: KeyValue<typeof config, "Position">[] = [
        { key: { key: "0x00" }, value: { x: 1, y: 2 } },
        { key: { key: "0x01" }, value: { x: 2, y: 3 } },
        { key: { key: "0x02" }, value: { x: 3, y: 4 } },
        { key: { key: "0x03" }, value: { x: 4, y: 5 } },
      ];

      const multiKeyUpdates: KeyValue<typeof config, "MultiKey">[] = [
        { key: { first: "0x00", second: 1 }, value: { value: 1 } },
        { key: { first: "0x01", second: 2 }, value: { value: 2 } },
        { key: { first: "0x02", second: 3 }, value: { value: 3 } },
        { key: { first: "0x03", second: 4 }, value: { value: 4 } },
      ];

      // Set values in the tables
      for (const update of positionUpdates) client.tables.Position.set(update.key, update.value);
      for (const update of multiKeyUpdates) client.tables.MultiKey.set(update.key, update.value);

      const rows = scan(config, client._tupleDatabaseClient, {
        namespace: "",
        table: "MultiKey",
        key: { gt: { first: "0x02", second: 0 }, lt: { first: "0x03", second: 4 } },
      });

      expect(rows.length).toBe(1);
      expect(rows).toEqual([
        { key: { first: "0x02", second: 3 }, value: { value: 3 }, namespace: "", table: "MultiKey" },
      ]);
    });

    it("should not matter in which order the key is passed in", () => {
      const positionUpdates: KeyValue<typeof config, "Position">[] = [
        { key: { key: "0x00" }, value: { x: 1, y: 2 } },
        { key: { key: "0x01" }, value: { x: 2, y: 3 } },
        { key: { key: "0x02" }, value: { x: 3, y: 4 } },
        { key: { key: "0x03" }, value: { x: 4, y: 5 } },
      ];

      const multiKeyUpdates: KeyValue<typeof config, "MultiKey">[] = [
        { key: { first: "0x00", second: 1 }, value: { value: 1 } },
        { key: { first: "0x01", second: 2 }, value: { value: 2 } },
        { key: { first: "0x02", second: 3 }, value: { value: 3 } },
        { key: { first: "0x03", second: 4 }, value: { value: 4 } },
      ];

      // Set values in the tables
      for (const update of positionUpdates) client.tables.Position.set(update.key, update.value);
      for (const update of multiKeyUpdates) client.tables.MultiKey.set(update.key, update.value);

      const rows = scan(config, client._tupleDatabaseClient, {
        namespace: "",
        table: "MultiKey",
        key: { gt: { second: 0, first: "0x02" }, lt: { first: "0x03", second: 4 } },
      });

      expect(rows.length).toBe(1);
      expect(rows).toEqual([
        { key: { first: "0x02", second: 3 }, value: { value: 3 }, namespace: "", table: "MultiKey" },
      ]);
    });
  });

  describe("subscribe", () => {
    it("should subscribe to all table updates", () => {
      const positionUpdates: KeyValue<typeof config, "Position">[] = [
        { key: { key: "0x00" }, value: { x: 1, y: 2 } },
        { key: { key: "0x01" }, value: { x: 2, y: 3 } },
        { key: { key: "0x02" }, value: { x: 3, y: 4 } },
        { key: { key: "0x03" }, value: { x: 4, y: 5 } },
      ];

      const multiKeyUpdates: KeyValue<typeof config, "MultiKey">[] = [
        { key: { first: "0x00", second: 4 }, value: { value: 1 } },
        { key: { first: "0x01", second: 3 }, value: { value: 2 } },
        { key: { first: "0x02", second: 2 }, value: { value: 3 } },
        { key: { first: "0x03", second: 1 }, value: { value: 4 } },
      ];

      const callback = vi.fn();

      // Subscribe to all updates
      subscribe(config, client._tupleDatabaseClient, callback);

      // Set values in the tables
      for (const update of positionUpdates) client.tables.Position.set(update.key, update.value);
      for (const update of multiKeyUpdates) client.tables.MultiKey.set(update.key, update.value);

      let i = 1;

      // Expect the callback to have been called with all set updates
      for (const update of positionUpdates) {
        expect(callback).toHaveBeenNthCalledWith(i++, [
          { set: [update], remove: [], table: "Position", namespace: "" },
        ]);
      }
      for (const update of multiKeyUpdates) {
        expect(callback).toHaveBeenNthCalledWith(i++, [
          { set: [update], remove: [], table: "MultiKey", namespace: "" },
        ]);
      }

      // Remove all the table entries
      for (const update of positionUpdates) client.tables.Position.remove(update.key);
      for (const update of multiKeyUpdates) client.tables.MultiKey.remove(update.key);

      // Expect the callback to have called with all remove updates
      for (const update of positionUpdates) {
        expect(callback).toHaveBeenNthCalledWith(i++, [
          { set: [], remove: [{ key: update.key }], table: "Position", namespace: "" },
        ]);
      }
      for (const update of multiKeyUpdates) {
        expect(callback).toHaveBeenNthCalledWith(i++, [
          { set: [], remove: [{ key: update.key }], table: "MultiKey", namespace: "" },
        ]);
      }
    });

    it("should subscribe to table updates with multiple writes per transaction", () => {
      const positionUpdates: KeyValue<typeof config, "Position">[] = [
        { key: { key: "0x00" }, value: { x: 1, y: 2 } },
        { key: { key: "0x01" }, value: { x: 2, y: 3 } },
        { key: { key: "0x02" }, value: { x: 3, y: 4 } },
        { key: { key: "0x03" }, value: { x: 4, y: 5 } },
      ];

      const multiKeyUpdates: KeyValue<typeof config, "MultiKey">[] = [
        { key: { first: "0x00", second: 4 }, value: { value: 1 } },
        { key: { first: "0x01", second: 3 }, value: { value: 2 } },
        { key: { first: "0x02", second: 2 }, value: { value: 3 } },
        { key: { first: "0x03", second: 1 }, value: { value: 4 } },
      ];

      const callback = vi.fn();

      // Subscribe to all updates
      subscribe(config, client._tupleDatabaseClient, callback);

      // Set values in the tables
      const tx = client._tupleDatabaseClient.transact();
      for (const update of positionUpdates) client.tables.Position.set(update.key, update.value, { transaction: tx });
      for (const update of multiKeyUpdates) client.tables.MultiKey.set(update.key, update.value, { transaction: tx });
      tx.commit();

      // Expect the callback to have been called with all set updates (in a single transaction)
      expect(callback).toHaveBeenNthCalledWith(1, [
        { set: multiKeyUpdates, remove: [], table: "MultiKey", namespace: "" },
        { set: positionUpdates, remove: [], table: "Position", namespace: "" },
      ]);

      // Remove all the table entries
      const tx2 = client._tupleDatabaseClient.transact();
      for (const update of positionUpdates) client.tables.Position.remove(update.key, { transaction: tx2 });
      for (const update of multiKeyUpdates) client.tables.MultiKey.remove(update.key, { transaction: tx2 });
      tx2.commit();

      // Expect the callback to have called with all remove updates (in a single transaction)
      expect(callback).toHaveBeenNthCalledWith(2, [
        {
          set: [],
          remove: multiKeyUpdates.map(({ key }) => ({ key })),
          table: "MultiKey",
          namespace: "",
        },
        {
          set: [],
          remove: positionUpdates.map(({ key }) => ({ key })),
          table: "Position",
          namespace: "",
        },
      ]);
    });

    // More tests for subscriptions to specific tables are in `createDatabaseClient.test.ts`
  });
});
