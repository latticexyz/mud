import { useQuery } from "@tanstack/react-query";
import { DepositStatus } from "./DepositStatus";
import { useChains } from "wagmi";
import { TransferDeposit } from "./useDeposits";
import { Balance } from "../../ui/Balance";

export type Props = TransferDeposit & { onDismiss: () => void };

export function TransferDepositStatus({
  amount,
  chainL1Id,
  hash,
  receipt: receiptPromise,
  start,
  estimatedTime,
  onDismiss,
}: Props) {
  const chains = useChains();
  const chain = chains.find((chain) => chain.id === chainL1Id)!;

  const receipt = useQuery({
    queryKey: ["transferDepositStatus", hash],
    queryFn: () => receiptPromise,
  });

  return (
    <DepositStatus
      status={receipt.status}
      progress={{
        duration: estimatedTime,
        elapsed: Math.min(estimatedTime, Date.now() - start.getTime()),
      }}
      onDismiss={onDismiss}
    >
      {(() => {
        const blockExplorer = chain.blockExplorers?.default.url;
        if (receipt.status === "pending") {
          return (
            <>
              Confirming deposit on{" "}
              <a
                href={blockExplorer ? `${blockExplorer}/tx/${hash}` : undefined}
                target="_blank"
                rel="noreferrer noopener"
              >
                {chain.name}
              </a>
              …
            </>
          );
        }
        if (receipt.status === "error") {
          return (
            <>
              Could not find deposit on{" "}
              <a
                href={blockExplorer ? `${blockExplorer}/tx/${hash}` : undefined}
                target="_blank"
                rel="noreferrer noopener"
              >
                {chain.name}
              </a>
              .
            </>
          );
        }
        return (
          <>
            Successfully{" "}
            <a
              href={blockExplorer ? `${blockExplorer}/tx/${receipt.data.transactionHash}` : undefined}
              target="_blank"
              rel="noreferrer noopener"
            >
              deposited
            </a>{" "}
            <Balance wei={amount} />
          </>
        );
      })()}
    </DepositStatus>
  );
}
