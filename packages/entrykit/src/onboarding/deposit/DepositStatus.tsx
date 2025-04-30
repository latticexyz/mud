import { PendingIcon } from "../../icons/PendingIcon";
import { ReactNode, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { CheckIcon } from "../../icons/CheckIcon";
import { WarningIcon } from "../../icons/WarningIcon";
import { CloseIcon } from "../../icons/CloseIcon";

export type Props = {
  status: "pending" | "success" | "error";
  progress: {
    duration: number;
    elapsed: number;
  };
  onDismiss: () => void;
  children: ReactNode;
};

export function DepositStatus({ status, progress, children, onDismiss }: Props) {
  const [appear, setAppear] = useState(false);
  useEffect(() => {
    setAppear(true);
  }, []);

  return (
    <div className="group bg-white dark:bg-neutral-900 flex flex-col animate-in fade-in slide-in-from-bottom-2 animate-out fade-out">
      <div className="py-1 text-sm flex items-center gap-2">
        <div className="flex-grow">{children}</div>
        <div className="flex-shrink-0 grid">
          <span className="col-start-1 row-start-1 transition opacity-100 group-hover:opacity-0 group-hover:pointer-events-none">
            {status === "success" ? (
              <CheckIcon className="text-green-600" />
            ) : status === "error" ? (
              <WarningIcon className="text-amber-500" />
            ) : (
              <PendingIcon className="text-neutral-400 dark:text-neutral-500 transition" />
            )}
          </span>
          <button
            type="button"
            className={twMerge(
              "col-start-1 row-start-1 flex items-center justify-center transition",
              "opacity-0 pointer-events-none",
              "group-hover:opacity-100 group-hover:pointer-events-auto",
              "text-neutral-400 hover:text-black",
              "dark:text-neutral-500 dark:hover:text-white",
            )}
            title="Dismiss"
            onClick={onDismiss}
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      <div className="w-full h-[2px] -mt-full overflow-clip">
        <div
          className={twMerge(
            "w-full h-full transition ease-linear",
            status === "success"
              ? "bg-green-500 dark:bg-green-600"
              : status === "error"
                ? "bg-red-500 dark:bg-red-600"
                : "bg-blue-500 dark:bg-blue-600",
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
