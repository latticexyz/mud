import { getNetworkConfig } from "./getNetworkConfig";
import { createBlockEventsStream } from "@latticexyz/block-events-stream";
import { storeEventsAbi } from "@latticexyz/store";
import { createPublicClient, http, fallback, webSocket } from "viem";

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

  const stream = await createBlockEventsStream({
    publicClient,
    events: storeEventsAbi,
  });

  console.log("stream established");

  stream.subscribe((block) => {
    console.log("stream block", block);
  });
}
