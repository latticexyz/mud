import { Button } from "./ui/Button";
import { useModal } from "connectkit";
import { AppInfo } from "./AppInfo";
import { twMerge } from "tailwind-merge";
import { useEffect, useRef } from "react";
import { Connector, useCapabilities, useConnect, useConnectors } from "wagmi";
import { isIdConnector, PortoConnector, type IdConnector } from "@latticexyz/id/internal";

export function ConnectWallet() {
  const connectors = useConnectors();
  const porto = connectors.find((connector): connector is PortoConnector => connector.id === "xyz.ithaca.porto");
  const capabilities = useCapabilities();

  console.log("capabilities", capabilities.status, capabilities.data, capabilities.error);
  const idConnector = connectors.find(isIdConnector);

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
        {porto ? <AccountButtons connector={porto} /> : <WalletButton />}
      </div>
    </div>
  );
}

function WalletButton() {
  const { open, setOpen } = useModal();
  const hasAutoOpenedRef = useRef(false);

  useEffect(() => {
    if (!open && !hasAutoOpenedRef.current) {
      setOpen(true);
      hasAutoOpenedRef.current = true;
    }
  }, [open, setOpen]);

  return (
    <>
      <Button
        key="create"
        variant="secondary"
        className="self-auto flex justify-center"
        onClick={() => setOpen(true)}
        autoFocus
      >
        Connect wallet
      </Button>
    </>
  );
}

function AccountButtons({ connector }: { connector: PortoConnector }) {
  const { setOpen } = useModal();
  const { connect, isPending } = useConnect();

  // TODO: fill in once we can look out accounts/capabilities
  const signIn = false;

  // TODO: these buttons don't work :(
  //       > A user activation is required to create a credential in a cross-origin iframe

  const buttons = [
    <Button
      key="create"
      variant={signIn ? "tertiary" : "secondary"}
      className="self-auto flex justify-center"
      pending={isPending}
      onClick={() => connect({ connector })}
      autoFocus={!signIn}
    >
      Create account
    </Button>,
    <Button
      key="signin"
      variant={signIn ? "secondary" : "tertiary"}
      className="self-auto flex justify-center"
      pending={isPending}
      // TODO: pass in credential ID to use
      onClick={() => connect({ connector })}
      autoFocus={signIn}
    >
      Sign in
    </Button>,
  ];

  if (signIn) {
    buttons.reverse();
  }

  return (
    <>
      {buttons}
      <button
        className="text-sm self-center transition text-neutral-500 hover:text-white p-2"
        onClick={() => setOpen(true)}
      >
        Already have a wallet?
      </button>
    </>
  );
}
