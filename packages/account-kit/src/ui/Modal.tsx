import { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Shadow } from "./Shadow";

export type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

export function Modal({ open, onOpenChange, children }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* This is intentionally wrapped in an empty fragment to avoid React errors related to Radix portals. Maybe fixable by using forwardRef in Shadow. */}
        <>
          <Shadow>
            {/**
             * This intentionally does not use `Dialog.Overlay` due to an issue it causes with scrolling the modal contents.
             * See https://github.com/radix-ui/primitives/issues/1159#issuecomment-1105320294
             */}
            <div className="bg-neutral-800/30 animate-in fade-in fixed inset-0 grid place-items-center overflow-y-auto p-4">
              {children}
            </div>
          </Shadow>
        </>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
