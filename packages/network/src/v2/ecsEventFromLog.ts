import { Contract, utils } from "ethers";
import { Log } from "@ethersproject/providers";
import { LogDescription } from "@ethersproject/abi";
import { TableId } from "@latticexyz/utils";
import { NetworkComponentUpdate, NetworkEvents } from "../types";
import { decodeStoreSetRecord } from "./decodeStoreSetRecord";
import { decodeStoreSetField } from "./decodeStoreSetField";
import { keyTupleToEntityID } from "./keyTupleToEntityID";
import { emitter as devEmitter } from "../dev/emitter";

export const ecsEventFromLog = async (
  chainId: number,
  contract: Contract,
  log: Log,
  parsedLog: LogDescription,
  lastEventInTx: boolean
): Promise<(NetworkComponentUpdate & { devEmit: () => void }) | undefined> => {
  const { blockNumber, transactionHash, logIndex } = log;
  const { args, name } = parsedLog;

  const tableId = TableId.fromBytes32(utils.arrayify(args.table));
  const component = tableId.toString();
  const entity = keyTupleToEntityID(args.key);

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
    const { indexedValues, namedValues } = await decodeStoreSetRecord(contract, tableId, args.key, args.data);
    console.log("StoreSetRecord:", { table: tableId.toString(), component, entity, indexedValues, namedValues });
    return {
      ...ecsEvent,
      value: {
        ...indexedValues,
        ...namedValues,
      },
      devEmit: () => {
        devEmitter.emit("storeEvent", {
          event: name,
          chainId,
          worldAddress: contract.address,
          blockNumber,
          logIndex,
          transactionHash,
          table: tableId,
          keyTuple: args.key,
          indexedValues,
          namedValues,
        });
      },
    };
  }

  if (name === "StoreSetField") {
    const { indexedValues, indexedInitialValues, namedValues, namedInitialValues } = await decodeStoreSetField(
      contract,
      tableId,
      args.key,
      args.schemaIndex,
      args.data
    );
    console.log("StoreSetField:", { table: tableId.toString(), component, entity, indexedValues, namedValues });
    return {
      ...ecsEvent,
      partialValue: {
        ...indexedValues,
        ...namedValues,
      },
      initialValue: {
        ...indexedInitialValues,
        ...namedInitialValues,
      },
      devEmit: () => {
        devEmitter.emit("storeEvent", {
          event: name,
          chainId,
          worldAddress: contract.address,
          blockNumber,
          logIndex,
          transactionHash,
          table: tableId,
          keyTuple: args.key,
          indexedValues,
          namedValues,
        });
      },
    };
  }

  if (name === "StoreDeleteRecord") {
    console.log("StoreDeleteRecord:", { table: tableId.toString(), component, entity });
    return {
      ...ecsEvent,
      devEmit: () => {
        devEmitter.emit("storeEvent", {
          event: name,
          chainId,
          worldAddress: contract.address,
          blockNumber,
          logIndex,
          transactionHash,
          table: tableId,
          keyTuple: args.key,
        });
      },
    };
  }
};
