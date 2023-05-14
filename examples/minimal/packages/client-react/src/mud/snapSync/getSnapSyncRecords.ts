import { RawTableRecord } from "@latticexyz/network";
import { TableId } from "@latticexyz/utils";
import snapSyncSystemAbi from "./snapSyncSystemAbi";
import { Contract, Signer, providers } from "ethers";
import { defineContractComponents } from "../contractComponents";

export async function getSnapSyncRecords(
  worldAddress: string,
  contractComponents: ReturnType<typeof defineContractComponents>,
  currentBlockNumber: number,
  signerOrProvider: Signer | providers.JsonRpcProvider
) {
  const snapSyncContract = new Contract(worldAddress, snapSyncSystemAbi, signerOrProvider);

  const chunkSize = 100;
  const tableIds = Object.values(contractComponents).map((c) => c.metadata.contractId);
  const tableRecords = [] as RawTableRecord[];
  for (const tableId of tableIds) {
    const numKeys = (
      await snapSyncContract.callStatic["snapSync_system_getNumKeysInTable"](tableId, {
        blockTag: currentBlockNumber,
      })
    ).toNumber();
    if (numKeys === 0) continue;

    let remainingKeys = numKeys;
    const numChunks = Math.ceil(numKeys / chunkSize);
    for (let i = 0; i < numChunks; i++) {
      const limit = Math.min(remainingKeys, chunkSize);
      const offset = i * chunkSize;
      remainingKeys -= limit;

      const records = await snapSyncContract.callStatic["snapSync_system_getRecords"](tableId, limit, offset, {
        blockTag: currentBlockNumber,
      });
      const transformedRecords = records.map((record: [string, string[], string]) => {
        return {
          tableId: TableId.fromHexString(record[0]),
          keyTuple: record[1],
          value: record[2],
        };
      });
      tableRecords.push(...transformedRecords);
    }
  }

  return tableRecords;
}
