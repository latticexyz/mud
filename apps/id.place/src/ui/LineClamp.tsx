import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { ChevronUpIcon } from "./icons/ChevronUpIcon";

export function LineClamp({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <details className="group">
      <summary className="list-none cursor-pointer pointer-events-none flex">
        <span className={twMerge("block not-group-open:line-clamp-2", className)}>{children}</span>
        <span
          className={twMerge("pointer-events-auto user-select-none", "text-slate-400 hover:text-current")}
          aria-hidden
        >
          <ChevronUpIcon className="rotate-180 not-group-open:-rotate-90 text-base" />
        </span>
      </summary>
    </details>
  );
}
