import { Page, expect } from "playwright";
import { Data } from "./types";
import config from "../../contracts/mud.config";
import { encodeEntity } from "@latticexyz/store-sync/recs";
import { callPageFunction } from "./callPageFunction";
import { getKeySchema, getSchemaTypes } from "@latticexyz/protocol-parser/internal";

/**
 * Confirms that the client state equals the given state by reading from the client's data store
 */
export async function expectClientData(page: Page, data: Data) {
  for (const [table, records] of Object.entries(data)) {
    for (const record of records) {
      const value = await callPageFunction(page, "getComponentValue", [
        table,
        encodeEntity(getSchemaTypes(getKeySchema(config.tables[table])), record.key),
      ]);
      expect(value).toMatchObject(record.value);
    }
  }
}
