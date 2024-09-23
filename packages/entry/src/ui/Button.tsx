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
    "group self-center leading-none outline-none border border-transparent ring-2 ring-transparent focus:ring-orange-500 focus:border-transparent transition",
    "aria-disabled:pointer-events-none aria-busy:pointer-events-none",
    "p-4 font-semibold",
    {
      primary: twMerge(
        "bg-neutral-900 text-white hover:bg-neutral-700 active:bg-neutral-600 aria-disabled:bg-neutral-200 aria-disabled:text-neutral-400",
        // eslint-disable-next-line max-len
        "dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-200 dark:active:bg-neutral-300 dark:aria-disabled:bg-neutral-400 dark:aria-disabled:text-neutral-600",
        pending && "dark:bg-neutral-700 dark:text-neutral-400",
      ),
      secondary: twMerge(
        // eslint-disable-next-line max-len
        "text-black border-neutral-400 hover:bg-neutral-200 hover:border-neutral-500 active:bg-neutral-300 active:border-neutral-600 aria-disabled:text-neutral-400 aria-disabled:border-neutral-300",
        // eslint-disable-next-line max-len
        "dark:text-white dark:border-neutral-400 dark:hover:bg-neutral-700 dark:hover:border-neutral-300 dark:active:bg-neutral-600 dark:active:border-neutral-200 dark:aria-disabled:text-neutral-500 dark:aria-disabled:border-neutral-600",
      ),
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
