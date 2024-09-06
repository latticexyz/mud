import { useBlockNumber } from "wagmi";
import { Skeleton } from "./ui/Skeleton";

export function LatestBlock() {
  const { data: block } = useBlockNumber({
    watch: true,
    chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID),
  });

  return (
    <div className="w-[50px]">
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
