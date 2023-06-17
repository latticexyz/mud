import { createPublicClient, http, fallback, webSocket } from "viem";
import { createBlockEventsStream, createBlockNumberStream, createBlockStream } from "@latticexyz/block-events-stream";
import { storeEventsAbi } from "@latticexyz/store";
import { createDatabase, createDatabaseClient } from "@latticexyz/store-cache";
import { getNetworkConfig } from "./getNetworkConfig";
import mudConfig from "contracts/mud.config";

export async function setupViemNetwork() {
  const { chain } = await getNetworkConfig();
  console.log("viem chain", chain);

  const publicClient = createPublicClient({
    chain,
    // TODO: use fallback with websocket first once encoding issues are fixed
    //       https://github.com/wagmi-dev/viem/issues/725
    // transport: fallback([webSocket(), http()]),
    transport: http(),
    // TODO: do this per chain? maybe in the MUDChain config?
    pollingInterval: 1000,
  });

  // Optional but recommended to avoid multiple instances of polling for blocks
  const latestBlock$ = await createBlockStream({ publicClient, blockTag: "latest" });
  const latestBlockNumber$ = await createBlockNumberStream({ block$: latestBlock$ });

  const blockEvents$ = await createBlockEventsStream({
    publicClient,
    events: storeEventsAbi,
    toBlock: latestBlockNumber$,
  });

  const db = createDatabase();
  const storeCache = createDatabaseClient(db, mudConfig);

  blockEvents$.subscribe((block) => {
    // TODO: iterate through events
    // TODO: parse event data
    // TODO: assemble and store schemas in store-cache
    // TODO: store records in store-cache
  });

  return {
    publicClient,
    storeCache,
    latestBlock$,
    latestBlockNumber$,
    blockEvents$,
  };
}
