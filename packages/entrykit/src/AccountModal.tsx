import { Modal } from "./ui/Modal";
import { useAccountModal } from "./useAccountModal";
import { twMerge } from "tailwind-merge";
import { AccountModalContent } from "./AccountModalContent";
import { AccountModalErrorBoundary } from "./AccountModalErrorBoundary";
import { DialogClose, DialogTitle } from "@radix-ui/react-dialog";
import { CloseIcon } from "./icons/CloseIcon";
import { Logo } from "./icons/Logo";

export function AccountModal() {
  const { accountModalOpen, toggleAccountModal } = useAccountModal();
  return (
    <Modal open={accountModalOpen} onOpenChange={toggleAccountModal}>
      {/* TODO: move this into `<Modal>` props? */}
      <DialogTitle className="sr-only">Connect with EntryKit</DialogTitle>
      {accountModalOpen ? (
        <div
          className={twMerge(
            "relative flex flex-col h-0 min-h-[28rem] ring-1 py-2",
            "bg-neutral-900 text-neutral-400 ring-neutral-700/50 divide-neutral-700",
            "links:font-medium links:underline links:underline-offset-4",
            "links:text-white",
            "links:decoration-neutral-500 hover:links:decoration-orange-500",
          )}
        >
          <div className="flex-grow flex flex-col">
            <AccountModalErrorBoundary>
              <AccountModalContent />
            </AccountModalErrorBoundary>
          </div>

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

          <div className="absolute top-0 right-0">
            <DialogClose
              className={twMerge(
                "pointer-events-auto leading-none p-2 transition",
                "text-neutral-700 hover:text-neutral-500",
              )}
              title="Close"
            >
              <CloseIcon className="m-0" />
            </DialogClose>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
