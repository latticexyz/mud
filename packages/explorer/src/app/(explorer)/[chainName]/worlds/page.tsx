import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Address } from "viem";
import { supportedChainName, supportedChains } from "../../../../common";
import { useIndexerForChainId } from "../../hooks/useIndexerForChainId";
import { WorldsForm } from "./WorldsForm";

type ApiResponse = {
  items: {
    address: {
      hash: Address;
    };
  }[];
};

async function fetchWorlds(chainName: supportedChainName, indexerType: "sqlite" | "hosted"): Promise<Address[]> {
  const chain = supportedChains[chainName];
  let worldsApiUrl: string | null = null;

  if (indexerType === "sqlite") {
    const headersList = headers();
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
  params: {
    chainName: supportedChainName;
  };
};

export default async function WorldsPage({ params: { chainName } }: Props) {
  const chainId = supportedChains[chainName].id;
  const indexer = useIndexerForChainId(chainId);
  const worlds = await fetchWorlds(chainName, indexer.type);
  if (worlds.length === 1) {
    return redirect(`/${chainName}/worlds/${worlds[0]}`);
  }
  return <WorldsForm worlds={worlds} />;
}
