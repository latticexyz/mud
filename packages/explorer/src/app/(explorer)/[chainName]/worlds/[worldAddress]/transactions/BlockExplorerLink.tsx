import { ExternalLinkIcon } from "lucide-react";
import { Hex } from "viem";
import { useChain } from "../../../../hooks/useChain";
import { explorerForChainId } from "../../../../utils/explorerForChainId";

export function BlockExplorerLink({ hash }: { hash?: Hex }) {
  const { id: chainId } = useChain();
  const explorerUrl = explorerForChainId({ hash, chainId });
  if (!explorerUrl) return null;

  return (
    <a href={`${explorerUrl}/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="flex hover:underline">
      <ExternalLinkIcon className="mr-2 h-3 w-3" /> Link
    </a>
  );
}
