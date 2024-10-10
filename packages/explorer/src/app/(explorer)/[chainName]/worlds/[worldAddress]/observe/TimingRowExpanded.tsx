import { Separator } from "../../../../../../components/ui/Separator";
import { type Write } from "../../../../../../observer/store";
import { cn } from "../../../../../../utils";
import { useTimings } from "./useTimings";

export function TimingRowExpanded(write: Write) {
  const timings = useTimings(write);
  return (
    <>
      <Separator className="my-5" />
      <div className="flex items-start gap-x-4 pb-2">
        <h3 className="inline-block w-[45px] pb-2 text-2xs font-bold uppercase">Timing</h3>
        <div className="w-full border border-white/20 p-2 pb-3">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1">
            {timings.map((timing) => (
              <>
                <span className="text-xs">{timing.label}:</span>
                <div
                  className={cn(`h-1`, {
                    "bg-orange-900": timing.type === "write",
                    "bg-orange-700": timing.type === "waitForTransaction",
                    "bg-orange-500": timing.type === "waitForTransactionReceipt",
                  })}
                  style={{
                    width: `${timing.widthPercentage}%`,
                    marginLeft: `${timing.startPercentage}%`,
                  }}
                />
                <span className="text-right text-xs">{timing.duration}ms</span>
              </>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
