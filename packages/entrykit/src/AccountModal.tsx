import { Modal } from "./ui/Modal";
import { useAccountModal } from "./useAccountModal";
import { twMerge } from "tailwind-merge";
import { AccountModalContent } from "./AccountModalContent";
import { AccountModalErrorBoundary } from "./AccountModalErrorBoundary";

export function AccountModal() {
  const { accountModalOpen, toggleAccountModal } = useAccountModal();
  return (
    <Modal open={accountModalOpen} onOpenChange={toggleAccountModal}>
      {accountModalOpen ? (
        <div
          className={twMerge(
            "flex flex-col min-h-[26rem] border-t sm:border",
            "bg-neutral-100 text-neutral-700 border-neutral-300",
            "dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:divide-neutral-700",
            "links:font-medium links:underline links:underline-offset-4",
            "links:text-black dark:links:text-white",
            "links:decoration-neutral-300 dark:links:decoration-neutral-500 hover:links:decoration-orange-500",
          )}
        >
          <AccountModalErrorBoundary>
            <AccountModalContent />
          </AccountModalErrorBoundary>
        </div>
      ) : null}
    </Modal>
  );
}
