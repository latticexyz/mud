import { Button } from "./ui/Button";
import { useModal } from "connectkit";
import { AppInfo } from "./AppInfo";
import { twMerge } from "tailwind-merge";
import { useEffect, useRef } from "react";

export function ConnectWallet() {
  const { open, setOpen } = useModal();
  const hasAutoOpenedRef = useRef(false);

  // automatically open connect modal once
  // TODO: remove this once we have more than "connect wallet" as an option
  useEffect(() => {
    if (!open && !hasAutoOpenedRef.current) {
      setOpen(true);
      hasAutoOpenedRef.current = true;
    }
  }, [open, setOpen]);

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
        <Button
          key="create"
          variant="secondary"
          className="self-auto flex justify-center"
          onClick={() => setOpen(true)}
          autoFocus
        >
          Connect wallet
        </Button>
      </div>
    </div>
  );
}
