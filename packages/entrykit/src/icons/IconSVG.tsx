import { SVGProps } from "react";
import { twMerge } from "tailwind-merge";

export type Props = SVGProps<SVGSVGElement>;

export function IconSVG({ className, children, ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={twMerge("-my-[0.125em] h-[1.25em] w-[1.25em]", className)}
      {...props}
    >
      {children}
    </svg>
  );
}
