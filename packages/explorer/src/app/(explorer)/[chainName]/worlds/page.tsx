import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Address } from "viem";
import { supportedChainName, supportedChains } from "../../../../common";
import { indexerForChainId } from "../../utils/indexerForChainId";
import { WorldsForm } from "./WorldsForm";

type ApiResponse = {
  items: {
    address: {
      hash: Address;
    };
  }[];
};

async function fetchWorlds(chainName: supportedChainName): Promise<Address[]> {
  const chain = supportedChains[chainName];
  const indexer = indexerForChainId(chain.id);
  let worldsApiUrl: string | null = null;

  if (indexer.type === "sqlite") {
    const headersList = await headers();
    const host = headersList.get("host") || "";
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;
    worldsApiUrl = `${baseUrl}/api/sqlite-indexer/worlds`;
  } else {
    const blockExplorerUrl = "blockExplorers" in chain && chain.blockExplorers?.default.url;
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
  params: Promise<{
    chainName: supportedChainName;
  }>;
};

export default async function WorldsPage(props: Props) {
  const params = await props.params;

  const { chainName } = params;

  const worlds = await fetchWorlds(chainName);
  if (worlds.length === 1) {
    return redirect(`/${chainName}/worlds/${worlds[0]}`);
  }
  return <WorldsForm worlds={worlds} />;
}
