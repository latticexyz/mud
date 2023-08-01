import { Entity } from "@latticexyz/recs";
import { NetworkEvents, RawTableRecord } from "../types";
import { decodeStoreSetRecord } from "./decodeStoreSetRecord";
import { Contract } from "ethers";
import { keyTupleToEntityID } from "./keyTupleToEntityID";
import { NetworkComponentUpdate } from "../types";
import { TableId } from "@latticexyz/common";

export async function transformTableRecordsIntoEvents(
  storeContract: Contract,
  records: RawTableRecord[],
  blockNumber: number
): Promise<NetworkComponentUpdate[]> {
  const events = [] as NetworkComponentUpdate[];

  for (const record of records) {
    const { tableId, keyTuple, value } = record;
    const useTableId = TableId.fromHex(TableId.toHex(tableId.namespace, tableId.name));
    const { indexedValues, namedValues, indexedKey, namedKey } = await decodeStoreSetRecord(
      storeContract,
      useTableId,
      keyTuple,
      value
    );
    const key = { ...indexedKey, ...namedKey };
    const component = useTableId.toString();
    const entityId = keyTupleToEntityID(keyTuple);

    const ecsEvent = {
      type: NetworkEvents.NetworkComponentUpdate,
      component,
      entity: entityId as Entity,
      key,
      value: { ...indexedValues, ...namedValues },
      lastEventInTx: false,
      txHash: "cache",
      blockNumber,
      namespace: tableId.namespace,
      table: tableId.name,
    } satisfies NetworkComponentUpdate;

    events.push(ecsEvent);
  }

  return events;
}
