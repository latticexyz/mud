import { Subject, firstValueFrom, of, take, toArray } from "rxjs";
import { createClient, Hex } from "viem";
import { describe, expect, it, vi } from "vitest";
import { createMockTransport } from "../../block-logs-stream/test/createMockTransport";
import { StorageAdapterBlock, StoreEventsLog } from "./common";

vi.mock("./createLiveLogStream", () => ({
  createLiveLogStream: vi.fn(),
}));

vi.mock("./fetchAndStoreLogs", () => ({
  fetchAndStoreLogs: vi.fn(),
}));

import { createPreconfirmedBlockStream } from "./createPreconfirmedBlockStream";
import { createLiveLogStream } from "./createLiveLogStream";
import { fetchAndStoreLogs } from "./fetchAndStoreLogs";

const mockedCreateLiveLogStream = vi.mocked(createLiveLogStream);
const mockedFetchAndStoreLogs = vi.mocked(fetchAndStoreLogs);

describe("createPreconfirmedBlockStream", () => {
  it("emits an empty latest block when preconfirmed logs fully reconcile", async () => {
    const preconfirmed$ = new Subject<StorageAdapterBlock>();
    const matchingLog = {
      blockNumber: 13n,
      logIndex: 0,
      transactionHash: "0x1234" as Hex,
    } as StoreEventsLog;

    mockedCreateLiveLogStream.mockReturnValue(preconfirmed$.asObservable());
    mockedFetchAndStoreLogs.mockImplementation(
      async function* fetchLatestBlocks(): AsyncGenerator<StorageAdapterBlock> {
        await sleep(0);
        yield { blockNumber: 12n, logs: [] };

        await sleep(0);
        preconfirmed$.next({ blockNumber: 13n, logs: [matchingLog] });

        yield { blockNumber: 13n, logs: [matchingLog] };
      },
    );

    const publicClient = createClient({
      transport: createMockTransport(async ({ method }) => {
        if (method === "eth_blockNumber") return "0xb";
        throw new Error(`unexpected method: ${method}`);
      }),
    });

    const blocks = await firstValueFrom(
      createPreconfirmedBlockStream({
        publicClient,
        fromBlock: 12n,
        preconfirmedLogs: { type: "flashblocks-http", pollingInterval: 150 },
        chainId: 1,
        filters: [],
        syncBlockNumber$: of(13n),
      }).pipe(take(3), toArray()),
    );

    expect(blocks).toEqual([
      { blockNumber: 12n, logs: [] },
      { blockNumber: 13n, logs: [matchingLog] },
      { blockNumber: 13n, logs: [] },
    ]);
  });
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
