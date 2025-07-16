import { Address, BlockNotFoundError, Log, LogTopic, RpcLog, RpcRequestError, formatLog, numberToHex } from "viem";
import { getHttpRpcClient } from "viem/utils";
import { GetRpcClientOptions, getRpcClient } from "./getRpcClient";
import { defineRpcRequest } from "./internal";
import { BlockRange } from "./common";

export type GetLogsOptions = GetRpcClientOptions &
  BlockRange & {
    /**
     * Optionally filter logs by contract address(es).
     */
    address?: Address | Address[];
    /**
     * Optionally filter logs by topics.
     */
    topics?: LogTopic[];
  };

/**
 * Returns logs for a given block range.
 * @internal
 */
export async function getLogs(opts: GetLogsOptions): Promise<Log[]> {
  const logsRequest = defineRpcRequest({
    method: "eth_getLogs",
    params: [
      {
        address: opts.address,
        topics: opts.topics,
        fromBlock: numberToHex(opts.fromBlock),
        toBlock: numberToHex(opts.toBlock),
      },
    ],
  });

  if (!opts.internal_clientOptions?.validateBlockRange) {
    const logs = await getRpcClient(opts).request(logsRequest);
    return logs.map((log) => formatLog(log));
  }

  // TODO: websocket support?
  const [url] = opts.internal_clientOptions.chain.rpcUrls.default.http;
  const rpcClient = getHttpRpcClient(url);

  const blockRequest = defineRpcRequest({
    method: "eth_getBlockByNumber",
    params: [numberToHex(opts.toBlock), false],
  });

  const [{ error: blockError, result: block }, { error: logsError, result: logs }] = await rpcClient.request({
    body: [blockRequest, logsRequest],
  });

  if (blockError) {
    // TODO: wrap this in an "unsynced rpc" error so we can retry
    throw new RpcRequestError({
      body: blockRequest,
      error: blockError,
      url,
    });
  }

  if (logsError) {
    throw new RpcRequestError({
      body: logsRequest,
      error: logsError,
      url,
    });
  }

  if (!block) {
    // TODO: wrap this in an "unsynced rpc" error so we can retry
    throw new BlockNotFoundError({ blockNumber: opts.toBlock });
  }

  return (logs as RpcLog[]).map((log) => formatLog(log));
}
