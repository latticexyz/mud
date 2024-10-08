import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export type Props = {
  className?: string;
  children: ReactNode;
};

export function AccountModalSection({ className, children }: Props) {
  return (
    <div
      className={twMerge(
        "flex-grow flex flex-col gap-5 px-5 pb-5",
        "animate-in fade-in slide-in-from-left-2",
        className,
      )}
    >
      {children}
    </div>
  );
}
