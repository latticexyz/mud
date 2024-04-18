import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { twMerge } from "tailwind-merge";

import { PendingIcon } from "../icons/PendingIcon";

type ButtonClassNameOptions = {
  size?: "sm" | "md";
  variant?: "primary" | "secondary" | "tertiary";
  pending?: boolean;
  selected?: boolean;
};

const buttonClassName = ({
  size = "md",
  variant = "primary",
  pending = false,
  selected = false,
}: ButtonClassNameOptions = {}) =>
  twMerge(
    // eslint-disable-next-line max-len
    "group self-center leading-none outline-none border border-transparent ring-2 ring-transparent focus:ring-orange-500 transition aria-disabled:pointer-events-none aria-busy:pointer-events-none",
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
      tertiary: twMerge(
        // eslint-disable-next-line max-len
        "text-neutral-400 border-neutral-400 hover:bg-neutral-200 hover:border-neutral-500 active:bg-neutral-300 active:border-neutral-600 aria-disabled:text-neutral-400 aria-disabled:border-neutral-300",
        // eslint-disable-next-line max-len
        "dark:text-neutral-400 dark:border-neutral-400 dark:hover:bg-neutral-500 dark:hover:border-neutral-300 dark:active:bg-neutral-600 dark:active:border-neutral-200 dark:aria-disabled:text-neutral-500 dark:aria-disabled:border-neutral-600",
      ),
    }[variant],
    {
      sm: twMerge("p-3 font-medium text-[14px]"),
      md: twMerge("p-4 font-semibold text-[16px]"),
    }[size],
    pending && "cursor-wait pointer-events-none",
    selected && "",
  );

type Props = {
  children: React.ReactNode;
  pending?: boolean;
  variant?: ButtonClassNameOptions["variant"];
  size?: ButtonClassNameOptions["size"];
};

type ButtonProps = Props & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export const Button = ({ pending, variant, size, type, className, children, disabled, ...props }: ButtonProps) => {
  return (
    <button
      type={type || "button"}
      className={twMerge(buttonClassName({ variant, pending, size }), className)}
      aria-busy={pending}
      aria-disabled={disabled}
      {...props}
    >
      <span className={twMerge("flex", pending ? "justify-between" : "justify-center")}>
        <span aria-hidden className={twMerge("col-start-1 row-start-1 hidden", "group-aria-busy:inline-block")}>
          <PendingIcon />
        </span>

        <span className={twMerge("col-start-1 row-start-1 leading-none")}>{children}</span>
      </span>
    </button>
  );
};
