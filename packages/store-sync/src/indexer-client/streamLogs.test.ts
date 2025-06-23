import { describe, expect, it, vi } from "vitest";
import { streamLogs } from "./streamLogs";

describe("streamLogs", async () => {
  it("streams an indexer response", async () => {
    const response = {
      blockNumber: "19250795",
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
        {
          address: "0x253eb85b3c953bfe3827cc14a151262482e7189c",
          eventName: "Store_SetRecord",
          args: {
            tableId: "0x746273746f72650000000000000000005265736f757263654964730000000000",
            keyTuple: ["0x746273746f72650000000000000000005461626c657300000000000000000000"],
            staticData: "0x01",
            encodedLengths: "0x00",
            dynamicData: "0x",
          },
        },
        {
          address: "0x253eb85b3c953bfe3827cc14a151262482e7189c",
          eventName: "Store_SetRecord",
          args: {
            tableId: "0x746273746f72650000000000000000005265736f757263654964730000000000",
            keyTuple: ["0x746273746f72650000000000000000005265736f757263654964730000000000"],
            staticData: "0x01",
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

    const onLog = vi.fn<Parameters<typeof streamLogs>[1]>();
    const result = await streamLogs(body, onLog);

    expect(onLog).toHaveBeenCalledTimes(3);
    expect(onLog).toHaveBeenNthCalledWith(1, response.logs[0]);
    expect(onLog).toHaveBeenNthCalledWith(2, response.logs[1]);
    expect(onLog).toHaveBeenNthCalledWith(3, response.logs[2]);

    expect(result).toEqual({
      blockNumber: response.blockNumber,
      logs: [],
    });
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

    const onLog = vi.fn<Parameters<typeof streamLogs>[1]>();
    const result = await streamLogs(body, onLog);

    expect(onLog).toHaveBeenCalledTimes(0);
    expect(result).toEqual({
      blockNumber: response.blockNumber,
      logs: [],
    });
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

    const onLog = vi.fn<Parameters<typeof streamLogs>[1]>();
    const result = await streamLogs(body, onLog);

    // TODO: throw error
    expect(onLog).toHaveBeenCalledTimes(0);
    expect(result).toEqual({ invalid: true });
  });
});
