import { Hex } from "viem";
import { PendingIcon } from "../icons/PendingIcon";
import { Button } from "../ui/Button";
import { Balance } from "../ui/Balance";
import { useBalance } from "wagmi";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import relayChains from "../data/relayChains.json";
import { useSetBalance } from "./useSetBalance";
import { minGasBalance } from "./common";

export type Props = {
  isExpanded: boolean;
  isActive: boolean;
  sessionAddress: Hex;
};

export function GasBalance({ isActive, isExpanded, sessionAddress }: Props) {
  const { chainId } = useEntryKitConfig();

  // TODO: refetch on some interval (block?)
  const balance = useBalance({ chainId, address: sessionAddress });
  const setBalance = useSetBalance();

  // TODO: show error if balance/setBalance fails?

  const relayChainName = (relayChains as Record<number, string>)[chainId];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4">
        <div>
          <div>Gas balance</div>
          <div className="font-mono text-white">
            {balance.data != null ? <Balance wei={balance.data.value} /> : <PendingIcon className="text-sm" />}
          </div>
        </div>

        {chainId === 31337 ? (
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
        ) : (
          // TODO: convert this to a <ButtonLink>
          <a
            // TODO: is redstone a fine fallback if chain is not supported or not in our JSON?
            href={`https://relay.link/bridge/${relayChainName ?? "redstone"}?${new URLSearchParams({
              toAddress: sessionAddress,
            })}`}
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
        )}
      </div>
      {isExpanded ? (
        <p className="text-sm">Your session&apos;s gas balance is used to pay for onchain computation.</p>
      ) : null}
    </div>
  );
}
