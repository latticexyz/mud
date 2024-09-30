import { Hex } from "viem";
import { useTransactionConfirmations } from "wagmi";
import { useChain } from "../../../../hooks/useChain";

export function Confirmations({ hash }: { hash?: Hex }) {
  const { id: chainId } = useChain();
  const { data: confirmations } = useTransactionConfirmations({
    hash,
    chainId,
    query: {
      refetchInterval: 1000,
    },
  });

  if (!confirmations) return null;
  return (
    <span className="flex items-center text-xs font-extrabold text-green-600">
      <span
        className="mr-2 inline-block h-[8px] w-[8px] animate-pulse rounded-full"
        style={{
          background: "rgb(64, 182, 107)",
        }}
      ></span>
      <span className="opacity-70">{confirmations.toString()}</span>
    </span>
  );
}
