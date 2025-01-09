import Link from "next/link";
import { useBlockNumber } from "wagmi";
import { useChain } from "../app/(explorer)/hooks/useChain";
import { blockExplorerBlockUrl } from "../app/(explorer)/utils/blockExplorerBlockUrl";
import { Skeleton } from "./ui/Skeleton";

function BlockView({ blockNumber }: { blockNumber: bigint }) {
  return (
    <div className="flex items-center justify-end gap-x-2 text-xs font-extrabold text-green-600">
      <span className="inline-block h-[6px] w-[6px] animate-pulse rounded-full bg-success"></span>
      <span className="opacity-70">{blockNumber.toString()}</span>
    </div>
  );
}

export function LatestBlock() {
  const { id: chainId } = useChain();
  const { data: blockNumber } = useBlockNumber({
    watch: true,
    chainId,
    query: {
      refetchInterval: 1000,
    },
  });
  const blockUrl = blockNumber ? blockExplorerBlockUrl({ blockNumber, chainId }) : undefined;

  return (
    <div className="inline-block">
      {blockNumber ? (
        blockUrl ? (
          <Link href={blockUrl} target="_blank">
            <BlockView blockNumber={blockNumber} />
          </Link>
        ) : (
          <BlockView blockNumber={blockNumber} />
        )
      ) : (
        <Skeleton className="h-[10px]" />
      )}
    </div>
  );
}
