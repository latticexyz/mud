import { useBlockNumber } from "wagmi";

export function LatestBlock() {
  const { data: block } = useBlockNumber({
    watch: true,
  });

  if (block === undefined || block === 0n) {
    return;
  }

  return (
    <div className="inline-block">
      <div className="flex items-center justify-between text-xs font-extrabold text-green-600">
        <span
          className="mr-2 inline-block h-[8px] w-[8px] animate-pulse rounded-full"
          style={{
            background: "rgb(64, 182, 107)",
          }}
        ></span>
        <span className="opacity-70">{block.toString()}</span>
      </div>
    </div>
  );
}
