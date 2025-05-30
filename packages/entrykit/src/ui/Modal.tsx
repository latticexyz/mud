import { ReactNode, useEffect } from "react";
import { Dialog, VisuallyHidden } from "radix-ui";
import { Shadow } from "./Shadow";
import { twMerge } from "tailwind-merge";

export type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

export function Modal({ open, onOpenChange, children }: Props) {
  // Focus trapping doesn't seem to completely work with our iframe approach,
  // so tabbing until you get to the document body means Escape doesn't work.
  // We'll patch this behavior for now with our own listener.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;

      if (event.key === "Escape" && open) {
        event.preventDefault();
        onOpenChange?.(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onOpenChange, open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {/* This intentionally does not use `<Dialog.Trigger>` because it doesn't play nicely with `<Shadow>` trigger (our primary use case). */}
      <Dialog.Portal>
        <Shadow mode="modal">
          {/**
           * This intentionally does not use `<Dialog.Overlay>` due to an issue it causes with scrolling the modal contents.
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
              <Dialog.Content className="outline-none w-full max-w-[26rem] mx-auto">
                <VisuallyHidden.Root asChild>
                  <Dialog.Title>EntryKit</Dialog.Title>
                </VisuallyHidden.Root>
                <VisuallyHidden.Root asChild>
                  <Dialog.Description>Sign in to this app</Dialog.Description>
                </VisuallyHidden.Root>

                {children}
              </Dialog.Content>
            </div>
          </div>
        </Shadow>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
