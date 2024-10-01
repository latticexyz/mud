import { Hex } from "viem";
import { useChain } from "../../../../hooks/useChain";
import { explorerForChainId } from "../../../../utils/explorerForChainId";

export function BlockExplorerLink({ hash, children }: { hash?: Hex; children: React.ReactNode }) {
  const { id: chainId } = useChain();
  const explorerUrl = explorerForChainId({ hash, chainId });

  // TODO: do not show link if url not available
  return (
    <a href={`${explorerUrl}/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="flex hover:underline">
      {children}
    </a>
  );
}
