import { ComponentValue } from "@latticexyz/recs";
import { Contract, ethers } from "ethers";
import { NetworkComponentUpdate, NetworkEvents } from "../../types";
import { formatComponentID, formatEntityID } from "../../utils";
import { orderBy } from "lodash";
import { getMetadata, registerMetadata, registerSchema } from "./schemas";
import { decodeData, decodeField } from "./decodeData";
import { isDefined } from "./isDefined";
import { keccak256 } from "@latticexyz/utils";
import { arrayToHex } from "./arrayToHex";

const schemaTableId = keccak256("mud.store.table.schema");
const metadataTableId = keccak256("/store_internals/tables/StoreMetadata");

const storeEvents = ["StoreSetRecord", "StoreSetField", "StoreDeleteRecord"] as const;

async function decodeStoreSetRecord(
  contract: Contract,
  table: string,
  keyTuple: string[],
  data: string
): Promise<ComponentValue> {
  // registerSchema event
  if (table === schemaTableId) {
    const [tableForSchema, ...otherKeys] = keyTuple;
    if (otherKeys.length) {
      console.warn("registerSchema event has more than one value in key tuple", table, keyTuple);
    }
    registerSchema(contract, tableForSchema, data);
  }

  const schema = await registerSchema(contract, table);
  const decoded = decodeData(schema, data);

  if (table === metadataTableId) {
    const [tableForMetadata, ...otherKeys] = keyTuple;
    if (otherKeys.length) {
      console.warn("setMetadata event has more than one value in key tuple", table, keyTuple);
    }
    const tableName = decoded[0];
    const [fieldNames] = ethers.utils.defaultAbiCoder.decode(["string[]"], arrayToHex(decoded[1]));
    registerMetadata(contract, tableForMetadata, tableName, fieldNames);
  }

  const metadata = getMetadata(contract, table);
  if (metadata) {
    const { tableName, fieldNames } = metadata;
    const namedValues: Record<string, any> = {};
    for (const [index, fieldName] of fieldNames.entries()) {
      namedValues[fieldName] = decoded[index];
    }
    return {
      ...decoded,
      ...namedValues,
    };
  }

  return decoded;
}

async function decodeStoreSetField(
  contract: Contract,
  table: string,
  keyTuple: string[],
  schemaIndex: number,
  data: string
): Promise<ComponentValue> {
  const schema = await registerSchema(contract, table);
  const decoded = decodeField(schema, schemaIndex, data);

  const metadata = getMetadata(contract, table);
  if (metadata) {
    const { tableName, fieldNames } = metadata;
    return {
      ...decoded,
      [fieldNames[schemaIndex]]: decoded[schemaIndex],
    };
  }

  return decoded;
}

export async function fetchStoreEvents(contract: Contract, fromBlock: number, toBlock: number) {
  const topicSets = storeEvents.map((eventName) => contract.filters[eventName]().topics).filter(isDefined);

  const logSets = await Promise.all(
    topicSets.map((topics) => contract.provider.getLogs({ address: contract.address, topics, fromBlock, toBlock }))
  );

  const logs = orderBy(
    logSets.flatMap((logs) => logs.map((log) => ({ log, parsedLog: contract.interface.parseLog(log) }))),
    ["log.blockNumber", "log.logIndex"]
  );

  if (logs.length) {
    console.log("got store logs", logs);
  }

  const lastLogForTx: Record<string, number> = {};
  logs.map(({ log }) => {
    lastLogForTx[log.transactionHash] = log.logIndex;
  });

  const ecsEvents: NetworkComponentUpdate[] = [];

  // TODO: parallelize this
  for (const { log, parsedLog } of logs) {
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
      // TODO: this approach feels weird, refactor this?
      lastEventInTx: lastLogForTx[transactionHash] === logIndex,
    };

    if (name === "StoreSetRecord") {
      const value = await decodeStoreSetRecord(contract, args.table.toHexString(), args.key, args.data);
      console.log("decoded StoreSetRecord value", value);
      ecsEvent.value = value;
    } else if (name === "StoreSetField") {
      const value = await decodeStoreSetField(
        contract,
        args.table.toHexString(),
        args.key,
        args.schemaIndex,
        args.data
      );
      console.log("decoded StoreSetField value", value);
      ecsEvent.partialValue = value;
    }

    ecsEvents.push(ecsEvent);
  }

  return ecsEvents;
}
