/* eslint-disable max-len */
import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { twMerge } from "tailwind-merge";
import { PendingIcon } from "../icons/PendingIcon";

// TODO: add support for async onClick, where pending is enabled automatically

type ButtonClassNameOptions = {
  variant?: "primary" | "secondary";
  pending?: boolean;
};

const buttonClassName = ({ variant = "primary", pending = false }: ButtonClassNameOptions = {}) =>
  twMerge(
    "group self-center leading-none outline-none border-4 border-transparent",
    "transition hover:brightness-125 active:brightness-150",
    "focus:border-orange-500",
    "aria-disabled:pointer-events-none aria-busy:pointer-events-none",
    "p-[.75em] font-medium",
    {
      primary: twMerge("bg-neutral-700 text-white"),
      secondary: twMerge("bg-neutral-800 text-white"),
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
          <span className="transition opacity-0 translate-x-2 group-aria-busy:opacity-100 group-aria-busy:translate-x-0 duration-100 group-aria-busy:duration-300">
            <PendingIcon />
          </span>
        </span>
        <span>{children}</span>
      </span>
    </button>
  );
};
