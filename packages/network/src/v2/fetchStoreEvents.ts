import { Contract } from "ethers";
import { NetworkComponentUpdate } from "../types";
import orderBy from "lodash/orderBy";
import { isDefined } from "@latticexyz/utils";
import { storeEvents } from "./common";
import { ecsEventFromLog } from "./ecsEventFromLog";

export async function fetchStoreEvents(
  store: Contract,
  fromBlock: number,
  toBlock: number
): Promise<NetworkComponentUpdate[]> {
  // TODO: pass the chain ID as an argument
  const { chainId } = await store.provider.getNetwork();

  const topicSets = storeEvents.map((eventName) => store.filters[eventName]().topics).filter(isDefined);

  const logSets = await Promise.all(
    topicSets.map((topics) => store.provider.getLogs({ address: store.address, topics, fromBlock, toBlock }))
  );

  const logs = orderBy(
    logSets.flatMap((logs) => logs.map((log) => ({ log, parsedLog: store.interface.parseLog(log) }))),
    ["log.blockNumber", "log.logIndex"]
  );

  const lastLogForTx: Record<string, number> = {};
  logs.map(({ log }) => {
    lastLogForTx[log.transactionHash] = log.logIndex;
  });

  const unsortedEvents = await Promise.all(
    logs.map(({ log, parsedLog }) => {
      const { transactionHash, logIndex } = log;
      return ecsEventFromLog(chainId, store, log, parsedLog, lastLogForTx[transactionHash] === logIndex);
    })
  );

  const events = orderBy(unsortedEvents.filter(isDefined), ["blockNumber", "logIndex"]);

  // We defer the emissions of dev events because `ecsEventFromLog` is async and emitting them
  // from within that function causes them to arrive out of order. It's better if our emitter
  // can guarantee ordering for now.
  events.forEach((event) => event.devEmit());

  return events;
}
