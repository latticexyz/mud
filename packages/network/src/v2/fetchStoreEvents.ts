import { Contract } from "ethers";
import { NetworkComponentUpdate, NetworkEvents } from "../types";
import { formatComponentID, formatEntityID } from "../utils";
import { orderBy } from "lodash";
import { isDefined } from "./utils/isDefined";
import { decodeStoreSetRecord } from "./decodeStoreSetRecord";
import { decodeStoreSetField } from "./decodeStoreSetField";
import { storeEvents } from "./constants";

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
    } else if (name === "StoreDeleteRecord") {
      // TODO
    }

    ecsEvents.push(ecsEvent);
  }

  return ecsEvents;
}
