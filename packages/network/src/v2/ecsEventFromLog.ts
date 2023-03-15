import { Contract, utils } from "ethers";
import { Log } from "@ethersproject/providers";
import { LogDescription } from "@ethersproject/abi";
import { TableId } from "@latticexyz/utils";
import { NetworkComponentUpdate, NetworkEvents } from "../types";
import { decodeStoreSetRecord } from "./decodeStoreSetRecord";
import { decodeStoreSetField } from "./decodeStoreSetField";
import { EntityID } from "@latticexyz/recs";

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
  // TODO: revisit key tuple encoding for client
  const entity = args.key.join(":") as EntityID;

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
    const value = await decodeStoreSetRecord(contract, tableId, args.key, args.data);
    console.log("StoreSetRecord:", { table: tableId.toString(), component, entity, value });
    return {
      ...ecsEvent,
      value,
    };
  }

  if (name === "StoreSetField") {
    const { schema, value } = await decodeStoreSetField(contract, tableId, args.key, args.schemaIndex, args.data);
    console.log("StoreSetField:", { table: tableId.toString(), component, entity, value });

    // workaround for https://github.com/latticexyz/mud/issues/479
    // TODO: figure out if this is the approach we want to take
    const keysToUpdate = Object.keys(value);
    const expectedKeys = [...schema.staticFields, ...schema.dynamicFields].map((type, index) => `${index}`);
    if (expectedKeys.every((key) => keysToUpdate.includes(key))) {
      return {
        ...ecsEvent,
        value,
      };
    }

    return {
      ...ecsEvent,
      partialValue: value,
    };
  }

  if (name === "StoreDeleteRecord") {
    console.log("StoreDeleteRecord:", { table: tableId.toString(), component, entity });
    return ecsEvent;
  }
};
