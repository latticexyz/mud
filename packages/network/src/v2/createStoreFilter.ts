import { parseAbiItem, Address, PublicClient, encodeEventTopics } from "viem";

// TODO: it would be nice to import these abis from store, but we wouldn't get as strong of types without `as const` (needs codegen or TS fix)
// TODO: add tests to validate that these match store ABI and none are missing?
export const storeEvents = [
  parseAbiItem("event StoreSetRecord(bytes32 table, bytes32[] key, bytes data)"),
  parseAbiItem("event StoreSetField(bytes32 table, bytes32[] key, uint8 schemaIndex, bytes data)"),
  parseAbiItem("event StoreDeleteRecord(bytes32 table, bytes32[] key)"),
] as const;

export type StoreEvent = (typeof storeEvents)[number];

export const storeEventTopics = storeEvents.flatMap((event) =>
  encodeEventTopics({ abi: [event], eventName: event.name })
);

// TODO: this may not be needed once viem supports multiple events/topics (https://github.com/wagmi-dev/viem/discussions/287)
// TODO: specify return type
export async function createStoreFilter({ client, address }: { client: PublicClient; address: Address }) {
  const id = await client.request({
    method: "eth_newFilter",
    params: [
      {
        address,
        // this will probably break for stores with lots of historical events and should just be used to "frontfill"
        fromBlock: "earliest",
        topics: [storeEventTopics],
      },
    ],
  });
  return {
    type: "event",
    id,
    abi: storeEvents,
    // hack around `request` type since `createFilterRequestScope` and `Filter` are not exported by viem
    request: client.request as any,
  } as const;
}
