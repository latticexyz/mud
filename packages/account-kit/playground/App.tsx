import { useEffect } from "react";
import { useAccount } from "wagmi";
import { AccountKitButton, useAccountModal, useAppAccountClient } from "../src/exports";
import { useLocalStorage } from "usehooks-ts";

export function App() {
  const { address } = useAccount();
  const [openModal, setOpenModal] = useLocalStorage<boolean>("mud:accountKitPlayground:openModalOnMount", false);
  const { openAccountModal } = useAccountModal();
  const appAccountClient = useAppAccountClient();

  useEffect(() => {
    if (openModal && openAccountModal) {
      openAccountModal();
    }
  }, [openAccountModal, openModal]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}>
      <div>
        <AccountKitButton />
      </div>
      <div>
        <label style={{ display: "flex", gap: "0.25em" }}>
          <input type="checkbox" checked={openModal} onChange={(event) => setOpenModal(event.currentTarget.checked)} />
          Open modal on mount
        </label>
      </div>
      <dl>
        <dt>Connected account</dt>
        <dd>{address}</dd>
        <dt>App account</dt>
        <dd>{appAccountClient?.account.address}</dd>
      </dl>
    </div>
  );
}
