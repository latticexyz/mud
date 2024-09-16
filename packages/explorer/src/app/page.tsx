import { notFound, redirect } from "next/navigation";
import { SupportedChainIds, chainIdName, isValidChainId } from "../common";

export const dynamic = "force-dynamic";

export default function IndexPage() {
  const chainId = Number(process.env.CHAIN_ID);
  if (!isValidChainId(chainId)) {
    return notFound();
  }

  const chainName = chainIdName[chainId as SupportedChainIds];
  return redirect(`/${chainName}/worlds`);
}
