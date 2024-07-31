import { describe, expect, it } from "vitest";
import { fetchRecordsDozerSql } from "./fetchRecordsDozerSql";
import mudConfig from "@latticexyz/world/mud.config";
import { selectFrom } from "./selectFrom";

describe("fetch dozer sql", () => {
  // TODO: set up CI test case for this (requires setting up dozer in CI)
  it("should fetch dozer sql", async () => {
    const result = await fetchRecordsDozerSql({
      dozerUrl: "https://redstone2.dozer.skystrife.xyz/q",
      storeAddress: "0x9d05cc196c87104a7196fcca41280729b505dbbf",
      queries: [
        selectFrom({ table: mudConfig.tables.world__Balances, where: '"balance" > 0', limit: 2 }),
        selectFrom({ table: mudConfig.tables.world__FunctionSignatures, limit: 10 }),
      ],
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "blockHeight": 4909521n,
        "result": [
          {
            "records": [
              {
                "balance": 308500000000000000n,
                "namespaceId": "0x6e73000000000000000000000000000000000000000000000000000000000000",
              },
            ],
            "table": {
              "codegen": {
                "dataStruct": false,
                "outputDirectory": "tables",
                "storeArgument": false,
                "tableIdArgument": false,
              },
              "deploy": {
                "disabled": false,
              },
              "key": [
                "namespaceId",
              ],
              "label": "Balances",
              "name": "Balances",
              "namespace": "world",
              "schema": {
                "balance": {
                  "internalType": "uint256",
                  "type": "uint256",
                },
                "namespaceId": {
                  "internalType": "ResourceId",
                  "type": "bytes32",
                },
              },
              "tableId": "0x7462776f726c6400000000000000000042616c616e6365730000000000000000",
              "type": "table",
            },
          },
          {
            "records": [
              {
                "functionSelector": "0x0560912900000000000000000000000000000000000000000000000000000000",
                "functionSignature": "unregisterStoreHook(bytes32,address)",
              },
              {
                "functionSelector": "0x0ba51f4900000000000000000000000000000000000000000000000000000000",
                "functionSignature": "registerTable(bytes32,bytes32,bytes32,bytes32,string[],string[])",
              },
              {
                "functionSelector": "0x127de47a00000000000000000000000000000000000000000000000000000000",
                "functionSignature": "createMatch(string,bytes32,bytes32,bytes32)",
              },
              {
                "functionSelector": "0x17902d6100000000000000000000000000000000000000000000000000000000",
                "functionSignature": "createMatchSeasonPass(string,bytes32,bytes32,bytes32,bytes32,uint256,uint256[],bool)",
              },
              {
                "functionSelector": "0x1b9a91a400000000000000000000000000000000000000000000000000000000",
                "functionSignature": "withdrawEth(address,uint256)",
              },
              {
                "functionSelector": "0x1d2257ba00000000000000000000000000000000000000000000000000000000",
                "functionSignature": "registerDelegation(address,bytes32,bytes)",
              },
              {
                "functionSelector": "0x1fc595cd00000000000000000000000000000000000000000000000000000000",
                "functionSignature": "setOfficial(bytes32,bool)",
              },
              {
                "functionSelector": "0x219adc2e00000000000000000000000000000000000000000000000000000000",
                "functionSignature": "renounceOwnership(bytes32)",
              },
              {
                "functionSelector": "0x220ca1f600000000000000000000000000000000000000000000000000000000",
                "functionSignature": "toggleReady(bytes32)",
              },
              {
                "functionSelector": "0x231bb4cd00000000000000000000000000000000000000000000000000000000",
                "functionSignature": "createNewSeasonPass(bytes14,uint256,uint256,uint256,uint256,uint256,uint256,uint256)",
              },
            ],
            "table": {
              "codegen": {
                "dataStruct": false,
                "outputDirectory": "tables",
                "storeArgument": false,
                "tableIdArgument": false,
              },
              "deploy": {
                "disabled": false,
              },
              "key": [
                "functionSelector",
              ],
              "label": "FunctionSignatures",
              "name": "FunctionSignatur",
              "namespace": "world",
              "schema": {
                "functionSelector": {
                  "internalType": "bytes4",
                  "type": "bytes4",
                },
                "functionSignature": {
                  "internalType": "string",
                  "type": "string",
                },
              },
              "tableId": "0x6f74776f726c6400000000000000000046756e6374696f6e5369676e61747572",
              "type": "offchainTable",
            },
          },
        ],
      }
    `);
  });
});
