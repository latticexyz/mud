import { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Shadow } from "./Shadow";
import { twMerge } from "tailwind-merge";

export type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

export function Modal({ open, onOpenChange, children }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {/* This intentionally does not use `Dialog.Trigger` because it doesn't play nicely with `<Shadow>` trigger (our primary use case). */}
      <Dialog.Portal>
        <Shadow mode="modal">
          {/**
           * This intentionally does not use `Dialog.Overlay` due to an issue it causes with scrolling the modal contents.
           * See https://github.com/radix-ui/primitives/issues/1159#issuecomment-1105320294
           */}
          <div
            className={twMerge(
              "fixed inset-0",
              "bg-neutral-700/50 dark:bg-neutral-900/75",
              "animate-in animate-duration-500 fade-in",
            )}
          />
          <div
            className={twMerge(
              "fixed inset-0",
              "grid place-items-end sm:place-items-center overflow-y-auto",
              "animate-in animate-duration-200 fade-in slide-in-from-bottom-4",
            )}
          >
            <Dialog.Content className="outline-none w-full sm:w-[28rem]">{children}</Dialog.Content>
          </div>
        </Shadow>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
