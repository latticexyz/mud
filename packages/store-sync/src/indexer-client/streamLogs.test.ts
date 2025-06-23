import { describe, expect, it } from "vitest";
import { streamLogs } from "./streamLogs";
import { StorageAdapterLog } from "../common";

describe("streamLogs", async () => {
  it("streams an indexer response", async () => {
    const response = {
      blockNumber: "19254472",
      logs: [
        {
          address: "0x253eb85b3c953bfe3827cc14a151262482e7189c",
          eventName: "Store_SetRecord",
          args: {
            tableId: "0x7462776f726c64000000000000000000496e69744d6f64756c65416464726573",
            keyTuple: [],
            staticData: "0x9fcc45958071325949b488a784268371f17cb2d7",
            encodedLengths: "0x00",
            dynamicData: "0x",
          },
        },
      ],
    };

    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(JSON.stringify(response)));
        controller.close();
      },
    });

    const emissions: { blockNumber: bigint; log: StorageAdapterLog }[] = [];
    await streamLogs(body, (log) => emissions.push(log));

    expect(emissions).toEqual([
      {
        blockNumber: BigInt(response.blockNumber),
        log: response.logs[0],
      },
    ]);
  });

  it("can stream empty results", async () => {
    const response = {
      blockNumber: "19254472",
      logs: [],
    };

    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(JSON.stringify(response)));
        controller.close();
      },
    });

    const emissions: { blockNumber: bigint; log: StorageAdapterLog }[] = [];
    await streamLogs(body, (log) => emissions.push(log));

    // TODO: we should prob emit something so we can get the block number of the indexer?
    expect(emissions).toEqual([]);
  });

  it("handles a bad response object", async () => {
    const response = {
      invalid: true,
    };

    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(JSON.stringify(response)));
        controller.close();
      },
    });

    const emissions: { blockNumber: bigint; log: StorageAdapterLog }[] = [];
    await streamLogs(body, (log) => emissions.push(log));

    // TODO: we should prob throw an error?
    expect(emissions).toEqual([]);
  });
});
