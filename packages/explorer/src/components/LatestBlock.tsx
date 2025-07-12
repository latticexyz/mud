import { useBlockNumber } from "wagmi";
import { useChain } from "../app/(explorer)/hooks/useChain";
import { Skeleton } from "./ui/Skeleton";

export function LatestBlock() {
  const { id: chainId } = useChain();
  const { data: block } = useBlockNumber({
    watch: true,
    chainId,
    query: {
      refetchInterval: 2_000,
    },
  });

  return (
    <div className="inline-block w-[80px]">
      {block ? (
        <div className="flex items-center justify-end gap-x-2 text-xs font-extrabold text-green-600">
          <span className="inline-block h-[8px] w-[8px] animate-pulse rounded-full bg-success"></span>
          <span className="opacity-70">{block.toString()}</span>
        </div>
      ) : (
        <Skeleton className="h-[10px]" />
      )}
    </div>
  );
}
