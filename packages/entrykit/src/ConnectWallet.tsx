import { useAccount } from "wagmi";
import { Button } from "./ui/Button";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { AppInfo } from "./AppInfo";
import { twMerge } from "tailwind-merge";
import { useCallback, useEffect, useState, useRef } from "react";
import { useJwtConnector } from "../src/useJwtConnector";
import { PendingIcon } from "./icons/PendingIcon";

declare const window: {
  google: any;
} & Window;

const clientId = "188183665112-uafieilii1f4rklscv0b7gj6e42lao42.apps.googleusercontent.com";

export function ConnectWallet() {
  const userAccount = useAccount();
  const { openConnectModal } = useConnectModal();
  const [generatingProof, setGeneratingProof] = useState(false);
  const jwtConnector = useJwtConnector();
  const buttonRef = useRef<HTMLDivElement>(null);
  const googleRendered = useRef(false);

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
    if (googleRendered.current || !window.google || !jwtSigner || !buttonRef.current) return;
    googleRendered.current = true;

    window.google.accounts.id.cancel();
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: false,
      nonce: jwtSigner.address,
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "icon",
      width: "200",
    });
  }, [jwtSigner, handleCredentialResponse]);

  // TODO: show error states?

  const onClick = () => {
    if (!buttonRef.current) {
      return;
    }

    (buttonRef.current.querySelector("div[role=button]") as HTMLDivElement).click();
  };

  return (
    <div
      className={twMerge("flex flex-col gap-6 p-6", "animate-in animate-duration-300 fade-in slide-in-from-bottom-8")}
    >
      <div className="p-4">
        {/* TODO: render appImage if available? */}
        <AppInfo />
      </div>
      <div className="flex justify-center w-full">
        {generatingProof ? (
          <div className="flex items-center justify-center gap-2">
            <PendingIcon />
            Generating proof...
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-[220px] ">
            <div role="button" ref={buttonRef} className="hidden" />
            <Button
              variant="secondary"
              className="w-full flex justify-center"
              disabled={userAccount.status === "connecting"}
              onClick={onClick}
              autoFocus={true}
            >
              Sign in with Google
            </Button>

            <Button
              key="create"
              variant="secondary"
              className="w-full flex justify-center"
              disabled={userAccount.status === "connecting"}
              onClick={openConnectModal}
            >
              Connect wallet
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
