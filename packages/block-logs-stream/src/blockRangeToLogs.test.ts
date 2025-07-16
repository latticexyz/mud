import { describe, it, expect, vi } from "vitest";
import { blockRangeToLogs } from "./blockRangeToLogs";
import { Subject, lastValueFrom, map, toArray } from "rxjs";
import { createClient } from "viem";
import { wait } from "@latticexyz/common/utils";
import { createMockTransport } from "../test/createMockTransport";

vi.useFakeTimers();

describe("blockRangeToLogs", () => {
  it("processes block ranges in order", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requests: any[] = [];
    const publicClient = createClient({
      transport: createMockTransport(async ({ method, params }) => {
        requests.push({ method, params });
        if (method === "eth_getLogs") {
          await Promise.race([wait(450), vi.runAllTimersAsync()]);
          return [];
        }
        throw new Error("not implemented");
      }),
    });

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
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x0",
              "toBlock": "0x3e7",
              "topics": [
                [],
              ],
            },
          ],
        },
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x3e8",
              "toBlock": "0x3e8",
              "topics": [
                [],
              ],
            },
          ],
        },
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x3e9",
              "toBlock": "0x3ef",
              "topics": [
                [],
              ],
            },
          ],
        },
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x3f0",
              "toBlock": "0x3f0",
              "topics": [
                [],
              ],
            },
          ],
        },
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x3f1",
              "toBlock": "0x3f1",
              "topics": [
                [],
              ],
            },
          ],
        },
        {
          "method": "eth_getLogs",
          "params": [
            {
              "address": "0x",
              "fromBlock": "0x3f2",
              "toBlock": "0x3f2",
              "topics": [
                [],
              ],
            },
          ],
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
