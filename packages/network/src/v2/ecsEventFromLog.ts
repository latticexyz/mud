import { Contract } from "ethers";
import { NetworkComponentUpdate, NetworkEvents } from "../types";
import { formatComponentID, formatEntityID } from "../utils";
import { decodeStoreSetRecord } from "./decodeStoreSetRecord";
import { decodeStoreSetField } from "./decodeStoreSetField";
import { Log } from "@ethersproject/providers";
import { LogDescription } from "@ethersproject/abi";

export const ecsEventFromLog = async (
  contract: Contract,
  log: Log,
  parsedLog: LogDescription,
  lastEventInTx: boolean
): Promise<NetworkComponentUpdate | undefined> => {
  const { blockNumber, transactionHash, logIndex } = log;
  const { args, name } = parsedLog;

  const component = formatComponentID(args.table);
  // TODO: support key tuples
  const entity = formatEntityID(args.key[0]);

  const ecsEvent: NetworkComponentUpdate = {
    type: NetworkEvents.NetworkComponentUpdate,
    component,
    entity,
    value: undefined,
    blockNumber,
    txHash: transactionHash,
    logIndex,
    lastEventInTx,
  };

  if (name === "StoreSetRecord") {
    const value = await decodeStoreSetRecord(contract, args.table.toHexString(), args.key, args.data);
    console.log("StoreSetRecord:", { component, entity, value });
    return {
      ...ecsEvent,
      value,
    };
  }

  if (name === "StoreSetField") {
    const value = await decodeStoreSetField(contract, args.table.toHexString(), args.key, args.schemaIndex, args.data);
    console.log("StoreSetField:", { component, entity, value });
    return {
      ...ecsEvent,
      partialValue: value,
    };
  }

  if (name === "StoreDeleteRecord") {
    console.log("StoreDeleteRecord:", { component, entity });
    return ecsEvent;
  }
};
