import { type Write } from "../../../../../../observer/store";
import { cn } from "../../../../../../utils";
import { useTimings } from "./useTimings";

export function TimingRowHeader(write: Write) {
  const timings = useTimings(write);
  return (
    <div className="-mt-1 h-full w-[70px] grayscale">
      {timings.map((timing) => (
        <div
          key={timing.label}
          title={timing.label}
          className={cn(`h-1`, {
            "bg-orange-300": timing.type === "write",
            "mt-0.5 bg-orange-500": timing.type === "waitForTransaction",
            "mt-0.5 bg-orange-700": timing.type === "waitForTransactionReceipt",
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
