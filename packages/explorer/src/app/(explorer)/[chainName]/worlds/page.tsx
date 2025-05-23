"use client";

import { redirect } from "next/navigation";
import { anvil } from "viem/chains";
import { supportedChainName, supportedChains } from "../../../../common";
import { useWorldsQuery } from "../../queries/useWorldsQuery";
import { WorldsForm } from "./WorldsForm";

type Props = {
  params: {
    chainName: supportedChainName;
  };
};

export default function WorldsPage({ params: { chainName } }: Props) {
  const { data, isLoading, error } = useWorldsQuery();
  if (error) {
    throw error;
  }

  const worlds = data?.worlds || [];
  const chain = supportedChains[chainName];
  if (worlds.length === 1 && chain.id === anvil.id) {
    redirect(`/${chainName}/worlds/${worlds[0]?.address}`);
  }

  return <WorldsForm worlds={worlds} isLoading={isLoading.verified || isLoading.indexer} />;
}
