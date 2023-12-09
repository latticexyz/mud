import { PublicClient, encodePacked, getAddress } from "viem";
import { StorageAdapterBlock } from "../common";
import { PgDatabase, QueryResultHKT } from "drizzle-orm/pg-core";
import { uniqueBy } from "@latticexyz/common/utils";
import { tables } from "./tables";
import { and, eq } from "drizzle-orm";
import StoreAbi from "@latticexyz/store/out/IStore.sol/IStore.abi.json";
import { error } from "../debug";

export async function verifyRecords({
  block,
  publicClient,
  database,
}: {
  block: StorageAdapterBlock;
  publicClient: PublicClient;
  database: PgDatabase<QueryResultHKT>;
}): Promise<void> {
  const updatedRecords = uniqueBy(
    block.logs.map((log) => ({
      address: getAddress(log.address),
      tableId: log.args.tableId,
      keyTuple: log.args.keyTuple,
      keyBytes: encodePacked(["bytes32[]"], [log.args.keyTuple]),
    })),
    (record) => `${record.address}:${record.tableId}:${record.keyBytes}`
  );

  await Promise.all(
    updatedRecords.map(async (record) => {
      const row = await database
        .select()
        .from(tables.recordsTable)
        .where(
          and(
            eq(tables.recordsTable.address, record.address),
            eq(tables.recordsTable.tableId, record.tableId),
            eq(tables.recordsTable.keyBytes, record.keyBytes)
          )
        )
        .limit(1)
        .execute()
        // Get the first record in a way that returns a possible `undefined`
        // TODO: move this to `.findFirst` after upgrading drizzle or `rows[0]` after enabling `noUncheckedIndexedAccess: true`
        .then((rows) => rows.find(() => true));

      const databaseRecord = [row?.staticData ?? "0x", row?.encodedLengths ?? "0x", row?.dynamicData ?? "0x"];
      const chainRecord = await publicClient.readContract({
        address: record.address,
        abi: StoreAbi,
        functionName: "getRecord",
        args: [record.tableId, record.keyTuple],
        blockNumber: block.blockNumber,
      });

      if (JSON.stringify(databaseRecord) !== JSON.stringify(chainRecord)) {
        error(
          "database record did not match chain state",
          JSON.stringify({
            address: record.address,
            tableId: record.tableId,
            keyTuple: record.keyTuple,
            databaseRecord,
            chainRecord,
          })
        );
      }
    })
  );
}
