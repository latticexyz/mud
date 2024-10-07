import { Address } from "viem";
import { WorldsForm } from "./WorldsForm";

type ApiResponse = {
  items: {
    address: {
      hash: Address;
    };
  }[];
};

async function fetchWorlds(): Promise<Address[]> {
  const response = await fetch("https://explorer.redstone.xyz/api/v2/mud/worlds");
  if (!response.ok) {
    throw new Error("Failed to fetch worlds");
  }
  const data: ApiResponse = await response.json();
  return data.items.map((world) => world.address.hash);
}

export default async function WorldsPage({ params }: { params: { chainName: string } }) {
  const worlds = await fetchWorlds();
  return <WorldsForm worlds={worlds} />;
}
