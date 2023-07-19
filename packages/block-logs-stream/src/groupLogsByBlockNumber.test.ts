import { describe, it, expect } from "vitest";
import { groupLogsByBlockNumber } from "./groupLogsByBlockNumber";
import { Log } from "viem";

describe("groupLogsByBlockNumber", () => {
  it("groups logs by block number and correctly sorts them", () => {
    const logs = [
      {
        blockNumber: 1n,
        blockHash: "0x",
        logIndex: 4,
        transactionHash: "0x",
        transactionIndex: 0,
      },
      {
        blockNumber: 5n,
        blockHash: "0x",
        logIndex: 0,
        transactionHash: "0x",
        transactionIndex: 0,
      },
      {
        blockNumber: 1n,
        blockHash: "0x",
        logIndex: 0,
        transactionHash: "0x",
        transactionIndex: 0,
      },
      {
        blockNumber: 1n,
        blockHash: "0x",
        logIndex: 2,
        transactionHash: "0x",
        transactionIndex: 0,
      },
      {
        blockNumber: null,
        blockHash: null,
        logIndex: null,
        transactionHash: null,
        transactionIndex: null,
      },
      {
        blockNumber: 3n,
        blockHash: "0x",
        logIndex: 3,
        transactionHash: "0x",
        transactionIndex: 0,
      },
    ] as any as Log[];

    expect(groupLogsByBlockNumber(logs)).toMatchInlineSnapshot(`
      [
        {
          "blockNumber": 1n,
          "logs": [
            {
              "blockHash": "0x",
              "blockNumber": 1n,
              "logIndex": 0,
              "transactionHash": "0x",
              "transactionIndex": 0,
            },
            {
              "blockHash": "0x",
              "blockNumber": 1n,
              "logIndex": 2,
              "transactionHash": "0x",
              "transactionIndex": 0,
            },
            {
              "blockHash": "0x",
              "blockNumber": 1n,
              "logIndex": 4,
              "transactionHash": "0x",
              "transactionIndex": 0,
            },
          ],
        },
        {
          "blockNumber": 3n,
          "logs": [
            {
              "blockHash": "0x",
              "blockNumber": 3n,
              "logIndex": 3,
              "transactionHash": "0x",
              "transactionIndex": 0,
            },
          ],
        },
        {
          "blockNumber": 5n,
          "logs": [
            {
              "blockHash": "0x",
              "blockNumber": 5n,
              "logIndex": 0,
              "transactionHash": "0x",
              "transactionIndex": 0,
            },
          ],
        },
      ]
    `);
  });
});
