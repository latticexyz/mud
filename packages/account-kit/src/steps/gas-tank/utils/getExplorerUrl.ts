import { holesky } from "viem/chains";

const EXPLORER_URLS: Record<number, string> = {
  [holesky.id]: holesky.blockExplorers.default.url,
};

export const getExplorerUrl = (hash: string, chainId: number) => {
  const explorerUrl = EXPLORER_URLS[chainId];
  if (!explorerUrl) {
    return null;
  }
  return `${explorerUrl}/tx/${hash}`;
};
