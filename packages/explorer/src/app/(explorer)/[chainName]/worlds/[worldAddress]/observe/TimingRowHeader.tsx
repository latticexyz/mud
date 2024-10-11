import { type Write } from "../../../../../../observer/store";
import { cn } from "../../../../../../utils";
import { useTimings } from "./useTimings";

export function TimingRowHeader(write: Write) {
  const timings = useTimings(write);
  return (
    <div className="-mt-1 h-full w-[50px] grayscale">
      {timings.map((timing) => (
        <div
          key={timing.label}
          title={timing.label}
          className={cn(`h-1`, {
            "bg-[#5c9af6]": timing.type === "write",
            "mt-0.5 bg-[#4d7cc0]": timing.type === "waitForTransaction",
            "mt-0.5 bg-[#3d5c8a]": timing.type === "waitForTransactionReceipt",
          })}
          style={{
            width: `${timing.widthPercentage}%`,
            marginLeft: `${timing.startPercentage}%`,
          }}
        />
      ))}
    </div>
  );
}
