import { useQuery } from "@tanstack/react-query";
import { BridgeTransaction } from "./common";
import { TransactionStatus } from "./TransactionStatus";
import { formatBalance } from "./formatBalance";

export type Props = BridgeTransaction;

export function BridgeTransactionStatus({
  amount,
  chainL1,
  chainL2,
  hashL1,
  receiptL1: receiptL1Promise,
  receiptL2: receiptL2Promise,
  start,
  estimatedTime,
}: Props) {
  const receiptL1 = useQuery({
    queryKey: ["bridgeTransactionStatus", "L1", hashL1],
    queryFn: () => receiptL1Promise,
  });

  const receiptL2 = useQuery({
    queryKey: ["bridgeTransactionStatus", "L2", hashL1],
    queryFn: () => receiptL2Promise,
  });

  return (
    <TransactionStatus
      status={receiptL1.status === "success" ? receiptL2.status : receiptL1.status}
      progress={{
        duration: estimatedTime,
        elapsed: Math.min(estimatedTime, Date.now() - start.getTime()),
      }}
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
            Successfully bridged {formatBalance(amount)} Ξ to{" "}
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
    </TransactionStatus>
  );
}
