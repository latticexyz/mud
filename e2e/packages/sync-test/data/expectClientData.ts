import { Page, expect } from "@playwright/test";
import { Data } from "./types";
import config from "../../contracts/mud.config";
import { encodeEntity } from "@latticexyz/store-sync/recs";
import { callPageFunction } from "./callPageFunction";

/**
 * Confirms that the client state equals the given state by reading from the client's data store
 */
export async function expectClientData(page: Page, data: Data) {
  for (const [table, records] of Object.entries(data)) {
    for (const record of records) {
      const value = await callPageFunction(page, "getComponentValue", [
        table,
        encodeEntity(config.tables[table].keySchema, record.key),
      ]);
      expect(value).toMatchObject(record.value);
    }
  }
}
