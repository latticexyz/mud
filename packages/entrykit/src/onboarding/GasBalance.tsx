import { Hex } from "viem";
import { PendingIcon } from "../icons/PendingIcon";
import { Button } from "../ui/Button";
import { Balance } from "../ui/Balance";
import { useBalance, useWatchBlockNumber } from "wagmi";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import relayChains from "../data/relayChains.json";
import { useSetBalance } from "./useSetBalance";
import { RelayChains, minGasBalance } from "./common";
import { TruncatedHex } from "../ui/TruncatedHex";
import { useShowMutationError } from "../errors/useShowMutationError";
import { useShowQueryError } from "../errors/useShowQueryError";

export type Props = {
  isExpanded: boolean;
  isActive: boolean;
  sessionAddress: Hex;
};

export function GasBalance({ isActive, isExpanded, sessionAddress }: Props) {
  const { chain } = useEntryKitConfig();

  const balance = useShowQueryError(useBalance({ chainId: chain.id, address: sessionAddress }));
  useWatchBlockNumber({ onBlockNumber: () => balance.refetch() });

  const setBalance = useShowMutationError(useSetBalance());

  const relayChain = (relayChains as RelayChains)[chain.id];

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
                value: minGasBalance + (balance.data?.value ?? 0n),
              })
            }
          >
            Top up
          </Button>
        ) : relayChain != null ? (
          // TODO: convert this to a <ButtonLink>
          <a
            href={`${relayChain.bridgeUrl}?${new URLSearchParams({ toAddress: sessionAddress })}`}
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
            <span className="font-mono text-white">
              <TruncatedHex hex={sessionAddress} />
            </span>{" "}
            on {chain.name} to top up your session balance.
          </p>
        </>
      ) : null}
    </div>
  );
}
