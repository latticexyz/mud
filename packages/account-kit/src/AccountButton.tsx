import { useAccountModal } from "./useAccountModal";
import { AccountModal } from "./AccountModal";
import { useAccountRequirements } from "./useAccountRequirements";
import { Shadow } from "./ui/Shadow";
import { Logo } from "./icons/Logo";
import { useAccount } from "wagmi";
import { TruncatedHex } from "./ui/TruncateHex";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { PendingIcon } from "./icons/PendingIcon";
import { CashIcon } from "./icons/CashIcon";
import { CopyIcon } from "./icons/CopyIcon";
import { GlobeIcon } from "./icons/GlobeIcon";
import { LogoutIcon } from "./icons/LogoutIcon";
import { MoreIcon } from "./icons/MoreIcon";
import { ChevronUpIcon } from "./icons/ChevronUpIcon";

// TODO: move this away from UI button so we have better control over how it's styled (since we'll deviate a fair bit from it)

const containerClassNames = twMerge(
  "w-56 inline-flex outline-none transition",
  "border border-transparent",
  "font-sm font-medium leading-none",
);

const secondaryClassNames = twMerge(
  "bg-neutral-100 border-neutral-300 text-black",
  "dark:bg-neutral-800 dark:border-neutral-600 dark:text-white",
);
const menuClassNames = twMerge("divide-y divide-neutral-300 dark:divide-neutral-600");
const secondaryInteractiveClassNames = twMerge(
  "cursor-pointer outline-none hover:bg-neutral-200 data-[highlighted]:bg-neutral-200 dark:hover:bg-neutral-700",
);

export function AccountButton() {
  const { requirement } = useAccountRequirements();
  const { openAccountModal, toggleAccountModal, accountModalOpen } = useAccountModal();
  const { address } = useAccount();
  const [menuOpen, setMenuOpen] = useState(false);

  if (requirement != null) {
    return (
      <>
        <Shadow>
          <button
            type="button"
            className={twMerge(
              containerClassNames,
              "group",
              "items-center justify-center gap-2.5 p-3",
              "bg-orange-500 text-white",
              "hover:bg-orange-400",
              "active:bg-orange-600",
              "aria-busy:saturate-50",
              "aria-disabled:saturate-0",
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
            Sign in
          </button>
        </Shadow>
        <AccountModal open={accountModalOpen} onOpenChange={toggleAccountModal} />
      </>
    );
  }

  // TODO
  return (
    <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenu.Trigger asChild>
        <Shadow>
          <button
            type="button"
            className={twMerge(containerClassNames, secondaryClassNames, secondaryInteractiveClassNames, "p-3")}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="flex-grow inline-flex gap-2.5 items-center">
              <Logo className="flex-shrink-0 text-orange-500" />
              <span className="flex-grow text-left">{address ? <TruncatedHex hex={address} /> : null}</span>
              {/* TODO: animate these nicely */}

              <span className="flex-shrink-0 pointer-events-none inline-grid place-items-center -mr-1.5">
                <span
                  className={twMerge(
                    "col-start-1 row-start-1 leading-none",
                    "transition duration-300",
                    menuOpen ? "opacity-0 scale-50" : "opacity-100 scale-100",
                  )}
                >
                  <MoreIcon className="flex-shrink-0 opacity-50" />
                </span>
                <span
                  aria-hidden
                  className={twMerge(
                    "col-start-1 row-start-1",
                    "transition duration-300 delay-50",
                    menuOpen ? "opacity-100 scale-100" : "opacity-0 scale-125",
                  )}
                >
                  <ChevronUpIcon className="flex-shrink-0 opacity-50" />
                </span>
              </span>
            </span>
          </button>
        </Shadow>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <Shadow>
          <DropdownMenu.Content
            align="start"
            className={twMerge(
              containerClassNames,
              secondaryClassNames,
              menuClassNames,
              "-mt-px flex-col animate-in fade-in",
            )}
          >
            <DropdownMenu.Item className={twMerge(secondaryInteractiveClassNames, "flex gap-2.5 p-3 items-center")}>
              <CashIcon className="flex-shrink-0 opacity-50" />
              <span className="flex-grow font-normal">Gas tank</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item className={twMerge(secondaryInteractiveClassNames, "flex gap-2.5 p-3 items-center")}>
              <CopyIcon className="flex-shrink-0 opacity-50" />
              <span className="flex-grow font-normal">Copy address</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item className={twMerge(secondaryInteractiveClassNames, "flex gap-2.5 p-3 items-center")}>
              <GlobeIcon className="flex-shrink-0 opacity-50" />
              <span className="flex-grow font-normal">Switch chain</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item className={twMerge(secondaryInteractiveClassNames, "flex gap-2.5 p-3 items-center")}>
              <LogoutIcon className="flex-shrink-0 text-red-500" />
              <span className="flex-grow font-normal">Disconnect</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </Shadow>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
