import { Address, PublicClient, OnLogsFn, OnLogsParameter } from "viem";
import { StoreEvent, storeEventTopics } from "./createStoreFilter";

// TODO: specify return type
export function subscribeStoreEvents({
  client,
  address,
  onLogs,
}: {
  client: PublicClient;
  address: Address;
  onLogs: OnLogsFn<StoreEvent>;
}) {
  // TODO: replace this once viem supports multiple events/topics (https://github.com/wagmi-dev/viem/discussions/287)
  // TODO: refactor this to support RPCs with limits on number of logs returned (backfill with block ranges? see ponder for inspiration)
  const unsubscribePromise = (async () => {
    // const filter = await createStoreFilter({ client, address });

    // const timer = setInterval(async () => {
    //   const logs = await client.getFilterChanges({ filter });
    //   if (logs.length) {
    //     onLogs(logs as OnLogsParameter<StoreEvent>);
    //   }
    // }, 1000);

    // return async () => {
    //   clearInterval(timer);
    //   // TODO: replace with `uninstallFilter` once viem exposes it
    //   await client.request({ method: "eth_uninstallFilter", params: [filter.id] });
    // };
    console.log("subscribing");

    const { unsubscribe } = await client.transport.subscribe({
      params: [
        "logs",
        {
          address,
          topics: [storeEventTopics],
        },
      ],
      onData(data: any) {
        console.log("subscribe data", data);
      },
      onError(error: Error) {
        console.log("subscribe error", error);
      },
    });
    return () => unsubscribe();
  })();

  return async () => (await unsubscribePromise)();
}
