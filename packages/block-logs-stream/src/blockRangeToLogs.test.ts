import { describe, it, expect, vi } from "vitest";
import { blockRangeToLogs } from "./blockRangeToLogs";
import { Subject, lastValueFrom, map, toArray } from "rxjs";
import { createClient, http } from "viem";
import { wait } from "@latticexyz/common/utils";

vi.useFakeTimers();

describe("blockRangeToLogs", () => {
  it("processes block ranges in order", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requests: any[] = [];
    const publicClient = createClient({
      transport: http("http://mock"),
    }).extend(() => ({
      getLogs: vi.fn(async (params) => {
        requests.push(params);
        await Promise.race([wait(450), vi.runAllTimersAsync()]);
        return [];
      }),
    }));

    const latestBlockNumber$ = new Subject<bigint>();

    const logs$ = latestBlockNumber$.pipe(
      map((endBlock) => ({ startBlock: 0n, endBlock })),
      blockRangeToLogs({
        publicClient,
        address: "0x",
        events: [],
      }),
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
        {
          "address": "0x",
          "events": [],
          "fromBlock": 0n,
          "strict": true,
          "toBlock": 999n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 1000n,
          "strict": true,
          "toBlock": 1000n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 1001n,
          "strict": true,
          "toBlock": 1007n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 1008n,
          "strict": true,
          "toBlock": 1008n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 1009n,
          "strict": true,
          "toBlock": 1009n,
        },
        {
          "address": "0x",
          "events": [],
          "fromBlock": 1010n,
          "strict": true,
          "toBlock": 1010n,
        },
      ]
    `);

    expect(results).toMatchInlineSnapshot(`
      [
        {
          "fromBlock": 0n,
          "logs": [],
          "toBlock": 999n,
        },
        {
          "fromBlock": 1000n,
          "logs": [],
          "toBlock": 1000n,
        },
        {
          "fromBlock": 1001n,
          "logs": [],
          "toBlock": 1007n,
        },
        {
          "fromBlock": 1008n,
          "logs": [],
          "toBlock": 1008n,
        },
        {
          "fromBlock": 1009n,
          "logs": [],
          "toBlock": 1009n,
        },
        {
          "fromBlock": 1010n,
          "logs": [],
          "toBlock": 1010n,
        },
      ]
    `);
  });
});
