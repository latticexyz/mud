import { useQuery } from "@tanstack/react-query";
import { DepositStatus } from "./DepositStatus";
import { useChains } from "wagmi";
import { BridgeDeposit } from "./useDeposits";
import { Balance } from "../../ui/Balance";

export type Props = BridgeDeposit & { onDismiss: () => void };

export function BridgeDepositStatus({
  amount,
  chainL1Id,
  chainL2Id,
  hashL1,
  receiptL1: receiptL1Promise,
  receiptL2: receiptL2Promise,
  start,
  estimatedTime,
  onDismiss,
}: Props) {
  const chains = useChains();
  const chainL1 = chains.find((chain) => chain.id === chainL1Id)!;
  const chainL2 = chains.find((chain) => chain.id === chainL2Id)!;

  const receiptL1 = useQuery({
    queryKey: ["bridgeDepositStatus", "L1", hashL1],
    queryFn: () => receiptL1Promise,
  });

  const receiptL2 = useQuery({
    queryKey: ["bridgeDepositStatus", "L2", hashL1],
    queryFn: () => receiptL2Promise,
  });

  return (
    <DepositStatus
      status={receiptL1.status === "success" ? receiptL2.status : receiptL1.status}
      progress={{
        duration: estimatedTime,
        elapsed: Math.min(estimatedTime, Date.now() - start.getTime()),
      }}
      onDismiss={onDismiss}
    >
      {(() => {
        const blockExplorerL1 = chainL1.blockExplorers?.default.url;
        const blockExplorerL2 = chainL2.blockExplorers?.default.url;
        if (receiptL1.status === "pending") {
          return (
            <>
              Confirming deposit on{" "}
              <a
                href={blockExplorerL1 ? `${blockExplorerL1}/tx/${hashL1}` : undefined}
                target="_blank"
                rel="noreferrer noopener"
              >
                {chainL1.name}
              </a>
              …
            </>
          );
        }
        if (receiptL1.status === "error") {
          return (
            <>
              Could not find deposit on{" "}
              <a
                href={blockExplorerL1 ? `${blockExplorerL1}/tx/${hashL1}` : undefined}
                target="_blank"
                rel="noreferrer noopener"
              >
                {chainL1.name}
              </a>
              .
            </>
          );
        }
        if (receiptL2.status === "pending") {
          return (
            <>
              Deposit confirmed on{" "}
              <a
                href={blockExplorerL1 ? `${blockExplorerL1}/tx/${hashL1}` : undefined}
                target="_blank"
                rel="noreferrer noopener"
              >
                {chainL1.name}
              </a>{" "}
              and is now in transit to{" "}
              <a
                href={blockExplorerL2 ? `${blockExplorerL2}/tx/${receiptL1.data.hashL2}` : undefined}
                target="_blank"
                rel="noreferrer noopener"
              >
                {chainL2.name}
              </a>
              . This could take a few minutes…
            </>
          );
        }
        if (receiptL2.status === "error") {
          return (
            <>
              Deposit confirmed on{" "}
              <a
                href={blockExplorerL1 ? `${blockExplorerL1}/tx/${hashL1}` : undefined}
                target="_blank"
                rel="noreferrer noopener"
              >
                {chainL1.name}
              </a>
              , but could not find it on{" "}
              <a
                href={blockExplorerL2 ? `${blockExplorerL2}/tx/${receiptL1.data.hashL2}` : undefined}
                target="_blank"
                rel="noreferrer noopener"
              >
                {chainL2.name}
              </a>
              .
            </>
          );
        }
        return (
          <>
            Successfully bridged <Balance wei={amount} /> to{" "}
            <a
              href={blockExplorerL2 ? `${blockExplorerL2}/tx/${receiptL1.data.hashL2}` : undefined}
              target="_blank"
              rel="noreferrer noopener"
            >
              {chainL2.name}
            </a>
            !
          </>
        );
      })()}
    </DepositStatus>
  );
}
