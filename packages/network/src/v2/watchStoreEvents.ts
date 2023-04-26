import { Address, PublicClient, OnLogsFn, OnLogsParameter } from "viem";
import { createStoreFilter, StoreEvent } from "./createStoreFilter";

// TODO: specify return type
export function watchStoreEvents({
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
  const unwatchPromise = (async () => {
    const filter = await createStoreFilter({ client, address });

    const getLogs = async () => {
      const logs = await client.getFilterChanges({ filter });
      if (logs.length) {
        onLogs(logs as OnLogsParameter<StoreEvent>);
      }
    };

    getLogs();
    const timer = setInterval(getLogs, 1000);

    return async () => {
      clearInterval(timer);
      // TODO: replace with `uninstallFilter` once viem exposes it
      // await client.request({ method: "eth_uninstallFilter", params: [filter.id] });
      // don't uninstall because it costs rpc credits and will get cleaned up anyway
    };
  })();

  return async () => {
    const unwatch = await unwatchPromise;
    unwatch();
  };
}
