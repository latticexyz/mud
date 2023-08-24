import { useObservableValue } from "@latticexyz/react";
import { useDevToolsContext } from "../DevToolsContext";
import { map } from "rxjs";

export function NetworkSummary() {
  const { publicClient, worldAddress, latestBlock$ } = useDevToolsContext();
  const blockNumber = useObservableValue(latestBlock$.pipe(map((block) => block.number)));

  return (
    <dl className="grid grid-cols-[max-content,1fr] gap-x-4">
      <dt className="text-amber-200/80">Chain</dt>
      <dd className="text-sm">
        {publicClient.chain?.id} ({publicClient.chain?.name})
      </dd>

      <dt className="text-amber-200/80">Block number</dt>
      <dd className="text-sm">{blockNumber?.toString()}</dd>

      <dt className="text-amber-200/80">RPC</dt>
      <dd className="text-sm text-green-500">Connected ✓</dd>

      <dt className="text-amber-200/80">World</dt>
      <dd className="text-sm">{worldAddress}</dd>
    </dl>
  );
}
