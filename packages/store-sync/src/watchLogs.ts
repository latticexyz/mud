import { Observable } from "rxjs";
import { Hex, LogTopic, RpcLog, encodeEventTopics, formatLog, parseEventLogs, toHex } from "viem";
import { StorageAdapterBlock, StoreEventsLog } from "./common";
import { storeEventsAbi } from "@latticexyz/store";
import { logSort } from "@latticexyz/common";
import { debug as parentDebug, error as parentError } from "./debug";
import { groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import WebSocket from "isomorphic-ws";
import { deferred, uuid } from "@latticexyz/utils";

const debug = parentDebug.extend("watchLogs");
const debugError = parentError.extend("watchLogs");

type WatchLogsInput = {
  url: string;
  fromBlock: bigint;
  address?: Hex;
};

type WatchLogsResult = {
  logs$: Observable<StorageAdapterBlock>;
};

type WatchLogsEvent = {
  blockNumber: string;
  logs: RpcLog[];
};

let websocketCount = 0;

export function watchLogs({ url, address, fromBlock }: WatchLogsInput): WatchLogsResult {
  const topics = [
    storeEventsAbi.flatMap((event) => encodeEventTopics({ abi: [event], eventName: event.name })),
  ] as LogTopic[]; // https://github.com/wevm/viem/blob/63a5ac86eb9a2962f7323b4cc76ef54f9f5ef7ed/src/actions/public/getLogs.ts#L171

  let ws: WebSocket | undefined = undefined;
  const wsId = websocketCount++;

  const logs$ = new Observable<StorageAdapterBlock>((subscriber) => {
    debug("wiresaw_watchLogs subscribed, starting from", fromBlock);

    async function setup(): Promise<void> {
      // Buffer the live logs received until the gap from `fromBlock` to `currentBlock` is closed
      let caughtUp = false;
      const logBuffer: StoreEventsLog[] = [];

      ws = new WebSocket(url);

      const subscriptionId = await request<Hex>({
        ws,
        method: "wiresaw_watchLogs",
        params: [{ address, topics }],
        wsId,
      });

      ws.on("message", (message) => {
        const data = JSON.parse(message.toString());

        if ("error" in data) {
          debugError(`ws${wsId} json-rpc error`, data.error);
          subscriber.error("json-rpc error");
          return;
        }

        if ("params" in data && data.params.subscription === subscriptionId) {
          debug(`ws${wsId} wiresaw_watchLogs update`);
          const result: WatchLogsEvent = data.params.result;
          const formattedLogs = result.logs.map((log) => formatLog(log));
          const parsedLogs = parseEventLogs({ abi: storeEventsAbi, logs: formattedLogs });
          const blockNumber = BigInt(result.blockNumber);
          if (caughtUp) {
            subscriber.next({ blockNumber, logs: parsedLogs });
          } else {
            logBuffer.push(...parsedLogs);
          }
          return;
        }

        debug(`ws${wsId} message`);
      });

      ws.on("open", () => {
        debug(`ws${wsId} open`);
      });

      ws.on("close", () => {
        debug(`ws${wsId} close`);
        subscriber.error("ws closed");
      });

      ws.on("error", (error) => {
        debugError(`ws${wsId} error`, error);
        subscriber.error("ws error");
      });

      ws.on("ping", () => {
        debug(`ws${wsId} ping`);
      });

      ws.on("pong", () => {
        debug(`ws${wsId} pong`);
      });

      ws.on("unexpected-response", (message) => {
        debugError(`ws${wsId} unexpected-response`, message);
      });

      ws.on("upgrade", () => {
        debug(`ws${wsId} upgrade`);
      });

      // Catch up to the pending logs
      fetchInitialLogs({ ws, address, fromBlock, topics, wsId })
        .then((initialLogs) => {
          debug("got", initialLogs.logs.length, "initial logs");
          const logs = [...initialLogs.logs, ...logBuffer].sort(logSort);
          const blocks = groupLogsByBlockNumber(logs);
          debug("releasing", logs.length, "logs across", blocks.length, "blocks to subscriber");
          for (const block of blocks) {
            subscriber.next(block);
          }
          caughtUp = true;
          logBuffer.length = 0;
        })
        .catch((error) => {
          debug("error while fetching initial logs", error);
          subscriber.error("failed to fetch initial logs");
        });
    }

    setup().catch((error) => {
      debug("error setting up initial client", error);
      subscriber.error("failed to setup wiresaw_watchLogs subscription");
    });

    // Send a ping to keep the connection alive
    const ping = setInterval(
      () =>
        ws &&
        request({ ws, method: "net_version", wsId }).catch(() => {
          debug("ping failed");
          subscriber.error("ping failed");
        }),
      10_000,
    );

    return () => {
      debug(`ws${wsId} logs$ subscription closed, closing client`);
      clearInterval(ping);
      try {
        ws?.close();
      } catch (e) {
        debug("failed to close web socket", e);
      }
    };
  });

  return { logs$ };
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

type RequestAsyncArgs = {
  ws: WebSocket;
  method: string;
  params?: unknown[];
  wsId: number;
};

async function request<T>({ ws, method, params, wsId }: RequestAsyncArgs): Promise<T> {
  await waitForWebSocketOpen(ws, wsId);
  const requestId = uuid();
  const [resolve, reject, promise] = deferred<T>();

  debug(`ws${wsId} sending request`, method, requestId);
  ws.send(JSON.stringify({ jsonrpc: "2.0", id: requestId, method, params }), (error) => {
    if (error) {
      debugError(`ws${wsId} request error`, error);
      reject(error);
    }
  });

  const timeout = setTimeout(() => reject(new Error("timeout waiting for response for " + requestId)), 10_000);

  const listener = (message: WebSocket.MessageEvent): void => {
    const data = JSON.parse(message.data.toString());
    if (data.id === requestId) {
      debug(`ws${wsId} request response for`, method, requestId);
      ws.removeEventListener("message", listener);
      clearTimeout(timeout);

      if ("error" in data) {
        debugError(`ws${wsId} request json-rpc error`, data.error);
        reject(new Error(data.error.message));
        return;
      }

      resolve(data.result as T);
    }
  };
  ws.addEventListener("message", listener);
  return promise;
}

type FetchInitialLogsArgs = {
  ws: WebSocket;
  topics: LogTopic[];
  wsId: number;
} & Omit<WatchLogsInput, "url">;

async function fetchInitialLogs({
  ws,
  address,
  topics,
  fromBlock,
  wsId,
}: FetchInitialLogsArgs): Promise<{ blockNumber: bigint; logs: StoreEventsLog[] }> {
  const latestBlockNumber = await request<Hex>({
    ws,
    method: "eth_blockNumber",
    wsId,
  });

  debug("fetching initial logs from", Number(fromBlock), "to", parseInt(latestBlockNumber));

  const rawInitialLogs = await request<RpcLog[]>({
    ws,
    method: "eth_getLogs",
    params: [{ address, topics, fromBlock: toHex(fromBlock), toBlock: latestBlockNumber }],
    wsId,
  });

  const formattedLogs = rawInitialLogs.map((log) => formatLog(log));
  return { blockNumber: BigInt(latestBlockNumber), logs: parseEventLogs({ abi: storeEventsAbi, logs: formattedLogs }) };
}
