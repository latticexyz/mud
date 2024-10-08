import { notFound, redirect } from "next/navigation";
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

  try {
    const response = await fetch(`${blockExplorerUrl}/api/v2/mud/worlds`);
    const data: ApiResponse = await response.json();
    return data.items.map((world) => world.address.hash);
  } catch (error) {
    console.error(error);
    return [];
  }
}

type Props = {
  params: {
    chainName: string;
  };
};

export default async function WorldsPage({ params }: Props) {
  const worldAddress = process.env.WORLD_ADDRESS;
  const disableFrontPage = process.env.DISABLE_FRONT_PAGE === "1";

  if (worldAddress) return redirect(`/${params.chainName}/worlds/${worldAddress}`);
  if (!worldAddress && disableFrontPage) return notFound();

  const worlds = await fetchWorlds(params.chainName);
  return <WorldsForm worlds={worlds} />;
}
