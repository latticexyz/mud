import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { UserWrite } from "./UserWrite";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SessionWrite } from "./SessionWrite";
import { useAccountModal } from "../src/useAccountModal";
import { AccountButton } from "../src/AccountButton";
import { useJwtConnector } from "../src/useJwtConnector";

declare const window: {
  google: any;
} & Window;

const clientId = "188183665112-uafieilii1f4rklscv0b7gj6e42lao42.apps.googleusercontent.com";

export function App() {
  const { openAccountModal } = useAccountModal();
  const [generatingProof, setGeneratingProof] = useState(false);
  const jwtConnector = useJwtConnector();

  const [openModal, setOpenModal] = useLocalStorage<boolean>("mud:entryKitPlayground:openModalOnMount", false);

  useEffect(() => {
    if (openModal) {
      openAccountModal();
    }
  }, [openAccountModal, openModal]);

  const jwtSigner = jwtConnector.getSigner();

  const handleCredentialResponse = (response: any) => {
    const { credential: jwt } = response;
    setGeneratingProof(true);
    jwtConnector.generateJwtProof(jwt).finally(() => setGeneratingProof(false));
  };

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.cancel();
      if (jwtSigner) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          nonce: jwtSigner.address,
        });
        window.google.accounts.id.renderButton(document.getElementById("googleSignInButton"), {
          theme: "outline",
          size: "large",
        });
      }
    }
  }, [jwtSigner]);

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

      <div>{!generatingProof ? <div id="googleSignInButton" /> : "Generating proof..."}</div>

      <div>
        <ConnectButton />
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
