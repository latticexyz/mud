import { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { UserWrite } from "./UserWrite";
import { ConnectKitButton } from "connectkit";
import { SessionWrite } from "./SessionWrite";
import { useAccountModal } from "../src/useAccountModal";
import { AccountButton } from "../src/AccountButton";

export function App() {
  const { openAccountModal } = useAccountModal();

  const [openModal, setOpenModal] = useLocalStorage<boolean>("mud:entryKitPlayground:openModalOnMount", false);

  useEffect(() => {
    if (openModal) {
      openAccountModal();
    }
  }, [openAccountModal, openModal]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}>
      <div>
        <AccountButton />
      </div>
      <div>
        <label style={{ display: "flex", gap: "0.25em" }}>
          <input type="checkbox" checked={openModal} onChange={(event) => setOpenModal(event.currentTarget.checked)} />
          Open modal on mount
        </label>
      </div>
      <div>
        <ConnectKitButton />
      </div>
      <div>
        <UserWrite />
      </div>
      <div>
        <SessionWrite />
      </div>
    </div>
  );
}
