import { describe, it, expect } from "vitest";
import { groupLogsByBlockNumber } from "./groupLogsByBlockNumber";

describe("groupLogsByBlockNumber", () => {
  it("groups logs by block number and correctly sorts them", () => {
    const logs = [
      {
        blockNumber: 1n,
        logIndex: 4,
      },
      {
        blockNumber: 5n,
        logIndex: 0,
      },
      {
        blockNumber: 1n,
        logIndex: 0,
      },
      {
        blockNumber: 1n,
        logIndex: 2,
      },
      {
        blockNumber: 3n,
        logIndex: 3,
      },
    ];

    expect(groupLogsByBlockNumber(logs)).toMatchInlineSnapshot(`
      [
        {
          "blockNumber": 1n,
          "logs": [
            {
              "blockNumber": 1n,
              "logIndex": 0,
            },
            {
              "blockNumber": 1n,
              "logIndex": 2,
            },
            {
              "blockNumber": 1n,
              "logIndex": 4,
            },
          ],
        },
        {
          "blockNumber": 3n,
          "logs": [
            {
              "blockNumber": 3n,
              "logIndex": 3,
            },
          ],
        },
        {
          "blockNumber": 5n,
          "logs": [
            {
              "blockNumber": 5n,
              "logIndex": 0,
            },
          ],
        },
      ]
    `);
  });

  it("adds an entry for toBlock if block is not in logs", () => {
    const logs = [
      {
        blockNumber: 1n,
        logIndex: 4,
      },
    ];

    expect(groupLogsByBlockNumber(logs, 2n)).toMatchInlineSnapshot(`
      [
        {
          "blockNumber": 1n,
          "logs": [
            {
              "blockNumber": 1n,
              "logIndex": 4,
            },
          ],
        },
        {
          "blockNumber": 2n,
          "logs": [],
        },
      ]
    `);
  });

  it("does not add an entry for toBlock if block number is in logs", () => {
    const logs = [
      {
        blockNumber: 2n,
        logIndex: 4,
      },
    ];

    expect(groupLogsByBlockNumber(logs, 2n)).toMatchInlineSnapshot(`
      [
        {
          "blockNumber": 2n,
          "logs": [
            {
              "blockNumber": 2n,
              "logIndex": 4,
            },
          ],
        },
      ]
    `);
  });
});
