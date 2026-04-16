import { CSSProperties, InputHTMLAttributes } from "react";
import { Slot, type AsChildProps } from "./Slot";
import { twMerge } from "tailwind-merge";

export type Props = AsChildProps<InputHTMLAttributes<HTMLInputElement>> & {
  style?: CSSProperties;
  className?: string;
};

export function Input({ asChild, className, ...props }: Props) {
  const Child = asChild ? Slot : "input";
  return (
    <Child
      className={twMerge(
        "p-2.5 gap-1 border text-lg font-medium transition",
        "outline-none ring-2 ring-transparent focus-within:ring-orange-500 focus-within:border-transparent",
        "bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500",
        className,
      )}
      {...props}
    />
  );
}
