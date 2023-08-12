import { Page, expect } from "@playwright/test";
import { Data } from "./types";
import config from "../../contracts/mud.config";
import { readComponentValue } from "./readComponentValue";
import { encodeEntity } from "@latticexyz/store-sync/recs";

/**
 * Confirms that the client state equals the given state by reading from the client's data store
 */
export async function expectClientData(page: Page, data: Data) {
  for (const [table, records] of Object.entries(data)) {
    for (const record of records) {
      const value = await readComponentValue(page, table, encodeEntity(config.tables[table].keySchema, record.key));
      expect(value).toEqual(record.value);
    }
  }
}
