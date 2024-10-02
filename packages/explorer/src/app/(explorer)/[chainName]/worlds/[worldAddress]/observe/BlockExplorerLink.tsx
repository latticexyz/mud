import { ExternalLinkIcon } from "lucide-react";
import { Hex } from "viem";
import { useChain } from "../../../../hooks/useChain";
import { explorerForChainId } from "../../../../utils/explorerForChainId";

export function BlockExplorerLink({ hash, children }: { hash?: Hex; children: React.ReactNode }) {
  const { id: chainId } = useChain();
  const url = blockExplorerTransactionUrl({ chainId, hash });

  if (!explorerUrl) return children;
  return (
    <a href={`${explorerUrl}/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline">
        <ExternalLinkIcon className="mr-2 h-3 w-3" /> {children}
      </div>
    </a>
  );
}
