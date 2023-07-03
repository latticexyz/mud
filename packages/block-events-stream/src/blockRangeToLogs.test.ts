import { describe, it, expect, vi } from "vitest";
import { blockRangeToLogs } from "./blockRangeToLogs";
import { Subject, firstValueFrom, map } from "rxjs";
import { Transport, createPublicClient, createTransport } from "viem";
import * as fetchLogsExports from "./fetchLogsSubset";
import { bigIntMin } from "./utils";

const mockTransport: Transport = () =>
  createTransport({
    key: "mock",
    name: "Mock Transport",
    request: vi.fn(() => null) as any,
    type: "mock",
  });

describe("blockRangeToLogs", () => {
  it("processes block ranges in order", async () => {
    const publicClient = createPublicClient({
      transport: mockTransport,
    });

    const spy = vi.spyOn(fetchLogsExports, "fetchLogs");
    spy.mockImplementation(async ({ fromBlock, toBlock, maxBlockRange = 1000n }) => {
      return {
        fromBlock,
        toBlock: bigIntMin(toBlock, fromBlock + maxBlockRange),
        logs: [],
      };
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

    setTimeout(() => latestBlockNumber$.next(1000n), 100);
    setTimeout(() => latestBlockNumber$.next(1001n), 200);
    setTimeout(() => latestBlockNumber$.next(1002n), 300);

    const logs = await firstValueFrom(logs$);

    console.log("got logs", logs);
    // expect(logs).toMatchInlineSnapshot();

    // await new Promise((resolve) => setTimeout(resolve, 1000));

    // // expect(spy).toHaveBeenCalledTimes(1);
    // // expect(await firstValueFrom(logs$)).toMatchInlineSnapshot(``);
    // expect(spy).toHaveBeenCalledTimes(1);
    // expect(spy).toHaveBeenCalledWith({
    //   address: "0x",
    //   fromBlock: 0n,
    //   toBlock: 1000n,
    //   maxBlockRange: 1000n,
    // });
    // expect(await firstValueFrom(logs$)).toMatchObject({
    //   fromBlock: 0n,
    //   toBlock: 1000n,
    //   logs: [],
    // });
  });
});
