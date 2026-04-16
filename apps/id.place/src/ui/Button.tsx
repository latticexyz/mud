import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { twMerge } from "tailwind-merge";
import { PendingIcon } from "./icons/PendingIcon";

// TODO: add support for async onClick, where pending is enabled automatically

type ButtonClassNameOptions = {
  variant?: "primary" | "secondary";
  pending?: boolean;
};

const buttonClassName = ({ variant = "primary" }: ButtonClassNameOptions = {}) =>
  twMerge(
    "group/button leading-none cursor-pointer w-full rounded",
    "hover:brightness-125 active:brightness-90",
    "aria-disabled:pointer-events-none aria-busy:pointer-events-none",
    "aria-disabled:opacity-80 aria-disabled:saturate-0",
    "p-[.75em]",
    {
      primary: "bg-indigo-600 text-white",
      secondary: "bg-indigo-400 text-white",
    }[variant],
  );

export type ButtonProps = {
  pending?: boolean;
  variant?: ButtonClassNameOptions["variant"];
};

export type Props = ButtonProps & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export function Button({ pending, variant, type, className, children, disabled, ...props }: Props) {
  return (
    <button
      type={type || "button"}
      className={twMerge(buttonClassName({ variant, pending }), className)}
      aria-busy={pending}
      aria-disabled={disabled}
      disabled={disabled || pending}
      {...props}
    >
      <span className="grid grid-cols-[1fr_auto_1fr] gap-[.5em]">
        <span
          className={twMerge(
            "self-center justify-self-end",
            "transition",
            "duration-100 group-aria-busy/button:duration-300",
            "opacity-0 group-aria-busy/button:opacity-100",
            "translate-x-2 group-aria-busy/button:translate-x-0",
          )}
        >
          <PendingIcon />
        </span>
        <span>{children}</span>
      </span>
    </button>
  );
}
