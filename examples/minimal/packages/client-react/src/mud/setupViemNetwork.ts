import { getNetworkConfig } from "./getNetworkConfig";
import { createBlockEventsStream } from "@latticexyz/block-events-stream";
// import { storeEventsAbi } from "@latticexyz/store";
import { createPublicClient, http, fallback, webSocket } from "viem";
import { parseAbi } from "viem/abi";

// TODO: import from store once we move aside the solidity codegen stuff that breaks browser bundles
export const storeEvents = [
  "event StoreDeleteRecord(bytes32 table, bytes32[] key)",
  "event StoreSetField(bytes32 table, bytes32[] key, uint8 schemaIndex, bytes data)",
  "event StoreSetRecord(bytes32 table, bytes32[] key, bytes data)",
  "event StoreEphemeralRecord(bytes32 table, bytes32[] key, bytes data)",
] as const;
export const storeEventsAbi = parseAbi(storeEvents);

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
