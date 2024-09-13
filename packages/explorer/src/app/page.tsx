import { notFound, redirect } from "next/navigation";
import { SupportedChainIds, chainIdName } from "../common";

export const dynamic = "force-dynamic";

export default function IndexPage() {
  const chainId = Number(process.env.CHAIN_ID);
  const chainName = chainIdName[chainId as SupportedChainIds]; // TODO: type-check

  if (chainName) return redirect(`/${chainName}/worlds`);
  return notFound();
}
