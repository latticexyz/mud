import { useAccount } from "wagmi";
import { getExplorerUrl } from "./utils/getExplorerUrl";
import { Hex } from "viem";

type Props = {
  hash: Hex;
};

export function ViewTransaction({ hash }: Props) {
  const userAccount = useAccount();
  const userAccountChainId = userAccount.chain?.id;

  if (!hash) return null;

  return (
    <p className="text-neutral-400 text-center text-[14px]">
      View the status of your deposit{" "}
      <a
        href={getExplorerUrl(hash, userAccountChainId!)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-orange-500"
      >
        here →
      </a>
    </p>
  );
}
