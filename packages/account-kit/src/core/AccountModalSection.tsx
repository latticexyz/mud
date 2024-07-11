import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export type Props = {
  className?: string;
  children: ReactNode;
};

export function AccountModalSection({ className, children }: Props) {
  return (
    <div className={twMerge("flex", className)}>
      <div
        className={twMerge(
          "flex-grow flex flex-col",
          // TODO: figure out how to not animate this on first mount of modal
          "animate-in fade-in slide-in-from-left-2",
        )}
      >
        {children}
      </div>
    </div>
  );
}
