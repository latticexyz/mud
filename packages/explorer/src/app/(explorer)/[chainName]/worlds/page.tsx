import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Address } from "viem";
import { supportedChains, validateChainName } from "../../../../common";
import { indexerForChainId } from "../../utils/indexerForChainId";
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

  console.log("trigger change 2");

  const chain = supportedChains[chainName];
  const indexer = indexerForChainId(chain.id);
  let worldsApiUrl: string | null = null;

  if (indexer.type === "sqlite") {
    const headersList = headers();
    const host = headersList.get("host") || "";
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;
    worldsApiUrl = `${baseUrl}/api/sqlite-indexer/worlds`;
  } else {
    const blockExplorerUrl = chain.blockExplorers?.default.url;
    if (blockExplorerUrl) {
      worldsApiUrl = `${blockExplorerUrl}/api/v2/mud/worlds`;
    }
  }

  if (!worldsApiUrl) {
    return [];
  }

  try {
    const response = await fetch(worldsApiUrl);
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
  const worlds = await fetchWorlds(params.chainName);
  if (worlds.length === 1) {
    return redirect(`/${params.chainName}/worlds/${worlds[0]}`);
  }

  return <WorldsForm worlds={worlds} />;
}
