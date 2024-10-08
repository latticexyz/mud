import { Address } from "viem";
import { supportedChains, validateChainName } from "../../../../common";
import { WorldsForm } from "./WorldsForm";

type ApiResponse = {
  items: {
    address: {
      hash: Address;
    };
  }[];
};

async function fetchWorlds(chainName: string): Promise<Address[]> {
  validateChainName(chainName);

  const chain = supportedChains[chainName];
  const blockExplorerUrl = chain.blockExplorers?.default.url;
  if (!blockExplorerUrl) {
    return [];
  }

  const response = await fetch(`${blockExplorerUrl}/api/v2/mud/worlds`);
  if (!response.ok) {
    throw new Error("Failed to fetch worlds");
  }
  const data: ApiResponse = await response.json();
  return data.items.map((world) => world.address.hash);
}

type Props = {
  params: {
    chainName: string;
  };
};

export default async function WorldsPage({ params }: Props) {
  const worlds = await fetchWorlds(params.chainName);
  return <WorldsForm worlds={worlds} />;
}
