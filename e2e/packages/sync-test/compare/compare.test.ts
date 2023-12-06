import { describe, expect, it } from "vitest";
import { Hex } from "viem";
import { createIndexerClient } from "@latticexyz/store-sync/indexer-client";
import { indexerUrls, options } from "./config";
import { unwrap } from "@latticexyz/common";
import { StorageAdapterLog } from "@latticexyz/store-sync/src/common";

type Row = { staticData: Hex; dynamicData: Hex; encodedLengths: Hex };
type State = { blockNumber: bigint; rows: Map<string, Row> };

function logToKey(log: StorageAdapterLog): string {
  return `${log.address}/${log.args.tableId}/${log.args.keyTuple.join(":")}`;
}

async function syncToObject(indexerUrl: string): Promise<State> {
  console.log("Fetching from", indexerUrl);
  const state: State = { blockNumber: -1n, rows: new Map() };

  const indexer = createIndexerClient({ url: indexerUrl });
  const result = unwrap(await indexer.getLogs(options));
  console.log("Done fetching snapshot from", indexerUrl);
  state.blockNumber = result.blockNumber;

  for (const log of result.logs) {
    if (log.eventName !== "Store_SetRecord") {
      throw new Error(`[${indexerUrl}]: Snapshots can only include Store_SetRecord logs`);
    }
    const key = logToKey(log);
    const { staticData, dynamicData, encodedLengths } = log.args;
    state.rows.set(key, { staticData, dynamicData, encodedLengths });
  }

  return state;
}

function compare(received: State, expected: State): void {
  expect(received.blockNumber).toBe(expected.blockNumber);
  expect(Object.keys(received.rows).length).toBe(Object.keys(expected.rows).length);
  for (const key of Object.keys(expected.rows)) {
    const expectedValue = expected.rows.get(key);
    const receivedValue = received.rows.get(key);
    expect(receivedValue?.staticData).toBe(expectedValue?.staticData);
    expect(receivedValue?.encodedLengths).toBe(expectedValue?.encodedLengths);
    expect(receivedValue?.dynamicData).toBe(expectedValue?.dynamicData);
  }
}

describe("Compare indexer snapshots", async () => {
  it("snapshots should match", async () => {
    const states = await Promise.all(indexerUrls.map(syncToObject));

    console.log("Comparing states");

    const [first, ...rest] = states;

    // Compare the first state (received) to the last state (expected)
    compare(first, states[states.length - 1]);

    // Compare each state (received) to the first state (expected)
    for (const state of rest) {
      compare(state, first);
    }
  });
});
