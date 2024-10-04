import { useAccountModal } from "./useAccountModal";
import { Shadow } from "./ui/Shadow";
import { Logo } from "./icons/Logo";
import { useAccount, useDisconnect } from "wagmi";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { PendingIcon } from "./icons/PendingIcon";
import { LogoutIcon } from "./icons/LogoutIcon";
import { MoreIcon } from "./icons/MoreIcon";
import { ChevronUpIcon } from "./icons/ChevronUpIcon";
import { AccountName } from "./AccountName";

const containerClassNames = twMerge(
  "w-60 inline-flex outline-none transition",
  "border border-transparent",
  "text-base leading-none",
);

const secondaryClassNames = twMerge(
  "bg-neutral-100 border-neutral-300 text-black",
  "dark:bg-neutral-800 dark:border-neutral-700 dark:text-white",
);
const menuClassNames = twMerge("divide-y divide-neutral-300 dark:divide-neutral-700");
const secondaryInteractiveClassNames = twMerge(
  "cursor-pointer outline-none hover:bg-neutral-200 data-[highlighted]:bg-neutral-200 dark:hover:bg-neutral-700",
);

export function AccountButton() {
  const { openAccountModal, accountModalOpen } = useAccountModal();
  const { status, address } = useAccount();
  const [menuOpen, setMenuOpen] = useState(false);
  const { disconnect, isPending: disconnectPending } = useDisconnect();

  // TODO: show indicator that onboarding is not complete
  // TODO: fix small flash between connected/disconnected state, I think because of <Shadow> remounting

  return (
    <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenu.Trigger asChild>
        <Shadow mode="child">
          {status === "connected" || (status === "reconnecting" && address) ? (
            <button
              // key is used to avoid triggering transitions between connected/disconnected states
              key="connected"
              type="button"
              className={twMerge(containerClassNames, secondaryClassNames, secondaryInteractiveClassNames, "p-3")}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="flex-grow inline-flex gap-2.5 items-center text-left font-medium">
                <AccountName address={address} />

                <span className="flex-shrink-0 pointer-events-none inline-grid place-items-center -mr-1.5">
                  <span
                    className={twMerge(
                      "col-start-1 row-start-1 leading-none",
                      "transition duration-300",
                      menuOpen ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100",
                    )}
                  >
                    <MoreIcon className="flex-shrink-0 opacity-50" />
                  </span>
                  <span
                    aria-hidden
                    className={twMerge(
                      "col-start-1 row-start-1",
                      "transition duration-300",
                      menuOpen ? "opacity-100 scale-100" : "opacity-0 scale-50 -rotate-90",
                    )}
                  >
                    <ChevronUpIcon className="flex-shrink-0 opacity-50" />
                  </span>
                </span>
              </span>
            </button>
          ) : (
            <button
              // key is used to avoid triggering transitions between connected/disconnected states
              key="sign in"
              type="button"
              className={twMerge(
                containerClassNames,
                "group",
                "items-center justify-center gap-2.5 p-3",
                "bg-orange-500 text-white font-medium",
                "hover:bg-orange-400",
                "active:bg-orange-600",
                "aria-busy:saturate-50",
              )}
              aria-busy={accountModalOpen}
              onClick={openAccountModal}
            >
              <span className="pointer-events-none inline-grid place-items-center -ml-3">
                <span
                  className={twMerge(
                    "col-start-1 row-start-1 leading-none",
                    "scale-100 opacity-100 transition duration-300",
                    "group-aria-busy:scale-125 group-aria-busy:opacity-0",
                  )}
                >
                  <Logo />
                </span>
                <span
                  aria-hidden
                  className={twMerge(
                    "col-start-1 row-start-1",
                    "scale-50 opacity-0 transition duration-300 delay-50",
                    "group-aria-busy:scale-100 group-aria-busy:opacity-100",
                  )}
                >
                  <PendingIcon />
                </span>
              </span>
              <span className="font-medium">Sign in</span>
            </button>
          )}
        </Shadow>
      </DropdownMenu.Trigger>
      {status === "connected" ? (
        <DropdownMenu.Portal>
          {/* TODO: do we still need this zindex now that we use iframes? */}
          <DropdownMenu.Content align="start" style={{ zIndex: "2147483646" }}>
            <Shadow mode="child">
              <div
                className={twMerge(
                  containerClassNames,
                  secondaryClassNames,
                  menuClassNames,
                  "-mt-px flex-col animate-in fade-in slide-in-from-top-2 animate-duration-200",
                )}
              >
                <DropdownMenu.Item
                  className={twMerge(
                    secondaryInteractiveClassNames,
                    "flex gap-2.5 p-3 items-center",
                    // TODO: better pending state
                    "aria-busy:opacity-50",
                  )}
                  aria-busy={disconnectPending}
                  onSelect={() => disconnect()}
                >
                  <LogoutIcon className="flex-shrink-0 text-red-500" />
                  <span className="flex-grow">Sign out</span>
                </DropdownMenu.Item>
              </div>
            </Shadow>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      ) : null}
    </DropdownMenu.Root>
  );
}
