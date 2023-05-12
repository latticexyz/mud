import { Contract, utils } from "ethers";
import { Log } from "@ethersproject/providers";
import { LogDescription } from "@ethersproject/abi";
import { TableId } from "@latticexyz/utils";
import { NetworkComponentUpdate, NetworkEvents } from "../types";
import { decodeStoreSetRecord } from "./decodeStoreSetRecord";
import { decodeStoreSetField } from "./decodeStoreSetField";
import { keyTupleToEntityID } from "./keyTupleToEntityID";
import * as devObservables from "../dev/observables";
import { registerSchema } from "./schemas/tableSchemas";
import { decodeKeyTuple } from "./schemas/decodeKeyTuple";

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
    const { indexedValues, namedValues, indexedKey, namedKey } = await decodeStoreSetRecord(
      contract,
      tableId,
      args.key,
      args.data
    );
    return {
      ...ecsEvent,
      value: {
        ...indexedValues,
        ...namedValues,
      },
      key: {
        ...indexedKey,
        ...namedKey,
      },
      devEmit: () => {
        devObservables.storeEvent$.next({
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

  if (name === "StoreEphemeralRecord") {
    const { indexedValues, namedValues, indexedKey, namedKey } = await decodeStoreSetRecord(
      contract,
      tableId,
      args.key,
      args.data
    );
    return {
      ...ecsEvent,
      ephemeral: true,
      value: {
        ...indexedValues,
        ...namedValues,
      },
      key: {
        ...indexedKey,
        ...namedKey,
      },
      devEmit: () => {
        devObservables.storeEvent$.next({
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
    const { indexedValues, indexedInitialValues, namedValues, namedInitialValues, indexedKey, namedKey } =
      await decodeStoreSetField(contract, tableId, args.key, args.schemaIndex, args.data);
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
      key: {
        ...indexedKey,
        ...namedKey,
      },
      devEmit: () => {
        devObservables.storeEvent$.next({
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
    const { keySchema } = await registerSchema(contract, tableId);
    const indexedKey = decodeKeyTuple(keySchema, args.key);

    return {
      ...ecsEvent,
      key: indexedKey,
      devEmit: () => {
        devObservables.storeEvent$.next({
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
