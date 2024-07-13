import { CSSProperties, InputHTMLAttributes } from "react";
import { Slot, type AsChildProps } from "./Slot";
import { twMerge } from "tailwind-merge";

export type Props = AsChildProps<InputHTMLAttributes<HTMLInputElement>> & {
  style?: CSSProperties;
  className?: string;
};

// TODO: use radix slot and expect className on Input rather than child?
// TODO: forward ref?

export function Input({ asChild, className, ...props }: Props) {
  const Child = asChild ? Slot : "input";
  return (
    <Child
      className={twMerge(
        "p-2.5 gap-1 border text-lg font-medium transition",
        "outline-none ring-2 ring-transparent focus-within:ring-orange-500 focus-within:border-transparent",
        "bg-white border-neutral-300 text-black placeholder:text-neutral-400",
        "dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:placeholder:text-neutral-500",
        className,
      )}
      {...props}
    />
  );
}
