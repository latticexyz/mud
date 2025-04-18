"use client";

import { redirect } from "next/navigation";
import { supportedChainName } from "../../../../common";
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
  if (worlds.length === 1) {
    redirect(`/${chainName}/worlds/${worlds[0]}`);
  }

  return <WorldsForm worlds={worlds} isLoading={isLoading} />;
}
