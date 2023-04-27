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
    // TODO: figure out a better place for this emission? maybe network should expose a global emitter that dev tools listen to rather than other way around?
    devEmitter.emit("storeEvent", {
      event: name,
      // TODO: figure out how to get chainId here
      chainId: 31337,
      worldAddress: contract.address,
      blockNumber,
      logIndex,
      transactionHash,
      table: tableId,
      keyTuple: args.key,
      indexedValues,
      namedValues,
    });
    return {
      ...ecsEvent,
      value: {
        ...indexedValues,
        ...namedValues,
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
    // TODO: figure out a better place for this emission? maybe network should expose a global emitter that dev tools listen to rather than other way around?
    devEmitter.emit("storeEvent", {
      event: name,
      // TODO: figure out how to get chainId here
      chainId: 31337,
      worldAddress: contract.address,
      blockNumber,
      logIndex,
      transactionHash,
      table: tableId,
      keyTuple: args.key,
      indexedValues,
      namedValues,
    });
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
    };
  }

  if (name === "StoreDeleteRecord") {
    console.log("StoreDeleteRecord:", { table: tableId.toString(), component, entity });
    // TODO: figure out a better place for this emission? maybe network should expose a global emitter that dev tools listen to rather than other way around?
    devEmitter.emit("storeEvent", {
      event: name,
      // TODO: figure out how to get chainId here
      chainId: 31337,
      worldAddress: contract.address,
      blockNumber,
      logIndex,
      transactionHash,
      table: tableId,
      keyTuple: args.key,
    });
    return ecsEvent;
  }
};
