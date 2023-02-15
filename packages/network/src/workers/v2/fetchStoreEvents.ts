import { ComponentValue } from "@latticexyz/recs";
import { Contract } from "ethers";
import { NetworkComponentUpdate, NetworkEvents } from "../../types";
import { formatComponentID, formatEntityID } from "../../utils";
import { orderBy } from "lodash";
import { registerSchema } from "./schemas";
import { decodeData } from "./decodeData";
import { isDefined } from "./isDefined";

// keccak256("mud.store.table.schema")
const schemaTableId = "0x466b87090ce2bc34362737dab7b900dfc94a202aee6a6323f6813f7ce59d975e";

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
  return decodeData(schema, data);
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
      // TODO: parallelize this
      const value = await decodeStoreSetRecord(contract, args.table.toHexString(), args.key, args.data);
      console.log("decoded value", value);
      ecsEvent.value = value;
    } else if (name === "StoreSetField") {
      // TODO: partial set
    }

    ecsEvents.push(ecsEvent);
  }

  return ecsEvents;
}
