import { useStore } from "../useStore";

export function NetworkSummary() {
  const publicClient = useStore((state) => state.publicClient);
  const blockNumber = useStore((state) => state.blockNumber);
  const worldAddress = useStore((state) => state.worldAddress);

  return (
    <dl className="grid grid-cols-[max-content,1fr] gap-x-4">
      <dt className="text-amber-200/80">Chain</dt>
      <dd className="text-sm">
        {publicClient?.chain?.id} ({publicClient?.chain?.name})
      </dd>

      <dt className="text-amber-200/80">Block number</dt>
      <dd className="text-sm">{blockNumber?.toString()}</dd>

      <dt className="text-amber-200/80">RPC</dt>
      <dd className="text-sm text-green-500">Connected ✓</dd>

      <dt className="text-amber-200/80">MODE</dt>
      <dd className="text-sm text-white/40">Not available</dd>

      <dt className="text-amber-200/80">World</dt>
      <dd className="text-sm">{worldAddress}</dd>
    </dl>
  );
}
