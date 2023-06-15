import { getNetworkConfig } from "./getNetworkConfig";
import { createBlockEventsStream } from "@latticexyz/block-events-stream";
import { storeEventsAbi } from "@latticexyz/store";
import { createPublicClient, http, fallback, webSocket } from "viem";

export async function setupViemNetwork() {
  const { chain } = await getNetworkConfig();
  console.log("viem chain", chain);

  const publicClient = createPublicClient({
    chain,
    transport: fallback([webSocket(), http()]),
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
