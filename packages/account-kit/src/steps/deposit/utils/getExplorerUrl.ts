import { holesky } from "viem/chains";

const EXPLORER_URLS: Record<number, string> = {
  [17069]: "https://explorer.garnet.qry.live/",
  [holesky.id]: holesky.blockExplorers.default.url,
};

export const getExplorerUrl = (hash: string, chainId: number) => {
  const explorerUrl = EXPLORER_URLS[chainId];
  return `${explorerUrl}/tx/${hash}`;
};
