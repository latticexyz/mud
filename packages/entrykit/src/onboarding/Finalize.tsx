import { useEffect } from "react";
import { AccountModalSection } from "../AccountModalSection";
import { PendingIcon } from "../icons/PendingIcon";
import { useAccountModal } from "../useAccountModal";

export function Finalize() {
  const { closeAccountModal } = useAccountModal();
  useEffect(() => {
    closeAccountModal();
  }, [closeAccountModal]);
  return (
    <AccountModalSection className="items-center justify-center">
      <PendingIcon />
    </AccountModalSection>
  );
}
