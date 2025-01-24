import { useAccount } from "wagmi";
import { Button } from "./ui/Button";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { AppInfo } from "./AppInfo";
import { twMerge } from "tailwind-merge";
import { useCallback, useEffect, useState, useRef } from "react";
import { useJwtConnector } from "../src/useJwtConnector";

declare const window: {
  google: any;
} & Window;

const clientId = "188183665112-uafieilii1f4rklscv0b7gj6e42lao42.apps.googleusercontent.com";

export function ConnectWallet() {
  const userAccount = useAccount();
  const { openConnectModal, connectModalOpen } = useConnectModal();
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [generatingProof, setGeneratingProof] = useState(false);
  const jwtConnector = useJwtConnector();
  const buttonRef = useRef<HTMLDivElement>(null);

  const jwtSigner = jwtConnector.getSigner();

  const handleCredentialResponse = useCallback(
    (response: any) => {
      const { credential: jwt } = response;
      setGeneratingProof(true);
      jwtConnector.generateJwtProof(jwt).finally(() => setGeneratingProof(false));
    },
    [jwtConnector],
  );

  useEffect(() => {
    if (!window.google || !jwtSigner || !buttonRef.current) return;

    window.google.accounts.id.cancel();
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      nonce: jwtSigner.address,
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      shape: "rectangular",
    });
  }, [jwtSigner, handleCredentialResponse]);

  // automatically open connect modal once
  // TODO: remove this once we have more than "connect wallet" as an option
  useEffect(() => {
    if (!connectModalOpen && !hasAutoOpened) {
      openConnectModal?.();
      setHasAutoOpened(true);
    }
  }, [connectModalOpen, hasAutoOpened, openConnectModal]);

  // TODO: show error states?

  return (
    <div
      className={twMerge("flex flex-col gap-6 p-6", "animate-in animate-duration-300 fade-in slide-in-from-bottom-8")}
    >
      <div className="p-4">
        {/* TODO: render appImage if available? */}
        <AppInfo />
      </div>
      <div className="self-center flex flex-col gap-2 w-60">
        {generatingProof ? (
          <div className="text-center py-2">Generating proof...</div>
        ) : (
          <>
            <div ref={buttonRef} />

            <Button
              key="create"
              variant="secondary"
              className="self-auto flex justify-center"
              disabled={userAccount.status === "connecting"}
              onClick={openConnectModal}
              autoFocus
            >
              Connect wallet
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
