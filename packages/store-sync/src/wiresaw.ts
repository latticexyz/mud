import { Observable } from "rxjs";
import { Hex, LogTopic, RpcLog, encodeEventTopics, formatLog, parseEventLogs, toHex } from "viem";
import { StorageAdapterBlock, StoreEventsLog } from "./common";
import { storeEventsAbi } from "@latticexyz/store";
import { logSort } from "@latticexyz/common";
import { SocketRpcClient, getWebSocketRpcClient } from "viem/utils";
import { debug } from "./debug";

type WatchLogsInput = {
  url: string;
  fromBlock: bigint;
  address?: Hex;
};

type WatchLogsResult = {
  logs$: Observable<StorageAdapterBlock>;
};

export function watchLogs({ url, address, fromBlock }: WatchLogsInput): WatchLogsResult {
  const topics = [
    storeEventsAbi.flatMap((event) => encodeEventTopics({ abi: [event], eventName: event.name })),
  ] as LogTopic[]; // https://github.com/wevm/viem/blob/63a5ac86eb9a2962f7323b4cc76ef54f9f5ef7ed/src/actions/public/getLogs.ts#L171

  let resumeBlock = fromBlock;
  let keepAliveInterval: ReturnType<typeof setTimeout> | undefined = undefined;
  const logs$ = new Observable<StorageAdapterBlock>((subscriber) => {
    let client: SocketRpcClient<WebSocket>;

    function setupClient(): void {
      // Buffer the live logs received until the gap from `startBlock` to `currentBlock` is closed
      let caughtUp = false;
      const logBuffer: StoreEventsLog[] = [];

      getWebSocketRpcClient(url, {
        keepAlive: false, // keepAlive is handled below
      }).then(async (_client) => {
        client = _client;
        client.socket.addEventListener("error", (error) =>
          subscriber.error({ code: -32603, message: "WebSocket error", data: error }),
        );

        // Start watching pending logs
        const subscriptionId: Hex = (
          await client.requestAsync({
            body: {
              method: "wiresaw_watchLogs",
              params: [{ address, topics }],
            },
          })
        ).result;

        // Listen for wiresaw_watchLogs subscription
        // Need to use low level methods since viem's socekt client only handles `eth_subscription` messages.
        // (https://github.com/wevm/viem/blob/f81d497f2afc11b9b81a79057d1f797694b69793/src/utils/rpc/socket.ts#L178)
        client.socket.addEventListener("message", (message) => {
          const response = JSON.parse(message.data);
          if ("error" in response) {
            // Return JSON-RPC errors to the subscriber
            subscriber.error(response.error);
            return;
          }

          // Parse the logs from wiresaw_watchLogs
          if ("params" in response && response.params.subscription === subscriptionId) {
            const logs: RpcLog[] = response.params.result;
            const formattedLogs = logs.map((log) => formatLog(log));
            const parsedLogs = parseEventLogs({ abi: storeEventsAbi, logs: formattedLogs });
            if (caughtUp) {
              const blockNumber = parsedLogs[0].blockNumber;
              subscriber.next({ blockNumber, logs: parsedLogs });
              resumeBlock = blockNumber + 1n;
            } else {
              logBuffer.push(...parsedLogs);
            }
          }
        });

        // Catch up to the pending logs
        try {
          const initialLogs = await fetchInitialLogs({ client, address, fromBlock: resumeBlock, topics });
          const logs = [...initialLogs, ...logBuffer].sort(logSort);
          const blockNumber = logs.at(-1)?.blockNumber ?? resumeBlock;
          subscriber.next({ blockNumber, logs: initialLogs });
          resumeBlock = blockNumber + 1n;
          caughtUp = true;
        } catch (e) {
          subscriber.error("Could not fetch initial wiresaw logs");
        }

        // Keep websocket alive and reconnect if it's not alive anymore
        keepAliveInterval = setInterval(async () => {
          try {
            await Promise.race([
              client.requestAsync({ body: { method: "net_version" } }),
              new Promise<void>((_, reject) => {
                setTimeout(reject, 2000);
              }),
            ]);
          } catch {
            debug("Detected unresponsive websocket, reconnecting...");
            clearInterval(keepAliveInterval);
            client.close();
            setupClient();
          }
        }, 3000);
      });
    }

    setupClient();

    return () => {
      client?.close();
      if (keepAliveInterval != null) {
        clearInterval(keepAliveInterval);
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
}: FetchInitialLogsInput): Promise<StoreEventsLog[]> {
  // Fetch latest block number
  const latestBlockNumber: Hex = (
    await client.requestAsync({
      body: {
        method: "eth_blockNumber",
      },
    })
  ).result;

  const [catchUpLogs, pendingLogs] = await Promise.all([
    // Request all logs from `fromBlock` to the latest block number
    client.requestAsync({
      body: {
        method: "eth_getLogs",
        params: [{ address, topics, fromBlock: toHex(fromBlock), toBlock: latestBlockNumber }],
      },
    }),
    // Request all logs from the current pending block
    client.requestAsync({
      body: {
        method: "wiresaw_getLogs",
        params: [{ address, topics, fromBlock: latestBlockNumber }],
      },
    }),
  ]);

  // Return all logs from `fromBlock` until the current pending block state as initial result
  const rawLogs: RpcLog[] = [...catchUpLogs.result, ...pendingLogs.result];
  const formattedLogs = rawLogs.map((log) => formatLog(log));
  return parseEventLogs({ abi: storeEventsAbi, logs: formattedLogs });
}
