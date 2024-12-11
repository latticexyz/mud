import {
  AbiEvent,
  BlockNumber,
  BlockTag,
  GetLogsParameters,
  GetLogsReturnType,
  EncodeEventTopicsParameters,
  LogTopic,
  RpcLog,
  encodeEventTopics,
  formatLog,
  numberToHex,
  parseEventLogs,
  toHex,
  Block,
} from "viem";
import { HttpRpcUrl, blockNotFoundMessage } from "./common";

/**
 * Mostly equivalent to viem's `getLogs` action, but using a batch rpc call to check if the RPC has the requested block.
 * If the RPC doesn't have the requested block, it will throw a "block not found" error.
 * Expects a HTTP RPC endpoint that supports batch requests.
 */
export async function getLogsFromLoadBalancedRpc<
  const abiEvent extends AbiEvent | undefined = undefined,
  const abiEvents extends readonly AbiEvent[] | readonly unknown[] | undefined = abiEvent extends AbiEvent
    ? [abiEvent]
    : undefined,
  strict extends boolean | undefined = undefined,
  fromBlock extends BlockNumber | BlockTag | undefined = undefined,
  toBlock extends BlockNumber | BlockTag | undefined = undefined,
>({
  httpRpcUrl,
  address,
  fromBlock,
  toBlock,
  event,
  events: events_,
  args,
  strict: strict_,
}: Omit<GetLogsParameters<abiEvent, abiEvents, strict, fromBlock, toBlock>, "blockHash"> & {
  httpRpcUrl: HttpRpcUrl;
}): Promise<GetLogsReturnType<abiEvent, abiEvents, strict, fromBlock, toBlock>> {
  const strict = strict_ ?? false;
  const events = events_ ?? (event ? [event] : undefined);

  let topics: LogTopic[] = [];
  if (events) {
    const encoded = (events as AbiEvent[]).flatMap((event) =>
      encodeEventTopics({
        abi: [event],
        eventName: (event as AbiEvent).name,
        args: events_ ? undefined : args,
      } as EncodeEventTopicsParameters),
    );
    // TODO: Clean up type casting
    topics = [encoded as LogTopic];
    if (event) topics = topics[0] as LogTopic[];
  }

  const requests = [
    {
      method: "eth_getBlockByNumber",
      params: [typeof toBlock === "bigint" || typeof toBlock === "number" ? toHex(toBlock) : toBlock, false],
      id: 1,
      jsonrpc: "2.0",
    },
    {
      method: "eth_getLogs",
      params: [
        {
          address,
          topics,
          fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
          toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock,
        },
      ],
      id: 2,
      jsonrpc: "2.0",
    },
  ];

  const results: [Block | undefined, RpcLog[]] = await fetch(httpRpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requests),
  }).then((res) => res.json());

  const [block, logs] = results;

  if (!block) {
    // Throw an explicit error so the caller can retry instead of silently returning an empty array
    throw new Error(blockNotFoundMessage);
  }

  const formattedLogs = logs.map((log) => formatLog(log));
  if (!events) return formattedLogs as GetLogsReturnType<abiEvent, abiEvents, strict, fromBlock, toBlock>;
  return parseEventLogs({
    abi: events,
    args: args as never,
    logs: formattedLogs,
    strict,
  }) as unknown as GetLogsReturnType<abiEvent, abiEvents, strict, fromBlock, toBlock>;
}
