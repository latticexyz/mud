import { describe, it, expect } from "vitest";
import { logSort } from "./logSort";

describe("logSort", () => {
  it("sorts logs", () => {
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
      {
        blockNumber: null,
        logIndex: null,
      },
      {
        // both values should be null for pending blocks,
        // but we'll include this as a test case anyway
        blockNumber: 3n,
        logIndex: null,
      },
      {
        // both values should be null for pending blocks,
        // but we'll include this as a test case anyway
        blockNumber: null,
        logIndex: 1,
      },
    ];

    logs.sort(logSort);

    expect(logs).toMatchInlineSnapshot(`
      [
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
        {
          "blockNumber": 3n,
          "logIndex": 3,
        },
        {
          "blockNumber": 3n,
          "logIndex": null,
        },
        {
          "blockNumber": 5n,
          "logIndex": 0,
        },
        {
          "blockNumber": null,
          "logIndex": 1,
        },
        {
          "blockNumber": null,
          "logIndex": null,
        },
      ]
    `);
  });
});
