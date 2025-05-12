import { useEffect, useState } from "react";
import { Hex, parseEther } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { PendingIcon } from "../icons/PendingIcon";
import { Button } from "../ui/Button";
import { Balance } from "../ui/Balance";
import { useBalance, useWatchBlockNumber } from "wagmi";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import relayChains from "../data/relayChains.json";
import { useSetBalance } from "./useSetBalance";
import { RelayChains, StepContentProps } from "./common";
import { TruncatedHex } from "../ui/TruncatedHex";
import { useShowMutationError } from "../errors/useShowMutationError";
import { useShowQueryError } from "../errors/useShowQueryError";
import { usePrevious } from "../errors/usePrevious";
import { CopyIcon } from "../icons/CopyIcon";
import { CheckIcon } from "../icons/CheckIcon";

export type Props = StepContentProps & {
  sessionAddress: Hex;
};

export function GasBalance({ isActive, isExpanded, sessionAddress }: Props) {
  const queryClient = useQueryClient();
  const { chain } = useEntryKitConfig();
  const [copied, setCopied] = useState(false);

  const balance = useShowQueryError(useBalance({ chainId: chain.id, address: sessionAddress }));
  const prevBalance = usePrevious(balance.data);
  useWatchBlockNumber({ onBlockNumber: () => balance.refetch() });

  const setBalance = useShowMutationError(useSetBalance());
  const relayChain = (relayChains as RelayChains)[chain.id];

  const handleCopy = () => {
    navigator.clipboard.writeText(sessionAddress);

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (balance.data != null && prevBalance?.value === 0n && balance.data.value > 0n) {
      queryClient.invalidateQueries({ queryKey: ["getPrerequisites"] });
    }
  }, [balance.data, prevBalance, setBalance, sessionAddress, queryClient]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4">
        <div>
          <div>Gas balance</div>
          <div className="font-mono text-white">
            {balance.data != null ? <Balance wei={balance.data.value} /> : <PendingIcon className="text-sm" />}
          </div>
        </div>

        {chain.id === 31337 ? (
          <Button
            variant={isActive ? "primary" : "tertiary"}
            className="flex-shrink-0 text-sm p-1 w-28"
            autoFocus={isActive || isExpanded}
            pending={balance.status === "pending" || setBalance.status === "pending"}
            onClick={() =>
              setBalance.mutate({
                address: sessionAddress,
                value: parseEther("0.01") + (balance.data?.value ?? 0n),
              })
            }
          >
            Top up
          </Button>
        ) : relayChain != null ? (
          // TODO: convert this to a <ButtonLink>
          <a
            href={`${relayChain.bridgeUrl}?${new URLSearchParams({ toAddress: sessionAddress, amount: "0.01" })}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant={isActive ? "primary" : "tertiary"}
              className="flex-shrink-0 text-sm p-1 w-28"
              autoFocus={isActive || isExpanded}
              pending={balance.status === "pending"}
            >
              Top up
            </Button>
          </a>
        ) : null}
      </div>
      {isExpanded ? (
        <>
          <p className="text-sm">Your session&apos;s gas balance is used to pay for onchain computation.</p>
          <p className="text-sm">
            Send funds to{" "}
            <span
              className="inline-flex items-center gap-1 font-mono text-white cursor-pointer hover:text-white/80 transition-colors"
              onClick={handleCopy}
              title="Click to copy"
            >
              <TruncatedHex hex={sessionAddress} />{" "}
              {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <CopyIcon className="w-3.5 h-3.5" />}
            </span>{" "}
            on {chain.name} to top up your session balance.
          </p>
        </>
      ) : null}
    </div>
  );
}
