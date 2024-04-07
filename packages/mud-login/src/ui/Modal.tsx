import { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Shadow } from "../Shadow";

export type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  children: ReactNode;
};

export function Modal({ open, onOpenChange, trigger, children }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}
      <Dialog.Portal>
        <div>
          <Shadow>
            <Dialog.Overlay className="bg-neutral-950/80 animate-in fade-in fixed inset-0 grid place-items-center overflow-y-auto backdrop-blur">
              {children}
            </Dialog.Overlay>
          </Shadow>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
