import { type Write } from "../../../../../../observer/store";
import { cn } from "../../../../../../utils";
import { useTimings } from "./useTimings";

export function TimingRowHeader(write: Write) {
  const timings = useTimings(write);
  return (
    <div className="ml-4 inline-block h-full w-14 grayscale lg:-mr-8 lg:ml-8 xl:-mr-16 xl:ml-16">
      {timings.map((timing) => (
        <div
          key={timing.label}
          title={timing.label}
          className={cn(`h-1`, {
            "bg-[#5c9af6]": timing.type === "write",
            "mt-0.5 bg-[#4d7cc0]": timing.type === "waitForTransaction",
            "mt-0.5 bg-[#3d5c8a]":
              timing.type === "waitForTransactionReceipt" || timing.type === "waitForUserOperationReceipt",
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
