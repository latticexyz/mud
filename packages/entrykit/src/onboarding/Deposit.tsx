import { Hex } from "viem";
import { PendingIcon } from "../icons/PendingIcon";
import { Button } from "../ui/Button";
import { Balance } from "../ui/Balance";
import { useBalance, useWatchBlockNumber } from "wagmi";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import relayChains from "../data/relayChains.json";
import { useSetBalance } from "./useSetBalance";
import { RelayChains } from "./common";
import { TruncatedHex } from "../ui/TruncatedHex";
import { useShowMutationError } from "../errors/useShowMutationError";
import { useShowQueryError } from "../errors/useShowQueryError";
import { useState } from "react";
import { ArrowLeftIcon } from "../icons/ArrowLeftIcon";

export type Props = {
  isExpanded: boolean;
  isActive: boolean;
  sessionAddress: Hex;
  showDepositForm: boolean;
  onShowDepositForm: (show: boolean) => void;
};

export function DepositForm({ onClose, sessionAddress }: { onClose: () => void; sessionAddress: Hex }) {
  const [amount, setAmount] = useState<string>("");
  const setBalance = useShowMutationError(useSetBalance());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setBalance.mutate({
      address: sessionAddress,
      value: BigInt(amount),
    });
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="tertiary" onClick={onClose} className="p-2">
          <ArrowLeftIcon className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-medium">Deposit Funds</h2>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-grow">
        <div className="flex flex-col gap-2">
          <label htmlFor="amount" className="text-sm">
            Amount to deposit (in wei)
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded"
            placeholder="Enter amount in wei"
          />
        </div>
        <div className="flex gap-2 mt-auto">
          <Button type="submit" variant="primary" className="flex-1">
            Deposit
          </Button>
        </div>
      </form>
    </div>
  );
}

export function Deposit({ isActive, isExpanded, sessionAddress, showDepositForm, onShowDepositForm }: Props) {
  const { chain } = useEntryKitConfig();

  const balance = useShowQueryError(useBalance({ chainId: chain.id, address: sessionAddress }));
  useWatchBlockNumber({ onBlockNumber: () => balance.refetch() });

  const setBalance = useShowMutationError(useSetBalance());

  const relayChain = (relayChains as RelayChains)[chain.id];

  if (showDepositForm) {
    return <DepositForm onClose={() => onShowDepositForm(false)} sessionAddress={sessionAddress} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4">
        <div>
          <div>Gas balance TODO:</div>
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
            onClick={() => onShowDepositForm(true)}
          >
            Top up
          </Button>
        ) : relayChain != null ? (
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
