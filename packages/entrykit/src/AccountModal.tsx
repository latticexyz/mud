import { Modal } from "./ui/Modal";
import { useAccountModal } from "./useAccountModal";
import { twMerge } from "tailwind-merge";
import { AccountModalContent } from "./AccountModalContent";
import { DialogClose, DialogTitle } from "@radix-ui/react-dialog";
import { CloseIcon } from "./icons/CloseIcon";
import { Logo } from "./icons/Logo";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./errors/ErrorFallback";
import { ErrorsOverlay } from "./errors/ErrorsOverlay";

export function AccountModal() {
  const { accountModalOpen, toggleAccountModal } = useAccountModal();
  return (
    <Modal open={accountModalOpen} onOpenChange={toggleAccountModal}>
      {/* TODO: move this into `<Modal>` props? */}
      <DialogTitle className="sr-only">Connect with EntryKit</DialogTitle>
      {accountModalOpen ? (
        <div
          className={twMerge(
            "relative py-2 ring-1",
            "bg-neutral-900 text-neutral-400 ring-neutral-700/50",
            "links:font-medium links:underline links:underline-offset-4",
            "links:text-white",
            "links:decoration-neutral-500 hover:links:decoration-orange-500",
          )}
        >
          <div className="absolute top-0 right-0">
            <DialogClose
              className={twMerge(
                "pointer-events-auto leading-none p-2 transition",
                "text-white/20 hover:text-white/40",
              )}
              title="Close"
            >
              <CloseIcon className="m-0" />
            </DialogClose>
          </div>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AccountModalContent />
            <ErrorsOverlay />
          </ErrorBoundary>

          <a
            href="https://mud.dev"
            target="_blank"
            rel="noreferrer noopener"
            className="group self-center p-3 flex items-center justify-center gap-2 links-unset text-sm font-mono transition text-neutral-400 hover:text-white"
          >
            <span className="block w-4 h-4">
              <Logo className="w-full h-full text-orange-500 group-hover:rotate-90 transition duration-300" />
            </span>
            <span>Powered by MUD</span>
          </a>
        </div>
      ) : null}
    </Modal>
  );
}
