import { useAccount } from "wagmi";
import { getExplorerUrl } from "./utils/getExplorerUrl";
import { Hex } from "viem";
import { StatusType } from "./hooks/useDepositHandler";
import { useAppChain } from "../../useAppChain";

type Props = {
  hash: Hex;
  status: StatusType;
};

export function ViewTransaction({ hash, status }: Props) {
  const userAccount = useAccount();
  const userAccountChainId = userAccount.chain?.id;
  const { chain } = useAppChain();

  if (!hash) return null;

  return (
    <p className="mt-[12px] text-neutral-400 text-center text-[14px]">
      {status === "loading" && (
        <>
          View the status of your deposit{" "}
          <a
            href={getExplorerUrl(hash, userAccountChainId!)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500"
          >
            here →
          </a>
        </>
      )}

      {status === "loadingL2" && <>Your deposit is now being sent to {chain.name}.</>}
    </p>
  );
}
