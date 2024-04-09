import { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CloseIcon } from "./icons/CloseIcon";

export type Props = {
  title: ReactNode;
  children: ReactNode;
};

export function AccountModalContent({ title, children }: Props) {
  return (
    <div className="flex-grow flex flex-col divide-y divide-neutral-600">
      <div className="flex-shrink-0 flex items-start gap-5 p-5">
        <Dialog.Title className="flex-grow text-lg leading-none font-medium text-white">{title}</Dialog.Title>
        <Dialog.Close
          className="flex-shrink-0 flex items-center justify-center text-xl leading-none p-2 -m-2 text-neutral-400 transition hover:text-white"
          title="Close"
        >
          <CloseIcon />
        </Dialog.Close>
      </div>
      <div className="flex-grow flex flex-col items-start gap-5 p-5">{children}</div>
    </div>
  );
}
