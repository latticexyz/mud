import { beforeEach, describe, expect, it, vi } from "vitest";
import { BlockEventsToStorageOptions, blockEventsToStorage } from "./blockEventsToStorage";
import storeConfig from "@latticexyz/store/mud.config";

const mockedCallbacks = {
  registerTableSchema: vi.fn<
    Parameters<BlockEventsToStorageOptions["registerTableSchema"]>,
    ReturnType<BlockEventsToStorageOptions["registerTableSchema"]>
  >(),
  registerTableMetadata: vi.fn<
    Parameters<BlockEventsToStorageOptions["registerTableMetadata"]>,
    ReturnType<BlockEventsToStorageOptions["registerTableMetadata"]>
  >(),
  getTableSchema: vi.fn<
    Parameters<BlockEventsToStorageOptions["getTableSchema"]>,
    ReturnType<BlockEventsToStorageOptions["getTableSchema"]>
  >(),
  getTableMetadata: vi.fn<
    Parameters<BlockEventsToStorageOptions["getTableMetadata"]>,
    ReturnType<BlockEventsToStorageOptions["getTableMetadata"]>
  >(),
};

const mockedDecode = blockEventsToStorage<typeof storeConfig>(mockedCallbacks as any as BlockEventsToStorageOptions);

describe("blockEventsToStorage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("call setField with data properly decoded", async () => {
    mockedCallbacks.getTableSchema.mockImplementation(async ({ namespace, name }) => {
      if (namespace === "mudstore" && name === "StoreMetadata") {
        return {
          namespace: "mudstore",
          name: "StoreMetadata",
          schema: {
            keySchema: {
              staticFields: ["bytes32"],
              dynamicFields: [],
            },
            valueSchema: {
              staticFields: [],
              dynamicFields: ["string", "bytes"],
            },
          },
        };
      }

      if (namespace === "" && name === "Inventory") {
        return {
          namespace: "",
          name: "Inventory",
          schema: {
            keySchema: {
              staticFields: ["address", "uint32", "uint32"],
              dynamicFields: [],
            },
            valueSchema: {
              staticFields: ["uint32"],
              dynamicFields: [],
            },
          },
        };
      }
    });

    mockedCallbacks.getTableMetadata.mockImplementation(async ({ namespace, name }) => {
      if (namespace === "" && name === "Inventory") {
        return {
          namespace: "",
          name: "Inventory",
          keyNames: ["owner", "item", "itemVariant"],
          valueNames: ["amount"],
        };
      }
    });

    const operations = await mockedDecode({
      blockNumber: 5448n,
      blockHash: "0x03e962e7402b2ab295b92feac342a132111dd14b0d1fd4d4a0456fdc77981577",
      logs: [
        {
          address: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
          topics: ["0xd01f9f1368f831528fc9fe6442366b2b7d957fbfff3bcf7c24d9ab5fe51f8c46"],
          data: "0x00000000000000000000000000000000496e76656e746f7279000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000796eb990a3f9c431c69149c7a168b91596d87f600000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000040000000800000000000000000000000000000000000000000000000000000000",
          blockHash: "0x03e962e7402b2ab295b92feac342a132111dd14b0d1fd4d4a0456fdc77981577",
          blockNumber: 5448n,
          transactionHash: "0xa6986924609542dc4c2d81c53799d8eab47109ef34ee1e422de595e19ee9bfa4",
          transactionIndex: 0,
          logIndex: 0,
          removed: false,
          args: {
            table: "0x00000000000000000000000000000000496e76656e746f727900000000000000",
            key: [
              "0x000000000000000000000000796eb990a3f9c431c69149c7a168b91596d87f60",
              "0x0000000000000000000000000000000000000000000000000000000000000001",
              "0x0000000000000000000000000000000000000000000000000000000000000001",
            ],
            schemaIndex: 0,
            data: "0x00000008",
          },
          eventName: "StoreSetField",
        },
      ],
    });

    expect(operations).toMatchInlineSnapshot(`
      {
        "blockHash": "0x03e962e7402b2ab295b92feac342a132111dd14b0d1fd4d4a0456fdc77981577",
        "blockNumber": 5448n,
        "operations": [
          {
            "keyTuple": {
              "item": 1,
              "itemVariant": 1,
              "owner": "0x796eb990A3F9C431C69149c7a168b91596D87F60",
            },
            "log": {
              "address": "0x5fbdb2315678afecb367f032d93f642f64180aa3",
              "args": {
                "data": "0x00000008",
                "key": [
                  "0x000000000000000000000000796eb990a3f9c431c69149c7a168b91596d87f60",
                  "0x0000000000000000000000000000000000000000000000000000000000000001",
                  "0x0000000000000000000000000000000000000000000000000000000000000001",
                ],
                "schemaIndex": 0,
                "table": "0x00000000000000000000000000000000496e76656e746f727900000000000000",
              },
              "blockHash": "0x03e962e7402b2ab295b92feac342a132111dd14b0d1fd4d4a0456fdc77981577",
              "blockNumber": 5448n,
              "data": "0x00000000000000000000000000000000496e76656e746f7279000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000796eb990a3f9c431c69149c7a168b91596d87f600000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000040000000800000000000000000000000000000000000000000000000000000000",
              "eventName": "StoreSetField",
              "logIndex": 0,
              "removed": false,
              "topics": [
                "0xd01f9f1368f831528fc9fe6442366b2b7d957fbfff3bcf7c24d9ab5fe51f8c46",
              ],
              "transactionHash": "0xa6986924609542dc4c2d81c53799d8eab47109ef34ee1e422de595e19ee9bfa4",
              "transactionIndex": 0,
            },
            "name": "Inventory",
            "namespace": "",
            "type": "SetField",
            "value": 8,
            "valueName": "amount",
          },
        ],
      }
    `);
  });
});
