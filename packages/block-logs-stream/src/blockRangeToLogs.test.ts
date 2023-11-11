import { describe, it, expect, vi, beforeEach } from "vitest";
import { blockRangeToLogs } from "./blockRangeToLogs";
import { Subject, lastValueFrom, map, toArray } from "rxjs";
import { EIP1193RequestFn, RpcLog, Transport, createPublicClient, createTransport } from "viem";
import { wait } from "@latticexyz/common/utils";

vi.useFakeTimers();

const mockedTransportRequest = vi.fn<Parameters<EIP1193RequestFn>, ReturnType<EIP1193RequestFn>>();
const mockTransport: Transport = () =>
  createTransport({
    key: "mock",
    name: "Mock Transport",
    request: mockedTransportRequest as any,
    type: "mock",
  });

const publicClient = createPublicClient({
  transport: mockTransport,
});

describe("blockRangeToLogs", () => {
  beforeEach(() => {
    mockedTransportRequest.mockClear();
  });

  it("processes block ranges in order", async () => {
    const requests: any[] = [];
    mockedTransportRequest.mockImplementation(async ({ method, params }): Promise<RpcLog[]> => {
      requests.push(params);
      if (method !== "eth_getLogs") throw new Error("not implemented");
      await Promise.race([wait(450), vi.runAllTimersAsync()]);
      return [];
    });

    const latestBlockNumber$ = new Subject<bigint>();

    const logs$ = latestBlockNumber$.pipe(
      map((endBlock) => ({ startBlock: 0n, endBlock })),
      blockRangeToLogs({
        publicClient,
        address: "0x",
        events: [],
      })
    );

    (async (): Promise<void> => {
      for (let blockNumber = 1000n; blockNumber <= 1010n; blockNumber++) {
        await Promise.race([wait(100), vi.runAllTimersAsync()]);
        latestBlockNumber$.next(blockNumber);
      }
      await Promise.race([wait(100), vi.runAllTimersAsync()]);
      latestBlockNumber$.complete();
    })();

    const results = await lastValueFrom(logs$.pipe(toArray()));

    expect(requests).toMatchInlineSnapshot(`
      [
        [
          {
            "address": "0x",
            "fromBlock": "0x0",
            "toBlock": "0x3e8",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x3e9",
            "toBlock": "0x3ec",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x3ed",
            "toBlock": "0x3f0",
            "topics": [
              [],
            ],
          },
        ],
        [
          {
            "address": "0x",
            "fromBlock": "0x3f1",
            "toBlock": "0x3f2",
            "topics": [
              [],
            ],
          },
        ],
      ]
    `);

    expect(results).toMatchInlineSnapshot(`
      [
        {
          "fromBlock": 0n,
          "logs": [],
          "toBlock": 1000n,
        },
        {
          "fromBlock": 1001n,
          "logs": [],
          "toBlock": 1004n,
        },
        {
          "fromBlock": 1005n,
          "logs": [],
          "toBlock": 1008n,
        },
        {
          "fromBlock": 1009n,
          "logs": [],
          "toBlock": 1010n,
        },
      ]
    `);
  });
});
