import { fetchBlockLogs } from "@latticexyz/block-logs-stream";
import { Table } from "@latticexyz/config";
import { getSchemaPrimitives } from "@latticexyz/protocol-parser/internal";
import { LogToRecordArgs, flattenStoreLogs, getStoreLogs, logToRecord } from "@latticexyz/store/internal";
import { Address, Client, createClient, http } from "viem";
import { getAction } from "viem/utils";
import { getBlockNumber } from "viem/actions";
import { debug } from "./debug";
import { getSnapshot } from "./getSnapshot";
import { StorageAdapterLog } from "./common";

type GetRecordsOptions<table extends Table = Table> = {
  table: table;
  worldAddress: Address;
  fromBlock?: bigint;
  toBlock?: bigint;
} & (
  | {
      indexerUrl: string;
      chainId: number;
      rpcUrl?: string;
      client?: Client;
    }
  | {
      indexerUrl?: string;
      chainId?: number;
      rpcUrl: string;
      client?: Client;
    }
  | {
      indexerUrl?: string;
      chainId?: number;
      rpcUrl?: string;
      client: Client;
    }
);

type GetRecordsResult<table extends Table = Table> = {
  records: getSchemaPrimitives<table["schema"]>[];
  blockNumber: bigint;
};

export async function getRecords<table extends Table>(
  options: GetRecordsOptions<table>,
): Promise<GetRecordsResult<table>> {
  const logs = await getRecordsAsLogs(options);
  const records = logs.map((log) => logToRecord({ log: log as never, table: options.table }));
  const blockNumber = logs.length > 0 ? logs[logs.length - 1].blockNumber ?? 0n : 0n;
  debug("found", records.length, "records for table", options.table.label, "at block", blockNumber);
  return { records, blockNumber };
}

export async function getRecordsAsLogs<table extends Table>(
  options: GetRecordsOptions<table>,
): Promise<readonly Extract<StorageAdapterLog, { eventName: "Store_SetRecord" }>[]> {
  if (options.indexerUrl && options.chainId) {
    debug("fetching records for", options.table.label, "via indexer from", options.indexerUrl);
    const snapshot = await getSnapshot({
      chainId: options.chainId,
      address: options.worldAddress,
      indexerUrl: options.indexerUrl,
      filters: [{ tableId: options.table.tableId }],
    });
    // By default, the indexer includes the `store.Tables` table as part of the snapshot.
    // Once we change this default, we can remove the filter here.
    // See https://github.com/latticexyz/mud/issues/3386.
    return (snapshot?.logs.filter((log) => log.args.tableId === options.table.tableId) ?? []) as never;
  }

  const client =
    options.client ??
    createClient({
      transport: http(options.rpcUrl),
    });
  debug("fetching records for", options.table.label, "via RPC from", client.transport.url);
  const blockLogs = await fetchBlockLogs({
    fromBlock: options.fromBlock ?? 0n,
    toBlock: options.toBlock ?? (await getAction(client, getBlockNumber, "getBlockNumber")({})),
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
