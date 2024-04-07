import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { twMerge } from "tailwind-merge";

import { PendingIcon } from "../icons/PendingIcon";

const buttonClasses =
  "self-center transition text-white bg-lime-600 hover:bg-lime-700 active:bg-lime-800 disabled:bg-stone-400 px-6 py-3 inline-flex";

type Props = {
  children: React.ReactNode;
  pending?: boolean;
};

type ButtonProps = Props & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export const Button = ({ pending, type, className, children, disabled, ...props }: ButtonProps) => {
  return (
    <button
      type={type || "button"}
      className={twMerge(buttonClasses, className)}
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
