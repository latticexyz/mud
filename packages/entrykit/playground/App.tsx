import { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { UserWrite } from "./UserWrite";
import { ConnectKitButton } from "connectkit";
import { SessionWrite } from "./SessionWrite";
import { useAccountModal } from "../src/useAccountModal";
import { AccountButton } from "../src/AccountButton";
import { sharedState, syncRp } from "@latticexyz/id/internal";
import { useStore } from "zustand";

export function App() {
  useEffect(syncRp, []);
  useEffect(() => {
    const id = setTimeout(() => {
      console.log("setting accounts from client");
      sharedState.setState({
        accounts: ["0xclient"],
        lastUpdate: {
          by: "client",
          at: new Date(),
        },
      });
    }, 5000);
  }, []);

  const accounts = useStore(sharedState, (state) => state.accounts);

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
      <div>
        credential{" "}
        <button
          type="button"
          onClick={() => {
            // rp.create();
          }}
        >
          create
        </button>{" "}
        <button
          type="button"
          onClick={() => {
            // rp.sign("0x");
          }}
        >
          sign
        </button>
      </div>
      <div>accounts: {accounts.join(", ")}</div>
    </div>
  );
}
