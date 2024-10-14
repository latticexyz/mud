import { Observable } from "rxjs";
import { Hex, LogTopic, RpcLog, encodeEventTopics, formatLog, parseEventLogs, toHex } from "viem";
import { StorageAdapterBlock, StoreEventsLog } from "./common";
import { storeEventsAbi } from "@latticexyz/store";
import { logSort } from "@latticexyz/common";

type WatchLogsInput = {
  url: string;
  fromBlock: bigint;
  address: Hex;
};

type WatchLogsResult = {
  logs$: Observable<StorageAdapterBlock>;
};

type JsonRpcInput = {
  id: string;
} & (
  | { method: "eth_blockNumber"; params: [] }
  | { method: "eth_getLogs"; params: [{ address: Hex; topics: LogTopic[]; fromBlock: Hex; toBlock: Hex }] }
  | { method: "wiresaw_getLogs"; params: [{ address: Hex; topics: LogTopic[]; fromBlock: Hex }] }
  | { method: "wiresaw_watchLogs"; params: [{ address: Hex; topics: LogTopic[] }] }
);

function jsonRpc(input: JsonRpcInput): string {
  return JSON.stringify({
    jsonRpc: "2.0",
    ...input,
  });
}

export function watchLogs({ url, address, fromBlock }: WatchLogsInput): WatchLogsResult {
  const blockNumberId = `blockNumber+` + Date.now();
  const getLogsId = `getLogs+` + Date.now();
  const getPendingLogsId = `getPendingLogs+` + Date.now();
  const watchLogsId = `watchLogs+` + Date.now();

  // Buffer the live logs received until the gap from `startBlock` to `currentBlock` is closed
  let ready = false;
  const logBuffer: StoreEventsLog[] = [];

  let subscriptionId: Hex | undefined;
  const topics = [
    storeEventsAbi.flatMap((event) => encodeEventTopics({ abi: [event], eventName: event.name })),
  ] as LogTopic[]; // https://github.com/wevm/viem/blob/63a5ac86eb9a2962f7323b4cc76ef54f9f5ef7ed/src/actions/public/getLogs.ts#L171

  const logs$ = new Observable<StorageAdapterBlock>((subscriber) => {
    const ws = new WebSocket(url);

    ws.addEventListener("open", () => {
      // Open the watchLogs subscription
      ws.send(
        jsonRpc({
          id: watchLogsId,
          method: "wiresaw_watchLogs",
          params: [{ address, topics }],
        }),
      );

      // Fetch the current block number
      ws.send(
        jsonRpc({
          id: blockNumberId,
          method: "eth_blockNumber",
          params: [],
        }),
      );
    });

    ws.addEventListener("message", (message) => {
      const response = JSON.parse(message.data);
      if ("error" in response) {
        subscriber.error(response.error);
      }

      // Store the subscription ID to be able to filter relevant messages
      if (response.id === watchLogsId) {
        subscriptionId = response.result;
        return;
      }

      if (response.id === blockNumberId) {
        // Request the logs from the start block number till the current block number
        const currentBlockNumber = response.result;
        ws.send(
          jsonRpc({
            id: getLogsId,
            method: "eth_getLogs",
            params: [{ address, topics, fromBlock: toHex(fromBlock), toBlock: currentBlockNumber }],
          }),
        );

        // Request the logs from the current pending block
        ws.send(
          jsonRpc({
            id: getPendingLogsId,
            method: "wiresaw_getLogs",
            params: [{ address, topics, fromBlock: currentBlockNumber }],
          }),
        );

        return;
      }

      // Process the initial `getLogs` result
      // TODO: also process the `wiresaw_getLogs` request
      // TODO: refactor to use Promise for the initial requests
      if (response.id === getLogsId) {
        const logs: RpcLog[] = response.params.result;
        const formattedLogs = logs.map((log) => formatLog(log));
        const parsedLogs = parseEventLogs({ abi: storeEventsAbi, logs: formattedLogs });
        const initialLogs = [...logBuffer, ...parsedLogs].sort(logSort);
        const blockNumber = initialLogs.at(-1)?.blockNumber ?? fromBlock;
        subscriber.next({ blockNumber, logs: initialLogs });
        ready = true;
      }

      // Return parsed logs from the `watchLogs` subscription to the subscriber
      if ("params" in response && response.params.subscription === subscriptionId) {
        const logs: RpcLog[] = response.params.result;
        const formattedLogs = logs.map((log) => formatLog(log));
        const parsedLogs = parseEventLogs({ abi: storeEventsAbi, logs: formattedLogs });
        if (ready) {
          const blockNumber = parsedLogs[0].blockNumber;
          subscriber.next({ blockNumber, logs: parsedLogs });
        } else {
          logBuffer.push(...parsedLogs);
        }
      }
    });

    ws.addEventListener("error", (error) =>
      subscriber.error({ code: -32603, message: "WebSocket error", data: error }),
    );

    subscriber.add(() => ws.close());
  });

  return { logs$ };
}
