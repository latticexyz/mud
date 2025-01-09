import { useAccountModal } from "./useAccountModal";
import { Shadow } from "./ui/Shadow";
import { Logo } from "./icons/Logo";
import { useAccount } from "wagmi";
import { twMerge } from "tailwind-merge";
import { PendingIcon } from "./icons/PendingIcon";
import { AccountName } from "./AccountName";
import { usePrerequisites } from "./onboarding/usePrerequisites";
import { useRef } from "react";

const containerClassNames = twMerge(
  "w-48 p-3 inline-flex outline-none transition",
  "border border-transparent",
  "text-base leading-none",
);

const secondaryClassNames = twMerge(
  "bg-neutral-100 border-neutral-300 text-black",
  "dark:bg-neutral-800 dark:border-neutral-700 dark:text-white",
);
const secondaryInteractiveClassNames = twMerge(
  "cursor-pointer outline-none hover:bg-neutral-200 data-[highlighted]:bg-neutral-200 dark:hover:bg-neutral-700",
);

export function AccountButton() {
  const { openAccountModal, accountModalOpen } = useAccountModal();
  const { status, address: userAddress } = useAccount();
  const initialUserAddress = useRef(userAddress);

  const prereqs = usePrerequisites(userAddress);

  // TODO: fix flash of button state signed in but incomplete onboarding
  const isConnected = status === "connected" || (status === "reconnecting" && userAddress);
  const isNewConnection = userAddress !== initialUserAddress.current;
  const isSignedIn = prereqs.isSuccess ? prereqs.data.complete : isNewConnection ? false : isConnected;

  const buttonLabel = (() => {
    if (prereqs.isSuccess) {
      if (!prereqs.data.hasAllowance) return "Top up";
      if (!prereqs.data.hasDelegation || !prereqs.data.isSpender) return "Set up";
    }
    return "Sign in";
  })();

  return (
    <Shadow mode="child">
      {isSignedIn ? (
        <button
          // key is used to avoid triggering transitions between connected/disconnected states
          key="connected"
          type="button"
          className={twMerge(containerClassNames, secondaryClassNames, secondaryInteractiveClassNames)}
          onClick={openAccountModal}
        >
          <span className="flex-grow inline-flex gap-2.5 items-center text-left font-medium">
            {userAddress ? <AccountName address={userAddress} /> : null}
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
            "items-center justify-center gap-2.5",
            "bg-orange-500 text-white font-medium",
            "hover:bg-orange-400",
            "active:bg-orange-600",
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
          <span className="font-medium">{buttonLabel}</span>
        </button>
      )}
    </Shadow>
  );
}
