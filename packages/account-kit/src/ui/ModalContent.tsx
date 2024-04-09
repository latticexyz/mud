import { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CloseIcon } from "../icons/CloseIcon";

export type Props = {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
};

export function ModalContent({ title, description, children }: Props) {
  return (
    <Dialog.Content className="flex w-[28rem] flex-col gap-6 bg-neutral-800 text-neutral-400 border border-white/20 p-6 outline-none">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-4">
          <Dialog.Title className="flex-grow font-mono text-xl uppercase text-white">{title}</Dialog.Title>
          <Dialog.Close
            className="-m-2 flex-shrink-0 p-2 text-xl text-white/40 transition hover:text-white"
            title="Close"
          >
            <CloseIcon />
          </Dialog.Close>
        </div>
        {description ? <Dialog.Description className="text-sm text-white">{description}</Dialog.Description> : null}
      </div>
      {children}
    </Dialog.Content>
  );
}
