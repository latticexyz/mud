import { Observable, Subject } from "rxjs";
import { StorageAdapterLog, SyncFilter } from "./common";
import { debug as parentDebug } from "./debug";
import { Hex } from "viem";

const debug = parentDebug.extend("createEventStream");

type CreateEventStreamOptions = {
  indexerUrl: string;
  chainId: number;
  address?: Hex;
  filters?: readonly SyncFilter[];
};

type CreateEventStreamResult = {
  blockNumber: bigint;
  totalLogs: number;
  log$: Observable<StorageAdapterLog>;
};

export async function createEventStream({
  indexerUrl,
  chainId,
  address,
  filters,
}: CreateEventStreamOptions): Promise<CreateEventStreamResult> {
  const log$ = new Subject<StorageAdapterLog>();

  const url = new URL(indexerUrl);
  url.pathname = "/sse/logs";
  url.search = new URLSearchParams({
    input: JSON.stringify({ chainId, address, filters }),
  }).toString();

  return new Promise<CreateEventStreamResult>((resolve) => {
    // TODO: we may need to replace this with our own stream/parser to apply backpressure to avoid memory issues
    //       but last time I tried this (using eventsource-parser package), it was significantly slower

    console.log("attempting to connect to indexer SSE", url);
    // TODO: make EventSource strongly typed
    const eventSource = new EventSource(url);

    eventSource.addEventListener("config", (event) => {
      const parsed = JSON.parse(event.data);
      console.log("connected to indexer SSE", parsed);
      resolve({
        blockNumber: BigInt(parsed.lastUpdatedBlockNumber),
        totalLogs: parsed.totalRows,
        log$: log$.asObservable(),
      });
    });

    eventSource.addEventListener("log", (event) => {
      const parsed = JSON.parse(event.data);
      log$.next({
        ...parsed,
        blockNumber: BigInt(parsed.blockNumber),
      });
    });

    eventSource.addEventListener("close", () => {
      console.log("closing");
      log$.complete();
      eventSource.close();
    });

    eventSource.addEventListener("error", (event) => {
      console.error("EventSource had an error, closing stream", event);
      log$.error(new Error("EventSource had an error"));
      log$.complete();
      eventSource.close();
    });
  });
}
