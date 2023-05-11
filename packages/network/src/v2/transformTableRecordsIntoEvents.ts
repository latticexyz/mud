import { Entity } from "@latticexyz/recs";
import { NetworkEvents, RawTableRecord } from "../types";
import { decodeStoreSetRecord } from "./decodeStoreSetRecord";
import { Contract } from "ethers";
import { keyTupleToEntityID } from "./keyTupleToEntityID";
import { NetworkComponentUpdate } from "../types";

export async function transformTableRecordsIntoEvents(
  storeContract: Contract,
  records: RawTableRecord[],
  blockNumber: number
): Promise<NetworkComponentUpdate[]> {
  const events = [] as NetworkComponentUpdate[];

  for (const record of records) {
    const { tableId, keyTuple, value } = record;
    const decodedValue = await decodeStoreSetRecord(storeContract, tableId, keyTuple, value);
    const component = tableId.toString();
    const entityId = keyTupleToEntityID(keyTuple);

    const ecsEvent = {
      type: NetworkEvents.NetworkComponentUpdate,
      component,
      entity: entityId as Entity,
      value: decodedValue.namedValues,
      lastEventInTx: false,
      txHash: "cache",
      blockNumber,
    } satisfies NetworkComponentUpdate;

    events.push(ecsEvent);
  }

  return events;
}
