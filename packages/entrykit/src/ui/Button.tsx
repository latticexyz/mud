/* eslint-disable max-len */
import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { twMerge } from "tailwind-merge";
import { PendingIcon } from "../icons/PendingIcon";

// TODO: add support for async onClick, where pending is enabled automatically
// TODO: add error state with popover/tooltip

type ButtonClassNameOptions = {
  variant?: "primary" | "secondary" | "tertiary";
  pending?: boolean;
};

const buttonClassName = ({ variant = "secondary" }: ButtonClassNameOptions = {}) =>
  twMerge(
    "group/button self-center leading-none outline-none border-4 border-transparent",
    "transition hover:brightness-125 active:brightness-150",
    "focus:border-orange-500",
    "aria-disabled:pointer-events-none aria-busy:pointer-events-none",
    // TODO: better disabled state
    "aria-disabled:opacity-50",
    "p-[.75em] font-medium",
    {
      primary: twMerge("bg-orange-600 text-white focus:border-yellow-400"),
      secondary: twMerge("bg-neutral-700 text-white focus:border-orange-500"),
      tertiary: twMerge("bg-neutral-800 text-white focus:border-orange-500"),
    }[variant],
  );

export type ButtonProps = {
  pending?: boolean;
  variant?: ButtonClassNameOptions["variant"];
};

export type Props = ButtonProps & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export const Button = ({ pending, variant, type, className, children, disabled, ...props }: Props) => {
  return (
    <button
      type={type || "button"}
      className={twMerge(buttonClassName({ variant, pending }), className)}
      aria-busy={pending}
      aria-disabled={disabled}
      disabled={disabled || pending}
      {...props}
    >
      <span className="grid grid-cols-[1fr_auto_1fr] gap-2">
        <span className="flex items-center justify-end text-[.75em]">
          <span className="transition opacity-0 translate-x-2 group-aria-busy/button:opacity-100 group-aria-busy/button:translate-x-0 duration-100 group-aria-busy/button:duration-300">
            <PendingIcon />
          </span>
        </span>
        <span>{children}</span>
      </span>
    </button>
  );
};
