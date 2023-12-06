import { describe, expect, it } from "vitest";
import { Hex } from "viem";
import { createIndexerClient } from "@latticexyz/store-sync/indexer-client";
import { IndexerConfig, indexerUrls, options } from "./config";
import { unwrap } from "@latticexyz/common";
import { writeFileSync } from "fs";

type Address = string;
type TableId = string;
type Key = string;

type RecordData = { staticData: Hex; dynamicData: Hex; encodedLengths: Hex };

type State = {
  source: IndexerConfig;
  blockNumber: bigint;
  rows: Record<Address, Record<TableId, Record<Key, RecordData>>>;
};

type Comparison = {
  sources: { first: IndexerConfig; second: IndexerConfig };
  mismatchingRows: Record<Address, Record<TableId, Record<Key, Record<string, RecordData | null>>>>;
};

function setRecord<Data>(
  state: Record<Address, Record<TableId, Record<Key, Data>>>,
  address: Address,
  tableId: TableId,
  key: Key,
  data: Data
): void {
  state[address] ??= {};
  state[address][tableId] ??= {};
  state[address][tableId][key] ??= data;
}

function getRecord<Data>(
  state: Record<Address, Record<TableId, Record<Key, Data>>>,
  address: Address,
  tableId: TableId,
  key: Key
): Data | undefined {
  return state[address]?.[tableId]?.[key];
}

function countRows(nestedRows: Record<Address, Record<TableId, Record<Key, Record<string, unknown>>>>): number {
  let num = 0;
  for (const address of Object.keys(nestedRows)) {
    for (const tableId of Object.keys(nestedRows[address])) {
      for (const key of Object.keys(nestedRows[address][tableId])) {
        num += Object.keys(nestedRows[address][tableId][key]).length;
      }
    }
  }
  return num;
}

async function syncToObject(indexerConfig: IndexerConfig): Promise<State> {
  console.log("Fetching from", indexerConfig);
  const state: State = { source: indexerConfig, blockNumber: -1n, rows: {} };

  const indexer = createIndexerClient({ url: indexerConfig.url });
  const result = unwrap(await indexer.getLogs(options));
  console.log(`Fetched ${result.logs.length} logs from`, indexerConfig.name);
  state.blockNumber = result.blockNumber;

  for (const log of result.logs) {
    if (log.eventName !== "Store_SetRecord") {
      throw new Error(`[${indexerConfig.name}]: Snapshots can only include Store_SetRecord logs`);
    }
    const { address } = log;
    const { tableId, keyTuple, staticData, dynamicData, encodedLengths } = log.args;
    setRecord(state.rows, address, tableId, keyTuple.join("-"), { staticData, dynamicData, encodedLengths });
  }

  return state;
}

function compare(first: State, second: State): Comparison {
  const comparison: Comparison = {
    sources: { first: first.source, second: second.source },
    mismatchingRows: {},
  };

  extendComparison(comparison, first, second);
  extendComparison(comparison, second, first);
  return comparison;
}

function extendComparison(comparison: Comparison, first: State, second: State) {
  for (const address of Object.keys(second.rows)) {
    for (const tableId of Object.keys(second.rows[address])) {
      for (const key of Object.keys(second.rows[address][tableId])) {
        const firstRecord = getRecord(first.rows, address, tableId, key);
        const secondRecord = getRecord(second.rows, address, tableId, key);
        if (
          !firstRecord ||
          !secondRecord ||
          firstRecord.staticData != secondRecord.staticData ||
          firstRecord.encodedLengths != secondRecord.encodedLengths ||
          firstRecord.dynamicData != secondRecord.dynamicData
        ) {
          setRecord(comparison.mismatchingRows, address, tableId, key, {
            [first.source.name]: firstRecord ?? null,
            [second.source.name]: secondRecord ?? null,
          });
        }
      }
    }
  }
}

describe("Compare indexer snapshots", async () => {
  it("snapshots should match", async () => {
    const states = await Promise.all(indexerUrls.map(syncToObject));

    console.log("Comparing states");

    const [first, ...rest] = states;

    // Compare each state to the first one
    for (const state of rest) {
      const comparison = compare(state, first);
      const report = JSON.stringify(comparison, null, 2);
      const fileName = `compare-${comparison.sources.first.name}-${comparison.sources.second.name}.json`;
      writeFileSync(fileName, report);

      expect(countRows(comparison.mismatchingRows)).toBe(0);
    }
  });
});
