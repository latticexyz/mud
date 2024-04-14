import { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CloseIcon } from "./icons/CloseIcon";
import { twMerge } from "tailwind-merge";

export type Props = {
  title: ReactNode;
  children: ReactNode;
};

export function AccountModalContent({ title, children }: Props) {
  return (
    <div className="flex-grow flex flex-col divide-y divide-neutral-300 dark:divide-neutral-700">
      <div className="flex-shrink-0 flex items-start gap-5 p-5">
        <Dialog.Title
          className={twMerge("flex-grow text-lg leading-none font-medium", "animate-in fade-in slide-in-from-left-2")}
        >
          {title}
        </Dialog.Title>
        <Dialog.Close
          className="flex-shrink-0 flex items-center justify-center text-xl leading-none p-2 -m-2 transition"
          title="Close"
        >
          <CloseIcon />
        </Dialog.Close>
      </div>
      <div>
        <div
          className={twMerge(
            "flex-grow flex flex-col items-start gap-5 p-5",
            "animate-in fade-in slide-in-from-left-2",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
