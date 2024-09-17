import { useBlockNumber } from "wagmi";
import { useChainId } from "../hooks/useChain";
import { Skeleton } from "./ui/Skeleton";

export function LatestBlock() {
  const chainId = useChainId();
  const { data: block } = useBlockNumber({
    watch: true,
    chainId,
  });

  return (
    <div className="inline-block w-[50px]">
      {block ? (
        <div className="flex items-center justify-end text-xs font-extrabold text-green-600">
          <span
            className="mr-2 inline-block h-[8px] w-[8px] animate-pulse rounded-full"
            style={{
              background: "rgb(64, 182, 107)",
            }}
          ></span>
          <span className="opacity-70">{block.toString()}</span>
        </div>
      ) : (
        <Skeleton className="h-[10px]" />
      )}
    </div>
  );
}
