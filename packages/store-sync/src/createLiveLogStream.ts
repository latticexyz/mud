import { groupLogsByBlockNumber, getRpcClient, GetRpcClientOptions } from "@latticexyz/block-logs-stream";
import { storeEventsAbi } from "@latticexyz/store";
import { Observable } from "rxjs";
import WebSocket from "isomorphic-ws";
import {
  Address,
  Client,
  Hex,
  LogTopic,
  RpcLog,
  createClient,
  encodeEventTopics,
  formatLog,
  http,
  parseEventLogs,
} from "viem";
import { deferred } from "../../utils/src/deferred";
import { uuid } from "../../utils/src/uuid";
import { debug as parentDebug, error as parentError } from "./debug";
import { FollowBlockTag, PreconfirmedLogsOptions, StorageAdapterBlock, StoreEventsLog, SyncOptions } from "./common";
import { watchLogs } from "./watchLogs";

const debug = parentDebug.extend("createLiveLogStream");
const debugError = parentError.extend("createLiveLogStream");

const defaultFlashblocksPollingInterval = 150;
const dedupeWindow = 10n;

export type ResolvedPreconfirmedLogsOptions =
  | {
      type: "wiresaw";
      url: string;
    }
  | {
      type: "flashblocks-http";
      pollingInterval: number;
      url?: string;
    }
  | {
      type: "flashblocks-ws";
      url: string;
    };

type CreateLiveLogStreamOptions = GetRpcClientOptions & {
  address?: Hex;
  fromBlock: bigint;
  preconfirmedLogs: ResolvedPreconfirmedLogsOptions;
};

type RpcChainUrls = {
  wiresaw?: {
    http?: readonly string[];
    webSocket?: readonly string[];
  };
  flashblocks?: {
    http?: readonly string[];
    webSocket?: readonly string[];
  };
};

type PendingBlockResponse = {
  number: Hex | null;
} | null;

type NormalizeLiveLogsOptions = {
  rawLogs: readonly RpcLog[];
  fromBlock: bigint;
  seenLogKeys: Map<string, bigint>;
  getPendingBlockNumber: () => Promise<bigint | undefined>;
};

type WebSocketRequestArgs = {
  ws: WebSocket;
  method: string;
  params?: unknown[];
  wsId: number;
};

let websocketCount = 0;

export function getSyncBlockTag(followBlockTag: FollowBlockTag): Exclude<FollowBlockTag, "pending"> {
  return followBlockTag === "pending" ? "latest" : followBlockTag;
}

export function getEffectiveFollowBlockTag(
  followBlockTag: FollowBlockTag,
  preconfirmedLogs: ResolvedPreconfirmedLogsOptions | undefined,
): Exclude<FollowBlockTag, "pending"> | "pending" {
  return followBlockTag === "pending" && preconfirmedLogs == null ? "latest" : followBlockTag;
}

export function resolvePreconfirmedLogs(
  opts: Pick<SyncOptions, "followBlockTag" | "preconfirmedLogs"> & GetRpcClientOptions,
): ResolvedPreconfirmedLogsOptions | undefined {
  const followBlockTag = opts.followBlockTag ?? "latest";
  const configuredPreconfirmedLogs = opts.preconfirmedLogs;
  const chainRpcUrls = getRpcUrls(opts);

  if (configuredPreconfirmedLogs === false) return;

  if (configuredPreconfirmedLogs) {
    return resolveConfiguredPreconfirmedLogs(configuredPreconfirmedLogs, chainRpcUrls, opts);
  }

  const wiresawUrl = chainRpcUrls?.wiresaw?.webSocket?.[0];
  if (wiresawUrl) {
    return { type: "wiresaw", url: wiresawUrl };
  }

  if (followBlockTag !== "pending") return;

  const flashblocksWebSocketUrl = chainRpcUrls?.flashblocks?.webSocket?.[0];
  if (flashblocksWebSocketUrl) {
    return { type: "flashblocks-ws", url: flashblocksWebSocketUrl };
  }

  const flashblocksHttpUrl = chainRpcUrls?.flashblocks?.http?.[0];
  if (flashblocksHttpUrl) {
    return {
      type: "flashblocks-http",
      url: flashblocksHttpUrl,
      pollingInterval: defaultFlashblocksPollingInterval,
    };
  }
}

export function createLiveLogStream({
  preconfirmedLogs,
  ...opts
}: CreateLiveLogStreamOptions): Observable<StorageAdapterBlock> {
  switch (preconfirmedLogs.type) {
    case "wiresaw":
      return watchLogs({
        ...opts,
        url: preconfirmedLogs.url,
      }).logs$;
    case "flashblocks-http":
      return watchFlashblocksHttpLogs({
        ...opts,
        pollingInterval: preconfirmedLogs.pollingInterval,
        url: preconfirmedLogs.url,
      });
    case "flashblocks-ws":
      return watchFlashblocksWsLogs({
        ...opts,
        url: preconfirmedLogs.url,
      });
  }
}

type WatchFlashblocksLogsInput = GetRpcClientOptions & {
  fromBlock: bigint;
  address?: Address;
};

type WatchFlashblocksHttpLogsInput = WatchFlashblocksLogsInput & {
  pollingInterval: number;
  url?: string;
};

function watchFlashblocksHttpLogs({
  address,
  fromBlock,
  pollingInterval,
  url,
  ...opts
}: WatchFlashblocksHttpLogsInput): Observable<StorageAdapterBlock> {
  const baseClient = getRpcClient(opts);
  const client =
    url == null
      ? baseClient
      : createClient({
          chain: baseClient.chain,
          pollingInterval: baseClient.pollingInterval,
          transport: http(url),
        });

  return new Observable<StorageAdapterBlock>((subscriber) => {
    debug("flashblocks http live logs subscribed, starting from", fromBlock);

    const seenLogKeys = new Map<string, bigint>();
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const getPendingBlockNumber = createPendingBlockNumberGetter(client);

    const poll = async (): Promise<void> => {
      try {
        const rawLogs = (await client.request({
          method: "eth_getLogs",
          params: [
            {
              address,
              topics: getStoreEventTopics(),
              fromBlock: "pending",
              toBlock: "pending",
            },
          ],
        })) as RpcLog[];

        const blocks = await normalizeAndGroupLiveLogs({
          rawLogs,
          fromBlock,
          seenLogKeys,
          getPendingBlockNumber,
        });

        for (const block of blocks) {
          subscriber.next(block);
        }
      } catch (error) {
        debugError("flashblocks http live logs failed", error);
        subscriber.error(error);
        return;
      }

      if (cancelled) return;
      timeout = setTimeout(() => {
        void poll();
      }, pollingInterval);
    };

    void poll();

    return (): void => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  });
}

type WatchFlashblocksWsLogsInput = WatchFlashblocksLogsInput & {
  url: string;
};

function watchFlashblocksWsLogs({
  url,
  address,
  fromBlock,
}: WatchFlashblocksWsLogsInput): Observable<StorageAdapterBlock> {
  const wsId = websocketCount++;
  const topics = getStoreEventTopics();

  return new Observable<StorageAdapterBlock>((subscriber) => {
    debug("flashblocks ws live logs subscribed, starting from", fromBlock);

    let ws: WebSocket | undefined;
    const seenLogKeys = new Map<string, bigint>();
    let pendingBlockNumberPromise: Promise<bigint | undefined> | undefined;

    const getPendingBlockNumber = async (): Promise<bigint | undefined> => {
      pendingBlockNumberPromise ??= request<PendingBlockResponse>({
        ws: ws!,
        method: "eth_getBlockByNumber",
        params: ["pending", false],
        wsId,
      }).then((block) => (block?.number == null ? undefined : BigInt(block.number)));

      try {
        return await pendingBlockNumberPromise;
      } finally {
        pendingBlockNumberPromise = undefined;
      }
    };

    async function emitLogs(rawLogs: readonly RpcLog[]): Promise<void> {
      const blocks = await normalizeAndGroupLiveLogs({
        rawLogs,
        fromBlock,
        seenLogKeys,
        getPendingBlockNumber,
      });

      for (const block of blocks) {
        subscriber.next(block);
      }
    }

    async function setup(): Promise<void> {
      const subscription = { id: undefined as Hex | undefined };
      ws = new WebSocket(url);

      ws.addEventListener("error", (error) => {
        const errorMessage = `ws${wsId} error`;
        debugError(errorMessage, error);
        subscriber.error(errorMessage);
      });

      ws.addEventListener("close", () => {
        const errorMessage = `ws${wsId} close`;
        debug(errorMessage);
        subscriber.error(errorMessage);
      });

      ws.addEventListener("open", () => {
        debug(`ws${wsId} open`);
      });

      ws.addEventListener("message", (message) => {
        const data = JSON.parse(message.data.toString());

        if ("error" in data) {
          const errorMessage = `ws${wsId} json-rpc error`;
          debugError(errorMessage, data.error);
          subscriber.error(errorMessage);
          return;
        }

        if ("params" in data && data.params.subscription === subscription.id) {
          const result = Array.isArray(data.params.result) ? data.params.result : [data.params.result];
          void emitLogs(result).catch((error) => {
            const errorMessage = `ws${wsId} failed to process pendingLogs update`;
            debugError(errorMessage, error);
            subscriber.error(errorMessage);
          });
          return;
        }
      });

      subscription.id = await request<Hex>({
        ws,
        method: "eth_subscribe",
        params: [
          "pendingLogs",
          {
            address,
            topics,
          },
        ],
        wsId,
      });
    }

    setup().catch((error) => {
      const errorMessage = `ws${wsId} failed to setup pendingLogs subscription`;
      debugError(errorMessage, error);
      subscriber.error(errorMessage);
    });

    const ping = setInterval(
      () =>
        ws &&
        request({
          ws,
          method: "net_version",
          wsId,
        }).catch(() => {
          const errorMessage = `ws${wsId} ping failed`;
          debugError(errorMessage);
          subscriber.error(errorMessage);
        }),
      10_000,
    );

    return (): void => {
      clearInterval(ping);
      try {
        ws?.close();
      } catch (error) {
        debug(`ws${wsId} failed to close web socket`, error);
      }
    };
  });
}

function getRpcUrls(opts: GetRpcClientOptions): RpcChainUrls | undefined {
  return getRpcClient(opts).chain?.rpcUrls as RpcChainUrls | undefined;
}

function resolveConfiguredPreconfirmedLogs(
  preconfirmedLogs: PreconfirmedLogsOptions,
  chainRpcUrls: RpcChainUrls | undefined,
  opts: GetRpcClientOptions,
): ResolvedPreconfirmedLogsOptions | undefined {
  switch (preconfirmedLogs.type) {
    case "wiresaw": {
      const url = preconfirmedLogs.url ?? chainRpcUrls?.wiresaw?.webSocket?.[0];
      return url ? { type: "wiresaw", url } : undefined;
    }

    case "flashblocks-http": {
      const url = preconfirmedLogs.url ?? chainRpcUrls?.flashblocks?.http?.[0];
      if (url == null && !("publicClient" in opts)) return;
      return {
        type: "flashblocks-http",
        pollingInterval: preconfirmedLogs.pollingInterval ?? defaultFlashblocksPollingInterval,
        url,
      };
    }

    case "flashblocks-ws": {
      const url = preconfirmedLogs.url ?? chainRpcUrls?.flashblocks?.webSocket?.[0];
      return url ? { type: "flashblocks-ws", url } : undefined;
    }
  }
}

function getStoreEventTopics(): LogTopic[] {
  return [storeEventsAbi.flatMap((event) => encodeEventTopics({ abi: [event], eventName: event.name }))] as LogTopic[];
}

function createPendingBlockNumberGetter(client: Client): () => Promise<bigint | undefined> {
  let pendingBlockNumberPromise: Promise<bigint | undefined> | undefined;

  return async (): Promise<bigint | undefined> => {
    pendingBlockNumberPromise ??= client
      .request({
        method: "eth_getBlockByNumber",
        params: ["pending", false],
      })
      .then((block) => {
        const pendingBlock = block as PendingBlockResponse;
        return pendingBlock?.number == null ? undefined : BigInt(pendingBlock.number);
      });

    try {
      return await pendingBlockNumberPromise;
    } finally {
      pendingBlockNumberPromise = undefined;
    }
  };
}

async function normalizeAndGroupLiveLogs({
  rawLogs,
  fromBlock,
  seenLogKeys,
  getPendingBlockNumber,
}: NormalizeLiveLogsOptions): Promise<StorageAdapterBlock[]> {
  if (rawLogs.length === 0) return [];

  let fallbackBlockNumber: bigint | undefined;
  if (rawLogs.some((log) => log.blockNumber == null)) {
    fallbackBlockNumber = await getPendingBlockNumber();
  }

  const parsedLogs = parseEventLogs({
    abi: storeEventsAbi,
    logs: rawLogs.map((log) => formatLog(log)),
  });

  const transactionLogCounts = new Map<string, number>();
  const normalizedLogs: StoreEventsLog[] = [];

  for (const [index, parsedLog] of parsedLogs.entries()) {
    const rawLog = rawLogs[index];
    if (rawLog == null) continue;

    const transactionHash = parsedLog.transactionHash ?? rawLog.transactionHash ?? null;
    const blockNumber =
      parsedLog.blockNumber ?? (rawLog.blockNumber != null ? BigInt(rawLog.blockNumber) : fallbackBlockNumber);
    if (blockNumber == null || blockNumber < fromBlock) continue;

    const logIndex = getLogIndex({
      parsedLog,
      rawLog,
      index,
      transactionHash,
      transactionLogCounts,
    });

    const normalizedLog = {
      ...parsedLog,
      blockNumber,
      logIndex,
      transactionHash,
    } as StoreEventsLog;

    const identity = getLiveLogIdentity({ index, log: normalizedLog });
    if (seenLogKeys.has(identity)) continue;

    seenLogKeys.set(identity, blockNumber);
    normalizedLogs.push(normalizedLog);
  }

  pruneSeenLogKeys(seenLogKeys);
  return groupLogsByBlockNumber(normalizedLogs);
}

function getLogIndex({
  parsedLog,
  rawLog,
  index,
  transactionHash,
  transactionLogCounts,
}: {
  parsedLog: Pick<StoreEventsLog, "logIndex">;
  rawLog: RpcLog;
  index: number;
  transactionHash: Hex | null;
  transactionLogCounts: Map<string, number>;
}): number {
  if (parsedLog.logIndex != null) return parsedLog.logIndex;
  if (rawLog.logIndex != null) return Number(rawLog.logIndex);

  if (transactionHash != null) {
    const count = transactionLogCounts.get(transactionHash) ?? 0;
    transactionLogCounts.set(transactionHash, count + 1);
    return count;
  }

  return index;
}

function getLiveLogIdentity({
  index,
  log,
}: {
  index: number;
  log: Pick<StoreEventsLog, "address" | "blockNumber" | "data" | "logIndex" | "topics" | "transactionHash">;
}): string {
  if (log.transactionHash != null) return `${log.transactionHash}:${log.logIndex}`;
  return `${log.blockNumber}:${log.address}:${log.data}:${log.topics.join(",")}:${index}`;
}

function pruneSeenLogKeys(seenLogKeys: Map<string, bigint>): void {
  if (seenLogKeys.size === 0) return;

  let latestSeenBlockNumber: bigint | undefined;
  for (const blockNumber of seenLogKeys.values()) {
    if (latestSeenBlockNumber == null || blockNumber > latestSeenBlockNumber) {
      latestSeenBlockNumber = blockNumber;
    }
  }

  if (latestSeenBlockNumber == null) return;

  const minimumBlockNumber = latestSeenBlockNumber - dedupeWindow;
  for (const [key, blockNumber] of seenLogKeys.entries()) {
    if (blockNumber < minimumBlockNumber) {
      seenLogKeys.delete(key);
    }
  }
}

async function waitForWebSocketOpen(ws: WebSocket, wsId?: number): Promise<void> {
  if (ws.readyState !== WebSocket.OPEN) {
    const [resolve, reject, promise] = deferred<void>();
    debug(`ws${wsId} waiting for websocket to open`);
    const timeout = setTimeout(() => reject(new Error(`ws${wsId} timeout waiting for websocket to open`)), 10_000);
    ws.addEventListener("open", () => {
      clearTimeout(timeout);
      resolve();
    });
    await promise;
  }
}

async function request<T>({ ws, method, params, wsId }: WebSocketRequestArgs): Promise<T> {
  await waitForWebSocketOpen(ws, wsId);
  const requestId = uuid();
  const [resolve, reject, promise] = deferred<T>();

  ws.send(JSON.stringify({ jsonrpc: "2.0", id: requestId, method, params }), (error) => {
    if (error) {
      debugError(`ws${wsId} request error`, error);
      reject(error);
    }
  });

  const timeout = setTimeout(() => reject(new Error("timeout waiting for response for " + requestId)), 10_000);

  ws.addEventListener("message", function onMessage(message) {
    const data = JSON.parse(message.data.toString());
    if (data.id === requestId) {
      ws.removeEventListener("message", onMessage);
      clearTimeout(timeout);

      if ("error" in data) {
        reject(new Error(data.error.message));
        return;
      }

      resolve(data.result as T);
    }
  });
  return promise;
}
