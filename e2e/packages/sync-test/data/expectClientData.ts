import { Page, expect } from "@playwright/test";
import { Data } from "./types";
import configV2 from "../../contracts/mud.config";
import { encodeEntity } from "@latticexyz/store-sync/recs";
import { callPageFunction } from "./callPageFunction";
import { worldToV1 } from "@latticexyz/world/config/v2";

const config = worldToV1(configV2);

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
