import { Observable } from "rxjs";
import { Hex, LogTopic, RpcLog, encodeEventTopics, formatLog, parseEventLogs, toHex } from "viem";
import { StorageAdapterBlock, StoreEventsLog } from "./common";
import { storeEventsAbi } from "@latticexyz/store";
import { logSort } from "@latticexyz/common";
import { SocketRpcClient, getWebSocketRpcClient } from "viem/utils";
import { debug as parentDebug } from "./debug";
import { deferred } from "@latticexyz/utils";

const debug = parentDebug.extend("watchLogs");

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

export function watchLogs({ url, address, fromBlock }: WatchLogsInput): WatchLogsResult {
  const topics = [
    storeEventsAbi.flatMap((event) => encodeEventTopics({ abi: [event], eventName: event.name })),
  ] as LogTopic[]; // https://github.com/wevm/viem/blob/63a5ac86eb9a2962f7323b4cc76ef54f9f5ef7ed/src/actions/public/getLogs.ts#L171

  let resumeBlock = fromBlock;

  const logs$ = new Observable<StorageAdapterBlock>((subscriber) => {
    debug("[watchLogs] logs$ subscribed, starting from", fromBlock);

    let client: SocketRpcClient<WebSocket>;

    async function setupClient(): Promise<void> {
      console.log("setupClient called");

      // Buffer the live logs received until the gap from `startBlock` to `currentBlock` is closed
      let caughtUp = false;
      const logBuffer: StoreEventsLog[] = [];

      client = await getWebSocketRpcClient(url, { keepAlive: true, reconnect: { attempts: 99, delay: 1_000 } });

      // Start watching pending logs
      const subscriptionId: Hex = (
        await requestAsync(client, {
          body: {
            method: "wiresaw_watchLogs",
            params: [{ address, topics }],
          },
        })
      ).result;
      debug("got watchLogs subscription", subscriptionId);

      // Listen for wiresaw_watchLogs subscription
      // Need to use low level methods since viem's socekt client only handles `eth_subscription` messages.
      // (https://github.com/wevm/viem/blob/f81d497f2afc11b9b81a79057d1f797694b69793/src/utils/rpc/socket.ts#L178)
      client.socket.addEventListener("message", (message) => {
        try {
          const response = JSON.parse(message.data);
          if ("error" in response) {
            debug("JSON-RPC error", response.error);
            return;
          }

          // Parse the logs from wiresaw_watchLogs
          if ("params" in response && response.params.subscription === subscriptionId) {
            debug("parsing logs");
            const result: WatchLogsEvent = response.params.result;
            const formattedLogs = result.logs.map((log) => formatLog(log));
            const parsedLogs = parseEventLogs({ abi: storeEventsAbi, logs: formattedLogs });
            const blockNumber = BigInt(result.blockNumber);
            // debug("got logs", parsedLogs, "for pending block", blockNumber);
            if (caughtUp) {
              debug("handing off logs to subscriber");
              subscriber.next({ blockNumber, logs: parsedLogs });
              // Since this the event's block number corresponds to a pending block, we have to refetch this block in case of a restart
              resumeBlock = blockNumber;
            } else {
              debug("buffering logs");
              logBuffer.push(...parsedLogs);
            }
            return;
          }
        } catch (e) {
          console.warn("caught error in watchLogs websocket subscription", e);
        }
      });

      // Catch up to the pending logs
      try {
        debug("fetching initial logs");
        const initialLogs = await fetchInitialLogs({ client, address, fromBlock: resumeBlock, topics });
        debug("got initial logs", initialLogs);
        const logs = [...initialLogs.logs, ...logBuffer].sort(logSort);
        debug("combining with log buffer", logs);
        const blockNumber = logs.at(-1)?.blockNumber ?? initialLogs.blockNumber;
        subscriber.next({ blockNumber, logs });
        // Since this the block number can correspond to a pending block, we have to refetch this block in case of a restart
        resumeBlock = blockNumber;
        caughtUp = true;
      } catch (error) {
        debug("could not get initial logs", error);
        subscriber.error("Could not fetch initial wiresaw logs");
      }
    }

    setupClient().catch((error) => {
      debug("error setting up initial client", error);
      subscriber.error(error);
    });

    return () => {
      debug("logs$ subscription closed");
      console.warn("closing client");
      try {
        client.close();
      } catch (e) {
        console.log("failed to close client", e);
      }
    };
  });

  return { logs$ };
}

type FetchInitialLogsInput = { client: SocketRpcClient<WebSocket>; topics: LogTopic[] } & Omit<WatchLogsInput, "url">;

async function fetchInitialLogs({
  client,
  address,
  topics,
  fromBlock,
}: FetchInitialLogsInput): Promise<{ blockNumber: bigint; logs: StoreEventsLog[] }> {
  // Fetch latest block number
  const latestBlockNumber: Hex = (
    await requestAsync(client, {
      body: {
        method: "eth_blockNumber",
      },
    })
  ).result;

  console.log("fetching initial logs from", Number(fromBlock), "to", parseInt(latestBlockNumber));

  // Request all logs from `fromBlock` to the latest block number
  const rawInitialLogs: RpcLog[] = await requestAsync(client, {
    body: {
      method: "eth_getLogs",
      params: [{ address, topics, fromBlock: toHex(fromBlock), toBlock: latestBlockNumber }],
    },
  }).then((res) => res.result);

  // Return all logs from `fromBlock` until the current pending block state as initial result
  const formattedLogs = rawInitialLogs.map((log) => formatLog(log));
  return { blockNumber: BigInt(latestBlockNumber), logs: parseEventLogs({ abi: storeEventsAbi, logs: formattedLogs }) };
}

type RpcResponse = Awaited<ReturnType<SocketRpcClient<WebSocket>["requestAsync"]>>;

async function requestAsync(
  client: SocketRpcClient<WebSocket>,
  params: Parameters<SocketRpcClient<WebSocket>["requestAsync"]>[0],
): ReturnType<SocketRpcClient<WebSocket>["requestAsync"]> {
  try {
    const [resolve, , promise] = deferred<RpcResponse>();
    client.request({
      ...params,
      onResponse: (msg) => {
        // console.log("resolving", msg);
        resolve(msg);
      },
      onError: (msg) => {
        console.warn("onError request, ignoring", msg);
      },
    });
    return promise;
  } catch (error) {
    console.error("requestAsync error", error);
    throw error;
  }
}
