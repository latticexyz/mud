import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { twMerge } from "tailwind-merge";

import { PendingIcon } from "../icons/PendingIcon";

type ButtonClassNameOptions = {
  variant?: "primary" | "secondary";
};

const buttonClassName = ({ variant = "primary" }: ButtonClassNameOptions = {}) =>
  twMerge(
    // eslint-disable-next-line max-len
    "group self-center font-medium leading-none outline-none border border-transparent ring-2 ring-transparent focus:ring-orange-500 transition aria-disabled:pointer-events-none aria-busy:pointer-events-none",
    {
      primary: twMerge(
        "bg-neutral-900 text-white hover:bg-neutral-700 active:bg-neutral-600 aria-disabled:bg-neutral-200 aria-disabled:text-neutral-400",
        // eslint-disable-next-line max-len
        "dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-200 dark:active:bg-neutral-300 dark:aria-disabled:bg-neutral-400 dark:aria-disabled:text-neutral-600",
      ),
      secondary: twMerge(
        // eslint-disable-next-line max-len
        "text-black border-neutral-400 hover:bg-neutral-200 hover:border-neutral-500 active:bg-neutral-300 active:border-neutral-600 aria-disabled:text-neutral-400 aria-disabled:border-neutral-300",
        // eslint-disable-next-line max-len
        "dark:text-white dark:border-neutral-400 dark:hover:bg-neutral-700 dark:hover:border-neutral-300 dark:active:bg-neutral-600 dark:active:border-neutral-200 dark:aria-disabled:text-neutral-500 dark:aria-disabled:border-neutral-600",
      ),
    }[variant],
  );

type Props = {
  children: React.ReactNode;
  pending?: boolean;
  variant?: ButtonClassNameOptions["variant"];
};

type ButtonProps = Props & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export const Button = ({ pending, variant, type, className, children, disabled, ...props }: ButtonProps) => {
  return (
    <button
      type={type || "button"}
      className={twMerge(buttonClassName({ variant }), className)}
      aria-busy={pending}
      aria-disabled={disabled}
      {...props}
    >
      <span className="inline-grid place-items-center overflow-hidden p-4">
        <span
          className={twMerge(
            "col-start-1 row-start-1 leading-none",
            "translate-y-0 opacity-100 transition",
            "group-aria-busy:-translate-y-2 group-aria-busy:opacity-0",
          )}
        >
          {children}
        </span>

        <span
          aria-hidden
          className={twMerge(
            "col-start-1 row-start-1",
            "translate-y-2 opacity-0 transition",
            "group-aria-busy:translate-y-0 group-aria-busy:opacity-100",
          )}
        >
          <PendingIcon />
        </span>
      </span>
    </button>
  );
};
