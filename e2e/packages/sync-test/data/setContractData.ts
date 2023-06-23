import { Page } from "@playwright/test";
import { Data, EncodedData } from "./types";
import { encodeTestData } from "./encodeTestData";

/**
 * Writes contract data by calling `world.setRecord` via the client
 */
export async function setContractData(page: Page, data: Data) {
  const encodedData = encodeTestData(data);

  return page.evaluate((_data: EncodedData<Data>) => {
    function stringToBytes16(str: string): Uint8Array {
      if (str.length > 16) throw new Error("string too long");
      return new Uint8Array(16).map((v, i) => str.charCodeAt(i));
    }

    const promises: Promise<unknown>[] = [];
    for (const [table, records] of Object.entries(_data)) {
      for (const record of records) {
        const promise = window["worldSend"]("setRecord(bytes16,bytes16,bytes32[],bytes)", [
          // TODO: add support for multiple namespaces after https://github.com/latticexyz/mud/issues/994 is resolved
          stringToBytes16(""),
          stringToBytes16(table),
          record.key,
          record.value,
        ]);

        // Wait for transactions to be confirmed
        promises.push(promise.then((tx) => tx.wait()));
      }
    }
    return Promise.all(promises);
  }, encodedData);
}
