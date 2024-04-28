import { PendingIcon } from "../../icons/PendingIcon";
import { ReactNode, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { CheckIcon } from "../../icons/CheckIcon";
import { CloseIcon } from "../../icons/CloseIcon";

export type Props = {
  status: "pending" | "success" | "error";
  progress: {
    duration: number;
    elapsed: number;
  };
  children: ReactNode;
};

export function TransactionStatus({ status, progress, children }: Props) {
  const [appear, setAppear] = useState(false);
  useEffect(() => {
    setAppear(true);
  }, []);

  return (
    <div className="bg-white flex flex-col">
      <div className="p-2 text-sm flex items-center gap-2">
        <div className="flex-grow">{children}</div>
        {status === "success" ? (
          <CheckIcon className="flex-shrink-0 text-green-600" />
        ) : status === "error" ? (
          <CloseIcon className="flex-shrink-0 text-red-600" />
        ) : (
          <PendingIcon className="flex-shrink-0 text-neutral-400 transition" />
        )}
      </div>

      <div className="w-full h-[2px] -mt-full overflow-clip">
        <div
          className={twMerge(
            "w-full h-full transition ease-linear",
            status === "success" ? "bg-green-500" : status === "error" ? "bg-red-500" : "bg-blue-500",
            status === "pending" ? "opacity-100" : "opacity-0",
          )}
          style={
            status === "pending"
              ? {
                  transform: appear ? `translateX(0)` : "translate(-100%)",
                  transitionDuration: `${progress.duration}ms`,
                  transitionDelay: `-${Math.min(progress.duration, progress.elapsed)}ms`,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
