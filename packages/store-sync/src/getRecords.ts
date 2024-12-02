import { fetchBlockLogs } from "@latticexyz/block-logs-stream";
import { Table } from "@latticexyz/config";
import { getSchemaPrimitives } from "@latticexyz/protocol-parser/internal";
import { LogToRecordArgs, flattenStoreLogs, getStoreLogs, logToRecord } from "@latticexyz/store/internal";
import { Address, createPublicClient, http } from "viem";
import { debug } from "./debug";
import { getSnapshot } from "./getSnapshot";
import { StorageAdapterLog } from "./common";

type GetRecordsOptions<table extends Table = Table> = {
  table: table;
  worldAddress: Address;
} & (
  | {
      indexerUrl: string;
      chainId: number;
    }
  | {
      rpcUrl: string;
      fromBlock?: bigint;
      toBlock?: bigint;
    }
);

type GetRecordsResult<table extends Table = Table> = {
  records: getSchemaPrimitives<table["schema"]>[];
  blockNumber: bigint;
};

export async function getRecords<table extends Table>(
  options: GetRecordsOptions<table>,
): Promise<GetRecordsResult<table>> {
  async function getLogs(): Promise<readonly StorageAdapterLog[]> {
    if ("indexerUrl" in options) {
      debug("fetching records for", options.table.label, "via indexer from", options.indexerUrl);
      const logs = await getSnapshot({
        chainId: options.chainId,
        address: options.worldAddress,
        indexerUrl: options.indexerUrl,
        filters: [{ tableId: options.table.tableId }],
      });
      // By default, the indexer includes the `store.Tables` table as part of the snapshot.
      // Once we change this default, we can remove the filter here.
      // See https://github.com/latticexyz/mud/issues/3386.
      return logs?.logs.filter((log) => log.args.tableId === options.table.tableId) ?? [];
    } else {
      debug("fetching records for", options.table.label, "via RPC from", options.rpcUrl);
      const client = createPublicClient({
        transport: http(options.rpcUrl),
      });
      const blockLogs = await fetchBlockLogs({
        fromBlock: options.fromBlock ?? 0n,
        toBlock: options.toBlock ?? (await client.getBlockNumber()),
        maxBlockRange: 100_000n,
        async getLogs({ fromBlock, toBlock }) {
          return getStoreLogs(client, {
            address: options.worldAddress,
            fromBlock,
            toBlock,
            tableId: options.table.tableId,
          });
        },
      });
      return flattenStoreLogs(blockLogs.flatMap((block) => block.logs));
    }
  }

  const logs = await getLogs();
  const records = logs.map((log) => logToRecord({ log: log as LogToRecordArgs<table>["log"], table: options.table }));
  const blockNumber = logs.length > 0 ? logs[logs.length - 1].blockNumber ?? 0n : 0n;
  debug("found", records.length, "records for table", options.table.label, "at block", blockNumber);
  return { records, blockNumber };
}
