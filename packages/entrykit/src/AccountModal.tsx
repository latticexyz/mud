import { Modal } from "./ui/Modal";
import { useAccountModal } from "./useAccountModal";
import { twMerge } from "tailwind-merge";
import { AccountModalOnboarding } from "./onboarding/AccountModalOnboarding";
import { AccountModalErrorBoundary } from "./AccountModalErrorBoundary";
import { DialogClose, DialogTitle } from "@radix-ui/react-dialog";
import { CloseIcon } from "./icons/CloseIcon";

export function AccountModal() {
  const { accountModalOpen, toggleAccountModal } = useAccountModal();
  return (
    <Modal open={accountModalOpen} onOpenChange={toggleAccountModal}>
      {/* TODO: move this into `<Modal>` props? */}
      <DialogTitle className="sr-only">Connect with EntryKit</DialogTitle>
      {accountModalOpen ? (
        <div
          className={twMerge(
            "relative flex flex-col min-h-[20rem] border-t sm:border",
            "bg-neutral-100 text-neutral-700 border-neutral-300",
            "dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:divide-neutral-700",
            "links:font-medium links:underline links:underline-offset-4",
            "links:text-black dark:links:text-white",
            "links:decoration-neutral-300 dark:links:decoration-neutral-500 hover:links:decoration-orange-500",
          )}
        >
          <AccountModalErrorBoundary>
            <AccountModalOnboarding />
          </AccountModalErrorBoundary>

          <div className="absolute top-0 right-0">
            <DialogClose
              className={twMerge(
                "pointer-events-auto leading-none p-1 transition",
                "text-neutral-400 hover:text-neutral-600",
                "dark:text-neutral-500 dark:hover:text-neutral-400",
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
