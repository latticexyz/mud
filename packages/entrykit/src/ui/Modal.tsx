import { ReactNode } from "react";
import { Root as DialogRoot, DialogPortal, DialogContent } from "@radix-ui/react-dialog";
import { Shadow } from "./Shadow";
import { twMerge } from "tailwind-merge";

export type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

export function Modal({ open, onOpenChange, children }: Props) {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      {/* This intentionally does not use `<DialogTrigger>` because it doesn't play nicely with `<Shadow>` trigger (our primary use case). */}
      <DialogPortal>
        <Shadow mode="modal">
          {/**
           * This intentionally does not use `<DialogOverlay>` due to an issue it causes with scrolling the modal contents.
           * See https://github.com/radix-ui/primitives/issues/1159#issuecomment-1105320294
           */}
          <div className={twMerge("fixed inset-0", "bg-neutral-800/85", "animate-in animate-duration-300 fade-in")} />
          <div
            className={twMerge(
              "fixed inset-0",
              "grid items-end sm:items-center",
              "animate-in animate-duration-300 fade-in slide-in-from-bottom-16",
            )}
          >
            <div>
              <DialogContent
                className="outline-none w-full max-w-[26rem] mx-auto"
                // TODO description
                aria-describedby={undefined}
                onOpenAutoFocus={(event) => {
                  event.preventDefault();
                }}
              >
                {children}
              </DialogContent>
            </div>
          </div>
        </Shadow>
      </DialogPortal>
    </DialogRoot>
  );
}
