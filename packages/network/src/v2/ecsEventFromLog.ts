import { Contract, utils } from "ethers";
import { Log } from "@ethersproject/providers";
import { LogDescription } from "@ethersproject/abi";
import { TableId } from "@latticexyz/utils";
import { NetworkComponentUpdate, NetworkEvents } from "../types";
import { decodeStoreSetRecord } from "./decodeStoreSetRecord";
import { decodeStoreSetField } from "./decodeStoreSetField";
import { keyTupleToEntityID } from "./keyTupleToEntityID";

export const ecsEventFromLog = async (
  contract: Contract,
  log: Log,
  parsedLog: LogDescription,
  lastEventInTx: boolean
): Promise<NetworkComponentUpdate | undefined> => {
  const { blockNumber, transactionHash, logIndex } = log;
  const { args, name } = parsedLog;

  const tableId = TableId.fromBytes32(utils.arrayify(args.table));
  const component = tableId.toString();
  const entity = keyTupleToEntityID(args.key);

  const ecsEvent = {
    type: NetworkEvents.NetworkComponentUpdate,
    component,
    entity,
    value: undefined,
    blockNumber,
    txHash: transactionHash,
    logIndex,
    lastEventInTx,
  } satisfies NetworkComponentUpdate;

  if (name === "StoreSetRecord") {
    const value = await decodeStoreSetRecord(contract, tableId, args.key, args.data);
    console.log("StoreSetRecord:", { table: tableId.toString(), component, entity, value });
    return {
      ...ecsEvent,
      value,
    };
  }

  if (name === "StoreEphemeralRecord") {
    const value = await decodeStoreSetRecord(contract, tableId, args.key, args.data);
    console.log("StoreEphemeralRecord:", { table: tableId.toString(), component, entity, value });
    return {
      ...ecsEvent,
      ephemeral: true,
      value,
    };
  }

  if (name === "StoreSetField") {
    const { value, initialValue } = await decodeStoreSetField(contract, tableId, args.key, args.schemaIndex, args.data);
    console.log("StoreSetField:", { table: tableId.toString(), component, entity, value });

    return {
      ...ecsEvent,
      partialValue: value,
      initialValue,
    };
  }

  if (name === "StoreDeleteRecord") {
    console.log("StoreDeleteRecord:", { table: tableId.toString(), component, entity });
    return ecsEvent;
  }
};
