import { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CloseIcon } from "./icons/CloseIcon";
import { twMerge } from "tailwind-merge";

export type Props = {
  title: ReactNode;
};

export function AccountModalTitle({ title }: Props) {
  return (
    <div className="flex-shrink-0 flex items-start gap-5 p-5">
      <Dialog.Title
        className={twMerge(
          "flex-grow text-lg leading-none font-medium",
          "text-black dark:text-white",
          "animate-in fade-in slide-in-from-left-2",
        )}
      >
        {title}
      </Dialog.Title>
      <Dialog.Close
        className={twMerge(
          "flex-shrink-0 flex items-center justify-center text-lg leading-none p-2 -m-2 -mr-3 transition",
          "text-neutral-400 hover:text-neutral-600",
          "dark:text-neutral-500 dark:hover:text-neutral-400",
        )}
        title="Close"
      >
        <CloseIcon />
      </Dialog.Close>
    </div>
  );
}
