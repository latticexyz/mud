import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { twMerge } from "tailwind-merge";

import { PendingIcon } from "../icons/PendingIcon";

type ButtonClassNameOptions = {
  variant?: "primary" | "secondary" | "tertiary";
};

const buttonClassName = ({ variant = "primary" }: ButtonClassNameOptions = {}) =>
  twMerge(
    "self-center text-sm font-medium px-4 py-2 border border-transparent inline-flex justify-center",
    {
      primary:
        "text-white disabled:text-neutral-400 bg-orange-500 hover:bg-orange-400 active:bg-orange-600 disabled:bg-stone-400",
      secondary:
        "text-white disabled:text-neutral-400 bg-neutral-600 hover:bg-neutral-500 active:bg-neutral-700 border-white/20",
      tertiary: "text-white disabled:text-neutral-400 border-white/20 hover:bg-white/10 active:bg-black/10",
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
      disabled={disabled || pending}
      {...props}
    >
      {children}
      {pending ? (
        <span className="self-center ml-2 -mr-1">
          <PendingIcon />
        </span>
      ) : null}
    </button>
  );
};
