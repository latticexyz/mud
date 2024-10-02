import { Hex } from "viem";
import { useChain } from "../../../../hooks/useChain";
import { blockExplorerTransactionUrl } from "../../../../utils/blockExplorerTransactionUrl";

export function BlockExplorerLink({ hash, children }: { hash?: Hex; children: React.ReactNode }) {
  const { id: chainId } = useChain();
  const url = blockExplorerTransactionUrl({ chainId, hash });

  if (!url) return children;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex hover:underline">
      {children}
    </a>
  );
}
