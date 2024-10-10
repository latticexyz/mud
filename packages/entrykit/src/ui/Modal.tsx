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
            <DialogContent
              className="outline-none w-full sm:max-w-screen-sm"
              // TODO description
              aria-describedby={undefined}
            >
              {children}
            </DialogContent>
          </div>
        </Shadow>
      </DialogPortal>
    </DialogRoot>
  );
}
