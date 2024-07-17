import { useBlockNumber } from "wagmi";

export function LatestBlock() {
  const { data: block } = useBlockNumber();

  if (block != null && block > BigInt(0)) {
    return;
  }

  return (
    <div className="inline-block mr-4">
      <div className="flex items-center justify-between text-xs font-extrabold text-green-600">
        <span
          className="mr-2 inline-block h-[8px] w-[8px] rounded-full animate-pulse"
          style={{
            background: "rgb(64, 182, 107)",
          }}
        ></span>
        <span className="opacity-70">{block.toString()}</span>
      </div>
    </div>
  );
}
