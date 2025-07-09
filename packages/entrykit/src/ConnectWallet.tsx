import { Button } from "./ui/Button";
import { useModal } from "connectkit";
import { AppInfo } from "./AppInfo";
import { twMerge } from "tailwind-merge";
import { useEffect, useRef } from "react";
import { useConnect, useConnectors } from "wagmi";
import { PortoConnector } from "@latticexyz/id/internal";

export function ConnectWallet() {
  const connectors = useConnectors();
  const porto = connectors.find((connector): connector is PortoConnector => connector.id === "xyz.ithaca.porto");

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
        {porto ? <AccountButton connector={porto} /> : <WalletButton />}
      </div>
    </div>
  );
}

function AccountButton({ connector }: { connector: PortoConnector }) {
  const { setOpen } = useModal();
  const { connect, isPending } = useConnect();

  return (
    <>
      <Button
        key="signin"
        variant="secondary"
        className="self-auto flex justify-center"
        pending={isPending}
        onClick={() => connect({ connector })}
        autoFocus
      >
        Sign in
      </Button>
      <button
        className="text-sm self-center transition text-neutral-500 hover:text-white p-2"
        onClick={() => setOpen(true)}
      >
        Already have a wallet?
      </button>
    </>
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
