import { Hex } from "viem";
import { useTransactionConfirmations } from "wagmi";
import { Skeleton } from "../../../../../../components/ui/Skeleton";
import { useChain } from "../../../../hooks/useChain";

export function Confirmations({ hash }: { hash?: Hex }) {
  const { id: chainId } = useChain();
  const { data: confirmations } = useTransactionConfirmations({
    hash,
    chainId,
    query: {
      refetchInterval: 1000,
      enabled: !!hash,
    },
  });

  if (!confirmations) return <Skeleton className="h-4 w-[50px]" />;
  return (
    <span className="flex items-center text-xs font-extrabold text-green-600">
      <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-success"></span>
      <span className="opacity-70">{confirmations.toString()}</span>
    </span>
  );
}
