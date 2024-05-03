import { useQuery } from "@tanstack/react-query";
import { DepositStatus } from "./DepositStatus";
import { useChains } from "wagmi";
import { RelayDeposit } from "./useDeposits";
import { Balance } from "./Balance";

export type Props = RelayDeposit & { onDismiss: () => void };

export function RelayDepositStatus({
  amount,
  chainL1Id,
  chainL2Id,
  start,
  estimatedTime,
  depositPromise,
  onDismiss,
}: Props) {
  const chains = useChains();
  const chainL1 = chains.find((chain) => chain.id === chainL1Id)!;
  const chainL2 = chains.find((chain) => chain.id === chainL2Id)!;

  const deposit = useQuery({
    queryKey: ["relayDepositPromise", chainL1Id, chainL2Id, amount.toString(), start.toISOString()],
    queryFn: () => depositPromise,
  });

  return (
    <DepositStatus
      status={deposit.status}
      progress={{
        duration: estimatedTime,
        elapsed: Math.min(estimatedTime, Date.now() - start.getTime()),
      }}
      onDismiss={onDismiss}
    >
      {(() => {
        // const blockExplorerL1 = chainL1.blockExplorers?.default.url;
        // const blockExplorerL2 = chainL2.blockExplorers?.default.url;
        if (deposit.status === "pending") {
          // TODO: link to block explorer once we get a tx hash
          return <>Relay bridge deposit pending on {chainL1.name}…</>;
        }
        if (deposit.status === "error") {
          return <>Relay bridge deposit to {chainL2.name} failed.</>;
        }
        return (
          <>
            Successfully bridged <Balance amount={amount} /> to {chainL2.name}!
          </>
        );
      })()}
    </DepositStatus>
  );
}
