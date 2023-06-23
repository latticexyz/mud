import { Page, expect } from "@playwright/test";
import { Data } from "./types";
import { readClientStore } from "./readClientStore";
import config from "../../contracts/mud.config";

export async function expectClientData(page: Page, data: Data) {
  for (const [table, records] of Object.entries(data)) {
    for (const record of records) {
      const value = await readClientStore(page, [config.namespace, table, record.key]);
      expect(value).toEqual(record.value);
    }
  }
}
